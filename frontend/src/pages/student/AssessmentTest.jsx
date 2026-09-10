import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  Clock,
  AlertTriangle,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  X,
  ShieldAlert,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const AssessmentTest = () => {
  const { skillId, level = 'basic' } = useParams();
  const navigate = useNavigate();

  // Test data state
  const [skill, setSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [flagged, setFlagged] = useState({}); // { [questionId]: boolean }
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins default
  const totalDurationRef = useRef(15 * 60);

  // Tab-switch anti-cheat tracking
  const [tabSwitches, setTabSwitches] = useState(0);
  const [tabWarning, setTabWarning] = useState(null);

  // Modals & submission state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Questions on Mount
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/assessment/${skillId}/questions?level=${level}`);
        setSkill(res.data.skill);
        const qList = res.data.questions || [];
        setQuestions(qList);

        const minutes = res.data.skill?.timeLimitMinutes || 15;
        const totalSecs = minutes * 60;
        setTimeLeft(totalSecs);
        totalDurationRef.current = totalSecs;
      } catch (err) {
        console.error('Failed to load assessment questions:', err);
        setError(
          err.response?.data?.error || 'Unable to start assessment session. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [skillId, level]);

  // 2. Countdown Timer with Auto-Submit
  useEffect(() => {
    if (loading || submitting || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, questions.length]);

  // 3. Tab-Switch Anti-Cheat Event Listener
  useEffect(() => {
    if (loading || submitting || questions.length === 0) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const nextCount = prev + 1;
          setTabWarning(
            `⚠️ Tab Switch Detected! Please keep this window active during the test. Switch Count: ${nextCount}.`
          );
          return nextCount;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitches((prev) => {
        const nextCount = prev + 1;
        setTabWarning(
          `⚠️ Window Focus Lost! Please remain focused on the exam window. Switch Count: ${nextCount}.`
        );
        return nextCount;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [loading, submitting, questions.length]);

  // Auto dismiss tab warning banner after 5s
  useEffect(() => {
    if (!tabWarning) return;
    const timeout = setTimeout(() => {
      setTabWarning(null);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [tabWarning]);

  // Handle Option Selection
  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  // Toggle Flag for Review
  const handleToggleFlag = (qId) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Format Time Remaining (MM:SS)
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-Submit on timeout
  const handleAutoSubmit = async () => {
    await executeSubmission(true);
  };

  // Confirm Submit
  const handleManualSubmit = async () => {
    await executeSubmission(false);
  };

  const executeSubmission = async (isAuto = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setShowSubmitModal(false);

      const timeTaken = Math.max(1, totalDurationRef.current - timeLeft);

      const payload = {
        level,
        answers: questions.map((q) => ({
          questionId: q.id,
          selectedOption: answers[q.id] !== undefined ? answers[q.id] : null
        })),
        timeTakenSeconds: timeTaken,
        tabSwitches
      };

      const res = await api.post(`/assessment/${skillId}/submit`, payload);

      if (res.data.success && res.data.attemptId) {
        navigate(`/student/assessment/${skillId}/results/${res.data.attemptId}`);
      } else {
        throw new Error('Invalid submission response.');
      }
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      alert('Failed to submit test results. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-bold text-slate-800">Preparing Test Environment...</h3>
        <p className="text-xs text-slate-500 mt-1">
          Loading randomized benchmark questions for {skillId} ({level}).
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Assessment Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'No questions available for this level.'}</p>
        <button
          onClick={() => navigate('/student/assessment')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id];
  const isCurrentFlagged = Boolean(flagged[currentQ.id]);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  const isLowTime = timeLeft <= 120; // 2 mins remaining

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12">
      {/* Tab Switch Warning Banner (Dismissible toast) */}
      {tabWarning && (
        <div className="p-3.5 bg-amber-500 text-white rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{tabWarning}</span>
          </div>
          <button
            onClick={() => setTabWarning(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Bar: Skill title, Timer, Submit CTA */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {skill?.name} Assessment
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {level}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
            Question {currentIndex + 1} of {totalQuestions}
          </h1>
        </div>

        {/* Right side: Timer & Submit */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Countdown timer pill */}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-mono text-sm font-black border transition ${
              isLowTime
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-indigo-600'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* 2. Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* 3. Main Test Workspace (Question Viewer + Palette Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Topic Badge & Review toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
              Topic: {currentQ.topic || 'General'}
            </span>

            <button
              type="button"
              onClick={() => handleToggleFlag(currentQ.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl transition border ${
                isCurrentFlagged
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isCurrentFlagged ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line font-sans">
              {currentQ.questionText}
            </p>
          </div>

          {/* Options Radio List */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = currentAnswer === idx;
              const optionLetters = ['A', 'B', 'C', 'D'];

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3.5 group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  {/* Option Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition flex-shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {optionLetters[idx]}
                  </div>

                  {/* Option text */}
                  <span
                    className={`text-xs sm:text-sm font-medium leading-normal flex-1 ${
                      isSelected ? 'text-indigo-950 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Question Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <span>Review & Submit</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar (1 Col) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Question Palette
            </h3>
            <span className="text-[11px] font-extrabold text-indigo-600">
              {answeredCount}/{totalQuestions}
            </span>
          </div>

          {/* Palette Grid (1..15) */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = Boolean(flagged[q.id]);
              const isCurrent = currentIndex === idx;

              let style = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
              if (isAnswered) {
                style = 'bg-indigo-600 text-white';
              }
              if (isFlagged) {
                style = 'bg-amber-100 text-amber-800 border border-amber-400 font-extrabold';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center relative ${style} ${
                    isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 z-10' : ''
                  }`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-md bg-indigo-600"></div>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400"></div>
              <span>Marked for Review ({flaggedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-md bg-slate-100"></div>
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-md border-2 border-indigo-600"></div>
              <span>Current Question</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-scale-up">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Send className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Submit Assessment?</h2>
              <p className="text-xs text-slate-500 mt-1">
                Are you ready to submit your answers for evaluation?
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Answered</span>
                <p className="text-base font-black text-indigo-600">{answeredCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Flagged</span>
                <p className="text-base font-black text-amber-600">{flaggedCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Unanswered</span>
                <p className="text-base font-black text-slate-500">{unansweredCount}</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>. They will be marked incorrect if submitted.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Grading Answers...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
