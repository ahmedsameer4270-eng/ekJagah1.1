import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Sparkles,
  Map,
  Briefcase,
  BookOpen,
  Award,
  User,
  ClipboardCheck,
  FileText,
  Building2,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Layers,
  ShieldAlert,
  Users
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getLinks = () => {
    switch (role) {
      case 'Student':
        return [
          { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
          { name: 'AI Skill Gap', to: '/student/skill-gap', icon: Sparkles, badge: 'AI' },
          { name: 'Skill Assessment', to: '/student/assessment', icon: ClipboardCheck, badge: 'NEW' },
          { name: 'Resume Builder', to: '/student/resume', icon: FileText, badge: 'AI' },
          { name: 'My Roadmap', to: '/student/roadmap', icon: Map },
          { name: 'Jobs & Internships', to: '/student/jobs', icon: Briefcase },
          { name: 'Courses', to: '/student/courses', icon: BookOpen },
          { name: 'Certificates', to: '/student/certificates', icon: Award },
          { name: 'Profile', to: '/student/profile', icon: User },
        ];
      case 'Company':
        return [
          { name: 'Dashboard', to: '/company/dashboard', icon: LayoutDashboard },
          { name: 'Manage Jobs', to: '/company/jobs', icon: Briefcase },
          { name: 'Post New Job', to: '/company/post-job', icon: PlusCircle },
          { name: 'Trust & Verification', to: '/company/profile', icon: ShieldCheck, badge: user.profile?.verification_status || 'STATUS' },
        ];
      case 'Academician':
        return [
          { name: 'Dashboard', to: '/academician/dashboard', icon: LayoutDashboard },
          { name: 'Industry Trends', to: '/academician/trends', icon: TrendingUp },
          { name: 'Curriculum Gap', to: '/academician/curriculum-gap', icon: Layers, badge: 'Analyzer' },
        ];
      case 'Admin':
        return [
          { name: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Company Verifications', to: '/admin/companies', icon: ShieldAlert },
          { name: 'Certificate Approvals', to: '/admin/certificates', icon: Award },
          { name: 'Job Moderation', to: '/admin/jobs', icon: Briefcase },
          { name: 'User Management', to: '/admin/users', icon: Users },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const getRoleTheme = () => {
    switch (role) {
      case 'Student':
        return {
          activeClass: 'bg-emerald-50 text-emerald-700 font-semibold border-r-4 border-emerald-600',
          badgeClass: 'bg-emerald-100 text-emerald-800',
          portalName: 'Student Portal',
          accentColor: 'text-emerald-600'
        };
      case 'Company':
        return {
          activeClass: 'bg-sky-50 text-sky-700 font-semibold border-r-4 border-sky-600',
          badgeClass: 'bg-sky-100 text-sky-800',
          portalName: 'Corporate Recruiter',
          accentColor: 'text-sky-600'
        };
      case 'Academician':
        return {
          activeClass: 'bg-purple-50 text-purple-700 font-semibold border-r-4 border-purple-600',
          badgeClass: 'bg-purple-100 text-purple-800',
          portalName: 'Faculty & Academia',
          accentColor: 'text-purple-600'
        };
      case 'Admin':
        return {
          activeClass: 'bg-amber-50 text-amber-800 font-semibold border-r-4 border-amber-600',
          badgeClass: 'bg-amber-100 text-amber-800',
          portalName: 'Governance & Admin',
          accentColor: 'text-amber-600'
        };
      default:
        return {
          activeClass: 'bg-brand-50 text-brand-700 font-semibold',
          badgeClass: 'bg-brand-100 text-brand-800',
          portalName: 'Portal',
          accentColor: 'text-brand-600'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 min-h-[calc(100vh-4rem)] hidden md:block">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <Logo size="sm" showText={false} />
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Workspace
          </span>
          <h3 className={`text-sm font-bold ${theme.accentColor} leading-tight truncate`}>
            {theme.portalName}
          </h3>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition duration-150 group ${
                  isActive
                    ? theme.activeClass
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${theme.badgeClass}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
