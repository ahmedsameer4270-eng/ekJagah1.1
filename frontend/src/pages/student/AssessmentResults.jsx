import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  HelpCircle
} from 'lucide-react';

export const AssessmentResults = () => {
  const { skillId, attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter for review questions: 'all' | 'correct' | 'incorrect'
  const [filterMode, setFilterMode] = useState('all');
  const [expandedExplanations, setExpandedExplanations] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/assessment/${skillId}/results/${attemptId}`);
        const att = res.data.attempt;
        setAttempt(att);

        // Fire celebratory confetti if passed
        if (att?.passed) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Failed to load assessment results:', err);
        setError('Unable to load assessment report. Please check your link.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [skillId, attemptId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-bold text-slate-800">Generating Assessment Report...</h3>
        <p className="text-xs text-slate-500 mt-1">
          Evaluating answers, computing topic metrics, and syncing with your profile.
        </p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Report Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This assessment attempt could not be loaded.'}</p>
        <Link
          to="/student/assessment"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
        >
          <span>Back to Assessments</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const {
    skillName,
    level,
    score,
    totalQuestions,
    percentage,
    passed,
    verdict,
    topicBreakdown = {},
    answersReview = [],
    timeTakenSeconds,
    tabSwitches
  } = attempt;

  // Verdict style mapping
  const isExpert = verdict?.toLowerCase() === 'expert';
  const isProficient = verdict?.toLowerCase() === 'proficient';
  const isCompetent = verdict?.toLowerCase() === 'competent';

  let verdictBadgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  if (isExpert) verdictBadgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
  else if (isProficient) verdictBadgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
  else if (isCompetent) verdictBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  // Format time taken
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Filtered review questions
  const filteredQuestions = answersReview.filter((q) => {
    if (filterMode === 'correct') return q.isCorrect;
    if (filterMode === 'incorrect') return !q.isCorrect;
    return true;
  });

  const topicsList = Object.entries(topicBreakdown);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Hero Score Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-brand-900'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="capitalize">{level} Assessment Report</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {skillName} Assessment Results
            </h1>

            <p className="text-sm text-indigo-100/90 max-w-xl leading-relaxed">
              {passed ? (
                <>
                  🎉 <strong>Congratulations!</strong> You achieved a passing score of{' '}
                  <strong className="text-emerald-300">{percentage}%</strong>. Your profile has been
                  updated with the <strong>Verified Skill badge</strong> and your AI Readiness Index
                  has been refreshed.
                </>
              ) : (
                <>
                  You scored <strong>{percentage}%</strong>. While this attempt did not meet the
                  passing threshold (60%), review your detailed topic breakdowns and explanations
                  below to prepare for your next attempt.
                </>
              )}
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Score: {score} / {totalQuestions}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-indigo-200" />
                <span>Time: {formatTime(timeTakenSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                <span>Tab Switches: {tabSwitches}</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Big Score Ring / Verdict */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 min-w-[200px] flex-shrink-0 text-center">
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-1">
              {percentage}%
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-200">
              {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </span>

            {/* Verdict Chip */}
            <div
              className={`mt-3 px-3 py-1 rounded-full text-xs font-black uppercase border ${verdictBadgeBg}`}
            >
              {verdict}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Buttons CTA Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>Next recommended actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/student/assessment"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake / Other Tests</span>
          </Link>

          <Link
            to="/student/profile"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>View on Profile</span>
          </Link>

          <Link
            to="/student/skill-gap"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <span>View AI Skill Gap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. Topic Breakdown Section */}
      {topicsList.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Topic Proficiency Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand your strengths and pinpoint areas that need reinforcement.
              </p>
            </div>
            <span className="text-xs font-extrabold text-slate-400">
              {topicsList.length} Topics Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {topicsList.map(([topicName, stats]) => {
              const pct = stats.percentage || 0;
              const isHigh = pct >= 75;
              const isMedium = pct >= 50 && pct < 75;

              let barColor = 'bg-rose-500';
              if (isHigh) barColor = 'bg-emerald-500';
              else if (isMedium) barColor = 'bg-amber-500';

              return (
                <div
                  key={topicName}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{topicName}</span>
                    <span className="font-extrabold font-mono text-slate-700">
                      {stats.correct} / {stats.total} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${barColor} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Detailed Question Review & Educational Explanations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Detailed Solutions & Explanations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review every question with official answer keys and conceptual rationale.
            </p>
          </div>

          {/* Review Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({answersReview.length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Correct ({score})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'incorrect'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Incorrect ({totalQuestions - score})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={q.questionId || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Header: Question Number & Topic */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800">
                      Q{idx + 1}.
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {q.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct (+1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect (0)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-xs sm:text-sm font-bold text-slate-900 mb-3 whitespace-pre-line leading-relaxed font-sans">
                  {q.questionText}
                </p>

                {/* Options List */}
                <div className="space-y-2 mb-3">
                  {q.options.map((opt, optIdx) => {
                    const isOfficialCorrect = optIdx === q.correctOptionIndex;
                    const isUserSelected = optIdx === q.selectedOption;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    let badgeStyle = 'bg-slate-100 text-slate-600';

                    if (isOfficialCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isUserSelected && !isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                      badgeStyle = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs transition ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] ${badgeStyle}`}
                          >
                            {optionLetters[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-bold">
                          {isUserSelected && (
                            <span className="text-slate-500 font-semibold">(Your choice)</span>
                          )}
                          {isOfficialCorrect && (
                            <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Correct Answer</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Callout */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-indigo-900 block text-[11px] uppercase tracking-wider">
                        Concept & Explanation:
                      </span>
                      <p className="text-indigo-900/90 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
