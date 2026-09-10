import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  XCircle,
  Calendar,
  Building,
  GraduationCap,
  ExternalLink,
  Search,
  Sparkles,
  QrCode
} from 'lucide-react';

export const CertificateVerifyPage = () => {
  const { certId } = useParams();
  const [searchId, setSearchId] = useState(certId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchCertificate = async (id) => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setData(null);

    try {
      const res = await api.get(`/certificates/verify/${id.trim()}`);
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certId) {
      setSearchId(certId);
      fetchCertificate(certId);
    }
  }, [certId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId) {
      fetchCertificate(searchId);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Verification Registry Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full mb-3 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EkJagah Credential Registry</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Public Certificate Verification
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Instant tamper-evident credential verification powered by EkJagah cryptographic registry and institutional audit logs.
          </p>

          {/* Search bar for Certificate ID */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. SB-CERT-2026-REACT)"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium text-slate-500">Querying cryptographic verification registry...</p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && notFound && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Certificate Not Found</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              No verified certificate with ID <span className="font-mono font-bold text-slate-800">{searchId}</span> was found in our system. Please check for typographical errors or contact the issuing authority.
            </p>
          </div>
        )}

        {/* Certificate Found Details */}
        {!loading && data && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Status Banner */}
            <div
              className={`p-6 sm:p-8 flex items-center justify-between border-b ${
                data.status === 'VALID'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : data.status === 'UNDER_REVIEW'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner">
                  {data.status === 'VALID' ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : data.status === 'UNDER_REVIEW' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                    Verification Status
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {data.status === 'VALID'
                      ? 'OFFICIALLY VERIFIED & VALID'
                      : data.status === 'UNDER_REVIEW'
                      ? 'UNDER ADMINISTRATIVE REVIEW'
                      : 'CREDENTIAL REJECTED / INVALID'}
                  </h2>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                  {data.certificateId}
                </span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Title & Recipient */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Certificate Title
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{data.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-600">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>Issued by: <strong className="text-slate-800">{data.issuer}</strong></span>
                  </div>
                </div>

                {data.qrCodeData && (
                  <div className="flex flex-col items-center sm:items-end">
                    <img
                      src={data.qrCodeData}
                      alt="Verification QR Code"
                      className="w-24 h-24 rounded-xl border border-slate-200 p-1 shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Scan to Re-verify</span>
                  </div>
                )}
              </div>

              {/* Recipient & Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Verified Recipient
                  </span>
                  <p className="text-sm font-bold text-slate-900">{data.studentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{data.college}</p>
                  <p className="text-xs text-slate-500">{data.branch}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Issuance Details
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-700 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Issue Date: <strong>{data.issueDate}</strong></span>
                  </div>
                  {data.verificationDate && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 mt-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Verified On: <strong>{new Date(data.verificationDate).toLocaleDateString()}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Verification Notes */}
              {data.adminNotes && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                    Institutional Audit Record
                  </span>
                  <p className="text-xs text-indigo-950 leading-relaxed">{data.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-between text-xs text-slate-500">
              <span>EkJagah Trust Network Registry</span>
              <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
                Learn more about EkJagah →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
