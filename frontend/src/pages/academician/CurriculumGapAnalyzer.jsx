import React, { useState } from 'react';
import api from '../../api/client';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const CurriculumGapAnalyzer = () => {
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [curriculumSkills, setCurriculumSkills] = useState([
    'C++',
    'Data Structures',
    'Algorithms',
    'DBMS',
    'Computer Networks',
    'Operating Systems',
    'Java',
    'Theory of Computation'
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (curriculumSkills.includes(newSkill.trim())) return;
    setCurriculumSkills([...curriculumSkills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setCurriculumSkills(curriculumSkills.filter((s) => s !== skill));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (curriculumSkills.length === 0) {
      setError('Please add at least one subject or skill topic.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const res = await api.post('/academician/curriculum-gap', {
        department,
        curriculumSkills
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze curriculum gap.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full mb-3 border border-purple-200">
          <Layers className="w-3.5 h-3.5" />
          <span>Curriculum Audit Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Curriculum vs. Industry Demand Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Enter your department course syllabus subjects to evaluate alignment with active industry requirements and discover recommended electives.
        </p>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Academic Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Curriculum Topics / Skills Manager */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current Department Syllabus Subjects & Taught Skills
          </label>
          <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add syllabus topic (e.g. Microprocessors, Web Tech, Python)..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {curriculumSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="text-purple-400 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Curriculum Gap Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {results && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Alignment Score Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Department Audit Report
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Curriculum Alignment Score: {results.alignmentScore}%
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Measured against required technical competencies across active 2026 tech job postings.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center min-w-[180px]">
              <div className="text-4xl font-black text-purple-700">{results.alignmentScore}%</div>
              <span className="text-[11px] font-bold text-purple-900 mt-1 block">
                Alignment Index
              </span>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Industry Skills */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Covered Industry Core Skills ({results.matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {results.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Flagged Missing Industry Competencies */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Flagged Curriculum Gaps ({results.missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {results.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold"
                  >
                    ⚡ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Department Electives */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Recommended Electives to Bridge the Curriculum Gap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {results.recommendedElectives.map((el, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug mb-2">{el.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{el.rationale}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                      Target Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {el.targetMissingSkills.map((ts) => (
                        <span key={ts} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-purple-900 font-bold border border-slate-200">
                          {ts}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
