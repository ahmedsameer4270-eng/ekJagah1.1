const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { INDUSTRY_BENCHMARKS, analyzeSkillGap } = require('../services/aiEngine');

// Run Skill Gap Analysis
async function analyze(req, res) {
    try {
        const studentId = req.user.userId;
        const { careerGoal } = req.body;

        if (!careerGoal) {
            return res.status(400).json({ error: 'Please specify a target career goal.' });
        }

        // Fetch student skills
        const profRes = await db.query('SELECT technical_skills FROM student_profiles WHERE user_id = $1', [studentId]);
        let studentSkills = [];
        if (profRes.rows.length > 0) {
            studentSkills = JSON.parse(profRes.rows[0].technical_skills || '[]');
        }

        const analysis = analyzeSkillGap(studentSkills, careerGoal);
        const snapshotId = uuidv4();

        // Save snapshot for historical progress tracking
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

        // Update target role in student profile
        await db.query(
            'UPDATE student_profiles SET target_career_role = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
            [analysis.careerGoal, studentId]
        );

        return res.json({
            snapshotId,
            analysis
        });
    } catch (err) {
        console.error('Error running skill gap analysis:', err);
        return res.status(500).json({ error: 'Failed to analyze skill gap.' });
    }
}

// Get latest snapshot
async function getLatestSnapshot(req, res) {
    try {
        const studentId = req.user.userId;
        const result = await db.query(
            `SELECT * FROM skill_gap_snapshots 
             WHERE student_id = $1 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            // Auto-run for student's current target role or Full Stack Developer
            const profRes = await db.query('SELECT target_career_role, technical_skills FROM student_profiles WHERE user_id = $1', [studentId]);
            const targetRole = profRes.rows[0]?.target_career_role || 'Full Stack Developer';
            const studentSkills = JSON.parse(profRes.rows[0]?.technical_skills || '[]');

            const defaultAnalysis = analyzeSkillGap(studentSkills, targetRole);
            return res.json({ analysis: defaultAnalysis, isInitial: true });
        }

        const row = result.rows[0];
        const recs = JSON.parse(row.recommendations || '{}');

        return res.json({
            analysis: {
                id: row.id,
                careerGoal: row.career_goal,
                matchPercentage: row.match_percentage,
                matchedSkills: JSON.parse(row.matched_skills || '[]'),
                missingSkills: JSON.parse(row.missing_skills || '[]'),
                recommendedCourses: recs.courses || [],
                recommendedProjects: recs.projects || [],
                roadmap: JSON.parse(row.roadmap_data || '[]'),
                createdAt: row.created_at
            }
        });
    } catch (err) {
        console.error('Error fetching latest skill gap snapshot:', err);
        return res.status(500).json({ error: 'Failed to fetch skill gap snapshot.' });
    }
}

// List historical snapshots for tracking improvement
async function listSnapshots(req, res) {
    try {
        const studentId = req.user.userId;
        const result = await db.query(
            `SELECT id, career_goal, match_percentage, created_at 
             FROM skill_gap_snapshots 
             WHERE student_id = $1 
             ORDER BY created_at ASC`,
            [studentId]
        );

        return res.json({ history: result.rows });
    } catch (err) {
        console.error('Error listing snapshots:', err);
        return res.status(500).json({ error: 'Failed to fetch skill gap history.' });
    }
}

// Get all industry benchmark roles
function getBenchmarkRoles(req, res) {
    const roles = Object.keys(INDUSTRY_BENCHMARKS).map(key => ({
        role: key,
        category: INDUSTRY_BENCHMARKS[key].category,
        coreSkillsCount: INDUSTRY_BENCHMARKS[key].coreSkills.length,
        secondarySkillsCount: INDUSTRY_BENCHMARKS[key].secondarySkills.length
    }));

    return res.json({ roles });
}

module.exports = {
    analyze,
    getLatestSnapshot,
    listSnapshots,
    getBenchmarkRoles
};
