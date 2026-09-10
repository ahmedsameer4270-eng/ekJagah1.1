const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All assessment routes are authenticated student routes
router.use(authenticateToken, authorize(['Student']));

// List skills with user's best score
router.get('/skills', assessmentController.getSkills);

// User's assessment history
router.get('/history', assessmentController.getHistory);

// Get questions for a skill and difficulty level (excludes answer key)
router.get('/:skillId/questions', assessmentController.getQuestions);

// Submit and grade answers
router.post('/:skillId/submit', assessmentController.submitAssessment);

// View specific attempt results & explanations
router.get('/:skillId/results/:attemptId', assessmentController.getAttemptResult);

module.exports = router;
