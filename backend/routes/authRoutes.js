const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authRateLimiter, loginRateLimiter } = require('../middleware/rateLimiter');

// Public auth endpoints
router.post('/register', authRateLimiter, authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

// Protected endpoint
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
