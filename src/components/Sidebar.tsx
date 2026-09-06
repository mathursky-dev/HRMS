import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  CalendarClock, 
  Award, 
  UserCheck, 
  FileText, 
  Briefcase, 
  History,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { TODAY } from '../mockData';

interface SidebarProps {
  activeNav: string;
  onNavigate?: (nav: string) => void;
  onSelectNav?: (nav: string) => void;
  onOpenAddCandidate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNavigate, onSelectNav }) => {
  const { 
    followUps, 
    candidates, 
    interviews, 
    theme, 
    toggleTheme,
    hasPermission,
    currentUser
  } = useRecruitment();
  const navigate = onNavigate || onSelectNav || (() => {});

  const overdueCount = followUps.filter(f => !f.isCompleted && f.followUpDate < TODAY).length;
  const todayFollowUpsCount = followUps.filter(f => !f.isCompleted && f.followUpDate === TODAY).length;
  const todayInterviewsCount = interviews.filter(i => i.interviewDate === TODAY).length;
  const activeJoiningCount = candidates.filter(c => c.isActiveJoining).length;

  const navSections = [
    {
      group: 'Recruitment Ops',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', isEmoji: true },
        { id: 'candidates', label: 'Candidates', icon: '👥', isEmoji: true, badge: candidates.length },
        { 
          id: 'followups', 
          label: 'Follow-ups', 
          icon: '🔔',
          isEmoji: true,
          badge: overdueCount > 0 ? overdueCount : (todayFollowUpsCount > 0 ? todayFollowUpsCount : undefined),
          badgeColor: overdueCount > 0 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        },
        { 
          id: 'interviews', 
          label: 'Interviews', 
          icon: '📅',
          isEmoji: true,
          badge: todayInterviewsCount > 0 ? todayInterviewsCount : undefined,
          badgeColor: 'bg-purple-500 text-white'
        },
        { 
          id: 'joining', 
          label: 'Selected & Joining', 
          icon: '🎓',
          isEmoji: true,
          badge: activeJoiningCount > 0 ? `${activeJoiningCount} active` : undefined,
          badgeColor: 'bg-emerald-600 text-white'
        },
        { id: 'offer-letters', label: 'Offer Letters & CTC', icon: '📄', isEmoji: true },
        { id: 'jobs', label: 'Job Openings', icon: '📁', isEmoji: true },
      ],
    },
    {
      group: 'Masters & Organization',
      items: [
        { id: 'companies', label: 'Company Master', icon: '🏢', isEmoji: true },
        { id: 'users', label: 'User Management', icon: '👤', isEmoji: true },
        { id: 'departments', label: 'Department Master', icon: '📑', isEmoji: true },
        { id: 'targets', label: 'Target Management', icon: '🎯', isEmoji: true },
        { id: 'permissions', label: 'Role & Permission', icon: '🛡️', isEmoji: true },
        { id: 'import-export', label: 'Bulk Import / Export', icon: '📥', isEmoji: true },
        { id: 'database', label: 'Supabase Database', icon: '⚡', isEmoji: true },
      ],
    },
    {
      group: 'Reports & Intelligence',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: '📈', isEmoji: true },
        { id: 'templates', label: 'WhatsApp Templates', icon: '💬', isEmoji: true },
        { id: 'audit', label: 'Audit Trail', icon: '🔒', isEmoji: true },
      ],
    },
  ];

  return (
    <aside className="w-56 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] select-none border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-white font-bold text-xs tracking-wider uppercase">Essential Soul</div>
        <div className="text-[10px] opacity-60">Recruitment CRM v2.4 • High Density</div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-grow py-3 overflow-y-auto">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(item => hasPermission(item.id as any));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="mb-4">
              <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.group}
              </div>
              <div>
                {visibleItems.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => navigate(item.id)}
                      className={`w-full text-left px-4 py-2 flex items-center text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-medium'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="mr-2.5 text-sm leading-none">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Theme Quick Switcher (Eye Strain Reduction) */}
      <div className="px-3 py-2 border-t border-slate-800 bg-[#0F172A]">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer border border-slate-700/60"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Eye Strain Reduction)'}
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
            )}
            <span className="text-[11px] font-medium">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 uppercase tracking-wider">
            Toggle
          </span>
        </button>
      </div>

      {/* User / Admin Card */}
      <div className="p-3 border-t border-slate-700 flex items-center gap-2.5 bg-[#0F172A]">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          {currentUser.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="text-[11px] font-bold text-white leading-tight truncate">{currentUser.name}</div>
          <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
        </div>
      </div>

    </aside>
  );
};

