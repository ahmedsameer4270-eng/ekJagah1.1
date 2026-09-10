const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { computeJobMatch } = require('../services/aiEngine');

// 1. List jobs with filters and optional student AI matching
async function listJobs(req, res) {
    try {
        const { search, type, isRemote, minSalary, skill, sortByMatch } = req.query;
        let sql = `
            SELECT j.*, cp.company_name, cp.logo_url, cp.website, cp.verification_status, cp.trust_score
            FROM jobs j
            JOIN company_profiles cp ON j.company_id = cp.user_id
            WHERE j.status = 'Active'
        `;
        const params = [];

        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            sql += ` AND (LOWER(j.title) LIKE $${params.length} OR LOWER(j.description) LIKE $${params.length} OR LOWER(cp.company_name) LIKE $${params.length})`;
        }

        if (type) {
            params.push(type);
            sql += ` AND j.type = $${params.length}`;
        }

        if (isRemote !== undefined && isRemote !== '') {
            params.push(parseInt(isRemote) ? 1 : 0);
            sql += ` AND j.is_remote = $${params.length}`;
        }

        if (minSalary) {
            params.push(parseInt(minSalary));
            sql += ` AND (j.salary_max >= $${params.length} OR j.salary_min >= $${params.length})`;
        }

        sql += ` ORDER BY j.created_at DESC`;

        const result = await db.query(sql, params);
        let jobs = result.rows.map(job => ({
            ...job,
            skills_required: JSON.parse(job.skills_required || '[]')
        }));

        // If user is a logged-in student, compute match score for each job
        let studentSkills = [];
        if (req.user && req.user.role === 'Student') {
            const studentRes = await db.query('SELECT technical_skills FROM student_profiles WHERE user_id = $1', [req.user.userId]);
            if (studentRes.rows.length > 0) {
                studentSkills = JSON.parse(studentRes.rows[0].technical_skills || '[]');
            }

            jobs = jobs.map(job => {
                const match = computeJobMatch(studentSkills, job.skills_required);
                return {
                    ...job,
                    matchScore: match.matchScore,
                    matchedSkills: match.matchedSkills,
                    missingSkills: match.missingSkills,
                    matchExplanation: match.explanation
                };
            });

            if (sortByMatch === 'true') {
                jobs.sort((a, b) => b.matchScore - a.matchScore);
            }
        }

        return res.json({ jobs });
    } catch (err) {
        console.error('Error listing jobs:', err);
        return res.status(500).json({ error: 'Failed to fetch job listings.' });
    }
}

// 2. Get single job detail
async function getJobById(req, res) {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT j.*, cp.company_name, cp.logo_url, cp.website, cp.industry, cp.description as company_bio, cp.verification_status, cp.trust_score
             FROM jobs j
             JOIN company_profiles cp ON j.company_id = cp.user_id
             WHERE j.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        const job = result.rows[0];
        job.skills_required = JSON.parse(job.skills_required || '[]');

        // Check if student applied
        let hasApplied = false;
        let applicationDetails = null;
        let matchAnalysis = null;

        if (req.user && req.user.role === 'Student') {
            const appRes = await db.query('SELECT * FROM applications WHERE job_id = $1 AND student_id = $2', [id, req.user.userId]);
            if (appRes.rows.length > 0) {
                hasApplied = true;
                applicationDetails = appRes.rows[0];
            }

            const studentRes = await db.query('SELECT technical_skills FROM student_profiles WHERE user_id = $1', [req.user.userId]);
            if (studentRes.rows.length > 0) {
                const studentSkills = JSON.parse(studentRes.rows[0].technical_skills || '[]');
                matchAnalysis = computeJobMatch(studentSkills, job.skills_required);
            }
        }

        return res.json({
            job,
            hasApplied,
            applicationDetails,
            matchAnalysis
        });
    } catch (err) {
        console.error('Error fetching job by ID:', err);
        return res.status(500).json({ error: 'Failed to fetch job details.' });
    }
}

// 3. Create job (Company only)
async function createJob(req, res) {
    try {
        const companyId = req.user.userId;
        const {
            title,
            type,
            location,
            isRemote,
            salaryMin,
            salaryMax,
            skillsRequired,
            experienceLevel,
            description,
            deadline,
            status: requestedStatus
        } = req.body;

        if (!title || !type || !location || !description) {
            return res.status(400).json({ error: 'Title, type, location, and description are required.' });
        }

        // Check company verification status
        const compRes = await db.query('SELECT verification_status FROM company_profiles WHERE user_id = $1', [companyId]);
        const isVerified = compRes.rows[0]?.verification_status === 'VERIFIED';

        let finalStatus = requestedStatus || 'Active';
        if (!isVerified && finalStatus === 'Active') {
            finalStatus = 'Draft'; // Unverified companies can only save drafts
        }

        const id = uuidv4();
        const skillsJson = JSON.stringify(skillsRequired || []);

        await db.query(
            `INSERT INTO jobs (id, company_id, title, type, location, is_remote, salary_min, salary_max, skills_required, experience_level, description, deadline, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                id,
                companyId,
                title,
                type,
                location,
                isRemote ? 1 : 0,
                salaryMin ? parseInt(salaryMin) : null,
                salaryMax ? parseInt(salaryMax) : null,
                skillsJson,
                experienceLevel || 'Entry-level',
                description,
                deadline || null,
                finalStatus
            ]
        );

        return res.status(201).json({
            message: finalStatus === 'Draft' && !isVerified 
                ? 'Job saved as Draft. Please complete company verification to publish live listings.'
                : 'Job posted successfully!',
            jobId: id,
            status: finalStatus
        });
    } catch (err) {
        console.error('Error creating job:', err);
        return res.status(500).json({ error: 'Failed to create job.' });
    }
}

// 4. Apply to Job (Student only)
async function applyToJob(req, res) {
    try {
        const studentId = req.user.userId;
        const { jobId, coverNote } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required.' });
        }

        // Check if job is active
        const jobRes = await db.query('SELECT * FROM jobs WHERE id = $1 AND status = \'Active\'', [jobId]);
        if (jobRes.rows.length === 0) {
            return res.status(404).json({ error: 'This job listing is no longer active or accepting applications.' });
        }

        const job = jobRes.rows[0];

        // Check if student already applied
        const existing = await db.query('SELECT id FROM applications WHERE job_id = $1 AND student_id = $2', [jobId, studentId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'You have already applied to this job.' });
        }

        // Get student skills to calculate match score
        const studentRes = await db.query('SELECT technical_skills, full_name FROM student_profiles WHERE user_id = $1', [studentId]);
        const studentSkills = JSON.parse(studentRes.rows[0]?.technical_skills || '[]');
        const studentName = studentRes.rows[0]?.full_name || 'A student';
        const jobSkills = JSON.parse(job.skills_required || '[]');

        const match = computeJobMatch(studentSkills, jobSkills);
        const appId = uuidv4();

        await db.query(
            `INSERT INTO applications (id, job_id, student_id, status, match_score, matched_skills, missing_skills, cover_note)
             VALUES ($1, $2, $3, 'Applied', $4, $5, $6, $7)`,
            [
                appId,
                jobId,
                studentId,
                match.matchScore,
                JSON.stringify(match.matchedSkills),
                JSON.stringify(match.missingSkills),
                coverNote || ''
            ]
        );

        // Notify company
        await db.query(
            `INSERT INTO notifications (id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, 'application', $5)`,
            [
                uuidv4(),
                job.company_id,
                'New Candidate Application',
                `${studentName} applied for "${job.title}" with a ${match.matchScore}% skill match.`,
                `/company/applicants/${jobId}`
            ]
        );

        return res.status(201).json({
            message: 'Application submitted successfully!',
            applicationId: appId,
            matchScore: match.matchScore
        });
    } catch (err) {
        console.error('Error applying to job:', err);
        return res.status(500).json({ error: 'Failed to submit application.' });
    }
}

// 5. List jobs for logged-in company
async function listCompanyJobs(req, res) {
    try {
        const companyId = req.user.userId;
        const result = await db.query(
            `SELECT j.*, 
                COUNT(a.id) as applicant_count,
                SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted_count
             FROM jobs j
             LEFT JOIN applications a ON j.id = a.job_id
             WHERE j.company_id = $1
             GROUP BY j.id
             ORDER BY j.created_at DESC`,
            [companyId]
        );

        const jobs = result.rows.map(j => ({
            ...j,
            skills_required: JSON.parse(j.skills_required || '[]'),
            applicant_count: parseInt(j.applicant_count || 0),
            shortlisted_count: parseInt(j.shortlisted_count || 0)
        }));

        return res.json({ jobs });
    } catch (err) {
        console.error('Error listing company jobs:', err);
        return res.status(500).json({ error: 'Failed to fetch company jobs.' });
    }
}

// 6. List applicants for a specific job (Company only)
async function listJobApplicants(req, res) {
    try {
        const companyId = req.user.userId;
        const { jobId } = req.params;

        // Verify company owns this job
        const jobRes = await db.query('SELECT id, title FROM jobs WHERE id = $1 AND company_id = $2', [jobId, companyId]);
        if (jobRes.rows.length === 0) {
            return res.status(403).json({ error: 'Job not found or access unauthorized.' });
        }

        const result = await db.query(
            `SELECT a.*, 
                    sp.full_name, sp.college, sp.branch, sp.cgpa, sp.resume_url, sp.portfolio_url, sp.github_url, sp.linkedin_url,
                    u.email as student_email
             FROM applications a
             JOIN student_profiles sp ON a.student_id = sp.user_id
             JOIN users u ON a.student_id = u.id
             WHERE a.job_id = $1
             ORDER BY a.match_score DESC, a.applied_at DESC`,
            [jobId]
        );

        const applicants = result.rows.map(a => ({
            ...a,
            matched_skills: JSON.parse(a.matched_skills || '[]'),
            missing_skills: JSON.parse(a.missing_skills || '[]')
        }));

        return res.json({
            job: jobRes.rows[0],
            applicants
        });
    } catch (err) {
        console.error('Error fetching job applicants:', err);
        return res.status(500).json({ error: 'Failed to fetch applicants.' });
    }
}

// 7. Update application status (Company updates to Shortlisted, Selected, Rejected, etc.)
async function updateApplicationStatus(req, res) {
    try {
        const companyId = req.user.userId;
        const { applicationId } = req.params;
        const { status, notes } = req.body;

        if (!['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid application status.' });
        }

        // Verify company ownership via job
        const appRes = await db.query(
            `SELECT a.*, j.title as job_title, j.company_id, cp.company_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN company_profiles cp ON j.company_id = cp.user_id
             WHERE a.id = $1 AND j.company_id = $2`,
            [applicationId, companyId]
        );

        if (appRes.rows.length === 0) {
            return res.status(403).json({ error: 'Application not found or unauthorized.' });
        }

        const app = appRes.rows[0];

        await db.query(
            `UPDATE applications 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [status, applicationId]
        );

        // Notify student of status change
        let notifMsg = `Your application for "${app.job_title}" at ${app.company_name} has been updated to: ${status}.`;
        if (status === 'Shortlisted') {
            notifMsg = `🎉 Congratulations! You have been shortlisted for "${app.job_title}" at ${app.company_name}!`;
        } else if (status === 'Selected') {
            notifMsg = `🌟 Incredible news! You have been selected for "${app.job_title}" at ${app.company_name}!`;
        }

        await db.query(
            `INSERT INTO notifications (id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, 'application', $5)`,
            [
                uuidv4(),
                app.student_id,
                `Application Update: ${status}`,
                notifMsg,
                '/student/jobs'
            ]
        );

        return res.json({ message: `Application status updated to ${status}.` });
    } catch (err) {
        console.error('Error updating application status:', err);
        return res.status(500).json({ error: 'Failed to update application status.' });
    }
}

// 8. List student's own applications
async function listStudentApplications(req, res) {
    try {
        const studentId = req.user.userId;
        const result = await db.query(
            `SELECT a.*, j.title as job_title, j.type as job_type, j.location, j.is_remote,
                    cp.company_name, cp.logo_url
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN company_profiles cp ON j.company_id = cp.user_id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC`,
            [studentId]
        );

        const applications = result.rows.map(a => ({
            ...a,
            matched_skills: JSON.parse(a.matched_skills || '[]'),
            missing_skills: JSON.parse(a.missing_skills || '[]')
        }));

        return res.json({ applications });
    } catch (err) {
        console.error('Error fetching student applications:', err);
        return res.status(500).json({ error: 'Failed to fetch applications.' });
    }
}

module.exports = {
    listJobs,
    getJobById,
    createJob,
    applyToJob,
    listCompanyJobs,
    listJobApplicants,
    updateApplicationStatus,
    listStudentApplications
};
