import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Search, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Send, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Company } from '../../types';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';

interface CompanyCredentialsMasterModalProps {
  onClose: () => void;
}

export const CompanyCredentialsMasterModal: React.FC<CompanyCredentialsMasterModalProps> = ({ 
  onClose 
}) => {
  const { 
    companies, 
    updateCompany, 
    setCurrentUser, 
    setActiveCompanyId,
    currentUser 
  } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // In-line Edit & Reset State
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [tempUserId, setTempUserId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempContact, setTempContact] = useState('');

  const [resettingCompany, setResettingCompany] = useState<Company | null>(null);
  const [newGeneratedPass, setNewGeneratedPass] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Generate strong random password for company
  const generateStrongCompanyPassword = (code?: string, name?: string): string => {
    const cleanCode = (code || 'Corp').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const specials = ['@', '#', '$', '!'];
    const spec = specials[Math.floor(Math.random() * specials.length)];
    const year = 2026;
    return `${cleanCode}${spec}Corp${year}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyFullCompanyCredentials = (comp: Company) => {
    const uid = comp.adminUserId || `${comp.code.toLowerCase()}.admin`;
    const pwd = comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`;
    const text = `======================================\n` +
      `ESSENTIAL SOUL RECRUITMENT CRM\n` +
      `Corporate Entity Master Login Credentials\n` +
      `======================================\n` +
      `Company Name: ${comp.name}\n` +
      `Entity Code: ${comp.code}\n` +
      `Legal Entity: ${comp.legalName || comp.name}\n` +
      `CIN: ${comp.cin || 'N/A'}\n` +
      `GSTIN: ${comp.gstin || 'N/A'}\n` +
      `Master Contact: ${comp.masterContactPerson || 'Director / Managing Head'}\n` +
      `Official Email: ${comp.email}\n` +
      `--------------------------------------\n` +
      `Company Admin User ID: ${uid}\n` +
      `Corporate Master Password: ${pwd}\n` +
      `--------------------------------------\n` +
      `Portal Link: ${window.location.origin}\n` +
      `Security Notice: These credentials provide elevated corporate access for ${comp.name}.\n` +
      `======================================`;
    
    handleCopy(text, `full-${comp.id}`);
    showToast(`Copied complete credential dossier for ${comp.name}`);
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const togglePasswordVisibility = (compId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [compId]: !prev[compId]
    }));
  };

  const toggleRevealAll = () => {
    const allVisible = Object.keys(visiblePasswords).length === companies.length && 
      Object.values(visiblePasswords).every(v => v);
    
    if (allVisible) {
      setVisiblePasswords({});
    } else {
      const next: Record<string, boolean> = {};
      companies.forEach(c => { next[c.id] = true; });
      setVisiblePasswords(next);
    }
  };

  const startQuickEdit = (comp: Company) => {
    setEditingCompId(comp.id);
    setTempUserId(comp.adminUserId || `${comp.code.toLowerCase()}.admin`);
    setTempPassword(comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`);
    setTempContact(comp.masterContactPerson || 'Director / Managing Head');
  };

  const saveQuickEdit = (comp: Company) => {
    if (!tempUserId.trim()) {
      alert('User ID cannot be empty');
      return;
    }
    if (!tempPassword.trim()) {
      alert('Password cannot be empty');
      return;
    }

    updateCompany(comp.id, {
      adminUserId: tempUserId.trim(),
      adminPassword: tempPassword.trim(),
      masterContactPerson: tempContact.trim(),
      lastPasswordChanged: new Date().toISOString()
    });

    setEditingCompId(null);
    showToast(`Credentials updated for ${comp.name}`);
  };

  const handleOpenResetModal = (comp: Company) => {
    setResettingCompany(comp);
    setNewGeneratedPass(generateStrongCompanyPassword(comp.code, comp.name));
  };

  const confirmPasswordReset = () => {
    if (!resettingCompany) return;
    updateCompany(resettingCompany.id, {
      adminPassword: newGeneratedPass,
      lastPasswordChanged: new Date().toISOString()
    });
    showToast(`Password successfully reset for ${resettingCompany.name}`);
    setResettingCompany(null);
  };

  // Instant Switch to Company Admin Simulation
  const handleSwitchToCompanyAdmin = (comp: Company) => {
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
    showToast(`Switched active context to ${comp.name} Corporate Admin`);
    setTimeout(() => onClose(), 1200);
  };

  // Export Company Credentials
  const handleExportCredentials = (format: 'csv' | 'xls') => {
    const headers = [
      'Company Name',
      'Code',
      'Admin User ID',
      'Master Password',
      'Master Contact SPOC',
      'Official Email',
      'Phone',
      'Legal Entity Name',
      'CIN',
      'GSTIN',
      'Status',
      'Last Updated'
    ];

    const rows = companies.map(c => [
      `"${c.name}"`,
      c.code,
      c.adminUserId || `${c.code.toLowerCase()}.admin`,
      c.adminPassword || `${c.code.toUpperCase()}@Corp2026`,
      `"${c.masterContactPerson || 'Director'}"`,
      c.email,
      c.phone,
      `"${c.legalName || c.name}"`,
      c.cin || '',
      c.gstin || '',
      c.isActive ? 'Active' : 'Inactive',
      c.lastPasswordChanged ? c.lastPasswordChanged.split('T')[0] : 'Default'
    ]);

    const filename = `Company_User_ID_Password_Master_${TODAY}.${format}`;

    if (format === 'csv') {
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } else {
      const xlsContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <style>
              th { background-color: #0F172A; color: #FFFFFF; font-weight: bold; border: 1px solid #334155; padding: 6px 12px; }
              td { border: 1px solid #E2E8F0; padding: 6px 10px; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <h2>Essential Soul Recruitment CRM - Company User ID & Password Master</h2>
            <p>Export Date: ${TODAY} | Exported By: ${currentUser.name}</p>
            <table>
              <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${cell.replace(/^"|"$/g, '')}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </body>
        </html>
      `;
      const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
  };

  // Filtered companies
  const filteredCompanies = companies.filter(c => {
    if (statusFilter === 'Active' && !c.isActive) return false;
    if (statusFilter === 'Inactive' && c.isActive) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.adminUserId && c.adminUserId.toLowerCase().includes(q)) ||
      (c.legalName && c.legalName.toLowerCase().includes(q)) ||
      (c.cin && c.cin.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q)) ||
      (c.masterContactPerson && c.masterContactPerson.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const allVisibleCount = Object.values(visiblePasswords).filter(Boolean).length;
  const isAllRevealed = allVisibleCount === companies.length && companies.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Company User ID & Password Master
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Corporate Vault
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized corporate master credentials, login usernames, passwords, and entity administrator access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleRevealAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              {isAllRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mask All Passwords</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reveal All Passwords</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleExportCredentials('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              title="Export Company Credentials to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportCredentials('xls')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-2xs transition-colors"
              title="Export Company Credentials to formatted Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export XLS</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast Banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, code, User ID, SPOC, CIN..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-1 px-2.5 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold"
              >
                <option value="ALL">All ({companies.length})</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            <div className="text-slate-400 dark:text-slate-500 font-medium">
              Showing <strong className="text-slate-700 dark:text-slate-200">{filteredCompanies.length}</strong> companies
            </div>
          </div>
        </div>

        {/* Master Credentials Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-3">Company / Entity</th>
                  <th className="p-3">Company Admin User ID</th>
                  <th className="p-3">Master Password</th>
                  <th className="p-3">Master SPOC / Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions & Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium bg-white dark:bg-slate-800">
                {filteredCompanies.map(comp => {
                  const isEditing = editingCompId === comp.id;
                  const uid = comp.adminUserId || `${comp.code.toLowerCase()}.admin`;
                  const pwd = comp.adminPassword || `${comp.code.toUpperCase()}@Corp2026`;
                  const isVisible = visiblePasswords[comp.id] || false;

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      
                      {/* Company Info */}
                      <td className="p-3 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-600/20">
                            {comp.code}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{comp.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {comp.code}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {comp.legalName || comp.name}
                            </div>
                            {comp.cin && (
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                CIN: {comp.cin}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="p-3 align-top whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempUserId}
                            onChange={(e) => setTempUserId(e.target.value)}
                            className="w-40 px-2 py-1 bg-white dark:bg-slate-700 border border-blue-400 rounded text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
                            placeholder="e.g. esl.admin"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/60 select-all">
                              {uid}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(uid, `uid-${comp.id}`)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                              title="Copy User ID"
                            >
                              {copiedField === `uid-${comp.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          Corporate Portal Login ID
                        </div>
                      </td>

                      {/* Password */}
                      <td className="p-3 align-top whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempPassword}
                              onChange={(e) => setTempPassword(e.target.value)}
                              className="w-40 px-2 py-1 bg-white dark:bg-slate-700 border border-blue-400 rounded text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                              placeholder="e.g. ESL@Corp2026"
                            />
                            <button
                              type="button"
                              onClick={() => setTempPassword(generateStrongCompanyPassword(comp.code, comp.name))}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded"
                              title="Generate Strong Password"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/70 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 select-all tracking-wider min-w-28 text-center">
                              {isVisible ? pwd : '••••••••••••'}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(comp.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                              title={isVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(pwd, `pwd-${comp.id}`)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                              title="Copy Password"
                            >
                              {copiedField === `pwd-${comp.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenResetModal(comp)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Reset to New Secure Password"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {comp.lastPasswordChanged ? `Updated ${comp.lastPasswordChanged.split('T')[0]}` : 'Corporate Default'}
                        </div>
                      </td>

                      {/* SPOC / Contact */}
                      <td className="p-3 align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempContact}
                            onChange={(e) => setTempContact(e.target.value)}
                            className="w-40 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 rounded text-xs"
                            placeholder="Managing SPOC name"
                          />
                        ) : (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {comp.masterContactPerson || 'Director / Managing Head'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {comp.email}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {comp.phone}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.isActive 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${comp.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {comp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 align-top text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => saveQuickEdit(comp)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow-2xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCompId(null)}
                              className="px-2 py-1 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Copy Full Credentials Dossier */}
                            <button
                              type="button"
                              onClick={() => handleCopyFullCompanyCredentials(comp)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs transition-colors"
                              title="Copy complete credentials dossier formatted for WhatsApp or Email"
                            >
                              {copiedField === `full-${comp.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Send className="w-3 h-3 text-slate-500" />
                              )}
                              <span>Copy Dossier</span>
                            </button>

                            {/* Switch to Company Admin */}
                            <button
                              type="button"
                              onClick={() => handleSwitchToCompanyAdmin(comp)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors"
                              title="Simulate / Login as this Company Corporate Admin"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Login as Entity</span>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => startQuickEdit(comp)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded"
                              title="Edit User ID & Password"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Guidelines Box */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Company Master Credentials Security Policy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-amber-800 dark:text-amber-300 text-[11px]">
              <div>
                <strong>Entity-Scoped Access:</strong> Logging in with a Company Admin User ID automatically filters all CRM dashboards, candidate lists, and job openings to that legal entity.
              </div>
              <div>
                <strong>Director & SPOC Distribution:</strong> Use the &quot;Copy Dossier&quot; button to share formal login instructions with managing directors, franchise owners, or unit heads.
              </div>
              <div>
                <strong>Immediate Login:</strong> You can enter any of the above Company User IDs (e.g. <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">esl.admin</code>, <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">bkd.admin</code>) on the CRM Login Screen directly.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Total <strong className="text-slate-800 dark:text-slate-200">{companies.length}</strong> Registered Legal Entities
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-xs"
          >
            Done & Close
          </button>
        </div>

      </div>

      {/* Quick Password Reset Dialog */}
      {resettingCompany && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Reset Company Master Password</span>
              </div>
              <button 
                type="button" 
                onClick={() => setResettingCompany(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              Generate or assign a new corporate master password for <strong className="font-bold text-slate-900 dark:text-white">{resettingCompany.name}</strong> ({resettingCompany.code}).
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                New Master Password:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGeneratedPass}
                  onChange={(e) => setNewGeneratedPass(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setNewGeneratedPass(generateStrongCompanyPassword(resettingCompany.code, resettingCompany.name))}
                  className="p-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-blue-600"
                  title="Generate another"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResettingCompany(null)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPasswordReset}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Apply New Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
