import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">404 Error</span>
        <h1 className="text-2xl font-black text-slate-900 mt-1 mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The requested URL path does not exist on EkJagah. Check the navigation menu or return to the homepage.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
