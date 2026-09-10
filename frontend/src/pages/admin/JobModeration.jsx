import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Briefcase,
  Trash2,
  AlertTriangle,
  Building2,
  CheckCircle2,
  MapPin,
  DollarSign
} from 'lucide-react';

export const JobModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to remove the job listing "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setMessage(`Job "${title}" was removed successfully.`);
      await fetchJobs();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-3 border border-amber-200">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Listing Integrity & Fraud Prevention</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Job & Internship Listing Moderation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Audit all corporate listings posted on EkJagah and take down fake, fraudulent, or non-compliant job postings.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Jobs Table / Cards */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {job.company_name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    job.verification_status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  ● {job.verification_status}
                </span>
              </div>

              <h2 className="text-base font-black text-slate-900 leading-snug">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{job.location} {job.is_remote ? '(Remote)' : ''}</span>
                <span>•</span>
                <span>{job.type}</span>
                <span>•</span>
                <span className="font-bold text-slate-700">{job.applicant_count} applicants</span>
              </div>
            </div>

            <button
              onClick={() => handleDeleteJob(job.id, job.title)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 flex-shrink-0"
              title="Remove listing"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Listing</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
