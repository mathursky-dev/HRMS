import React, { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Share2, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  UserCheck, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { OfferLetter } from '../../types';
import { OfferLetterPreviewModal } from './OfferLetterPreviewModal';
import { OfferLetterFormModal } from './OfferLetterFormModal';

export const OfferLetterPanel: React.FC = () => {
  const { 
    offerLetters, 
    addOfferLetter, 
    updateOfferLetter, 
    deleteOfferLetter, 
    updateOfferLetterStatus,
    companies,
    activeCompanyId,
    currentUser
  } = useRecruitment();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>(activeCompanyId !== 'ALL' ? activeCompanyId : 'ALL');

  // Modals state
  const [previewOffer, setPreviewOffer] = useState<OfferLetter | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferLetter | null>(null);

  const canManageOffers = currentUser.role === 'Super Admin' || 
    currentUser.role === 'Director / Management' || 
    currentUser.role === 'HR Head' || 
    currentUser.role === 'Team Leader' ||
    currentUser.role === 'HR Executive';

  // Filtered letters
  const filteredOffers = offerLetters.filter(offer => {
    const matchesCompany = companyFilter === 'ALL' || offer.companyId === companyFilter;
    const matchesStatus = statusFilter === 'ALL' || offer.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      offer.candidateName.toLowerCase().includes(searchLower) ||
      offer.candidatePhone.includes(searchLower) ||
      offer.id.toLowerCase().includes(searchLower) ||
      offer.designation.toLowerCase().includes(searchLower) ||
      offer.companyName.toLowerCase().includes(searchLower);
    return matchesCompany && matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalOffersCount = offerLetters.length;
  const issuedOffersCount = offerLetters.filter(o => o.status === 'Issued').length;
  const acceptedOffersCount = offerLetters.filter(o => o.status === 'Accepted' || o.status === 'Joined').length;
  const joinedOffersCount = offerLetters.filter(o => o.status === 'Joined').length;
  const totalCtcSum = offerLetters.reduce((acc, o) => acc + o.annualCtc, 0);
  const avgCtc = totalOffersCount > 0 ? Math.round(totalCtcSum / totalOffersCount) : 0;
  const acceptanceRate = totalOffersCount > 0 ? Math.round((acceptedOffersCount / totalOffersCount) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (offer: OfferLetter) => {
    setEditingOffer(offer);
    setIsFormOpen(true);
  };

  const handleSaveForm = (offerData: Omit<OfferLetter, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingOffer) {
      updateOfferLetter(editingOffer.id, offerData);
    } else {
      addOfferLetter(offerData);
    }
    setIsFormOpen(false);
    setEditingOffer(null);
  };

  const handleDelete = (offer: OfferLetter) => {
    if (window.confirm(`Are you sure you want to delete offer letter ${offer.id} for ${offer.candidateName}?`)) {
      deleteOfferLetter(offer.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Candidate Offer Letters & Employment Agreements
                </h1>
                <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {offerLetters.length} Generated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate official company letterhead offers, calculate CTC & monthly take-home, attach terms and conditions, and share directly via WhatsApp.
              </p>
            </div>
          </div>

          {canManageOffers && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Offer Letter</span>
            </button>
          )}
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Offers</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalOffersCount}</div>
            <span className="text-[10px] text-slate-400">All entities</span>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800/60">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Issued / Pending</span>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-0.5">{issuedOffersCount}</div>
            <span className="text-[10px] text-blue-600/70 dark:text-blue-400">Awaiting candidate reply</span>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Accepted & Joined</span>
            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
              {acceptedOffersCount} <span className="text-xs font-normal text-emerald-600">({joinedOffersCount} on duty)</span>
            </div>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400">{acceptanceRate}% conversion</span>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800/60">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Average CTC</span>
            <div className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-0.5 font-mono">
              ₹{(avgCtc / 100000).toFixed(2)} LPA
            </div>
            <span className="text-[10px] text-amber-600/70 dark:text-amber-400">₹{Math.round(avgCtc / 12).toLocaleString('en-IN')}/mo gross</span>
          </div>

          <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800/60 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Terms Integrated</span>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-0.5">100%</div>
            <span className="text-[10px] text-purple-600/70 dark:text-purple-400">Annexure B auto-binds</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate, Ref ID, role..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="ALL">All Statuses ({offerLetters.length})</option>
              <option value="Draft">Draft</option>
              <option value="Issued">Issued</option>
              <option value="Accepted">Accepted</option>
              <option value="Joined">Joined</option>
              <option value="Declined">Declined</option>
            </select>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 self-end sm:self-auto">
            Showing <strong>{filteredOffers.length}</strong> of {offerLetters.length} letters
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Ref ID / Candidate</th>
                <th className="p-3">Role & Department</th>
                <th className="p-3">Company Entity</th>
                <th className="p-3">Annual CTC & In-Hand</th>
                <th className="p-3">Joining Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredOffers.map((offer) => {
                return (
                  <tr 
                    key={offer.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                          {offer.candidateName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{offer.candidateName}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">
                              ({offer.id})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {offer.candidatePhone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {offer.designation}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {offer.department}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                        {offer.companyName}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                        {offer.location}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                        ₹{offer.annualCtc.toLocaleString('en-IN')} / yr
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Take-home: ₹{offer.monthlyInHand.toLocaleString('en-IN')}/mo
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {new Date(offer.joiningDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Valid till: {new Date(offer.validityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        offer.status === 'Joined'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : offer.status === 'Accepted'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          : offer.status === 'Issued'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : offer.status === 'Declined'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200'
                      }`}>
                        {offer.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewOffer(offer)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Preview Full Official Letterhead"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {canManageOffers && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(offer)}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Edit Offer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(offer)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Delete Offer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No offer letters found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the search or status filters, or click &apos;Create Offer Letter&apos; to issue a new contract.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewOffer && (
        <OfferLetterPreviewModal
          offer={previewOffer}
          onClose={() => setPreviewOffer(null)}
          onUpdateStatus={(id, status) => {
            updateOfferLetterStatus(id, status);
            setPreviewOffer(prev => prev ? { ...prev, status } : null);
          }}
        />
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <OfferLetterFormModal
          editingOffer={editingOffer}
          onClose={() => {
            setIsFormOpen(false);
            setEditingOffer(null);
          }}
          onSave={handleSaveForm}
        />
      )}
    </div>
  );
};
