import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Logo } from './Logo';
import {
  Sparkles,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  Building2,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Student':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: GraduationCap,
          label: 'Student Portal',
          dashboard: '/student/dashboard'
        };
      case 'Company':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: Building2,
          label: 'Recruiter Portal',
          dashboard: '/company/dashboard'
        };
      case 'Academician':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: BookOpen,
          label: 'Academic Portal',
          dashboard: '/academician/dashboard'
        };
      case 'Admin':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Shield,
          label: 'Admin Portal',
          dashboard: '/admin/dashboard'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: User,
          label: 'User',
          dashboard: '/'
        };
    }
  };

  const roleMeta = user ? getRoleBadge(user.role) : null;
  const RoleIcon = roleMeta ? roleMeta.icon : null;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="group flex items-center">
              <Logo size="md" />
            </Link>

            {/* Role indicator tag */}
            {user && (
              <span className={`hidden md:inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 text-xs font-semibold rounded-full border ${roleMeta.bg}`}>
                {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                {roleMeta.label}
              </span>
            )}
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/courses"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Courses
            </Link>
            <Link
              to="/jobs"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Jobs & Internships
            </Link>
            <Link
              to="/verify-cert/SB-CERT-2026-REACT"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Verify Certificate
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                        {user.profile?.full_name || user.profile?.company_name || user.email.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 capitalize">{user.role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user.profile?.full_name || user.profile?.company_name || user.email}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={roleMeta.dashboard}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>

                        {user.role === 'Student' && (
                          <Link
                            to="/student/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile
                          </Link>
                        )}

                        {user.role === 'Company' && (
                          <Link
                            to="/company/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Company Profile
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow-md transition active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Courses Catalog
          </Link>
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Jobs & Internships
          </Link>
          <Link
            to="/verify-cert/SB-CERT-2026-REACT"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Verify Certificate
          </Link>
          {user && (
            <Link
              to={roleMeta.dashboard}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-600 bg-brand-50"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
