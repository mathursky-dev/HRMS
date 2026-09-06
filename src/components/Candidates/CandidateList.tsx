import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Bell, 
  FileText, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  Clock,
  AlertTriangle,
  Sparkles,
  ArrowUpDown,
  X,
  RotateCcw,
  Briefcase,
  SlidersHorizontal,
  Tag,
  Building2,
  Archive,
  UserCheck,
  Check
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateStatus, CandidateSource, Department } from '../../types';
import { getStatusBadgeClass, getLeadAgingCategory, calculateDaysDifference } from '../../utils/formatters';
import { CandidateModal } from './CandidateModal';
import { CandidateDetailModal } from './CandidateDetailModal';
import { FollowUpEntryModal } from '../FollowUps/FollowUpEntryModal';
import { ScheduleInterviewModal } from '../Interviews/ScheduleInterviewModal';
import { StatusUpdateModal } from './StatusUpdateModal';
import { DEFAULT_POSITIONS, TODAY } from '../../mockData';

const BULK_STATUS_OPTIONS: CandidateStatus[] = [
  'New Lead',
  'Not Contacted',
  'Attempted',
  'Connected',
  'Call Back',
  'Interested',
  'Not Interested',
  'Not Reachable',
  'Wrong Number',
  'Follow-up',
  'Interview Scheduled',
  'Interview Confirmed',
  'Interview Rescheduled',
  'Interview Conducted',
  'Selected',
  'Rejected',
  'Hold',
  'Salary Discussion',
  'Training Scheduled',
  'Joining Confirmed',
  'Joined',
  'Active Joining',
  'No Show',
  'Resigned'
];

export const CandidateList: React.FC<{
  onOpenAddModal: () => void;
  onNavigate?: (nav: string) => void;
}> = ({ onOpenAddModal, onNavigate }) => {
  const { 
    candidates, 
    bulkAssignCandidates, 
    bulkUpdateCandidateStatus,
    bulkArchiveCandidates,
    bulkRestoreCandidates,
    companies, 
    departmentsList, 
    allUsers, 
    activeCompanyId, 
    setActiveCompanyId 
  } = useRecruitment();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [hrFilter, setHrFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [agingFilter, setAgingFilter] = useState<string>('ALL');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Bulk selection & action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignTarget, setBulkAssignTarget] = useState<string>(allUsers[0]?.name || 'Nandani');
  const [bulkStatusTarget, setBulkStatusTarget] = useState<CandidateStatus>('Interview Scheduled');
  const [bulkFeedback, setBulkFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const selectAllCheckboxRef = React.useRef<HTMLInputElement>(null);

  // Modals state
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [followUpCandidate, setFollowUpCandidate] = useState<Candidate | null>(null);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<Candidate | null>(null);

  // Dynamically compute all unique positions/job roles available
  const availableJobRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    DEFAULT_POSITIONS.forEach((pos) => rolesSet.add(pos));
    candidates.forEach((c) => {
      if (c.positionApplied && c.positionApplied.trim()) {
        rolesSet.add(c.positionApplied.trim());
      }
    });
    return Array.from(rolesSet).sort();
  }, [candidates]);

  // Counts by job role (active or archived according to showArchived)
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach((c) => {
      if (!showArchived && c.isArchived) return;
      if (showArchived && !c.isArchived) return;
      const role = c.positionApplied?.trim() || 'Other';
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [candidates, showArchived]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach((c) => {
      if (!showArchived && c.isArchived) return;
      if (showArchived && !c.isArchived) return;
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [candidates, showArchived]);

  const activeCandidatesCount = useMemo(() => {
    return candidates.filter((c) => (showArchived ? c.isArchived : !c.isArchived)).length;
  }, [candidates, showArchived]);

  // Quick Status Funnel Tabs
  const QUICK_STATUS_TABS = [
    { label: 'All Statuses', value: 'ALL', count: activeCandidatesCount },
    { label: 'New Leads', value: 'New Lead', count: statusCounts['New Lead'] || 0 },
    { label: 'Connected', value: 'Connected', count: statusCounts['Connected'] || 0 },
    { label: 'Follow-ups', value: 'Follow-up', count: statusCounts['Follow-up'] || 0 },
    { label: 'Interviews', value: 'Interview Scheduled', count: statusCounts['Interview Scheduled'] || 0 },
    { label: 'Conducted', value: 'Interview Conducted', count: statusCounts['Interview Conducted'] || 0 },
    { label: 'Selected', value: 'Selected', count: statusCounts['Selected'] || 0 },
    { label: 'Joining Confirmed', value: 'Joining Confirmed', count: statusCounts['Joining Confirmed'] || 0 },
    { label: 'Active Joining', value: 'Active Joining', count: statusCounts['Active Joining'] || 0 },
  ];

  // Check if any filter is currently applied
  const isAnyFilterActive = Boolean(
    searchTerm.trim() ||
    companyFilter !== 'ALL' ||
    roleFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    hrFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    agingFilter !== 'ALL'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setCompanyFilter('ALL');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setHrFilter('ALL');
    setSourceFilter('ALL');
    setAgingFilter('ALL');
  };

  // Filtered list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (!showArchived && c.isArchived) return false;
      if (showArchived && !c.isArchived) return false;

      // Active Company global context
      if (activeCompanyId !== 'ALL' && c.companyId && c.companyId !== activeCompanyId) {
        return false;
      }

      // Company Filter
      if (companyFilter !== 'ALL' && c.companyId !== companyFilter) return false;

      // Global Text search across all major candidate fields
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const match =
          c.fullName.toLowerCase().includes(query) ||
          c.mobileNumber.includes(query) ||
          c.whatsappNumber.includes(query) ||
          (c.email && c.email.toLowerCase().includes(query)) ||
          c.positionApplied.toLowerCase().includes(query) ||
          c.department.toLowerCase().includes(query) ||
          c.status.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          (c.area && c.area.toLowerCase().includes(query)) ||
          c.id.toLowerCase().includes(query) ||
          c.assignedHr.toLowerCase().includes(query) ||
          (c.companyName && c.companyName.toLowerCase().includes(query)) ||
          (c.currentCompany && c.currentCompany.toLowerCase().includes(query)) ||
          (c.qualification && c.qualification.toLowerCase().includes(query));
        if (!match) return false;
      }

      // Job Role / Position filter
      if (roleFilter !== 'ALL' && c.positionApplied !== roleFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // Department
      if (departmentFilter !== 'ALL' && c.department !== departmentFilter) return false;

      // HR
      if (hrFilter !== 'ALL' && c.assignedHr !== hrFilter) return false;

      // Source
      if (sourceFilter !== 'ALL' && c.candidateSource !== sourceFilter) return false;

      // Aging
      if (agingFilter !== 'ALL') {
        const aging = getLeadAgingCategory(c.createdAt);
        if (aging !== agingFilter) return false;
      }

      return true;
    });
  }, [candidates, searchTerm, companyFilter, activeCompanyId, roleFilter, departmentFilter, statusFilter, hrFilter, sourceFilter, agingFilter, showArchived]);

  // Sync indeterminate state of select all checkbox
  React.useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isAllSelected = filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length;
      const isIndeterminate = selectedIds.length > 0 && !isAllSelected;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedIds, filteredCandidates]);

  const triggerFeedback = (message: string, type: 'success' | 'info' = 'success') => {
    setBulkFeedback({ message, type });
    setTimeout(() => {
      setBulkFeedback(null);
    }, 4500);
  };

  // Bulk select toggles
  const handleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk action: Reassign Recruiter
  const handleBulkAssign = () => {
    if (selectedIds.length === 0) return;
    bulkAssignCandidates(selectedIds, bulkAssignTarget);
    triggerFeedback(`Successfully assigned ${selectedIds.length} candidate(s) to recruiter ${bulkAssignTarget}.`);
    setSelectedIds([]);
  };

  // Bulk action: Change Status
  const handleBulkStatusChange = () => {
    if (selectedIds.length === 0) return;
    bulkUpdateCandidateStatus(selectedIds, bulkStatusTarget);
    triggerFeedback(`Successfully updated status of ${selectedIds.length} candidate(s) to "${bulkStatusTarget}".`);
    setSelectedIds([]);
  };

  // Bulk action: Archive
  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    const confirm = window.confirm(`Archive ${selectedIds.length} selected candidate(s)? You can restore them anytime from the Archived view.`);
    if (!confirm) return;
    bulkArchiveCandidates(selectedIds);
    triggerFeedback(`Archived ${selectedIds.length} candidate(s) successfully.`);
    setSelectedIds([]);
  };

  // Bulk action: Restore
  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    bulkRestoreCandidates(selectedIds);
    triggerFeedback(`Restored ${selectedIds.length} candidate(s) to active pipeline.`);
    setSelectedIds([]);
  };

  // CSV Export helper
  const exportCandidatesToCSV = (items: Candidate[], filename: string) => {
    const headers = [
      'Candidate ID',
      'Full Name',
      'Mobile Number',
      'WhatsApp Number',
      'Position',
      'Department',
      'Status',
      'Assigned HR',
      'Source',
      'Experience',
      'Expected Salary',
      'Created Date',
    ];

    const rows = items.map((c) => [
      c.id,
      `"${c.fullName}"`,
      c.mobileNumber,
      c.whatsappNumber,
      `"${c.positionApplied}"`,
      `"${c.department}"`,
      `"${c.status}"`,
      `"${c.assignedHr}"`,
      `"${c.candidateSource}"`,
      `"${c.totalExperience}"`,
      c.expectedSalary || '',
      c.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    exportCandidatesToCSV(filteredCandidates, `Essential_Soul_Candidates_${TODAY}.csv`);
  };

  const handleBulkExportSelected = () => {
    if (selectedIds.length === 0) return;
    const selected = filteredCandidates.filter((c) => selectedIds.includes(c.id));
    exportCandidatesToCSV(selected, `Selected_Candidates_${selectedIds.length}_${TODAY}.csv`);
    triggerFeedback(`Exported ${selected.length} selected candidates to CSV.`);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Candidate Master & ATS Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage complete applicant journey from initial lead capture to active joining
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('import-export')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
              title="Bulk Import or Export Candidates via CSV/XLS with sample templates"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Bulk Import / Export</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <span>+ Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
        
        {/* Global Search Bar Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Global Search: candidate name, 10-digit mobile, WhatsApp, email, job role, city, ID, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchTerm('');
              }}
              className="w-full pl-10 pr-28 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/70 shadow-2xs font-medium placeholder:text-slate-400"
            />
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md hidden sm:inline-block">
                {filteredCandidates.length} found
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                title="Reset all filters and search query"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showArchived
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {showArchived ? 'Viewing Archived' : 'Show Archived'}
            </button>
          </div>
        </div>

        {/* Quick Job Role Suggestions Strip */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 uppercase tracking-wider">
            <Briefcase className="w-3 h-3 text-slate-400" />
            Quick Roles:
          </span>
          {['Sales Executive', 'Telecaller', 'HR Executive', 'Team Leader', 'Customer Support', 'Back Office Executive'].map((role) => {
            const isSelected = roleFilter === role;
            const count = roleCounts[role] || 0;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(isSelected ? 'ALL' : role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                }`}
              >
                <span>{role}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-md ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600 font-bold'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Status Funnel Tabs */}
        <div className="pt-1 overflow-x-auto pb-0.5">
          <div className="flex items-center gap-1.5 min-w-max">
            {QUICK_STATUS_TABS.map((tab) => {
              const isSelected = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Filters Dropdowns (Company, Job Role, Status, Dept, HR, Source, Aging) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-1.5 border-t border-slate-100 text-xs">
          
          {/* 0. Company Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-500" />
              Company
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Companies</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.code} - {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* 1. Job Role / Position Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-blue-500" />
              Job Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Roles ({activeCandidatesCount})</option>
              {availableJobRoles.map((role) => (
                <option key={role} value={role}>
                  {role} ({roleCounts[role] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-indigo-500" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Statuses ({activeCandidatesCount})</option>
              <option value="New Lead">New Lead ({statusCounts['New Lead'] || 0})</option>
              <option value="Not Contacted">Not Contacted ({statusCounts['Not Contacted'] || 0})</option>
              <option value="Connected">Connected ({statusCounts['Connected'] || 0})</option>
              <option value="Call Back">Call Back ({statusCounts['Call Back'] || 0})</option>
              <option value="Interested">Interested ({statusCounts['Interested'] || 0})</option>
              <option value="Follow-up">Follow-up ({statusCounts['Follow-up'] || 0})</option>
              <option value="Interview Scheduled">Interview Scheduled ({statusCounts['Interview Scheduled'] || 0})</option>
              <option value="Interview Confirmed">Interview Confirmed ({statusCounts['Interview Confirmed'] || 0})</option>
              <option value="Interview Conducted">Interview Conducted ({statusCounts['Interview Conducted'] || 0})</option>
              <option value="Selected">Selected ({statusCounts['Selected'] || 0})</option>
              <option value="Joining Confirmed">Joining Confirmed ({statusCounts['Joining Confirmed'] || 0})</option>
              <option value="Joined">Joined ({statusCounts['Joined'] || 0})</option>
              <option value="Active Joining">Active Joining ({statusCounts['Active Joining'] || 0})</option>
              <option value="No Show">No Show ({statusCounts['No Show'] || 0})</option>
              <option value="Resigned">Resigned ({statusCounts['Resigned'] || 0})</option>
            </select>
          </div>

          {/* 3. Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Assigned HR */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assigned HR</label>
            <select
              value={hrFilter}
              onChange={(e) => setHrFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">All HR Executives</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Source */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">All Sources</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="WorkIndia">WorkIndia</option>
              <option value="Apna">Apna</option>
              <option value="Indeed">Indeed</option>
              <option value="Naukri">Naukri</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          {/* 6. Lead Aging */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Lead Aging</label>
            <select
              value={agingFilter}
              onChange={(e) => setAgingFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">All Aging Bands</option>
              <option value="0 Day">0 Day (Today)</option>
              <option value="1 Day">1 Day (Yesterday)</option>
              <option value="2-3 Days">2–3 Days</option>
              <option value="4-7 Days">4–7 Days</option>
              <option value="7+ Days">7+ Days (Old)</option>
            </select>
          </div>

        </div>

        {/* Active Filter Badges Strip */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
            
            {companyFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                Company: {companies.find(c => c.id === companyFilter)?.code || companyFilter}
                <button type="button" onClick={() => setCompanyFilter('ALL')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                Search: &ldquo;{searchTerm}&rdquo;
                <button type="button" onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {roleFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
                Role: {roleFilter}
                <button type="button" onClick={() => setRoleFilter('ALL')} className="hover:text-sky-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                Status: {statusFilter}
                <button type="button" onClick={() => setStatusFilter('ALL')} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {departmentFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                Dept: {departmentFilter}
                <button type="button" onClick={() => setDepartmentFilter('ALL')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {hrFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                HR: {hrFilter}
                <button type="button" onClick={() => setHrFilter('ALL')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sourceFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                Source: {sourceFilter}
                <button type="button" onClick={() => setSourceFilter('ALL')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {agingFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                Aging: {agingFilter}
                <button type="button" onClick={() => setAgingFilter('ALL')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

      </div>

      {/* Feedback banner */}
      {bulkFeedback && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{bulkFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBulkFeedback(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bulk Action Bar (if items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50/95 via-indigo-50/80 to-blue-50/95 dark:from-slate-900 dark:via-blue-950/50 dark:to-slate-900 border-2 border-blue-300 dark:border-blue-700/80 p-3.5 sm:p-4 rounded-xl shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-black px-2.5 py-0.5 rounded-full text-xs shadow-xs">
                {selectedIds.length}
              </span>
              <span className="font-bold text-blue-950 dark:text-blue-100 text-sm">
                Candidates Selected
              </span>
            </div>

            <div className="h-4 w-px bg-blue-200 dark:bg-blue-800 hidden sm:block" />

            {selectedIds.length < filteredCandidates.length ? (
              <button
                type="button"
                onClick={() => setSelectedIds(filteredCandidates.map((c) => c.id))}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-950 dark:hover:text-blue-100 font-semibold underline text-xs cursor-pointer"
              >
                Select all {filteredCandidates.length} in view
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium underline text-xs cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Bulk Action 1: Change Status */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px] whitespace-nowrap">Status:</span>
              <select
                value={bulkStatusTarget}
                onChange={(e) => setBulkStatusTarget(e.target.value as CandidateStatus)}
                className="bg-transparent text-slate-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer py-0.5"
              >
                {BULK_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="text-slate-900 bg-white dark:bg-slate-800">
                    {st}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkStatusChange}
                className="ml-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Check className="w-3 h-3" />
                <span>Apply Status</span>
              </button>
            </div>

            {/* Bulk Action 2: Assign Recruiter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-slate-700 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px] whitespace-nowrap">Recruiter:</span>
              <select
                value={bulkAssignTarget}
                onChange={(e) => setBulkAssignTarget(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer py-0.5 max-w-[160px] truncate"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.name} className="text-slate-900 bg-white dark:bg-slate-800">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkAssign}
                className="ml-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <UserCheck className="w-3 h-3" />
                <span>Assign Recruiter</span>
              </button>
            </div>

            {/* Bulk Action 3: Export Selected */}
            <button
              type="button"
              onClick={handleBulkExportSelected}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
              title="Download CSV of selected candidates only"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Export ({selectedIds.length})</span>
            </button>

            {/* Bulk Action 4: Archive / Restore */}
            {!showArchived ? (
              <button
                type="button"
                onClick={handleBulkArchive}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                title="Archive selected candidates"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive ({selectedIds.length})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBulkRestore}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                title="Restore selected candidates from archive"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Candidates Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="p-4 w-12 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      checked={filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer transition"
                      aria-label="Select all candidates in this view"
                      title={
                        selectedIds.length === filteredCandidates.length
                          ? 'Deselect all candidates'
                          : 'Select all candidates in this view'
                      }
                    />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3">Candidate Details</th>
                <th scope="col" className="px-4 py-3">Position & Dept</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Assigned HR</th>
                <th scope="col" className="px-4 py-3">Lead Aging</th>
                <th scope="col" className="px-4 py-3">Source</th>
                <th scope="col" className="px-4 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">No candidates match your criteria</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {isAnyFilterActive
                            ? 'Try clearing your search query or adjusting your job role and status filters.'
                            : 'No candidate records are currently available in this view.'}
                        </p>
                      </div>
                      {isAnyFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear Search & Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const agingBand = getLeadAgingCategory(cand.createdAt);
                  const daysOld = calculateDaysDifference(cand.createdAt);
                  const isUntouchedOver24h =
                    (cand.status === 'New Lead' || cand.status === 'Not Contacted') && daysOld >= 1;
                  const isSelected = selectedIds.includes(cand.id);

                  return (
                    <tr
                      key={cand.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 ring-1 ring-inset ring-blue-300 dark:ring-blue-700 font-medium'
                          : isUntouchedOver24h
                          ? 'bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <td className="p-4 w-12 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(cand.id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer transition"
                            aria-label={`Select candidate ${cand.fullName}`}
                          />
                        </div>
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div
                          className="cursor-pointer"
                          onClick={() => setViewCandidate(cand)}
                        >
                          <div className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {cand.fullName}
                            {isUntouchedOver24h && (
                              <span
                                className="w-2 h-2 rounded-full bg-rose-500 animate-ping"
                                title="Untouched lead for over 24 hours!"
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>📞 {cand.mobileNumber}</span>
                            <span>•</span>
                            <span>{cand.city}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{cand.id}</span>
                        </div>
                      </td>

                      {/* Position & Dept */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{cand.positionApplied}</span>
                          {cand.companyId && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              {companies.find(c => c.id === cand.companyId)?.code || 'ESL'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{cand.department}</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                            cand.status
                          )}`}
                        >
                          {cand.status}
                        </span>
                      </td>

                      {/* Assigned HR */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-blue-900">
                        {cand.assignedHr}
                      </td>

                      {/* Lead Aging & Highlight */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              isUntouchedOver24h
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-extrabold'
                                : daysOld === 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {agingBand}
                          </span>
                          {isUntouchedOver24h && (
                            <span className="text-[10px] text-rose-600 font-bold">Untouched!</span>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        {cand.candidateSource}
                      </td>

                      {/* QUICK ACTION BUTTONS (📞 Call, 💬 WhatsApp, 📅 Interview, 🔔 Follow-up, 📝 Note, ✅ Update Status) */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* 📞 Call */}
                          <a
                            href={`tel:${cand.mobileNumber}`}
                            title="Call candidate"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* 💬 WhatsApp */}
                          <a
                            href={`https://wa.me/91${cand.whatsappNumber}?text=${encodeURIComponent(
                              `Hello ${cand.fullName}, greetings from Essential Soul Lifestyle Pvt Ltd regarding your application for the ${cand.positionApplied} role.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* 📅 Schedule Interview */}
                          <button
                            onClick={() => setInterviewCandidate(cand)}
                            title="Schedule Interview"
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg border border-slate-200 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* 🔔 Log Follow-up */}
                          <button
                            onClick={() => setFollowUpCandidate(cand)}
                            title="Add Follow-up"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-slate-200 transition-colors"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {/* ✅ Update Status */}
                          <button
                            onClick={() => setStatusCandidate(cand)}
                            title="Update Status"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setViewCandidate(cand)}
                            title="View Full Profile & Notes"
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> candidates
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to open candidate profile, timeline logs, and complete communication history.
          </span>
        </div>
      </div>

      {/* Modals */}
      {viewCandidate && (
        <CandidateDetailModal
          isOpen={Boolean(viewCandidate)}
          onClose={() => setViewCandidate(null)}
          candidate={viewCandidate}
          onOpenEdit={() => {
            setEditCandidate(viewCandidate);
            setViewCandidate(null);
          }}
          onOpenFollowUp={() => {
            setFollowUpCandidate(viewCandidate);
            setViewCandidate(null);
          }}
          onOpenInterview={() => {
            setInterviewCandidate(viewCandidate);
            setViewCandidate(null);
          }}
          onOpenStatusUpdate={() => {
            setStatusCandidate(viewCandidate);
            setViewCandidate(null);
          }}
        />
      )}

      {editCandidate && (
        <CandidateModal
          isOpen={Boolean(editCandidate)}
          onClose={() => setEditCandidate(null)}
          candidateToEdit={editCandidate}
        />
      )}

      {followUpCandidate && (
        <FollowUpEntryModal
          isOpen={Boolean(followUpCandidate)}
          onClose={() => setFollowUpCandidate(null)}
          candidate={followUpCandidate}
        />
      )}

      {interviewCandidate && (
        <ScheduleInterviewModal
          isOpen={Boolean(interviewCandidate)}
          onClose={() => setInterviewCandidate(null)}
          candidate={interviewCandidate}
        />
      )}

      {statusCandidate && (
        <StatusUpdateModal
          isOpen={Boolean(statusCandidate)}
          onClose={() => setStatusCandidate(null)}
          candidate={statusCandidate}
        />
      )}

    </div>
  );
};
