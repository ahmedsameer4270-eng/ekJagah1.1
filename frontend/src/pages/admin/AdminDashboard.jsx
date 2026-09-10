import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ShieldAlert,
  Award,
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const users = stats?.users || {};
  const companies = stats?.companies || {};
  const certificates = stats?.certificates || {};
  const jobs = stats?.jobs || {};
  const totalApps = stats?.applications || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-3 border border-amber-200">
          <Activity className="w-3.5 h-3.5" />
          <span>Platform Governance & Integrity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          System Administration Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Approve company legal verifications, review student uploaded certificates, and moderate platform job postings.
        </p>
      </div>

      {/* Moderation Backlog Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Pending Companies Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Company Legal Verifications
              </span>
              {companies.pending > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black animate-pulse">
                  {companies.pending} Pending
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-slate-900">
              {companies.pending} Companies Awaiting Review
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verify MCA/CIN and GSTIN corporate identity before allowing live job postings.
            </p>
          </div>

          <Link
            to="/admin/companies"
            className="mt-6 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-between"
          >
            <span>Review Company Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pending Certificates Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Student Certificate Approvals
              </span>
              {certificates.pending > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black animate-pulse">
                  {certificates.pending} Pending
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-slate-900">
              {certificates.pending} Certificates in Queue
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inspect uploaded document attachments and issue official cryptographic validity seals.
            </p>
          </div>

          <Link
            to="/admin/certificates"
            className="mt-6 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-between"
          >
            <span>Review Certificate Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Platform-Wide Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block">Total Students</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {users.Student || 0}
          </span>
          <span className="text-[10px] text-slate-500">Verified learners</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block">Total Companies</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">
            {companies.total || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">{companies.verified} verified</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block">Active Listings</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">
            {jobs.active || 0}
          </span>
          <span className="text-[10px] text-slate-500">{jobs.total} all-time postings</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block">Applications Handled</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {totalApps}
          </span>
          <span className="text-[10px] text-slate-500">AI match routed</span>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Governance & Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/companies"
            className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-slate-50 transition"
          >
            <span className="font-bold text-xs text-slate-900 block">Company Verification</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Audit legal CIN/GSTIN submissions</span>
          </Link>
          <Link
            to="/admin/certificates"
            className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition"
          >
            <span className="font-bold text-xs text-slate-900 block">Certificate Approval</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Approve/reject credential proofs</span>
          </Link>
          <Link
            to="/admin/jobs"
            className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-slate-50 transition"
          >
            <span className="font-bold text-xs text-slate-900 block">Job Moderation</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Flag and remove fraudulent listings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
