import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';

export const TargetCards: React.FC = () => {
  const { candidates, interviews } = useRecruitment();

  const hrTargets = [
    {
      name: 'Nandani',
      dept: 'HR',
      role: 'HR Recruitment',
      dailyInterviewTarget: 5,
      monthlyActiveTarget: 20,
      themeColor: 'text-blue-600',
      barColor: 'bg-blue-500',
    },
    {
      name: 'Shivani',
      dept: 'BKD',
      role: 'BKD Recruitment',
      dailyInterviewTarget: 5,
      monthlyActiveTarget: 20,
      themeColor: 'text-orange-600',
      barColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-grow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Target Tracking</h3>
        <span className="text-[10px] text-blue-600 font-bold tracking-wider">LIVE STATUS</span>
      </div>

      <div className="space-y-3">
        {hrTargets.map((hr) => {
          // Daily Interviews conducted today
          const conductedToday = interviews.filter(
            (i) => i.hrExecutive === hr.name && i.interviewDate === TODAY && i.attendanceStatus === 'Conducted'
          ).length;

          const dailyAchievement = Math.min(100, Math.round((conductedToday / hr.dailyInterviewTarget) * 100));

          // Monthly Active Joining achieved
          const activeJoinings = candidates.filter(
            (c) => c.assignedHr === hr.name && !c.isArchived && c.isActiveJoining
          ).length;

          return (
            <div key={hr.name} className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex justify-between mb-1 items-center">
                <span className="text-xs font-bold text-slate-800">
                  {hr.name} ({hr.dept})
                </span>
                <span className={`text-xs font-bold ${hr.themeColor}`}>{dailyAchievement}%</span>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                <span>Interviews: <strong>{conductedToday}/{hr.dailyInterviewTarget}</strong></span>
                <span>Active Joining: <strong>{activeJoinings}/{hr.monthlyActiveTarget}</strong></span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`${hr.barColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${dailyAchievement}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
