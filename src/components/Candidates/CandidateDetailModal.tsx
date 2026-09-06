import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase, 
  Award, 
  History, 
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate } from '../../types';
import { getStatusBadgeClass, formatCurrency, calculateDaysDifference } from '../../utils/formatters';
import { TODAY } from '../../mockData';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onOpenEdit: () => void;
  onOpenFollowUp: () => void;
  onOpenInterview: () => void;
  onOpenStatusUpdate: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onOpenEdit,
  onOpenFollowUp,
  onOpenInterview,
  onOpenStatusUpdate,
}) => {
  const { auditLogs, followUps, interviews, deleteCandidate } = useRecruitment();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'TIMELINE' | 'FOLLOWUPS' | 'INTERVIEWS'>('DETAILS');

  if (!isOpen) return null;

  const candidateLogs = auditLogs.filter((l) => l.candidateId === candidate.id);
  const candidateFollowUps = followUps.filter((f) => f.candidateId === candidate.id);
  const candidateInterviews = interviews.filter((i) => i.candidateId === candidate.id);

  const daysSinceCreated = calculateDaysDifference(candidate.createdAt);

  const handleCall = () => {
    window.location.href = `tel:${candidate.mobileNumber}`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${candidate.fullName}, greetings from Essential Soul Lifestyle Pvt Ltd regarding your application for the ${candidate.positionApplied} role.`
    );
    window.open(`https://wa.me/91${candidate.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Candidate overview & quick communication buttons */}
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {candidate.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white">{candidate.fullName}</h2>
                  <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {candidate.id}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Applied for <strong>{candidate.positionApplied}</strong> • {candidate.department}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(candidate.status)}`}>
                    {candidate.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Assigned HR: <strong className="text-blue-300">{candidate.assignedHr}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Lead Age: <strong>{daysSinceCreated} Days</strong>
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct One-Click Communication Action Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCall}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call ({candidate.mobileNumber})</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenFollowUp}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700"
              >
                🔔 Add Follow-up
              </button>
              <button
                onClick={onOpenInterview}
                className="bg-purple-600/80 hover:bg-purple-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              >
                📅 Interview
              </button>
              <button
                onClick={onOpenStatusUpdate}
                className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              >
                ✅ Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'DETAILS'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Candidate Profile
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'TIMELINE'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Log & History ({candidateLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('FOLLOWUPS')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'FOLLOWUPS'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Follow-up History ({candidateFollowUps.length})
          </button>
          <button
            onClick={() => setActiveTab('INTERVIEWS')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'INTERVIEWS'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Interviews & Scorecards ({candidateInterviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[55vh] overflow-y-auto text-xs">
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile</span>
                  <span className="text-slate-900 font-bold">{candidate.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">WhatsApp</span>
                  <span className="text-slate-900 font-bold">{candidate.whatsappNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                  <span className="text-slate-900 font-medium">{candidate.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                  <span className="text-slate-900 font-medium">{candidate.area ? `${candidate.area}, ` : ''}{candidate.city}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Qualification</span>
                  <span className="text-slate-900 font-medium">{candidate.qualification}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Source</span>
                  <span className="text-slate-900 font-bold text-blue-700">{candidate.candidateSource}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Experience</span>
                  <span className="text-slate-900 font-semibold">{candidate.totalExperience}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Relevant Experience</span>
                  <span className="text-slate-900 font-semibold">{candidate.relevantExperience}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Salary</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(candidate.currentSalary)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Salary</span>
                  <span className="text-slate-900 font-bold text-emerald-700">{formatCurrency(candidate.expectedSalary)}</span>
                </div>
              </div>

              {candidate.remarks && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <span className="text-[10px] uppercase font-bold block text-amber-800">HR Remarks</span>
                  <p className="mt-0.5 text-xs">{candidate.remarks}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-3">
              {candidateLogs.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No audit records found.</p>
              ) : (
                candidateLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          by {log.performedBy}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-slate-600 mt-1 text-xs">{log.details}</p>
                      )}
                      {log.previousValue && log.newValue && (
                        <div className="mt-1 text-[11px] text-slate-500">
                          Changed from <span className="font-semibold">{log.previousValue}</span> → <span className="font-semibold text-blue-600">{log.newValue}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'FOLLOWUPS' && (
            <div className="space-y-3">
              {candidateFollowUps.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No follow-ups recorded yet.</p>
              ) : (
                candidateFollowUps.map((fu) => (
                  <div key={fu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">
                        {fu.followUpMode} with {fu.hrExecutive}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {fu.followUpDate} at {fu.followUpTime}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1"><strong>Notes:</strong> {fu.notes}</p>
                    {fu.candidateResponse && (
                      <p className="text-blue-700 mt-1"><strong>Response:</strong> {fu.candidateResponse}</p>
                    )}
                    {fu.nextFollowUpDate && (
                      <div className="mt-2 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">
                        Next Due: {fu.nextFollowUpDate} {fu.nextFollowUpTime}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'INTERVIEWS' && (
            <div className="space-y-3">
              {candidateInterviews.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No interviews scheduled yet.</p>
              ) : (
                candidateInterviews.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{inv.interviewMode}</span>
                        <p className="text-slate-500 text-xs">Interviewer: <strong>{inv.interviewer}</strong></p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-xs">
                        {inv.attendanceStatus}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      📅 Date: {inv.interviewDate} at {inv.interviewTime} • Location: {inv.interviewLocation}
                    </div>

                    {inv.evaluation && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900">Scorecard: {inv.evaluation.averageRating}/5.0</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Result: {inv.evaluation.finalResult}
                          </span>
                        </div>
                        <p className="text-slate-700 italic">"{inv.evaluation.interviewerRemarks}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer with Edit and Archive actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Archive/Soft Delete this candidate? Record can still be viewed in audit logs.')) {
                deleteCandidate(candidate.id);
                onClose();
              }
            }}
            className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Archive Candidate
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenEdit();
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Info
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg text-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
