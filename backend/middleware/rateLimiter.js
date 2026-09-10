const rateLimit = require('express-rate-limit');

// General auth rate limiter: max 30 requests per 15 minutes
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter login rate limiter
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
        error: 'Too many login attempts. Please wait 15 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authRateLimiter,
    loginRateLimiter
};
