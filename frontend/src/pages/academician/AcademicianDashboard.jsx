import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  BookOpen,
  TrendingUp,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AcademicianDashboard = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await api.get('/academician/trends');
        setTrends(res.data);
      } catch (err) {
        console.error('Failed to load academician trends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const topSkills = trends?.topSkills || [];
  const emerging = trends?.emergingTech || [];
  const cohortSize = trends?.studentCohortSize || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full mb-3 border border-purple-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Curriculum & Demand Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Academician Command Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Monitor real-time corporate skill demand, assess university curriculum alignment, and introduce high-impact technical electives.
          </p>
        </div>

        <Link
          to="/academician/curriculum-gap"
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum Gap Analyzer</span>
        </Link>
      </div>

      {/* Cohort & Industry Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student Cohort Base
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">{cohortSize} Enrolled</div>
            <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Active skill portfolios</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hiring Velocity
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-1">+34% YoY</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Full-stack & AI roles</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Curriculum Health
            </span>
            <div className="text-3xl font-black text-brand-600 mt-1">Outcome-Based</div>
            <span className="text-[11px] text-slate-500 mt-1 block">AI-driven audit ready</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2026 Industry Skill Demand Trends Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">2026 Industry Skill Demand Index</h2>
            <p className="text-xs text-slate-400">Aggregated from live corporate hiring vacancies</p>
          </div>
          <Link to="/academician/trends" className="text-xs font-bold text-purple-600 hover:text-purple-800">
            View deep analytics →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Skill / Technology</th>
                <th className="pb-3">Domain</th>
                <th className="pb-3">Demand Index</th>
                <th className="pb-3">YoY Growth</th>
                <th className="pb-3">Avg Compensation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topSkills.map((s) => (
                <tr key={s.name} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 text-slate-500">{s.category}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${s.demandScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-purple-900">{s.demandScore}/100</span>
                    </div>
                  </td>
                  <td className="py-3 text-emerald-600 font-bold">{s.growthRate}</td>
                  <td className="py-3 font-semibold text-slate-700">{s.avgSalary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emerging Tech Impact */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Emerging Technology Disruption Signals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {emerging.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <h3 className="text-xs font-bold text-purple-950">{item.tech}</h3>
              <p className="text-xs text-purple-800/80 mt-1 leading-relaxed">{item.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
