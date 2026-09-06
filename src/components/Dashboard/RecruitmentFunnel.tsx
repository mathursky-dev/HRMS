import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';

export const RecruitmentFunnel: React.FC = () => {
  const { candidates } = useRecruitment();

  const totalLeads = candidates.length;
  const contacted = candidates.filter(
    (c) => c.status !== 'New Lead' && c.status !== 'Not Contacted'
  ).length;
  
  const interviews = candidates.filter((c) =>
    ['Interview Scheduled', 'Interview Confirmed', 'Interview Conducted', 'Selected', 'Joined', 'Active Joining'].includes(c.status)
  ).length;

  const selected = candidates.filter((c) =>
    ['Selected', 'Joined', 'Active Joining'].includes(c.status)
  ).length;

  const active = candidates.filter((c) => c.isActiveJoining || c.status === 'Active Joining').length;

  // Conversion rates
  const leadToInterview = totalLeads > 0 ? Math.round((interviews / totalLeads) * 100) : 0;
  const selectionRate = interviews > 0 ? Math.round((selected / interviews) * 100) : 0;
  const retention = selected > 0 ? Math.round((active / selected) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-800">
        Recruitment Funnel Overview
      </h3>

      {/* Stepped horizontal blocks */}
      <div className="flex items-center h-20 gap-1 select-none">
        <div className="flex-1 h-full bg-slate-100 flex flex-col justify-center items-center rounded-l border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Lead</span>
          <span className="text-lg font-bold text-slate-900">{totalLeads}</span>
        </div>

        <div className="flex-1 h-full bg-blue-50 flex flex-col justify-center items-center border border-slate-200">
          <span className="text-[10px] text-blue-600 uppercase font-bold">Contacted</span>
          <span className="text-lg font-bold text-slate-900">{contacted}</span>
        </div>

        <div className="flex-1 h-full bg-blue-100 flex flex-col justify-center items-center border border-slate-200">
          <span className="text-[10px] text-blue-700 uppercase font-bold">Interview</span>
          <span className="text-lg font-bold text-slate-900">{interviews}</span>
        </div>

        <div className="flex-1 h-full bg-emerald-50 flex flex-col justify-center items-center border border-slate-200">
          <span className="text-[10px] text-emerald-600 uppercase font-bold">Selected</span>
          <span className="text-lg font-bold text-slate-900">{selected}</span>
        </div>

        <div className="flex-1 h-full bg-emerald-100 flex flex-col justify-center items-center rounded-r border border-slate-200">
          <span className="text-[10px] text-emerald-700 uppercase font-bold">Active</span>
          <span className="text-lg font-bold text-emerald-800">{active}</span>
        </div>
      </div>

      {/* 4 Conversion Metrics */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-100 pt-3">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Lead to Interview</div>
          <div className="text-sm font-bold text-slate-800">{leadToInterview}%</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Selection Rate</div>
          <div className="text-sm font-bold text-slate-800">{selectionRate}%</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Retention (Active)</div>
          <div className="text-sm font-bold text-emerald-600">{retention}%</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Avg. Hiring Cost</div>
          <div className="text-sm font-bold text-slate-800">₹1,450</div>
        </div>
      </div>
    </div>
  );
};
