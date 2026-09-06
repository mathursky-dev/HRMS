import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Search, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Edit3, 
  Trash2, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Printer,
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TermsCategory, TermsClause } from '../../types';

const CATEGORIES: TermsCategory[] = [
  'Probation & Confirmation',
  'Working Hours & Attendance',
  'Compensation & Incentives',
  'Code of Conduct',
  'Confidentiality & NDA',
  'Leave & Time Off',
  'Termination & Notice',
  'Onboarding Documents',
];

export const TermsConditionsPanel: React.FC = () => {
  const { 
    termsClauses, 
    addTermsClause, 
    updateTermsClause, 
    deleteTermsClause, 
    toggleTermsClauseActive,
    currentUser,
    companies,
    activeCompanyId
  } = useRecruitment();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<TermsClause | null>(null);

  // Print / Export State
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form State
  const [clauseNumber, setClauseNumber] = useState('');
  const [category, setCategory] = useState<TermsCategory>('Probation & Confirmation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isMandatoryInOffer, setIsMandatoryInOffer] = useState(true);

  const canManageTerms = currentUser.role === 'Super Admin' || 
    currentUser.role === 'Director / Management' || 
    currentUser.role === 'HR Head';

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  // Filtering
  const filteredClauses = termsClauses.filter(clause => {
    const matchesCategory = selectedCategory === 'ALL' || clause.category === selectedCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      clause.title.toLowerCase().includes(searchLower) ||
      clause.content.toLowerCase().includes(searchLower) ||
      clause.clauseNumber.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingClause(null);
    setClauseNumber(`${termsClauses.length + 1}.0`);
    setCategory('Probation & Confirmation');
    setTitle('');
    setContent('');
    setIsMandatoryInOffer(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (clause: TermsClause) => {
    setEditingClause(clause);
    setClauseNumber(clause.clauseNumber);
    setCategory(clause.category);
    setTitle(clause.title);
    setContent(clause.content);
    setIsMandatoryInOffer(clause.isMandatoryInOffer);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingClause) {
      updateTermsClause(editingClause.id, {
        clauseNumber,
        category,
        title: title.trim(),
        content: content.trim(),
        isMandatoryInOffer,
        updatedBy: `${currentUser.name} (${currentUser.role})`
      });
    } else {
      addTermsClause({
        clauseNumber: clauseNumber || `${termsClauses.length + 1}.0`,
        category,
        title: title.trim(),
        content: content.trim(),
        isMandatoryInOffer,
        isActive: true,
        updatedBy: `${currentUser.name} (${currentUser.role})`
      });
    }

    setIsModalOpen(false);
  };

  const handleCopyClause = (clause: TermsClause) => {
    const text = `Clause ${clause.clauseNumber}: ${clause.title}\n\n${clause.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(clause.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (clause: TermsClause) => {
    if (window.confirm(`Are you sure you want to delete clause "${clause.clauseNumber}: ${clause.title}"?`)) {
      deleteTermsClause(clause.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Terms & Conditions & Employment Policies
                </h1>
                <span className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {termsClauses.length} Clauses
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official company employment clauses, recruitment regulations, and standard terms automatically integrated into candidate Offer Letters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Print Handbook</span>
            </button>

            {canManageTerms && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clause</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills & Search */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Categories ({termsClauses.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = termsClauses.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clause text..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Role Notice */}
      {!canManageTerms && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Viewing mode active for <strong>{currentUser.role}</strong>. You can view, copy clauses for candidates, or preview terms for offer letters. Editing is reserved for Super Admin, Directors, and HR Head.
          </span>
        </div>
      )}

      {/* Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClauses.map((clause) => {
          const isCopied = copiedId === clause.id;
          return (
            <div
              key={clause.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-shadow hover:shadow-md ${
                clause.isActive 
                  ? 'border-slate-200 dark:border-slate-800' 
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold text-xs">
                      Clause {clause.clauseNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {clause.category}
                    </span>
                    {clause.isMandatoryInOffer && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                        Offer Letter Mandatory
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyClause(clause)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Copy clause text to clipboard"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {canManageTerms && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(clause)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Edit clause"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(clause)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Delete clause"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  {clause.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {clause.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Updated by {clause.updatedBy}</span>
                {canManageTerms && (
                  <button
                    type="button"
                    onClick={() => toggleTermsClauseActive(clause.id)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition ${
                      clause.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {clause.isActive ? 'Active' : 'Disabled'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClauses.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Scale className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No clauses found</p>
          <p className="text-xs text-slate-500 mt-1">Try changing search query or category filter.</p>
        </div>
      )}

      {/* Add / Edit Clause Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {editingClause ? 'Edit Policy Clause' : 'Add New Terms Clause'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clause Number
                  </label>
                  <input
                    type="text"
                    required
                    value={clauseNumber}
                    onChange={(e) => setClauseNumber(e.target.value)}
                    placeholder="e.g. 9.0"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TermsCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clause Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Non-Solicitation & Intellectual Property"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clause Content / Policy Text
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed contractual clause wording..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-mandatory"
                  checked={isMandatoryInOffer}
                  onChange={(e) => setIsMandatoryInOffer(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk-mandatory" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Include automatically in Candidate Offer Letter (Annexure B)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  {editingClause ? 'Save Changes' : 'Create Clause'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Handbook Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm">Printable Employment Handbook Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Handbook Document */}
            <div className="space-y-6 text-xs text-slate-800">
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h1 className="text-xl font-black tracking-wider uppercase text-slate-950">
                  {activeCompany.legalName || activeCompany.name}
                </h1>
                <p className="text-[11px] text-slate-600 mt-1">
                  {activeCompany.address}, {activeCompany.city}, {activeCompany.state} - {activeCompany.pincode}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  CIN: {activeCompany.cin || 'U74999UP2022PTC168921'} | GSTIN: {activeCompany.gstin || '09AAECE1234F1Z5'}
                </p>
                <div className="inline-block mt-3 px-4 py-1 bg-slate-100 rounded-full font-bold tracking-wider text-[11px] uppercase">
                  Employment Regulations, Code of Conduct & Policies Handbook
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                <strong>Policy Applicability:</strong> These terms and conditions govern all permanent, probationary, and contractual personnel recruited into Essential Soul Lifestyle Pvt Ltd and its allied retail entities.
              </div>

              <div className="space-y-5">
                {termsClauses.filter(c => c.isActive).map(clause => (
                  <div key={clause.id} className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-900">Clause {clause.clauseNumber}</span>
                      <span className="font-bold text-slate-900">• {clause.title}</span>
                      <span className="text-[10px] text-slate-500 ml-auto uppercase font-semibold">[{clause.category}]</span>
                    </div>
                    <p className="text-justify leading-relaxed text-slate-700">
                      {clause.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t-2 border-slate-300 flex justify-between items-end">
                <div>
                  <p className="font-bold text-slate-900">For {activeCompany.name}</p>
                  <p className="text-[11px] text-slate-500 mt-8">Authorized Signatory / HR Head</p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  Document Reference: ESL-POL-2026-v2<br />
                  Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
