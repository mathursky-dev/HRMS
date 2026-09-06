import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Copy, 
  Check, 
  Award, 
  DollarSign, 
  Users, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Download,
  Filter,
  Building2,
  Layers,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

export const ReportsAnalytics: React.FC = () => {
  const { 
    candidates, 
    interviews, 
    allUsers, 
    companies, 
    departmentsList,
    sourceAdSpends,
    auditLogs
  } = useRecruitment();

  const [copied, setCopied] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [activeReportTab, setActiveReportTab] = useState<'EXECUTIVE' | 'RECRUITERS' | 'SOURCE_ROI' | 'PIPELINE'>('EXECUTIVE');

  // Filter candidates by company and department
  const filteredCandidates = candidates.filter(c => {
    const matchesCompany = selectedCompanyFilter === 'ALL' || c.companyId === selectedCompanyFilter;
    const matchesDept = selectedDeptFilter === 'ALL' || c.department.toLowerCase() === selectedDeptFilter.toLowerCase();
    return matchesCompany && matchesDept;
  });

  // HR users list
  const hrUsers = allUsers.filter(u => u.role === 'HR Executive' || u.role === 'HR Head' || u.role === 'Recruiter');

  // Recruiter analytics
  const recruiterStats = hrUsers.map(user => {
    const userCandidates = filteredCandidates.filter(c => c.assignedHr.toLowerCase() === user.name.toLowerCase());
    const totalAssigned = userCandidates.length;
    const selected = userCandidates.filter(c => c.status === 'Selected' || c.status === 'Joining Confirmed' || c.isActiveJoining).length;
    const activeJoinings = userCandidates.filter(c => c.isActiveJoining).length;

    const interviewsToday = interviews.filter(
      i => i.hrExecutive.toLowerCase() === user.name.toLowerCase() && 
           i.interviewDate === TODAY && 
           i.attendanceStatus === 'Conducted'
    ).length;

    const dailyTarget = user.dailyInterviewTarget || 5;
    const monthlyTarget = user.monthlyActiveJoiningTarget || 20;

    const dailyPacing = dailyTarget > 0 ? Math.round((interviewsToday / dailyTarget) * 100) : 0;
    const monthlyPacing = monthlyTarget > 0 ? Math.round((activeJoinings / monthlyTarget) * 100) : 0;
    const conversionRate = totalAssigned > 0 ? Math.round((activeJoinings / totalAssigned) * 100) : 0;

    return {
      user,
      totalAssigned,
      selected,
      activeJoinings,
      interviewsToday,
      dailyTarget,
      monthlyTarget,
      dailyPacing,
      monthlyPacing,
      conversionRate,
    };
  });

  // Source ROI computation
  const sources = ['Meta Ads', 'WorkIndia', 'Indeed', 'Apna', 'Referral', 'Walk-in'];
  const sourceStats = sources.map((src) => {
    const totalLeads = filteredCandidates.filter((c) => c.candidateSource === src).length;
    const selected = filteredCandidates.filter((c) => c.candidateSource === src && (c.status === 'Selected' || c.status === 'Joining Confirmed' || c.isActiveJoining)).length;
    const active = filteredCandidates.filter((c) => c.candidateSource === src && c.isActiveJoining).length;
    const convRate = totalLeads > 0 ? Math.round((active / totalLeads) * 100) : 0;
    
    // Check custom ad spend if available
    const configuredSpend = sourceAdSpends.find(s => s.source === src)?.adSpend;
    const defaultSpend = src === 'Meta Ads' ? 12000 : (src === 'WorkIndia' ? 6000 : (src === 'Indeed' ? 8000 : (src === 'Apna' ? 4000 : 0)));
    const estimatedCost = configuredSpend !== undefined ? configuredSpend : defaultSpend;
    const costPerHire = active > 0 ? Math.round(estimatedCost / active) : (estimatedCost > 0 ? estimatedCost : 0);

    return {
      source: src,
      leads: totalLeads,
      selected,
      active,
      convRate,
      estimatedCost,
      costPerHire,
    };
  });

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  filteredCandidates.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const totalInterviewsConductedToday = recruiterStats.reduce((sum, r) => sum + r.interviewsToday, 0);
  const totalDailyTarget = recruiterStats.reduce((sum, r) => sum + r.dailyTarget, 0);
  const totalActiveJoinings = recruiterStats.reduce((sum, r) => sum + r.activeJoinings, 0);
  const totalMonthlyTarget = recruiterStats.reduce((sum, r) => sum + r.monthlyTarget, 0);

  // WhatsApp Report
  const generateWhatsAppReport = () => {
    const companyTitle = selectedCompanyFilter === 'ALL' 
      ? 'ESSENTIAL SOUL GROUP (CONSOLIDATED)' 
      : companies.find(c => c.id === selectedCompanyFilter)?.name.toUpperCase() || 'ESSENTIAL SOUL LIFESTYLE PVT LTD';

    let report = `📊 *${companyTitle}*\n*DAILY RECRUITMENT & TARGET REPORT*\n🗓 *Date:* ${TODAY}\n`;
    
    recruiterStats.forEach(r => {
      report += `\n━━━━━━━━━━━━━━━━━━━━\n👩‍💼 *${r.user.department.toUpperCase()} — ${r.user.name.toUpperCase()} (${r.user.role})*\n`;
      report += `• Daily Interview Target: ${r.dailyTarget}\n`;
      report += `• Interviews Conducted Today: ${r.interviewsToday} / ${r.dailyTarget} (${r.dailyPacing}%)\n`;
      report += `• Selected Candidates: ${r.selected}\n`;
      report += `• Monthly Active Joinings: ${r.activeJoinings} / ${r.monthlyTarget}\n`;
      report += `• Daily Status: ${r.interviewsToday >= r.dailyTarget ? '✅ TARGET ACHIEVED' : `⚠️ ${r.dailyTarget - r.interviewsToday} PENDING INTERVIEWS`}\n`;
    });

    report += `\n━━━━━━━━━━━━━━━━━━━━\n🏢 *GROUP EXECUTIVE SUMMARY*\n`;
    report += `• Total Pipeline Leads: ${filteredCandidates.length}\n`;
    report += `• Total Interviews Conducted Today: ${totalInterviewsConductedToday} / ${totalDailyTarget} (${Math.round((totalInterviewsConductedToday / (totalDailyTarget || 1)) * 100)}%)\n`;
    report += `• Combined Active Joinings: ${totalActiveJoinings} / ${totalMonthlyTarget} (${Math.round((totalActiveJoinings / (totalMonthlyTarget || 1)) * 100)}%)\n`;
    report += `• Best Performing Source: Meta Ads\n\n`;
    report += `_Generated automatically via Essential Soul Lifestyle Recruitment ATS_`;

    return report;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(generateWhatsAppReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppReport());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Candidate Name', 'Phone', 'Email', 'Role', 'Department', 'Company', 'Source', 'Status', 'Assigned HR', 'Active Joining'];
    const rows = filteredCandidates.map(c => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.jobRole}"`,
      `"${c.department}"`,
      `"${c.companyName || ''}"`,
      `"${c.candidateSource}"`,
      `"${c.status}"`,
      `"${c.assignedHr}"`,
      c.isActiveJoining ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recruitment_report_${TODAY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Recruitment Reports & Analytics</h1>
              <p className="text-xs text-slate-500">
                Cross-company executive reporting, recruiter productivity, source ROI, and automated WhatsApp dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'WhatsApp Report'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Report Context:
          </span>

          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Companies (Consolidated)</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1">
          {[
            { id: 'EXECUTIVE', label: 'Executive Summary' },
            { id: 'RECRUITERS', label: 'Recruiter Scorecards' },
            { id: 'SOURCE_ROI', label: 'Source ROI' },
            { id: 'PIPELINE', label: 'Pipeline Stages' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeReportTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Executive Summary & WhatsApp Dispatch */}
      {activeReportTab === 'EXECUTIVE' && (
        <div className="space-y-4">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Candidates</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{filteredCandidates.length}</span>
                <span className="text-xs text-slate-500">leads tracked</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Today's Interviews</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">{totalInterviewsConductedToday}</span>
                <span className="text-xs text-slate-500">/ {totalDailyTarget} target</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Joinings</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">{totalActiveJoinings}</span>
                <span className="text-xs text-slate-500">/ {totalMonthlyTarget} target</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Group Conversion</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600">
                  {filteredCandidates.length > 0 ? Math.round((totalActiveJoinings / filteredCandidates.length) * 100) : 0}%
                </span>
                <span className="text-xs text-slate-500">lead-to-active</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Management Dispatch Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-xl border border-emerald-800/50 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800/60 gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Automated Management Dispatch
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Live WhatsApp Daily Recruitment Report
                </h3>
                <p className="text-xs text-emerald-200">
                  Click below to copy formatted text or dispatch directly to management WhatsApp group
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyWhatsApp}
                  className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-emerald-100 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp</span>
                </button>
              </div>
            </div>

            <pre className="mt-3 p-3.5 bg-slate-950/70 rounded-lg text-emerald-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto border border-emerald-900/50">
              {generateWhatsAppReport()}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Recruiter Scorecards */}
      {activeReportTab === 'RECRUITERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiterStats.map(({ user, totalAssigned, selected, activeJoinings, interviewsToday, dailyTarget, monthlyTarget, dailyPacing, monthlyPacing, conversionRate }) => (
            <div key={user.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                      <p className="text-[11px] text-slate-500">{user.role} • {user.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    dailyPacing >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {dailyPacing >= 100 ? 'Daily Goal Met' : `${dailyTarget - interviewsToday} Pending`}
                  </span>
                </div>

                {/* Score Grid */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Today Conducted</span>
                    <span className="text-base font-black text-slate-900">{interviewsToday} / {dailyTarget}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Active Joinings</span>
                    <span className="text-base font-black text-emerald-600">{activeJoinings} / {monthlyTarget}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Conversion</span>
                    <span className="text-base font-black text-blue-600">{conversionRate}%</span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="mt-3 space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Daily Interview Quota</span>
                      <span className="font-bold">{dailyPacing}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(dailyPacing, 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Monthly Active Joining Goal</span>
                      <span className="font-bold">{monthlyPacing}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(monthlyPacing, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{totalAssigned} Total Leads Assigned</span>
                <span className="text-indigo-600 font-semibold">{selected} In Offer/Selected</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Source ROI */}
      {activeReportTab === 'SOURCE_ROI' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Candidate Source ROI & Conversion Matrix
              </h3>
              <p className="text-xs text-slate-500">Tracks cost-effectiveness and conversion by marketing source</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Top Converting Channel: Meta Ads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate Source</th>
                  <th className="py-3 px-4">Total Leads</th>
                  <th className="py-3 px-4">Selected</th>
                  <th className="py-3 px-4">Active Joinings</th>
                  <th className="py-3 px-4">Conversion Rate</th>
                  <th className="py-3 px-4">Estimated Spend</th>
                  <th className="py-3 px-4">Cost Per Hire</th>
                  <th className="py-3 px-4 text-right">Performance Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sourceStats.map((st) => (
                  <tr key={st.source} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{st.source}</td>
                    <td className="py-3 px-4">{st.leads}</td>
                    <td className="py-3 px-4 text-purple-700 font-semibold">{st.selected}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{st.active}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                        {st.convRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {st.estimatedCost > 0 ? formatCurrency(st.estimatedCost) : 'Free'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {st.costPerHire > 0 ? formatCurrency(st.costPerHire) : '₹0 (Free)'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        st.convRate >= 25 ? 'bg-emerald-100 text-emerald-800' : (st.convRate >= 10 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600')
                      }`}>
                        {st.convRate >= 25 ? 'High Performer' : (st.convRate >= 10 ? 'Average' : 'Low Output')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Pipeline Stages Breakdown */}
      {activeReportTab === 'PIPELINE' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Candidate Pipeline Funnel Stages
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              'New Lead', 
              'Screening / Calling', 
              'Interview Scheduled', 
              'Interview Conducted', 
              'Selected', 
              'Joining Confirmed', 
              'Active Joining (Day 7+)', 
              'Rejected', 
              'Did Not Show Up', 
              'Left After Joining'
            ].map(stage => {
              const count = statusCounts[stage] || 0;
              const percent = filteredCandidates.length > 0 ? Math.round((count / filteredCandidates.length) * 100) : 0;
              return (
                <div key={stage} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">{stage}</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900">{count}</span>
                    <span className="text-xs font-semibold text-slate-400">{percent}%</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
