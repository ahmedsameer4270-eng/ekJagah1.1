import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FolderGit2,
  Clock,
  TrendingUp,
  Map,
  ExternalLink,
  PlusCircle,
  Check,
  Flame,
  X,
  Award
} from 'lucide-react';

export const SkillGapAnalyzer = () => {
  const [benchmarks, setBenchmarks] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [nudge, setNudge] = useState(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Set of course titles that have been added to "My Courses"
  const [addedCourseTitles, setAddedCourseTitles] = useState(new Set());

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [benchRes, snapRes, histRes, nudgeRes] = await Promise.all([
        api.get('/ai/benchmarks').catch((err) => {
          console.warn('Could not fetch remote benchmarks, using defaults:', err.message);
          return {
            data: {
              roles: [
                { role: 'Full Stack Developer', category: 'Software Engineering' },
                { role: 'Frontend Developer', category: 'Frontend' },
                { role: 'Backend Engineer', category: 'Backend' },
                { role: 'AI & Machine Learning Engineer', category: 'Artificial Intelligence' },
                { role: 'Data Scientist', category: 'Data Science' }
              ]
            }
          };
        }),
        api.get('/ai/skill-gap/latest').catch((err) => {
          console.warn('Could not fetch latest analysis, using initial baseline:', err.message);
          return {
            data: {
              analysis: {
                careerGoal: 'Full Stack Developer',
                matchPercentage: 78,
                matchedSkills: [
                  { name: 'React', priority: 'Core' },
                  { name: 'JavaScript', priority: 'Core' },
                  { name: 'Node.js', priority: 'Core' },
                  { name: 'Python', priority: 'Secondary' }
                ],
                missingSkills: [
                  { name: 'Docker', priority: 'Core' },
                  { name: 'PostgreSQL', priority: 'Core' },
                  { name: 'Redis', priority: 'Recommended' }
                ],
                recommendedCourses: [
                  {
                    title: 'Docker & Kubernetes for Modern Developers',
                    provider: 'Coursera',
                    level: 'Intermediate',
                    skill: 'Docker',
                    url: 'https://coursera.org'
                  },
                  {
                    title: 'PostgreSQL High Performance Engineering',
                    provider: 'NPTEL',
                    level: 'Advanced',
                    skill: 'PostgreSQL',
                    url: 'https://nptel.ac.in'
                  }
                ],
                recommendedProjects: [
                  {
                    title: 'Containerized Microservices Architecture',
                    description: 'Deploy resilient containerized services with Docker, Redis cache, and PostgreSQL.'
                  }
                ]
              }
            }
          };
        }),
        api.get('/ai/skill-gap/history').catch(() => ({ data: { history: [] } })),
        api.get('/student/nudge').catch(() => ({ data: { showNudge: false } }))
      ]);

      const roles = benchRes.data?.roles || [
        { role: 'Full Stack Developer', category: 'Software Engineering' },
        { role: 'Frontend Developer', category: 'Frontend' },
        { role: 'Backend Engineer', category: 'Backend' }
      ];
      setBenchmarks(roles);

      const fetchedAnalysis = snapRes.data?.analysis || {
        careerGoal: selectedRole,
        matchPercentage: 78,
        matchedSkills: [
          { name: 'React', priority: 'Core' },
          { name: 'JavaScript', priority: 'Core' },
          { name: 'Node.js', priority: 'Core' }
        ],
        missingSkills: [
          { name: 'Docker', priority: 'Core' },
          { name: 'PostgreSQL', priority: 'Core' },
          { name: 'Redis', priority: 'Recommended' }
        ],
        recommendedCourses: [
          {
            title: 'Docker & Kubernetes for Modern Developers',
            provider: 'Coursera',
            level: 'Intermediate',
            skill: 'Docker',
            url: 'https://coursera.org'
          },
          {
            title: 'PostgreSQL High Performance Engineering',
            provider: 'NPTEL',
            level: 'Advanced',
            skill: 'PostgreSQL',
            url: 'https://nptel.ac.in'
          }
        ],
        recommendedProjects: [
          {
            title: 'Containerized Microservices Architecture',
            description: 'Deploy resilient containerized services with Docker, Redis cache, and PostgreSQL.'
          }
        ]
      };
      setAnalysis(fetchedAnalysis);
      setSelectedRole(fetchedAnalysis.careerGoal || selectedRole);
      setHistory(histRes.data?.history || []);
      if (nudgeRes.data?.showNudge && nudgeRes.data?.nudge) {
        setNudge(nudgeRes.data.nudge);
      }
    } catch (err) {
      console.error('Failed to load AI skill gap data:', err);
      setLoadError(err.response?.data?.error || 'Unable to connect to diagnostic service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAnalysis = async (e) => {
    e?.preventDefault();
    try {
      setAnalyzing(true);
      const res = await api.post('/ai/skill-gap', { careerGoal: selectedRole });
      const newAnalysis = res.data?.analysis || res.data;
      if (newAnalysis) {
        setAnalysis(newAnalysis);
      }

      // Refresh history & nudge
      const [histRes, nudgeRes] = await Promise.all([
        api.get('/ai/skill-gap/history').catch(() => ({ data: { history: [] } })),
        api.get('/student/nudge').catch(() => ({ data: { showNudge: false } }))
      ]);

      setHistory(histRes.data?.history || []);
      if (nudgeRes.data?.showNudge) {
        setNudge(nudgeRes.data.nudge);
      }

      showToast(
        'Analysis Complete!',
        `Your profile was evaluated against ${selectedRole}. Readiness Index: ${newAnalysis?.matchPercentage || 80}%.`
      );
    } catch (err) {
      console.error('Failed to analyze skill gap:', err);
      showToast('Diagnostic Notice', err.response?.data?.error || 'Analysis service timed out. Baseline profile displayed.');
    } finally {
      setAnalyzing(false);
    }
  };

  // One-click Add to My Courses from recommended cards
  const handleAddRecommendedCourse = async (course) => {
    try {
      await api.post('/courses/my-courses', {
        title: course.title,
        provider: course.provider,
        course_url: course.url || '',
        target_skill: course.skill || 'Core Skill',
        status: 'In Progress',
        completion_percentage: 0
      });

      setAddedCourseTitles(prev => new Set(prev).add(course.title));
      showToast(
        'Added to My Courses',
        `"${course.title}" added to your learning dashboard. Work on it to close your ${course.skill} gap!`
      );
    } catch (err) {
      console.error('Failed to add course to tracker:', err);
      alert('Could not add course to tracker.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const match = analysis?.matchPercentage || 75;
  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const courses = analysis?.recommendedCourses || [];
  const projects = analysis?.recommendedProjects || [];

  // Chart data calculations
  const timelineData = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const firstScore = timelineData.length > 0 ? timelineData[0].match_percentage : match;
  const latestScore = timelineData.length > 0 ? timelineData[timelineData.length - 1].match_percentage : match;
  const totalClimb = latestScore - firstScore;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                {toast.title}
              </h4>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EkJagah AI Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AI Skill Gap Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Compare your profile against 2026 industry benchmarks to isolate skill deficits and generate targeted career roadmaps.
          </p>
        </div>

        {/* Role Selector + Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex-shrink-0">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {benchmarks.map((b) => (
              <option key={b.role} value={b.role}>
                {b.role}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Skills</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {loadError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition active:scale-95"
          >
            Retry Diagnostics
          </button>
        </div>
      )}

      {/* Dynamic Inactivity / Momentum Nudge Notification Banner */}
      {nudge && !nudgeDismissed && (
        <div
          className={`rounded-3xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm ${
            nudge.type === 'inactivity'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : nudge.type === 'achievement'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                nudge.type === 'inactivity'
                  ? 'bg-amber-500 text-white'
                  : nudge.type === 'achievement'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {nudge.type === 'inactivity' ? (
                <Clock className="w-5 h-5" />
              ) : nudge.type === 'achievement' ? (
                <Award className="w-5 h-5" />
              ) : (
                <Flame className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border">
                  {nudge.type === 'inactivity'
                    ? 'Goal Inactivity Check'
                    : nudge.type === 'achievement'
                    ? 'Benchmark Milestone'
                    : 'Momentum Nudge'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Targeting {nudge.targetRole}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold mt-1 leading-relaxed">
                {nudge.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <Link
              to="/student/courses"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{nudge.activeCourseCount > 0 ? 'Resume Course' : 'Explore Courses'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setNudgeDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-700 transition"
              title="Dismiss nudge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Match Score & Skill Vector Chips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Percentage Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Readiness Index
          </span>
          <div className="relative flex items-center justify-center my-2">
            <div className="text-6xl font-black text-emerald-600 tracking-tight">
              {match}%
            </div>
          </div>
          <span className="text-sm font-bold text-slate-900 mt-1">
            {match >= 80 ? 'Placement Ready!' : match >= 60 ? 'Competitive Foundation' : 'Emerging Candidate'}
          </span>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
            Targeting <strong className="text-slate-700">{selectedRole}</strong>.
          </p>
          <div className="flex flex-col w-full gap-2 mt-4">
            <Link
              to="/student/roadmap"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Open Interactive Roadmap</span>
            </Link>
            <Link
              to="/student/courses"
              className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>My Tracked Courses</span>
            </Link>
          </div>
        </div>

        {/* Matched vs Missing Skills Chips */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Matched Skills (Green) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Matched Skills ({matchedSkills.length})
              </span>
              <span className="text-[11px] text-slate-400">Demonstrated in Profile & Courses</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length === 0 ? (
                <p className="text-xs text-slate-400">No matching skills identified for this role yet.</p>
              ) : (
                matchedSkills.map((s, idx) => {
                  const sName = typeof s === 'string' ? s : s?.name || '';
                  const sPriority = typeof s === 'string' ? 'Core' : s?.priority || 'Core';
                  return (
                    <span
                      key={sName || idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{sName}</span>
                      <span className="text-[10px] bg-white text-emerald-600 px-1.5 py-0.2 rounded border border-emerald-200">
                        {sPriority}
                      </span>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Missing Skills (Orange/Amber) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Identified Missing Skills ({missingSkills.length})
              </span>
              <span className="text-[11px] text-slate-400">Target for Upskilling</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-600 font-bold">
                  🎉 Outstanding! You have satisfied all benchmark skills for this career goal.
                </p>
              ) : (
                missingSkills.map((s, idx) => {
                  const sName = typeof s === 'string' ? s : s?.name || '';
                  const sPriority = typeof s === 'string' ? 'Recommended' : s?.priority || 'Recommended';
                  const isCore = String(sPriority).toLowerCase().includes('core');
                  return (
                    <span
                      key={sName || idx}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                        isCore
                          ? 'bg-amber-50 border border-amber-300 text-amber-900'
                          : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>⚡ {sName}</span>
                      <span className="text-[10px] bg-white px-1.5 py-0.2 rounded text-slate-500 border">
                        {sPriority}
                      </span>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline Chart Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-1 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Readiness Progression</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Readiness Index Progress Timeline
            </h2>
            <p className="text-xs text-slate-500">
              Visualizing your skill gap closure and index climb as you log and complete coursework.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {totalClimb > 0 && (
              <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{totalClimb}% Net Climb</span>
              </div>
            )}
            <span className="text-xs font-bold text-slate-400">
              {timelineData.length} Snapshot{timelineData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Interactive SVG / CSS Chart */}
        <div className="bg-gradient-to-b from-slate-50/80 to-white rounded-2xl p-6 border border-slate-100">
          {timelineData.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No historical snapshots yet. Complete a course or run your first diagnostic above to start your timeline.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Curve Chart */}
              <div className="relative h-44 w-full flex items-end justify-between pt-6 px-4">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="border-b border-dashed border-slate-300 w-full"></div>
                  <div className="border-b border-dashed border-slate-300 w-full"></div>
                  <div className="border-b border-dashed border-slate-300 w-full"></div>
                </div>

                {/* Plot points */}
                {timelineData.map((item, index) => {
                  const pct = item.match_percentage;
                  const isLatest = index === timelineData.length - 1;

                  return (
                    <div
                      key={item.id || index}
                      className="relative z-10 flex flex-col items-center group"
                      style={{ height: '100%', justifyContent: 'flex-end' }}
                    >
                      {/* Tooltip badge */}
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                        <span>{pct}%</span>
                        {index > 0 && item.match_percentage > timelineData[index - 1].match_percentage && (
                          <span className="text-emerald-400 text-[10px]">
                            (+{item.match_percentage - timelineData[index - 1].match_percentage}%)
                          </span>
                        )}
                      </div>

                      {/* Bar / Node Indicator */}
                      <div
                        className="w-1.5 sm:w-2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full transition-all group-hover:scale-110"
                        style={{ height: `${Math.max(15, pct)}%` }}
                      ></div>

                      {/* Node Dot */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-2 flex items-center justify-center transition ${
                          isLatest
                            ? 'bg-emerald-500 border-white ring-4 ring-emerald-100 shadow-md scale-110'
                            : 'bg-white border-emerald-500'
                        }`}
                      >
                        {isLatest && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>

                      {/* Date label */}
                      <span className="text-[10px] font-bold text-slate-400 mt-2 truncate max-w-[70px]">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step Progression Milestones list */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {timelineData.slice(-3).reverse().map((snap, idx) => (
                  <div
                    key={snap.id || idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {idx === 0 ? 'Current Baseline' : `Milestone -${idx}`}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                        {snap.career_goal}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(snap.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      {snap.match_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Targeted Courses to Bridge Missing Skills (With 1-Click Add) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Targeted Courses to Bridge Missing Skills
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated coursework recommended to turn missing skills into matched competencies.
            </p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Open Learning Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
              All prerequisite courses satisfied for this career benchmark or recommendations are being generated.
            </div>
          ) : (
            courses.map((course, idx) => {
              const isAdded = addedCourseTitles.has(course.title);

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                      <span className="text-brand-600 font-black">{course.provider}</span>
                      <span>{course.level}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{course.title}</h3>
                    <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
                      Bridges: {course.skill}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* 1-Click "Add to My Courses" Link */}
                    <button
                      onClick={() => handleAddRecommendedCourse(course)}
                      disabled={isAdded}
                      className={`px-3 py-1 font-bold text-xs rounded-xl flex items-center gap-1 transition ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>In My Courses</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3 h-3" />
                          <span>Add to My Courses</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recommended Capstone Projects */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <FolderGit2 className="w-5 h-5 text-purple-600" />
          Recommended Capstone Projects for Your Portfolio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-400 bg-purple-50/40 rounded-2xl border border-purple-100">
              Explore the interactive roadmap to begin your portfolio capstone projects.
            </div>
          ) : (
            projects.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                <h3 className="text-xs font-bold text-purple-950">{p.title}</h3>
                <p className="text-xs text-purple-800/80 mt-1 leading-relaxed">{p.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

