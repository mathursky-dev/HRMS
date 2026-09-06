import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  X, 
  Layers, 
  Users, 
  Briefcase,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Lock,
  Send,
  ExternalLink
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Company } from '../../types';
import { CompanyCredentialsMasterModal } from './CompanyCredentialsMasterModal';

export const CompanyMaster: React.FC = () => {
  const { 
    companies, 
    addCompany, 
    updateCompany, 
    deleteCompany, 
    activeCompanyId, 
    setActiveCompanyId,
    departmentsList,
    candidates,
    jobOpenings,
    setCurrentUser 
  } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'credentials'>('directory');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCredentialsMasterOpen, setIsCredentialsMasterOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Card Credentials helper states
  const [visibleCardPasswords, setVisibleCardPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // Helper generator
  const generateCompanyPassword = (code?: string): string => {
    const c = (code || 'Corp').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const specials = ['@', '#', '$', '!'];
    const spec = specials[Math.floor(Math.random() * specials.length)];
    return `${c}${spec}Corp2026`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleCardPasswordVisibility = (id: string) => {
    setVisibleCardPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    legalName: '',
    cin: '',
    gstin: '',
    address: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309',
    email: '',
    phone: '',
    website: '',
    departments: ['HR Recruitment'] as string[],
    isActive: true,
    adminUserId: '',
    adminPassword: '',
    masterContactPerson: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      code: '',
      legalName: '',
      cin: '',
      gstin: '',
      address: '',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      email: '',
      phone: '',
      website: '',
      departments: ['HR Recruitment'],
      isActive: true,
      adminUserId: '',
      adminPassword: 'Corp@2026',
      masterContactPerson: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name,
      code: comp.code,
      legalName: comp.legalName || '',
      cin: comp.cin || '',
      gstin: comp.gstin || '',
      address: comp.address,
      city: comp.city,
      state: comp.state,
      pincode: comp.pincode || '',
      email: comp.email,
      phone: comp.phone,
      website: comp.website || '',
      departments: comp.departments || [],
      isActive: comp.isActive,
      adminUserId: comp.adminUserId || `${comp.code.toLowerCase()}.admin`,
      adminPassword: comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`,
      masterContactPerson: comp.masterContactPerson || '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleToggleDept = (deptName: string) => {
    setFormData(prev => {
      const exists = prev.departments.includes(deptName);
      if (exists) {
        return { ...prev, departments: prev.departments.filter(d => d !== deptName) };
      }
      return { ...prev, departments: [...prev.departments, deptName] };
    });
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Company name is required';
    if (!formData.code.trim()) errors.code = 'Short code is required (e.g. ESL)';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';

    const cleanUserId = formData.adminUserId.trim() || `${formData.code.toLowerCase().trim()}.admin`;
    const cleanPassword = formData.adminPassword.trim() || `${formData.code.toUpperCase().trim()}@Corp2026`;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        legalName: formData.legalName.trim() || formData.name.trim(),
        cin: formData.cin.trim(),
        gstin: formData.gstin.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        departments: formData.departments,
        isActive: formData.isActive,
        adminUserId: cleanUserId,
        adminPassword: cleanPassword,
        masterContactPerson: formData.masterContactPerson.trim() || 'Director / Managing Head',
        lastPasswordChanged: new Date().toISOString(),
      });
    } else {
      addCompany({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        legalName: formData.legalName.trim() || formData.name.trim(),
        cin: formData.cin.trim(),
        gstin: formData.gstin.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        departments: formData.departments,
        isActive: formData.isActive,
        adminUserId: cleanUserId,
        adminPassword: cleanPassword,
        masterContactPerson: formData.masterContactPerson.trim() || 'Director / Managing Head',
        lastPasswordChanged: new Date().toISOString(),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const targetComp = companies.find(c => c.id === id) || ({ id, name, code: 'N/A' } as Company);
    setCompanyToDelete(targetComp);
  };

  const handleConfirmDelete = () => {
    if (!companyToDelete) return;
    const targetName = companyToDelete.name;
    const targetId = companyToDelete.id;
    deleteCompany(targetId);
    setCompanyToDelete(null);
    setNotificationToast({
      type: 'success',
      message: `Company "${targetName}" was removed from the registry successfully.`,
    });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  // Switch / simulate login as Company Admin
  const handleLoginAsCompanyAdmin = (comp: Company) => {
    setActiveCompanyId(comp.id);
    setCurrentUser({
      id: `comp-admin-${comp.id}`,
      name: `${comp.name} (Corporate Admin)`,
      email: comp.email,
      role: 'Director / Management',
      department: 'Management',
      companyId: comp.id,
      companyName: comp.name,
      userId: comp.adminUserId || `${comp.code.toLowerCase()}.admin`,
      dailyInterviewTarget: 10,
      monthlyActiveJoiningTarget: 25,
      status: 'Active',
    });
  };

  const filteredCompanies = companies.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.adminUserId && c.adminUserId.toLowerCase().includes(q)) ||
      (c.cin && c.cin.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q)) ||
      (c.masterContactPerson && c.masterContactPerson.toLowerCase().includes(q))
    );
  });

  const totalActive = companies.filter(c => c.isActive).length;
  const totalWithCredentials = companies.filter(c => c.adminUserId).length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Multiple Company Master</h1>
              <p className="text-xs text-slate-500">
                Manage group entities, subsidiaries, registered legal credentials, and company-specific hiring pipelines
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-company-credentials-master"
            onClick={() => setIsCredentialsMasterOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Manage and inspect master login credentials for all companies"
          >
            <KeyRound className="w-4 h-4 text-white" />
            <span>Company User ID & Password Master</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-600/60 text-[10px]">
              {totalWithCredentials}
            </span>
          </button>

          <button
            id="btn-add-company"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Companies</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{companies.length}</span>
            <span className="text-xs text-slate-500">registered entities</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Entities</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalActive}</span>
            <span className="text-xs text-slate-500">actively hiring</span>
          </div>
        </div>

        <div 
          onClick={() => setIsCredentialsMasterOpen(true)}
          className="bg-white hover:bg-amber-50/40 rounded-xl border border-amber-200/80 p-4 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Master Credentials</span>
            <KeyRound className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{totalWithCredentials}</span>
              <span className="text-xs text-slate-500">assigned credentials</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 underline">Open Master →</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Pipeline</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{candidates.length}</span>
            <span className="text-xs text-slate-500">total applicants</span>
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'directory'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Group Entities Directory ({companies.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'credentials'
              ? 'border-amber-500 text-amber-700 bg-amber-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>Company User ID & Password Master</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-100 text-amber-800">
            {totalWithCredentials} Active
          </span>
        </button>
      </div>

      {/* Active Company Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap mr-1">Active Entity Context:</span>
          <button
            onClick={() => setActiveCompanyId('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeCompanyId === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Companies (Consolidated)
          </button>
          {companies.map(comp => (
            <button
              key={comp.id}
              onClick={() => setActiveCompanyId(comp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeCompanyId === comp.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {comp.code} • {comp.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, CIN, GST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map(comp => {
          const isCurrentActive = activeCompanyId === comp.id;
          const compDepts = departmentsList.filter(d => d.companyId === comp.id);
          const compJobs = jobOpenings.filter(j => 
            compDepts.some(d => d.name.toLowerCase() === j.department.toLowerCase())
          );

          return (
            <div
              key={comp.id}
              className={`bg-white rounded-xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-4 sm:p-5">
                {/* Header with Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black tracking-wider">
                        {comp.code}
                      </span>
                      {comp.isActive ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{comp.name}</h3>
                    {comp.legalName && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{comp.legalName}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn-edit-company-${comp.id}`}
                      type="button"
                      onClick={() => handleOpenEdit(comp)}
                      title="Edit Company"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-company-${comp.id}`}
                      type="button"
                      onClick={() => handleDelete(comp.id, comp.name)}
                      title="Delete Company"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Identification Badges */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {comp.cin && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">CIN:</span>
                      <span className="font-mono font-medium text-slate-700">{comp.cin}</span>
                    </div>
                  )}
                  {comp.gstin && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">GSTIN:</span>
                      <span className="font-mono font-medium text-slate-700">{comp.gstin}</span>
                    </div>
                  )}
                </div>

                {/* Address & Contact */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-600">
                      {comp.address}, {comp.city}, {comp.state} {comp.pincode ? `- ${comp.pincode}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-mono text-slate-700">{comp.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-700 truncate">{comp.email}</span>
                  </div>
                  {comp.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a 
                        href={comp.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-blue-600 hover:underline truncate"
                      >
                        {comp.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Linked Departments */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Associated Departments ({comp.departments?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {comp.departments && comp.departments.length > 0 ? (
                      comp.departments.map((dept, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {dept}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">None assigned</span>
                    )}
                  </div>
                </div>

                {/* Corporate User ID & Password Box on Card */}
                <div className="mt-3 pt-2.5 pb-2 px-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-600" />
                      Corporate Login Credentials
                    </span>
                    {comp.masterContactPerson && (
                      <span className="text-[10px] text-amber-800 font-medium truncate max-w-[120px]" title={comp.masterContactPerson}>
                        {comp.masterContactPerson}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">Admin User ID:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-blue-700">
                      <span>{comp.adminUserId || `${comp.code.toLowerCase()}.admin`}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(comp.adminUserId || `${comp.code.toLowerCase()}.admin`, `card-uid-${comp.id}`)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy User ID"
                      >
                        {copiedField === `card-uid-${comp.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">Master Password:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                      <span>
                        {visibleCardPasswords[comp.id] 
                          ? (comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`) 
                          : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCardPasswordVisibility(comp.id)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={visibleCardPasswords[comp.id] ? 'Hide password' : 'Show password'}
                      >
                        {visibleCardPasswords[comp.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`, `card-pwd-${comp.id}`)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedField === `card-pwd-${comp.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 rounded-b-xl border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleLoginAsCompanyAdmin(comp)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-100/60 transition-colors cursor-pointer"
                  title="Simulate login as Corporate Administrator for this entity"
                >
                  <Lock className="w-3 h-3" />
                  <span>Login as Entity</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveCompanyId(comp.id)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrentActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isCurrentActive ? '✓ Active Context' : 'Select Entity'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab 2 Embedded Master View */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Company User ID and Password Master Registry</span>
              </h2>
              <p className="text-xs text-slate-500">
                Direct access to manage corporate admin credentials, reset passwords, and switch active tenant logins
              </p>
            </div>
            <button
              onClick={() => setIsCredentialsMasterOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Full Master Window</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Company Entity</th>
                  <th className="py-2.5 px-3">Entity Code</th>
                  <th className="py-2.5 px-3">Master Admin User ID</th>
                  <th className="py-2.5 px-3">Login Password</th>
                  <th className="py-2.5 px-3">Authorized SPOC</th>
                  <th className="py-2.5 px-3">Official Email</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map(comp => (
                  <tr key={comp.id} className="hover:bg-amber-50/20">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {comp.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        {comp.code}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {comp.adminUserId || `${comp.code.toLowerCase()}.admin`}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-800">
                          {visibleCardPasswords[comp.id]
                            ? (comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`)
                            : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCardPasswordVisibility(comp.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {visibleCardPasswords[comp.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`, `tab-pwd-${comp.id}`)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {copiedField === `tab-pwd-${comp.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {comp.masterContactPerson || 'Director'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {comp.email}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(comp)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        >
                          Edit Credentials
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoginAsCompanyAdmin(comp)}
                          className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                        >
                          Login as Entity
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comp.id, comp.name)}
                          title="Delete Company"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingCompany ? 'Edit Company Details' : 'Register New Company Master'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add corporate entity profile, GST, CIN, mapped departments, and login credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveCompany} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Company Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Essential Soul Lifestyle Pvt Ltd"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.name && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Short Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. ESL"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 uppercase font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.code && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.code}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Legal / Corporate Name
                </label>
                <input
                  type="text"
                  placeholder="Official registered name as per MCA"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CIN (Corporate Identification Number)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U74999UP2022PTC168921"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09AAECE1234F1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Office Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot/Building number, tower, floor, area..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                {formErrors.address && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="201309"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="hr@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  {formErrors.email && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  {formErrors.phone && <p className="text-rose-500 text-[10px] mt-0.5">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Corporate Master Credentials (User ID & Password Master) */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Company Master Login Credentials (User ID & Password Master)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded">
                    Corporate Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Admin User ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Company Admin User ID <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const codeSuggest = formData.code ? `${formData.code.toLowerCase()}.admin` : 'company.admin';
                          setFormData(prev => ({ ...prev, adminUserId: codeSuggest }));
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Auto-Suggest
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. esl.admin"
                      value={formData.adminUserId}
                      onChange={(e) => setFormData({ ...formData, adminUserId: e.target.value.toLowerCase().trim() })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Used for company-scoped CRM portal login</p>
                  </div>

                  {/* Admin Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Master Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newPass = generateCompanyPassword(formData.code);
                          setFormData(prev => ({ ...prev, adminPassword: newPass }));
                        }}
                        className="text-[10px] text-amber-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate Secure</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPasswordInModal ? "text" : "password"}
                        required
                        placeholder="e.g. ESL@Corp2026"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Corporate credentials for executive access</p>
                  </div>
                </div>

                {/* Master Contact Person / SPOC */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Master Contact Person / Authorized SPOC
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aditya Mathur (Director)"
                    value={formData.masterContactPerson}
                    onChange={(e) => setFormData({ ...formData, masterContactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Mapped Departments */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Associated Departments
                </label>
                <div className="flex flex-wrap gap-2">
                  {['HR Recruitment', 'BKD Recruitment', 'Management', 'Retail Store Operations', 'Digital Marketing', 'Customer Care'].map((dept) => {
                    const isChecked = formData.departments.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => handleToggleDept(dept)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="comp-is-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="comp-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Entity is actively operating & open for recruitments
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {editingCompany ? (
                  <button
                    id="btn-edit-modal-delete-company"
                    type="button"
                    onClick={() => {
                      const comp = editingCompany;
                      setIsAddModalOpen(false);
                      handleDelete(comp.id, comp.name);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Company</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
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
                    {editingCompany ? 'Save Changes' : 'Create Company'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Standalone Company User ID & Password Master Modal */}
      {isCredentialsMasterOpen && (
        <CompanyCredentialsMasterModal onClose={() => setIsCredentialsMasterOpen(false)} />
      )}

      {/* In-App Delete Company Confirmation Dialog */}
      {companyToDelete && (
        <div 
          id="modal-delete-company-backdrop"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div 
            id="modal-delete-company-container"
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Company Entity
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-semibold text-slate-900">{companyToDelete.name}</span> from the Company Master registry?
                </p>

                <div className="mt-3.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entity Code:</span>
                    <span className="font-bold text-blue-700">{companyToDelete.code}</span>
                  </div>
                  {companyToDelete.adminUserId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Admin User ID:</span>
                      <span className="font-mono font-medium text-slate-700">{companyToDelete.adminUserId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Linked Departments:</span>
                    <span className="font-semibold text-slate-700">
                      {departmentsList.filter(d => d.companyId === companyToDelete.id).length} department(s)
                    </span>
                  </div>
                </div>

                {companies.length <= 1 && (
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Notice: This is the last registered company. If deleted, the registry will be empty until you add another entity.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                id="btn-cancel-delete-company"
                type="button"
                onClick={() => setCompanyToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-company"
                type="button"
                onClick={handleConfirmDelete}
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
