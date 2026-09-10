import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Map,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Search
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [certSearch, setCertSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');

  const demoRoles = {
    'Full Stack Developer': {
      match: 78,
      core: ['React', 'Node.js', 'Express', 'JavaScript', 'Git'],
      missing: ['PostgreSQL', 'Docker', 'Redis'],
    },
    'AI & ML Engineer': {
      match: 65,
      core: ['Python', 'Pandas', 'NumPy', 'Math'],
      missing: ['PyTorch', 'Deep Learning', 'MLOps'],
    },
    'Cloud & DevOps': {
      match: 70,
      core: ['Linux', 'Git', 'Bash', 'Docker'],
      missing: ['Kubernetes', 'AWS', 'Terraform'],
    },
  };

  const currentDemo = demoRoles[selectedRole] || demoRoles['Full Stack Developer'];

  const handleCertSearch = (e) => {
    e.preventDefault();
    if (certSearch.trim()) {
      navigate(`/verify-cert/${encodeURIComponent(certSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-slate-50 via-indigo-50/25 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Career Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Empowering Talent.{' '}
              <span className="gradient-text">Bridging Gaps.</span>{' '}
              Connecting Future.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              EkJagah connects students, verified companies, and academicians in a unified ecosystem powered by AI skill-gap diagnosis, tamper-evident certificate verification, and precision job matching. Your career, all in one place.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>

          {/* Interactive AI Skill Gap Preview Widget */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive AI Diagnosis Preview
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Select a Target Career Benchmark:
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {Object.keys(demoRoles).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedRole === role
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Score & Tags */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div className="text-4xl font-black text-emerald-600 tracking-tight">
                    {currentDemo.match}%
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-1">Skill Match Score</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calculated against 2026 industry requirements
                  </p>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Matched Skills (Demonstrated Knowledge):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentDemo.core.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Identified Missing Skills (Target Upskilling):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentDemo.missing.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold"
                        >
                          ⚡ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <span>Want to analyze your custom profile?</span>
                <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <span>Sign up to analyze full portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Portals Showcase */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              One Unified Architecture
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Engineered for Every Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Four specialized, role-tailored dashboards connecting education with employability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Students</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Simple, beginner-friendly dashboard. Diagnose skill deficits, get personalized course roadmaps, and apply to matching internships in 1 click.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  AI Skill Gap Vector
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  QR Verified Credentials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Interactive Career Roadmap
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Companies</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Hire with confidence. Post jobs, filter applicants by precise skill match %, and earn trust badges with MCA & GSTIN verification.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                  Verified Corporate Badge
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                  Candidate Match Ranking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                  Company Trust Score
                </li>
              </ul>
            </div>

            {/* Academician */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Academicians</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Bridge the academic-industry chasm. Analyze curriculum alignment against real market data and recommend modern electives.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                  Curriculum Gap Analyzer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                  2026 Skill Demand Trends
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                  Elective Recommendations
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admins</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Complete platform integrity. Review company legal IDs, approve verified certificates, and moderate job postings to prevent fraud.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  Company Document Audits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  Certificate Verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  Platform-Wide Analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Public Quick Certificate Verification Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Verify a Student Credential</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Employers & institutions can immediately check validity using a unique Certificate ID.
          </p>

          <form onSubmit={handleCertSearch} className="mt-6 flex max-w-md mx-auto gap-2">
            <input
              type="text"
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              placeholder="e.g. SB-CERT-2026-REACT"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Verify Now
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <Logo size="md" variant="dark" />
          </div>

          <p className="text-xs text-slate-400">
            © 2026 EkJagah Ecosystem. Built with React, Node.js, Express & PostgreSQL.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/courses" className="hover:text-white transition">Courses</Link>
            <Link to="/jobs" className="hover:text-white transition">Jobs</Link>
            <Link to="/login" className="hover:text-white transition">Portal Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
