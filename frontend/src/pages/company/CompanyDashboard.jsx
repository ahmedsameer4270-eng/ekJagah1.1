import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  Users,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export const CompanyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profRes, jobsRes] = await Promise.all([
          api.get('/company/profile'),
          api.get('/company/jobs')
        ]);

        setProfile(profRes.data.profile);
        setStats(profRes.data.stats);
        setJobs(jobsRes.data.jobs || []);
      } catch (err) {
        console.error('Failed to load company dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const status = profile?.verification_status || 'UNDER_REVIEW';
  const trustScore = profile?.trust_score || 60;
  const isVerified = status === 'VERIFIED';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isVerified ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{isVerified ? 'VERIFIED CORPORATE EMPLOYER' : 'VERIFICATION IN PROGRESS'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {profile?.company_name || 'Recruiter Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Manage your open jobs, review AI match-ranked student candidates, and verify institutional credentials.
          </p>
        </div>

        {/* Company Trust Score Widget */}
        <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 min-w-[200px] text-center flex-shrink-0">
          <span className="text-xs font-bold text-sky-900 block mb-1">Company Trust Score</span>
          <div className="text-3xl font-black text-sky-600 mb-2">{trustScore}%</div>
          <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${trustScore}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-sky-700 mt-1.5 block">
            CIN & GSTIN Verified Identity
          </span>
        </div>
      </div>

      {/* Verification Warning Banner if not verified */}
      {!isVerified && (
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Verification Under Review</h3>
              <p className="text-xs text-amber-800/80 mt-0.5 leading-relaxed">
                Your submitted MCA/CIN and GSTIN identifiers are being verified by platform administrators. You can create draft job listings; they will be published live once verified.
              </p>
            </div>
          </div>

          <Link
            to="/company/profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
          >
            Review Legal IDs
          </Link>
        </div>
      )}

      {/* Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Job Postings
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats?.totalJobs || 0}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {stats?.activeJobs || 0} currently active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Candidate Applicants
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats?.totalApplicants || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Ranked by AI match %
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Actions
            </span>
            <div className="flex gap-2 mt-2">
              <Link
                to="/company/post-job"
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                + Post Job
              </Link>
              <Link
                to="/company/jobs"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                View Jobs
              </Link>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Listings Table / Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Posted Listings</h2>
            <p className="text-xs text-slate-400">Manage candidates and hiring pipelines</p>
          </div>
          <Link
            to="/company/post-job"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Listing</span>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No jobs posted yet. Click "+ Post New Listing" to create your first opening.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {job.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ● {job.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.location} • Posted {new Date(job.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      {job.applicant_count} Applicants
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      {job.shortlisted_count} Shortlisted
                    </span>
                  </div>

                  <Link
                    to={`/company/applicants/${job.id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
