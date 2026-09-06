import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';

interface HrControlRoomProps {
  onFilterDept?: (dept: string) => void;
}

export const HrControlRoom: React.FC<HrControlRoomProps> = ({ onFilterDept }) => {
  const { candidates, interviews, followUps } = useRecruitment();

  const hrExecutives = [
    { name: 'Nandani', department: 'HR Recruitment', target: 5 },
    { name: 'Shivani', department: 'BKD Recruitment', target: 5 },
    { name: 'Priyanka (New)', department: 'HR Trainee', target: 5, isNew: true },
  ];

  const hrStats = hrExecutives.map((hr) => {
    if (hr.isNew) {
      return {
        ...hr,
        leads: 10,
        calls: 0,
        callsPending: true,
        interviewsConducted: 0,
        selected: 0,
        joined: 0,
        achievementBadge: 'Needs Attention',
        badgeColor: 'bg-red-100 text-red-700',
      };
    }

    const leads = candidates.filter((c) => c.assignedHr === hr.name && !c.isArchived).length;
    const calls = followUps.filter(
      (f) => f.hrExecutive === hr.name && f.followUpDate === TODAY
    ).length + candidates.filter(c => c.assignedHr === hr.name && c.firstCallDate?.startsWith(TODAY)).length;

    const interviewsConducted = interviews.filter(
      (i) => i.hrExecutive === hr.name && i.interviewDate === TODAY && i.attendanceStatus === 'Conducted'
    ).length;

    const selected = candidates.filter(
      (c) => c.assignedHr === hr.name && !c.isArchived && (c.status === 'Selected' || c.selectionDate?.startsWith(TODAY))
    ).length;

    const joined = candidates.filter(
      (c) => c.assignedHr === hr.name && !c.isArchived && (c.status === 'Joined' || c.isActiveJoining)
    ).length;

    const targetPct = Math.round((interviewsConducted / hr.target) * 100);

    let achievementBadge = `${targetPct}% Good`;
    let badgeColor = 'bg-blue-100 text-blue-700';

    if (targetPct < 50) {
      achievementBadge = `${targetPct}% Average`;
      badgeColor = 'bg-orange-100 text-orange-700';
    }

    return {
      ...hr,
      leads,
      calls,
      callsPending: calls === 0,
      interviewsConducted,
      selected,
      joined,
      achievementBadge,
      badgeColor,
    };
  });

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 overflow-hidden flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-800">Today's HR Control Room</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <th className="px-3 py-2">HR Name</th>
              <th className="px-3 py-2 text-center">Leads</th>
              <th className="px-3 py-2 text-center">Calls</th>
              <th className="px-3 py-2 text-center">Int. Conducted</th>
              <th className="px-3 py-2 text-center">Selected</th>
              <th className="px-3 py-2 text-center">Joined</th>
              <th className="px-3 py-2 text-center">Target Achievement</th>
            </tr>
          </thead>
          <tbody>
            {hrStats.map((row) => (
              <tr key={row.name} className="hover:bg-slate-50 border-b border-slate-100">
                <td className="px-3 py-2.5 font-semibold text-slate-800">{row.name}</td>
                <td className="px-3 py-2.5 text-center text-slate-700">{row.leads}</td>
                <td className="px-3 py-2.5 text-center text-slate-700">
                  {row.callsPending ? (
                    <span className="italic opacity-50 text-slate-500">Pending</span>
                  ) : (
                    row.calls
                  )}
                </td>
                <td className="px-3 py-2.5 text-center font-bold text-slate-900">
                  {row.interviewsConducted}
                </td>
                <td className="px-3 py-2.5 text-center text-slate-700">{row.selected}</td>
                <td className="px-3 py-2.5 text-center font-bold text-emerald-600">{row.joined}</td>
                <td className="px-3 py-2.5 text-center">
                  <div className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${row.badgeColor}`}>
                    {row.achievementBadge}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-400">
        <div>Updated: Today at 04:32 PM</div>
        <div className="flex gap-1.5 text-[10px] text-slate-500">
          <span className="font-bold text-slate-700 uppercase">Quick Filter:</span>
          <span onClick={() => onFilterDept && onFilterDept('ALL')} className="cursor-pointer hover:underline">All Departments</span> • 
          <span onClick={() => onFilterDept && onFilterDept('HR Recruitment')} className="cursor-pointer hover:underline">HR Recruitment</span> • 
          <span onClick={() => onFilterDept && onFilterDept('BKD Recruitment')} className="cursor-pointer hover:underline">BKD</span>
        </div>
      </div>
    </section>
  );
};
