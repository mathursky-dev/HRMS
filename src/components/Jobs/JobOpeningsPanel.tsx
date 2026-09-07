import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  Pencil, 
  Trash2, 
  X, 
  AlertTriangle, 
  Search, 
  Filter, 
  Check, 
  Calendar, 
  IndianRupee, 
  User, 
  Building2,
  Flame,
  CheckCircle
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { JobOpening, Department } from '../../types';

interface JobFormData {
  title: string;
  department: Department;
  vacancies: number;
  filledPositions: number;
  experience: string;
  salaryRange: string;
  jobLocation: string;
  hrResponsible: string;
  hiringDeadline: string;
  status: 'Open' | 'Urgent' | 'Hold' | 'Closed';
}

const DEFAULT_NEW_FORM: JobFormData = {
  title: '',
  department: 'HR Recruitment',
  vacancies: 5,
  filledPositions: 0,
  experience: '1-3 Years',
  salaryRange: '₹20,000 - ₹30,000',
  jobLocation: 'Sector 62, Noida',
  hrResponsible: 'Nandani',
  hiringDeadline: '',
  status: 'Open',
};

export const JobOpeningsPanel: React.FC = () => {
  const { 
    jobOpenings, 
    addJobOpening, 
    updateJobOpening, 
    deleteJobOpening,
    departmentsList,
    allUsers,
  } = useRecruitment();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(DEFAULT_NEW_FORM);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [editFormData, setEditFormData] = useState<JobFormData>(DEFAULT_NEW_FORM);
  const [jobToDelete, setJobToDelete] = useState<JobOpening | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Open' | 'Urgent' | 'Hold' | 'Closed'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Helper readers for backward compatibility
  const getJobTitle = (j: JobOpening) => j.jobTitle || j.title || 'Untitled Opening';
  const getVacancies = (j: JobOpening) => Math.max(1, j.vacancies ?? j.openings ?? 1);
  const getFilled = (j: JobOpening) => Math.max(0, j.filledPositions ?? j.filled ?? 0);
  const getExperience = (j: JobOpening) => j.experience || j.experienceRequired || '1-3 Years';
  const getSalary = (j: JobOpening) => j.salaryRange || '₹20,000 - ₹30,000';
  const getLocation = (j: JobOpening) => j.jobLocation || j.location || 'Sector 62, Noida';
  const getHrResponsible = (j: JobOpening) => j.hrResponsible || 'Nandani';
  const getDeadline = (j: JobOpening) => j.hiringDeadline || '';

  // Department options from dynamic list or defaults
  const departmentOptions = useMemo(() => {
    const list = departmentsList && departmentsList.length > 0 
      ? departmentsList.map(d => d.name) 
      : ['HR Recruitment', 'BKD Recruitment', 'Operations', 'Management'];
    return Array.from(new Set(list));
  }, [departmentsList]);

  // HR options from users list
  const hrOptions = useMemo(() => {
    const activeHrUsers = allUsers && allUsers.length > 0
      ? allUsers.filter(u => u.status !== 'Inactive').map(u => u.name)
      : ['Nandani', 'Shivani', 'Priyanka', 'Aditya Mathur'];
    return Array.from(new Set(activeHrUsers));
  }, [allUsers]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobOpenings.filter(job => {
      const title = getJobTitle(job).toLowerCase();
      const dept = (job.department || '').toLowerCase();
      const loc = getLocation(job).toLowerCase();
      const hr = getHrResponsible(job).toLowerCase();
      const id = (job.id || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || 
        title.includes(query) || 
        dept.includes(query) || 
        loc.includes(query) || 
        hr.includes(query) ||
        id.includes(query);

      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
      const matchesDept = departmentFilter === 'ALL' || job.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [jobOpenings, searchQuery, statusFilter, departmentFilter]);

  // Metrics summary
  const metrics = useMemo(() => {
    const totalRoles = jobOpenings.length;
    const totalVacancies = jobOpenings.reduce((sum, j) => sum + getVacancies(j), 0);
    const totalFilled = jobOpenings.reduce((sum, j) => sum + getFilled(j), 0);
    const urgentCount = jobOpenings.filter(j => j.status === 'Urgent').length;
    const overallProgress = totalVacancies > 0 ? Math.round((totalFilled / totalVacancies) * 100) : 0;
    return { totalRoles, totalVacancies, totalFilled, urgentCount, overallProgress };
  }, [jobOpenings]);

  // Open Edit Modal
  const handleOpenEdit = (job: JobOpening) => {
    setEditingJob(job);
    setEditFormData({
      title: getJobTitle(job),
      department: job.department || 'HR Recruitment',
      vacancies: getVacancies(job),
      filledPositions: getFilled(job),
      experience: getExperience(job),
      salaryRange: getSalary(job),
      jobLocation: getLocation(job),
      hrResponsible: getHrResponsible(job),
      hiringDeadline: getDeadline(job),
      status: job.status || 'Open',
    });
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    if (!editFormData.title.trim()) return;

    const updates: Partial<JobOpening> = {
      jobTitle: editFormData.title.trim(),
      title: editFormData.title.trim(),
      department: editFormData.department,
      vacancies: Number(editFormData.vacancies) || 1,
      openings: Number(editFormData.vacancies) || 1,
      filledPositions: Number(editFormData.filledPositions) || 0,
      filled: Number(editFormData.filledPositions) || 0,
      experience: editFormData.experience.trim(),
      experienceRequired: editFormData.experience.trim(),
      salaryRange: editFormData.salaryRange.trim(),
      jobLocation: editFormData.jobLocation.trim(),
      location: editFormData.jobLocation.trim(),
      hrResponsible: editFormData.hrResponsible.trim(),
      hiringDeadline: editFormData.hiringDeadline,
      status: editFormData.status,
    };

    updateJobOpening(editingJob.id, updates);
    showToast(`Job opening "${editFormData.title.trim()}" updated successfully`);
    setEditingJob(null);
  };

  // Submit Add
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newOpening: Omit<JobOpening, 'id'> = {
      jobTitle: formData.title.trim(),
      title: formData.title.trim(),
      department: formData.department,
      vacancies: Number(formData.vacancies) || 1,
      openings: Number(formData.vacancies) || 1,
      filledPositions: Number(formData.filledPositions) || 0,
      filled: Number(formData.filledPositions) || 0,
      experience: formData.experience.trim(),
      experienceRequired: formData.experience.trim(),
      salaryRange: formData.salaryRange.trim(),
      jobLocation: formData.jobLocation.trim(),
      location: formData.jobLocation.trim(),
      hrResponsible: formData.hrResponsible.trim(),
      hiringDeadline: formData.hiringDeadline,
      status: formData.status,
    };

    addJobOpening(newOpening);
    showToast(`Published job opening "${formData.title.trim()}"`);
    setIsAdding(false);
    setFormData(DEFAULT_NEW_FORM);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!jobToDelete) return;
    const title = getJobTitle(jobToDelete);
    deleteJobOpening(jobToDelete.id);
    setJobToDelete(null);
    showToast(`Job opening "${title}" deleted successfully`);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div 
          id="job-alert-toast"
          className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Job Openings & Hiring Mandates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active job requisitions, vacancies, and hiring quotas across Essential Soul Lifestyle
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-post-new-opening"
          onClick={() => {
            setIsAdding(!isAdding);
            if (editingJob) setEditingJob(null);
          }}
          className="flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Requisition Form' : 'Post New Opening'}</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Job Roles</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{metrics.totalRoles}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Active positions</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Openings</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.totalVacancies}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Target headcount</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Joined / Filled</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.totalFilled}</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5 block font-medium">{metrics.overallProgress}% of mandate fulfilled</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Urgent Hiring</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{metrics.urgentCount}</div>
          <span className="text-[10px] text-rose-600 dark:text-rose-500 mt-0.5 block font-medium">Critical mandates</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-search-jobs"
              type="text"
              placeholder="Search by job title, department, location, or HR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Urgent">Urgent Hiring</option>
            <option value="Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            id="select-dept-filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Departments</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredJobs.length}</span> of {jobOpenings.length} openings
        </div>
      </div>

      {/* New Job Form */}
      {isAdding && (
        <form 
          id="form-add-job-opening"
          onSubmit={handleAdd} 
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-blue-500/40 dark:border-blue-500/50 shadow-sm space-y-4 text-xs animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Create New Hiring Requisition</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Position Title *</label>
              <input
                id="add-job-title"
                type="text"
                required
                placeholder="e.g. Sales Executive / HR Recruiter"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                id="add-job-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Openings Required *</label>
              <input
                id="add-job-openings"
                type="number"
                min="1"
                required
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience Required</label>
              <input
                id="add-job-experience"
                type="text"
                placeholder="e.g. 1-3 Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Offered Salary Range</label>
              <input
                id="add-job-salary"
                type="text"
                placeholder="e.g. ₹20,000 - ₹30,000"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Location</label>
              <input
                id="add-job-location"
                type="text"
                placeholder="e.g. Sector 62, Noida"
                value={formData.jobLocation}
                onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">HR Responsible / Recruiter</label>
              <select
                id="add-job-hr"
                value={formData.hrResponsible}
                onChange={(e) => setFormData({ ...formData, hrResponsible: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hrOptions.map(hr => (
                  <option key={hr} value={hr}>{hr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Status</label>
              <select
                id="add-job-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Open">Open</option>
                <option value="Urgent">Urgent Hiring</option>
                <option value="Hold">Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hiring Target Deadline</label>
              <input
                id="add-job-deadline"
                type="date"
                value={formData.hiringDeadline}
                onChange={(e) => setFormData({ ...formData, hiringDeadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn-cancel-add-job"
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-job"
              type="submit"
              className="px-5 py-2 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Publish Job Opening
            </button>
          </div>
        </form>
      )}

      {/* Grid of Openings */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Job Openings Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' || departmentFilter !== 'ALL' 
              ? 'Try changing your search keywords or filter criteria to see available job mandates.'
              : 'There are currently no active job requisitions. Click "Post New Opening" to create one.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL' || departmentFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDepartmentFilter('ALL');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const title = getJobTitle(job);
            const vacancies = getVacancies(job);
            const filled = getFilled(job);
            const progress = Math.min(100, Math.round((filled / vacancies) * 100));
            const exp = getExperience(job);
            const salary = getSalary(job);
            const loc = getLocation(job);
            const hr = getHrResponsible(job);
            const deadline = getDeadline(job);

            return (
              <div
                key={job.id}
                id={`job-card-${job.id}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header Row with Actions */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                          {title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          job.status === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : job.status === 'Open'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : job.status === 'Hold'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {job.status || 'Open'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{job.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {loc}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {job.id}
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Buttons: EDIT and DELETE */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>SPOC: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{hr}</strong></span>
                      {deadline && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Target: {deadline}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        id={`btn-edit-job-${job.id}`}
                        type="button"
                        onClick={() => handleOpenEdit(job)}
                        title="Edit Job Opening"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        id={`btn-delete-job-${job.id}`}
                        type="button"
                        onClick={() => setJobToDelete(job)}
                        title="Delete Job Opening"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{exp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Salary Range</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{salary}</span>
                  </div>
                </div>

                {/* Progress Bar of Fulfilled Openings */}
                <div className="pt-1">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Hiring Progress:</span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold">
                      {filled} of {vacancies} Active Joinings ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress >= 100 
                          ? 'bg-emerald-500' 
                          : progress >= 50 
                          ? 'bg-blue-600' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Edit Job Opening Modal */}
      {editingJob && (
        <div 
          id="modal-edit-job-opening"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Edit Hiring Mandate
                    </h2>
                    <span className="font-mono text-xs text-slate-400 bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {editingJob.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modify position vacancies, CTC range, and priority status
                  </p>
                </div>
              </div>
              <button
                id="btn-close-edit-modal"
                onClick={() => setEditingJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Position Title *</label>
                <input
                  id="edit-job-title"
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    id="edit-job-dept"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Status</label>
                  <select
                    id="edit-job-status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Urgent">Urgent Hiring</option>
                    <option value="Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Openings Required *</label>
                  <input
                    id="edit-job-openings"
                    type="number"
                    min="1"
                    required
                    value={editFormData.vacancies}
                    onChange={(e) => setEditFormData({ ...editFormData, vacancies: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Filled / Joined Count</label>
                  <input
                    id="edit-job-filled"
                    type="number"
                    min="0"
                    value={editFormData.filledPositions}
                    onChange={(e) => setEditFormData({ ...editFormData, filledPositions: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience Required</label>
                  <input
                    id="edit-job-experience"
                    type="text"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Offered Salary Range</label>
                  <input
                    id="edit-job-salary"
                    type="text"
                    value={editFormData.salaryRange}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Location</label>
                  <input
                    id="edit-job-location"
                    type="text"
                    value={editFormData.jobLocation}
                    onChange={(e) => setEditFormData({ ...editFormData, jobLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">HR Responsible / Recruiter</label>
                  <select
                    id="edit-job-hr"
                    value={editFormData.hrResponsible}
                    onChange={(e) => setEditFormData({ ...editFormData, hrResponsible: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hrOptions.map(hr => (
                      <option key={hr} value={hr}>{hr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hiring Deadline</label>
                <input
                  id="edit-job-deadline"
                  type="date"
                  value={editFormData.hiringDeadline}
                  onChange={(e) => setEditFormData({ ...editFormData, hiringDeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  id="btn-cancel-edit-job"
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-edit-job"
                  type="submit"
                  className="px-5 py-2 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div 
          id="modal-delete-job-opening"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delete Job Opening?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete this hiring requisition? This action will permanently remove it from active mandates.
                </p>
              </div>
            </div>

            {/* Target Job Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {getJobTitle(jobToDelete)}
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  {jobToDelete.id}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {jobToDelete.department} • {getLocation(jobToDelete)}
              </p>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold pt-1">
                {getFilled(jobToDelete)} filled of {getVacancies(jobToDelete)} total vacancies
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                id="btn-cancel-delete-job"
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-job"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Requisition</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

