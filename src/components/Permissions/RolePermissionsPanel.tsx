import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Check, 
  RotateCcw, 
  Save, 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  FileText, 
  Building2, 
  Layers, 
  Target, 
  MessageSquare, 
  Briefcase, 
  History, 
  UserCheck, 
  Calendar, 
  KeyRound,
  Download,
  Trash2,
  Edit3,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { UserRole, AppMenuId, RolePermissionsMap } from '../../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../../mockData';

const ALL_ROLES: UserRole[] = [
  'Super Admin',
  'Director / Management',
  'HR Head',
  'Team Leader',
  'HR Executive',
  'Recruiter',
  'Interviewer'
];

interface ModulePermissionItem {
  id: AppMenuId;
  name: string;
  category: 'Recruitment Ops' | 'Offers & Policies' | 'Masters & Org' | 'Reports & Security';
  description: string;
  badge?: string;
}

const SYSTEM_MODULES: ModulePermissionItem[] = [
  // Recruitment Ops
  { id: 'dashboard', name: 'Dashboard Overview', category: 'Recruitment Ops', description: 'Pipeline analytics, daily target trackers, and performance KPIs' },
  { id: 'candidates', name: 'Candidate Master', category: 'Recruitment Ops', description: 'Full applicant database, screening, status tracking, and resumes' },
  { id: 'followups', name: 'Follow-ups Queue', category: 'Recruitment Ops', description: 'Calling queue, reminders, reschedule requests, and dispositions' },
  { id: 'interviews', name: 'Interviews & Scorecards', category: 'Recruitment Ops', description: 'Interview schedule calendar, attendance check, and rubric feedback' },
  { id: 'joining', name: 'Selected & Active Joining', category: 'Recruitment Ops', description: 'Selected talent pipeline, document audit, and active 7-day retention tracking' },
  { id: 'jobs', name: 'Job Openings Master', category: 'Recruitment Ops', description: 'Vacancy management, hiring requirements, and departmental requisitions' },

  // Offers & Policies
  { id: 'offer-letters', name: 'Offer Letters & CTC', category: 'Offers & Policies', description: 'Salary offer builder, CTC component breakdown, and WhatsApp dispatch' },
  { id: 'terms-conditions', name: 'Terms & Policies Master', category: 'Offers & Policies', description: 'Employment legal clauses, probation policies, POSH, and NDA terms' },

  // Masters & Org
  { id: 'companies', name: 'Company Master', category: 'Masters & Org', description: 'Multi-entity corporate registry (Essential Soul, BKD Retail, Soul Organic)' },
  { id: 'users', name: 'User & Staff Management', category: 'Masters & Org', description: 'Employee accounts, password provisioning, and departmental mapping' },
  { id: 'departments', name: 'Department Master', category: 'Masters & Org', description: 'Department hierarchies, team leaders, and recruitment quotas' },
  { id: 'targets', name: 'Target Management', category: 'Masters & Org', description: 'Daily interview benchmarks and monthly active joining quotas' },
  { id: 'permissions', name: 'Roles & Permissions', category: 'Masters & Org', description: 'Access control matrices, role security, and capability restrictions', badge: 'Security' },
  { id: 'import-export', name: 'Bulk Import / Export', category: 'Masters & Org', description: 'Bulk CSV & XLS spreadsheet data migration with sample download templates', badge: 'Data' },

  // Reports & Security
  { id: 'reports', name: 'Reports & Analytics', category: 'Reports & Security', description: 'Candidate sourcing ROI, conversion velocity, and team daily performance' },
  { id: 'templates', name: 'WhatsApp Templates', category: 'Reports & Security', description: 'Automated messaging templates for interviews, selections, and followups' },
  { id: 'audit', name: 'Audit Trail & Security', category: 'Reports & Security', description: 'Immutable activity log of status updates, deletions, and user actions' },
];

export const RolePermissionsPanel: React.FC = () => {
  const { 
    rolePermissions, 
    updateRolePermissions, 
    currentUser, 
    allUsers, 
    setCurrentUser 
  } = useRecruitment();

  const [localPermissions, setLocalPermissions] = useState<RolePermissionsMap>(rolePermissions);
  const [selectedRole, setSelectedRole] = useState<UserRole>('HR Executive');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [saveToast, setSaveToast] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const canEdit = currentUser.role === 'Super Admin' || currentUser.role === 'Director / Management';
  const isSuperAdminRole = selectedRole === 'Super Admin';

  // Count users assigned to each role
  const roleUserCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_ROLES.forEach(r => {
      counts[r] = allUsers.filter(u => u.role === r && u.status === 'Active').length;
    });
    return counts;
  }, [allUsers]);

  // Users for current selected role
  const usersWithRole = useMemo(() => {
    return allUsers.filter(u => u.role === selectedRole);
  }, [allUsers, selectedRole]);

  // Current allowed menus for selected role
  const currentAllowedMenus = localPermissions[selectedRole] || [];

  // Toggle single permission
  const handleTogglePermission = (menuId: AppMenuId) => {
    if (!canEdit || isSuperAdminRole) return;

    setLocalPermissions(prev => {
      const currentList = prev[selectedRole] || [];
      const has = currentList.includes(menuId);
      const updated = has 
        ? currentList.filter(id => id !== menuId)
        : [...currentList, menuId];

      return {
        ...prev,
        [selectedRole]: updated
      };
    });
    setHasUnsavedChanges(true);
  };

  // Grant all in category
  const handleSelectAllCategory = (category: string) => {
    if (!canEdit || isSuperAdminRole) return;
    const modulesInCat = SYSTEM_MODULES.filter(m => m.category === category).map(m => m.id);
    
    setLocalPermissions(prev => {
      const currentList = prev[selectedRole] || [];
      const union = Array.from(new Set([...currentList, ...modulesInCat]));
      return {
        ...prev,
        [selectedRole]: union
      };
    });
    setHasUnsavedChanges(true);
  };

  // Clear all in category
  const handleClearCategory = (category: string) => {
    if (!canEdit || isSuperAdminRole) return;
    const modulesInCat = new Set(SYSTEM_MODULES.filter(m => m.category === category).map(m => m.id));
    
    setLocalPermissions(prev => {
      const currentList = prev[selectedRole] || [];
      const remaining = currentList.filter(id => !modulesInCat.has(id));
      return {
        ...prev,
        [selectedRole]: remaining
      };
    });
    setHasUnsavedChanges(true);
  };

  // Save changes to context & localStorage
  const handleSave = () => {
    ALL_ROLES.forEach(r => {
      if (localPermissions[r]) {
        updateRolePermissions(r, localPermissions[r]);
      }
    });
    setHasUnsavedChanges(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Reset selected role to default
  const handleResetRoleToDefault = () => {
    if (isSuperAdminRole) return;
    if (confirm(`Reset permissions for role "${selectedRole}" to default configuration?`)) {
      setLocalPermissions(prev => ({
        ...prev,
        [selectedRole]: DEFAULT_ROLE_PERMISSIONS[selectedRole] || []
      }));
      setHasUnsavedChanges(true);
    }
  };

  // Reset all roles
  const handleResetAllToDefaults = () => {
    if (confirm('Reset ALL roles and permissions to system defaults?')) {
      setLocalPermissions(DEFAULT_ROLE_PERMISSIONS);
      ALL_ROLES.forEach(r => {
        updateRolePermissions(r, DEFAULT_ROLE_PERMISSIONS[r]);
      });
      setHasUnsavedChanges(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }
  };

  // Filter modules
  const filteredModules = useMemo(() => {
    return SYSTEM_MODULES.filter(mod => {
      const matchQuery = 
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || mod.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [searchQuery, categoryFilter]);

  // Group modules by category
  const categories = ['Recruitment Ops', 'Offers & Policies', 'Masters & Org', 'Reports & Security'] as const;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Roles & Permissions Management
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Role-Based Access Control (RBAC)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure module visibility, menu entitlements, and functional authority for all 7 organizational roles across Essential Soul.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-reset-permissions-default"
              onClick={handleResetAllToDefaults}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all role permissions to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Defaults</span>
            </button>

            <button
              id="btn-save-permissions"
              onClick={handleSave}
              disabled={!canEdit || !hasUnsavedChanges}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{hasUnsavedChanges ? 'Save Changes *' : 'Saved'}</span>
            </button>
          </div>
        </div>

        {/* Save feedback toast */}
        <AnimatePresence>
          {saveToast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Permissions updated successfully across the entire recruitment workspace.</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Synced</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Grid: Left Role Selector + Right Permission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Role Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Defined Roles ({ALL_ROLES.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Select to inspect
              </span>
            </div>

            <div className="space-y-1.5">
              {ALL_ROLES.map((role) => {
                const isSelected = selectedRole === role;
                const userCount = roleUserCounts[role] || 0;
                const allowedCount = (localPermissions[role] || []).length;
                const isSuper = role === 'Super Admin';

                return (
                  <button
                    key={role}
                    id={`btn-select-role-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/80 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {role === 'Super Admin' ? 'SA' : role === 'Director / Management' ? 'DR' : role.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {role}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span>{userCount} {userCount === 1 ? 'staff' : 'staff members'}</span>
                          <span>•</span>
                          <span className={isSuper ? 'text-purple-600 dark:text-purple-400 font-medium' : ''}>
                            {isSuper ? 'All Modules' : `${allowedCount}/${SYSTEM_MODULES.length} modules`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-blue-600 dark:text-blue-400 translate-x-0.5' : 'text-slate-400'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Personnel Card for Selected Role */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Assigned Users ({usersWithRole.length})</span>
              </span>
            </div>

            {usersWithRole.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 px-1">
                No employees currently assigned to this role.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {usersWithRole.map((u) => (
                  <div 
                    key={u.id}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {u.email}
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Persona Switcher for Quick Verification */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Persona Preview</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Want to verify how the sidebar adjusts for this role? Switch your active persona below:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.slice(0, 5).map(r => {
                const targetUser = allUsers.find(u => u.role === r);
                if (!targetUser) return null;
                const isCurrent = currentUser.role === r;

                return (
                  <button
                    key={r}
                    onClick={() => setCurrentUser(targetUser)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {r.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Permission Matrix (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Role Control Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Configuring:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedRole}
                </span>
                {isSuperAdminRole && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                    Permanent Full Master
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isSuperAdminRole 
                  ? 'Super Admin has unconditional full access to all system modules and cannot be restricted.'
                  : `${currentAllowedMenus.length} of ${SYSTEM_MODULES.length} modules granted access.`}
              </p>
            </div>

            {!isSuperAdminRole && canEdit && (
              <button
                id="btn-reset-single-role-default"
                onClick={handleResetRoleToDefault}
                className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset role to default</span>
              </button>
            )}
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules or permissions (e.g., offer, interview, target)..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Modules' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Module Categories & Matrix */}
          <div className="space-y-4">
            {categories.map((category) => {
              const modulesInCat = filteredModules.filter(m => m.category === category);
              if (modulesInCat.length === 0) return null;

              const totalInCat = SYSTEM_MODULES.filter(m => m.category === category).length;
              const grantedInCat = modulesInCat.filter(m => currentAllowedMenus.includes(m.id)).length;
              const allGranted = grantedInCat === totalInCat;

              return (
                <div 
                  key={category}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Category Header */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {category}
                      </span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full font-medium">
                        {grantedInCat}/{totalInCat} Enabled
                      </span>
                    </div>

                    {!isSuperAdminRole && canEdit && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectAllCategory(category)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <button
                          onClick={() => handleClearCategory(category)}
                          className="text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Module List in Category */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {modulesInCat.map((mod) => {
                      const isGranted = isSuperAdminRole || currentAllowedMenus.includes(mod.id);

                      return (
                        <div 
                          key={mod.id}
                          onClick={() => handleTogglePermission(mod.id)}
                          className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                            isSuperAdminRole 
                              ? 'opacity-90' 
                              : canEdit 
                                ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40' 
                                : 'cursor-default'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {mod.name}
                              </span>
                              {mod.badge && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                                  {mod.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {mod.description}
                            </p>
                          </div>

                          {/* Toggle Switch / State */}
                          <div className="shrink-0 flex items-center gap-2">
                            <span className={`text-[11px] font-medium ${
                              isGranted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}>
                              {isGranted ? 'Allowed' : 'Restricted'}
                            </span>

                            <div 
                              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                                isGranted 
                                  ? 'bg-blue-600' 
                                  : 'bg-slate-300 dark:bg-slate-700'
                              } ${isSuperAdminRole ? 'opacity-80' : ''}`}
                            >
                              <div 
                                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                                  isGranted ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
