const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const baseUploadDir = path.join(__dirname, '../uploads');
const resumeDir = path.join(baseUploadDir, 'resumes');
const certDir = path.join(baseUploadDir, 'certificates');
const avatarDir = path.join(baseUploadDir, 'avatars');

[baseUploadDir, resumeDir, certDir, avatarDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            cb(null, resumeDir);
        } else if (file.fieldname === 'certificate') {
            cb(null, certDir);
        } else {
            cb(null, avatarDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'resume') {
        if (ext === '.pdf') return cb(null, true);
        return cb(new Error('Only PDF resumes are supported.'), false);
    } else if (file.fieldname === 'certificate') {
        if (['.pdf', '.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return cb(null, true);
        return cb(new Error('Only PDF or image certificates (PNG, JPG, WEBP) are supported.'), false);
    } else {
        if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) return cb(null, true);
        return cb(new Error('Only image files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter
});

module.exports = upload;
