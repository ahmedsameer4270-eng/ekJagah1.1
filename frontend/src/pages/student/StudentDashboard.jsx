import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Sparkles,
  Award,
  Briefcase,
  Map,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Target,
  FileText,
  ClipboardCheck,
  SlidersHorizontal
} from 'lucide-react';
import { OnboardingModal } from '../../components/student/OnboardingModal';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [latestGap, setLatestGap] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [profRes, gapRes, jobsRes, coursesRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/ai/skill-gap/latest'),
          api.get('/jobs?sortByMatch=true'),
          api.get('/courses/recommended')
        ]);

        const p = profRes.data.profile;
        setProfile(p);
        setLatestGap(gapRes.data.analysis);
        setRecommendedJobs((jobsRes.data.jobs || []).slice(0, 3));
        setRecommendedCourses((coursesRes.data.courses || []).slice(0, 3));

        // Auto prompt onboarding if preferences are not set yet
        const prefs = p?.skill_preferences || [];
        if (prefs.length === 0 && !sessionStorage.getItem('onboarding_dismissed')) {
          setShowOnboardingModal(true);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleOnboardingComplete = (data) => {
    setProfile((prev) => ({
      ...prev,
      skill_preferences: data.preferences,
      target_career_role: data.targetCareerRole,
      profile_completion: data.profileCompletion,
      technical_skills: data.technicalSkills
    }));
    if (data.analysis) {
      setLatestGap(data.analysis);
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboardingModal(false);
    sessionStorage.setItem('onboarding_dismissed', 'true');
  };

  const completion = profile?.profile_completion || 30;
  const targetRole = profile?.target_career_role || latestGap?.careerGoal || 'Full Stack Developer';
  const matchScore = latestGap?.matchPercentage || 75;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Header with Profile Completion Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Career Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hello, {profile?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Target Career Goal:{' '}
              <strong className="text-slate-800 font-bold">{targetRole}</strong>. Here is your personalized roadmap and opportunity match.
            </p>
          </div>

          {/* Profile Completion Bar */}
          <div className="w-full md:w-72 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700">Profile Readiness</span>
              <span className="text-emerald-600 font-extrabold">{completion}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            {completion < 100 && (
              <Link
                to="/student/profile"
                className="mt-2 text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Add resume & skills to reach 100%</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Guided 3-Step Setup (For smooth onboarding) */}
      {completion < 85 && (
        <div className="bg-gradient-to-r from-indigo-50/70 via-brand-50/50 to-emerald-50/50 rounded-3xl p-6 border border-brand-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Quick 3-Step Onboarding Guide
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border transition ${
              completion >= 50 ? 'bg-white/80 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Step 1: Profile</span>
                {completion >= 50 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">Pending</span>}
              </div>
              <p className="text-[11px] text-slate-500">Upload resume and specify your technical skills.</p>
            </div>

            <div className={`p-3.5 rounded-2xl border transition ${
              profile?.target_career_role ? 'bg-white/80 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Step 2: Career Goal</span>
                {profile?.target_career_role ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">Pending</span>}
              </div>
              <p className="text-[11px] text-slate-500">Choose your desired target role in industry.</p>
            </div>

            <div className={`p-3.5 rounded-2xl border transition ${
              latestGap ? 'bg-white/80 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Step 3: Skill Gap</span>
                {latestGap ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">Pending</span>}
              </div>
              <p className="text-[11px] text-slate-500">See matched vs missing skills and roadmap.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. The 4 Large Main Hub Action Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Core Action Hub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Analyze Skills */}
          <Link
            to="/student/skill-gap"
            className="p-6 bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Analyze My Skills
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Compare your skills with {targetRole} benchmark. Currently at {matchScore}% readiness.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600">
              <span>View Gap Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Skill Assessment (with Quick-Start Preferred Tests) */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200 transition flex items-center gap-1"
                title="Configure language/skill preferences"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Preferences</span>
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Skill Assessment
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Take standardized timed tests to earn verified credentials.
              </p>

              {/* Direct Quick-Start Assessment Buttons */}
              {profile?.skill_preferences && profile.skill_preferences.length > 0 ? (
                <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick-Start Tests:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {profile.skill_preferences.slice(0, 2).map((pref) => {
                      const levelMap = {
                        Beginner: 'basic',
                        Intermediate: 'intermediate',
                        Advanced: 'hard'
                      };
                      const startLevel = levelMap[pref.selfRating] || 'basic';
                      return (
                        <Link
                          key={pref.skillId}
                          to={`/student/assessment/${pref.skillId}/${startLevel}`}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-between border border-indigo-200/70 transition group"
                        >
                          <span className="capitalize">Take {pref.skillId} Test</span>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-indigo-600 border border-indigo-100 font-extrabold group-hover:bg-indigo-600 group-hover:text-white transition">
                            {pref.selfRating || 'Start'}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <Link to="/student/assessment" className="hover:underline flex items-center gap-1">
                <span>View All Tests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Certificates */}
          <Link
            to="/student/certificates"
            className="p-6 bg-white rounded-3xl border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition">
                My Certificates
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Upload credentials to generate instant QR codes and get tamper-evident admin verification.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-brand-600">
              <span>Manage Credentials</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Find Jobs */}
          <Link
            to="/student/jobs"
            className="p-6 bg-white rounded-3xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
                Find Jobs & Internships
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Explore openings matched to your profile with automated match scores and 1-click apply.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-sky-600">
              <span>Explore Listings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Roadmap */}
          <Link
            to="/student/roadmap"
            className="p-6 bg-white rounded-3xl border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                My Career Roadmap
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Track your step-by-step 5-phase career progression from current baseline to placement-ready.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-purple-600">
              <span>Track Milestones</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. "Recommended For You" Strip (Jobs & Courses based on Skill Gap) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Jobs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recommended Jobs & Internships</h3>
              <p className="text-xs text-slate-400">Ranked by your profile skill match</p>
            </div>
            <Link to="/student/jobs" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active jobs found right now.
              </div>
            ) : (
              recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate('/student/jobs')}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{job.company_name} • {job.location}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                        {job.type}
                      </span>
                      {job.is_remote ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                          Remote
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      {job.matchScore || 85}% Match
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Courses to bridge gaps */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Bridge Your Missing Skills</h3>
              <p className="text-xs text-slate-400">Curated external courses from NPTEL & Coursera</p>
            </div>
            <Link to="/student/courses" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Explore catalog →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedCourses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Run an AI skill gap analysis to get targeted course recommendations!
              </div>
            ) : (
              recommendedCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                      {course.provider} • {course.skill}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {course.duration} • ★ {course.rating}
                    </p>
                  </div>

                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition flex-shrink-0"
                    title="Open provider link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Preferences Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleCloseOnboarding}
        onCompleted={handleOnboardingComplete}
        currentRole={targetRole}
        existingPreferences={profile?.skill_preferences || []}
      />
    </div>
  );
};
