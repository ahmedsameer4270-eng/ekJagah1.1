const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { analyzeSkillGap } = require('../services/aiEngine');

// 1. Get all assessment skills with student's best score if available
exports.getSkills = async (req, res) => {
    try {
        const studentId = req.user?.userId || req.user?.id;

        const skillsResult = await db.query(
            'SELECT id, name, category, description, icon, question_count, time_limit_minutes FROM assessment_skills ORDER BY name ASC'
        );

        let attemptsBySkill = {};
        if (studentId) {
            const attemptsResult = await db.query(
                `SELECT skill_id, MAX(percentage) as best_score, MAX(passed) as has_passed,
                        COUNT(id) as total_attempts
                 FROM assessment_attempts 
                 WHERE student_id = $1 
                 GROUP BY skill_id`,
                [studentId]
            );

            attemptsResult.rows.forEach(row => {
                attemptsBySkill[row.skill_id] = {
                    bestScore: parseInt(row.best_score || 0, 10),
                    hasPassed: Boolean(row.has_passed),
                    totalAttempts: parseInt(row.total_attempts || 0, 10)
                };
            });
        }

        const skills = skillsResult.rows.map(skill => ({
            ...skill,
            bestScore: attemptsBySkill[skill.id]?.bestScore || null,
            hasPassed: attemptsBySkill[skill.id]?.hasPassed || false,
            totalAttempts: attemptsBySkill[skill.id]?.totalAttempts || 0
        }));

        res.json({ success: true, skills });
    } catch (err) {
        console.error('getSkills error:', err);
        res.status(500).json({ error: 'Failed to retrieve assessment skills.' });
    }
};

// 2. Get questions for a test session (SECURE: hides correct answers & explanations)
exports.getQuestions = async (req, res) => {
    try {
        const { skillId } = req.params;
        const level = (req.query.level || 'basic').toLowerCase();

        // Verify skill exists
        const skillCheck = await db.query('SELECT * FROM assessment_skills WHERE id = $1', [skillId]);
        if (skillCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Skill assessment not found.' });
        }
        const skill = skillCheck.rows[0];

        // Fetch questions without answer key
        const qResult = await db.query(
            `SELECT id, skill_id, level, topic, question_text, options 
             FROM assessment_questions 
             WHERE skill_id = $1 AND level = $2`,
            [skillId, level]
        );

        if (qResult.rows.length === 0) {
            return res.status(404).json({ 
                error: `No questions found for ${skill.name} at '${level}' level.` 
            });
        }

        // Shuffle questions randomly
        const shuffled = qResult.rows.sort(() => Math.random() - 0.5).map((q, idx) => ({
            index: idx + 1,
            id: q.id,
            skillId: q.skill_id,
            level: q.level,
            topic: q.topic,
            questionText: q.question_text,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));

        res.json({
            success: true,
            skill: {
                id: skill.id,
                name: skill.name,
                category: skill.category,
                timeLimitMinutes: skill.time_limit_minutes,
                questionCount: shuffled.length
            },
            level,
            questions: shuffled
        });
    } catch (err) {
        console.error('getQuestions error:', err);
        res.status(500).json({ error: 'Failed to retrieve assessment questions.' });
    }
};

// 3. Submit and grade assessment
exports.submitAssessment = async (req, res) => {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const { skillId } = req.params;
        const { 
            level = 'basic', 
            answers = [], 
            timeTakenSeconds = 0, 
            tabSwitches = 0 
        } = req.body;

        // Fetch skill
        const skillCheck = await db.query('SELECT * FROM assessment_skills WHERE id = $1', [skillId]);
        if (skillCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Skill not found.' });
        }
        const skill = skillCheck.rows[0];

        // Extract submitted question IDs
        const qIds = answers.map(a => a.questionId).filter(Boolean);
        if (qIds.length === 0) {
            return res.status(400).json({ error: 'No answers provided for submission.' });
        }

        // Fetch official questions with correct answers
        const placeholders = qIds.map((_, i) => `$${i + 1}`).join(',');
        const dbQuestions = await db.query(
            `SELECT id, topic, question_text, options, correct_option_index, explanation 
             FROM assessment_questions 
             WHERE id IN (${placeholders})`,
            qIds
        );

        const qMap = {};
        dbQuestions.rows.forEach(q => {
            qMap[q.id] = {
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            };
        });

        let correctCount = 0;
        const topicStats = {}; // { [topic]: { total: 0, correct: 0 } }
        const answersReview = [];

        answers.forEach(sub => {
            const official = qMap[sub.questionId];
            if (!official) return;

            const isCorrect = sub.selectedOption !== null && 
                              sub.selectedOption !== undefined && 
                              Number(sub.selectedOption) === Number(official.correct_option_index);

            if (isCorrect) correctCount++;

            // Topic metrics
            const topic = official.topic || 'General';
            if (!topicStats[topic]) {
                topicStats[topic] = { total: 0, correct: 0 };
            }
            topicStats[topic].total += 1;
            if (isCorrect) {
                topicStats[topic].correct += 1;
            }

            answersReview.push({
                questionId: official.id,
                topic: official.topic,
                questionText: official.question_text,
                options: official.options,
                selectedOption: sub.selectedOption !== null ? Number(sub.selectedOption) : null,
                correctOptionIndex: official.correct_option_index,
                isCorrect,
                explanation: official.explanation
            });
        });

        const totalQuestions = answersReview.length;
        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        // Passing criteria
        const passThresholds = {
            basic: 60,
            intermediate: 65,
            hard: 70
        };
        const threshold = passThresholds[level.toLowerCase()] || 60;
        const passed = percentage >= threshold;

        // Proficiency verdict
        let verdict = 'Needs Improvement';
        if (passed) {
            if (level.toLowerCase() === 'hard') verdict = 'Expert';
            else if (level.toLowerCase() === 'intermediate') verdict = 'Proficient';
            else verdict = 'Competent';
        } else if (percentage >= 40) {
            verdict = 'Beginner';
        }

        // Topic breakdown formatting
        const topicBreakdown = {};
        Object.keys(topicStats).forEach(t => {
            const st = topicStats[t];
            const pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
            topicBreakdown[t] = {
                correct: st.correct,
                total: st.total,
                percentage: pct
            };
        });

        // Insert attempt record
        const attemptId = uuidv4();
        await db.query(
            `INSERT INTO assessment_attempts 
             (id, student_id, skill_id, level, score, total_questions, percentage, passed, proficiency_verdict, topic_breakdown, answers, time_taken_seconds, tab_switches)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                attemptId,
                studentId,
                skillId,
                level.toLowerCase(),
                correctCount,
                totalQuestions,
                percentage,
                passed ? 1 : 0,
                verdict,
                JSON.stringify(topicBreakdown),
                JSON.stringify(answersReview),
                timeTakenSeconds,
                tabSwitches
            ]
        );

        // If passed, update student profile's verified skills & sync with AI Skill Gap
        let skillGapAnalysis = null;
        if (passed) {
            const profileRes = await db.query(
                'SELECT technical_skills, verified_skills, target_career_role FROM student_profiles WHERE user_id = $1',
                [studentId]
            );

            if (profileRes.rows.length > 0) {
                const profile = profileRes.rows[0];
                let verified = [];
                try {
                    verified = typeof profile.verified_skills === 'string' 
                        ? JSON.parse(profile.verified_skills || '[]') 
                        : (profile.verified_skills || []);
                } catch (e) {
                    verified = [];
                }

                // Update or append to verified skills
                const existingIdx = verified.findIndex(v => v.skillId === skillId);
                const verificationEntry = {
                    skillId: skill.id,
                    skillName: skill.name,
                    level: level.toLowerCase(),
                    score: correctCount,
                    totalQuestions,
                    percentage,
                    verdict,
                    verifiedAt: new Date().toISOString()
                };

                if (existingIdx >= 0) {
                    // Update if score or level is higher
                    if (percentage >= (verified[existingIdx].percentage || 0)) {
                        verified[existingIdx] = verificationEntry;
                    }
                } else {
                    verified.push(verificationEntry);
                }

                // Update technical skills
                let techSkills = [];
                try {
                    techSkills = typeof profile.technical_skills === 'string'
                        ? JSON.parse(profile.technical_skills || '[]')
                        : (profile.technical_skills || []);
                } catch (e) {
                    techSkills = [];
                }

                const techLevelMap = {
                    basic: 'Intermediate',
                    intermediate: 'Advanced',
                    hard: 'Expert'
                };
                const mappedLevel = techLevelMap[level.toLowerCase()] || 'Intermediate';

                const techIdx = techSkills.findIndex(s => s.name?.toLowerCase() === skill.name.toLowerCase());
                if (techIdx >= 0) {
                    techSkills[techIdx].level = mappedLevel;
                } else {
                    techSkills.push({ name: skill.name, level: mappedLevel });
                }

                await db.query(
                    `UPDATE student_profiles 
                     SET verified_skills = $1, technical_skills = $2, updated_at = CURRENT_TIMESTAMP 
                     WHERE user_id = $3`,
                    [JSON.stringify(verified), JSON.stringify(techSkills), studentId]
                );

                // Run AI Engine Skill Gap re-analysis
                const targetRole = profile.target_career_role || 'Full Stack Developer';
                skillGapAnalysis = analyzeSkillGap(techSkills, targetRole);

                // Store snapshot
                const snapshotId = uuidv4();
                await db.query(
                    `INSERT INTO skill_gap_snapshots (id, student_id, career_goal, match_percentage, matched_skills, missing_skills, recommendations, roadmap_data)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        snapshotId,
                        studentId,
                        skillGapAnalysis.careerGoal,
                        skillGapAnalysis.matchPercentage,
                        JSON.stringify(skillGapAnalysis.matchedSkills),
                        JSON.stringify(skillGapAnalysis.missingSkills),
                        JSON.stringify({
                            courses: skillGapAnalysis.recommendedCourses,
                            projects: skillGapAnalysis.recommendedProjects
                        }),
                        JSON.stringify(skillGapAnalysis.roadmap)
                    ]
                );

                // In-app Notification
                await db.query(
                    `INSERT INTO notifications (id, user_id, title, message, type, link)
                     VALUES ($1, $2, $3, $4, 'skill_gap', '/student/skill-gap')`,
                    [
                        uuidv4(),
                        studentId,
                        `Skill Verified: ${skill.name} (${verdict}) 🎯`,
                        `Congratulations! You passed the ${skill.name} (${level}) assessment with ${percentage}%. Your profile and AI Readiness Index have been updated!`
                    ]
                );
            }
        }

        res.json({
            success: true,
            attemptId,
            skill: {
                id: skill.id,
                name: skill.name,
                category: skill.category
            },
            level,
            score: correctCount,
            totalQuestions,
            percentage,
            passed,
            verdict,
            threshold,
            timeTakenSeconds,
            tabSwitches,
            topicBreakdown,
            answersReview,
            skillGapAnalysis
        });
    } catch (err) {
        console.error('submitAssessment error:', err);
        res.status(500).json({ error: 'Failed to evaluate assessment submission.' });
    }
};

// 4. Get specific attempt results with review details
exports.getAttemptResult = async (req, res) => {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const { skillId, attemptId } = req.params;

        const attemptRes = await db.query(
            `SELECT a.*, s.name as skill_name, s.category as skill_category
             FROM assessment_attempts a
             JOIN assessment_skills s ON a.skill_id = s.id
             WHERE a.id = $1 AND a.student_id = $2`,
            [attemptId, studentId]
        );

        if (attemptRes.rows.length === 0) {
            return res.status(404).json({ error: 'Assessment attempt not found.' });
        }

        const row = attemptRes.rows[0];
        res.json({
            success: true,
            attempt: {
                id: row.id,
                skillId: row.skill_id,
                skillName: row.skill_name,
                skillCategory: row.skill_category,
                level: row.level,
                score: row.score,
                totalQuestions: row.total_questions,
                percentage: row.percentage,
                passed: Boolean(row.passed),
                verdict: row.proficiency_verdict,
                topicBreakdown: typeof row.topic_breakdown === 'string' ? JSON.parse(row.topic_breakdown) : row.topic_breakdown,
                answersReview: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
                timeTakenSeconds: row.time_taken_seconds,
                tabSwitches: row.tab_switches,
                createdAt: row.created_at
            }
        });
    } catch (err) {
        console.error('getAttemptResult error:', err);
        res.status(500).json({ error: 'Failed to retrieve assessment results.' });
    }
};

// 5. Get all past attempts for student
exports.getHistory = async (req, res) => {
    try {
        const studentId = req.user?.userId || req.user?.id;

        const historyRes = await db.query(
            `SELECT a.id, a.skill_id, s.name as skill_name, a.level, a.score, a.total_questions,
                    a.percentage, a.passed, a.proficiency_verdict, a.time_taken_seconds, a.created_at
             FROM assessment_attempts a
             JOIN assessment_skills s ON a.skill_id = s.id
             WHERE a.student_id = $1
             ORDER BY a.created_at DESC`,
            [studentId]
        );

        res.json({
            success: true,
            history: historyRes.rows.map(r => ({
                id: r.id,
                skillId: r.skill_id,
                skillName: r.skill_name,
                level: r.level,
                score: r.score,
                totalQuestions: r.total_questions,
                percentage: r.percentage,
                passed: Boolean(r.passed),
                verdict: r.proficiency_verdict,
                timeTakenSeconds: r.time_taken_seconds,
                createdAt: r.created_at
            }))
        });
    } catch (err) {
        console.error('getHistory error:', err);
        res.status(500).json({ error: 'Failed to retrieve assessment history.' });
    }
};
