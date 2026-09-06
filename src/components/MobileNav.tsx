import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  CalendarClock, 
  MoreHorizontal, 
  Plus,
  Award,
  UserCheck,
  Target,
  FileText,
  Briefcase,
  PieChart,
  Calendar,
  History,
  Building2,
  Layers,
  UserPlus,
  ShieldCheck,
  FileSpreadsheet,
  Sun,
  Moon
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { TODAY } from '../mockData';

interface MobileNavProps {
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenAddCandidate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeNav,
  onSelectNav,
  onOpenAddCandidate,
}) => {
  const { followUps, theme, toggleTheme } = useRecruitment();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const overdueCount = followUps.filter(f => !f.isCompleted && f.followUpDate < TODAY).length;

  const moreItems = [
    { id: 'companies', label: 'Company Master', icon: Building2 },
    { id: 'users', label: 'User Management', icon: UserPlus },
    { id: 'departments', label: 'Department Master', icon: Layers },
    { id: 'targets', label: 'Target Management', icon: Target },
    { id: 'permissions', label: 'Role & Permission', icon: ShieldCheck },
    { id: 'import-export', label: 'Bulk Import / Export', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'selected', label: 'Selected Pipeline', icon: Award },
    { id: 'joining', label: 'Joining & Active Logic', icon: UserCheck },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <>
      {/* Sticky Quick Add Candidate Floating Action Button on Mobile */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <button
          id="fab-mobile-add-candidate"
          onClick={onOpenAddCandidate}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 active:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/40 focus:outline-none transition-transform active:scale-95"
          aria-label="Add Candidate"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Slide-up "More" sheet on mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end" onClick={() => setShowMoreMenu(false)}>
          <div 
            className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto text-slate-200 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
              All CRM Sections
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectNav(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-medium transition-colors ${
                      isItemActive ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Global Theme Toggle for Mobile */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-300" />
                  )}
                  <span>Appearance: {theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  Switch
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowMoreMenu(false)}
              className="w-full mt-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          
          {/* Dashboard */}
          <button
            onClick={() => onSelectNav('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
              activeNav === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </button>

          {/* Candidates */}
          <button
            onClick={() => onSelectNav('candidates')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
              activeNav === 'candidates' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Candidates</span>
          </button>

          {/* Follow-up */}
          <button
            onClick={() => onSelectNav('followups')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium relative transition-colors ${
              activeNav === 'followups' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <PhoneCall className="w-5 h-5 mb-0.5" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
                  {overdueCount}
                </span>
              )}
            </div>
            <span>Follow-up</span>
          </button>

          {/* Interview */}
          <button
            onClick={() => onSelectNav('interviews')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
              activeNav === 'interviews' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-5 h-5 mb-0.5" />
            <span>Interview</span>
          </button>

          {/* More */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
              showMoreMenu ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>

        </div>
      </nav>
    </>
  );
};
