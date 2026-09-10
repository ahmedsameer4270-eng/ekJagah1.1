import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase,
  Users,
  PlusCircle,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load company jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full mb-3 border border-sky-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiting Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage Posted Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track applications, candidate match rankings, and hiring progress.
          </p>
        </div>

        <Link
          to="/company/post-job"
          className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Listing</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No jobs posted yet</h3>
          <p className="text-xs text-slate-500 mt-1">Create your first job or internship listing to start receiving candidates.</p>
          <Link
            to="/company/post-job"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.type}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    ● {job.status}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900 leading-snug">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location} {job.is_remote ? '(Remote)' : ''}
                  </span>
                  <span>•</span>
                  <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats & Applicants CTA */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    {job.applicant_count} Candidates
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">
                    {job.shortlisted_count} Shortlisted
                  </span>
                </div>

                <Link
                  to={`/company/applicants/${job.id}`}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Review Candidates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
