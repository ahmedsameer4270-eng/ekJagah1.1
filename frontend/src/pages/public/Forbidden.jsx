import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Forbidden = () => {
  const { user } = useAuth();

  const getDashboard = () => {
    switch (user?.role) {
      case 'Student': return '/student/dashboard';
      case 'Company': return '/company/dashboard';
      case 'Academician': return '/academician/dashboard';
      case 'Admin': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-rose-500">403 Forbidden</span>
        <h1 className="text-2xl font-black text-slate-900 mt-1 mb-2">Access Restricted</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          You do not have the required role permissions ({user?.role || 'Guest'}) to access this workspace. Role-Based Access Control guards this protected section.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            to={getDashboard()}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Role</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
