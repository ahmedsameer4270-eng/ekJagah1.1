import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  ClipboardCheck,
  Search,
  Clock,
  HelpCircle,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Code,
  FileCode,
  Atom,
  Database,
  Cpu,
  Coffee,
  Terminal,
  Hash,
  Shield,
  History,
  X,
  Sparkles,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

const iconMap = {
  Code,
  FileCode,
  Atom,
  Database,
  Cpu,
  Coffee,
  Terminal,
  Hash
};

export const AssessmentSelection = () => {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'progress' | 'history'

  // Difficulty selection modal state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [difficulty, setDifficulty] = useState('basic');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [skillsRes, histRes, profRes] = await Promise.all([
        api.get('/assessment/skills'),
        api.get('/assessment/history'),
        api.get('/student/profile')
      ]);
      setSkills(skillsRes.data.skills || []);
      setHistory(histRes.data.history || []);
      setPreferences(profRes.data.profile?.skill_preferences || []);
      setVerifiedSkills(profRes.data.profile?.verified_skills || []);
    } catch (err) {
      console.error('Failed to load assessment data:', err);
      setError('Unable to load assessment catalog. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(skills.map((s) => s.category))];

  // Preferred skills surfaced first
  const preferredSkillIds = preferences.map((p) => p.skillId);

  const filteredSkills = [...skills]
    .sort((a, b) => {
      const aPref = preferredSkillIds.includes(a.id);
      const bPref = preferredSkillIds.includes(b.id);
      if (aPref && !bPref) return -1;
      if (!aPref && bPref) return 1;
      return 0;
    })
    .filter((skill) => {
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const passedCount = skills.filter((s) => s.hasPassed).length;
  const attemptsCount = history.length;
  const avgScore =
    attemptsCount > 0
      ? Math.round(history.reduce((acc, h) => acc + (h.percentage || 0), 0) / attemptsCount)
      : 0;

  const handleOpenModal = (skill, overrideLevel) => {
    setSelectedSkill(skill);
    if (overrideLevel) {
      setDifficulty(overrideLevel);
      return;
    }
    const pref = preferences.find((p) => p.skillId === skill.id);
    if (pref) {
      if (pref.selfRating === 'Advanced') setDifficulty('hard');
      else if (pref.selfRating === 'Intermediate') setDifficulty('intermediate');
      else setDifficulty('basic');
    } else {
      setDifficulty('basic');
    }
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  const handleStartTest = () => {
    if (!selectedSkill) return;
    navigate(`/student/assessment/${selectedSkill.id}/${difficulty}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Standardized Technical Benchmarks</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Skill Assessments & Certification
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 mt-2 leading-relaxed">
            Validate your proficiency with 15-minute standardized timed MCQ examinations.
            Passing an assessment grants a <strong className="text-white">Verified Skill badge</strong> on
            your profile and automatically boosts your <strong className="text-amber-300">AI Readiness Index</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-left">
            <div>
              <span className="text-xs text-indigo-200">Catalog Skills</span>
              <p className="text-xl sm:text-2xl font-black text-white">{skills.length}</p>
            </div>
            <div>
              <span className="text-xs text-indigo-200">Verified Skills</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">{passedCount}</p>
            </div>
            <div>
              <span className="text-xs text-indigo-200">Total Attempts</span>
              <p className="text-xl sm:text-2xl font-black text-white">{attemptsCount}</p>
            </div>
            <div>
              <span className="text-xs text-indigo-200">Avg. Score</span>
              <p className="text-xl sm:text-2xl font-black text-amber-300">{avgScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabs: Catalog vs History */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-3 text-sm font-bold transition relative ${
              activeTab === 'skills'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span>Available Assessments</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {skills.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 text-sm font-bold transition relative ${
              activeTab === 'progress'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>My Progress</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                {verifiedSkills.length} Verified
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold transition relative ${
              activeTab === 'history'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>My Assessment History</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {history.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Tab Content: Skills Catalog */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill name or topic (e.g. Python, React, SQL)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-slate-500">Loading skill assessments...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grid of Skill Cards */}
          {!loading && !error && filteredSkills.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No assessments matched your query</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the search or category filter.</p>
            </div>
          )}

          {!loading && !error && filteredSkills.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSkills.map((skill) => {
                const IconComponent = iconMap[skill.icon] || Code;
                const hasPassed = skill.hasPassed;
                const bestScore = skill.bestScore;
                const preferredInfo = preferences.find((p) => p.skillId === skill.id);

                return (
                  <div
                    key={skill.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top corner status badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {preferredInfo && (
                        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{preferredInfo.selfRating}</span>
                        </div>
                      )}
                      {hasPassed && (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>VERIFIED</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Skill Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {preferredInfo && (
                        <div className="mb-1">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                            Recommended for you
                          </span>
                        </div>
                      )}

                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {skill.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-indigo-600 transition">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>

                      {/* Specs Row */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{skill.question_count || 15} Qs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{skill.time_limit_minutes || 15} Mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-slate-400" />
                          <span>60% Pass</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA / Best Score */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="text-slate-400 font-medium text-[11px]">Best Score:</span>
                        {bestScore !== null ? (
                          <span
                            className={`font-extrabold text-xs px-2 py-0.5 rounded-full ${
                              hasPassed
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {bestScore}% {hasPassed ? '• Passed' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not Attempted</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenModal(skill)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                          hasPassed
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <span>{hasPassed ? 'Retake Assessment' : 'Start Assessment'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Progress */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Skill Mastery & Verification Progress</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your milestone progression across all 8 technical disciplines from Basic to Expert.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {verifiedSkills.length} of {skills.length} Skills Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => {
              const IconComponent = iconMap[skill.icon] || Code;
              const verifiedItem = verifiedSkills.find(
                (v) => v.skillId?.toLowerCase() === skill.id.toLowerCase() || v.skillName?.toLowerCase() === skill.name.toLowerCase()
              );
              const isVerified = Boolean(verifiedItem);
              const bestScore = skill.bestScore;
              const skillAttempts = history.filter((h) => h.skillId === skill.id);

              // Determine next recommended tier
              let nextTier = 'basic';
              let nextTierLabel = 'Basic Tier (Competent)';
              let nextTierDesc = 'Start with the fundamentals benchmark (60% pass mark).';

              if (verifiedItem) {
                const curLevel = verifiedItem.level?.toLowerCase();
                if (curLevel === 'basic') {
                  nextTier = 'intermediate';
                  nextTierLabel = 'Intermediate Tier (Proficient)';
                  nextTierDesc = 'You earned Competent! Ready for OOP, async flows & design patterns (65% pass).';
                } else if (curLevel === 'intermediate') {
                  nextTier = 'hard';
                  nextTierLabel = 'Hard Tier (Expert)';
                  nextTierDesc = 'You earned Proficient! Ready for concurrency, memory & architecture benchmarks (70% pass).';
                } else {
                  nextTier = 'hard';
                  nextTierLabel = 'Mastery Achieved (Expert)';
                  nextTierDesc = 'You have achieved top-tier certification in this skill!';
                }
              }

              return (
                <div
                  key={skill.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{skill.name}</h4>
                        <span className="text-[11px] text-slate-500">{skill.category}</span>
                      </div>
                    </div>

                    {isVerified ? (
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{verifiedItem.verdict || 'VERIFIED'}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Not Verified
                      </span>
                    )}
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Best Score</span>
                      <p className={`text-xs font-black ${bestScore !== null ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {bestScore !== null ? `${bestScore}%` : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Verified Level</span>
                      <p className="text-xs font-black text-slate-700 capitalize">
                        {verifiedItem?.level || 'None'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Attempts</span>
                      <p className="text-xs font-black text-slate-700">
                        {skillAttempts.length}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation Callout */}
                  <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/70 text-xs">
                    <span className="font-extrabold text-indigo-900 block text-[11px] uppercase tracking-wider mb-0.5">
                      Next Step: {nextTierLabel}
                    </span>
                    <p className="text-indigo-950/80 text-[11px] leading-relaxed">
                      {nextTierDesc}
                    </p>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    onClick={() => handleOpenModal(skill, nextTier)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{isVerified && verifiedItem.level === 'hard' ? 'Retake Hard Tier' : `Take ${nextTier.toUpperCase()} Test`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tab Content: Assessment History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No Assessment Attempts Yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Take your first timed test to benchmark your knowledge and earn verified badges.
              </p>
              <button
                onClick={() => setActiveTab('skills')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                Browse Assessments
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-6">Skill</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {history.map((h) => {
                      const isPassed = Boolean(h.passed);
                      const isExpert = h.verdict?.toLowerCase() === 'expert';
                      const isProficient = h.verdict?.toLowerCase() === 'proficient';

                      return (
                        <tr key={h.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                            {h.skillName}
                          </td>
                          <td className="py-3.5 px-4 capitalize font-semibold text-slate-600">
                            {h.level}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {h.score} / {h.totalQuestions}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-black ${
                                isPassed ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {h.percentage}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                isExpert
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : isProficient
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : isPassed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {h.verdict}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <Link
                              to={`/student/assessment/${h.skillId}/results/${h.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                            >
                              <span>View Report</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Difficulty Selection Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-scale-up">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold mb-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Configure Test Session</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedSkill.name} Assessment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred difficulty tier to begin the standardized examination.
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select Difficulty Level:
              </label>

              {/* Basic */}
              <div
                onClick={() => setDifficulty('basic')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  difficulty === 'basic'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    difficulty === 'basic' ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {difficulty === 'basic' && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Basic Tier</h4>
                    <p className="text-[11px] text-slate-500">Syntax, control flow, functions & fundamental patterns</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Pass: 60%
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Competent</span>
                </div>
              </div>

              {/* Intermediate */}
              <div
                onClick={() => setDifficulty('intermediate')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  difficulty === 'intermediate'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    difficulty === 'intermediate' ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {difficulty === 'intermediate' && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Intermediate Tier</h4>
                    <p className="text-[11px] text-slate-500">OOP, asynchronous flows, memory model & best practices</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Pass: 65%
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Proficient</span>
                </div>
              </div>

              {/* Hard */}
              <div
                onClick={() => setDifficulty('hard')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  difficulty === 'hard'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    difficulty === 'hard' ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {difficulty === 'hard' && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Hard Tier</h4>
                    <p className="text-[11px] text-slate-500">Concurrency, architecture, internals & complex problem solving</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Pass: 70%
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Expert</span>
                </div>
              </div>
            </div>

            {/* Assessment Rules Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>15 Minutes Duration • 15 MCQ Questions</span>
              </div>
              <p className="text-slate-500 leading-normal">
                • Auto-submits when timer reaches 00:00.
                <br />
                • Anti-cheat tracking: tab switching is monitored and logged in your report.
                <br />
                • Passing updates your Verified Skills & AI Career Readiness instantly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartTest}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Begin Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
