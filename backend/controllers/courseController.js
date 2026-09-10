const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { analyzeSkillGap } = require('../services/aiEngine');

// List courses with filters
async function listCourses(req, res) {
    try {
        const { skill, level, provider, isFree, search } = req.query;
        let sql = 'SELECT * FROM courses WHERE 1=1';
        const params = [];

        if (skill) {
            params.push(`%${skill.toLowerCase()}%`);
            sql += ` AND LOWER(skill) LIKE $${params.length}`;
        }

        if (level) {
            params.push(level);
            sql += ` AND level = $${params.length}`;
        }

        if (provider) {
            params.push(provider);
            sql += ` AND provider = $${params.length}`;
        }

        if (isFree !== undefined && isFree !== '') {
            params.push(parseInt(isFree) ? 1 : 0);
            sql += ` AND is_free = $${params.length}`;
        }

        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(skill) LIKE $${params.length} OR LOWER(provider) LIKE $${params.length})`;
        }

        sql += ' ORDER BY rating DESC';

        const result = await db.query(sql, params);
        return res.json({ courses: result.rows });
    } catch (err) {
        console.error('Error listing courses:', err);
        return res.status(500).json({ error: 'Failed to fetch courses.' });
    }
}

// Get recommended courses driven by student skill gap
async function getRecommendedCourses(req, res) {
    try {
        const studentId = req.user.userId;

        // Get latest missing skills from snapshot or profile
        const snapRes = await db.query(
            `SELECT missing_skills FROM skill_gap_snapshots 
             WHERE student_id = $1 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [studentId]
        );

        let missingSkills = [];
        if (snapRes.rows.length > 0) {
            const raw = JSON.parse(snapRes.rows[0].missing_skills || '[]');
            missingSkills = raw.map(s => (typeof s === 'string' ? s : s.name));
        }

        if (missingSkills.length === 0) {
            // Default recommended courses
            const defRes = await db.query('SELECT * FROM courses ORDER BY rating DESC LIMIT 6');
            return res.json({ courses: defRes.rows, basedOnSkills: [] });
        }

        // Find courses matching any of the missing skills
        const courses = [];
        const seenIds = new Set();

        for (const skill of missingSkills.slice(0, 4)) {
            const result = await db.query(
                'SELECT * FROM courses WHERE LOWER(skill) LIKE $1 OR LOWER(title) LIKE $1 ORDER BY rating DESC LIMIT 2',
                [`%${skill.toLowerCase()}%`]
            );
            result.rows.forEach(c => {
                if (!seenIds.has(c.id)) {
                    seenIds.add(c.id);
                    courses.push({ ...c, recommendedForSkill: skill });
                }
            });
        }

        // If fewer than 4, pad with top rated
        if (courses.length < 4) {
            const padRes = await db.query('SELECT * FROM courses ORDER BY rating DESC LIMIT 6');
            padRes.rows.forEach(c => {
                if (!seenIds.has(c.id) && courses.length < 6) {
                    seenIds.add(c.id);
                    courses.push(c);
                }
            });
        }

        return res.json({
            courses,
            basedOnSkills: missingSkills.slice(0, 4)
        });
    } catch (err) {
        console.error('Error fetching recommended courses:', err);
        return res.status(500).json({ error: 'Failed to fetch recommended courses.' });
    }
}

// Helper: Re-evaluate skill gap and create updated snapshot when a course completes
async function recalculateSkillGapForStudent(studentId, newlyCompletedSkill, courseTitle) {
    // 1. Fetch student profile
    const profRes = await db.query(
        'SELECT technical_skills, target_career_role FROM student_profiles WHERE user_id = $1',
        [studentId]
    );

    let skills = [];
    let targetRole = 'Full Stack Developer';
    if (profRes.rows.length > 0) {
        skills = JSON.parse(profRes.rows[0].technical_skills || '[]');
        if (profRes.rows[0].target_career_role) {
            targetRole = profRes.rows[0].target_career_role;
        }
    }

    // 2. Fetch baseline snapshot
    const snapRes = await db.query(
        'SELECT match_percentage FROM skill_gap_snapshots WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
        [studentId]
    );
    const previousScore = snapRes.rows.length > 0 ? snapRes.rows[0].match_percentage : 50;

    // 3. Add or upgrade target_skill in student's technical_skills
    if (newlyCompletedSkill) {
        const skillName = newlyCompletedSkill.trim();
        const existingIdx = skills.findIndex(
            s => (typeof s === 'string' ? s : s.name).toLowerCase() === skillName.toLowerCase()
        );

        if (existingIdx >= 0) {
            if (typeof skills[existingIdx] === 'object') {
                skills[existingIdx].level = 'Advanced';
            } else {
                skills[existingIdx] = { name: skillName, level: 'Advanced' };
            }
        } else {
            skills.push({ name: skillName, level: 'Intermediate' });
        }

        await db.query(
            'UPDATE student_profiles SET technical_skills = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
            [JSON.stringify(skills), studentId]
        );
    }

    // 4. Run AI Engine analysis
    const analysis = analyzeSkillGap(skills, targetRole);
    const newScore = analysis.matchPercentage;
    const snapshotId = uuidv4();

    // 5. Store snapshot in history
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

    // 6. Generate congratulatory in-app notification
    const diff = newScore - previousScore;
    const deltaText = diff > 0 ? ` (+${diff}%)` : '';
    await db.query(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            uuidv4(),
            studentId,
            'Readiness Index Updated! 🚀',
            `Course completed: "${courseTitle || newlyCompletedSkill}". Your Readiness Index for ${targetRole} updated: ${previousScore}% → ${newScore}%${deltaText}!`,
            'skill_gap',
            '/student/skill-gap'
        ]
    );

    return {
        previousScore,
        newScore,
        diff,
        analysis,
        newlyMatchedSkill: newlyCompletedSkill
    };
}

// Student: List their own logged and enrolled courses
async function getMyCourses(req, res) {
    try {
        const studentId = req.user.userId;
        const result = await db.query(
            'SELECT * FROM student_courses WHERE student_id = $1 ORDER BY updated_at DESC',
            [studentId]
        );
        return res.json({ courses: result.rows });
    } catch (err) {
        console.error('Error fetching student courses:', err);
        return res.status(500).json({ error: 'Failed to fetch your courses.' });
    }
}

// Student: Add a new custom or catalog-enrolled course
async function addMyCourse(req, res) {
    try {
        const studentId = req.user.userId;
        const { title, provider, course_url, target_skill, status, completion_percentage } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Course title is required.' });
        }
        if (!target_skill || !target_skill.trim()) {
            return res.status(400).json({ error: 'Target skill is required.' });
        }

        const id = uuidv4();
        const initialStatus = status === 'Completed' ? 'Completed' : 'In Progress';
        const initialPercentage = status === 'Completed' ? 100 : Math.min(100, Math.max(0, parseInt(completion_percentage) || 0));
        const completedAt = initialStatus === 'Completed' ? new Date().toISOString() : null;

        await db.query(
            `INSERT INTO student_courses (id, student_id, title, provider, course_url, target_skill, status, completion_percentage, completed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                id,
                studentId,
                title.trim(),
                (provider || 'Self-Study').trim(),
                course_url ? course_url.trim() : '',
                target_skill.trim(),
                initialStatus,
                initialPercentage,
                completedAt
            ]
        );

        const courseRes = await db.query('SELECT * FROM student_courses WHERE id = $1', [id]);
        const course = courseRes.rows[0];

        let recalculation = null;
        if (initialStatus === 'Completed') {
            recalculation = await recalculateSkillGapForStudent(studentId, target_skill.trim(), title.trim());
        }

        return res.status(201).json({
            message: initialStatus === 'Completed'
                ? `Course added as Completed! Readiness Index updated.`
                : 'Course added to your learning dashboard!',
            course,
            recalculation
        });
    } catch (err) {
        console.error('Error adding student course:', err);
        return res.status(500).json({ error: 'Failed to add course.' });
    }
}

// Student: Update course progress or mark as complete
async function updateMyCourse(req, res) {
    try {
        const studentId = req.user.userId;
        const { id } = req.params;
        const { title, provider, course_url, target_skill, status, completion_percentage } = req.body;

        const existingRes = await db.query('SELECT * FROM student_courses WHERE id = $1 AND student_id = $2', [id, studentId]);
        if (existingRes.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found in your tracking list.' });
        }
        const prev = existingRes.rows[0];

        let newStatus = status || prev.status;
        let newPercentage = completion_percentage !== undefined ? Math.min(100, Math.max(0, parseInt(completion_percentage))) : prev.completion_percentage;
        let completedAt = prev.completed_at;

        if (newStatus === 'Completed' || newPercentage >= 100) {
            newStatus = 'Completed';
            newPercentage = 100;
            if (!completedAt) completedAt = new Date().toISOString();
        }

        const newTitle = title || prev.title;
        const newProvider = provider || prev.provider;
        const newUrl = course_url !== undefined ? course_url : prev.course_url;
        const newSkill = target_skill || prev.target_skill;

        await db.query(
            `UPDATE student_courses 
             SET title = $1, provider = $2, course_url = $3, target_skill = $4, status = $5, completion_percentage = $6, completed_at = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 AND student_id = $9`,
            [newTitle, newProvider, newUrl, newSkill, newStatus, newPercentage, completedAt, id, studentId]
        );

        const updatedRes = await db.query('SELECT * FROM student_courses WHERE id = $1', [id]);
        const updatedCourse = updatedRes.rows[0];

        let recalculation = null;
        if (prev.status !== 'Completed' && newStatus === 'Completed') {
            recalculation = await recalculateSkillGapForStudent(studentId, newSkill, newTitle);
        }

        return res.json({
            message: recalculation
                ? `Course completed! Readiness Index climbed from ${recalculation.previousScore}% to ${recalculation.newScore}%.`
                : 'Course progress saved.',
            course: updatedCourse,
            recalculation
        });
    } catch (err) {
        console.error('Error updating student course:', err);
        return res.status(500).json({ error: 'Failed to update course.' });
    }
}

// Student: Submit lightweight self-check (2-3 conceptual questions) to verify course completion
async function completeCourseWithSelfCheck(req, res) {
    try {
        const studentId = req.user.userId;
        const { id } = req.params;

        const existingRes = await db.query('SELECT * FROM student_courses WHERE id = $1 AND student_id = $2', [id, studentId]);
        if (existingRes.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found in your tracking list.' });
        }
        const course = existingRes.rows[0];

        await db.query(
            `UPDATE student_courses 
             SET status = 'Completed', completion_percentage = 100, self_check_passed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND student_id = $2`,
            [id, studentId]
        );

        const recalculation = await recalculateSkillGapForStudent(studentId, course.target_skill, course.title);
        const updatedRes = await db.query('SELECT * FROM student_courses WHERE id = $1', [id]);

        return res.json({
            message: `Self-check verified! Skill "${course.target_skill}" has been verified and moved to Matched Skills.`,
            course: updatedRes.rows[0],
            recalculation
        });
    } catch (err) {
        console.error('Error in self-check completion:', err);
        return res.status(500).json({ error: 'Failed to verify self-check completion.' });
    }
}

// Student: Remove course from tracker
async function deleteMyCourse(req, res) {
    try {
        const studentId = req.user.userId;
        const { id } = req.params;

        await db.query('DELETE FROM student_courses WHERE id = $1 AND student_id = $2', [id, studentId]);
        return res.json({ message: 'Course removed from your tracking list.' });
    } catch (err) {
        console.error('Error deleting student course:', err);
        return res.status(500).json({ error: 'Failed to remove course.' });
    }
}

module.exports = {
    listCourses,
    getRecommendedCourses,
    getMyCourses,
    addMyCourse,
    updateMyCourse,
    completeCourseWithSelfCheck,
    deleteMyCourse
};

