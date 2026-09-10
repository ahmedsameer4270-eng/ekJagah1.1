const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

async function seedDatabase() {
    console.log('🌱 Starting SkillBridge database seeding...');
    await db.runMigrations();

    // Check if admin already exists
    const existing = await db.query("SELECT id FROM users WHERE role = 'Admin' LIMIT 1");
    if (existing.rows.length > 0) {
        console.log('Database already seeded. Skipping.');
        return;
    }

    const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const studentPasswordHash = await bcrypt.hash('Student@12345', 10);
    const companyPasswordHash = await bcrypt.hash('Company@12345', 10);
    const academicPasswordHash = await bcrypt.hash('Academic@12345', 10);

    const adminId = uuidv4();
    const studentId = uuidv4();
    const verifiedCompanyId = uuidv4();
    const pendingCompanyId = uuidv4();
    const academicianId = uuidv4();

    // 1. Insert Users
    await db.query(`
        INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
        ($1, 'admin@skillbridge.gov.in', $2, 'Admin', 1),
        ($3, 'student@skillbridge.edu', $4, 'Student', 1),
        ($5, 'recruiter@techcorp.com', $6, 'Company', 1),
        ($7, 'hiring@innovatestartup.io', $6, 'Company', 1),
        ($8, 'prof.gupta@iitb.ac.in', $9, 'Academician', 1)
    `, [
        adminId, defaultPasswordHash,
        studentId, studentPasswordHash,
        verifiedCompanyId, companyPasswordHash,
        pendingCompanyId,
        academicianId, academicPasswordHash
    ]);

    // 2. Student Profile
    const studentSkills = [
        { name: 'React', level: 'Intermediate' },
        { name: 'JavaScript', level: 'Advanced' },
        { name: 'HTML/CSS', level: 'Advanced' },
        { name: 'Node.js', level: 'Intermediate' },
        { name: 'Git', level: 'Intermediate' },
        { name: 'SQL', level: 'Beginner' }
    ];

    await db.query(`
        INSERT INTO student_profiles (user_id, full_name, college, branch, cgpa, graduation_year, technical_skills, soft_skills, portfolio_url, github_url, linkedin_url, target_career_role, profile_completion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
        studentId,
        'Aarav Sharma',
        'Indian Institute of Technology, Bombay',
        'Computer Science & Engineering',
        8.9,
        2026,
        JSON.stringify(studentSkills),
        JSON.stringify(['Problem Solving', 'Team Collaboration', 'Effective Communication']),
        'https://aaravsharma.dev',
        'https://github.com/aaravsharma',
        'https://linkedin.com/in/aaravsharma',
        'Full Stack Developer',
        85
    ]);

    // 3. Company Profiles
    await db.query(`
        INSERT INTO company_profiles (user_id, company_name, cin_llpin, gstin, website, industry, description, headquarters, verification_status, trust_score, verified_at)
        VALUES 
        ($1, 'NexGen Technologies Ltd.', 'U72200MH2021PTC356789', '27AAACN1234F1Z5', 'https://techcorp.com', 'Enterprise SaaS & Cloud', 'Leading provider of enterprise cloud infrastructure and intelligent AI workflows for global clients.', 'Bengaluru, Karnataka', 'VERIFIED', 96, CURRENT_TIMESTAMP),
        ($2, 'InnovateX Labs', 'U74999DL2024PTC987654', '07AABCI9876E1Z2', 'https://innovatestartup.io', 'FinTech & Web3', 'Pioneering decentralized clearing and algorithmic risk management for modern commerce.', 'New Delhi, India', 'UNDER_REVIEW', 65, NULL)
    `, [verifiedCompanyId, pendingCompanyId]);

    // 4. Academician Profile
    await db.query(`
        INSERT INTO academician_profiles (user_id, full_name, institution, department, designation, research_areas)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        academicianId,
        'Dr. Ramesh Gupta',
        'Indian Institute of Technology, Bombay',
        'Department of Computer Science & Engineering',
        'Professor & Dean of Academic Programmes',
        JSON.stringify(['Distributed Systems', 'Cloud Computing', 'Outcome-Based Education', 'Curriculum Innovation'])
    ]);

    // 5. Certificates & QR Codes
    const qr1 = await QRCode.toDataURL('http://localhost:5173/verify-cert/SB-CERT-2026-REACT', { width: 250, margin: 2 });
    const qr2 = await QRCode.toDataURL('http://localhost:5173/verify-cert/SB-CERT-2026-AWS', { width: 250, margin: 2 });

    await db.query(`
        INSERT INTO certificates (id, certificate_id, student_id, title, issuer, issue_date, status, verified_by, verification_date, qr_code_data, admin_notes)
        VALUES 
        ($1, 'SB-CERT-2026-REACT', $2, 'Meta Certified Front-End Developer', 'Meta / Coursera', '2026-01-15', 'VALID', $3, CURRENT_TIMESTAMP, $4, 'Verified against official Meta certification badge URL.'),
        ($5, 'SB-CERT-2026-AWS', $2, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2026-02-28', 'UNDER_REVIEW', NULL, NULL, $6, 'Pending verification review by administration.')
    `, [uuidv4(), studentId, adminId, qr1, uuidv4(), qr2]);

    // 6. Jobs & Internships
    const job1Id = uuidv4();
    const job2Id = uuidv4();
    const job3Id = uuidv4();
    const job4Id = uuidv4();

    await db.query(`
        INSERT INTO jobs (id, company_id, title, type, location, is_remote, salary_min, salary_max, skills_required, experience_level, description, status)
        VALUES 
        ($1, $5, 'Full Stack Developer (SaaS)', 'Full-time', 'Bengaluru, India', 1, 1200000, 1800000, $6, 'Entry-level', 'Join our core platform engineering team to build scalable full-stack features using React, Node.js, and PostgreSQL.', 'Active'),
        ($2, $5, 'Frontend Engineering Intern', 'Internship', 'Remote', 1, 35000, 50000, $7, 'Internship', 'Paid 6-month internship building modern responsive dashboards and interactive UI components with React & Tailwind CSS.', 'Active'),
        ($3, $5, 'Cloud & DevOps Engineer', 'Full-time', 'Hyderabad, India', 0, 1400000, 2200000, $8, 'Mid-level', 'Architect, maintain, and scale our AWS Kubernetes infrastructure with zero-downtime CI/CD automation.', 'Active'),
        ($4, $5, 'AI / Machine Learning Engineer', 'Full-time', 'Bengaluru, India', 1, 1500000, 2500000, $9, 'Entry-level', 'Design and deploy production-ready machine learning models and LLM agent workflows.', 'Active')
    `, [
        job1Id, job2Id, job3Id, job4Id, verifiedCompanyId,
        JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git']),
        JSON.stringify(['React', 'Tailwind CSS', 'JavaScript', 'Git']),
        JSON.stringify(['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD']),
        JSON.stringify(['Python', 'Machine Learning', 'PyTorch', 'Pandas', 'SQL'])
    ]);

    // 7. Curated Courses
    await db.query(`
        INSERT INTO courses (id, title, provider, skill, level, duration, rating, is_free, has_certificate, course_url, image_url)
        VALUES 
        ($1, 'Database Management Systems', 'NPTEL', 'PostgreSQL', 'Intermediate', '12 Weeks', 4.8, 1, 1, 'https://nptel.ac.in/courses/106/105/106105175/', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80'),
        ($2, 'Full Stack Web Development with Node.js & React', 'Coursera', 'Full Stack', 'Intermediate', '8 Weeks', 4.9, 0, 1, 'https://www.coursera.org', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80'),
        ($3, 'Docker & Kubernetes: The Practical Guide', 'Udemy', 'Docker', 'Intermediate', '24 Hours', 4.7, 0, 1, 'https://www.udemy.com', 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&q=80'),
        ($4, 'Cloud Computing & Distributed Systems', 'NPTEL', 'AWS', 'Intermediate', '8 Weeks', 4.6, 1, 1, 'https://nptel.ac.in', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80'),
        ($5, 'Deep Learning Specialization', 'Coursera', 'Machine Learning', 'Advanced', '16 Weeks', 4.9, 0, 1, 'https://www.coursera.org', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80'),
        ($6, 'Google UX Design Professional Certificate', 'Coursera', 'Figma', 'Beginner', '6 Months', 4.8, 0, 1, 'https://www.coursera.org', 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=400&q=80'),
        ($7, 'Applied Machine Learning in Python', 'Coursera', 'Python', 'Intermediate', '5 Weeks', 4.7, 0, 1, 'https://www.coursera.org', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80'),
        ($8, 'React Native - Practical Guide for Mobile', 'Udemy', 'React Native', 'Beginner', '32 Hours', 4.8, 0, 1, 'https://www.udemy.com', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80')
    `, [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()]);

    // 8. Welcome Notifications
    await db.query(`
        INSERT INTO notifications (id, user_id, title, message, type, link)
        VALUES 
        ($1, $2, '🎉 Welcome to EkJagah!', 'Explore the AI Skill Gap Analyzer to compute your target match and bridge high-demand skills. Your career, all in one place.', 'info', '/student/skill-gap'),
        ($3, $2, '⭐ 2 New Matching Jobs Found', 'NexGen Technologies just posted Full Stack Developer and Frontend Intern positions matching your profile.', 'job', '/student/jobs')
    `, [uuidv4(), studentId, uuidv4()]);

    console.log('✅ SkillBridge database successfully seeded with test accounts, jobs, courses, and certificates!');
    console.log('   --------------------------------------------------------------');
    console.log('   Admin:        admin@skillbridge.gov.in     | Admin@12345');
    console.log('   Student:      student@skillbridge.edu      | Student@12345');
    console.log('   Company (OK): recruiter@techcorp.com       | Company@12345');
    console.log('   Company (Rev):hiring@innovatestartup.io    | Company@12345');
    console.log('   Academician:  prof.gupta@iitb.ac.in        | Academic@12345');
    console.log('   --------------------------------------------------------------');
}

module.exports = { seedDatabase };

if (require.main === module) {
    seedDatabase().catch(err => {
        console.error('Seed error:', err);
        process.exit(1);
    });
}
