import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';
import { TargetCards } from './TargetCards';
import { HrControlRoom } from './HrControlRoom';
import { RecruitmentFunnel } from './RecruitmentFunnel';

interface ManagementDashboardProps {
  onOpenAddCandidate: () => void;
  onNavigate: (nav: string) => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  onOpenAddCandidate,
  onNavigate,
}) => {
  const { candidates, interviews, followUps } = useRecruitment();
  const [selectedDept, setSelectedDept] = useState<'ALL' | 'HR Recruitment' | 'BKD Recruitment'>('ALL');

  // Filter candidates if department selected
  const filteredCandidates = candidates.filter((c) => {
    if (c.isArchived) return false;
    if (selectedDept !== 'ALL' && c.department !== selectedDept) return false;
    return true;
  });

  const totalCandidates = filteredCandidates.length;

  const newLeadsToday = filteredCandidates.filter(
    (c) => c.createdAt.startsWith(TODAY) || c.status === 'New Lead'
  ).length;

  const callsToday = followUps.filter(
    (f) => f.followUpDate === TODAY && (f.followUpMode === 'Call' || f.isCompleted)
  ).length + filteredCandidates.filter((c) => c.firstCallDate?.startsWith(TODAY)).length;

  const connectedToday = filteredCandidates.filter(
    (c) => c.status === 'Connected' || c.status === 'Interested'
  ).length;

  const followUpsToday = followUps.filter((f) => f.followUpDate === TODAY).length;

  const interviewsToday = interviews.filter((i) => i.interviewDate === TODAY).length;

  const interviewsConductedToday = interviews.filter(
    (i) => i.interviewDate === TODAY && i.attendanceStatus === 'Conducted'
  ).length;

  const selectedToday = filteredCandidates.filter(
    (c) => c.status === 'Selected' || c.selectionDate?.startsWith(TODAY)
  ).length;

  const joiningToday = filteredCandidates.filter(
    (c) => c.status === 'Joined' || c.joiningDate?.startsWith(TODAY)
  ).length;

  const activeJoining = filteredCandidates.filter((c) => c.isActiveJoining).length;

  const overdueFollowUps = followUps.filter(
    (f) => !f.isCompleted && f.followUpDate < TODAY
  ).length;

  const untouchedCount = filteredCandidates.filter(
    (c) => c.status === 'New Lead' || c.status === 'Not Contacted'
  ).length;

  return (
    <div className="flex flex-col gap-4">
      
      {/* High Density Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Management Dashboard</h1>
          <p className="text-xs text-slate-500">Essential Soul Lifestyle Pvt Ltd • Recruitment Lifecycle Tracking</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenAddCandidate}
            className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-medium rounded shadow-sm text-slate-800 cursor-pointer transition-colors"
          >
            + Add Candidate
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium rounded shadow-sm cursor-pointer transition-colors"
          >
            Generate Daily Report
          </button>
        </div>
      </header>

      {/* 7-Card High Density Metric Row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        <div 
          onClick={() => onNavigate('candidates')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">New Leads</div>
          <div className="text-xl font-bold text-slate-900">{newLeadsToday}</div>
        </div>

        <div 
          onClick={() => onNavigate('candidates')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Calls Made</div>
          <div className="text-xl font-bold text-slate-900">{callsToday}</div>
        </div>

        <div 
          onClick={() => onNavigate('interviews')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Interviews</div>
          <div className="text-xl font-bold text-slate-900">{interviewsToday}</div>
        </div>

        <div 
          onClick={() => onNavigate('selected')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Selected</div>
          <div className="text-xl font-bold text-blue-600">{String(selectedToday).padStart(2, '0')}</div>
        </div>

        <div 
          onClick={() => onNavigate('joining')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Joining Today</div>
          <div className="text-xl font-bold text-emerald-600">{String(joiningToday).padStart(2, '0')}</div>
        </div>

        <div 
          onClick={() => onNavigate('joining')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-orange-500 cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Active (7D)</div>
          <div className="text-xl font-bold text-orange-600">{String(activeJoining).padStart(2, '0')}</div>
        </div>

        <div 
          onClick={() => onNavigate('followups')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm bg-red-50 cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="text-[10px] font-bold text-red-700 uppercase mb-1 italic">Overdue</div>
          <div className="text-xl font-bold text-red-600">{String(overdueFollowUps).padStart(2, '0')}</div>
        </div>

      </section>

      {/* Middle Section: Target Tracking + Management Alerts (Left 1/3) & HR Control Room (Right 2/3) */}
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Column: Target Tracking + Alerts */}
        <section className="w-full lg:w-1/3 flex flex-col gap-3">
          <TargetCards />

          <div className="bg-orange-600 text-white p-4 rounded-lg shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Management Alerts</h3>
            <ul className="space-y-2 text-[11px] font-medium">
              <li className="flex items-start gap-2">
                <span className="opacity-80">🔴</span>
                <span>{untouchedCount} candidates not contacted today</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="opacity-80">🔴</span>
                <span>{overdueFollowUps} follow-ups are overdue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="opacity-80">🟠</span>
                <span>9 interviews not confirmed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="opacity-80">🟢</span>
                <span>{activeJoining} Active Joinings today</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Right Column: Today's HR Control Room */}
        <section className="w-full lg:w-2/3 flex flex-col">
          <HrControlRoom onFilterDept={(dept) => setSelectedDept(dept as any)} />
        </section>

      </div>

      {/* Bottom Section: Funnel Overview & Active Openings */}
      <section className="flex flex-col lg:flex-row gap-4">
        
        {/* Recruitment Funnel Overview */}
        <div className="flex-grow">
          <RecruitmentFunnel />
        </div>

        {/* Active Openings Widget */}
        <div className="w-full lg:w-72 bg-white rounded-lg border border-slate-200 shadow-sm p-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Active Openings</h3>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-[10px] text-blue-600 hover:underline font-bold"
            >
              View All
            </button>
          </div>

          <div className="space-y-2 flex-1">
            <div className="p-2 border border-slate-100 rounded bg-red-50 flex justify-between items-center">
              <div>
                <div className="text-[11px] font-bold text-slate-900">Sales Executive</div>
                <div className="text-[9px] text-slate-500">6 Vacancies Remaining</div>
              </div>
              <span className="bg-red-200 text-red-700 text-[8px] font-black px-1.5 py-0.5 rounded">
                URGENT
              </span>
            </div>

            <div className="p-2 border border-slate-100 rounded flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="text-[11px] font-bold text-slate-900">Telecaller</div>
                <div className="text-[9px] text-slate-500">12 Vacancies Remaining</div>
              </div>
              <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded">
                OPEN
              </span>
            </div>

            <div className="p-2 border border-slate-100 rounded flex justify-between items-center opacity-60">
              <div>
                <div className="text-[11px] font-bold text-slate-900">Back Office Exec.</div>
                <div className="text-[9px] text-slate-500">0 Vacancies Remaining</div>
              </div>
              <span className="bg-slate-200 text-slate-700 text-[8px] font-black px-1.5 py-0.5 rounded">
                CLOSED
              </span>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
