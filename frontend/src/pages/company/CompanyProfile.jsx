import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Globe,
  MapPin,
  FileBadge,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CompanyProfile = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [trustScore, setTrustScore] = useState(60);
  const [status, setStatus] = useState('UNDER_REVIEW');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/company/profile');
        const p = res.data.profile;
        setProfile(p);
        setCompanyName(p.company_name || '');
        setCinNumber(p.cin_llpin || '');
        setGstin(p.gstin || '');
        setWebsite(p.website || '');
        setIndustry(p.industry || '');
        setDescription(p.description || '');
        setHeadquarters(p.headquarters || '');
        setTrustScore(p.trust_score || 60);
        setStatus(p.verification_status || 'UNDER_REVIEW');
      } catch (err) {
        console.error('Failed to load company profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await api.put('/company/profile', {
        companyName,
        cinNumber,
        gstin,
        website,
        industry,
        description,
        headquarters
      });

      setTrustScore(res.data.trustScore);
      setMessage('Company details updated successfully!');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      setSaving(true);
      await api.post('/company/request-verification');
      setStatus('UNDER_REVIEW');
      setMessage('Verification request submitted. Admin team will review your CIN and GSTIN.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit verification request.');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                status === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {status === 'VERIFIED' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>Status: {status}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Corporate Profile & Legal Trust
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your legal identifiers (CIN/LLPIN and GSTIN) to achieve verified corporate status.
          </p>
        </div>

        {/* Trust Score Card */}
        <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 min-w-[200px] text-center">
          <span className="text-xs font-bold text-sky-900 block mb-1">Computed Trust Score</span>
          <div className="text-3xl font-black text-sky-600 mb-2">{trustScore}%</div>
          <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${trustScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Legal Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-sky-600" />
            Legal Regulatory Identifiers (MCA / GSTN)
          </h2>
          <p className="text-xs text-slate-500">
            Mandatory corporate registrations required for live student hiring and internship postings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                MCA / CIN / LLPIN Number
              </label>
              <input
                type="text"
                required
                value={cinNumber}
                onChange={(e) => setCinNumber(e.target.value)}
                placeholder="U72200MH2021PTC356789"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GSTIN (15-character Tax ID)
              </label>
              <input
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AAACN1234F1Z5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Corporate Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            Corporate Information & Bio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Industry Domain
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Enterprise SaaS, FinTech, AI"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Website
              </label>
              <input
                type="url"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Headquarters Location
              </label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="Bengaluru, India"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Company Overview & Culture
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your company mission and culture..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {status !== 'VERIFIED' && (
            <button
              type="button"
              onClick={handleRequestVerification}
              disabled={saving}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Request Admin Verification
            </button>
          )}

          <div className="flex justify-end gap-3 ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Corporate Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
