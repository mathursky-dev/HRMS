import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateStatus } from '../../types';
import { getStatusBadgeClass } from '../../utils/formatters';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

export const ALL_STATUSES: { category: string; statuses: CandidateStatus[] }[] = [
  {
    category: 'Initial Sourcing & Calls',
    statuses: ['New Lead', 'Not Contacted', 'Attempted', 'Connected', 'Call Back', 'Interested', 'Not Interested', 'Not Reachable', 'Wrong Number', 'Follow-up'],
  },
  {
    category: 'Interview Pipeline',
    statuses: ['Interview Scheduled', 'Interview Confirmed', 'Interview Rescheduled', 'Interview Conducted', 'Selected', 'Rejected', 'Hold', 'Salary Discussion'],
  },
  {
    category: 'Training & Induction',
    statuses: ['Training Scheduled', 'Training Started', 'Training Completed'],
  },
  {
    category: 'Joining & Active Employees',
    statuses: ['Joining Confirmed', 'Joined', 'Active Joining', 'No Show', 'Resigned'],
  },
];

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  const { updateCandidateStatus } = useRecruitment();
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus>(candidate.status);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidateStatus(candidate.id, selectedStatus, note || `Status updated to ${selectedStatus}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Update Candidate Status
            </h2>
            <p className="text-xs text-slate-400">
              {candidate.fullName} • {candidate.positionApplied}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Current Status display */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Status</span>
              <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded border ${getStatusBadgeClass(candidate.status)}`}>
                {candidate.status}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected New Status</span>
              <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded border ${getStatusBadgeClass(selectedStatus)}`}>
                {selectedStatus}
              </span>
            </div>
          </div>

          {/* Status Selection categorized */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {ALL_STATUSES.map((cat) => (
              <div key={cat.category}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {cat.category}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {cat.statuses.map((st) => {
                    const isSelected = selectedStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatus(st)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Remarks / Reason for change
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared 1st round telephonic screening, confirmed walk-in interview"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg shadow-xs"
            >
              Confirm Status Update
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
