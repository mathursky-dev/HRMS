import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Video, Phone, Building } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, InterviewMode } from '../../types';
import { TODAY } from '../../mockData';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  const { scheduleInterview, currentUser } = useRecruitment();

  const [interviewDate, setInterviewDate] = useState(TODAY);
  const [interviewTime, setInterviewTime] = useState('11:30');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('Office Interview');
  const [interviewer, setInterviewer] = useState('Vikram Singh');
  const [interviewLocation, setInterviewLocation] = useState('Essential Soul HQ, Sector 62, Noida');
  const [remarks, setRemarks] = useState('Please carry updated resume and previous salary slips');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleInterview({
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      candidateMobile: candidate.mobileNumber,
      position: candidate.positionApplied,
      department: candidate.department,
      hrExecutive: candidate.assignedHr || currentUser.name,
      interviewer,
      interviewDate,
      interviewTime,
      interviewMode,
      interviewLocation,
      remarks,
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
              <Calendar className="w-4 h-4 text-purple-400" />
              Schedule Interview Round
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
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Date</label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Time</label>
              <input
                type="time"
                required
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interview Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setInterviewMode('Office Interview');
                  setInterviewLocation('Essential Soul HQ, Sector 62, Noida');
                }}
                className={`p-2 rounded-lg border text-center font-semibold transition-colors ${
                  interviewMode === 'Office Interview'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                🏢 Office Round
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterviewMode('Phone Interview');
                  setInterviewLocation('Telephonic Call');
                }}
                className={`p-2 rounded-lg border text-center font-semibold transition-colors ${
                  interviewMode === 'Phone Interview'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                📞 Phone Round
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterviewMode('Video Interview');
                  setInterviewLocation('Google Meet / Zoom');
                }}
                className={`p-2 rounded-lg border text-center font-semibold transition-colors ${
                  interviewMode === 'Video Interview'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                💻 Video Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Interviewer</label>
              <select
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="Vikram Singh">Vikram Singh (Senior Interviewer)</option>
                <option value="Aditya Mathur">Aditya Mathur (Director / Management)</option>
                <option value="Nandani">Nandani (HR Head)</option>
                <option value="Shivani">Shivani (BKD Lead)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                disabled
                value={candidate.department}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interview Location / Link</label>
            <input
              type="text"
              value={interviewLocation}
              onChange={(e) => setInterviewLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Candidate Instructions / Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-purple-800 text-[11px] flex items-center justify-between">
            <span>🔔 Automatic SMS & WhatsApp reminder will be cued</span>
            <span className="font-bold">Active</span>
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
              className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 font-bold rounded-lg shadow-xs"
            >
              Schedule & Notify Candidate
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
