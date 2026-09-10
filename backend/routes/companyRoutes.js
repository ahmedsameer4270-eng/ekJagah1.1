const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All company routes require Company role
router.use(authenticateToken, authorize(['Company']));

router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);
router.post('/request-verification', companyController.requestVerification);

// Jobs management
router.get('/jobs', jobController.listCompanyJobs);
router.post('/jobs', jobController.createJob);
router.get('/applicants/:jobId', jobController.listJobApplicants);
router.put('/applications/:applicationId/status', jobController.updateApplicationStatus);

module.exports = router;
