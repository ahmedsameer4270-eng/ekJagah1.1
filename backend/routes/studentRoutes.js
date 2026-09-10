const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const jobController = require('../controllers/jobController');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All student routes require Student role
router.use(authenticateToken, authorize(['Student']));

router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.post('/preferences', studentController.savePreferences);
router.get('/resume-data', studentController.getResumeData);
router.post('/resume-data', studentController.saveResumeData);
router.post('/projects', studentController.addProject);
router.put('/projects/:id', studentController.updateProject);
router.delete('/projects/:id', studentController.deleteProject);
router.post('/upload-resume', upload.single('resume'), studentController.uploadResume);
router.get('/applications', jobController.listStudentApplications);
router.get('/nudge', studentController.getStudentNudge);

module.exports = router;
