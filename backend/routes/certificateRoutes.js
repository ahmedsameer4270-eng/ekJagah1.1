const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public verification endpoint
router.get('/verify/:certId', certificateController.verifyCertificatePublic);

// Student protected certificate endpoints
router.post('/upload', authenticateToken, authorize(['Student']), upload.single('certificate'), certificateController.uploadCertificate);
router.get('/my', authenticateToken, authorize(['Student']), certificateController.listMyCertificates);

module.exports = router;
