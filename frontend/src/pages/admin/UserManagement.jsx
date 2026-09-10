import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  Building2,
  BookOpen
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Student': return GraduationCap;
      case 'Company': return Building2;
      case 'Academician': return BookOpen;
      case 'Admin': return Shield;
      default: return Users;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-3 border border-amber-200">
          <Users className="w-3.5 h-3.5" />
          <span>User Registry & Accounts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Platform User Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Complete registry of Students, Corporate Recruiters, Faculty Academicians, and Administrators.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">User Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Email Verification</th>
                <th className="pb-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const Icon = getRoleIcon(u.role);
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-bold text-slate-900">{u.email}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        <Icon className="w-3 h-3 text-slate-500" />
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          u.is_verified ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {u.is_verified ? 'Verified' : 'Pending OTP'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
