import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Bell, 
  Plus, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Users,
  ChevronDown,
  RotateCcw,
  Sun,
  Moon,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { TODAY } from '../mockData';

interface NavbarProps {
  onOpenAddCandidate: () => void;
  onOpenTemplates?: () => void;
  onNavigate?: (nav: string) => void;
  onSelectNav?: (nav: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAddCandidate, 
  onOpenTemplates,
  onNavigate,
  onSelectNav 
}) => {
  const navigate = onNavigate || onSelectNav || (() => {});
  const { 
    currentUser, 
    allUsers, 
    setCurrentUser, 
    candidates, 
    followUps, 
    interviews, 
    resetAllData,
    companies,
    activeCompanyId,
    setActiveCompanyId,
    theme,
    toggleTheme,
    logout
  } = useRecruitment();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Compute live alerts
  const overdueFollowUps = followUps.filter(f => !f.isCompleted && f.followUpDate < TODAY);
  const untouchedLeads = candidates.filter(c => !c.isArchived && (c.status === 'New Lead' || c.status === 'Not Contacted'));
  const interviewsToday = interviews.filter(i => i.interviewDate === TODAY && i.attendanceStatus === 'Scheduled');
  
  const totalAlertsCount = overdueFollowUps.length + (untouchedLeads.length > 0 ? 1 : 0) + interviewsToday.length;

  const activeCompany = companies.find(c => c.id === activeCompanyId);

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A] border-b border-slate-700 text-white">
      <div className="w-full px-3 sm:px-5">
        <div className="flex items-center justify-between h-13">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('dashboard')}>
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs tracking-wider">
                ES
              </div>
              <div>
                <div className="flex items-center space-x-1.5 leading-tight">
                  <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-white">ESSENTIAL SOUL</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded border border-blue-400/30 font-semibold">ATS CRM</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">Recruitment Lifecycle Tracking</p>
              </div>
            </div>

            {/* Active Company Entity Switcher Pill */}
            <div className="relative hidden md:block ml-2 pl-3 border-l border-slate-700">
              <button
                id="btn-nav-company-switcher"
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-slate-200 truncate max-w-[140px]">
                  {activeCompany ? activeCompany.code : 'All Companies'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showCompanyDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 text-slate-200">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Working Entity</span>
                    <button 
                      onClick={() => { setShowCompanyDropdown(false); navigate('companies'); }}
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      Master →
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveCompanyId('ALL');
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                      activeCompanyId === 'ALL' ? 'bg-blue-950/60 text-blue-400 font-bold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">All Entities (Consolidated)</div>
                      <div className="text-[10px] text-slate-400">Total Group View</div>
                    </div>
                    {activeCompanyId === 'ALL' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </button>

                  {companies.map(comp => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setActiveCompanyId(comp.id);
                        setShowCompanyDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                        activeCompanyId === comp.id ? 'bg-blue-950/60 text-blue-400 font-bold' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{comp.code} • {comp.name}</div>
                        <div className="text-[10px] text-slate-400">{comp.city}, {comp.state}</div>
                      </div>
                      {activeCompanyId === comp.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Quick Add Candidate Button */}
            <button
              id="btn-nav-add-candidate"
              onClick={onOpenAddCandidate}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
            </button>

            {/* Supabase DB Status Badge */}
            <button
              id="btn-nav-supabase-db"
              onClick={() => navigate('database')}
              className="hidden lg:flex items-center space-x-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2.5 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Supabase PostgreSQL Cloud Database"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase DB</span>
            </button>

            {/* WhatsApp Templates button */}
            <button
              id="btn-nav-templates"
              onClick={onOpenTemplates}
              className="hidden md:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              <span>💬 Templates</span>
            </button>

            {/* Global Theme Toggle (Light / Dark Mode) */}
            <button
              id="btn-global-theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Reduce Eye Strain)'}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-xs font-semibold text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-300">Dark</span>
                </>
              )}
            </button>

            {/* Management Alerts Dropdown */}
            <div className="relative">
              <button
                id="btn-nav-alerts"
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Management Alerts"
              >
                <Bell className="w-5 h-5" />
                {totalAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 text-slate-100">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Live Management Alerts
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {totalAlertsCount} pending
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {overdueFollowUps.length > 0 && (
                      <div className="p-3 hover:bg-slate-800/50 transition-colors flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-rose-300">
                            {overdueFollowUps.length} follow-ups are overdue!
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Immediate attention needed by HR to avoid candidate cold drop.
                          </p>
                          <button 
                            onClick={() => { setShowAlertsDropdown(false); onSelectNav('followups'); }}
                            className="mt-1 text-[11px] text-blue-400 hover:underline font-medium"
                          >
                            View Overdue Follow-ups →
                          </button>
                        </div>
                      </div>
                    )}

                    {untouchedLeads.length > 0 && (
                      <div className="p-3 hover:bg-slate-800/50 transition-colors flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-amber-300">
                            {untouchedLeads.length} leads pending first call / contact
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Leads aging beyond 24 hours lose conversion by 40%.
                          </p>
                          <button 
                            onClick={() => { setShowAlertsDropdown(false); onSelectNav('candidates'); }}
                            className="mt-1 text-[11px] text-blue-400 hover:underline font-medium"
                          >
                            Go to Lead Queue →
                          </button>
                        </div>
                      </div>
                    )}

                    {interviewsToday.length > 0 && (
                      <div className="p-3 hover:bg-slate-800/50 transition-colors flex items-start gap-2.5">
                        <Users className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-sky-300">
                            {interviewsToday.length} interviews pending confirmation for today
                          </p>
                          <button 
                            onClick={() => { setShowAlertsDropdown(false); onSelectNav('interviews'); }}
                            className="mt-1 text-[11px] text-blue-400 hover:underline font-medium"
                          >
                            Confirm Attendance →
                          </button>
                        </div>
                      </div>
                    )}

                    {totalAlertsCount === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                        All targets and follow-ups are up to date!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Selector */}
            <div className="relative">
              <button
                id="btn-nav-role-switcher"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                title="Switch User Role to preview customized permissions"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-white font-semibold leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 text-slate-200">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Active User & Role
                  </div>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        currentUser.id === user.id ? 'bg-blue-950/60 text-blue-400 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-100">{user.name}</div>
                        <div className="text-[10px] text-slate-400">{user.role} • {user.department}</div>
                      </div>
                      {currentUser.id === user.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </button>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-slate-800 px-3 space-y-1.5">
                    <button
                      id="btn-nav-dropdown-permissions"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        const nav = onNavigate || onSelectNav;
                        if (nav) nav('permissions');
                      }}
                      className="w-full text-left py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-blue-950/60 text-[11px] text-slate-200 hover:text-blue-300 font-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        Roles & Permissions
                      </span>
                      <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-semibold">RBAC</span>
                    </button>

                    <button
                      id="btn-nav-dropdown-logout"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        logout();
                      }}
                      className="w-full text-left py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-[11px] text-slate-200 hover:text-rose-300 font-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        Log Out / Lock Workspace
                      </span>
                      <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Lock</span>
                    </button>

                    <button
                      id="btn-nav-reset-demo-data"
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all CRM dummy data back to default factory state?')) {
                          resetAllData();
                          setShowRoleDropdown(false);
                          alert('All dummy data (candidates, jobs, users, companies, offer letters) has been reset to default state.');
                        }
                      }}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset Dummy Data to Default</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quick Log Out Button */}
            <button
              id="btn-nav-header-logout"
              onClick={logout}
              title="Log Out & Return to Login Screen"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950/50 hover:border-rose-700/60 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xl:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
