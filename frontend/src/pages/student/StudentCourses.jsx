import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  BookOpen,
  Search,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Star,
  Clock,
  Trash2,
  Check,
  X,
  ArrowRight,
  CheckSquare
} from 'lucide-react';

export const StudentCourses = () => {
  const [activeTab, setActiveTab] = useState('my-courses'); // 'my-courses' | 'catalog'
  const [myCourses, setMyCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [basedOnSkills, setBasedOnSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Catalog
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');
  const [level, setLevel] = useState('');
  const [isFree, setIsFree] = useState('');

  // Add Course Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    provider: 'Coursera',
    customProvider: '',
    course_url: '',
    target_skill: '',
    status: 'In Progress',
    completion_percentage: 25
  });
  const [addingCourse, setAddingCourse] = useState(false);

  // Self-Check Modal state
  const [selfCheckCourse, setSelfCheckCourse] = useState(null);
  const [selfCheckAnswers, setSelfCheckAnswers] = useState({
    concepts: false,
    practical: false,
    tradeoffs: false
  });
  const [submittingSelfCheck, setSubmittingSelfCheck] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Track added catalog course IDs for instant UI feedback
  const [addedCourseIds, setAddedCourseIds] = useState(new Set());

  const showToast = (title, message, prevScore = null, newScore = null) => {
    setToast({ title, message, prevScore, newScore });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses/my-courses');
      setMyCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load tracked courses:', err);
    }
  };

  const fetchCatalogAndRecommendations = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (skill) params.append('skill', skill);
      if (provider) params.append('provider', provider);
      if (level) params.append('level', level);
      if (isFree !== '') params.append('isFree', isFree);

      const [courseRes, recRes] = await Promise.all([
        api.get(`/courses?${params.toString()}`),
        api.get('/courses/recommended')
      ]);

      setCatalogCourses(courseRes.data.courses || []);
      setRecommended(recRes.data.courses || []);
      setBasedOnSkills(recRes.data.basedOnSkills || []);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchMyCourses(), fetchCatalogAndRecommendations()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    fetchCatalogAndRecommendations();
  }, [provider, level, isFree]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalogAndRecommendations();
  };

  // Add custom course submit
  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.title || !addForm.target_skill) return;

    try {
      setAddingCourse(true);
      const chosenProvider = addForm.provider === 'Other' ? (addForm.customProvider || 'External') : addForm.provider;

      const payload = {
        title: addForm.title,
        provider: chosenProvider,
        course_url: addForm.course_url,
        target_skill: addForm.target_skill,
        status: addForm.status,
        completion_percentage: addForm.status === 'Completed' ? 100 : addForm.completion_percentage
      };

      const res = await api.post('/courses/my-courses', payload);
      await fetchMyCourses();
      setIsAddModalOpen(false);
      setAddForm({
        title: '',
        provider: 'Coursera',
        customProvider: '',
        course_url: '',
        target_skill: '',
        status: 'In Progress',
        completion_percentage: 25
      });

      if (res.data.recalculation) {
        const { previousScore, newScore } = res.data.recalculation;
        showToast(
          'Readiness Index Updated!',
          `Course marked completed. Your target skill "${payload.target_skill}" has moved to Matched!`,
          previousScore,
          newScore
        );
      } else {
        showToast('Course Added', `"${payload.title}" is now tracked in My Courses!`);
      }
    } catch (err) {
      console.error('Failed to add course:', err);
      alert(err.response?.data?.error || 'Failed to add course.');
    } finally {
      setAddingCourse(false);
    }
  };

  // 1-Click Quick Add from Recommended / Catalog
  const handleQuickAdd = async (course) => {
    try {
      const payload = {
        title: course.title,
        provider: course.provider,
        course_url: course.course_url || course.url || '',
        target_skill: course.recommendedForSkill || course.skill || 'Software Engineering',
        status: 'In Progress',
        completion_percentage: 0
      };

      await api.post('/courses/my-courses', payload);
      setAddedCourseIds(prev => new Set(prev).add(course.id || course.title));
      await fetchMyCourses();
      showToast('Added to My Courses', `"${course.title}" added to your tracking list.`);
    } catch (err) {
      console.error('Failed to quick add course:', err);
    }
  };

  // Quick slider update for tracked course
  const handleUpdatePercentage = async (course, newPercentage) => {
    try {
      const isComplete = newPercentage >= 100;
      if (isComplete) {
        setSelfCheckCourse(course);
        setSelfCheckAnswers({ concepts: false, practical: false, tradeoffs: false });
        return;
      }

      await api.put(`/courses/my-courses/${course.id}`, {
        completion_percentage: newPercentage,
        status: 'In Progress'
      });

      setMyCourses(prev =>
        prev.map(c => (c.id === course.id ? { ...c, completion_percentage: newPercentage } : c))
      );
    } catch (err) {
      console.error('Failed to update course progress:', err);
    }
  };

  // Open self-check modal
  const handleOpenSelfCheck = (course) => {
    setSelfCheckCourse(course);
    setSelfCheckAnswers({ concepts: false, practical: false, tradeoffs: false });
  };

  // Submit Self-Check Verification
  const handleSubmitSelfCheck = async (e) => {
    e.preventDefault();
    if (!selfCheckCourse) return;

    try {
      setSubmittingSelfCheck(true);
      const res = await api.post(`/courses/my-courses/${selfCheckCourse.id}/self-check`, {
        answers: selfCheckAnswers
      });

      await fetchMyCourses();
      setSelfCheckCourse(null);

      if (res.data.recalculation) {
        const { previousScore, newScore } = res.data.recalculation;
        showToast(
          'Readiness Index Updated!',
          `Self-check verified! Skill "${selfCheckCourse.target_skill}" has moved to Matched Skills.`,
          previousScore,
          newScore
        );
      } else {
        showToast('Self-Check Verified!', `"${selfCheckCourse.title}" marked Completed.`);
      }
    } catch (err) {
      console.error('Failed to submit self-check:', err);
      alert('Failed to verify self-check.');
    } finally {
      setSubmittingSelfCheck(false);
    }
  };

  // Delete Tracked Course
  const handleDeleteMyCourse = async (id) => {
    if (!window.confirm('Remove this course from your tracking list?')) return;
    try {
      await api.delete(`/courses/my-courses/${id}`);
      setMyCourses(prev => prev.filter(c => c.id !== id));
      showToast('Course Removed', 'Course removed from your tracking list.');
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const completedCount = myCourses.filter(c => c.status === 'Completed').length;
  const inProgressCount = myCourses.filter(c => c.status === 'In Progress').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Floating Live Toast Notification */}
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
            {toast.prevScore !== null && toast.newScore !== null && (
              <div className="mt-2.5 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400">Readiness:</span>
                <span className="text-xs font-black text-slate-300 line-through">
                  {toast.prevScore}%
                </span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-black text-emerald-400">
                  {toast.newScore}%
                </span>
                <Link
                  to="/student/skill-gap"
                  className="ml-auto text-[11px] font-bold text-brand-400 hover:underline"
                >
                  View Gap →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full mb-3 border border-brand-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>EkJagah Learning Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Courses & Skill Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Track your external coursework, self-verify competencies to auto-update your Readiness Index, or explore curated upskilling tracks.
          </p>
        </div>

        {/* Action Button: + Add Course */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Course</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`pb-2 text-xs font-black uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'my-courses'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>My Tracked Courses</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'my-courses'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {myCourses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2 text-xs font-black uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>Explore Catalog</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'catalog'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {catalogCourses.length}
            </span>
          </button>
        </div>

        {/* Quick Summary Pill for Student */}
        {activeTab === 'my-courses' && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {inProgressCount} in progress
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {completedCount} completed
            </span>
          </div>
        )}
      </div>

      {/* TAB 1: MY TRACKED COURSES */}
      {activeTab === 'my-courses' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : myCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No courses logged yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Log any online course you're taking (Coursera, Udemy, YouTube, NPTEL) or enroll from our catalog to track progress and automatically boost your Readiness Index!
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Log a Course</span>
                </button>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Browse Catalog
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCourses.map((course) => {
                const isDone = course.status === 'Completed';
                const pct = course.completion_percentage || 0;

                return (
                  <div
                    key={course.id}
                    className={`bg-white rounded-3xl p-6 border transition shadow-sm flex flex-col justify-between ${
                      isDone
                        ? 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50/20 to-white'
                        : 'border-slate-200/80 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {course.provider}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>In Progress</span>
                              </>
                            )}
                          </span>

                          <button
                            onClick={() => handleDeleteMyCourse(course.id)}
                            className="text-slate-300 hover:text-rose-500 transition p-1"
                            title="Remove Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {course.title}
                      </h3>

                      {/* Target Skill Chip */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <span>Target Skill:</span>
                          <strong>{course.target_skill}</strong>
                        </span>

                        {course.course_url && (
                          <a
                            href={course.course_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Progress Bar & Slider */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500">Progress</span>
                          <span className={isDone ? 'text-emerald-600' : 'text-slate-900'}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isDone ? 'bg-emerald-500' : 'bg-brand-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Interactive adjustment buttons for in-progress */}
                        {!isDone && (
                          <div className="pt-2 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Quick adjust:</span>
                            <div className="flex items-center gap-1.5">
                              {[25, 50, 75].map((val) => (
                                <button
                                  key={val}
                                  onClick={() => handleUpdatePercentage(course, val)}
                                  className={`px-2 py-0.5 rounded-md font-semibold border transition ${
                                    pct === val
                                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {val}%
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {isDone ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Skill Verified & Matched</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenSelfCheck(course)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Mark as Completed (Self-Check)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGGREGATED CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-8">
          {/* Recommended for Skill Gap Section */}
          {recommended.length > 0 && (
            <div className="bg-gradient-to-r from-brand-50/70 via-indigo-50/50 to-purple-50/70 rounded-3xl p-6 border border-brand-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    Recommended for Your Skill Gap
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Targeting missing skills: {basedOnSkills.join(', ') || 'Core concepts'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommended.slice(0, 3).map((c) => {
                  const isAdded = addedCourseIds.has(c.id || c.title);
                  return (
                    <div
                      key={c.id}
                      className="bg-white p-5 rounded-2xl border border-brand-100 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                          <span className="text-brand-600 font-extrabold">{c.provider}</span>
                          <span>{c.level}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{c.title}</h4>
                        <div className="mt-2 text-[10px] font-bold text-indigo-600">
                          Bridges: {c.recommendedForSkill || c.skill}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <a
                          href={c.course_url || c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                        >
                          <span>Course</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <button
                          onClick={() => handleQuickAdd(c)}
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
                              <span>Tracked</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3 h-3" />
                              <span>+ Track</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalog Search & Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses by skill (React, PostgreSQL, Docker, Python)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Search
              </button>
            </form>

            {/* Filter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">All Providers</option>
                <option value="NPTEL">NPTEL</option>
                <option value="Coursera">Coursera</option>
                <option value="Udemy">Udemy</option>
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                value={isFree}
                onChange={(e) => setIsFree(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">Free & Paid</option>
                <option value="1">Free Courses Only</option>
                <option value="0">Paid / Verified Track</option>
              </select>

              <button
                onClick={() => {
                  setSearch('');
                  setProvider('');
                  setLevel('');
                  setIsFree('');
                }}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition text-center"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : catalogCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No courses match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {catalogCourses.map((course) => {
                const isAdded = addedCourseIds.has(course.id || course.title);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                        <span className="text-brand-600 uppercase tracking-wider">{course.provider}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{course.level}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{course.title}</h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                          {course.rating}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Skill: {course.skill}
                        </span>
                        {course.is_free ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                            Free Access
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={course.course_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <span>Enroll</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleQuickAdd(course)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1 transition ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Tracked</span>
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
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: + ADD COURSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add External Course</h3>
                  <p className="text-xs text-slate-500">Log any coursework to demonstrate skills</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Docker & Kubernetes Bootcamp"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provider</label>
                  <select
                    value={addForm.provider}
                    onChange={(e) => setAddForm({ ...addForm, provider: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Coursera">Coursera</option>
                    <option value="Udemy">Udemy</option>
                    <option value="YouTube">YouTube</option>
                    <option value="edX">edX</option>
                    <option value="NPTEL">NPTEL</option>
                    <option value="Codecademy">Codecademy</option>
                    <option value="LinkedIn Learning">LinkedIn Learning</option>
                    <option value="Other">Other / Self-Study</option>
                  </select>
                </div>

                {addForm.provider === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Provider Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Scrimba, FreeCodeCamp"
                      value={addForm.customProvider}
                      onChange={(e) => setAddForm({ ...addForm, customProvider: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={addForm.course_url}
                  onChange={(e) => setAddForm({ ...addForm, course_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Skill <span className="text-rose-500">*</span>
                  </label>
                  {basedOnSkills.length > 0 && (
                    <span className="text-[10px] text-slate-400">Quick suggestions below</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Docker, React, PostgreSQL, Python"
                  value={addForm.target_skill}
                  onChange={(e) => setAddForm({ ...addForm, target_skill: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />

                {/* Missing skills quick chips */}
                {basedOnSkills.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold">Missing skills:</span>
                    {basedOnSkills.slice(0, 5).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setAddForm({ ...addForm, target_skill: s })}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        status: e.target.value,
                        completion_percentage: e.target.value === 'Completed' ? 100 : 25
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed (100%)</option>
                  </select>
                </div>

                {addForm.status !== 'Completed' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Completion: {addForm.completion_percentage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={addForm.completion_percentage}
                      onChange={(e) =>
                        setAddForm({ ...addForm, completion_percentage: parseInt(e.target.value) })
                      }
                      className="w-full mt-2 accent-brand-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {addForm.status === 'Completed' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Marking this course completed will immediately move <strong>"{addForm.target_skill || 'target skill'}"</strong> to Matched and re-calculate your Readiness Index!
                  </span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCourse}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {addingCourse ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Add to My Courses</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LIGHTWEIGHT SELF-CHECK VERIFICATION */}
      {selfCheckCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Skill Competency Self-Check</h3>
                  <p className="text-xs text-slate-500">
                    Verify key learnings for <strong>{selfCheckCourse.target_skill}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelfCheckCourse(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 leading-relaxed">
              Completing this lightweight 3-point self-check ensures your progress stays authentic and triggers an immediate recalculation of your <strong>Readiness Index</strong>.
            </div>

            <form onSubmit={handleSubmitSelfCheck} className="space-y-4">
              {/* Question 1 */}
              <label
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selfCheckAnswers.concepts
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selfCheckAnswers.concepts}
                  onChange={(e) =>
                    setSelfCheckAnswers({ ...selfCheckAnswers, concepts: e.target.checked })
                  }
                  className="mt-0.5 accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900">1. Core Concepts & Foundations</strong>
                  <span>
                    I understand the fundamental concepts, lifecycle, and design principles of{' '}
                    <strong>{selfCheckCourse.target_skill}</strong>.
                  </span>
                </div>
              </label>

              {/* Question 2 */}
              <label
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selfCheckAnswers.practical
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selfCheckAnswers.practical}
                  onChange={(e) =>
                    setSelfCheckAnswers({ ...selfCheckAnswers, practical: e.target.checked })
                  }
                  className="mt-0.5 accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900">2. Hands-on Implementation</strong>
                  <span>
                    I have written working code or built functional modules/exercises utilizing{' '}
                    <strong>{selfCheckCourse.target_skill}</strong>.
                  </span>
                </div>
              </label>

              {/* Question 3 */}
              <label
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selfCheckAnswers.tradeoffs
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selfCheckAnswers.tradeoffs}
                  onChange={(e) =>
                    setSelfCheckAnswers({ ...selfCheckAnswers, tradeoffs: e.target.checked })
                  }
                  className="mt-0.5 accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900">3. Tradeoffs & Interview Readiness</strong>
                  <span>
                    I can articulate technical tradeoffs, debugging strategies, and use cases in a job interview.
                  </span>
                </div>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelfCheckCourse(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submittingSelfCheck ||
                    !(selfCheckAnswers.concepts && selfCheckAnswers.practical && selfCheckAnswers.tradeoffs)
                  }
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-40"
                >
                  {submittingSelfCheck ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete & Recalculate Index</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

