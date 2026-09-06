import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Building2, 
  UserCheck, 
  Target, 
  Award, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  X, 
  Edit, 
  Trash2,
  FileText
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { DepartmentItem } from '../../types';

export const DepartmentMaster: React.FC = () => {
  const { 
    departmentsList, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment, 
    companies, 
    allUsers,
    candidates,
    jobOpenings 
  } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    companyId: companies[0]?.id || 'comp-1',
    headName: 'Nandani',
    dailyInterviewTarget: 5,
    monthlyActiveJoiningTarget: 20,
    description: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      companyId: companies[0]?.id || 'comp-1',
      headName: allUsers[0]?.name || 'Nandani',
      dailyInterviewTarget: 5,
      monthlyActiveJoiningTarget: 20,
      description: '',
      isActive: true,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      companyId: dept.companyId,
      headName: dept.headName,
      dailyInterviewTarget: dept.dailyInterviewTarget,
      monthlyActiveJoiningTarget: dept.monthlyActiveJoiningTarget,
      description: dept.description || '',
      isActive: dept.isActive,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Department name is required';
    if (!formData.code.trim()) errors.code = 'Department code is required (e.g. HR-REC)';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const matchedCompany = companies.find(c => c.id === formData.companyId);
    const companyName = matchedCompany ? matchedCompany.name : 'Essential Soul Lifestyle Pvt Ltd';

    const matchedHead = allUsers.find(u => u.name === formData.headName);
    const headEmail = matchedHead ? matchedHead.email : '';

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        companyId: formData.companyId,
        companyName,
        headName: formData.headName,
        headEmail,
        dailyInterviewTarget: Number(formData.dailyInterviewTarget) || 0,
        monthlyActiveJoiningTarget: Number(formData.monthlyActiveJoiningTarget) || 0,
        description: formData.description.trim(),
        isActive: formData.isActive,
      });
    } else {
      addDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        companyId: formData.companyId,
        companyName,
        headName: formData.headName,
        headEmail,
        dailyInterviewTarget: Number(formData.dailyInterviewTarget) || 0,
        monthlyActiveJoiningTarget: Number(formData.monthlyActiveJoiningTarget) || 0,
        description: formData.description.trim(),
        isActive: formData.isActive,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (dept: DepartmentItem) => {
    setDeptToDelete(dept);
  };

  const handleConfirmDeleteDept = () => {
    if (!deptToDelete) return;
    deleteDepartment(deptToDelete.id);
    setDeptToDelete(null);
  };

  const filteredDepts = departmentsList.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.headName.toLowerCase().includes(q) ||
      d.companyName.toLowerCase().includes(q)
    );

    const matchesComp = selectedCompanyFilter === 'ALL' || d.companyId === selectedCompanyFilter;

    return matchesSearch && matchesComp;
  });

  const totalDailyTargets = departmentsList.reduce((sum, d) => sum + (d.dailyInterviewTarget || 0), 0);
  const totalMonthlyTargets = departmentsList.reduce((sum, d) => sum + (d.monthlyActiveJoiningTarget || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Department Master</h1>
              <p className="text-xs text-slate-500">
                Manage recruitment departments, functional divisions, department heads, and allocated targets
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-department"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Departments</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{departmentsList.length}</span>
            <span className="text-xs text-slate-500">operating units</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department Heads</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {new Set(departmentsList.map(d => d.headName)).size}
            </span>
            <span className="text-xs text-slate-500">leads assigned</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Interview Quota</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalDailyTargets}</span>
            <span className="text-xs text-slate-500">total/day</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Active Targets</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{totalMonthlyTargets}</span>
            <span className="text-xs text-slate-500">joinings/month</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search department, head, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredDepts.length}</span> departments
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map(dept => {
          // Calculations
          const deptUsers = allUsers.filter(u => u.department.toLowerCase() === dept.name.toLowerCase());
          const deptCandidates = candidates.filter(c => c.department.toLowerCase() === dept.name.toLowerCase());
          const deptJobs = jobOpenings.filter(j => j.department.toLowerCase() === dept.name.toLowerCase());
          const activeJoinings = deptCandidates.filter(c => c.isActiveJoining).length;

          return (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black tracking-wider">
                        {dept.code}
                      </span>
                      {dept.isActive ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{dept.name}</h3>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{dept.companyName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      title="Delete Department"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {dept.description && (
                  <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {dept.description}
                  </p>
                )}

                {/* Department Head */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Department Head:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    {dept.headName}
                  </span>
                </div>

                {/* Target Metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Daily Interviews</span>
                    <span className="text-sm font-black text-emerald-600">
                      {dept.dailyInterviewTarget} / day
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Monthly Active Joinings</span>
                    <span className="text-sm font-black text-blue-600">
                      {dept.monthlyActiveJoiningTarget} / mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Stats */}
              <div className="p-3 bg-slate-50 rounded-b-xl border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" /> {deptUsers.length} Team Members
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" /> {deptJobs.length} Open Jobs
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {activeJoinings} Active Joinings
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingDept ? 'Edit Department Details' : 'Create New Department'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Map to parent company entity and configure interview & joining goals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDepartment} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HR Recruitment"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.name && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="e.g. HR-REC"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 uppercase font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.code && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.code}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parent Company Entity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Head / Lead <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.headName}
                  onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Target Quotas */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  Department Hiring Targets
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                      Daily Interview Target (Interviews/Day)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.dailyInterviewTarget}
                      onChange={(e) => setFormData({ ...formData, dailyInterviewTarget: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                      Monthly Active Joining Target (Joinings/Mo)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={formData.monthlyActiveJoiningTarget}
                      onChange={(e) => setFormData({ ...formData, monthlyActiveJoiningTarget: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scope & Responsibilities Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key recruitment function and team responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="dept-is-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="dept-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Department is active for candidate routing and job openings
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* Delete Department Confirmation Modal */}
      {deptToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Department
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-slate-900">{deptToDelete.name}</span> ({deptToDelete.code})?
                </p>
                <div className="mt-3.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company Entity:</span>
                    <span className="font-medium text-slate-800">{deptToDelete.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department Head:</span>
                    <span className="font-medium text-slate-800">{deptToDelete.headName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeptToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDept}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
