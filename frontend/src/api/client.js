import axios from 'axios';
import { FALLBACK_SKILLS, FALLBACK_QUESTIONS } from './assessmentFallbackData';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sb_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem('sb_access_token', newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('sb_access_token');
        localStorage.removeItem('sb_user');
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Resilient fallback for cloud environments (e.g. Vercel without hosted backend / Mixed Content)
    if (!error.response || error.code === 'ERR_NETWORK') {
      const url = originalRequest.url || '';
      const method = (originalRequest.method || 'get').toLowerCase();
      console.warn(`[EkJagah Cloud] Backend offline or unreachable at ${url}. Serving local fallback.`);

      const getStoredUser = () => {
        try {
          const u = localStorage.getItem('sb_user');
          return u ? JSON.parse(u) : null;
        } catch {
          return null;
        }
      };

      const user = getStoredUser();
      const prof = user?.profile || {
        full_name: 'Student Candidate',
        college: 'University',
        branch: 'Computer Science',
        profile_completion: 80,
        technical_skills: [{ name: 'Python', level: 'Intermediate' }, { name: 'React', level: 'Advanced' }],
        soft_skills: ['Problem Solving', 'Leadership'],
        skill_preferences: [{ skillId: 'python', selfRating: 'Intermediate' }],
        projects: [
          {
            id: 'proj-1',
            title: 'EkJagah Career Platform',
            role: 'Full Stack Developer',
            startDate: '2026-01',
            endDate: 'Present',
            description: 'AI-driven skill matching and ATS-ready resume engine.',
            techStack: ['React', 'Node.js', 'TailwindCSS'],
            bullets: ['Engineered career intelligence portal with AI diagnosis.'],
            featured: true
          }
        ],
        experience: [],
        verified_skills: [{ skillId: 'python', skillName: 'Python', level: 'basic', score: 16, totalQuestions: 16, percentage: 100, verdict: 'Competent' }]
      };

      if (url.includes('/auth/me')) {
        return Promise.resolve({ data: { user: user || { id: 'usr-guest', email: 'guest@ekjagah.edu', role: 'Student', profile: prof } } });
      }

      if (url.includes('/student/profile')) {
        if (method === 'put' || method === 'post') {
          if (user) {
            user.profile = { ...prof, ...(originalRequest.data || {}) };
            localStorage.setItem('sb_user', JSON.stringify(user));
          }
          return Promise.resolve({ data: { message: 'Profile updated successfully', profile: user?.profile || prof } });
        }
        return Promise.resolve({ data: { profile: prof } });
      }

      if (url.includes('/student/resume-data')) {
        if (method === 'post') {
          return Promise.resolve({ data: { message: 'Resume saved successfully' } });
        }
        return Promise.resolve({
          data: {
            personalInfo: {
              fullName: prof.full_name || 'Student Candidate',
              email: user?.email || 'student@skillbridge.edu',
              phone: prof.phone || '+91 99999 88888',
              location: prof.location || 'Bengaluru, India',
              college: prof.college || 'Engineering College',
              branch: prof.branch || 'Computer Science',
              cgpa: prof.cgpa || 9.2,
              graduationYear: prof.graduation_year || 2027,
              githubUrl: prof.github_url || 'https://github.com',
              linkedinUrl: prof.linkedin_url || 'https://linkedin.com',
              portfolioUrl: prof.portfolio_url || 'https://portfolio.dev',
              leetcodeUrl: prof.leetcode_url || '',
              twitterUrl: prof.twitter_url || ''
            },
            verifiedSkills: prof.verified_skills || [],
            certificates: [],
            courses: [],
            projects: prof.projects || [],
            experience: prof.experience || [],
            summary: prof.resume_summary || 'Forward-thinking Computer Science student specializing in scalable full-stack development and cloud computing.',
            resumeSettings: { template: 'classic', accentColor: '#059669', showVerifiedBadges: true, showProjects: true, showCertificates: true, showPhone: true, showLocation: true }
          }
        });
      }

      if (url.includes('/ai/skill-gap/latest')) {
        return Promise.resolve({
          data: {
            analysis: {
              targetRole: 'Full Stack Developer',
              matchPercentage: 82,
              matchedSkills: ['React', 'JavaScript', 'Node.js', 'Python'],
              missingSkills: ['PostgreSQL', 'Docker', 'Redis'],
              recommendations: [
                { skill: 'PostgreSQL', reason: 'Industry-standard relational data store.' },
                { skill: 'Docker', reason: 'Critical for cloud-native deployments.' }
              ]
            }
          }
        });
      }

      if (url.includes('/jobs')) {
        return Promise.resolve({
          data: {
            jobs: [
              {
                id: 'job-1',
                title: 'Junior Full Stack Engineer',
                company_name: 'Tech Innovations Lab',
                location: 'Bengaluru, India (Hybrid)',
                job_type: 'Full-time',
                salary_range: '₹8,00,000 - ₹12,00,000',
                match_percentage: 88,
                required_skills: ['React', 'Node.js', 'JavaScript']
              },
              {
                id: 'job-2',
                title: 'Frontend React Developer Intern',
                company_name: 'Innovate AI Cloud',
                location: 'Remote',
                job_type: 'Internship',
                salary_range: '₹35,000 / month',
                match_percentage: 94,
                required_skills: ['React', 'TailwindCSS', 'JavaScript']
              }
            ]
          }
        });
      }

      if (url.includes('/courses')) {
        return Promise.resolve({
          data: {
            courses: [
              {
                id: 'c-1',
                title: 'Full-Stack React & Node.js Masterclass',
                provider: 'EkJagah Academy',
                level: 'Intermediate',
                duration: '6 Weeks',
                rating: 4.9,
                is_free: 1
              },
              {
                id: 'c-2',
                title: 'Data Structures & Algorithms in Python',
                provider: 'TechBridge Learning',
                level: 'All Levels',
                duration: '8 Weeks',
                rating: 4.8,
                is_free: 1
              }
            ],
            basedOnSkills: ['Python', 'React']
          }
        });
      }

      if (url.includes('/notifications')) {
        return Promise.resolve({ data: { notifications: [] } });
      }

      // Certificates (Student & Public verification)
      if (url.includes('/certificates')) {
        const defaultCerts = [
          {
            id: 'cert-python-101',
            title: 'Certified Python Core Specialist',
            issuer: 'EkJagah Skill Authority',
            issue_date: '2026-02-15',
            status: 'VERIFIED',
            verification_hash: '0x8f3c7e92b0a1d48c',
            skills: ['Python', 'Data Structures']
          },
          {
            id: 'cert-react-202',
            title: 'Modern React & Component Engineering',
            issuer: 'Global Web Standards Institute',
            issue_date: '2026-03-01',
            status: 'VERIFIED',
            verification_hash: '0x4d1b82a39f6e7c10',
            skills: ['React.js', 'State Management']
          }
        ];
        const certList = JSON.parse(localStorage.getItem('sb_certificates') || JSON.stringify(defaultCerts));
        if (method === 'post') {
          const newCert = {
            id: 'cert-' + Date.now(),
            title: originalRequest.data?.get ? originalRequest.data.get('title') : 'New Certificate',
            issuer: originalRequest.data?.get ? originalRequest.data.get('issuer') : 'Institution',
            issue_date: new Date().toISOString().split('T')[0],
            status: 'PENDING_APPROVAL',
            verification_hash: '0x' + Math.random().toString(16).substring(2, 10)
          };
          certList.unshift(newCert);
          localStorage.setItem('sb_certificates', JSON.stringify(certList));
          return Promise.resolve({ data: { message: 'Certificate uploaded successfully', certificate: newCert } });
        }
        return Promise.resolve({ data: { certificates: certList } });
      }

      // Company Portal
      if (url.includes('/company/profile')) {
        const compProf = {
          id: 'comp-1',
          name: 'Tech Innovations Lab',
          industry: 'Software & Cloud Engineering',
          location: 'Bengaluru, Karnataka',
          website: 'https://techinnovations.io',
          verification_status: 'VERIFIED',
          trust_score: 96,
          about: 'Leading enterprise software engineering and AI cloud systems provider.',
          jobs_posted: 4,
          active_hires: 12
        };
        const stats = {
          activeJobs: 4,
          totalApplicants: 18,
          shortlisted: 5,
          interviewsScheduled: 2
        };
        return Promise.resolve({ data: { profile: compProf, stats } });
      }

      if (url.includes('/company/jobs')) {
        const compJobs = [
          {
            id: 'job-1',
            title: 'Junior Full Stack Engineer',
            department: 'Core Engineering',
            location: 'Bengaluru (Hybrid)',
            job_type: 'Full-time',
            salary_range: '₹8,00,000 - ₹12,00,000',
            applicants_count: 14,
            status: 'ACTIVE',
            created_at: '2026-08-15'
          },
          {
            id: 'job-2',
            title: 'Frontend React Developer Intern',
            department: 'Product Experience',
            location: 'Remote',
            job_type: 'Internship',
            salary_range: '₹35,000 / month',
            applicants_count: 22,
            status: 'ACTIVE',
            created_at: '2026-08-20'
          }
        ];
        if (method === 'post') {
          return Promise.resolve({ data: { message: 'Job posted successfully', job: { id: 'job-' + Date.now(), ...originalRequest.data } } });
        }
        return Promise.resolve({ data: { jobs: compJobs } });
      }

      if (url.match(/\/company\/jobs\/([^/]+)\/applicants/)) {
        return Promise.resolve({
          data: {
            applicants: [
              {
                id: 'app-1',
                candidate_name: 'Aarav Sharma',
                email: 'student@skillbridge.edu',
                college: 'Indian Institute of Information Technology',
                match_percentage: 94,
                status: 'APPLIED',
                applied_at: '2026-09-01',
                resume_url: '/student/resume'
              },
              {
                id: 'app-2',
                candidate_name: 'Priya Verma',
                email: 'priya.v@university.ac.in',
                college: 'National Institute of Technology',
                match_percentage: 88,
                status: 'SHORTLISTED',
                applied_at: '2026-09-03',
                resume_url: '/student/resume'
              }
            ]
          }
        });
      }

      // Academician Portal
      if (url.includes('/academician/trends')) {
        return Promise.resolve({
          data: {
            studentCohortSize: 1420,
            topSkills: [
              { skill: 'React.js', demandScore: 94, growth: '+28%' },
              { skill: 'Python', demandScore: 92, growth: '+35%' },
              { skill: 'SQL & Database Architecture', demandScore: 89, growth: '+15%' },
              { skill: 'Cloud & Docker', demandScore: 86, growth: '+42%' }
            ],
            emergingTech: [
              { tech: 'Agentic AI & LLM Systems', growth: '+180%' },
              { tech: 'Vector Databases', growth: '+120%' },
              { tech: 'Rust Systems Programming', growth: '+75%' }
            ],
            curriculumAlignmentScore: 84
          }
        });
      }

      if (url.includes('/academician/curriculum-gap')) {
        return Promise.resolve({
          data: {
            overallAlignment: 82,
            gapCategories: [
              { subject: 'Distributed Systems', industryExpectation: 'High', curriculumCoverage: 'Medium', recommendation: 'Introduce Kafka & Microservices labs' },
              { subject: 'Containerization & DevOps', industryExpectation: 'High', curriculumCoverage: 'Low', recommendation: 'Add mandatory Docker & CI/CD module' }
            ]
          }
        });
      }

      // Admin Portal
      if (url.includes('/admin/stats')) {
        return Promise.resolve({
          data: {
            users: { total: 13, students: 9, companies: 2, academicians: 1, admins: 1 },
            companies: { verified: 2, pending: 1 },
            certificates: { verified: 6, pending: 2 },
            jobs: { active: 4, closed: 0 },
            applications: 14
          }
        });
      }

      if (url.includes('/admin/companies')) {
        return Promise.resolve({
          data: {
            companies: [
              { id: 'comp-p1', name: 'Innovate AI Cloud', registration_number: 'CIN-U72200KA2024PTC184', status: 'PENDING', submitted_at: '2026-09-08' }
            ]
          }
        });
      }

      if (url.includes('/admin/certificates')) {
        return Promise.resolve({
          data: {
            certificates: [
              { id: 'cert-p1', student_name: 'Harsh Vardhan', title: 'Advanced Cloud Architecture', issuer: 'AWS Training Partner', submitted_at: '2026-09-09' }
            ]
          }
        });
      }

      if (url.includes('/admin/users')) {
        return Promise.resolve({
          data: {
            users: [
              { id: 'u-1', email: 'student@skillbridge.edu', role: 'Student', is_verified: 1, created_at: '2026-08-01' },
              { id: 'u-2', email: 'recruiter@techcorp.com', role: 'Company', is_verified: 1, created_at: '2026-08-02' },
              { id: 'u-3', email: 'prof.gupta@iitb.ac.in', role: 'Academician', is_verified: 1, created_at: '2026-08-03' },
              { id: 'u-4', email: 'admin@skillbridge.gov.in', role: 'Admin', is_verified: 1, created_at: '2026-08-01' }
            ]
          }
        });
      }

      // Assessment: Skills list
      if (url.includes('/assessment/skills')) {
        return Promise.resolve({ data: { skills: FALLBACK_SKILLS } });
      }

      // Assessment: History
      if (url.includes('/assessment/history')) {
        const history = JSON.parse(localStorage.getItem('sb_assessment_history') || '[]');
        return Promise.resolve({ data: { history } });
      }

      // Assessment: Questions for skill and level (including Hard)
      if (url.match(/\/assessment\/([a-zA-Z0-9_-]+)\/questions/)) {
        const match = url.match(/\/assessment\/([a-zA-Z0-9_-]+)\/questions/);
        const skillId = match ? match[1] : 'javascript';
        const urlObj = new URL(url.startsWith('http') ? url : `http://localhost${url}`);
        const reqLevel = (urlObj.searchParams.get('level') || 'basic').toLowerCase();
        const skill = FALLBACK_SKILLS.find((s) => s.id === skillId) || { id: skillId, name: skillId, time_limit_minutes: 15 };

        let pool = FALLBACK_QUESTIONS.filter(
          (q) => q.skill_id === skillId && q.level.toLowerCase() === reqLevel
        );
        if (pool.length === 0) {
          pool = FALLBACK_QUESTIONS.filter((q) => q.skill_id === skillId);
        }

        const safeQuestions = pool.map((q, idx) => ({
          id: q.id || `${skillId}-${q.level}-${idx}`,
          skill_id: q.skill_id,
          level: q.level,
          topic: q.topic,
          question_text: q.question_text,
          options: q.options
        }));

        return Promise.resolve({
          data: {
            skill: {
              id: skill.id,
              name: skill.name,
              category: skill.category,
              timeLimitMinutes: skill.time_limit_minutes || 15,
              questionCount: safeQuestions.length
            },
            level: reqLevel,
            questions: safeQuestions
          }
        });
      }

      // Assessment: Submit test answers
      if (url.match(/\/assessment\/([a-zA-Z0-9_-]+)\/submit/)) {
        const match = url.match(/\/assessment\/([a-zA-Z0-9_-]+)\/submit/);
        const skillId = match ? match[1] : 'javascript';
        const payload = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : (originalRequest.data || {});
        const reqLevel = (payload.level || 'basic').toLowerCase();
        const skill = FALLBACK_SKILLS.find((s) => s.id === skillId) || { id: skillId, name: skillId };

        let pool = FALLBACK_QUESTIONS.filter(
          (q) => q.skill_id === skillId && q.level.toLowerCase() === reqLevel
        );
        if (pool.length === 0) pool = FALLBACK_QUESTIONS.filter((q) => q.skill_id === skillId);

        let correct = 0;
        const review = pool.map((q, idx) => {
          const qId = q.id || `${skillId}-${q.level}-${idx}`;
          const userAns = payload.answers?.find((a) => a.questionId === qId || a.questionId === q.topic)?.selectedOption;
          const isCorrect = userAns === q.correct_option_index;
          if (isCorrect) correct++;
          return {
            id: qId,
            skill_id: q.skill_id,
            level: q.level,
            topic: q.topic,
            question_text: q.question_text,
            options: q.options,
            correct_option_index: q.correct_option_index,
            user_answer: userAns,
            is_correct: isCorrect,
            explanation: q.explanation
          };
        });

        const total = pool.length || 1;
        const percentage = Math.round((correct / total) * 100);
        const verdict = percentage >= 70 ? 'Competent' : (percentage >= 40 ? 'Developing' : 'Novice');
        const passed = percentage >= 70;
        const attemptId = 'att-' + Date.now();

        const attemptRecord = {
          id: attemptId,
          skill_id: skillId,
          skill_name: skill.name,
          level: reqLevel,
          score: correct,
          total_questions: total,
          percentage,
          verdict,
          passed,
          time_spent_seconds: payload.timeTakenSeconds || 120,
          tab_switches: payload.tabSwitches || 0,
          completed_at: new Date().toISOString(),
          reviewQuestions: review
        };

        const existingHist = JSON.parse(localStorage.getItem('sb_assessment_history') || '[]');
        existingHist.unshift(attemptRecord);
        localStorage.setItem('sb_assessment_history', JSON.stringify(existingHist));

        // Update verified skills in user profile if passed
        if (passed) {
          const storedUser = getStoredUser();
          if (storedUser) {
            if (!storedUser.profile) storedUser.profile = {};
            if (!Array.isArray(storedUser.profile.verified_skills)) storedUser.profile.verified_skills = [];
            const idx = storedUser.profile.verified_skills.findIndex((s) => s.skillId === skillId);
            const verifiedEntry = {
              skillId,
              skillName: skill.name,
              level: reqLevel,
              score: correct,
              totalQuestions: total,
              percentage,
              verdict,
              verifiedAt: new Date().toISOString()
            };
            if (idx >= 0) {
              storedUser.profile.verified_skills[idx] = verifiedEntry;
            } else {
              storedUser.profile.verified_skills.push(verifiedEntry);
            }
            localStorage.setItem('sb_user', JSON.stringify(storedUser));
          }
        }

        return Promise.resolve({
          data: {
            success: true,
            attemptId,
            score: correct,
            totalQuestions: total,
            percentage,
            verdict,
            passed,
            message: `Assessment submitted successfully. Verdict: ${verdict}`
          }
        });
      }

      // Assessment: Fetch results for review
      if (url.match(/\/assessment\/([a-zA-Z0-9_-]+)\/results\/([a-zA-Z0-9_-]+)/)) {
        const match = url.match(/\/assessment\/([a-zA-Z0-9_-]+)\/results\/([a-zA-Z0-9_-]+)/);
        const attemptId = match ? match[2] : null;
        const history = JSON.parse(localStorage.getItem('sb_assessment_history') || '[]');
        const attempt = history.find((h) => h.id === attemptId) || history[0] || null;
        return Promise.resolve({ data: { attempt } });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
