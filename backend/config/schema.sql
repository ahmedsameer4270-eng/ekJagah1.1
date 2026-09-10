-- SkillBridge PostgreSQL Schema
-- Unified schema for Students, Companies, Academicians, and Admins

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Student', 'Company', 'Academician', 'Admin')),
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    college TEXT,
    branch TEXT,
    cgpa REAL,
    graduation_year INTEGER,
    technical_skills TEXT DEFAULT '[]', -- JSON array of { name: string, level: 'Beginner'|'Intermediate'|'Advanced'|'Expert' }
    soft_skills TEXT DEFAULT '[]',      -- JSON array of strings
    resume_url TEXT,
    phone TEXT,
    location TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    leetcode_url TEXT,
    twitter_url TEXT,
    target_career_role TEXT,
    profile_completion INTEGER DEFAULT 20,
    verified_skills TEXT DEFAULT '[]', -- JSON array of { skillId, skillName, level, score, percentage, verdict, verifiedAt }
    skill_preferences TEXT DEFAULT '[]', -- JSON array of { skillId, selfRating }
    resume_summary TEXT,
    projects TEXT DEFAULT '[]', -- JSON array of { title, description, techStack, liveUrl, githubUrl }
    experience TEXT DEFAULT '[]', -- JSON array of { role, company, duration, description }
    resume_settings TEXT DEFAULT '{}', -- JSON object with template, accentColor, sections
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    cin_llpin TEXT,
    gstin TEXT,
    website TEXT,
    logo_url TEXT,
    industry TEXT,
    description TEXT,
    headquarters TEXT,
    verification_status TEXT DEFAULT 'UNDER_REVIEW' CHECK (verification_status IN ('VERIFIED', 'UNDER_REVIEW', 'REJECTED', 'NOT_VERIFIED')),
    trust_score INTEGER DEFAULT 50,
    admin_notes TEXT,
    verified_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academician_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    institution TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT,
    research_areas TEXT DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    certificate_id TEXT UNIQUE NOT NULL, -- e.g. SB-CERT-2026-XXXX
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'UNDER_REVIEW' CHECK (status IN ('VALID', 'UNDER_REVIEW', 'REJECTED')),
    verified_by TEXT REFERENCES users(id),
    verification_date TIMESTAMP,
    admin_notes TEXT,
    qr_code_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Full-time', 'Internship', 'Contract')),
    location TEXT NOT NULL,
    is_remote INTEGER DEFAULT 0,
    salary_min INTEGER,
    salary_max INTEGER,
    skills_required TEXT DEFAULT '[]', -- JSON array of strings
    experience_level TEXT DEFAULT 'Entry-level',
    description TEXT NOT NULL,
    deadline TIMESTAMP,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected')),
    match_score INTEGER DEFAULT 0,
    matched_skills TEXT DEFAULT '[]',
    missing_skills TEXT DEFAULT '[]',
    cover_note TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, student_id)
);

CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT NOT NULL, -- NPTEL, Coursera, Udemy, edX
    skill TEXT NOT NULL,
    level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT,
    rating REAL DEFAULT 4.5,
    is_free INTEGER DEFAULT 0,
    has_certificate INTEGER DEFAULT 1,
    course_url TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_gap_snapshots (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_goal TEXT NOT NULL,
    match_percentage INTEGER NOT NULL,
    matched_skills TEXT NOT NULL, -- JSON array
    missing_skills TEXT NOT NULL, -- JSON array
    recommendations TEXT NOT NULL, -- JSON object: courses, projects, internships
    roadmap_data TEXT NOT NULL, -- JSON array of phases & steps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'application', 'certificate', 'company', 'job', 'skill_gap', 'info'
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_curriculum_reviews (
    id TEXT PRIMARY KEY,
    academician_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    curriculum_skills TEXT NOT NULL, -- JSON array
    industry_gap_score INTEGER,
    flagged_missing_skills TEXT NOT NULL, -- JSON array
    recommended_electives TEXT NOT NULL, -- JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_courses (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    course_url TEXT,
    target_skill TEXT NOT NULL,
    status TEXT DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed')),
    completion_percentage INTEGER DEFAULT 0,
    self_check_passed INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    question_count INTEGER DEFAULT 15,
    time_limit_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_questions (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES assessment_skills(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('basic', 'intermediate', 'hard')),
    topic TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array of 4 string options
    correct_option_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES assessment_skills(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('basic', 'intermediate', 'hard')),
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    passed INTEGER DEFAULT 0,
    proficiency_verdict TEXT NOT NULL,
    topic_breakdown TEXT NOT NULL, -- JSON object
    answers TEXT NOT NULL, -- JSON array of { questionId, selectedOption, isCorrect }
    time_taken_seconds INTEGER NOT NULL,
    tab_switches INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
