const express = require('express');
const router = express.Router();
const academicianController = require('../controllers/academicianController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All academician routes require Academician role
router.use(authenticateToken, authorize(['Academician']));

router.get('/trends', academicianController.getIndustryTrends);
router.post('/curriculum-gap', academicianController.analyzeCurriculum);

module.exports = router;
