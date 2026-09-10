// Email service for verification OTPs and Password Reset tokens
const devTokens = new Map(); // Store latest dev tokens for quick retrieval in dev/test mode

async function sendVerificationEmail(email, token, role) {
    devTokens.set(`verify_${email}`, { token, timestamp: Date.now() });
    
    console.log('\n==============================================');
    console.log(`📧 [EMAIL SERVICE] Account Verification Sent!`);
    console.log(`   To: ${email} (${role})`);
    console.log(`   Verification Code / Token: ${token}`);
    console.log(`   Verification Link: http://localhost:5173/verify-email?email=${encodeURIComponent(email)}&token=${token}`);
    console.log('==============================================\n');

    return {
        success: true,
        message: 'Verification email sent successfully',
        previewToken: process.env.NODE_ENV !== 'production' ? token : undefined
    };
}

async function sendPasswordResetEmail(email, token) {
    devTokens.set(`reset_${email}`, { token, timestamp: Date.now() });

    console.log('\n==============================================');
    console.log(`🔐 [EMAIL SERVICE] Password Reset Requested!`);
    console.log(`   To: ${email}`);
    console.log(`   Reset Token: ${token}`);
    console.log(`   Reset Link: http://localhost:5173/reset-password?token=${token}`);
    console.log('==============================================\n');

    return {
        success: true,
        message: 'Password reset link sent successfully',
        previewToken: process.env.NODE_ENV !== 'production' ? token : undefined
    };
}

function getLatestToken(key) {
    return devTokens.get(key);
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    getLatestToken
};
