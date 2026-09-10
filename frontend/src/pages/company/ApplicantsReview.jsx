import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  FileText,
  School,
  Mail,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const ApplicantsReview = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/company/applicants/${jobId}`);
      setJob(res.data.job);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await api.put(`/company/applications/${appId}/status`, { status: newStatus });
      setMessage(`Candidate moved to "${newStatus}" status. Notification sent to student!`);
      // Update local state
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update applicant status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/company/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Candidate Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {job?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Applicants ranked automatically by AI Skill Match algorithm.
            </p>
          </div>

          <div className="bg-sky-50 px-4 py-3 rounded-2xl border border-sky-100 text-center flex-shrink-0">
            <span className="text-xs font-bold text-sky-900 block">Total Pool</span>
            <span className="text-2xl font-black text-sky-700">{applicants.length} Candidates</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applicants yet</h3>
          <p className="text-xs text-slate-500 mt-1">Applications will populate here once candidates apply.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Top Row: Candidate info + Match badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-bold text-slate-900">{app.full_name}</h2>
                    {app.cgpa && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        CGPA: {app.cgpa}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      {app.college} ({app.branch})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {app.student_email}
                    </span>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{app.match_score}% Skill Match</span>
                  </div>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    ✓ Matched Skills ({app.matched_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {app.matched_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    ⚡ Missing Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {app.missing_skills.length === 0 ? (
                      <span className="text-[11px] text-emerald-600 font-bold">Full match!</span>
                    ) : (
                      app.missing_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 text-[11px]">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Candidate Cover Note */}
              {app.cover_note && (
                <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100 text-xs text-slate-700 italic">
                  "{app.cover_note}"
                </div>
              )}

              {/* Action Bar: Resume link + Status Selector */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {app.resume_url ? (
                    <a
                      href={`http://localhost:5001${app.resume_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View PDF Resume</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No resume attached</span>
                  )}

                  {app.github_url && (
                    <a
                      href={app.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      GitHub
                    </a>
                  )}
                  {app.portfolio_url && (
                    <a
                      href={app.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-brand-600 hover:text-brand-800"
                    >
                      Portfolio
                    </a>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Pipeline Status:</span>
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted ⭐</option>
                    <option value="Selected">Selected 🎉</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
