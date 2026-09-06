import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Building2, 
  FileText, 
  Calendar, 
  User, 
  Briefcase, 
  Check, 
  ShieldCheck,
  Info
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { OfferLetter, Department, CompensationBreakup } from '../../types';

interface OfferLetterFormModalProps {
  editingOffer?: OfferLetter | null;
  onClose: () => void;
  onSave: (offerData: Omit<OfferLetter, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const DEPARTMENTS: Department[] = ['Sales', 'HR', 'Telecalling', 'Marketing', 'Operations', 'Accounts', 'IT', 'Retail'];

export const OfferLetterFormModal: React.FC<OfferLetterFormModalProps> = ({
  editingOffer,
  onClose,
  onSave,
}) => {
  const { candidates, companies, termsClauses, currentUser } = useRecruitment();

  // Candidate Selection
  const [candidateId, setCandidateId] = useState(editingOffer?.candidateId || '');
  const [candidateName, setCandidateName] = useState(editingOffer?.candidateName || '');
  const [candidateEmail, setCandidateEmail] = useState(editingOffer?.candidateEmail || '');
  const [candidatePhone, setCandidatePhone] = useState(editingOffer?.candidatePhone || '');

  // Role & Company
  const [companyId, setCompanyId] = useState(editingOffer?.companyId || companies[0]?.id || '');
  const [designation, setDesignation] = useState(editingOffer?.designation || '');
  const [department, setDepartment] = useState<Department>(editingOffer?.department || 'Sales');
  const [location, setLocation] = useState(editingOffer?.location || 'Noida HQ');
  const [reportingManager, setReportingManager] = useState(editingOffer?.reportingManager || 'HR Head');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultJoining = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const defaultValidity = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [offerDate, setOfferDate] = useState(editingOffer?.offerDate || todayStr);
  const [joiningDate, setJoiningDate] = useState(editingOffer?.joiningDate || defaultJoining);
  const [validityDate, setValidityDate] = useState(editingOffer?.validityDate || defaultValidity);

  // Policies
  const [probationMonths, setProbationMonths] = useState(editingOffer?.probationMonths || 3);
  const [noticeDays, setNoticeDays] = useState(editingOffer?.noticeDays || 30);

  // Compensation
  const [annualCtc, setAnnualCtc] = useState<number>(editingOffer?.annualCtc || 360000);
  const [monthlyGross, setMonthlyGross] = useState<number>(editingOffer?.monthlyGross || 30000);
  const [monthlyInHand, setMonthlyInHand] = useState<number>(editingOffer?.monthlyInHand || 28000);

  // Breakup components
  const [basicSalary, setBasicSalary] = useState<number>(editingOffer?.compensationBreakup?.basicSalary || editingOffer?.basicSalary || 15000);
  const [hra, setHra] = useState<number>(editingOffer?.compensationBreakup?.hra || editingOffer?.hra || 7500);
  const [specialAllowance, setSpecialAllowance] = useState<number>(editingOffer?.compensationBreakup?.specialAllowance || editingOffer?.specialAllowance || 7500);
  const [performanceBonus, setPerformanceBonus] = useState<number>(editingOffer?.compensationBreakup?.performanceBonus || editingOffer?.performanceIncentive || 0);

  // Attached Terms
  const [attachedClauseIds, setAttachedClauseIds] = useState<string[]>(() => {
    if (editingOffer?.attachedClauseIds) return editingOffer.attachedClauseIds;
    // Default to all mandatory active clauses
    return termsClauses.filter(c => c.isMandatoryInOffer && c.isActive).map(c => c.id);
  });

  // Status
  const [status, setStatus] = useState<OfferLetter['status']>(editingOffer?.status || 'Draft');

  // When candidate is selected from dropdown, populate fields
  const handleSelectCandidate = (selectedCandId: string) => {
    setCandidateId(selectedCandId);
    const cand = candidates.find(c => c.id === selectedCandId);
    if (cand) {
      setCandidateName(cand.fullName);
      setCandidateEmail(cand.email || '');
      setCandidatePhone(cand.mobile);
      if (cand.department) setDepartment(cand.department);
      if (cand.appliedRole) setDesignation(cand.appliedRole);
      if (cand.offeredCtc && cand.offeredCtc > 0) {
        applyCtcCalculation(cand.offeredCtc);
      }
    }
  };

  // CTC Auto-Calculation formula
  const applyCtcCalculation = (ctc: number) => {
    setAnnualCtc(ctc);
    const gross = Math.round(ctc / 12);
    setMonthlyGross(gross);
    // Standard Indian salary structuring:
    // Basic = 50% of gross
    const basic = Math.round(gross * 0.50);
    // HRA = 50% of basic (25% of gross)
    const hraAmount = Math.round(gross * 0.25);
    // Special allowance = remaining balance
    const special = Math.max(0, gross - basic - hraAmount);

    setBasicSalary(basic);
    setHra(hraAmount);
    setSpecialAllowance(special);

    // Estimated take-home: Gross minus ~₹200 PT / PF estimate
    const estimatedInHand = gross > 25000 ? Math.round(gross - 1800) : Math.max(0, gross - 200);
    setMonthlyInHand(estimatedInHand);
  };

  const handleToggleClause = (id: string) => {
    setAttachedClauseIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !designation.trim() || annualCtc <= 0) return;

    const selectedCompany = companies.find(c => c.id === companyId) || companies[0];

    const breakup: CompensationBreakup = {
      basicSalary,
      hra,
      specialAllowance,
      performanceBonus: performanceBonus > 0 ? performanceBonus : undefined,
    };

    onSave({
      candidateId: candidateId || undefined,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      candidatePhone: candidatePhone.trim(),
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      designation: designation.trim(),
      department,
      annualCtc,
      monthlyGross,
      monthlyInHand,
      compensationBreakup: breakup,
      offerDate,
      joiningDate,
      validityDate,
      probationMonths,
      noticeDays,
      status,
      reportingManager: reportingManager.trim(),
      location: location.trim(),
      attachedClauseIds,
      issuedBy: currentUser.name,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {editingOffer ? `Edit Offer Letter (${editingOffer.id})` : 'Create Candidate Offer Letter'}
              </h2>
              <p className="text-xs text-slate-500">
                Generate official company employment contract with salary breakdown & terms clauses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Candidate Selection Section */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Candidate Information</span>
              </h3>
              <span className="text-[11px] text-slate-400">Select existing candidate or type new</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Registered Candidate
                </label>
                <select
                  value={candidateId}
                  onChange={(e) => handleSelectCandidate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Manual Entry / External Candidate --</option>
                  {candidates.map(cand => (
                    <option key={cand.id} value={cand.id}>
                      {cand.fullName} ({cand.appliedRole} • {cand.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="text"
                  required
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. candidate@gmail.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Job & Company Details */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Job Role & Company Legal Entity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Company
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Fashion Consultant"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sector 18 Retail Store, Noida"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reporting Manager
                </label>
                <input
                  type="text"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  placeholder="e.g. Store General Manager"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OfferLetter['status'])}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="Draft">Draft (Internal review)</option>
                  <option value="Issued">Issued (Sent to candidate)</option>
                  <option value="Accepted">Accepted (Candidate agreed)</option>
                  <option value="Joined">Joined (Candidate on duty)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Periods */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Offer Date
              </label>
              <input
                type="date"
                required
                value={offerDate}
                onChange={(e) => setOfferDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Joining *
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Offer Valid Until
              </label>
              <input
                type="date"
                required
                value={validityDate}
                onChange={(e) => setValidityDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Probation (Months)
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={probationMonths}
                onChange={(e) => setProbationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notice (Days)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={noticeDays}
                onChange={(e) => setNoticeDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Salary Calculator Section */}
          <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Compensation Structure & Auto-Calculator</span>
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                Annual CTC automatically calculates monthly salary breakup
              </span>
            </div>

            {/* Quick CTC presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mr-1">Presets:</span>
              {[240000, 300000, 360000, 420000, 480000, 600000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => applyCtcCalculation(val)}
                  className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded text-[11px] font-mono text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                >
                  ₹{(val / 100000).toFixed(1)} LPA
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Annual CTC (₹ / year) *
                </label>
                <input
                  type="number"
                  required
                  min="50000"
                  step="5000"
                  value={annualCtc}
                  onChange={(e) => applyCtcCalculation(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold bg-white dark:bg-slate-800 border-2 border-blue-400 dark:border-blue-600 rounded-lg text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Gross (₹ / month)
                </label>
                <input
                  type="number"
                  value={monthlyGross}
                  onChange={(e) => setMonthlyGross(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  Estimated Take-Home (Monthly In-Hand)
                </label>
                <input
                  type="number"
                  value={monthlyInHand}
                  onChange={(e) => setMonthlyInHand(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-900 dark:text-emerald-200"
                />
              </div>
            </div>

            {/* Breakup Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/50">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  Basic (Monthly)
                </label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  HRA (Monthly)
                </label>
                <input
                  type="number"
                  value={hra}
                  onChange={(e) => setHra(Number(e.target.value))}
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  Special Allowance
                </label>
                <input
                  type="number"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  Annual Bonus (Optional)
                </label>
                <input
                  type="number"
                  value={performanceBonus}
                  onChange={(e) => setPerformanceBonus(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Attached Terms & Conditions Clauses Selection */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Annexure B: Attached Terms & Policies ({attachedClauseIds.length} selected)</span>
              </h3>
              <button
                type="button"
                onClick={() => setAttachedClauseIds(termsClauses.filter(c => c.isActive).map(c => c.id))}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-200 dark:divide-slate-700/50">
              {termsClauses.filter(c => c.isActive).map(clause => {
                const isSelected = attachedClauseIds.includes(clause.id);
                return (
                  <label
                    key={clause.id}
                    className="flex items-start gap-2 pt-1.5 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/30 p-1 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleClause(clause.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                        {clause.clauseNumber}: {clause.title}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        [{clause.category}]
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5" />
              <span>Issuing will update candidate status to &apos;Offer Generated&apos;</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-xs"
              >
                {editingOffer ? 'Save Changes' : 'Generate Offer Letter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
