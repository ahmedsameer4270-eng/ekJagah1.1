const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { analyzeSkillGap } = require('../services/aiEngine');

// Helper to compute profile completion percentage (0-100%)
function calculateCompletion(profile, studentUser) {
    let score = 20; // Base signup score

    if (profile.full_name && profile.full_name.trim().length > 2) score += 10;
    if (profile.college && profile.college.trim().length > 2) score += 10;
    if (profile.branch && profile.branch.trim().length > 2) score += 10;
    if (profile.cgpa && profile.cgpa > 0) score += 10;
    
    // Technical skills or skill preferences
    const techSkills = typeof profile.technical_skills === 'string' ? JSON.parse(profile.technical_skills || '[]') : profile.technical_skills;
    const skillPrefs = typeof profile.skill_preferences === 'string' ? JSON.parse(profile.skill_preferences || '[]') : profile.skill_preferences;
    if ((techSkills && techSkills.length >= 3) || (skillPrefs && skillPrefs.length >= 2)) score += 15;
    else if ((techSkills && techSkills.length > 0) || (skillPrefs && skillPrefs.length > 0)) score += 5;

    // Resume (Uploaded PDF or generated summary)
    if (profile.resume_url || (profile.resume_summary && profile.resume_summary.length > 20)) score += 10;

    // Social links & contact
    if (profile.github_url || profile.linkedin_url || profile.portfolio_url || profile.leetcode_url || profile.phone) score += 5;

    // Projects
    const projects = typeof profile.projects === 'string' ? JSON.parse(profile.projects || '[]') : profile.projects;
    if (projects && projects.length > 0) score += 10;

    // Target career goal
    if (profile.target_career_role) score += 10;

    return Math.min(100, score);
}

// Get student profile
async function getProfile(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const result = await db.query(
            `SELECT sp.*, u.email, u.created_at as registered_at 
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             WHERE sp.user_id = $1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = result.rows[0];
        profile.technical_skills = JSON.parse(profile.technical_skills || '[]');
        profile.soft_skills = JSON.parse(profile.soft_skills || '[]');
        profile.verified_skills = JSON.parse(profile.verified_skills || '[]');
        profile.skill_preferences = JSON.parse(profile.skill_preferences || '[]');
        profile.projects = JSON.parse(profile.projects || '[]');
        profile.experience = JSON.parse(profile.experience || '[]');
        profile.resume_settings = JSON.parse(profile.resume_settings || '{}');

        // Check recent certificate count
        const certCountRes = await db.query('SELECT COUNT(*) as count FROM certificates WHERE student_id = $1', [studentId]);
        profile.certificate_count = parseInt(certCountRes.rows[0]?.count || 0);

        // Check recent application count
        const appCountRes = await db.query('SELECT COUNT(*) as count FROM applications WHERE student_id = $1', [studentId]);
        profile.application_count = parseInt(appCountRes.rows[0]?.count || 0);

        return res.json({ profile });
    } catch (err) {
        console.error('Error fetching student profile:', err);
        return res.status(500).json({ error: 'Failed to fetch student profile.' });
    }
}

// Update student profile
async function updateProfile(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const {
            fullName,
            college,
            branch,
            cgpa,
            graduationYear,
            technicalSkills,
            softSkills,
            phone,
            location,
            portfolioUrl,
            githubUrl,
            linkedinUrl,
            leetcodeUrl,
            twitterUrl,
            targetCareerRole,
            projects
        } = req.body;

        const techSkillsJson = JSON.stringify(technicalSkills || []);
        const softSkillsJson = JSON.stringify(softSkills || []);

        const currentProfile = {
            full_name: fullName,
            college,
            branch,
            cgpa,
            technical_skills: technicalSkills,
            phone,
            location,
            portfolio_url: portfolioUrl,
            github_url: githubUrl,
            linkedin_url: linkedinUrl,
            leetcode_url: leetcodeUrl,
            twitter_url: twitterUrl,
            target_career_role: targetCareerRole,
            projects
        };

        // Fetch current resume_url & summary
        const existing = await db.query('SELECT resume_url, resume_summary, projects FROM student_profiles WHERE user_id = $1', [studentId]);
        if (existing.rows.length > 0) {
            currentProfile.resume_url = existing.rows[0].resume_url;
            currentProfile.resume_summary = existing.rows[0].resume_summary;
            if (projects === undefined) {
                currentProfile.projects = existing.rows[0].projects;
            }
        }

        const completion = calculateCompletion(currentProfile);

        await db.query(
            `UPDATE student_profiles
             SET full_name = COALESCE($1, full_name),
                 college = COALESCE($2, college),
                 branch = COALESCE($3, branch),
                 cgpa = COALESCE($4, cgpa),
                 graduation_year = COALESCE($5, graduation_year),
                 technical_skills = $6,
                 soft_skills = $7,
                 phone = COALESCE($8, phone),
                 location = COALESCE($9, location),
                 portfolio_url = COALESCE($10, portfolio_url),
                 github_url = COALESCE($11, github_url),
                 linkedin_url = COALESCE($12, linkedin_url),
                 leetcode_url = COALESCE($13, leetcode_url),
                 twitter_url = COALESCE($14, twitter_url),
                 target_career_role = COALESCE($15, target_career_role),
                 projects = CASE WHEN $16 IS NOT NULL THEN $16 ELSE projects END,
                 profile_completion = $17,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $18`,
            [
                fullName,
                college,
                branch,
                cgpa ? parseFloat(cgpa) : null,
                graduationYear ? parseInt(graduationYear) : null,
                techSkillsJson,
                softSkillsJson,
                phone,
                location,
                portfolioUrl,
                githubUrl,
                linkedinUrl,
                leetcodeUrl,
                twitterUrl,
                targetCareerRole,
                projects !== undefined ? JSON.stringify(projects) : null,
                completion,
                studentId
            ]
        );

        return res.json({
            message: 'Profile updated successfully.',
            profileCompletion: completion
        });
    } catch (err) {
        console.error('Error updating student profile:', err);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
}

// Upload resume PDF
async function uploadResume(req, res) {
    try {
        const studentId = req.user.userId;
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF.' });
        }

        const resumeUrl = `/uploads/resumes/${req.file.filename}`;

        // Update profile
        await db.query(
            'UPDATE student_profiles SET resume_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
            [resumeUrl, studentId]
        );

        // Recalculate completion
        const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        let newCompletion = 50;
        if (profRes.rows.length > 0) {
            newCompletion = calculateCompletion(profRes.rows[0]);
            await db.query('UPDATE student_profiles SET profile_completion = $1 WHERE user_id = $2', [newCompletion, studentId]);
        }

        return res.json({
            message: 'Resume uploaded successfully!',
            resumeUrl,
            profileCompletion: newCompletion
        });
    } catch (err) {
        console.error('Error uploading resume:', err);
        return res.status(500).json({ error: 'Failed to upload resume.' });
    }
}

// Student goal momentum & inactivity nudge
async function getStudentNudge(req, res) {
    try {
        const studentId = req.user.userId;

        // Fetch student profile, target role
        const profRes = await db.query(
            'SELECT full_name, target_career_role, technical_skills FROM student_profiles WHERE user_id = $1',
            [studentId]
        );
        const profile = profRes.rows[0];
        const targetRole = profile?.target_career_role || 'Full Stack Developer';

        // Fetch latest snapshot
        const snapRes = await db.query(
            'SELECT match_percentage, missing_skills, created_at FROM skill_gap_snapshots WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
            [studentId]
        );
        const latestSnap = snapRes.rows[0];
        const readiness = latestSnap ? latestSnap.match_percentage : 50;
        let missing = [];
        if (latestSnap && latestSnap.missing_skills) {
            try {
                const parsed = JSON.parse(latestSnap.missing_skills);
                missing = parsed.map(m => typeof m === 'string' ? m : m.name);
            } catch (e) {
                missing = [];
            }
        }

        // Fetch in-progress courses
        const coursesRes = await db.query(
            "SELECT * FROM student_courses WHERE student_id = $1 AND status = 'In Progress' ORDER BY updated_at DESC",
            [studentId]
        );
        const inProgressCourses = coursesRes.rows;

        // Helper to parse date safely across SQLite and PG
        const parseDate = (d) => {
            if (!d) return null;
            const parsed = new Date(typeof d === 'string' && !d.includes('T') ? d.replace(' ', 'T') + 'Z' : d);
            return isNaN(parsed.getTime()) ? new Date(d) : parsed;
        };

        // Calculate days since last activity
        let lastActivity = latestSnap ? parseDate(latestSnap.created_at) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        if (inProgressCourses.length > 0 && inProgressCourses[0].updated_at) {
            const courseDate = parseDate(inProgressCourses[0].updated_at);
            if (courseDate && (!lastActivity || courseDate > lastActivity)) lastActivity = courseDate;
        }

        const now = new Date();
        const diffDays = lastActivity && !isNaN(lastActivity.getTime())
            ? Math.max(0, Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24)))
            : 0;

        let message = '';
        let type = 'momentum';

        if (inProgressCourses.length > 0) {
            const activeCourse = inProgressCourses[0];
            if (diffDays >= 3) {
                message = `Goal Nudge: You've been quiet on "${activeCourse.title}" (${activeCourse.completion_percentage}% done). Dedicating 15 minutes today will help bridge the "${activeCourse.target_skill}" gap!`;
                type = 'inactivity';
            } else {
                message = `Goal Momentum: You're ${activeCourse.completion_percentage}% through "${activeCourse.title}". Finish the self-check to boost your ${targetRole} Readiness Index!`;
            }
        } else if (missing.length > 0) {
            const nextSkill = missing[0];
            message = `Goal Nudge: You are 1 skill away from higher readiness for ${targetRole}. Adding a course for "${nextSkill}" can push your score above ${readiness}%!`;
        } else {
            message = `Benchmark Achieved: Your demonstrated skills match the top tier benchmark for ${targetRole} (${readiness}%)! Explore verified job postings.`;
            type = 'achievement';
        }

        return res.json({
            showNudge: true,
            nudge: {
                message,
                type,
                targetRole,
                readiness,
                daysSinceActivity: diffDays,
                activeCourseCount: inProgressCourses.length,
                suggestedSkill: missing[0] || null
            }
        });
    } catch (err) {
        console.error('Error fetching student nudge:', err);
        return res.status(500).json({ error: 'Failed to fetch student nudge.' });
    }
}

// 5. Save student skill preferences from onboarding / preferences flow
async function savePreferences(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const preferences = req.body.preferences || req.body.skillPreferences || [];
        const targetCareerRole = req.body.targetCareerRole || req.body.targetRole;

        const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        if (profRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = profRes.rows[0];
        let technicalSkills = [];
        try {
            technicalSkills = typeof profile.technical_skills === 'string'
                ? JSON.parse(profile.technical_skills || '[]')
                : (profile.technical_skills || []);
        } catch (e) {
            technicalSkills = [];
        }

        // Fetch skill catalog to resolve display names
        const skillsCatalogRes = await db.query('SELECT id, name FROM assessment_skills');
        const skillNamesMap = {};
        skillsCatalogRes.rows.forEach(s => {
            skillNamesMap[s.id] = s.name;
        });

        // Augment technical skills with preferred skills and self-ratings
        preferences.forEach(pref => {
            const skillName = skillNamesMap[pref.skillId] || pref.skillId;
            const existingIdx = technicalSkills.findIndex(
                s => s.name?.toLowerCase() === skillName.toLowerCase()
            );

            if (existingIdx >= 0) {
                if (pref.selfRating) {
                    technicalSkills[existingIdx].level = pref.selfRating;
                }
            } else {
                technicalSkills.push({
                    name: skillName,
                    level: pref.selfRating || 'Intermediate'
                });
            }
        });

        const newTargetRole = targetCareerRole || profile.target_career_role || 'Full Stack Developer';

        // Recompute completion
        const updatedObj = {
            ...profile,
            technical_skills: technicalSkills,
            skill_preferences: preferences,
            target_career_role: newTargetRole
        };
        const newCompletion = calculateCompletion(updatedObj);

        // Update student profile in DB
        await db.query(
            `UPDATE student_profiles
             SET skill_preferences = $1,
                 technical_skills = $2,
                 target_career_role = $3,
                 profile_completion = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5`,
            [
                JSON.stringify(preferences),
                JSON.stringify(technicalSkills),
                newTargetRole,
                newCompletion,
                studentId
            ]
        );

        // Run AI Engine Skill Gap re-analysis
        const analysis = analyzeSkillGap(technicalSkills, newTargetRole);
        const snapshotId = uuidv4();
        await db.query(
            `INSERT INTO skill_gap_snapshots (id, student_id, career_goal, match_percentage, matched_skills, missing_skills, recommendations, roadmap_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                snapshotId,
                studentId,
                analysis.careerGoal,
                analysis.matchPercentage,
                JSON.stringify(analysis.matchedSkills),
                JSON.stringify(analysis.missingSkills),
                JSON.stringify({
                    courses: analysis.recommendedCourses,
                    projects: analysis.recommendedProjects
                }),
                JSON.stringify(analysis.roadmap)
            ]
        );

        return res.json({
            success: true,
            message: 'Skill preferences saved successfully.',
            preferences,
            technicalSkills,
            targetCareerRole: newTargetRole,
            profileCompletion: newCompletion,
            completionScore: newCompletion,
            analysis
        });
    } catch (err) {
        console.error('Error saving student preferences:', err);
        return res.status(500).json({ error: 'Failed to save skill preferences.' });
    }
}

// 6. Get compiled resume data for auto-generated CV builder
async function getResumeData(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;

        const profRes = await db.query(
            `SELECT sp.*, u.email 
             FROM student_profiles sp 
             JOIN users u ON sp.user_id = u.id 
             WHERE sp.user_id = $1`,
            [studentId]
        );

        if (profRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = profRes.rows[0];
        const technicalSkills = JSON.parse(profile.technical_skills || '[]');
        const softSkills = JSON.parse(profile.soft_skills || '[]');
        const verifiedSkills = JSON.parse(profile.verified_skills || '[]');
        const skillPreferences = JSON.parse(profile.skill_preferences || '[]');
        let projects = JSON.parse(profile.projects || '[]');
        let experience = JSON.parse(profile.experience || '[]');
        const resumeSettings = JSON.parse(profile.resume_settings || '{}');

        // Fetch approved certificates
        const certRes = await db.query(
            `SELECT id, certificate_id, title, issuer, issue_date, file_url, status, qr_code_data 
             FROM certificates 
             WHERE student_id = $1 AND status = 'VALID' 
             ORDER BY issue_date DESC`,
            [studentId]
        );

        // Fetch completed courses
        const courseRes = await db.query(
            `SELECT id, title, provider, target_skill, completed_at 
             FROM student_courses 
             WHERE student_id = $1 AND status = 'Completed' 
             ORDER BY completed_at DESC`,
            [studentId]
        );

        // Generate intelligent professional summary if empty
        const topSkills = verifiedSkills.length > 0 
            ? verifiedSkills.slice(0, 3).map(v => v.skillName)
            : technicalSkills.slice(0, 3).map(t => t.name);

        let summary = profile.resume_summary;
        if (!summary || summary.trim().length < 15) {
            const roleName = profile.target_career_role || 'Software Engineer';
            const collegeStr = profile.college ? ` at ${profile.college}` : '';
            const gradStr = profile.graduation_year ? ` (Class of ${profile.graduation_year})` : '';
            const skillHighlight = topSkills.length > 0 ? ` with verified expertise in ${topSkills.join(', ')}` : '';

            summary = `Aspiring and results-oriented ${roleName}${collegeStr}${gradStr}${skillHighlight}. Passionate about building scalable applications, solving complex algorithmic challenges, and adhering to modern industry engineering standards. Demonstrates strong analytical, problem-solving, and collaborative abilities.`;
        }

        // If projects empty, provide structured starter project aligned with career goal
        if (!projects || projects.length === 0) {
            projects = [
                {
                    id: uuidv4(),
                    title: 'Full-Stack Modern Web Platform',
                    role: 'Lead Developer',
                    startDate: 'Jan 2026',
                    endDate: 'Present',
                    description: 'Architected and deployed a production-grade application featuring secure JWT authentication, responsive UI components, RESTful API endpoints, and database transactions.',
                    techStack: topSkills.length > 0 ? topSkills : ['React', 'Node.js', 'Express', 'SQLite', 'TailwindCSS'],
                    githubLink: profile.github_url || 'https://github.com/example/fullstack-platform',
                    liveDemoLink: profile.portfolio_url || 'https://example.com/demo',
                    bullets: [
                        'Engineered responsive interface with sub-100ms API response time and 100% test pass rate',
                        'Implemented secure token-based authentication and role-based access control',
                        'Optimized relational database queries reducing read latency by 45%'
                    ],
                    featured: true,
                    thumbnailImage: ''
                }
            ];
        } else {
            projects = projects.map(p => ({
                id: p.id || uuidv4(),
                title: p.title || 'Project',
                role: p.role || 'Developer',
                startDate: p.startDate || '',
                endDate: p.endDate || 'Present',
                description: p.description || '',
                techStack: Array.isArray(p.techStack) ? p.techStack : (typeof p.techStack === 'string' ? p.techStack.split(',').map(s => s.trim()).filter(Boolean) : []),
                githubLink: p.githubLink || p.githubUrl || '',
                liveDemoLink: p.liveDemoLink || p.liveUrl || '',
                bullets: Array.isArray(p.bullets) ? p.bullets : (p.description ? [p.description] : []),
                featured: p.featured !== undefined ? Boolean(p.featured) : true,
                thumbnailImage: p.thumbnailImage || ''
            }));
        }

        const payload = {
            personalInfo: {
                fullName: profile.full_name,
                email: profile.email,
                phone: profile.phone || '',
                location: profile.location || '',
                college: profile.college,
                branch: profile.branch,
                cgpa: profile.cgpa,
                graduationYear: profile.graduation_year,
                targetCareerRole: profile.target_career_role || 'Software Engineer',
                portfolioUrl: profile.portfolio_url || '',
                githubUrl: profile.github_url || '',
                linkedinUrl: profile.linkedin_url || '',
                leetcodeUrl: profile.leetcode_url || '',
                twitterUrl: profile.twitter_url || '',
                resumeUrl: profile.resume_url
            },
            summary,
            technicalSkills,
            softSkills,
            verifiedSkills,
            skillPreferences,
            certificates: certRes.rows,
            completedCourses: courseRes.rows,
            projects,
            experience,
            resumeSettings: {
                template: resumeSettings.template || 'modern', // 'modern' | 'classic' | 'minimal'
                accentColor: resumeSettings.accentColor || '#4f46e5', // indigo default
                showVerifiedBadges: resumeSettings.showVerifiedBadges ?? true,
                showCourses: resumeSettings.showCourses ?? true,
                showCertificates: resumeSettings.showCertificates ?? true,
                showProjects: resumeSettings.showProjects ?? true,
                showExperience: resumeSettings.showExperience ?? true
            }
        };

        return res.json({
            success: true,
            resumeData: payload,
            resume: payload
        });
    } catch (err) {
        console.error('Error fetching resume data:', err);
        return res.status(500).json({ error: 'Failed to compile resume data.' });
    }
}

// 7. Save custom resume data & settings
async function saveResumeData(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const {
            summary,
            projects = [],
            experience = [],
            personalInfo = {},
            setActiveProfileResume = false
        } = req.body;
        const resumeSettings = req.body.resumeSettings || req.body.settings || {};

        const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        if (profRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = profRes.rows[0];

        let newResumeUrl = profile.resume_url;
        if (setActiveProfileResume) {
            newResumeUrl = `/student/resume`;
        }

        const updatedObj = {
            ...profile,
            resume_summary: summary || profile.resume_summary,
            resume_url: newResumeUrl,
            phone: personalInfo.phone !== undefined ? personalInfo.phone : profile.phone,
            location: personalInfo.location !== undefined ? personalInfo.location : profile.location,
            portfolio_url: personalInfo.portfolioUrl !== undefined ? personalInfo.portfolioUrl : profile.portfolio_url,
            github_url: personalInfo.githubUrl !== undefined ? personalInfo.githubUrl : profile.github_url,
            linkedin_url: personalInfo.linkedinUrl !== undefined ? personalInfo.linkedinUrl : profile.linkedin_url,
            leetcode_url: personalInfo.leetcodeUrl !== undefined ? personalInfo.leetcodeUrl : profile.leetcode_url,
            twitter_url: personalInfo.twitterUrl !== undefined ? personalInfo.twitterUrl : profile.twitter_url,
            projects
        };
        const newCompletion = calculateCompletion(updatedObj);

        await db.query(
            `UPDATE student_profiles
             SET resume_summary = $1,
                 projects = $2,
                 experience = $3,
                 resume_settings = $4,
                 resume_url = $5,
                 phone = COALESCE($6, phone),
                 location = COALESCE($7, location),
                 portfolio_url = COALESCE($8, portfolio_url),
                 github_url = COALESCE($9, github_url),
                 linkedin_url = COALESCE($10, linkedin_url),
                 leetcode_url = COALESCE($11, leetcode_url),
                 twitter_url = COALESCE($12, twitter_url),
                 profile_completion = $13,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $14`,
            [
                summary || profile.resume_summary,
                JSON.stringify(projects),
                JSON.stringify(experience),
                JSON.stringify(resumeSettings),
                newResumeUrl,
                personalInfo.phone ?? null,
                personalInfo.location ?? null,
                personalInfo.portfolioUrl ?? null,
                personalInfo.githubUrl ?? null,
                personalInfo.linkedinUrl ?? null,
                personalInfo.leetcodeUrl ?? null,
                personalInfo.twitterUrl ?? null,
                newCompletion,
                studentId
            ]
        );

        return res.json({
            success: true,
            message: 'Resume data updated successfully.',
            profileCompletion: newCompletion,
            resumeUrl: newResumeUrl
        });
    } catch (err) {
        console.error('Error saving resume data:', err);
        return res.status(500).json({ error: 'Failed to update resume data.' });
    }
}

// 8. Add project to student profile
async function addProject(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const {
            title,
            description,
            techStack = [],
            role = 'Solo Developer',
            startDate = '',
            endDate = 'Present',
            githubLink = '',
            liveDemoLink = '',
            bullets = [],
            featured = true,
            thumbnailImage = ''
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Project title is required.' });
        }

        const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        if (profRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = profRes.rows[0];
        let projects = [];
        try {
            projects = JSON.parse(profile.projects || '[]');
        } catch (e) {
            projects = [];
        }

        const newProject = {
            id: uuidv4(),
            title: title.trim(),
            description: description ? description.trim() : '',
            techStack: Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []),
            role: (role || 'Solo Developer').trim(),
            startDate: (startDate || '').trim(),
            endDate: (endDate || 'Present').trim(),
            githubLink: (githubLink || '').trim(),
            liveDemoLink: (liveDemoLink || '').trim(),
            bullets: Array.isArray(bullets) ? bullets.filter(b => typeof b === 'string' && b.trim().length > 0) : [],
            featured: featured !== undefined ? Boolean(featured) : true,
            thumbnailImage: thumbnailImage || ''
        };

        projects.unshift(newProject);

        const updatedObj = { ...profile, projects };
        const newCompletion = calculateCompletion(updatedObj);

        await db.query(
            `UPDATE student_profiles
             SET projects = $1, profile_completion = $2, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3`,
            [JSON.stringify(projects), newCompletion, studentId]
        );

        return res.json({
            success: true,
            message: 'Project added successfully.',
            project: newProject,
            projects,
            profileCompletion: newCompletion
        });
    } catch (err) {
        console.error('Error adding project:', err);
        return res.status(500).json({ error: 'Failed to add project.' });
    }
}

// 9. Update existing project
async function updateProject(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const { id } = req.params;
        const updates = req.body;

        const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        if (profRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = profRes.rows[0];
        let projects = [];
        try {
            projects = JSON.parse(profile.projects || '[]');
        } catch (e) {
            projects = [];
        }

        const idx = projects.findIndex(p => p.id === id);
        if (idx === -1) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        projects[idx] = {
            ...projects[idx],
            ...updates,
            id, // protect id
            techStack: Array.isArray(updates.techStack)
                ? updates.techStack
                : (typeof updates.techStack === 'string' ? updates.techStack.split(',').map(s => s.trim()).filter(Boolean) : projects[idx].techStack),
            bullets: Array.isArray(updates.bullets)
                ? updates.bullets.filter(b => typeof b === 'string' && b.trim().length > 0)
                : projects[idx].bullets,
            featured: updates.featured !== undefined ? Boolean(updates.featured) : projects[idx].featured
        };

        await db.query(
            `UPDATE student_profiles
             SET projects = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2`,
            [JSON.stringify(projects), studentId]
        );

        return res.json({
            success: true,
            message: 'Project updated successfully.',
            project: projects[idx],
            projects
        });
    } catch (err) {
        console.error('Error updating project:', err);
        return res.status(500).json({ error: 'Failed to update project.' });
    }
}

// 10. Delete project
async function deleteProject(req, res) {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const { id } = req.params;

        const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [studentId]);
        if (profRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const profile = profRes.rows[0];
        let projects = [];
        try {
            projects = JSON.parse(profile.projects || '[]');
        } catch (e) {
            projects = [];
        }

        projects = projects.filter(p => p.id !== id);

        const updatedObj = { ...profile, projects };
        const newCompletion = calculateCompletion(updatedObj);

        await db.query(
            `UPDATE student_profiles
             SET projects = $1, profile_completion = $2, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3`,
            [JSON.stringify(projects), newCompletion, studentId]
        );

        return res.json({
            success: true,
            message: 'Project deleted successfully.',
            projects,
            profileCompletion: newCompletion
        });
    } catch (err) {
        console.error('Error deleting project:', err);
        return res.status(500).json({ error: 'Failed to delete project.' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    uploadResume,
    getStudentNudge,
    savePreferences,
    getResumeData,
    saveResumeData,
    addProject,
    updateProject,
    deleteProject
};


