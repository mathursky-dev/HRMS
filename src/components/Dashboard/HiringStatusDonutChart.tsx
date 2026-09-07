import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  RefreshCw, 
  AlertCircle, 
  Database, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';
import { useRecruitment } from '../../context/RecruitmentContext';

/**
 * 10 Official Hiring Status Categories for Recruitment Lifecycle
 */
export type HiringCategoryName =
  | 'New Leads'
  | 'Contacted'
  | 'Follow-up'
  | 'Interview Scheduled'
  | 'Interview Conducted'
  | 'Selected'
  | 'Offer Issued'
  | 'Joined / Active'
  | 'Rejected'
  | 'On Hold / Other';

export interface CategoryMeta {
  name: HiringCategoryName;
  label: string;
  color: string;
  hoverColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const HIRING_CATEGORIES_CONFIG: Record<HiringCategoryName, CategoryMeta> = {
  'New Leads': {
    name: 'New Leads',
    label: 'New Leads',
    color: '#3B82F6', // Blue 500
    hoverColor: '#2563EB',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    description: 'Fresh incoming applications & uncontacted leads',
  },
  'Contacted': {
    name: 'Contacted',
    label: 'Contacted',
    color: '#06B6D4', // Cyan 500
    hoverColor: '#0891B2',
    badgeBg: 'bg-cyan-50 border-cyan-200',
    badgeText: 'text-cyan-700',
    description: 'Initial phone screen, attempted calls & interested leads',
  },
  'Follow-up': {
    name: 'Follow-up',
    label: 'Follow-up',
    color: '#F59E0B', // Amber 500
    hoverColor: '#D97706',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    description: 'Scheduled callbacks and nurturing candidates',
  },
  'Interview Scheduled': {
    name: 'Interview Scheduled',
    label: 'Interview Scheduled',
    color: '#8B5CF6', // Purple 500
    hoverColor: '#7C3AED',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-700',
    description: 'Confirmed or rescheduled for interview rounds',
  },
  'Interview Conducted': {
    name: 'Interview Conducted',
    label: 'Interview Conducted',
    color: '#6366F1', // Indigo 500
    hoverColor: '#4F46E5',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    description: 'Interview rounds completed, feedback in evaluation',
  },
  'Selected': {
    name: 'Selected',
    label: 'Selected',
    color: '#10B981', // Emerald 500
    hoverColor: '#059669',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    description: 'Cleared technical/HR rounds, salary discussion',
  },
  'Offer Issued': {
    name: 'Offer Issued',
    label: 'Offer Issued',
    color: '#14B8A6', // Teal 500
    hoverColor: '#0D9488',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-700',
    description: 'Offer letter released, awaiting joining date',
  },
  'Joined / Active': {
    name: 'Joined / Active',
    label: 'Joined / Active',
    color: '#059669', // Emerald 600
    hoverColor: '#047857',
    badgeBg: 'bg-emerald-100 border-emerald-300',
    badgeText: 'text-emerald-800',
    description: 'Active employees, induction complete & 7-day milestone',
  },
  'Rejected': {
    name: 'Rejected',
    label: 'Rejected',
    color: '#EF4444', // Red 500
    hoverColor: '#DC2626',
    badgeBg: 'bg-red-50 border-red-200',
    badgeText: 'text-red-700',
    description: 'Rejected by panel, not interested or dropped out',
  },
  'On Hold / Other': {
    name: 'On Hold / Other',
    label: 'On Hold / Other',
    color: '#94A3B8', // Slate 400
    hoverColor: '#64748B',
    badgeBg: 'bg-slate-100 border-slate-200',
    badgeText: 'text-slate-700',
    description: 'On hold, wrong number, unreachable, no-show or resigned',
  },
};

export const ORDERED_CATEGORIES: HiringCategoryName[] = [
  'New Leads',
  'Contacted',
  'Follow-up',
  'Interview Scheduled',
  'Interview Conducted',
  'Selected',
  'Offer Issued',
  'Joined / Active',
  'Rejected',
  'On Hold / Other',
];

/**
 * Maps arbitrary raw status values from Supabase candidates table into the 10 categories
 */
export function mapCandidateStatusToCategory(rawStatus: string | null | undefined): HiringCategoryName {
  if (!rawStatus) return 'New Leads';
  const s = rawStatus.toLowerCase().trim();

  // 1. Rejected & Not Interested
  if (
    s.includes('reject') || 
    s.includes('not interested') || 
    s.includes('disqualif') || 
    s.includes('dropped') ||
    s.includes('failed')
  ) {
    return 'Rejected';
  }

  // 2. On Hold / Unreachable / No Show / Resigned
  if (
    s.includes('hold') || 
    s.includes('not reachable') || 
    s.includes('unreachable') || 
    s.includes('wrong number') || 
    s.includes('no show') || 
    s.includes('no-show') || 
    s.includes('resigned') ||
    s.includes('withdrawn')
  ) {
    return 'On Hold / Other';
  }

  // 3. Joined / Active / Training
  if (
    s.includes('active joining') || 
    s.includes('active') || 
    s.includes('joined') || 
    s.includes('training') ||
    s.includes('onboard')
  ) {
    return 'Joined / Active';
  }

  // 4. Offer Issued / Joining Confirmed
  if (
    s.includes('offer') || 
    s.includes('joining confirmed') ||
    s.includes('offered')
  ) {
    return 'Offer Issued';
  }

  // 5. Selected / Shortlisted
  if (
    s.includes('select') || 
    s.includes('shortlist') || 
    s.includes('salary discussion') ||
    s.includes('cleared')
  ) {
    return 'Selected';
  }

  // 6. Interview Conducted
  if (
    s.includes('conducted') || 
    s.includes('interview completed') ||
    (s.includes('interview') && (s.includes('done') || s.includes('feedback') || s.includes('evaluat')))
  ) {
    return 'Interview Conducted';
  }

  // 7. Interview Scheduled
  if (
    s.includes('interview') || 
    s.includes('scheduled') || 
    s.includes('confirmed') ||
    s.includes('rescheduled')
  ) {
    return 'Interview Scheduled';
  }

  // 8. Follow-up
  if (s.includes('follow') || s.includes('callback') || s.includes('nurtur')) {
    return 'Follow-up';
  }

  // 9. Contacted / Connected / Attempted / Interested
  if (
    s.includes('contact') || 
    s.includes('connect') || 
    s.includes('attempt') || 
    s.includes('interested') || 
    s.includes('call')
  ) {
    return 'Contacted';
  }

  // 10. New Leads / Not Contacted
  if (s.includes('new') || s.includes('lead') || s.includes('not contact') || s.includes('fresh')) {
    return 'New Leads';
  }

  return 'On Hold / Other';
}

interface CandidateRow {
  id: string;
  status: string;
  full_name?: string;
  department?: string;
  company_name?: string;
  created_at?: string;
}

interface ChartItem {
  name: HiringCategoryName;
  label: string;
  value: number;
  percentage: number;
  color: string;
  hoverColor: string;
  description: string;
  badgeBg: string;
  badgeText: string;
}

export interface HiringStatusDonutChartProps {
  onNavigate?: (nav: string) => void;
  onOpenAddCandidate?: () => void;
  className?: string;
}

export const HiringStatusDonutChart: React.FC<HiringStatusDonutChartProps> = ({
  onNavigate,
  onOpenAddCandidate,
  className = '',
}) => {
  const { candidates: fallbackCandidates } = useRecruitment();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [candidatesData, setCandidatesData] = useState<CandidateRow[]>([]);
  const [dataSource, setDataSource] = useState<'supabase' | 'api' | 'local'>('supabase');
  const [activeCategory, setActiveCategory] = useState<HiringCategoryName | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Fetch candidates from Supabase 'candidates' table
  const fetchSupabaseCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Attempt direct Supabase query using configured client
      const client = getSupabaseClient();
      if (client) {
        const { data, error: sbError } = await client
          .from('candidates')
          .select('id, status, full_name, department, company_name, created_at')
          .limit(2000);

        if (!sbError && data && Array.isArray(data)) {
          setCandidatesData(data);
          setDataSource('supabase');
          setLastFetchedAt(new Date());
          setLoading(false);
          return;
        } else if (sbError) {
          console.warn('[HiringStatusDonutChart] Direct Supabase error, trying API proxy:', sbError.message);
        }
      }

      // 2. Attempt proxy fetch through server endpoint /api/supabase/data
      const res = await fetch('/api/supabase/data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.candidates)) {
          const mappedRows: CandidateRow[] = json.data.candidates.map((c: any) => ({
            id: c.id,
            status: c.status || 'New Lead',
            full_name: c.fullName || c.full_name || '',
            department: c.department || '',
            company_name: c.companyName || c.company_name || '',
            created_at: c.createdAt || c.created_at || '',
          }));
          setCandidatesData(mappedRows);
          setDataSource('api');
          setLastFetchedAt(new Date());
          setLoading(false);
          return;
        }
      }

      // 3. If neither Supabase client nor API returns candidates, check if we have local fallback
      if (fallbackCandidates && fallbackCandidates.length > 0) {
        const localRows: CandidateRow[] = fallbackCandidates.map((c) => ({
          id: c.id,
          status: c.status,
          full_name: c.fullName,
          department: c.department,
          company_name: c.companyName,
          created_at: c.createdAt,
        }));
        setCandidatesData(localRows);
        setDataSource('local');
        setLastFetchedAt(new Date());
        setLoading(false);
        return;
      }

      // No data available from any source
      setCandidatesData([]);
      setLastFetchedAt(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('[HiringStatusDonutChart] Fetch error:', err);
      // Fall back gracefully to context candidates if present
      if (fallbackCandidates && fallbackCandidates.length > 0) {
        const localRows: CandidateRow[] = fallbackCandidates.map((c) => ({
          id: c.id,
          status: c.status,
          full_name: c.fullName,
          department: c.department,
          company_name: c.companyName,
          created_at: c.createdAt,
        }));
        setCandidatesData(localRows);
        setDataSource('local');
        setLastFetchedAt(new Date());
        setLoading(false);
      } else {
        setError(err?.message || 'Unable to connect to Supabase candidates table.');
        setLoading(false);
      }
    }
  }, [fallbackCandidates]);

  // Initial load
  useEffect(() => {
    fetchSupabaseCandidates();
  }, [fetchSupabaseCandidates]);

  // Unique departments for optional filter
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    candidatesData.forEach((c) => {
      if (c.department && c.department.trim()) {
        depts.add(c.department.trim());
      }
    });
    return Array.from(depts);
  }, [candidatesData]);

  // Filtered candidate list based on department
  const filteredCandidates = useMemo(() => {
    if (departmentFilter === 'ALL') return candidatesData;
    return candidatesData.filter((c) => c.department === departmentFilter);
  }, [candidatesData, departmentFilter]);

  const totalCandidates = filteredCandidates.length;

  // Aggregate into 10 categories
  const chartData: ChartItem[] = useMemo(() => {
    // Count per category
    const counts: Record<HiringCategoryName, number> = {
      'New Leads': 0,
      'Contacted': 0,
      'Follow-up': 0,
      'Interview Scheduled': 0,
      'Interview Conducted': 0,
      'Selected': 0,
      'Offer Issued': 0,
      'Joined / Active': 0,
      'Rejected': 0,
      'On Hold / Other': 0,
    };

    filteredCandidates.forEach((cand) => {
      const category = mapCandidateStatusToCategory(cand.status);
      counts[category] = (counts[category] || 0) + 1;
    });

    return ORDERED_CATEGORIES.map((catName) => {
      const config = HIRING_CATEGORIES_CONFIG[catName];
      const count = counts[catName] || 0;
      const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 1000) / 10 : 0;

      return {
        name: catName,
        label: config.label,
        value: count,
        percentage,
        color: config.color,
        hoverColor: config.hoverColor,
        description: config.description,
        badgeBg: config.badgeBg,
        badgeText: config.badgeText,
      };
    });
  }, [filteredCandidates, totalCandidates]);

  // Active slice display information
  const centerDisplay = useMemo(() => {
    if (activeCategory) {
      const item = chartData.find((d) => d.name === activeCategory);
      if (item) {
        return {
          title: item.label,
          value: item.value,
          subtitle: `${item.percentage}% of total`,
          color: item.color,
        };
      }
    }
    return {
      title: 'Total Candidates',
      value: totalCandidates,
      subtitle: departmentFilter === 'ALL' ? 'Across All Depts' : departmentFilter,
      color: '#0f172a',
    };
  }, [activeCategory, chartData, totalCandidates, departmentFilter]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-[180px] z-50">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
              style={{ backgroundColor: data.color }} 
            />
            <span className="font-bold text-slate-100 text-xs truncate">{data.label}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-slate-300 mb-1">
            <span className="text-[11px] text-slate-400">Candidate Count:</span>
            <span className="font-black text-white text-sm">{data.value}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-slate-300 mb-1.5">
            <span className="text-[11px] text-slate-400">Share of Pipeline:</span>
            <span className="font-bold text-emerald-400 text-xs">{data.percentage}%</span>
          </div>
          <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 leading-tight">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      
      {/* Component Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-slate-50/70 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Hiring Pipeline Status Distribution
              </h3>
              {/* Data Source Badge */}
              <span 
                title={
                  dataSource === 'supabase'
                    ? 'Connected directly to Supabase candidates table'
                    : dataSource === 'api'
                    ? 'Connected via authenticated backend proxy'
                    : 'Using local offline CRM cache'
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  dataSource === 'supabase'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : dataSource === 'api'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'supabase' ? 'bg-emerald-500 animate-pulse' : dataSource === 'api' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <Database className="w-2.5 h-2.5" />
                {dataSource === 'supabase' ? 'Supabase Live' : dataSource === 'api' ? 'Supabase API' : 'CRM Cache'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Visualizing Supabase <code className="text-blue-600 font-mono bg-blue-50 px-1 py-0.2 rounded text-[10px]">candidates</code> table across 10 lifecycle stages
            </p>
          </div>
        </div>

        {/* Toolbar: Department filter + Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {departmentsList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                id="select-donut-department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Departments ({candidatesData.length})</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            id="btn-refresh-donut-chart"
            onClick={fetchSupabaseCandidates}
            disabled={loading}
            title="Refresh candidate data from Supabase"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-semibold px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Body with 3 States: Loading, Error, Empty, or Content */}
      <div className="p-4">

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
              <Database className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-slate-800 mb-1">
              Querying Supabase candidates table...
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Retrieving live candidate records, calculating pipeline distributions, and mapping to 10 recruitment categories.
            </p>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3 shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Failed to Fetch Candidates from Supabase
            </h4>
            <p className="text-xs text-slate-500 mb-4 font-mono bg-slate-50 p-2 rounded border border-slate-200 w-full text-left break-all">
              {error}
            </p>
            <div className="flex gap-2">
              <button
                onClick={fetchSupabaseCandidates}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('database')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Configure Supabase
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && totalCandidates === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              No Candidate Records Found in Supabase
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              The <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">candidates</code> table currently has 0 entries matching your filters.
            </p>
            {onOpenAddCandidate && (
              <button
                onClick={onOpenAddCandidate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                + Add First Candidate
              </button>
            )}
          </div>
        )}

        {/* 4. SUCCESS STATE: DONUT CHART + RESPONSIVE LEGEND */}
        {!loading && !error && totalCandidates > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Interactive Recharts Donut Chart (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-full max-w-[300px] h-[260px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={105}
                      paddingAngle={2.5}
                      onMouseEnter={(_, index) => setActiveCategory(chartData[index]?.name || null)}
                      onMouseLeave={() => setActiveCategory(null)}
                      onClick={(data) => {
                        if (data && data.name) {
                          setActiveCategory((prev) => (prev === data.name ? null : data.name));
                        }
                      }}
                      cursor="pointer"
                    >
                      {chartData.map((entry) => {
                        const isSelected = activeCategory === entry.name;
                        const isDimmed = activeCategory !== null && !isSelected;
                        return (
                          <Cell
                            key={`slice-${entry.name}`}
                            fill={entry.color}
                            stroke={isSelected ? '#0f172a' : '#ffffff'}
                            strokeWidth={isSelected ? 3 : 1.5}
                            opacity={isDimmed ? 0.35 : 1}
                            className="transition-all duration-150"
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center KPI Overlay */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
                >
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider line-clamp-1 max-w-[120px]"
                    style={{ color: activeCategory ? centerDisplay.color : '#64748b' }}
                  >
                    {centerDisplay.title}
                  </span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight my-0.5">
                    {centerDisplay.value}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {centerDisplay.subtitle}
                  </span>
                </div>
              </div>

              {/* Chart Interaction Hint */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 text-center">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Hover or click slices to highlight lifecycle metrics</span>
              </div>
            </div>

            {/* Right: Responsive 10-Category Legend Grid (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Lifecycle Stage Breakdown ({totalCandidates} Total)
                </span>
                {activeCategory && (
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Responsive 2-Column Legend Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chartData.map((item) => {
                  const isHovered = activeCategory === item.name;
                  const isDimmed = activeCategory !== null && !isHovered;

                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setActiveCategory(item.name)}
                      onMouseLeave={() => setActiveCategory(null)}
                      onClick={() => setActiveCategory((prev) => (prev === item.name ? null : item.name))}
                      className={`group p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isHovered
                          ? 'border-slate-400 bg-slate-50/90 shadow-2xs ring-1 ring-slate-300'
                          : isDimmed
                          ? 'opacity-40 border-slate-100 bg-white'
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Left: Color indicator + Label + Share */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs transition-transform group-hover:scale-110"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.percentage}% share
                          </div>
                        </div>
                      </div>

                      {/* Right: Pill with candidate count */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span 
                          className={`text-xs font-black px-2 py-0.5 rounded-md border shadow-2xs ${item.badgeBg} ${item.badgeText}`}
                        >
                          {item.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer navigation quick-links */}
              {onNavigate && (
                <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">
                    {lastFetchedAt ? `Last refreshed ${lastFetchedAt.toLocaleTimeString()}` : ''}
                  </span>
                  <button
                    onClick={() => onNavigate('candidates')}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer text-xs"
                  >
                    <span>View Candidates Database</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
