import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Building2, 
  Layers, 
  Users, 
  Edit3, 
  Plus, 
  AlertTriangle, 
  X, 
  Save, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';
import { TargetSetting } from '../../types';

export const TargetManagement: React.FC = () => {
  const { 
    targetSettings, 
    updateTargetSetting, 
    addTargetSetting, 
    deleteTargetSetting,
    companies, 
    departmentsList, 
    allUsers, 
    candidates, 
    interviews 
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HR_TARGETS' | 'DEPT_TARGETS' | 'COMPANY_TARGETS'>('OVERVIEW');
  const [editingTarget, setEditingTarget] = useState<TargetSetting | null>(null);
  const [editTargetValue, setEditTargetValue] = useState<number>(0);
  const [editBenchmark, setEditBenchmark] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Target Form State
  const [newTargetForm, setNewTargetForm] = useState({
    targetType: 'HR Executive' as 'Company' | 'Department' | 'HR Executive',
    targetEntityId: '',
    targetEntityName: '',
    period: 'Monthly' as 'Daily' | 'Monthly' | 'Quarterly',
    metric: 'Active Joinings' as 'Interviews Conducted' | 'Active Joinings' | 'Candidate Calls' | 'Offers Released',
    targetValue: 20,
    minimumBenchmark: 15,
  });

  // Calculate live achievements
  const hrUsers = allUsers.filter(u => u.role === 'HR Executive' || u.role === 'HR Head' || u.role === 'Recruiter');

  const hrPerformance = hrUsers.map(user => {
    const userCandidates = candidates.filter(c => c.assignedHr.toLowerCase() === user.name.toLowerCase());
    const activeJoinings = userCandidates.filter(c => c.isActiveJoining).length;
    const conductedToday = interviews.filter(
      i => i.hrExecutive.toLowerCase() === user.name.toLowerCase() && 
           i.interviewDate === TODAY && 
           i.attendanceStatus === 'Conducted'
    ).length;

    const dailyTarget = user.dailyInterviewTarget || 5;
    const monthlyTarget = user.monthlyActiveJoiningTarget || 20;

    const dailyPercent = dailyTarget > 0 ? Math.min(Math.round((conductedToday / dailyTarget) * 100), 200) : 0;
    const monthlyPercent = monthlyTarget > 0 ? Math.min(Math.round((activeJoinings / monthlyTarget) * 100), 200) : 0;

    return {
      user,
      conductedToday,
      dailyTarget,
      dailyPercent,
      activeJoinings,
      monthlyTarget,
      monthlyPercent,
      isDailyMet: conductedToday >= dailyTarget,
      isMonthlyOnTrack: monthlyPercent >= 30, // 30% pacing early in month
    };
  });

  // Group achievements
  const totalConductedToday = hrPerformance.reduce((sum, h) => sum + h.conductedToday, 0);
  const totalDailyTarget = hrPerformance.reduce((sum, h) => sum + h.dailyTarget, 0);
  const totalActiveJoinings = hrPerformance.reduce((sum, h) => sum + h.activeJoinings, 0);
  const totalMonthlyTarget = hrPerformance.reduce((sum, h) => sum + h.monthlyTarget, 0);

  const groupDailyPercent = totalDailyTarget > 0 ? Math.round((totalConductedToday / totalDailyTarget) * 100) : 0;
  const groupMonthlyPercent = totalMonthlyTarget > 0 ? Math.round((totalActiveJoinings / totalMonthlyTarget) * 100) : 0;

  const handleOpenEdit = (target: TargetSetting) => {
    setEditingTarget(target);
    setEditTargetValue(target.targetValue);
    setEditBenchmark(target.minimumBenchmark || Math.round(target.targetValue * 0.8));
  };

  const handleSaveEdit = () => {
    if (!editingTarget) return;
    updateTargetSetting(editingTarget.id, {
      targetValue: Number(editTargetValue) || 0,
      minimumBenchmark: Number(editBenchmark) || 0,
    });
    setEditingTarget(null);
  };

  const handleSaveNewTarget = (e: React.FormEvent) => {
    e.preventDefault();
    let entityName = newTargetForm.targetEntityName;
    if (newTargetForm.targetType === 'HR Executive') {
      const u = allUsers.find(user => user.id === newTargetForm.targetEntityId);
      if (u) entityName = u.name;
    } else if (newTargetForm.targetType === 'Department') {
      const d = departmentsList.find(dept => dept.id === newTargetForm.targetEntityId);
      if (d) entityName = d.name;
    } else {
      const c = companies.find(comp => comp.id === newTargetForm.targetEntityId);
      if (c) entityName = c.name;
    }

    addTargetSetting({
      targetType: newTargetForm.targetType,
      targetEntityId: newTargetForm.targetEntityId || 'default',
      targetEntityName: entityName || 'Custom Target',
      period: newTargetForm.period,
      metric: newTargetForm.metric,
      targetValue: Number(newTargetForm.targetValue) || 0,
      minimumBenchmark: Number(newTargetForm.minimumBenchmark) || 0,
      updatedBy: 'Management',
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Target & Quota Management</h1>
              <p className="text-xs text-slate-500">
                Company, department, and HR-level targets for daily interviews conducted & monthly active joinings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Target</span>
          </button>
        </div>
      </div>

      {/* Target Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Group Interviews Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Interview Quota</h3>
                <p className="text-[11px] text-slate-500">Date: {TODAY} • Group Performance</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              groupDailyPercent >= 100 
                ? 'bg-emerald-100 text-emerald-800' 
                : groupDailyPercent >= 70 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {groupDailyPercent}% Achieved
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">{totalConductedToday}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {totalDailyTarget} Conducted</span>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {totalDailyTarget - totalConductedToday > 0 
                ? `${totalDailyTarget - totalConductedToday} more needed today` 
                : 'Target achieved! 🎉'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                groupDailyPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(groupDailyPercent, 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Nandani Target: 5/day</span>
            <span>Shivani Target: 5/day</span>
            <span>Min Benchmark: 80%</span>
          </div>
        </div>

        {/* Monthly Active Joinings Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Active Joinings Goal</h3>
                <p className="text-[11px] text-slate-500">September 2026 • 7-Day Retention Metric</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              groupMonthlyPercent >= 100 
                ? 'bg-emerald-100 text-emerald-800' 
                : groupMonthlyPercent >= 40 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {groupMonthlyPercent}% of Monthly Target
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">{totalActiveJoinings}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {totalMonthlyTarget} Verified Active</span>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Required run rate: ~1.5 active joinings / day
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(groupMonthlyPercent, 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>HR Recruitment: 20 active</span>
            <span>BKD Recruitment: 20 active</span>
            <span>Target: 40 Active Joinings</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex items-center space-x-2">
        {[
          { id: 'OVERVIEW', label: 'HR Target Leaderboard' },
          { id: 'HR_TARGETS', label: 'Executive Target Configuration' },
          { id: 'DEPT_TARGETS', label: 'Department Quotas' },
          { id: 'COMPANY_TARGETS', label: 'Company Master Goals' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View 1: HR Target Leaderboard */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recruiter Performance vs Target Matrix
            </h2>
            <span className="text-xs text-slate-500">Auto-calculated from live candidate statuses & interview audits</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">HR Executive</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Daily Interviews (Conducted / Target)</th>
                  <th className="py-3 px-4 text-center">Daily Pacing</th>
                  <th className="py-3 px-4 text-center">Monthly Active Joinings (Joined / Target)</th>
                  <th className="py-3 px-4 text-center">Monthly Pacing</th>
                  <th className="py-3 px-4 text-center">Target Status</th>
                  <th className="py-3 px-4 text-right">Quick Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {hrPerformance.map(({ user, conductedToday, dailyTarget, dailyPercent, activeJoinings, monthlyTarget, monthlyPercent, isDailyMet }) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{user.department}</td>

                    {/* Daily Interview Target */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900">{conductedToday}</span>
                      <span className="text-slate-400"> / {dailyTarget}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="w-24 mx-auto">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>{dailyPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isDailyMet ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(dailyPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Monthly Active Joinings */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-600">{activeJoinings}</span>
                      <span className="text-slate-400"> / {monthlyTarget}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="w-24 mx-auto">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>{monthlyPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4 text-center">
                      {isDailyMet ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Daily Target Met
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> In Progress
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const target = targetSettings.find(t => t.targetEntityId === user.id) || {
                            id: `tgt-${user.id}`,
                            targetType: 'HR Executive',
                            targetEntityId: user.id,
                            targetEntityName: user.name,
                            period: 'Monthly',
                            metric: 'Active Joinings',
                            targetValue: user.monthlyActiveJoiningTarget || 20,
                            minimumBenchmark: 15,
                            updatedAt: TODAY,
                            updatedBy: 'Aditya Mathur'
                          };
                          handleOpenEdit(target);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2, 3, 4: Target Configuration Lists */}
      {activeTab !== 'OVERVIEW' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {activeTab === 'HR_TARGETS' ? 'Executive Level Targets' : activeTab === 'DEPT_TARGETS' ? 'Department Level Quotas' : 'Company Entity Targets'}
            </h2>
            <span className="text-xs text-slate-500">Click edit to adjust quotas</span>
          </div>

          <div className="divide-y divide-slate-100">
            {targetSettings
              .filter(t => {
                if (activeTab === 'HR_TARGETS') return t.targetType === 'HR Executive';
                if (activeTab === 'DEPT_TARGETS') return t.targetType === 'Department';
                return t.targetType === 'Company';
              })
              .map(target => (
                <div key={target.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{target.targetEntityName}</span>
                      <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {target.period}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Metric: <span className="font-semibold text-slate-700">{target.metric}</span>
                      {target.minimumBenchmark ? ` • SLA Minimum Benchmark: ${target.minimumBenchmark}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-blue-600">{target.targetValue}</div>
                      <div className="text-[10px] text-slate-400">Target Value</div>
                    </div>
                    <button
                      onClick={() => handleOpenEdit(target)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Target Edit Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adjust Target Quota</h3>
                <p className="text-xs text-slate-500">{editingTarget.targetEntityName} • {editingTarget.metric}</p>
              </div>
              <button onClick={() => setEditingTarget(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Value ({editingTarget.period})
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={editTargetValue}
                  onChange={(e) => setEditTargetValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Benchmark (Warning Threshold)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={editBenchmark}
                  onChange={(e) => setEditBenchmark(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Save Quota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Target Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Define New Target</h3>
                <p className="text-xs text-slate-500">Allocate daily or monthly targets</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTarget} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Scope</label>
                <select
                  value={newTargetForm.targetType}
                  onChange={(e) => setNewTargetForm({ ...newTargetForm, targetType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="HR Executive">Individual HR Executive</option>
                  <option value="Department">Department Quota</option>
                  <option value="Company">Company Entity Target</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Entity</label>
                {newTargetForm.targetType === 'HR Executive' && (
                  <select
                    value={newTargetForm.targetEntityId}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, targetEntityId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select HR Executive</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                )}
                {newTargetForm.targetType === 'Department' && (
                  <select
                    value={newTargetForm.targetEntityId}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, targetEntityId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
                {newTargetForm.targetType === 'Company' && (
                  <select
                    value={newTargetForm.targetEntityId}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, targetEntityId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period</label>
                  <select
                    value={newTargetForm.period}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, period: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metric</label>
                  <select
                    value={newTargetForm.metric}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, metric: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Interviews Conducted">Interviews Conducted</option>
                    <option value="Active Joinings">Active Joinings</option>
                    <option value="Candidate Calls">Candidate Calls</option>
                    <option value="Offers Released">Offers Released</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    value={newTargetForm.targetValue}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Benchmark</label>
                  <input
                    type="number"
                    min="1"
                    value={newTargetForm.minimumBenchmark}
                    onChange={(e) => setNewTargetForm({ ...newTargetForm, minimumBenchmark: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
