const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_jwt_secret_2026_super_secure';

// Authenticate user via JWT access token
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, email, role }

        // Optionally fetch latest user active state from DB
        const result = await db.query('SELECT id, email, role, is_verified FROM users WHERE id = $1', [decoded.userId]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User account not found or deactivated.' });
        }

        req.userAccount = result.rows[0];
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(403).json({ error: 'Invalid or malformed authentication token.' });
    }
}

// Role-Based Access Control middleware
function authorize(roles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access forbidden: ${req.user.role} role is not authorized for this resource.`,
                code: 'FORBIDDEN_ROLE',
                requiredRoles: roles
            });
        }

        next();
    };
}

// Ensure company is verified before posting live jobs
async function ensureVerifiedCompany(req, res, next) {
    if (req.user.role !== 'Company') {
        return next();
    }

    try {
        const result = await db.query(
            'SELECT verification_status FROM company_profiles WHERE user_id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0 || result.rows[0].verification_status !== 'VERIFIED') {
            return res.status(403).json({
                error: 'Company verification required. Only companies with VERIFIED status can publish live jobs or contact candidates.',
                code: 'COMPANY_NOT_VERIFIED',
                status: result.rows[0]?.verification_status || 'NOT_VERIFIED'
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: 'Error checking company verification status.' });
    }
}

module.exports = {
    authenticateToken,
    authorize,
    ensureVerifiedCompany,
    JWT_SECRET
};
