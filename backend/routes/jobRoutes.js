const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jobController = require('../controllers/jobController');
const { authenticateToken, authorize, JWT_SECRET } = require('../middleware/auth');

// Soft auth middleware: attaches user if valid token present, but doesn't block guests
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // ignore invalid token in optional auth
        }
    }
    next();
}

router.get('/', optionalAuth, jobController.listJobs);
router.get('/:id', optionalAuth, jobController.getJobById);
router.post('/apply', authenticateToken, authorize(['Student']), jobController.applyToJob);

module.exports = router;
