const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Upload certificate
async function uploadCertificate(req, res) {
    try {
        const studentId = req.user.userId;
        const { title, issuer, issueDate } = req.body;

        if (!title || !issuer || !issueDate) {
            return res.status(400).json({ error: 'Certificate title, issuer, and issue date are required.' });
        }

        const fileUrl = req.file ? `/uploads/certificates/${req.file.filename}` : null;
        
        // Generate unique Certificate ID (e.g. SB-CERT-2026-X8K9L)
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const certificateId = `SB-CERT-2026-${randomSuffix}`;

        // QR Code points to the public verification web page
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-cert/${certificateId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 250,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        });

        const id = uuidv4();
        await db.query(
            `INSERT INTO certificates (id, certificate_id, student_id, title, issuer, issue_date, file_url, status, qr_code_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'UNDER_REVIEW', $8)`,
            [id, certificateId, studentId, title, issuer, issueDate, fileUrl, qrCodeDataUrl]
        );

        // In-app notification
        await db.query(
            `INSERT INTO notifications (id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, 'certificate', $5)`,
            [
                uuidv4(),
                studentId,
                'Certificate Submitted',
                `Your certificate "${title}" has been uploaded and queued for admin verification.`,
                '/student/certificates'
            ]
        );

        return res.status(201).json({
            message: 'Certificate uploaded successfully! Unique ID and verification QR code generated.',
            certificate: {
                id,
                certificateId,
                title,
                issuer,
                issueDate,
                fileUrl,
                status: 'UNDER_REVIEW',
                qrCodeData: qrCodeDataUrl
            }
        });
    } catch (err) {
        console.error('Error uploading certificate:', err);
        return res.status(500).json({ error: 'Failed to upload certificate.' });
    }
}

// List certificates for logged in student
async function listMyCertificates(req, res) {
    try {
        const studentId = req.user.userId;
        const result = await db.query(
            `SELECT * FROM certificates 
             WHERE student_id = $1 
             ORDER BY created_at DESC`,
            [studentId]
        );

        return res.json({ certificates: result.rows });
    } catch (err) {
        console.error('Error listing certificates:', err);
        return res.status(500).json({ error: 'Failed to fetch certificates.' });
    }
}

// Public verification check (No login required)
async function verifyCertificatePublic(req, res) {
    try {
        const { certId } = req.params;

        const result = await db.query(
            `SELECT c.*, sp.full_name as student_name, sp.college, sp.branch
             FROM certificates c
             JOIN student_profiles sp ON c.student_id = sp.user_id
             WHERE c.certificate_id = $1`,
            [certId.trim().toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'NOT_FOUND',
                message: 'No certificate found with this Certificate ID in the EkJagah registry.'
            });
        }

        const cert = result.rows[0];

        return res.json({
            status: cert.status, // 'VALID', 'UNDER_REVIEW', 'REJECTED'
            certificateId: cert.certificate_id,
            title: cert.title,
            issuer: cert.issuer,
            issueDate: cert.issue_date,
            studentName: cert.student_name,
            college: cert.college,
            branch: cert.branch,
            verificationDate: cert.verification_date,
            adminNotes: cert.admin_notes,
            qrCodeData: cert.qr_code_data,
            fileUrl: cert.file_url
        });
    } catch (err) {
        console.error('Error in public certificate verification:', err);
        return res.status(500).json({ error: 'Verification service error.' });
    }
}

module.exports = {
    uploadCertificate,
    listMyCertificates,
    verifyCertificatePublic
};
