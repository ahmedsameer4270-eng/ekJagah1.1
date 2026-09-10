import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Award,
  ShieldCheck,
  XCircle,
  ExternalLink,
  Check,
  X,
  CheckCircle2,
  Calendar,
  Building,
  School
} from 'lucide-react';

export const CertificateApprovals = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState('');

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/certificates');
      setCertificates(res.data.certificates || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleReview = async (certId, status) => {
    try {
      setUpdatingId(certId);
      const adminNotes = notes[certId] || (status === 'VALID' ? 'Verified against official institutional credentials.' : 'Rejected due to unverified credential issuer.');
      await api.put(`/admin/certificates/${certId}/review`, {
        status,
        adminNotes
      });

      setMessage(`Certificate updated to ${status}. Student notified.`);
      await fetchCertificates();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to review certificate:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full mb-3 border border-brand-200">
          <Award className="w-3.5 h-3.5" />
          <span>Credential Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Student Certificate Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Audit uploaded certificates and issue official cryptographic verification seals for public employer queries.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Certificate Queue */}
      <div className="space-y-4">
        {certificates.map((cert) => {
          const isPending = cert.status === 'UNDER_REVIEW';
          return (
            <div
              key={cert.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border transition space-y-4 ${
                isPending
                  ? 'border-brand-300 shadow-md ring-1 ring-brand-200'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        cert.status === 'VALID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : cert.status === 'UNDER_REVIEW'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      ● {cert.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      ID: {cert.certificate_id}
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-slate-900">{cert.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      Student: <strong>{cert.student_name}</strong> ({cert.college})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Issuer: <strong>{cert.issuer}</strong>
                    </span>
                    <span>•</span>
                    <span>Issued: {cert.issue_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/verify-cert/${cert.certificate_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {cert.file_url && (
                    <a
                      href={`http://localhost:5001${cert.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition"
                    >
                      Inspect File
                    </a>
                  )}
                </div>
              </div>

              {/* Admin Note & Approval */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Audit record or verification comment..."
                  value={notes[cert.id] || ''}
                  onChange={(e) => setNotes({ ...notes, [cert.id]: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview(cert.id, 'REJECTED')}
                    disabled={updatingId === cert.id}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleReview(cert.id, 'VALID')}
                    disabled={updatingId === cert.id}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve as VALID</span>
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
