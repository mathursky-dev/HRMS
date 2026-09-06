import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateStatus, FollowUpMode } from '../../types';
import { TODAY } from '../../mockData';

interface FollowUpEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

export const FollowUpEntryModal: React.FC<FollowUpEntryModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  const { addFollowUp, currentUser } = useRecruitment();

  const [followUpDate, setFollowUpDate] = useState(TODAY);
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [followUpMode, setFollowUpMode] = useState<FollowUpMode>('Call');
  const [candidateResponse, setCandidateResponse] = useState('');
  const [notes, setNotes] = useState('');
  
  // Enforced condition: Either Next Follow-up Date OR Final Status
  const [outcomeType, setOutcomeType] = useState<'SCHEDULE_NEXT' | 'FINAL_STATUS'>('SCHEDULE_NEXT');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(TODAY);
  const [nextFollowUpTime, setNextFollowUpTime] = useState('15:00');
  const [resultingStatus, setResultingStatus] = useState<CandidateStatus>('Follow-up');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!notes.trim()) {
      setErrorMsg('Please enter follow-up activity notes');
      return;
    }

    if (outcomeType === 'SCHEDULE_NEXT') {
      if (!nextFollowUpDate) {
        setErrorMsg('Next follow-up date is required to ensure candidate is not forgotten!');
        return;
      }
    } else {
      if (!resultingStatus) {
        setErrorMsg('Please select a final candidate status');
        return;
      }
    }

    addFollowUp({
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      candidateMobile: candidate.mobileNumber,
      position: candidate.positionApplied,
      hrExecutive: currentUser.name || candidate.assignedHr,
      followUpDate,
      followUpTime,
      followUpMode,
      candidateResponse,
      notes,
      nextFollowUpDate: outcomeType === 'SCHEDULE_NEXT' ? nextFollowUpDate : undefined,
      nextFollowUpTime: outcomeType === 'SCHEDULE_NEXT' ? nextFollowUpTime : undefined,
      resultingStatus: outcomeType === 'SCHEDULE_NEXT' ? 'Follow-up' : resultingStatus,
      isCompleted: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-400" />
              Log Follow-up Activity
            </h2>
            <p className="text-xs text-slate-400">
              {candidate.fullName} • {candidate.positionApplied} ({candidate.id})
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Activity Date, Time & Mode */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mode</label>
              <select
                value={followUpMode}
                onChange={(e) => setFollowUpMode(e.target.value as FollowUpMode)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Call">📞 Phone Call</option>
                <option value="WhatsApp">💬 WhatsApp</option>
                <option value="Interview">📅 Interview</option>
                <option value="In-person">🏢 In-person</option>
              </select>
            </div>
          </div>

          {/* Candidate Response */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Candidate's Response</label>
            <input
              type="text"
              placeholder="e.g. Interested, will confirm tomorrow morning after talking to family"
              value={candidateResponse}
              onChange={(e) => setCandidateResponse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Detailed HR Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              HR Notes / Discussion Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Brief summary of communication..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CRITICAL STRICT ENFORCEMENT: Either Next Follow-up Date OR Final Status */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
            <label className="block font-bold text-slate-900 mb-2">
              Next Step Requirement <span className="text-rose-600">*</span>
            </label>
            <p className="text-[11px] text-slate-600 mb-3">
              To prevent candidates from being lost or forgotten, you must choose either to schedule a next follow-up or assign a conclusive stage.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setOutcomeType('SCHEDULE_NEXT')}
                className={`p-2 rounded-lg border text-left font-semibold flex items-center gap-2 transition-all ${
                  outcomeType === 'SCHEDULE_NEXT'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Next Follow-up Due</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcomeType('FINAL_STATUS')}
                className={`p-2 rounded-lg border text-left font-semibold flex items-center gap-2 transition-all ${
                  outcomeType === 'FINAL_STATUS'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Set Conclusive Status</span>
              </button>
            </div>

            {outcomeType === 'SCHEDULE_NEXT' ? (
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-blue-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Next Follow-up Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Time</label>
                  <input
                    type="time"
                    value={nextFollowUpTime}
                    onChange={(e) => setNextFollowUpTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Conclusive Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={resultingStatus}
                  onChange={(e) => setResultingStatus(e.target.value as CandidateStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
                >
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interested">Interested (Ready for Scheduling)</option>
                  <option value="Selected">Selected</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Not Reachable">Not Reachable</option>
                  <option value="Wrong Number">Wrong Number</option>
                  <option value="Hold">Hold</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}
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
              Save Follow-up Activity
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
