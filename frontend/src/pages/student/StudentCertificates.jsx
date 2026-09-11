import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Award,
  Upload,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

export const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New certificate form state
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [file, setFile] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/my');
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !issuer || !issueDate) {
      setError('Please fill in title, issuer, and issue date.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('issuer', issuer);
    formData.append('issueDate', issueDate);
    if (file) {
      formData.append('certificate', file);
    }

    try {
      setUploading(true);
      await api.post('/certificates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Certificate uploaded successfully! Unique ID and QR verification generated.');
      setModalOpen(false);
      // Reset
      setTitle('');
      setIssuer('');
      setIssueDate('');
      setFile(null);
      await fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload certificate.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full mb-3 border border-brand-200">
            <Award className="w-3.5 h-3.5" />
            <span>Cryptographic Credential Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Verified Certificates Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Upload institutional and online course certificates to generate public tamper-evident QR verification links for employers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Certificate Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No certificates yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your first certificate to get a unique verification ID and QR code to showcase on your resume.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
          >
            Upload Certificate Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Status Badge & Cert ID */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      cert.status === 'VALID' || cert.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : cert.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {cert.status === 'VALID' || cert.status === 'VERIFIED' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : cert.status === 'REJECTED' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {cert.status === 'VALID' || cert.status === 'VERIFIED'
                        ? 'VERIFIED'
                        : cert.status === 'REJECTED'
                        ? 'REJECTED'
                        : 'UNDER REVIEW'}
                    </span>
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                    {cert.certificate_id}
                  </span>
                </div>

                {/* Info & QR */}
                <div className="flex items-start justify-between gap-4 mt-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {cert.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cert.issuer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issued: {cert.issue_date}</span>
                    </div>
                  </div>

                  {cert.qr_code_data && (
                    <img
                      src={cert.qr_code_data}
                      alt="Verification QR"
                      className="w-20 h-20 rounded-xl border border-slate-200 p-1 flex-shrink-0 shadow-sm"
                    />
                  )}
                </div>

                {cert.admin_notes && (
                  <p className="mt-4 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 italic">
                    Note: {cert.admin_notes}
                  </p>
                )}
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/verify-cert/${cert.certificate_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <span>Public Verification Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {cert.file_url && (
                  <a
                    href={`http://localhost:5001${cert.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    View Document
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Upload Certificate</h2>
            <p className="text-xs text-slate-500 mb-5">
              We'll assign a unique ID and QR verification badge for external verification.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services / Coursera"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Issuance
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate File (PDF or Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Upload & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
