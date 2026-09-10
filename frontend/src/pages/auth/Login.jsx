import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Shield,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedState, setUnverifiedState] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedState(null);
    setLoading(true);

    try {
      const user = await login(email, password, role, rememberMe);
      // Redirect based on role
      switch (user.role) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Company':
          navigate('/company/dashboard');
          break;
        case 'Academician':
          navigate('/academician/dashboard');
          break;
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      if (err.response?.data?.unverified) {
        setUnverifiedState({
          email: err.response.data.email,
          token: err.response.data.verificationToken
        });
        setError('Email not verified. Please verify your email before logging in.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill demo accounts
  const autofill = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'Student') {
      setEmail('student@skillbridge.edu');
      setPassword('Student@12345');
    } else if (demoRole === 'Company') {
      setEmail('recruiter@techcorp.com');
      setPassword('Company@12345');
    } else if (demoRole === 'Academician') {
      setEmail('prof.gupta@iitb.ac.in');
      setPassword('Academic@12345');
    } else if (demoRole === 'Admin') {
      setEmail('admin@skillbridge.gov.in');
      setPassword('Admin@12345');
    }
  };

  const roleConfigs = [
    { id: 'Student', label: 'Student', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
    { id: 'Company', label: 'Company', icon: Building2, color: 'text-sky-600 bg-sky-50 border-sky-300' },
    { id: 'Academician', label: 'Academician', icon: BookOpen, color: 'text-purple-600 bg-purple-50 border-purple-300' },
    { id: 'Admin', label: 'Admin', icon: Shield, color: 'text-amber-600 bg-amber-50 border-amber-300' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-white">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 p-1.5 shadow-xl shadow-indigo-500/25 border border-slate-800/50 mb-4 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="EkJagah Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back to EkJagah
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your unified career ecosystem & intelligence portal
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="mb-6 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
            ⚡ Quick Demo Auto-Fill:
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {roleConfigs.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => autofill(r.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold border transition ${
                  role === r.id ? r.color : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <r.icon className="w-4 h-4" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Login Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {unverifiedState && (
                  <div className="mt-2">
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(unverifiedState.email)}&token=${unverifiedState.token || ''}`}
                      className="font-bold underline text-rose-800"
                    >
                      Click here to enter verification code ({unverifiedState.token})
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as {role}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
