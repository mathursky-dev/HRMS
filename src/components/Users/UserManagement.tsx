import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Layers, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  X, 
  UserCheck, 
  Award,
  Filter,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Lock,
  Send,
  AlertCircle,
  AlertTriangle,
  UserX,
  ToggleLeft,
  ToggleRight,
  Power
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { UserProfile, UserRole, Department } from '../../types';
import { RolePermissionModal } from '../Permissions/RolePermissionModal';
import { UserCredentialsMasterModal } from './UserCredentialsMasterModal';

export const UserManagement: React.FC = () => {
  const { 
    allUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    currentUser, 
    setCurrentUser,
    companies,
    departmentsList 
  } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCredentialsMasterOpen, setIsCredentialsMasterOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // In-app delete user confirmation state & toast notifications
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Credentials and Quick Actions State
  const [visibleTablePasswords, setVisibleTablePasswords] = useState<Record<string, boolean>>({});
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [quickResetUser, setQuickResetUser] = useState<UserProfile | null>(null);
  const [quickNewPassword, setQuickNewPassword] = useState('');

  // Password generator helper
  const generateRandomPassword = (name?: string): string => {
    const base = name ? name.split(' ')[0].replace(/[^a-zA-Z]/g, '') : 'Staff';
    const cap = (base || 'Staff').charAt(0).toUpperCase() + (base || 'Staff').slice(1).toLowerCase();
    const specials = ['@', '#', '$', '!'];
    const spec = specials[Math.floor(Math.random() * specials.length)];
    return `${cap}${spec}2026`;
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'HR Executive' as UserRole,
    department: 'HR Recruitment' as Department,
    companyId: 'comp-1',
    dailyInterviewTarget: 5,
    monthlyActiveJoiningTarget: 20,
    status: 'Active' as 'Active' | 'Inactive',
    userId: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'HR Executive',
      department: departmentsList[0]?.name || 'HR Recruitment',
      companyId: companies[0]?.id || 'comp-1',
      dailyInterviewTarget: 5,
      monthlyActiveJoiningTarget: 20,
      status: 'Active',
      userId: '',
      password: generateRandomPassword(),
    });
    setShowPasswordInModal(true);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      companyId: user.companyId || (companies[0]?.id || 'comp-1'),
      dailyInterviewTarget: user.dailyInterviewTarget || 0,
      monthlyActiveJoiningTarget: user.monthlyActiveJoiningTarget || 0,
      status: user.status || 'Active',
      userId: user.userId || user.email.split('@')[0],
      password: user.password || `${user.name.split(' ')[0]}@2026`,
    });
    setShowPasswordInModal(false);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Valid email is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const matchedCompany = companies.find(c => c.id === formData.companyId);
    const companyName = matchedCompany ? matchedCompany.name : 'Essential Soul Lifestyle Pvt Ltd';
    const effectiveUserId = formData.userId.trim() || formData.email.split('@')[0] || formData.name.toLowerCase().trim().replace(/\s+/g, '.');
    const effectivePassword = formData.password.trim() || generateRandomPassword(formData.name);

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department,
        companyId: formData.companyId,
        companyName,
        dailyInterviewTarget: Number(formData.dailyInterviewTarget) || 0,
        monthlyActiveJoiningTarget: Number(formData.monthlyActiveJoiningTarget) || 0,
        status: formData.status,
        userId: effectiveUserId,
        password: effectivePassword,
        lastPasswordChanged: new Date().toISOString(),
      });
    } else {
      addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department,
        companyId: formData.companyId,
        companyName,
        dailyInterviewTarget: Number(formData.dailyInterviewTarget) || 0,
        monthlyActiveJoiningTarget: Number(formData.monthlyActiveJoiningTarget) || 0,
        status: formData.status,
        userId: effectiveUserId,
        password: effectivePassword,
        lastPasswordChanged: new Date().toISOString(),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      setActionToast({
        type: 'error',
        message: `You cannot delete the active logged-in user profile (${user.name}). Please switch to another user before deleting this profile.`,
      });
      setTimeout(() => setActionToast(null), 5000);
      return;
    }
    if (allUsers.length <= 1) {
      setActionToast({
        type: 'error',
        message: 'Cannot delete user: At least one user profile must remain in the system to administer the CRM.',
      });
      setTimeout(() => setActionToast(null), 5000);
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const targetName = userToDelete.name;
    const targetRole = userToDelete.role;
    const targetId = userToDelete.id;
    deleteUser(targetId);
    setUserToDelete(null);
    setActionToast({
      type: 'success',
      message: `User "${targetName}" (${targetRole}) was successfully removed from the team.`,
    });
    setTimeout(() => setActionToast(null), 4500);
  };

  // Toggle user active/inactive status
  const handleToggleUserStatus = (user: UserProfile) => {
    const currentStatus = user.status || 'Active';
    const nextStatus: 'Active' | 'Inactive' = currentStatus === 'Active' ? 'Inactive' : 'Active';

    // Guard: Prevent deactivating the active logged-in user
    if (nextStatus === 'Inactive' && user.id === currentUser.id) {
      setActionToast({
        type: 'error',
        message: `Cannot deactivate active logged-in user (${user.name}). Please switch active user profile before deactivating.`,
      });
      setTimeout(() => setActionToast(null), 5000);
      return;
    }

    updateUser(user.id, { status: nextStatus });

    // Sync status change to backend API/Supabase if available
    try {
      fetch(`/api/users/${encodeURIComponent(user.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      }).catch(() => {});
    } catch (e) { /* ignore */ }

    setActionToast({
      type: 'success',
      message: `User "${user.name}" is now ${nextStatus === 'Active' ? 'Active (available for assignments)' : 'Inactive (login disabled)'}.`,
    });
    setTimeout(() => setActionToast(null), 4000);
  };

  // Filtered Users
  const filteredUsers = allUsers.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesDept = deptFilter === 'ALL' || u.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || (u.status || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const activeCount = allUsers.filter(u => (u.status || 'Active') === 'Active').length;
  const inactiveCount = allUsers.filter(u => u.status === 'Inactive').length;
  const totalDailyTarget = allUsers.reduce((sum, u) => sum + (u.dailyInterviewTarget || 0), 0);
  const totalMonthlyTarget = allUsers.reduce((sum, u) => sum + (u.monthlyActiveJoiningTarget || 0), 0);
  const totalHrTeam = allUsers.filter(u => u.role === 'HR Executive' || u.role === 'HR Head' || u.role === 'Recruiter').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">User & Team Management</h1>
              <p className="text-xs text-slate-500">
                Manage HR executives, interviewers, directors, daily & monthly targets, and role permissions
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            id="btn-credentials-master"
            onClick={() => setIsCredentialsMasterOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>User ID & Password Master</span>
          </button>

          <button
            id="btn-open-permissions-modal"
            onClick={() => setIsPermissionsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Role Permissions</span>
          </button>

          <button
            id="btn-add-user"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast Banner */}
      {actionToast && (
        <div 
          id="user-management-toast-banner"
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${
            actionToast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionToast.message}</span>
          </div>
          <button 
            id="btn-close-action-toast"
            onClick={() => setActionToast(null)} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-black text-slate-900">{allUsers.length}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {activeCount} Active
              </span>
              {inactiveCount > 0 && (
                <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {inactiveCount} Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HR Recruiters</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{totalHrTeam}</span>
            <span className="text-xs text-slate-500">heads & executives</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Interview Goal</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalDailyTarget}</span>
            <span className="text-xs text-slate-500">interviews / day</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Joinings Goal</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{totalMonthlyTarget}</span>
            <span className="text-xs text-slate-500">active joinings / mo</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="HR Head">HR Head</option>
            <option value="HR Executive">HR Executive</option>
            <option value="Director / Management">Director / Management</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Interviewer">Interviewer</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="select-filter-user-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Status ({allUsers.length})</option>
            <option value="Active">Active Only ({activeCount})</option>
            <option value="Inactive">Inactive Only ({inactiveCount})</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of {allUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Login User ID & Password</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department & Company</th>
                <th className="py-3 px-4 text-center">Daily Target</th>
                <th className="py-3 px-4 text-center">Monthly Target</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = currentUser.id === user.id;
                  const effectiveUid = user.userId || user.email.split('@')[0];
                  const effectivePass = user.password || `${user.name.split(' ')[0]}@2026`;
                  const isPassVisible = !!visibleTablePasswords[user.id];

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {user.name}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[9px] font-bold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Login Credentials (User ID & Password) */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
                              {effectiveUid}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(effectiveUid);
                                setCopiedTableId(`uid-${user.id}`);
                                setTimeout(() => setCopiedTableId(null), 2000);
                              }}
                              title="Copy User ID"
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            >
                              {copiedTableId === `uid-${user.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              {isPassVisible ? effectivePass : '••••••••'}
                            </span>
                            <button
                              onClick={() => setVisibleTablePasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                              title={isPassVisible ? "Hide Password" : "Show Password"}
                              className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            >
                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                setQuickResetUser(user);
                                setQuickNewPassword(generateRandomPassword(user.name));
                              }}
                              title="Reset Password"
                              className="p-0.5 text-slate-400 hover:text-amber-600 rounded transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 text-slate-600 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[10px]">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          user.role === 'Super Admin'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : user.role === 'Director / Management'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user.role === 'HR Head'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* Department & Company */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {user.department}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {user.companyName || 'Essential Soul Lifestyle Pvt Ltd'}
                          </div>
                        </div>
                      </td>

                      {/* Daily Interview Target */}
                      <td className="py-3 px-4 text-center">
                        {user.dailyInterviewTarget > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                            <Target className="w-3 h-3 text-emerald-500" />
                            <span>{user.dailyInterviewTarget} / day</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Monthly Joining Target */}
                      <td className="py-3 px-4 text-center">
                        {user.monthlyActiveJoiningTarget > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                            <Award className="w-3 h-3 text-blue-500" />
                            <span>{user.monthlyActiveJoiningTarget} / mo</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          id={`btn-toggle-status-cell-${user.id}`}
                          type="button"
                          onClick={() => handleToggleUserStatus(user)}
                          title={
                            isCurrent && (user.status || 'Active') === 'Active'
                              ? "Active session user cannot be deactivated"
                              : (user.status === 'Inactive' ? "Click to Activate this user" : "Click to Deactivate this user")
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all shadow-2xs cursor-pointer ${
                            user.status === 'Inactive'
                              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 hover:text-slate-800'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                          }`}
                        >
                          <span 
                            className={`w-2 h-2 rounded-full ${
                              user.status === 'Inactive' 
                                ? 'bg-slate-400' 
                                : 'bg-emerald-500 animate-pulse'
                            }`} 
                          />
                          <span>{user.status === 'Inactive' ? 'Inactive' : 'Active'}</span>
                          {user.status === 'Inactive' ? (
                            <ToggleLeft className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                          ) : (
                            <ToggleRight className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isCurrent && (
                            <button
                              onClick={() => setCurrentUser(user)}
                              title="Switch active session to this user"
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Switch
                            </button>
                          )}
                          <button
                            id={`btn-toggle-status-action-${user.id}`}
                            type="button"
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.status === 'Inactive' ? `Set ${user.name} to Active` : `Set ${user.name} to Inactive`}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              user.status === 'Inactive'
                                ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {user.status === 'Inactive' ? (
                              <UserCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit User"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-user-${user.id}`}
                            onClick={() => handleDeleteUser(user)}
                            title={isCurrent ? "Active logged-in user profile cannot be deleted" : `Delete ${user.name}`}
                            className={`p-1.5 rounded-md transition-colors ${
                              isCurrent 
                                ? 'text-slate-300 hover:text-slate-400 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingUser ? 'Edit User Profile' : 'Add New Team Member'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure role permissions, targets, and company department allocation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nandani or Shivani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                {formErrors.name && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@essentialsoul.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.email && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role & Permissions
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="HR Executive">HR Executive (Recruiter)</option>
                    <option value="HR Head">HR Head (Lead Recruiter)</option>
                    <option value="Director / Management">Director / Management</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Interviewer">Interviewer</option>
                    <option value="Team Leader">Team Leader</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Login Credentials Master Configuration */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50/70 to-blue-50/70 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    Login Credentials (User ID & Password)
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Used for System Sign-In</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* User ID */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Login User ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. nandani.hr or aditya.m"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="w-full pl-2.5 pr-14 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.name) {
                            const suggested = formData.name.toLowerCase().trim().replace(/\s+/g, '.');
                            setFormData({ ...formData, userId: suggested });
                          } else if (formData.email) {
                            setFormData({ ...formData, userId: formData.email.split('@')[0] });
                          }
                        }}
                        className="absolute right-1 top-1 bottom-1 px-2 text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded transition-colors cursor-pointer"
                      >
                        Auto
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Staff sign-in username / handle</p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Login Password
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type={showPasswordInModal ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-2.5 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, password: generateRandomPassword(formData.name) })}
                        title="Generate random password"
                        className="px-2 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Random</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Share with staff upon onboarding</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Company Entity
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Settings */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  Performance Targets
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                      Daily Interview Target (Interviews/Day)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.dailyInterviewTarget}
                      onChange={(e) => setFormData({ ...formData, dailyInterviewTarget: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                      Monthly Active Joining Target (Joinings/Mo)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={formData.monthlyActiveJoiningTarget}
                      onChange={(e) => setFormData({ ...formData, monthlyActiveJoiningTarget: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Active / Inactive Status Selector */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                    Account Status
                  </label>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    formData.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {formData.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    id="btn-modal-status-active"
                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.status === 'Active'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active User</span>
                  </button>

                  <button
                    type="button"
                    id="btn-modal-status-inactive"
                    onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.status === 'Inactive'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Inactive User</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {formData.status === 'Active' 
                    ? 'Active user: Allowed to log in and available for candidate & interview assignments.' 
                    : 'Inactive user: Login disabled and hidden from new lead assignment queues.'}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {editingUser && editingUser.id !== currentUser.id ? (
                  <button
                    type="button"
                    id="btn-edit-modal-delete-user"
                    onClick={() => {
                      const userToDel = editingUser;
                      setIsAddModalOpen(false);
                      handleDeleteUser(userToDel);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    id="btn-cancel-user-modal"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-user-modal"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer"
                  >
                    {editingUser ? 'Save User' : 'Create User'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* Role Permission Management Modal */}
      {isPermissionsModalOpen && (
        <RolePermissionModal onClose={() => setIsPermissionsModalOpen(false)} />
      )}

      {/* User Credentials Master Modal */}
      {isCredentialsMasterOpen && (
        <UserCredentialsMasterModal onClose={() => setIsCredentialsMasterOpen(false)} />
      )}

      {/* Quick Password Reset Dialog */}
      {quickResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
                  <KeyRound className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Reset Staff Password</h3>
                  <p className="text-[11px] text-amber-100">Set new password for {quickResetUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setQuickResetUser(null)}
                className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* User overview */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{quickResetUser.name}</div>
                  <div className="text-[11px] text-slate-500">{quickResetUser.role} • {quickResetUser.department}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-700 font-semibold block uppercase">User ID</span>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200 select-all">
                    {quickResetUser.userId || quickResetUser.email.split('@')[0]}
                  </span>
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Login Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickNewPassword}
                    onChange={(e) => setQuickNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setQuickNewPassword(generateRandomPassword(quickResetUser.name))}
                    title="Generate random password"
                    className="px-2.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Generate</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  We suggest a strong password with letters, special characters, and digits.
                </p>
              </div>

              {/* Copy Template Preview */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-mono">
                <div><strong>User ID:</strong> {quickResetUser.userId || quickResetUser.email.split('@')[0]}</div>
                <div><strong>New Password:</strong> {quickNewPassword}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                id="btn-quick-reset-copy-credentials"
                onClick={() => {
                  const uid = quickResetUser.userId || quickResetUser.email.split('@')[0];
                  const copyText = `Essential Soul Recruitment Portal Credentials:\nUser ID: ${uid}\nPassword: ${quickNewPassword}\nURL: ${window.location.origin}`;
                  navigator.clipboard.writeText(copyText);
                  setActionToast({ type: 'success', message: 'Credentials copied to clipboard!' });
                  setTimeout(() => setActionToast(null), 3000);
                }}
                className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Credentials</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-quick-reset-cancel"
                  onClick={() => setQuickResetUser(null)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-white rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-quick-reset-save"
                  onClick={() => {
                    if (!quickNewPassword.trim()) {
                      setActionToast({ type: 'error', message: 'Please enter or generate a new password.' });
                      setTimeout(() => setActionToast(null), 3000);
                      return;
                    }
                    updateUser(quickResetUser.id, {
                      password: quickNewPassword.trim(),
                      lastPasswordChanged: new Date().toISOString(),
                    });
                    const userName = quickResetUser.name;
                    setQuickResetUser(null);
                    setActionToast({ type: 'success', message: `Password for ${userName} updated successfully.` });
                    setTimeout(() => setActionToast(null), 4000);
                  }}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete User Confirmation Dialog */}
      {userToDelete && (
        <div 
          id="modal-delete-user-backdrop"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div 
            id="modal-delete-user-container"
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete User Account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to permanently remove <span className="font-semibold text-slate-900">{userToDelete.name}</span> from the CRM team?
                </p>

                <div className="mt-3.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Designation / Role:</span>
                    <span className="font-semibold text-slate-800">{userToDelete.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-700">{userToDelete.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-medium text-slate-700">{userToDelete.companyName || 'Essential Soul Lifestyle Pvt Ltd'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">User ID:</span>
                    <span className="font-mono font-bold text-blue-700">{userToDelete.userId || userToDelete.email.split('@')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-slate-600">{userToDelete.email}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Deleting this user will revoke their credentials and portal login access. Historical interview remarks and audit trail logs remain preserved.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                id="btn-cancel-delete-user"
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-user"
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
