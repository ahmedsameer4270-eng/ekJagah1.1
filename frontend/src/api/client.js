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
