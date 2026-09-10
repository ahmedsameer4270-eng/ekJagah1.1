const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// 1. Platform KPIs
async function getDashboardStats(req, res) {
    try {
        const userStats = await db.query(
            `SELECT role, COUNT(*) as count 
             FROM users 
             GROUP BY role`
        );

        const countsByRole = { Student: 0, Company: 0, Academician: 0, Admin: 0 };
        userStats.rows.forEach(r => {
            countsByRole[r.role] = parseInt(r.count);
        });

        const compStats = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN verification_status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as pending
             FROM company_profiles`
        );

        const certStats = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'VALID' THEN 1 ELSE 0 END) as valid,
                SUM(CASE WHEN status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as pending
             FROM certificates`
        );

        const jobStats = await db.query(
            `SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_jobs
             FROM jobs`
        );

        const appStats = await db.query('SELECT COUNT(*) as total_applications FROM applications');

        return res.json({
            users: countsByRole,
            companies: {
                total: parseInt(compStats.rows[0]?.total || 0),
                verified: parseInt(compStats.rows[0]?.verified || 0),
                pending: parseInt(compStats.rows[0]?.pending || 0)
            },
            certificates: {
                total: parseInt(certStats.rows[0]?.total || 0),
                valid: parseInt(certStats.rows[0]?.valid || 0),
                pending: parseInt(certStats.rows[0]?.pending || 0)
            },
            jobs: {
                total: parseInt(jobStats.rows[0]?.total_jobs || 0),
                active: parseInt(jobStats.rows[0]?.active_jobs || 0)
            },
            applications: parseInt(appStats.rows[0]?.total_applications || 0)
        });
    } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
        return res.status(500).json({ error: 'Failed to fetch admin stats.' });
    }
}

// 2. List company verifications
async function listCompanyVerifications(req, res) {
    try {
        const result = await db.query(
            `SELECT cp.*, u.email, u.created_at as registered_at
             FROM company_profiles cp
             JOIN users u ON cp.user_id = u.id
             ORDER BY 
                CASE WHEN cp.verification_status = 'UNDER_REVIEW' THEN 1 ELSE 2 END,
                cp.updated_at DESC`
        );

        return res.json({ companies: result.rows });
    } catch (err) {
        console.error('Error listing company verifications:', err);
        return res.status(500).json({ error: 'Failed to fetch company verification list.' });
    }
}

// 3. Review company verification (Approve / Reject)
async function reviewCompany(req, res) {
    try {
        const { companyId } = req.params;
        const { status, adminNotes } = req.body;

        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Status must be VERIFIED or REJECTED.' });
        }

        const compRes = await db.query('SELECT company_name FROM company_profiles WHERE user_id = $1', [companyId]);
        if (compRes.rows.length === 0) {
            return res.status(404).json({ error: 'Company profile not found.' });
        }

        const verifiedAt = status === 'VERIFIED' ? new Date().toISOString() : null;
        const trustBonus = status === 'VERIFIED' ? 20 : 0;

        await db.query(
            `UPDATE company_profiles
             SET verification_status = $1,
                 admin_notes = $2,
                 verified_at = $3,
                 trust_score = LEAST(100, trust_score + $4),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5`,
            [status, adminNotes || '', verifiedAt, trustBonus, companyId]
        );

        // Notify company
        const notifMsg = status === 'VERIFIED'
            ? '🎉 Congratulations! Your company account has been VERIFIED. You can now publish live job listings!'
            : `⚠️ Your company verification was not approved. Note: ${adminNotes || 'Please check submitted documents.'}`;

        await db.query(
            `INSERT INTO notifications (id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, 'company', $5)`,
            [
                uuidv4(),
                companyId,
                `Company Verification ${status}`,
                notifMsg,
                '/company/profile'
            ]
        );

        return res.json({ message: `Company status updated to ${status}.` });
    } catch (err) {
        console.error('Error reviewing company:', err);
        return res.status(500).json({ error: 'Failed to update company verification.' });
    }
}

// 4. List certificates for review
async function listPendingCertificates(req, res) {
    try {
        const result = await db.query(
            `SELECT c.*, sp.full_name as student_name, sp.college, sp.branch, u.email as student_email
             FROM certificates c
             JOIN student_profiles sp ON c.student_id = sp.user_id
             JOIN users u ON c.student_id = u.id
             ORDER BY 
                CASE WHEN c.status = 'UNDER_REVIEW' THEN 1 ELSE 2 END,
                c.created_at DESC`
        );

        return res.json({ certificates: result.rows });
    } catch (err) {
        console.error('Error listing certificates for review:', err);
        return res.status(500).json({ error: 'Failed to fetch certificates.' });
    }
}

// 5. Review certificate (Approve / Reject)
async function reviewCertificate(req, res) {
    try {
        const adminId = req.user.userId;
        const { certificateId } = req.params;
        const { status, adminNotes } = req.body;

        if (!['VALID', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Status must be VALID or REJECTED.' });
        }

        const certRes = await db.query('SELECT * FROM certificates WHERE id = $1', [certificateId]);
        if (certRes.rows.length === 0) {
            return res.status(404).json({ error: 'Certificate not found.' });
        }

        const cert = certRes.rows[0];

        await db.query(
            `UPDATE certificates
             SET status = $1,
                 admin_notes = $2,
                 verified_by = $3,
                 verification_date = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [status, adminNotes || '', adminId, certificateId]
        );

        // Notify student
        const notifMsg = status === 'VALID'
            ? `✅ Great news! Your certificate "${cert.title}" from ${cert.issuer} has been verified and marked VALID on your public credential page!`
            : `Your certificate "${cert.title}" was reviewed and rejected. Admin notes: ${adminNotes || 'Information could not be validated.'}`;

        await db.query(
            `INSERT INTO notifications (id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, 'certificate', $5)`,
            [
                uuidv4(),
                cert.student_id,
                `Certificate Verification: ${status}`,
                notifMsg,
                '/student/certificates'
            ]
        );

        return res.json({ message: `Certificate status updated to ${status}.` });
    } catch (err) {
        console.error('Error reviewing certificate:', err);
        return res.status(500).json({ error: 'Failed to review certificate.' });
    }
}

// 6. List all jobs (Admin moderation)
async function listAllJobs(req, res) {
    try {
        const result = await db.query(
            `SELECT j.*, cp.company_name, cp.verification_status, cp.trust_score,
                    COUNT(a.id) as applicant_count
             FROM jobs j
             JOIN company_profiles cp ON j.company_id = cp.user_id
             LEFT JOIN applications a ON j.id = a.job_id
             GROUP BY j.id
             ORDER BY j.created_at DESC`
        );

        const jobs = result.rows.map(j => ({
            ...j,
            skills_required: JSON.parse(j.skills_required || '[]'),
            applicant_count: parseInt(j.applicant_count || 0)
        }));

        return res.json({ jobs });
    } catch (err) {
        console.error('Error listing all jobs for admin:', err);
        return res.status(500).json({ error: 'Failed to fetch job listings.' });
    }
}

// 7. Delete/Moderate fake job
async function deleteJob(req, res) {
    try {
        const { jobId } = req.params;
        await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
        return res.json({ message: 'Job listing removed successfully.' });
    } catch (err) {
        console.error('Error deleting job:', err);
        return res.status(500).json({ error: 'Failed to remove job.' });
    }
}

// 8. List all users
async function listUsers(req, res) {
    try {
        const result = await db.query(
            `SELECT id, email, role, is_verified, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );

        return res.json({ users: result.rows });
    } catch (err) {
        console.error('Error listing users:', err);
        return res.status(500).json({ error: 'Failed to list users.' });
    }
}

module.exports = {
    getDashboardStats,
    listCompanyVerifications,
    reviewCompany,
    listPendingCertificates,
    reviewCertificate,
    listAllJobs,
    deleteJob,
    listUsers
};
