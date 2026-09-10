import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import confetti from 'canvas-confetti';
import {
  Map,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  BookOpen,
  FolderGit2,
  Award,
  Briefcase
} from 'lucide-react';

export const CareerRoadmap = () => {
  const [roadmap, setRoadmap] = useState([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('sb_roadmap_completed');
      return saved ? JSON.parse(saved) : [0]; // Phase 1 completed by default
    } catch {
      return [0];
    }
  });

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai/skill-gap/latest');
        if (res.data.analysis) {
          setRoadmap(res.data.analysis.roadmap || []);
          setCareerGoal(res.data.analysis.careerGoal || 'Full Stack Developer');
        }
      } catch (err) {
        console.error('Failed to load roadmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  const toggleStep = (index) => {
    const next = completedSteps.includes(index)
      ? completedSteps.filter((i) => i !== index)
      : [...completedSteps, index];

    setCompletedSteps(next);
    localStorage.setItem('sb_roadmap_completed', JSON.stringify(next));

    if (next.length === roadmap.length && roadmap.length > 0) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  };

  const progressPct = roadmap.length > 0 ? Math.round((completedSteps.length / roadmap.length) * 100) : 20;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full mb-3 border border-purple-200">
            <Map className="w-3.5 h-3.5" />
            <span>Interactive Career Milestone Path</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Career Roadmap: {careerGoal}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            A structured, 5-phase career progression generated from your AI Skill Gap diagnostics.
          </p>
        </div>

        {/* Roadmap Progress Bar */}
        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 min-w-[200px] text-center flex-shrink-0">
          <span className="text-xs font-bold text-purple-900 block mb-1">Roadmap Progress</span>
          <div className="text-3xl font-black text-purple-700 mb-2">{progressPct}%</div>
          <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-purple-600 mt-1.5 block">
            {completedSteps.length} of {roadmap.length} phases completed
          </span>
        </div>
      </div>

      {/* Interactive Timeline Phases */}
      <div className="space-y-4">
        {roadmap.map((phase, idx) => {
          const isDone = completedSteps.includes(idx);
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition-all duration-200 ${
                isDone
                  ? 'bg-white border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(idx)}
                    className={`mt-0.5 rounded-full p-1 transition ${
                      isDone ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-500'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-50 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                        {phase.phase}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {phase.duration}
                      </span>
                    </div>
                    <h3 className={`text-base font-bold mt-1 ${isDone ? 'text-slate-900 line-through text-slate-400' : 'text-slate-900'}`}>
                      {phase.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {phase.description}
                    </p>

                    {/* Associated Skills or Projects */}
                    {phase.skills && phase.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {phase.skills.map((s) => (
                          <span key={s} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {phase.projects && phase.projects.length > 0 && (
                      <div className="space-y-1.5 mt-3">
                        {phase.projects.map((p, pIdx) => (
                          <div key={pIdx} className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-xs">
                            <span className="font-bold text-purple-950 block">{p.title}</span>
                            <span className="text-purple-800 text-[11px]">{p.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleStep(idx)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isDone ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
