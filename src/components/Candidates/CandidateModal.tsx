import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building, 
  AlertCircle,
  ShieldAlert,
  Copy,
  Check,
  Search,
  ExternalLink,
  Info,
  RotateCcw
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateSource, Department, CandidateStatus } from '../../types';
import { DEFAULT_POSITIONS } from '../../mockData';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateToEdit?: Candidate | null;
}

interface DuplicateMatchInfo {
  candidate: Candidate;
  matchedByMobile: boolean;
  matchedByWhatsapp: boolean;
  matchedByEmail: boolean;
  matchedMobileValue?: string;
  matchedWhatsappValue?: string;
  matchedEmailValue?: string;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  candidateToEdit,
}) => {
  const { 
    addCandidate, 
    updateCandidate, 
    followUps, 
    interviews, 
    allUsers, 
    candidates,
    companies,
    departmentsList,
    activeCompanyId
  } = useRecruitment();

  const defaultCompanyId = activeCompanyId !== 'ALL' ? activeCompanyId : (companies[0]?.id || 'comp-1');
  const defaultDept = departmentsList[0]?.name || 'HR Recruitment';
  const defaultHr = allUsers[0]?.name || 'Nandani';

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: '',
    dateOfBirth: '',
    email: '',
    city: 'Noida',
    area: '',
    address: '',
    companyId: defaultCompanyId,
    positionApplied: 'Sales Executive',
    department: defaultDept as Department,
    qualification: 'Graduate',
    totalExperience: '1 Year',
    relevantExperience: '1 Year',
    currentCompany: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: 'Immediate',
    preferredLocation: 'Noida',
    candidateSource: 'Meta Ads' as CandidateSource,
    assignedHr: defaultHr,
    remarks: '',
    status: 'New Lead' as CandidateStatus,
  });

  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateMatchInfo | null>(null);
  const [duplicateFound, setDuplicateFound] = useState<Candidate | null>(null);
  const [showPreSubmitWarning, setShowPreSubmitWarning] = useState(false);
  const [overrideDuplicate, setOverrideDuplicate] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (candidateToEdit) {
      setFormData({
        fullName: candidateToEdit.fullName,
        mobileNumber: candidateToEdit.mobileNumber,
        whatsappNumber: candidateToEdit.whatsappNumber,
        gender: candidateToEdit.gender,
        age: candidateToEdit.age ? String(candidateToEdit.age) : '',
        dateOfBirth: candidateToEdit.dateOfBirth || '',
        email: candidateToEdit.email,
        city: candidateToEdit.city,
        area: candidateToEdit.area,
        address: candidateToEdit.address || '',
        companyId: candidateToEdit.companyId || defaultCompanyId,
        positionApplied: candidateToEdit.positionApplied,
        department: candidateToEdit.department,
        qualification: candidateToEdit.qualification,
        totalExperience: candidateToEdit.totalExperience,
        relevantExperience: candidateToEdit.relevantExperience,
        currentCompany: candidateToEdit.currentCompany || '',
        currentSalary: candidateToEdit.currentSalary ? String(candidateToEdit.currentSalary) : '',
        expectedSalary: candidateToEdit.expectedSalary ? String(candidateToEdit.expectedSalary) : '',
        noticePeriod: candidateToEdit.noticePeriod || 'Immediate',
        preferredLocation: candidateToEdit.preferredLocation || 'Noida',
        candidateSource: candidateToEdit.candidateSource,
        assignedHr: candidateToEdit.assignedHr,
        remarks: candidateToEdit.remarks || '',
        status: candidateToEdit.status,
      });
      setDuplicateFound(null);
      setDuplicateInfo(null);
      setShowPreSubmitWarning(false);
      setOverrideDuplicate(false);
    } else {
      setFormData({
        fullName: '',
        mobileNumber: '',
        whatsappNumber: '',
        gender: 'Male',
        age: '',
        dateOfBirth: '',
        email: '',
        city: 'Noida',
        area: '',
        address: '',
        companyId: defaultCompanyId,
        positionApplied: 'Sales Executive',
        department: defaultDept as Department,
        qualification: 'Graduate',
        totalExperience: '1 Year',
        relevantExperience: '1 Year',
        currentCompany: '',
        currentSalary: '',
        expectedSalary: '',
        noticePeriod: 'Immediate',
        preferredLocation: 'Noida',
        candidateSource: 'Meta Ads',
        assignedHr: defaultHr,
        remarks: '',
        status: 'New Lead',
      });
      setDuplicateFound(null);
      setDuplicateInfo(null);
      setShowPreSubmitWarning(false);
      setOverrideDuplicate(false);
    }
  }, [candidateToEdit, isOpen, defaultCompanyId, defaultDept, defaultHr]);

  // Real-time Automatic Duplicate Scanner for Email & Phone (Mobile & WhatsApp)
  useEffect(() => {
    const rawMob = formData.mobileNumber.trim();
    const rawWa = formData.whatsappNumber.trim();
    const rawEmail = formData.email.trim();

    const cleanMob = rawMob.replace(/[^0-9]/g, '').slice(-10);
    const cleanWa = rawWa.replace(/[^0-9]/g, '').slice(-10);
    const cleanEmail = rawEmail.toLowerCase();
    const isValidEmail = cleanEmail.length >= 5 && cleanEmail.includes('@') && cleanEmail.includes('.');

    if (cleanMob.length >= 10 || cleanWa.length >= 10 || isValidEmail) {
      const foundCand = candidates.find((c) => {
        if (candidateToEdit && c.id === candidateToEdit.id) return false;
        if (c.isArchived) return false;

        const cMob = c.mobileNumber ? c.mobileNumber.replace(/[^0-9]/g, '').slice(-10) : '';
        const cWa = c.whatsappNumber ? c.whatsappNumber.replace(/[^0-9]/g, '').slice(-10) : '';
        const cEmail = c.email ? c.email.trim().toLowerCase() : '';

        const matchMob = cleanMob.length >= 10 && (cMob === cleanMob || cWa === cleanMob);
        const matchWa = cleanWa.length >= 10 && (cMob === cleanWa || cWa === cleanWa);
        const matchEmail = Boolean(isValidEmail && cEmail.length > 0 && cEmail === cleanEmail);

        return matchMob || matchWa || matchEmail;
      });

      if (foundCand) {
        const cMob = foundCand.mobileNumber ? foundCand.mobileNumber.replace(/[^0-9]/g, '').slice(-10) : '';
        const cWa = foundCand.whatsappNumber ? foundCand.whatsappNumber.replace(/[^0-9]/g, '').slice(-10) : '';
        const cEmail = foundCand.email ? foundCand.email.trim().toLowerCase() : '';

        const matchedByMobile = cleanMob.length >= 10 && (cMob === cleanMob || cWa === cleanMob);
        const matchedByWhatsapp = cleanWa.length >= 10 && (cMob === cleanWa || cWa === cleanWa);
        const matchedByEmail = Boolean(isValidEmail && cEmail.length > 0 && cEmail === cleanEmail);

        setDuplicateInfo({
          candidate: foundCand,
          matchedByMobile,
          matchedByWhatsapp,
          matchedByEmail,
          matchedMobileValue: matchedByMobile ? (cMob || cWa) : undefined,
          matchedWhatsappValue: matchedByWhatsapp ? (cMob || cWa) : undefined,
          matchedEmailValue: matchedByEmail ? cEmail : undefined,
        });
        setDuplicateFound(foundCand);
      } else {
        setDuplicateInfo(null);
        setDuplicateFound(null);
      }
    } else {
      setDuplicateInfo(null);
      setDuplicateFound(null);
    }
  }, [formData.mobileNumber, formData.whatsappNumber, formData.email, candidateToEdit, candidates]);

  if (!isOpen) return null;

  const executeSave = (finalWa: string, forceAllow: boolean = false) => {
    if (candidateToEdit) {
      updateCandidate(
        candidateToEdit.id,
        {
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          whatsappNumber: finalWa,
          gender: formData.gender,
          age: formData.age ? Number(formData.age) : undefined,
          dateOfBirth: formData.dateOfBirth,
          email: formData.email,
          city: formData.city,
          area: formData.area,
          address: formData.address,
          companyId: formData.companyId,
          positionApplied: formData.positionApplied,
          department: formData.department,
          qualification: formData.qualification,
          totalExperience: formData.totalExperience,
          relevantExperience: formData.relevantExperience,
          currentCompany: formData.currentCompany,
          currentSalary: formData.currentSalary ? Number(formData.currentSalary) : undefined,
          expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
          noticePeriod: formData.noticePeriod,
          preferredLocation: formData.preferredLocation,
          candidateSource: formData.candidateSource,
          assignedHr: formData.assignedHr,
          remarks: formData.remarks,
          status: formData.status,
        },
        'Candidate record updated'
      );
      onClose();
    } else {
      const res = addCandidate(
        {
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          whatsappNumber: finalWa,
          gender: formData.gender,
          age: formData.age ? Number(formData.age) : undefined,
          dateOfBirth: formData.dateOfBirth,
          email: formData.email,
          city: formData.city,
          area: formData.area,
          address: formData.address,
          companyId: formData.companyId,
          positionApplied: formData.positionApplied,
          department: formData.department,
          qualification: formData.qualification,
          totalExperience: formData.totalExperience,
          relevantExperience: formData.relevantExperience,
          currentCompany: formData.currentCompany,
          currentSalary: formData.currentSalary ? Number(formData.currentSalary) : undefined,
          expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
          noticePeriod: formData.noticePeriod,
          preferredLocation: formData.preferredLocation,
          candidateSource: formData.candidateSource,
          assignedHr: formData.assignedHr,
          remarks: forceAllow && duplicateInfo
            ? `${formData.remarks ? formData.remarks + ' | ' : ''}Re-application: Duplicate of ${duplicateInfo.candidate.id} acknowledged.`
            : formData.remarks,
          status: formData.status,
        },
        forceAllow
      );

      if (res.success) {
        onClose();
      } else if (res.duplicate) {
        setDuplicateInfo({
          candidate: res.duplicate,
          matchedByMobile: true,
          matchedByWhatsapp: false,
          matchedByEmail: false,
        });
        setDuplicateFound(res.duplicate);
        setShowPreSubmitWarning(true);
        setErrorMsg('Duplicate candidate record detected in database.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('A valid 10-digit Mobile Number is required');
      return;
    }

    // WhatsApp number defaults to mobile if empty
    const finalWa = formData.whatsappNumber.trim() || formData.mobileNumber.trim();

    // If duplicate detected and creating new candidate, warn user before submission
    if (duplicateInfo && !candidateToEdit && !overrideDuplicate) {
      setShowPreSubmitWarning(true);
      return;
    }

    executeSave(finalWa, overrideDuplicate);
  };

  const handleCopyExistingData = () => {
    if (!duplicateInfo) return;
    const cand = duplicateInfo.candidate;
    setFormData((prev) => ({
      ...prev,
      fullName: cand.fullName,
      mobileNumber: cand.mobileNumber,
      whatsappNumber: cand.whatsappNumber || cand.mobileNumber,
      email: cand.email || prev.email,
      gender: cand.gender || prev.gender,
      age: cand.age ? String(cand.age) : prev.age,
      dateOfBirth: cand.dateOfBirth || prev.dateOfBirth,
      city: cand.city || prev.city,
      area: cand.area || prev.area,
      address: cand.address || prev.address,
      positionApplied: cand.positionApplied || prev.positionApplied,
      department: cand.department || prev.department,
      qualification: cand.qualification || prev.qualification,
      totalExperience: cand.totalExperience || prev.totalExperience,
      relevantExperience: cand.relevantExperience || prev.relevantExperience,
      currentCompany: cand.currentCompany || prev.currentCompany,
      currentSalary: cand.currentSalary ? String(cand.currentSalary) : prev.currentSalary,
      expectedSalary: cand.expectedSalary ? String(cand.expectedSalary) : prev.expectedSalary,
      noticePeriod: cand.noticePeriod || prev.noticePeriod,
      preferredLocation: cand.preferredLocation || prev.preferredLocation,
      candidateSource: cand.candidateSource || prev.candidateSource,
      assignedHr: cand.assignedHr || prev.assignedHr,
      remarks: cand.remarks ? `${cand.remarks} (Copied from existing ${cand.id})` : prev.remarks,
    }));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
    setShowPreSubmitWarning(false);
  };

  const handleConfirmForceSubmit = () => {
    setShowPreSubmitWarning(false);
    setOverrideDuplicate(true);
    const finalWa = formData.whatsappNumber.trim() || formData.mobileNumber.trim();
    executeSave(finalWa, true);
  };

  // Get details of duplicate candidate
  const duplicateFollowUp = duplicateInfo
    ? followUps.find((f) => f.candidateId === duplicateInfo.candidate.id)
    : null;
  const duplicateInterview = duplicateInfo
    ? interviews.find((i) => i.candidateId === duplicateInfo.candidate.id)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold">
                {candidateToEdit ? 'Edit Candidate Record' : 'Fast Candidate Entry Form'}
              </h2>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Duplicate Scanner Active
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Essential Soul Lifestyle • Automatic Email & Phone Conflict Verification
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DUPLICATE CANDIDATE CHECK WARNING BANNER */}
        {duplicateInfo && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5 shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-rose-900">
                      Automatic Duplicate Warning Detected
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 uppercase tracking-wider">
                      Match Found
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyExistingData}
                      className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copySuccess ? 'Data Copied!' : 'Copy Existing Info'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mobileNumber: '', whatsappNumber: '', email: '' }))}
                      className="text-[11px] font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Clear Contact Fields
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {duplicateInfo.matchedByMobile && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md border border-rose-200">
                      <Phone className="w-3 h-3 text-rose-600" />
                      Mobile Match: {formData.mobileNumber}
                    </span>
                  )}
                  {duplicateInfo.matchedByWhatsapp && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md border border-rose-200">
                      <Phone className="w-3 h-3 text-rose-600" />
                      WhatsApp Match: {formData.whatsappNumber}
                    </span>
                  )}
                  {duplicateInfo.matchedByEmail && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md border border-purple-200">
                      <Mail className="w-3 h-3 text-purple-600" />
                      Email Match: {formData.email}
                    </span>
                  )}
                </div>

                <div className="mt-3 bg-white p-3 rounded-xl border border-rose-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Existing Candidate</span>
                    <strong className="text-slate-900 block truncate">{duplicateInfo.candidate.fullName}</strong>
                    <span className="text-[10px] text-slate-500 block font-mono">{duplicateInfo.candidate.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned HR</span>
                    <strong className="text-blue-700 block">{duplicateInfo.candidate.assignedHr}</strong>
                    <span className="text-[10px] text-slate-500 block">{duplicateInfo.candidate.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Status</span>
                    <strong className="text-slate-900 block">{duplicateInfo.candidate.status}</strong>
                    <span className="text-[10px] text-slate-500 block">Source: {duplicateInfo.candidate.candidateSource}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Last Activity</span>
                    <strong className="text-slate-700 block truncate">
                      {duplicateFollowUp ? `Follow-up on ${duplicateFollowUp.followUpDate}` : (duplicateInterview ? `Interview: ${duplicateInterview.interviewDate}` : 'No activity logged')}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Created: {duplicateInfo.candidate.createdAt?.slice(0, 10)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-rose-700 mt-2 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  Pre-submission guard active: You will be asked to confirm before submitting this duplicate record.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic & Contact Info */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Basic & Contact Information
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                Phone & Email scanned in real-time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  {duplicateInfo?.matchedByMobile && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Duplicate
                    </span>
                  )}
                  {!duplicateInfo?.matchedByMobile && formData.mobileNumber.replace(/[^0-9]/g, '').slice(-10).length === 10 && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Available
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    className={`w-full text-xs px-3 py-2 pr-8 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                      duplicateInfo?.matchedByMobile
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  <Phone className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none ${duplicateInfo?.matchedByMobile ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {duplicateInfo?.matchedByMobile && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    In CRM: {duplicateInfo.candidate.fullName} ({duplicateInfo.candidate.id})
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    WhatsApp Number
                  </label>
                  {duplicateInfo?.matchedByWhatsapp && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Duplicate
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Same as mobile if empty"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    className={`w-full text-xs px-3 py-2 pr-8 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                      duplicateInfo?.matchedByWhatsapp
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  <Phone className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none ${duplicateInfo?.matchedByWhatsapp ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {duplicateInfo?.matchedByWhatsapp && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Matches record: {duplicateInfo.candidate.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Email</label>
                  {duplicateInfo?.matchedByEmail && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Duplicate Email
                    </span>
                  )}
                  {!duplicateInfo?.matchedByEmail && formData.email.trim().length >= 5 && formData.email.includes('@') && formData.email.includes('.') && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Available
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="candidate@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full text-xs px-3 py-2 pr-8 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                      duplicateInfo?.matchedByEmail
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  <Mail className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none ${duplicateInfo?.matchedByEmail ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {duplicateInfo?.matchedByEmail && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Email in CRM: {duplicateInfo.candidate.fullName} ({duplicateInfo.candidate.id})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              2. Location Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Area</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62 / Indirapuram"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  placeholder="House/Street details"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Job Role, Department & Experience */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              3. Company Entity, Position & Department
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Entity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Position Applied <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.positionApplied}
                  onChange={(e) => setFormData({ ...formData, positionApplied: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {DEFAULT_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => {
                    const dept = e.target.value as Department;
                    const matchedUser = allUsers.find(u => u.department.toLowerCase() === dept.toLowerCase());
                    setFormData({
                      ...formData,
                      department: dept,
                      assignedHr: matchedUser ? matchedUser.name : formData.assignedHr,
                    });
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. Graduate (B.Com) / 12th"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 2 Years / Fresher"
                  value={formData.totalExperience}
                  onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relevant Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year in Telesales"
                  value={formData.relevantExperience}
                  onChange={(e) => setFormData({ ...formData, relevantExperience: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Company</label>
                <input
                  type="text"
                  placeholder="e.g. ABC Pvt Ltd"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Compensation & Notice */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              4. Salary & Availability
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Salary (₹/m)</label>
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={formData.currentSalary}
                  onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Salary (₹/m)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Period</label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Immediate">Immediate Joiner</option>
                  <option value="7 Days">7 Days</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Source, Assignment & Initial Status */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              5. Source, Assignment & Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Source <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.candidateSource}
                  onChange={(e) => setFormData({ ...formData, candidateSource: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Naukri">Naukri</option>
                  <option value="Apna">Apna</option>
                  <option value="WorkIndia">WorkIndia</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Data Vendor">Data Vendor</option>
                  <option value="Existing Database">Existing Database</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned HR <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.assignedHr}
                  onChange={(e) => setFormData({ ...formData, assignedHr: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Not Contacted">Not Contacted</option>
                  <option value="Connected">Connected</option>
                  <option value="Call Back">Call Back</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">HR Remarks & Notes</label>
              <textarea
                rows={2}
                placeholder="Initial screening notes, shift preference, communication rating, etc."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 w-full sm:w-auto">
              {duplicateInfo && !candidateToEdit ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Duplicate warning: Submitting will prompt conflict verification
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Auto duplicate scan active for phone & email
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                  duplicateInfo && !candidateToEdit
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {duplicateInfo && !candidateToEdit ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Review Duplicate & Save
                  </>
                ) : (
                  candidateToEdit ? 'Save Changes' : 'Save & Register Candidate'
                )}
              </button>
            </div>
          </div>

        </form>

        {/* PRE-SUBMISSION WARNING CONFIRMATION MODAL */}
        {showPreSubmitWarning && duplicateInfo && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-rose-300 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="bg-rose-900 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-rose-800 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-rose-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Duplicate Candidate Warning
                    </h3>
                    <p className="text-[11px] text-rose-200">
                      Potential duplicate detected in recruitment database
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreSubmitWarning(false)}
                  className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                  <p className="font-semibold">
                    The contact details you entered match an existing candidate in Essential Soul Lifestyle CRM:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {duplicateInfo.matchedByMobile && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 font-bold text-[10px] inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Mobile: {formData.mobileNumber}
                      </span>
                    )}
                    {duplicateInfo.matchedByWhatsapp && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 font-bold text-[10px] inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" /> WhatsApp: {formData.whatsappNumber}
                      </span>
                    )}
                    {duplicateInfo.matchedByEmail && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 font-bold text-[10px] inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email: {formData.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Conflict Comparison Box */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Current Entry
                    </span>
                    <p className="font-bold text-slate-900 truncate">{formData.fullName || 'Untitled'}</p>
                    <p className="text-[11px] text-slate-600 mt-1 truncate">📞 {formData.mobileNumber || '-'}</p>
                    <p className="text-[11px] text-slate-600 truncate">✉️ {formData.email || 'No email'}</p>
                    <p className="text-[11px] text-slate-500 mt-1">HR: {formData.assignedHr}</p>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
                      Existing CRM Record
                    </span>
                    <p className="font-bold text-amber-950 truncate">{duplicateInfo.candidate.fullName}</p>
                    <p className="text-[11px] text-amber-900 mt-1 truncate">📞 {duplicateInfo.candidate.mobileNumber}</p>
                    <p className="text-[11px] text-amber-900 truncate">✉️ {duplicateInfo.candidate.email || 'No email'}</p>
                    <p className="text-[11px] text-amber-800 mt-1 font-semibold">
                      Status: {duplicateInfo.candidate.status} ({duplicateInfo.candidate.assignedHr})
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    How would you like to proceed?
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Registering duplicates may cause duplicate candidate calling and target reporting inaccuracies.
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreSubmitWarning(false)}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Go Back & Edit Contact Info (Recommended)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExistingData}
                    className="py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Existing Data
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmForceSubmit}
                    className="py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Confirm & Save Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
