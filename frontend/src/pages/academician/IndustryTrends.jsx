import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Briefcase,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const IndustryTrends = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await api.get('/academician/trends');
        setTrends(res.data);
      } catch (err) {
        console.error('Failed to load industry trends:', err);
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
  const topStudentSkills = trends?.topStudentSkills || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full mb-3 border border-purple-200">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Macro Labor Market Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          2026 Industry Skill Trends & Tech Radar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time hiring volumes, compensation curves, and demand trends across software, AI, and cloud sectors.
        </p>
      </div>

      {/* Top Skills Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topSkills.map((s) => (
          <div
            key={s.name}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {s.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{s.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {s.growthRate} YoY
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Market Demand Index</span>
                <span className="text-purple-700">{s.demandScore}/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full"
                  style={{ width: `${s.demandScore}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Open Vacancies</span>
                <span className="font-bold text-slate-800">{s.openPositions.toLocaleString()} roles</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Median Package</span>
                <span className="font-bold text-slate-800">{s.avgSalary}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Cohort Demonstrated Skills */}
      {topStudentSkills.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Student Cohort Demonstrated Skill Distribution
          </h2>
          <p className="text-xs text-slate-500">
            Most prevalent technical competencies currently held by students across registered colleges.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {topStudentSkills.map((st) => (
              <div key={st.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-900 block">{st.name}</span>
                <span className="text-[11px] text-purple-700 font-extrabold mt-1 block">
                  {st.count} students proficient
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
