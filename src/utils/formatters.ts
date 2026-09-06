import { CandidateStatus } from '../types';

export const getStatusBadgeClass = (status: CandidateStatus): string => {
  switch (status) {
    case 'New Lead':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Not Contacted':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Attempted':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Connected':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Call Back':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Interested':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Not Interested':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Not Reachable':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Wrong Number':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'Follow-up':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Interview Scheduled':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'Interview Confirmed':
      return 'bg-sky-50 text-sky-700 border-sky-300';
    case 'Interview Rescheduled':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'Interview Conducted':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Selected':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    case 'Rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Hold':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Salary Discussion':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Training Scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Training Started':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Training Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Joining Confirmed':
      return 'bg-green-100 text-green-800 border-green-300 font-semibold';
    case 'Joined':
      return 'bg-teal-100 text-teal-800 border-teal-300 font-semibold';
    case 'Active Joining':
      return 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs';
    case 'No Show':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'Resigned':
      return 'bg-gray-200 text-gray-800 border-gray-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getTargetProgressColor = (percentage: number): {
  bg: string;
  text: string;
  bar: string;
  badge: string;
} => {
  if (percentage >= 100) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
  }
  if (percentage >= 80) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      bar: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    };
  }
  if (percentage >= 50) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }
  return {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  };
};

export const formatCurrency = (val?: number): string => {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const calculateDaysDifference = (fromDateStr: string, toDateStr: string = new Date().toISOString()): number => {
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getLeadAgingCategory = (createdAtStr: string): '0 Day' | '1 Day' | '2-3 Days' | '4-7 Days' | '7+ Days' => {
  const days = calculateDaysDifference(createdAtStr);
  if (days === 0) return '0 Day';
  if (days === 1) return '1 Day';
  if (days <= 3) return '2-3 Days';
  if (days <= 7) return '4-7 Days';
  return '7+ Days';
};
