import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Search, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Send, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useRecruitment } from '../../context/RecruitmentContext';

interface UserCredentialsMasterModalProps {
  onClose: () => void;
  onOpenResetForUser?: (user: UserProfile) => void;
}

export const UserCredentialsMasterModal: React.FC<UserCredentialsMasterModalProps> = ({ 
  onClose 
}) => {
  const { allUsers, updateUser, setCurrentUser, currentUser } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempUserId, setTempUserId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);
  const [newGeneratedPass, setNewGeneratedPass] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Generate strong random password
  const generateStrongPassword = (name?: string): string => {
    const prefixes = name ? [name.split(' ')[0]] : ['Soul', 'Crm', 'EsRecruit', 'Hire'];
    const cleanPrefix = (prefixes[0] || 'Soul').replace(/[^a-zA-Z]/g, '');
    const capitalized = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1).toLowerCase();
    const specials = ['@', '#', '$', '!'];
    const special = specials[Math.floor(Math.random() * specials.length)];
    const year = 2026;
    const randomNum = Math.floor(10 + Math.random() * 90);
    return `${capitalized}${special}${year}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyFullCredentials = (user: UserProfile) => {
    const uid = user.userId || user.email.split('@')[0];
    const pwd = user.password || `${user.name.split(' ')[0]}@2026`;
    const text = `======================================\n` +
      `ESSENTIAL SOUL RECRUITMENT CRM\n` +
      `Staff Login Credentials\n` +
      `======================================\n` +
      `Name: ${user.name}\n` +
      `Designation / Role: ${user.role}\n` +
      `Department: ${user.department}\n` +
      `Company: ${user.companyName || 'Essential Soul Lifestyle Pvt Ltd'}\n` +
      `--------------------------------------\n` +
      `User ID: ${uid}\n` +
      `Password: ${pwd}\n` +
      `--------------------------------------\n` +
      `Portal Link: ${window.location.origin}\n` +
      `Please change your password after initial login.\n` +
      `======================================`;
    
    handleCopy(text, `full-${user.id}`);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const toggleRevealAll = () => {
    const allVisible = Object.keys(visiblePasswords).length === allUsers.length && 
      Object.values(visiblePasswords).every(v => v);
    
    if (allVisible) {
      setVisiblePasswords({});
    } else {
      const next: Record<string, boolean> = {};
      allUsers.forEach(u => { next[u.id] = true; });
      setVisiblePasswords(next);
    }
  };

  const handleStartEdit = (user: UserProfile) => {
    setEditingUserId(user.id);
    setTempUserId(user.userId || user.email.split('@')[0]);
    setTempPassword(user.password || `${user.name.split(' ')[0]}@2026`);
  };

  const handleSaveEdit = (userId: string) => {
    if (!tempUserId.trim()) return;
    updateUser(userId, {
      userId: tempUserId.trim(),
      password: tempPassword.trim() || undefined,
      lastPasswordChanged: new Date().toISOString()
    });
    setEditingUserId(null);
    setActionSuccessMsg(`Credentials successfully updated for user.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleOpenResetModal = (user: UserProfile) => {
    const generated = generateStrongPassword(user.name);
    setResettingUser(user);
    setNewGeneratedPass(generated);
  };

  const handleConfirmPasswordReset = () => {
    if (!resettingUser || !newGeneratedPass.trim()) return;
    updateUser(resettingUser.id, {
      password: newGeneratedPass.trim(),
      lastPasswordChanged: new Date().toISOString()
    });
    setActionSuccessMsg(`Password for ${resettingUser.name} reset to: ${newGeneratedPass}`);
    setResettingUser(null);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const filtered = allUsers.filter(u => {
    const query = searchQuery.toLowerCase();
    const uid = (u.userId || '').toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      uid.includes(query) ||
      u.role.toLowerCase().includes(query);
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  User ID & Password Master
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold">
                  {allUsers.length} Registered Staff
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage login User IDs, set security passwords, generate credentials, and copy onboarding access kits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRevealAll}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Toggle Passwords</span>
            </button>
            <button
              id="btn-close-credentials-master"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter and Quick Stats Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, user ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="ALL">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Director / Management">Director / Management</option>
              <option value="HR Head">HR Head</option>
              <option value="HR Executive">HR Executive</option>
              <option value="Interviewer">Interviewer</option>
              <option value="Team Leader">Team Leader</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All passwords active</span>
            </div>
            <span className="text-slate-300">|</span>
            <span>Default policy: Min 6 characters</span>
          </div>
        </div>

        {/* Credentials Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4">Login User ID</th>
                  <th className="py-3 px-4">Login Password</th>
                  <th className="py-3 px-4 text-center">Last Password Update</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => {
                    const isEditing = editingUserId === user.id;
                    const isVisible = !!visiblePasswords[user.id];
                    const effectiveUserId = user.userId || user.email.split('@')[0];
                    const effectivePassword = user.password || `${user.name.split(' ')[0]}@2026`;
                    const isCurrent = currentUser.id === user.id;

                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isCurrent ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Name & Email */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[9px] font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Dept */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              {user.role}
                            </span>
                            <div className="text-[10px] text-slate-500">{user.department}</div>
                          </div>
                        </td>

                        {/* Login User ID */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempUserId}
                              onChange={(e) => setTempUserId(e.target.value)}
                              className="px-2 py-1 text-xs font-mono font-bold bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                            />
                          ) : (
                            <div className="inline-flex items-center gap-1.5 group">
                              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 font-mono font-bold text-xs border border-slate-200 select-all">
                                {effectiveUserId}
                              </span>
                              <button
                                onClick={() => handleCopy(effectiveUserId, `uid-${user.id}`)}
                                title="Copy User ID"
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                {copiedField === `uid-${user.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Login Password */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                className="px-2 py-1 text-xs font-mono font-bold bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                              />
                              <button
                                type="button"
                                onClick={() => setTempPassword(generateStrongPassword(user.name))}
                                title="Generate Password"
                                className="p-1 bg-slate-100 hover:bg-blue-50 text-blue-600 rounded transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-800 font-mono text-xs border border-slate-200">
                                {isVisible ? effectivePassword : '••••••••'}
                              </span>

                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                title={isVisible ? "Hide Password" : "Show Password"}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                {isVisible ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => handleCopy(effectivePassword, `pwd-${user.id}`)}
                                title="Copy Password"
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                {copiedField === `pwd-${user.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Last Password Update */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-[11px] text-slate-500">
                            {user.lastPasswordChanged 
                              ? new Date(user.lastPasswordChanged).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'System Initial'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(user.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(user)}
                                  title="Quick Edit User ID & Password"
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleOpenResetModal(user)}
                                  title="Reset Password"
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Reset</span>
                                </button>

                                <button
                                  onClick={() => handleCopyFullCredentials(user)}
                                  title="Copy All Login Info for WhatsApp / Email Onboarding"
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors cursor-pointer"
                                >
                                  {copiedField === `full-${user.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Send className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {!isCurrent && (
                                  <button
                                    onClick={() => {
                                      setCurrentUser(user);
                                      onClose();
                                    }}
                                    title="Switch session to this user"
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Guidance Box */}
          <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Login Credentials Master Protocol:</strong> Staff members can log into the CRM using either their assigned <strong>User ID</strong> or <strong>Registered Email</strong> along with their password.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200 font-semibold">
                Click <Send className="w-3 h-3 inline mx-0.5 text-blue-600" /> to copy WhatsApp message
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Changes made in this master update live session records instantly.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Close Master
          </button>
        </div>
      </div>

      {/* Sub-modal: Quick Password Reset Confirmation */}
      {resettingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Reset Password for {resettingUser.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  User ID: <code className="font-mono font-bold text-blue-600">{resettingUser.userId || resettingUser.email.split('@')[0]}</code>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                New Security Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGeneratedPass}
                  onChange={(e) => setNewGeneratedPass(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setNewGeneratedPass(generateStrongPassword(resettingUser.name))}
                  title="Generate another strong password"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>The employee will need to use this new password immediately upon next login.</span>
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPasswordReset}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply New Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
