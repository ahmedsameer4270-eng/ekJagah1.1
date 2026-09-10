const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All admin routes require Admin role
router.use(authenticateToken, authorize(['Admin']));

router.get('/stats', adminController.getDashboardStats);
router.get('/companies', adminController.listCompanyVerifications);
router.put('/companies/:companyId/review', adminController.reviewCompany);
router.get('/certificates', adminController.listPendingCertificates);
router.put('/certificates/:certificateId/review', adminController.reviewCertificate);
router.get('/jobs', adminController.listAllJobs);
router.delete('/jobs/:jobId', adminController.deleteJob);
router.get('/users', adminController.listUsers);

module.exports = router;
