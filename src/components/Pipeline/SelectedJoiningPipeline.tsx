import React, { useState } from 'react';
import { 
  Award, 
  UserCheck, 
  Sparkles, 
  Calendar, 
  FileCheck, 
  CheckCircle, 
  AlertTriangle,
  UserX,
  Phone,
  MessageSquare,
  GripVertical,
  Kanban,
  ListFilter,
  Search,
  Building2,
  Check
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateStatus, Department } from '../../types';
import { TODAY } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

type PipelineStageKey = 'SELECTED' | 'CONFIRMED' | 'JOINED' | 'ACTIVE' | 'BACKOUT';

interface StageConfig {
  key: PipelineStageKey;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  colorClass: string;
  badgeBg: string;
  columnBorder: string;
  targetStatus: CandidateStatus;
  matchingStatuses: CandidateStatus[];
}

const STAGES: StageConfig[] = [
  {
    key: 'SELECTED',
    label: 'Selected & Offer',
    subLabel: 'CTC Offered / Negotiating',
    icon: Award,
    colorClass: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    columnBorder: 'border-t-4 border-t-purple-500',
    targetStatus: 'Selected',
    matchingStatuses: ['Selected', 'Salary Discussion'],
  },
  {
    key: 'CONFIRMED',
    label: 'Joining Confirmed',
    subLabel: 'Offer Accepted / Date Fixed',
    icon: Calendar,
    colorClass: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    columnBorder: 'border-t-4 border-t-blue-500',
    targetStatus: 'Joining Confirmed',
    matchingStatuses: ['Joining Confirmed'],
  },
  {
    key: 'JOINED',
    label: 'Joined (Induction)',
    subLabel: 'Day 1–7 Orientation Period',
    icon: UserCheck,
    colorClass: 'text-teal-600',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    columnBorder: 'border-t-4 border-t-teal-500',
    targetStatus: 'Joined',
    matchingStatuses: ['Joined'],
  },
  {
    key: 'ACTIVE',
    label: 'Active Joining',
    subLabel: 'Target Verified (Monthly Target)',
    icon: Sparkles,
    colorClass: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    columnBorder: 'border-t-4 border-t-emerald-500',
    targetStatus: 'Active Joining',
    matchingStatuses: ['Active Joining'],
  },
  {
    key: 'BACKOUT',
    label: 'Dropouts / No Show',
    subLabel: 'Offer Rejected or Absent',
    icon: UserX,
    colorClass: 'text-rose-600',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    columnBorder: 'border-t-4 border-t-rose-500',
    targetStatus: 'No Show',
    matchingStatuses: ['No Show', 'Resigned'],
  },
];

export const SelectedJoiningPipeline: React.FC = () => {
  const { candidates, updateCandidate } = useRecruitment();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [activeTab, setActiveTab] = useState<PipelineStageKey>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<'ALL' | Department>('ALL');

  // Drag and drop states
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStageKey | null>(null);
  const [lastDropNotice, setLastDropNotice] = useState<string | null>(null);

  // Filter candidates relevant to this pipeline
  const pipelineCandidates = candidates.filter((c) => {
    if (c.isArchived) return false;
    
    // Check department filter
    if (deptFilter !== 'ALL' && c.department !== deptFilter) return false;

    // Check search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        c.fullName.toLowerCase().includes(q) ||
        c.positionApplied.toLowerCase().includes(q) ||
        c.assignedHr.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q);
      if (!match) return false;
    }

    return (
      [
        'Selected',
        'Salary Discussion',
        'Joining Confirmed',
        'Joined',
        'Active Joining',
        'No Show',
        'Resigned',
      ].includes(c.status) || c.isActiveJoining
    );
  });

  // Categorize candidates by stage
  const getStageCandidates = (stageKey: PipelineStageKey) => {
    return pipelineCandidates.filter((c) => {
      if (stageKey === 'ACTIVE') {
        return c.isActiveJoining || c.status === 'Active Joining';
      }
      if (stageKey === 'JOINED') {
        return c.status === 'Joined' && !c.isActiveJoining;
      }
      if (stageKey === 'CONFIRMED') {
        return c.status === 'Joining Confirmed';
      }
      if (stageKey === 'SELECTED') {
        return (c.status === 'Selected' || c.status === 'Salary Discussion') && !c.isActiveJoining;
      }
      if (stageKey === 'BACKOUT') {
        return c.status === 'No Show' || c.status === 'Resigned';
      }
      return false;
    });
  };

  const selectedList = getStageCandidates('SELECTED');
  const confirmedList = getStageCandidates('CONFIRMED');
  const joinedList = getStageCandidates('JOINED');
  const activeJoiningList = getStageCandidates('ACTIVE');
  const backoutList = getStageCandidates('BACKOUT');

  // Handle Drag & Drop status transition
  const handleDropOnStage = (candId: string, targetStage: PipelineStageKey) => {
    const cand = candidates.find((c) => c.id === candId);
    if (!cand) return;

    let updates: Partial<Candidate> = {};
    let noticeMessage = '';

    switch (targetStage) {
      case 'SELECTED':
        updates = {
          status: 'Selected',
          isActiveJoining: false,
          selectionDate: cand.selectionDate || TODAY,
        };
        noticeMessage = `Moved "${cand.fullName}" to Selected & Offer`;
        break;

      case 'CONFIRMED':
        updates = {
          status: 'Joining Confirmed',
          isActiveJoining: false,
          joiningDate: cand.joiningDate || TODAY,
          joiningConfirmation: true,
        };
        noticeMessage = `Moved "${cand.fullName}" to Joining Confirmed (Joining: ${updates.joiningDate})`;
        break;

      case 'JOINED':
        updates = {
          status: 'Joined',
          isActiveJoining: false,
          actualJoinedDate: cand.actualJoinedDate || TODAY,
          joiningStatus: 'Joined',
        };
        noticeMessage = `Moved "${cand.fullName}" to Joined (Induction Period)`;
        break;

      case 'ACTIVE':
        updates = {
          status: 'Active Joining',
          isActiveJoining: true,
          activeJoinedDate: TODAY,
          joiningStatus: 'Joined',
          actualJoinedDate: cand.actualJoinedDate || TODAY,
        };
        noticeMessage = `★ Verified "${cand.fullName}" as Active Joining (Monthly Target Counted!)`;
        break;

      case 'BACKOUT':
        updates = {
          status: 'No Show',
          isActiveJoining: false,
        };
        noticeMessage = `Moved "${cand.fullName}" to Dropouts / No Show`;
        break;
    }

    updateCandidate(cand.id, updates, noticeMessage);
    setLastDropNotice(noticeMessage);
    setTimeout(() => setLastDropNotice(null), 4500);
  };

  // Toggle active joining manually
  const handleToggleActiveJoining = (cand: Candidate) => {
    const newActive = !cand.isActiveJoining;
    updateCandidate(
      cand.id,
      {
        isActiveJoining: newActive,
        status: newActive ? 'Active Joining' : 'Joined',
        activeJoinedDate: newActive ? TODAY : undefined,
      },
      newActive ? 'Verified as ACTIVE JOINING (Counted towards Monthly Target)' : 'Reverted Active Joining verification'
    );
    const msg = newActive
      ? `★ Verified "${cand.fullName}" as Active Joining (Target Counted)`
      : `Reverted Active verification for "${cand.fullName}"`;
    setLastDropNotice(msg);
    setTimeout(() => setLastDropNotice(null), 3500);
  };

  const handleConfirmJoining = (cand: Candidate) => {
    handleDropOnStage(cand.id, 'CONFIRMED');
  };

  const handleMarkJoined = (cand: Candidate) => {
    handleDropOnStage(cand.id, 'JOINED');
  };

  // Drag event handlers
  const handleDragStart = (e: React.DragEvent, candId: string) => {
    e.dataTransfer.setData('text/plain', candId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCandidateId(candId);
  };

  const handleDragEnd = () => {
    setDraggedCandidateId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: PipelineStageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stageKey: PipelineStageKey) => {
    // Only clear if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stageKey) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageKey: PipelineStageKey) => {
    e.preventDefault();
    const candId = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    setDragOverStage(null);
    setDraggedCandidateId(null);
    if (candId) {
      handleDropOnStage(candId, stageKey);
    }
  };

  return (
    <div className="space-y-3 pb-12">
      
      {/* Toast Notification when drop completes */}
      {lastDropNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastDropNotice}</span>
          <button 
            onClick={() => setLastDropNotice(null)} 
            className="ml-2 text-slate-400 hover:text-white text-sm leading-none p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Selected & Active Joining Pipeline
            </h2>
            <span className="hidden sm:inline-block text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
              Drag & Drop Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag candidate cards between columns to automatically update their recruitment stage & targets
          </p>
        </div>

        {/* View mode toggle & verified count badge */}
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeJoiningList.length} Active Verified</span>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View (Drag and Drop)"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tabbed List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Stage List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target explanation & Drag instruction banner */}
      <div className="bg-slate-900 text-white rounded-lg p-3 text-xs flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-blue-500/20 text-blue-400 rounded">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <strong className="text-white font-bold">Target Metric Rule:</strong>{' '}
            <span className="text-slate-300">
              Only candidates in <strong>Active Joining</strong> count toward the monthly 20-joining target for Nandani (HR) and Shivani (BKD).
              Drag cards directly into the <strong>Active Joining</strong> column once induction is verified!
            </span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 font-medium">
          <GripVertical className="w-3.5 h-3.5 text-slate-500" />
          <span>Grab & drag any card to update stage</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate, role, mobile, HR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dept:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 focus:outline-none"
          >
            <option value="ALL">All Departments ({pipelineCandidates.length})</option>
            <option value="HR Recruitment">HR Recruitment (Nandani)</option>
            <option value="BKD Recruitment">BKD Recruitment (Shivani)</option>
          </select>
        </div>
      </div>

      {/* KANBAN BOARD VIEW (Drag and drop across 5 columns) */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-start overflow-x-auto">
          {STAGES.map((stage) => {
            const stageCandidates = getStageCandidates(stage.key);
            const Icon = stage.icon;
            const isDropTarget = dragOverStage === stage.key;

            return (
              <div
                key={stage.key}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={(e) => handleDragLeave(e, stage.key)}
                onDrop={(e) => handleDrop(e, stage.key)}
                className={`bg-slate-100/80 rounded-lg border flex flex-col transition-all min-h-[480px] ${
                  stage.columnBorder
                } ${
                  isDropTarget
                    ? 'border-2 border-dashed border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-400/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 bg-white border-b border-slate-200 rounded-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${stage.colorClass}`} />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {stage.label}
                      </h3>
                      <p className="text-[10px] text-slate-500">{stage.subLabel}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stage.badgeBg}`}>
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Drop Zone Placeholder prompt when dragging over */}
                {isDropTarget && (
                  <div className="m-2 p-3 border-2 border-dashed border-blue-500 bg-blue-100/60 rounded-lg text-center text-blue-800 text-xs font-bold animate-pulse flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Drop here to set {stage.label}</span>
                  </div>
                )}

                {/* Cards List in this column */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {stageCandidates.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-300/80 rounded-lg bg-white/40">
                      No candidates in this stage.
                      <div className="text-[10px] text-slate-400 mt-1">
                        Drag a card here to update
                      </div>
                    </div>
                  ) : (
                    stageCandidates.map((cand) => {
                      const isDraggingThis = draggedCandidateId === cand.id;
                      const isVerifiedActive = cand.isActiveJoining;

                      return (
                        <div
                          key={cand.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, cand.id)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white rounded-lg border p-3 shadow-xs transition-all cursor-grab active:cursor-grabbing hover:border-slate-300 hover:shadow-sm select-none ${
                            isDraggingThis
                              ? 'opacity-40 scale-[0.98] border-dashed border-blue-500 ring-2 ring-blue-400'
                              : isVerifiedActive
                              ? 'border-emerald-300 bg-emerald-50/20'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Card Header & Drag Handle */}
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <div className="flex items-start gap-1.5 flex-1">
                              <span className="text-slate-400 hover:text-slate-600 mt-0.5 shrink-0" title="Drag to reorder/move">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <div className="overflow-hidden">
                                <div className="font-bold text-xs text-slate-900 leading-snug truncate">
                                  {cand.fullName}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {cand.positionApplied}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                              {cand.id.replace('ESL-2026-', '#')}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="text-[10px] text-slate-600 space-y-1 bg-slate-50/80 p-2 rounded border border-slate-100 mb-2">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 uppercase font-semibold">HR Head:</span>
                              <span className="font-bold text-blue-900">{cand.assignedHr}</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 uppercase font-semibold">Offered CTC:</span>
                              <span className="font-semibold text-slate-800">
                                {formatCurrency(cand.expectedSalary || cand.currentSalary)}
                              </span>
                            </div>

                            {cand.joiningDate && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 uppercase font-semibold">Joining Date:</span>
                                <span className="font-bold text-slate-700">{cand.joiningDate}</span>
                              </div>
                            )}

                            {cand.actualJoinedDate && stage.key !== 'CONFIRMED' && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 uppercase font-semibold">Joined On:</span>
                                <span className="font-bold text-teal-700">{cand.actualJoinedDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions & Status Triggers */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <a
                                href={`tel:${cand.mobileNumber}`}
                                className="p-1 text-emerald-600 hover:bg-slate-100 rounded"
                                title="Call candidate"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/91${cand.whatsappNumber}?text=${encodeURIComponent(
                                  `Hello ${cand.fullName}, greetings from Essential Soul Lifestyle Pvt Ltd.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-teal-600 hover:bg-slate-100 rounded"
                                title="WhatsApp candidate"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Stage specific quick buttons */}
                            {stage.key === 'SELECTED' && (
                              <button
                                onClick={() => handleConfirmJoining(cand)}
                                className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}

                            {stage.key === 'CONFIRMED' && (
                              <button
                                onClick={() => handleMarkJoined(cand)}
                                className="text-[10px] bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                              >
                                Mark Joined
                              </button>
                            )}

                            {(stage.key === 'JOINED' || stage.key === 'ACTIVE') && (
                              <button
                                onClick={() => handleToggleActiveJoining(cand)}
                                className={`text-[10px] px-2 py-0.5 rounded font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isVerifiedActive
                                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    : 'bg-slate-900 text-white hover:bg-emerald-600'
                                }`}
                                title={isVerifiedActive ? 'Verified towards Monthly Target' : 'Verify Active Joining'}
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>{isVerifiedActive ? 'Verified' : 'Verify Active'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Column Footer */}
                <div className="p-2 bg-white/60 border-t border-slate-200 text-center text-[10px] text-slate-400">
                  Drag card here to update
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABBED LIST VIEW (Alternative view with Drag & Drop tab dropzones) */}
      {viewMode === 'LIST' && (
        <div className="space-y-3">
          
          {/* Tabs as Interactive Drop Zones */}
          <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-lg px-2 pt-2 gap-1 text-xs font-bold">
            {STAGES.map((stg) => {
              const count = getStageCandidates(stg.key).length;
              const isTabDropTarget = dragOverStage === stg.key;
              const Icon = stg.icon;

              return (
                <button
                  key={stg.key}
                  onClick={() => setActiveTab(stg.key)}
                  onDragOver={(e) => handleDragOver(e, stg.key)}
                  onDragLeave={(e) => handleDragLeave(e, stg.key)}
                  onDrop={(e) => handleDrop(e, stg.key)}
                  className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isTabDropTarget
                      ? 'border-blue-600 bg-blue-100/70 text-blue-900 scale-105 ring-1 ring-blue-400'
                      : activeTab === stg.key
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stg.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === stg.key ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List Content */}
          <div className="space-y-2">
            {getStageCandidates(activeTab).length === 0 ? (
              <div className="bg-white p-10 text-center rounded-lg border border-slate-200 text-slate-400 text-xs font-medium">
                No candidates in this stage of the pipeline.
                <p className="text-[10px] text-slate-400 mt-1">
                  Drag any candidate card onto this tab header to move them here.
                </p>
              </div>
            ) : (
              getStageCandidates(activeTab).map((cand) => {
                const isDragging = draggedCandidateId === cand.id;
                const isVerifiedActive = cand.isActiveJoining;

                return (
                  <div
                    key={cand.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, cand.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white p-4 rounded-lg border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-grab active:cursor-grabbing hover:border-slate-300 ${
                      isDragging
                        ? 'opacity-40 border-dashed border-blue-500'
                        : isVerifiedActive
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="text-slate-400 hover:text-slate-600 mt-1 shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{cand.fullName}</span>
                          <span className="text-xs text-slate-500">({cand.positionApplied})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isVerifiedActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {cand.status}
                          </span>
                          {isVerifiedActive && (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Target Achieved
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                          <span>Dept: <strong>{cand.department}</strong></span>
                          <span>•</span>
                          <span>HR Head: <strong className="text-blue-700">{cand.assignedHr}</strong></span>
                          <span>•</span>
                          <span>Offered CTC: <strong>{formatCurrency(cand.expectedSalary || cand.currentSalary)}/m</strong></span>
                          {cand.joiningDate && (
                            <>
                              <span>•</span>
                              <span>Joining Date: <strong>{cand.joiningDate}</strong></span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <FileCheck className="w-3 h-3 text-emerald-600" />
                            Aadhaar / PAN Verified
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <FileCheck className="w-3 h-3 text-emerald-600" />
                            Offer Letter Dispatched
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <a
                        href={`tel:${cand.mobileNumber}`}
                        className="p-1.5 text-emerald-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`https://wa.me/91${cand.whatsappNumber}?text=${encodeURIComponent(
                          `Congratulations ${cand.fullName}! Welcoming you from Essential Soul Lifestyle Pvt Ltd.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-teal-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>

                      {activeTab === 'SELECTED' && (
                        <button
                          onClick={() => handleConfirmJoining(cand)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          Confirm Joining
                        </button>
                      )}

                      {activeTab === 'CONFIRMED' && (
                        <button
                          onClick={() => handleMarkJoined(cand)}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark As Joined
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleActiveJoining(cand)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-extrabold transition-all cursor-pointer ${
                          isVerifiedActive
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                            : 'bg-slate-900 text-white hover:bg-emerald-600'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isVerifiedActive ? 'Active Verified' : 'Verify Active'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
