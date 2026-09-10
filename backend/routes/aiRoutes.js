const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/benchmarks', aiController.getBenchmarkRoles);
router.post('/skill-gap', authenticateToken, authorize(['Student']), aiController.analyze);
router.get('/skill-gap/latest', authenticateToken, authorize(['Student']), aiController.getLatestSnapshot);
router.get('/skill-gap/history', authenticateToken, authorize(['Student']), aiController.listSnapshots);

module.exports = router;
