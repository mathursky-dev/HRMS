import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Check, 
  RotateCcw, 
  Lock, 
  Info, 
  UserCheck,
  Building2,
  FileCheck,
  Scale
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { UserRole, AppMenuId, RolePermissionsMap } from '../../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../../mockData';

interface RolePermissionModalProps {
  onClose: () => void;
}

const ALL_ROLES: UserRole[] = [
  'Super Admin',
  'Director / Management',
  'HR Head',
  'Team Leader',
  'HR Executive',
  'Recruiter',
  'Interviewer'
];

interface MenuDefinition {
  id: AppMenuId;
  label: string;
  category: 'Core Pipeline' | 'Contracts & Policies' | 'Company & Master' | 'System & Reports';
  description: string;
}

const ALL_MENUS: MenuDefinition[] = [
  { id: 'dashboard', label: 'Dashboard Overview', category: 'Core Pipeline', description: 'Metrics, recruitment pipeline KPIs, and daily goals' },
  { id: 'candidates', label: 'Candidate Master', category: 'Core Pipeline', description: 'All candidates, bulk assignment, and status updates' },
  { id: 'followups', label: 'Follow-ups Queue', category: 'Core Pipeline', description: 'Calling queue, reminders, and follow-up logging' },
  { id: 'interviews', label: 'Interviews & Evaluation', category: 'Core Pipeline', description: 'Interview schedules, feedback scorecards, and attendance' },
  { id: 'joining', label: 'Selected & Joining Pipeline', category: 'Core Pipeline', description: 'Candidates selected, documents verified, and joining tracking' },
  { id: 'offer-letters', label: 'Offer Letters & Contracts', category: 'Contracts & Policies', description: 'Generate official salary offers, CTC breakdown, and WhatsApp delivery' },
  { id: 'terms-conditions', label: 'Terms & Conditions Policies', category: 'Contracts & Policies', description: 'Official company clauses, employment regulations, and NDA handbook' },
  { id: 'jobs', label: 'Job Openings Master', category: 'Company & Master', description: 'Active and closed job vacancies across departments' },
  { id: 'companies', label: 'Company Master', category: 'Company & Master', description: 'Multi-entity corporate profiles, CIN, GSTIN, and signatories' },
  { id: 'departments', label: 'Department Master', category: 'Company & Master', description: 'Department hierarchies, head assignments, and store teams' },
  { id: 'targets', label: 'Target Management', category: 'Company & Master', description: 'Monthly recruitment targets, hiring quotas, and incentives' },
  { id: 'permissions', label: 'Roles & Permissions', category: 'Company & Master', description: 'Access control matrices, role security, and capability restrictions' },
  { id: 'import-export', label: 'Bulk Import / Export', category: 'Company & Master', description: 'Bulk CSV & XLS spreadsheet data migration with sample download templates' },
  { id: 'users', label: 'User & Staff Management', category: 'System & Reports', description: 'Staff accounts, role assignments, and login credentials' },
  { id: 'reports', label: 'Reports & Analytics', category: 'System & Reports', description: 'Source ROI, conversion rates, and recruitment analytics' },
  { id: 'templates', label: 'WhatsApp Templates', category: 'System & Reports', description: 'Pre-approved WhatsApp messaging templates' },
  { id: 'audit', label: 'Audit Trail & Security', category: 'System & Reports', description: 'Detailed historical logs of all system operations' },
];

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({ onClose }) => {
  const { rolePermissions, updateRolePermissions, currentUser } = useRecruitment();
  const [localPermissions, setLocalPermissions] = useState<RolePermissionsMap>(rolePermissions);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canEditPermissions = currentUser.role === 'Super Admin' || currentUser.role === 'Director / Management';

  const handleToggle = (role: UserRole, menuId: AppMenuId) => {
    if (!canEditPermissions) return;
    if (role === 'Super Admin') return; // Super Admin always has full access

    setLocalPermissions(prev => {
      const currentList = prev[role] || [];
      const hasMenu = currentList.includes(menuId);
      const updatedList = hasMenu 
        ? currentList.filter(id => id !== menuId) 
        : [...currentList, menuId];
      return {
        ...prev,
        [role]: updatedList
      };
    });
  };

  const handleSaveAll = () => {
    ALL_ROLES.forEach(r => {
      if (localPermissions[r]) {
        updateRolePermissions(r, localPermissions[r]);
      }
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all roles to default access permissions?')) {
      setLocalPermissions(DEFAULT_ROLE_PERMISSIONS);
      ALL_ROLES.forEach(r => {
        updateRolePermissions(r, DEFAULT_ROLE_PERMISSIONS[r]);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Role-Wise Menu Access & Permission Matrix
                </h2>
                <span className="text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  RBAC Security
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure which navigation menus and functional modules each staff role can see and access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user badge & edit warning */}
        <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Your current active role: <strong>{currentUser.role}</strong> ({currentUser.name})
              {!canEditPermissions && ' • Viewing permissions in read-only mode.'}
            </span>
          </div>

          {canEditPermissions && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>

        {/* Matrix Table */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-64 min-w-[200px]">Navigation Menu / Module</th>
                  {ALL_ROLES.map(role => {
                    const isCurrentUserRole = currentUser.role === role;
                    return (
                      <th 
                        key={role} 
                        className={`p-3 text-center min-w-[100px] border-l border-slate-200 dark:border-slate-800 ${
                          isCurrentUserRole ? 'bg-blue-100/60 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200' : ''
                        }`}
                      >
                        <div className="font-bold whitespace-nowrap text-[11px]">{role}</div>
                        {isCurrentUserRole && (
                          <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-semibold uppercase block mt-0.5">
                            You
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {ALL_MENUS.map((menu, idx) => {
                  const isFirstOfCategory = idx === 0 || ALL_MENUS[idx - 1].category !== menu.category;
                  return (
                    <React.Fragment key={menu.id}>
                      {isFirstOfCategory && (
                        <tr className="bg-slate-50 dark:bg-slate-800/40">
                          <td 
                            colSpan={ALL_ROLES.length + 1} 
                            className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400"
                          >
                            {menu.category}
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {menu.id === 'offer-letters' && <FileCheck className="w-3.5 h-3.5 text-emerald-600" />}
                            {menu.id === 'terms-conditions' && <Scale className="w-3.5 h-3.5 text-blue-600" />}
                            <span>{menu.label}</span>
                            {(menu.id === 'offer-letters' || menu.id === 'terms-conditions') && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1 rounded">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">{menu.description}</p>
                        </td>

                        {ALL_ROLES.map(role => {
                          const isSuperAdmin = role === 'Super Admin';
                          const hasAccess = isSuperAdmin || (localPermissions[role] && localPermissions[role].includes(menu.id));
                          const isCurrentUserRole = currentUser.role === role;

                          return (
                            <td 
                              key={role}
                              className={`p-3 text-center border-l border-slate-100 dark:border-slate-800 ${
                                isCurrentUserRole ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                {isSuperAdmin ? (
                                  <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center" title="Super Admin always has unrestricted full access">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : canEditPermissions ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(role, menu.id)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                      hasAccess
                                        ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={`Click to toggle access for ${role}`}
                                  >
                                    {hasAccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-xs font-bold text-slate-300 dark:text-slate-600">✕</span>}
                                  </button>
                                ) : (
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                    hasAccess
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
                                  }`}>
                                    {hasAccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '✕'}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500">
            {savedSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Permissions updated successfully!
              </span>
            ) : (
              <span>Changes take effect immediately across all desktop & mobile views.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
            >
              Close
            </button>

            {canEditPermissions && (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Apply & Save Matrix
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
