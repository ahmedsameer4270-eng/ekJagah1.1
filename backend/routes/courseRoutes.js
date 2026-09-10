const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', courseController.listCourses);
router.get('/recommended', authenticateToken, authorize(['Student']), courseController.getRecommendedCourses);

// Student tracked courses & self-check verification
router.get('/my-courses', authenticateToken, authorize(['Student']), courseController.getMyCourses);
router.post('/my-courses', authenticateToken, authorize(['Student']), courseController.addMyCourse);
router.put('/my-courses/:id', authenticateToken, authorize(['Student']), courseController.updateMyCourse);
router.post('/my-courses/:id/self-check', authenticateToken, authorize(['Student']), courseController.completeCourseWithSelfCheck);
router.delete('/my-courses/:id', authenticateToken, authorize(['Student']), courseController.deleteMyCourse);

module.exports = router;
