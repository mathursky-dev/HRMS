import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  UserX, 
  Award, 
  MapPin, 
  Phone, 
  MessageSquare,
  Search,
  Filter,
  UserCheck
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { TODAY } from '../../mockData';
import { InterviewRecord, AttendanceStatus } from '../../types';
import { InterviewEvaluationModal } from './InterviewEvaluationModal';

export const InterviewPanel: React.FC = () => {
  const { interviews, updateInterviewAttendance } = useRecruitment();

  const [tab, setTab] = useState<'TODAY' | 'UPCOMING' | 'CONDUCTED' | 'NOSHOW'>('TODAY');
  const [selectedHr, setSelectedHr] = useState<string>('ALL');
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [evaluatingInterview, setEvaluatingInterview] = useState<InterviewRecord | null>(null);

  // Filter based on tab
  const todayInterviews = interviews.filter((i) => i.interviewDate === TODAY);
  const upcomingInterviews = interviews.filter((i) => i.interviewDate > TODAY);
  const conductedInterviews = interviews.filter((i) => i.attendanceStatus === 'Conducted');
  const noShowInterviews = interviews.filter((i) => i.attendanceStatus === 'No Show');

  const currentList = (() => {
    switch (tab) {
      case 'TODAY':
        return todayInterviews;
      case 'UPCOMING':
        return upcomingInterviews;
      case 'CONDUCTED':
        return conductedInterviews;
      case 'NOSHOW':
        return noShowInterviews;
    }
  })();

  const filteredList = currentList.filter((item) => {
    if (selectedHr !== 'ALL' && item.hrExecutive !== selectedHr) return false;
    if (selectedInterviewer !== 'ALL' && item.interviewer !== selectedInterviewer) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateMobile.includes(q) ||
        item.position.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Interview Command & Evaluation Panel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor daily interview target (5/day for Nandani, 5/day for Shivani), take attendance & rate scorecards
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 text-xs font-bold text-purple-800">
          <span>Today: {todayInterviews.filter(i => i.attendanceStatus === 'Conducted').length} / {todayInterviews.length} Conducted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 text-xs font-bold">
        <button
          onClick={() => setTab('TODAY')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'TODAY'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today's Interviews</span>
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px]">
            {todayInterviews.length}
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
          <Calendar className="w-4 h-4" />
          <span>Upcoming Pipeline</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
            {upcomingInterviews.length}
          </span>
        </button>

        <button
          onClick={() => setTab('CONDUCTED')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'CONDUCTED'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Conducted & Evaluated</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
            {conductedInterviews.length}
          </span>
        </button>

        <button
          onClick={() => setTab('NOSHOW')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            tab === 'NOSHOW'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>No Shows</span>
          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">
            {noShowInterviews.length}
          </span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3.5 rounded-b-xl border border-slate-200 border-t-0 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate name, mobile, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={selectedHr}
            onChange={(e) => setSelectedHr(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All HR Executives</option>
            <option value="Nandani">Nandani</option>
            <option value="Shivani">Shivani</option>
          </select>

          <select
            value={selectedInterviewer}
            onChange={(e) => setSelectedInterviewer(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All Interviewers</option>
            <option value="Vikram Singh">Vikram Singh</option>
            <option value="Aditya Mathur">Aditya Mathur</option>
            <option value="Nandani">Nandani</option>
            <option value="Shivani">Shivani</option>
          </select>
        </div>
      </div>

      {/* Interviews Grid / List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs font-medium">
            No interviews found under this tab.
          </div>
        ) : (
          filteredList.map((inv) => {
            const isConducted = inv.attendanceStatus === 'Conducted';
            const isNoShow = inv.attendanceStatus === 'No Show';

            return (
              <div
                key={inv.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                
                {/* Left details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inv.candidateName}</span>
                    <span className="text-xs text-slate-500 font-medium">({inv.position})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {inv.interviewMode}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {inv.candidateId}</span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span>
                      📅 <strong>{inv.interviewDate}</strong> at <strong>{inv.interviewTime}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Interviewer: <strong className="text-slate-900">{inv.interviewer}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      HR: <strong className="text-blue-700">{inv.hrExecutive}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Dept: <strong>{inv.department}</strong>
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{inv.interviewLocation}</span>
                  </div>

                  {inv.evaluation && (
                    <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-900">
                          Score: {inv.evaluation.averageRating}/5.0 • Result: {inv.evaluation.finalResult}
                        </span>
                        <p className="text-emerald-800 text-[11px] mt-0.5 italic">
                          "{inv.evaluation.interviewerRemarks}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Attendance Selector & Actions */}
                <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                  
                  {/* Attendance status button group */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Attendance:</span>
                    {(['Scheduled', 'Confirmed', 'Conducted', 'Rescheduled', 'No Show'] as AttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateInterviewAttendance(inv.id, st)}
                        className={`text-[11px] font-bold px-2 py-1 rounded transition-colors ${
                          inv.attendanceStatus === st
                            ? st === 'Conducted'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'No Show'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${inv.candidateMobile}`}
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/91${inv.candidateMobile}?text=${encodeURIComponent(
                        `Hello ${inv.candidateName}, interview reminder for ${inv.position} on ${inv.interviewDate} at ${inv.interviewTime} with Essential Soul Lifestyle.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Evaluate scorecard button */}
                    <button
                      onClick={() => setEvaluatingInterview(inv)}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{inv.evaluation ? 'Edit Scorecard' : 'Evaluate & Score'}</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Scorecard Modal */}
      {evaluatingInterview && (
        <InterviewEvaluationModal
          isOpen={Boolean(evaluatingInterview)}
          onClose={() => setEvaluatingInterview(null)}
          interview={evaluatingInterview}
        />
      )}

    </div>
  );
};
