import React, { useState } from 'react';
import { 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageSquare, 
  Filter,
  Search,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';
import { FollowUpRecord, FollowUpMode } from '../../types';
import { FollowUpEntryModal } from './FollowUpEntryModal';

export const FollowUpPanel: React.FC = () => {
  const { followUps, candidates, completeFollowUp } = useRecruitment();

  const [tab, setTab] = useState<'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED'>('TODAY');
  const [selectedHr, setSelectedHr] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Logging follow up for a candidate
  const [activeFollowUpCandidateId, setActiveFollowUpCandidateId] = useState<string | null>(null);

  // Groupings based on followUpDate and isCompleted
  const overdueFollowUps = followUps.filter((f) => !f.isCompleted && f.followUpDate < TODAY);
  const todayFollowUps = followUps.filter((f) => f.followUpDate === TODAY && !f.isCompleted);
  const upcomingFollowUps = followUps.filter((f) => !f.isCompleted && f.followUpDate > TODAY);
  const completedFollowUps = followUps.filter((f) => f.isCompleted);

  // Current tab items
  const currentList = (() => {
    switch (tab) {
      case 'OVERDUE':
        return overdueFollowUps;
      case 'TODAY':
        return todayFollowUps;
      case 'UPCOMING':
        return upcomingFollowUps;
      case 'COMPLETED':
        return completedFollowUps;
    }
  })();

  // Filtered
  const filteredList = currentList.filter((item) => {
    if (selectedHr !== 'ALL' && item.hrExecutive !== selectedHr) return false;
    if (selectedMode !== 'ALL' && item.followUpMode !== selectedMode) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateMobile.includes(q) ||
        item.position.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeCandidate = activeFollowUpCandidateId
    ? candidates.find((c) => c.id === activeFollowUpCandidateId)
    : null;

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-600" />
            HR Follow-Up Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Never lose a potential hire — manage daily touchpoints, callbacks, and overdue alerts
          </p>
        </div>

        {overdueFollowUps.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-rose-700 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{overdueFollowUps.length} Overdue Follow-ups Require Immediate Attention!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 text-xs font-bold">
        <button
          onClick={() => setTab('TODAY')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'TODAY'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today's Follow-ups</span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
            {todayFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setTab('OVERDUE')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'OVERDUE'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Overdue Follow-ups</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            overdueFollowUps.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {overdueFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setTab('UPCOMING')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'UPCOMING'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Upcoming</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
            {upcomingFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setTab('COMPLETED')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'COMPLETED'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed History</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
            {completedFollowUps.length}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate name, mobile, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={selectedHr}
            onChange={(e) => setSelectedHr(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All HR Executives</option>
            <option value="Nandani">Nandani (HR Head)</option>
            <option value="Shivani">Shivani (BKD Lead)</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All Modes</option>
            <option value="Call">📞 Call</option>
            <option value="WhatsApp">💬 WhatsApp</option>
            <option value="Interview">📅 Interview</option>
            <option value="In-person">🏢 In-person</option>
          </select>
        </div>
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs font-medium">
            No follow-up records found in this category.
          </div>
        ) : (
          filteredList.map((item) => {
            const isOverdue = !item.isCompleted && item.followUpDate < TODAY;

            return (
              <div
                key={item.id}
                className={`bg-white p-4 sm:p-5 rounded-xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-rose-300 bg-rose-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                
                {/* Left info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.candidateName}</span>
                    <span className="text-xs text-slate-500 font-medium">({item.position})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.followUpMode}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white uppercase tracking-wider">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span>
                      📅 Due: <strong>{item.followUpDate}</strong> at <strong>{item.followUpTime}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      HR: <strong className="text-blue-700">{item.hrExecutive}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Candidate ID: <strong className="font-mono">{item.candidateId}</strong>
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs text-slate-700 mt-2">
                    <strong>Notes:</strong> {item.notes}
                    {item.candidateResponse && (
                      <div className="mt-1 text-blue-700 font-medium">
                        <strong>Response:</strong> {item.candidateResponse}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  
                  {/* Call Button */}
                  <a
                    href={`tel:${item.candidateMobile}`}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/91${item.candidateMobile}?text=${encodeURIComponent(
                      `Hello ${item.candidateName}, follow-up from Essential Soul Lifestyle regarding your interview application for ${item.position}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Mark Completed & Log Next */}
                  {!item.isCompleted && (
                    <button
                      onClick={() => setActiveFollowUpCandidateId(item.candidateId)}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Log Outcome</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Follow Up Entry Modal */}
      {activeCandidate && (
        <FollowUpEntryModal
          isOpen={Boolean(activeCandidate)}
          onClose={() => setActiveFollowUpCandidateId(null)}
          candidate={activeCandidate}
        />
      )}

    </div>
  );
};
