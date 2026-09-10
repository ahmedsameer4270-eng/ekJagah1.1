// EkJagah AI Engine: Skill-gap analysis, Career Roadmap, and Smart Job Matching

const INDUSTRY_BENCHMARKS = {
    'Full Stack Developer': {
        category: 'Software Engineering',
        coreSkills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JavaScript', 'Git', 'REST APIs'],
        secondarySkills: ['TypeScript', 'Tailwind CSS', 'Docker', 'Redis', 'GraphQL', 'Next.js'],
        courses: [
            { title: 'Full Stack Web Development with Node.js & React', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'Full Stack', level: 'Intermediate' },
            { title: 'Modern PostgreSQL for Developers', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'PostgreSQL', level: 'Intermediate' },
            { title: 'Docker & Kubernetes: The Practical Guide', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'Docker', level: 'Intermediate' }
        ],
        projects: [
            { title: 'E-commerce Platform with Real-time Inventory', description: 'Build a full-stack e-commerce app with Stripe payments, PostgreSQL database, and Redis caching.' },
            { title: 'Collaborative Kanban Task Board', description: 'Real-time drag-and-drop workspace using React, WebSockets, and Node.js microservices.' }
        ]
    },
    'Frontend Developer': {
        category: 'Frontend',
        coreSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'Git', 'Responsive Design'],
        secondarySkills: ['TypeScript', 'Next.js', 'Redux', 'Vite', 'Figma', 'Web Performance'],
        courses: [
            { title: 'Advanced React and Modern State Management', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'React', level: 'Intermediate' },
            { title: 'Web Development & Modern CSS Architecture', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'Tailwind CSS', level: 'Beginner' }
        ],
        projects: [
            { title: 'SaaS Analytics Dashboard', description: 'High-performance interactive financial analytics portal with dynamic charts and dark mode.' },
            { title: 'Interactive Learning LMS Frontend', description: 'Fluid UI with video player, lesson progress tracking, and accessible design.' }
        ]
    },
    'Backend Engineer': {
        category: 'Backend',
        coreSkills: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs', 'System Design', 'Git', 'SQL'],
        secondarySkills: ['Docker', 'Redis', 'Microservices', 'Kafka', 'TypeScript', 'CI/CD'],
        courses: [
            { title: 'Distributed Systems & Microservices', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'System Design', level: 'Advanced' },
            { title: 'Database Management Systems', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'PostgreSQL', level: 'Intermediate' }
        ],
        projects: [
            { title: 'High-Throughput URL Shortener & Analytics', description: 'Scalable service handling 10k req/sec with rate limiting, Redis cache, and Postgres sharding.' },
            { title: 'Banking Transaction & Ledger Service', description: 'ACID-compliant double-entry ledger with automated reconciliation and audit trails.' }
        ]
    },
    'AI & Machine Learning Engineer': {
        category: 'Artificial Intelligence',
        coreSkills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-Learn'],
        secondarySkills: ['Deep Learning', 'NLP', 'Computer Vision', 'LLMs', 'MLOps', 'Docker'],
        courses: [
            { title: 'Deep Learning Specialization', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'Deep Learning', level: 'Intermediate' },
            { title: 'Applied Machine Learning', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'Machine Learning', level: 'Intermediate' }
        ],
        projects: [
            { title: 'RAG Document Question Answering System', description: 'Enterprise search and chat engine over PDF documents using embeddings and vector DB.' },
            { title: 'Computer Vision Defect Detection', description: 'YOLOv8-based automated quality assurance model trained on industrial manufacturing datasets.' }
        ]
    },
    'Data Scientist': {
        category: 'Data Science',
        coreSkills: ['Python', 'SQL', 'Data Analysis', 'Statistics', 'Pandas', 'Machine Learning', 'Data Visualization'],
        secondarySkills: ['PowerBI', 'Tableau', 'BigQuery', 'A/B Testing', 'Scikit-Learn', 'R'],
        courses: [
            { title: 'Data Science Professional Certificate', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'Data Science', level: 'Beginner' },
            { title: 'Business Analytics with Python', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'Data Analysis', level: 'Intermediate' }
        ],
        projects: [
            { title: 'Customer Churn Prediction & Retention Dashboard', description: 'End-to-end classification pipeline with SHAP interpretability and interactive Tableau dashboard.' },
            { title: 'Algorithmic Trading & Volatility Forecasting', description: 'Time-series analysis and forecasting using ARIMA, Prophet, and LSTM models.' }
        ]
    },
    'Cloud & DevOps Engineer': {
        category: 'Cloud & Infrastructure',
        coreSkills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git', 'Bash'],
        secondarySkills: ['Terraform', 'Prometheus', 'Grafana', 'Ansible', 'Networking', 'Python'],
        courses: [
            { title: 'AWS Certified Solutions Architect', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'AWS', level: 'Intermediate' },
            { title: 'Cloud Computing & Distributed Systems', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'Cloud', level: 'Intermediate' }
        ],
        projects: [
            { title: 'Zero-Downtime Multi-Region GitOps Pipeline', description: 'Automated deployment pipeline using GitHub Actions, ArgoCD, and Kubernetes cluster on AWS EKS.' },
            { title: 'Infrastructure as Code Cloud Foundation', description: 'Terraform blueprint provisioning resilient VPC, ECS clusters, RDS instances, and CloudWatch alerts.' }
        ]
    },
    'Cybersecurity Analyst': {
        category: 'Security',
        coreSkills: ['Network Security', 'Linux', 'Vulnerability Assessment', 'Wireshark', 'Cryptography', 'SIEM'],
        secondarySkills: ['Penetration Testing', 'Python', 'Ethical Hacking', 'OWASP Top 10', 'Incident Response'],
        courses: [
            { title: 'Introduction to Cybersecurity', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'Network Security', level: 'Beginner' },
            { title: 'Information Security & Cyber Forensics', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'Cybersecurity', level: 'Intermediate' }
        ],
        projects: [
            { title: 'Automated Vulnerability Scanner & Alert Bot', description: 'Python script auditing open ports, SSL configurations, and known CVEs with Slack alert dispatch.' },
            { title: 'SOC Incident Response Simulation Lab', description: 'ELK Stack SIEM deployment analyzing malicious payload logs and brute force attempts.' }
        ]
    },
    'Mobile App Developer': {
        category: 'Mobile',
        coreSkills: ['React Native', 'JavaScript', 'REST APIs', 'Mobile UI/UX', 'Git'],
        secondarySkills: ['Flutter', 'TypeScript', 'State Management', 'Firebase', 'iOS/Android Native'],
        courses: [
            { title: 'React Native - The Practical Guide', provider: 'Udemy', url: 'https://www.udemy.com', skill: 'React Native', level: 'Intermediate' },
            { title: 'Mobile Computing Concepts', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'Mobile', level: 'Beginner' }
        ],
        projects: [
            { title: 'Fitness & Habit Tracking App', description: 'Cross-platform app featuring biometric auth, offline SQLite sync, and interactive charts.' },
            { title: 'Campus Delivery & Food Ordering App', description: 'Live location tracking, push notifications, and payment gateway integration.' }
        ]
    },
    'UI/UX Designer': {
        category: 'Design',
        coreSkills: ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Design Systems'],
        secondarySkills: ['Adobe XD', 'Usability Testing', 'Information Architecture', 'HTML/CSS', 'Micro-interactions'],
        courses: [
            { title: 'Google UX Design Professional Certificate', provider: 'Coursera', url: 'https://www.coursera.org', skill: 'Figma', level: 'Beginner' },
            { title: 'Human Computer Interaction', provider: 'NPTEL', url: 'https://nptel.ac.in', skill: 'User Research', level: 'Intermediate' }
        ],
        projects: [
            { title: 'Fintech Mobile App Redesign & Case Study', description: 'End-to-end design sprint: user interviews, persona mapping, high-fidelity interactive prototype, and design token library.' }
        ]
    }
};

// Normalize skills to canonical form for flexible matching
function normalizeSkill(str) {
    if (!str) return '';
    return str.trim().toLowerCase()
        .replace(/\.js$/i, '')
        .replace(/\s+/g, ' ');
}

// Perform skill-gap analysis for a given student and career role
function analyzeSkillGap(studentSkills = [], targetRole = 'Full Stack Developer') {
    // Find closest benchmark role or default to Full Stack Developer
    let benchmark = INDUSTRY_BENCHMARKS[targetRole];
    if (!benchmark) {
        // Fallback: match by partial name or default
        const matchedKey = Object.keys(INDUSTRY_BENCHMARKS).find(k => k.toLowerCase().includes(targetRole.toLowerCase()));
        benchmark = matchedKey ? INDUSTRY_BENCHMARKS[matchedKey] : INDUSTRY_BENCHMARKS['Full Stack Developer'];
        targetRole = matchedKey || 'Full Stack Developer';
    }

    const studentSkillNames = studentSkills.map(s => (typeof s === 'string' ? s : s.name || ''));
    const studentNormalized = studentSkillNames.map(normalizeSkill);

    const matchedSkills = [];
    const missingCoreSkills = [];
    const missingSecondarySkills = [];

    // Check Core Skills (Weight: 2x)
    benchmark.coreSkills.forEach(core => {
        const normCore = normalizeSkill(core);
        const hasSkill = studentNormalized.some(s => s === normCore || s.includes(normCore) || normCore.includes(s));
        if (hasSkill) {
            matchedSkills.push({ name: core, priority: 'Core', matched: true });
        } else {
            missingCoreSkills.push({ name: core, priority: 'High Priority (Core)', matched: false });
        }
    });

    // Check Secondary Skills (Weight: 1x)
    benchmark.secondarySkills.forEach(sec => {
        const normSec = normalizeSkill(sec);
        const hasSkill = studentNormalized.some(s => s === normSec || s.includes(normSec) || normSec.includes(s));
        if (hasSkill) {
            matchedSkills.push({ name: sec, priority: 'Secondary', matched: true });
        } else {
            missingSecondarySkills.push({ name: sec, priority: 'Recommended', matched: false });
        }
    });

    // Calculate match percentage: Core skills 70% weight, Secondary 30%
    const totalCore = benchmark.coreSkills.length;
    const matchedCore = benchmark.coreSkills.length - missingCoreSkills.length;
    const totalSec = benchmark.secondarySkills.length;
    const matchedSec = benchmark.secondarySkills.length - missingSecondarySkills.length;

    const coreScore = totalCore > 0 ? (matchedCore / totalCore) * 70 : 0;
    const secScore = totalSec > 0 ? (matchedSec / totalSec) * 30 : 0;
    const matchPercentage = Math.round(Math.min(100, Math.max(10, coreScore + secScore)));

    const missingSkills = [...missingCoreSkills, ...missingSecondarySkills];

    // Build personalized career roadmap
    const roadmap = [
        {
            phase: 'Phase 1: Foundation & Baseline',
            title: 'Current Skill Proficiency',
            status: 'Completed',
            duration: 'Completed',
            skills: matchedSkills.map(s => s.name),
            description: `You have demonstrated knowledge in ${matchedSkills.length} relevant skill(s). Keep reinforcing these basics.`
        },
        {
            phase: 'Phase 2: High-Impact Core Upskilling',
            title: 'Bridge High-Priority Gaps',
            status: matchPercentage > 75 ? 'In Progress' : 'Pending',
            duration: 'Weeks 1-4',
            skills: missingCoreSkills.slice(0, 3).map(s => s.name),
            description: `Focus on mastering ${missingCoreSkills.slice(0, 3).map(s => s.name).join(', ') || 'advanced architectural concepts'} through guided external courses.`
        },
        {
            phase: 'Phase 3: Real-World Capstone Projects',
            title: 'Practical Hands-on Building',
            status: 'Pending',
            duration: 'Weeks 5-8',
            projects: benchmark.projects.slice(0, 2),
            description: 'Apply your newly acquired skills to production-grade portfolio projects with clean Git histories.'
        },
        {
            phase: 'Phase 4: Industry Internships & Certifications',
            title: 'Internship & Credentialing',
            status: 'Pending',
            duration: 'Weeks 9-12',
            description: 'Upload verified technical certificates to EkJagah and apply to entry-level internships matching your profile.'
        },
        {
            phase: 'Phase 5: Job Ready & Placements',
            title: 'Career Launch',
            status: 'Pending',
            duration: 'Weeks 13+',
            description: 'Participate in company interviews and leverage AI Job Matching with a 85%+ readiness score.'
        }
    ];

    return {
        careerGoal: targetRole,
        category: benchmark.category,
        matchPercentage,
        matchedSkills,
        missingSkills,
        missingCoreSkills,
        missingSecondarySkills,
        recommendedCourses: benchmark.courses,
        recommendedProjects: benchmark.projects,
        roadmap
    };
}

// Compute semantic job match for a student against a job listing
function computeJobMatch(studentSkills = [], jobSkills = []) {
    if (!jobSkills || jobSkills.length === 0) {
        return {
            matchScore: 85,
            matchedSkills: studentSkills.map(s => (typeof s === 'string' ? s : s.name)),
            missingSkills: [],
            explanation: 'General match based on candidate profile.'
        };
    }

    const studentSkillNames = studentSkills.map(s => (typeof s === 'string' ? s : s.name || ''));
    const studentNormalized = studentSkillNames.map(normalizeSkill);

    const matched = [];
    const missing = [];

    jobSkills.forEach(req => {
        const normReq = normalizeSkill(req);
        const isMatch = studentNormalized.some(s => s === normReq || s.includes(normReq) || normReq.includes(s));
        if (isMatch) {
            matched.push(req);
        } else {
            missing.push(req);
        }
    });

    const matchScore = Math.round((matched.length / jobSkills.length) * 100);

    let explanation = '';
    if (matchScore >= 80) {
        explanation = `Exceptional fit! You match ${matched.length} out of ${jobSkills.length} required skills, including ${matched.slice(0, 3).join(', ')}.`;
    } else if (matchScore >= 50) {
        explanation = `Promising candidate. You have ${matched.length} key skills (${matched.slice(0, 2).join(', ')}). Consider learning ${missing.slice(0, 2).join(', ')} to boost your odds.`;
    } else {
        explanation = `Emerging fit. To be competitive for this role, we recommend closing skill gaps in ${missing.slice(0, 3).join(', ')}.`;
    }

    return {
        matchScore: Math.max(15, matchScore), // minimum 15% base
        matchedSkills: matched,
        missingSkills: missing,
        explanation
    };
}

module.exports = {
    INDUSTRY_BENCHMARKS,
    analyzeSkillGap,
    computeJobMatch
};
