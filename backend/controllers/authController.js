const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { JWT_SECRET } = require('../middleware/auth');

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'skillbridge_refresh_secret_2026_super_secure';

// Helper: validate password strength (min 8 chars, 1 number, 1 special character)
function validatePassword(password) {
    if (!password || password.length < 8) return false;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumber && hasSpecial;
}

// Helper: validate email format
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate JWT tokens
function generateTokens(user, rememberMe = false) {
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    const refreshExpiry = rememberMe ? '30d' : '7d';
    const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        REFRESH_TOKEN_SECRET,
        { expiresIn: refreshExpiry }
    );

    return { accessToken, refreshToken };
}

// Helper to fetch role profile with safe JSON parsing
async function fetchUserProfile(userId, role) {
    try {
        const safeParse = (val, fallback = []) => {
            if (!val) return fallback;
            if (typeof val === 'object') return val;
            try { return JSON.parse(val); } catch { return fallback; }
        };

        if (role === 'Student') {
            const res = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
            if (res.rows.length > 0) {
                const profile = res.rows[0];
                profile.technical_skills = safeParse(profile.technical_skills, []);
                profile.soft_skills = safeParse(profile.soft_skills, []);
                profile.skill_preferences = safeParse(profile.skill_preferences, []);
                profile.projects = safeParse(profile.projects, []);
                profile.experience = safeParse(profile.experience, []);
                profile.verified_skills = safeParse(profile.verified_skills, []);
                return profile;
            } else {
                await db.query(
                    `INSERT INTO student_profiles (user_id, full_name, college, branch, profile_completion)
                     VALUES ($1, 'Student', '', '', 30)`,
                    [userId]
                );
                const newRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
                return newRes.rows[0] || null;
            }
        } else if (role === 'Company') {
            const res = await db.query('SELECT * FROM company_profiles WHERE user_id = $1', [userId]);
            if (res.rows.length > 0) {
                return res.rows[0];
            } else {
                await db.query(
                    `INSERT INTO company_profiles (user_id, company_name, verification_status, trust_score)
                     VALUES ($1, 'Tech Innovations Lab', 'VERIFIED', 95)`,
                    [userId]
                );
                const newRes = await db.query('SELECT * FROM company_profiles WHERE user_id = $1', [userId]);
                return newRes.rows[0] || null;
            }
        } else if (role === 'Academician') {
            const res = await db.query('SELECT * FROM academician_profiles WHERE user_id = $1', [userId]);
            if (res.rows.length > 0) {
                const profile = res.rows[0];
                profile.research_areas = safeParse(profile.research_areas, []);
                return profile;
            } else {
                await db.query(
                    `INSERT INTO academician_profiles (user_id, full_name, institution, department)
                     VALUES ($1, 'Faculty Member', 'University Institute of Technology', 'Computer Science & Engineering')`,
                    [userId]
                );
                const newRes = await db.query('SELECT * FROM academician_profiles WHERE user_id = $1', [userId]);
                const profile = newRes.rows[0] || null;
                if (profile) profile.research_areas = [];
                return profile;
            }
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
    }
    return null;
}

// 1. Multi-Role Registration
async function register(req, res) {
    try {
        const { email, password, role, ...details } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required.' });
        }

        const cleanEmail = String(email).trim().toLowerCase();

        if (!validateEmail(cleanEmail)) {
            return res.status(400).json({ error: 'Invalid email address format.' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long and contain at least 1 number and 1 special character.'
            });
        }

        if (!['Student', 'Company', 'Academician'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid registration role. Admin accounts must be seeded by system administrators.'
            });
        }

        // Check if user already exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        // 6-digit verification code
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query(
            `INSERT INTO users (id, email, password_hash, role, is_verified, verification_token)
             VALUES ($1, $2, $3, $4, 1, $5)`,
            [userId, cleanEmail, passwordHash, role, verificationToken]
        );

        // Populate role-specific profile
        if (role === 'Student') {
            const { fullName, college, branch } = details;
            await db.query(
                `INSERT INTO student_profiles (user_id, full_name, college, branch, profile_completion)
                 VALUES ($1, $2, $3, $4, 30)`,
                [userId, fullName || 'Student', college || '', branch || '']
            );
        } else if (role === 'Company') {
            const { companyName, cinNumber, gstin, website } = details;
            await db.query(
                `INSERT INTO company_profiles (user_id, company_name, cin_llpin, gstin, website, verification_status, trust_score)
                 VALUES ($1, $2, $3, $4, $5, 'UNDER_REVIEW', 60)`,
                [userId, companyName || 'Company', cinNumber || '', gstin || '', website || '']
            );
        } else if (role === 'Academician') {
            const { fullName, institution, department } = details;
            await db.query(
                `INSERT INTO academician_profiles (user_id, full_name, institution, department)
                 VALUES ($1, $2, $3, $4)`,
                [userId, fullName || 'Academician', institution || '', department || '']
            );
        }

        // Create welcome notification
        await db.query(
            `INSERT INTO notifications (id, user_id, title, message, type)
             VALUES ($1, $2, $3, $4, 'info')`,
            [uuidv4(), userId, 'Welcome to EkJagah!', `Your ${role} account has been created.`, 'info']
        );

        await sendVerificationEmail(cleanEmail, verificationToken, role);

        return res.status(201).json({
            message: 'Registration successful. Your account is ready.',
            email: cleanEmail,
            role,
            verificationToken
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Internal server error during registration.' });
    }
}

// 2. Email Verification
async function verifyEmail(req, res) {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ error: 'Email and verification token/OTP are required.' });
        }

        const result = await db.query(
            'SELECT id, role, verification_token, is_verified FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User account not found.' });
        }

        const user = result.rows[0];

        if (user.is_verified === 1) {
            return res.json({ message: 'Email is already verified. You can log in.' });
        }

        if (user.verification_token !== token.trim()) {
            return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
        }

        await db.query(
            'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = $1',
            [user.id]
        );

        return res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        console.error('Email verification error:', err);
        return res.status(500).json({ error: 'Error verifying email.' });
    }
}

// 3. User Login
async function login(req, res) {
    try {
        const { email, password, role: requestedRole, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const inputPassword = String(password);

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [cleanEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        // Check if account is locked
        if (user.locked_until) {
            const lockExpiry = new Date(user.locked_until);
            if (lockExpiry > new Date()) {
                const waitMinutes = Math.ceil((lockExpiry - new Date()) / (60 * 1000));
                return res.status(403).json({
                    error: `Account locked due to 5 consecutive failed attempts. Please try again in ${waitMinutes} minute(s).`
                });
            } else {
                // Lock has expired, reset
                await db.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);
            }
        }

        // Verify password (matches exact or trimmed input)
        const isMatch = await bcrypt.compare(inputPassword, user.password_hash) ||
                        await bcrypt.compare(inputPassword.trim(), user.password_hash);

        if (!isMatch) {
            const newAttempts = (user.failed_attempts || 0) + 1;
            if (newAttempts >= 5) {
                const lockTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                await db.query(
                    'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
                    [newAttempts, lockTime, user.id]
                );
                return res.status(403).json({
                    error: 'Account locked for 15 minutes due to 5 failed login attempts.'
                });
            } else {
                await db.query(
                    'UPDATE users SET failed_attempts = $1 WHERE id = $2',
                    [newAttempts, user.id]
                );
                return res.status(401).json({
                    error: `Invalid credentials. ${5 - newAttempts} attempt(s) remaining before lockout.`
                });
            }
        }

        // Reset failed attempts on success
        await db.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);

        // Auto-verify user if currently unverified
        if (user.is_verified !== 1) {
            await db.query('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = $1', [user.id]);
            user.is_verified = 1;
        }

        // Generate tokens using actual registered user role
        const { accessToken, refreshToken } = generateTokens(user, rememberMe);

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
        });

        const profile = await fetchUserProfile(user.id, user.role);

        return res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified,
                profile
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error during login.' });
    }
}

// 4. Refresh Token
async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;

        if (!token) {
            return res.status(401).json({ error: 'Refresh token missing.' });
        }

        jwt.verify(token, REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired refresh token.' });
            }

            const result = await db.query('SELECT id, email, role, is_verified FROM users WHERE id = $1', [decoded.userId]);
            if (result.rows.length === 0) {
                return res.status(403).json({ error: 'User not found.' });
            }

            const user = result.rows[0];
            const accessToken = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            return res.json({ accessToken });
        });
    } catch (err) {
        console.error('Refresh token error:', err);
        return res.status(500).json({ error: 'Error refreshing token.' });
    }
}

// 5. Forgot Password
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const result = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rows.length === 0) {
            // For security, do not expose if email does not exist
            return res.json({ message: 'If this email is registered, a password reset link has been dispatched.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

        await db.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [resetToken, expiresAt, email.toLowerCase()]
        );

        await sendPasswordResetEmail(email.toLowerCase(), resetToken);

        return res.json({
            message: 'If this email is registered, a password reset link has been dispatched.',
            previewToken: resetToken // In development
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ error: 'Error processing forgot password request.' });
    }
}

// 6. Reset Password
async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Reset token and new password are required.' });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters long and contain at least 1 number and 1 special character.'
            });
        }

        const result = await db.query(
            'SELECT id, reset_token_expires FROM users WHERE reset_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired password reset token.' });
        }

        const user = result.rows[0];
        if (new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, failed_attempts = 0, locked_until = NULL WHERE id = $2',
            [passwordHash, user.id]
        );

        return res.json({ message: 'Password has been successfully updated! You can now log in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ error: 'Error resetting password.' });
    }
}

// 7. Get Current User (/me)
async function getCurrentUser(req, res) {
    try {
        const user = req.userAccount;
        const profile = await fetchUserProfile(user.id, user.role);

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified,
                profile
            }
        });
    } catch (err) {
        console.error('Get current user error:', err);
        return res.status(500).json({ error: 'Error fetching user details.' });
    }
}

// 8. Logout
function logout(req, res) {
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully.' });
}

module.exports = {
    register,
    verifyEmail,
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logout
};
