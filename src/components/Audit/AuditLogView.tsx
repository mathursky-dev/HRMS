import React, { useState } from 'react';
import { History, Search, Filter, Clock, User, ShieldCheck } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useRecruitment();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedAction !== 'ALL' && !log.action.includes(selectedAction)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        log.candidateName?.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q));
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
            <History className="w-5 h-5 text-indigo-600" />
            System Audit Trail & Compliance Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all candidate modifications, status updates, interview ratings & lead reassignments
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-indigo-900 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{auditLogs.length} Total Events Logged</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by candidate name, user, action details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All Actions</option>
            <option value="Created">Created</option>
            <option value="Status">Status Change</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Interview">Interview</option>
            <option value="Assignment">Assignment</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Change Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString();

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.candidateName || '—'}</div>
                        {log.candidateId && (
                          <span className="text-[10px] text-slate-400 font-mono">{log.candidateId}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-bold text-blue-900">
                        {log.performedBy}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{log.details || '—'}</div>
                        {log.previousValue && log.newValue && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            <span className="line-through">{log.previousValue}</span> →{' '}
                            <span className="text-emerald-600 font-semibold">{log.newValue}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
