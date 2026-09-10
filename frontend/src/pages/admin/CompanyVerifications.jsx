import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  ShieldAlert,
  Building2,
  ShieldCheck,
  XCircle,
  ExternalLink,
  Check,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CompanyVerifications = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/companies');
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error('Failed to load company verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleReview = async (companyId, status) => {
    try {
      setUpdatingId(companyId);
      const adminNotes = notes[companyId] || (status === 'VERIFIED' ? 'Verified against MCA and GST portal records.' : 'Rejected due to incomplete or unverified identifiers.');
      await api.put(`/admin/companies/${companyId}/review`, {
        status,
        adminNotes
      });

      setMessage(`Company updated to ${status}. Notification dispatched.`);
      await fetchCompanies();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to review company:', err);
    } finally {
      setUpdatingId(null);
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
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Regulatory Compliance Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Company Legal Verifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Review MCA/CIN and GSTIN registrations. Approved companies gain <strong>VERIFIED</strong> status and live job posting permissions.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Companies Queue */}
      <div className="space-y-4">
        {companies.map((comp) => {
          const isPending = comp.verification_status === 'UNDER_REVIEW';
          return (
            <div
              key={comp.user_id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border transition space-y-4 ${
                isPending
                  ? 'border-amber-300 shadow-md ring-1 ring-amber-200'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        comp.verification_status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : comp.verification_status === 'UNDER_REVIEW'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      ● {comp.verification_status}
                    </span>
                    <span className="text-xs text-slate-400">• Trust Score: {comp.trust_score}%</span>
                  </div>

                  <h2 className="text-lg font-black text-slate-900">{comp.company_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{comp.industry || 'Tech'} • Registered by {comp.email}</p>
                </div>

                {/* Direct Website link */}
                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Legal Identifiers Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase">
                    MCA / CIN / LLPIN:
                  </span>
                  <span className="font-bold text-slate-900 tracking-wider">
                    {comp.cin_llpin || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase">
                    GSTIN Number:
                  </span>
                  <span className="font-bold text-slate-900 tracking-wider">
                    {comp.gstin || 'Not provided'}
                  </span>
                </div>
              </div>

              {comp.description && (
                <p className="text-xs text-slate-600 line-clamp-2">
                  {comp.description}
                </p>
              )}

              {/* Admin Review Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional audit notes or reason for approval/rejection..."
                  value={notes[comp.user_id] || ''}
                  onChange={(e) => setNotes({ ...notes, [comp.user_id]: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview(comp.user_id, 'REJECTED')}
                    disabled={updatingId === comp.user_id}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleReview(comp.user_id, 'VERIFIED')}
                    disabled={updatingId === comp.user_id}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve as VERIFIED</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
