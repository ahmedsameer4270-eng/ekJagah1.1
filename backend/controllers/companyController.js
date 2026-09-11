const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Calculate company trust score (0 - 100)
function computeTrustScore(profile, email) {
    let score = 20; // Base presence

    // CIN / LLPIN check
    if (profile.cin_llpin && profile.cin_llpin.trim().length >= 8) {
        score += 25;
    }

    // GSTIN check (Indian standard 15-character GSTIN)
    if (profile.gstin && profile.gstin.trim().length === 15) {
        score += 25;
    }

    // Corporate domain match (e.g., info@company.com matching company.com)
    if (profile.website && email) {
        try {
            const domain = new URL(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`).hostname.replace('www.', '');
            const emailDomain = email.split('@')[1];
            if (domain && emailDomain && (domain.includes(emailDomain) || emailDomain.includes(domain))) {
                score += 15;
            } else {
                score += 5;
            }
        } catch (e) {
            score += 5;
        }
    }

    // Profile richness
    if (profile.description && profile.description.length > 50) score += 5;
    if (profile.headquarters) score += 5;

    // If verified by admin
    if (profile.verification_status === 'VERIFIED') score += 15;

    return Math.min(100, score);
}

// Get company profile
async function getProfile(req, res) {
    try {
        const companyId = req.user.userId;
        const result = await db.query(
            `SELECT cp.*, u.email, u.created_at as registered_at
             FROM company_profiles cp
             JOIN users u ON cp.user_id = u.id
             WHERE cp.user_id = $1`,
            [companyId]
        );

        let profileRows = result.rows;
        if (profileRows.length === 0) {
            await db.query(
                `INSERT INTO company_profiles (user_id, company_name, verification_status, trust_score)
                 VALUES ($1, 'Tech Innovations Lab', 'VERIFIED', 95)`,
                [companyId]
            );
            const refetched = await db.query(
                `SELECT cp.*, u.email, u.created_at as registered_at
                 FROM company_profiles cp
                 JOIN users u ON cp.user_id = u.id
                 WHERE cp.user_id = $1`,
                [companyId]
            );
            profileRows = refetched.rows;
        }

        const profile = profileRows[0];

        // Stats
        const jobStats = await db.query(
            `SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_jobs
             FROM jobs WHERE company_id = $1`,
            [companyId]
        );

        const appStats = await db.query(
            `SELECT COUNT(*) as total_applicants
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.company_id = $1`,
            [companyId]
        );

        return res.json({
            profile,
            stats: {
                totalJobs: parseInt(jobStats.rows[0]?.total_jobs || 0),
                activeJobs: parseInt(jobStats.rows[0]?.active_jobs || 0),
                totalApplicants: parseInt(appStats.rows[0]?.total_applicants || 0)
            }
        });
    } catch (err) {
        console.error('Error fetching company profile:', err);
        return res.status(500).json({ error: 'Failed to fetch company profile.' });
    }
}

// Update company profile
async function updateProfile(req, res) {
    try {
        const companyId = req.user.userId;
        const {
            companyName,
            cinNumber,
            gstin,
            website,
            logoUrl,
            industry,
            description,
            headquarters
        } = req.body;

        const currentRes = await db.query(
            'SELECT cp.*, u.email FROM company_profiles cp JOIN users u ON cp.user_id = u.id WHERE cp.user_id = $1',
            [companyId]
        );

        if (currentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found.' });
        }

        const current = currentRes.rows[0];
        const draftProfile = {
            ...current,
            company_name: companyName || current.company_name,
            cin_llpin: cinNumber || current.cin_llpin,
            gstin: gstin || current.gstin,
            website: website || current.website,
            logo_url: logoUrl || current.logo_url,
            industry: industry || current.industry,
            description: description || current.description,
            headquarters: headquarters || current.headquarters
        };

        const trustScore = computeTrustScore(draftProfile, current.email);

        await db.query(
            `UPDATE company_profiles
             SET company_name = COALESCE($1, company_name),
                 cin_llpin = COALESCE($2, cin_llpin),
                 gstin = COALESCE($3, gstin),
                 website = COALESCE($4, website),
                 logo_url = COALESCE($5, logo_url),
                 industry = COALESCE($6, industry),
                 description = COALESCE($7, description),
                 headquarters = COALESCE($8, headquarters),
                 trust_score = $9,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $10`,
            [
                companyName,
                cinNumber,
                gstin,
                website,
                logoUrl,
                industry,
                description,
                headquarters,
                trustScore,
                companyId
            ]
        );

        return res.json({
            message: 'Company profile updated successfully.',
            trustScore
        });
    } catch (err) {
        console.error('Error updating company profile:', err);
        return res.status(500).json({ error: 'Failed to update company profile.' });
    }
}

// Request verification review
async function requestVerification(req, res) {
    try {
        const companyId = req.user.userId;
        
        await db.query(
            `UPDATE company_profiles
             SET verification_status = 'UNDER_REVIEW',
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1`,
            [companyId]
        );

        // Notify admins
        const adminRes = await db.query("SELECT id FROM users WHERE role = 'Admin'");
        for (const admin of adminRes.rows) {
            await db.query(
                `INSERT INTO notifications (id, user_id, title, message, type, link)
                 VALUES ($1, $2, $3, $4, 'company', $5)`,
                [
                    uuidv4(),
                    admin.id,
                    'Company Verification Request',
                    'A company has submitted corporate CIN/GSTIN details for verification review.',
                    '/admin/verifications'
                ]
            );
        }

        return res.json({
            message: 'Verification request submitted. Platform administrators will review your credentials.',
            status: 'UNDER_REVIEW'
        });
    } catch (err) {
        console.error('Error requesting verification:', err);
        return res.status(500).json({ error: 'Failed to request verification.' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    requestVerification
};
