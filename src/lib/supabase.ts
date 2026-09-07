import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Candidate, 
  UserProfile, 
  Company, 
  DepartmentItem, 
  JobOpening, 
  InterviewRecord, 
  FollowUpRecord, 
  OfferLetter, 
  TargetSetting, 
  TermsClause,
  AuditLogEntry
} from '../types';

export function normalizeSupabaseUrl(input?: string): string {
  if (!input) return 'https://snvgarluywefmlsimikf.supabase.co';
  let str = input.trim().replace(/^["']|["']$/g, '').trim();

  // If someone pasted multiple variables on one line, extract the .supabase.co URL
  const supabaseMatch = str.match(/https?:\/\/[a-z0-9_-]+\.supabase\.co/i);
  if (supabaseMatch) {
    return supabaseMatch[0].toLowerCase();
  }

  // If someone pasted 20-character project ref
  const refMatch = str.match(/\b([a-z0-9]{20})\b/i);
  if (refMatch) {
    return `https://${refMatch[1].toLowerCase()}.supabase.co`;
  }

  const firstWord = str.split(/\s+/)[0].replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();
  let cleaned = firstWord;
  if (!cleaned) return 'https://snvgarluywefmlsimikf.supabase.co';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}.supabase.co`;
  }
  return cleaned.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

export function extractProjectId(url: string): string {
  try {
    const cleanUrl = normalizeSupabaseUrl(url);
    const parsed = new URL(cleanUrl);
    const parts = parsed.hostname.split('.');
    if (parts.length >= 3 && parts[1] === 'supabase' && parts[2] === 'co') {
      return parts[0];
    }
    return parsed.hostname.replace('.supabase.co', '');
  } catch {
    return 'snvgarluywefmlsimikf';
  }
}

export const DEFAULT_SUPABASE_URL = 'https://snvgarluywefmlsimikf.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudmdhcmx1eXdlZm1sc2ltaWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTUzODcsImV4cCI6MjEwNDE3MTM4N30.yXUxN8bSlNciLCHW_yAS5ioOFoZpkqi4nS2D5wl4cVo';

export function extractJwtProjectRef(token: string): string | null {
  if (!token) return null;
  try {
    const parts = token.trim().split('.');
    if (parts.length >= 2) {
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const jsonStr =
        typeof atob !== 'undefined'
          ? atob(base64)
          : Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(jsonStr);
      return payload.ref || null;
    }
  } catch {}
  return null;
}

const LOCAL_STORAGE_URL_KEY = 'esl_supabase_url_override';
const LOCAL_STORAGE_ANON_KEY = 'esl_supabase_anon_key_override';

export function getSupabaseUrl(): string {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_URL_KEY) : null;
    if (saved && saved.trim().length > 0) {
      return normalizeSupabaseUrl(saved);
    }
  } catch {}

  const envUrl = 
    import.meta.env.VITE_SUPABASE_URL ||
    (import.meta.env as any).SUPABASE_URL ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return normalizeSupabaseUrl(envUrl);
  }

  return DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  const currentUrl = getSupabaseUrl();
  const currentProjId = extractProjectId(currentUrl);

  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_ANON_KEY);
      if (saved && saved.trim().length > 0) {
        const cleaned = cleanKey(saved);
        // Automatically purge any dummy / placeholder fake key
        if (
          !cleaned ||
          cleaned.startsWith('sb_secret_') ||
          cleaned === 'sb_secret_D32T4_vaOP_1qkDE5TYpgg_T5PnlF9m' ||
          cleaned.toLowerCase().includes('placeholder')
        ) {
          localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
        } else {
          // If this key is a JWT, verify its project ref matches current URL
          const keyRef = extractJwtProjectRef(cleaned);
          if (keyRef && keyRef !== currentProjId) {
            // Mismatched project key! This produces "Unregistered API key". Purge it.
            console.warn(
              `[Supabase] Purging cached key: Key belongs to project "${keyRef}" but active URL is "${currentProjId}".`
            );
            localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
          } else {
            return cleaned;
          }
        }
      }
    }
  } catch {}

  const envKey = 
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta.env as any).SUPABASE_ANON_KEY ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY);

  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    const cleaned = cleanKey(envKey);
    if (
      cleaned &&
      !cleaned.startsWith('sb_secret_') &&
      cleaned !== 'sb_secret_D32T4_vaOP_1qkDE5TYpgg_T5PnlF9m'
    ) {
      const keyRef = extractJwtProjectRef(cleaned);
      if (!keyRef || keyRef === currentProjId) {
        return cleaned;
      }
    }
  }

  // Fallback to verified default anon key if connected to default project
  if (currentProjId === 'snvgarluywefmlsimikf') {
    return DEFAULT_SUPABASE_ANON_KEY;
  }

  return '';
}

function cleanKey(raw: string): string {
  if (!raw) return '';
  let clean = raw.trim().replace(/^["']|["']$/g, '').replace(/^[A-Z0-9_]+=\s*/i, '').trim();
  if (clean.includes(' ') || clean.includes('\n')) {
    const tokens = clean.split(/\s+/);
    const jwt = tokens.find(t => t.includes('eyJ'));
    if (jwt) clean = jwt.replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();
    else clean = tokens[0].replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();
  }
  // Ignore legacy fake dummy secret
  if (clean.startsWith('sb_secret_') || clean.includes('sb_secret_D32T4_vaOP_1qkDE5TYpgg_T5PnlF9m')) {
    return '';
  }
  return clean;
}

export function clearSupabaseOverrides() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
      localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
    }
    clientInstance = null;
  } catch (e) {
    console.error('Failed to clear Supabase overrides', e);
  }
}

export const SUPABASE_URL = getSupabaseUrl();
export const SUPABASE_PROJECT_ID = extractProjectId(SUPABASE_URL);
export const SUPABASE_REST_API = `${SUPABASE_URL}/rest/v1/`;

export function setSupabaseConfigOverride(url: string, key: string) {
  try {
    if (typeof window !== 'undefined') {
      if (url && url.trim()) {
        localStorage.setItem(LOCAL_STORAGE_URL_KEY, url.trim());
      } else {
        localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
      }
      if (key && key.trim()) {
        localStorage.setItem(LOCAL_STORAGE_ANON_KEY, key.trim());
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
      }
    }
    clientInstance = null;
  } catch (e) {
    console.error('Failed to save Supabase config override', e);
  }
}

export function setSupabaseAnonKeyOverride(key: string) {
  setSupabaseConfigOverride(getSupabaseUrl(), key);
}

let clientInstance: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const currentUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!anonKey || !currentUrl || !currentUrl.startsWith('http')) {
    return null;
  }

  // Re-instantiate if URL or Key changed
  if (!clientInstance || currentUrl !== lastUsedUrl || anonKey !== lastUsedKey) {
    try {
      clientInstance = createClient(currentUrl, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      lastUsedUrl = currentUrl;
      lastUsedKey = anonKey;
    } catch (err) {
      console.warn('Error creating Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
}

export interface SupabaseHealthResult {
  isConfigured: boolean;
  isConnected: boolean;
  hasAnonKey: boolean;
  hasTablesCreated?: boolean;
  projectId: string;
  apiUrl: string;
  supabaseUrl?: string;
  maskedKey?: string;
  latencyMs?: number;
  error?: string;
  errorCode?: string;
  candidateCount?: number;
  tableStatus?: Record<string, { exists: boolean; count?: number; error?: string }>;
}

// =========================================================================
// BIDIRECTIONAL ENTITY MAPPING (TypeScript CRM <-> PostgreSQL Supabase)
// =========================================================================

export function candidateToDb(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    full_name: c.fullName || c.full_name || '',
    mobile_number: c.mobileNumber || c.mobile_number || '',
    whatsapp_number: c.whatsappNumber || c.whatsapp_number || c.mobileNumber || '',
    gender: c.gender || null,
    age: c.age !== undefined && c.age !== null ? Number(c.age) : null,
    date_of_birth: c.dateOfBirth || c.date_of_birth || null,
    email: c.email || null,
    city: c.city || null,
    area: c.area || null,
    address: c.address || null,
    position_applied: c.positionApplied || c.position_applied || '',
    department: c.department || 'HR Recruitment',
    company_id: c.companyId || c.company_id || null,
    company_name: c.companyName || c.company_name || null,
    qualification: c.qualification || null,
    total_experience: c.totalExperience || c.total_experience || null,
    relevant_experience: c.relevantExperience || c.relevant_experience || null,
    current_company: c.currentCompany || c.current_company || null,
    current_salary: c.currentSalary !== undefined && c.currentSalary !== null ? Number(c.currentSalary) : null,
    expected_salary: c.expectedSalary !== undefined && c.expectedSalary !== null ? Number(c.expectedSalary) : null,
    salary_offered: c.salaryOffered !== undefined && c.salaryOffered !== null ? Number(c.salaryOffered) : null,
    notice_period: c.noticePeriod || c.notice_period || null,
    preferred_location: c.preferredLocation || c.preferred_location || null,
    candidate_source: c.candidateSource || c.candidate_source || 'Indeed',
    assigned_hr: c.assignedHr || c.assigned_hr || 'Nandani',
    remarks: c.remarks || null,
    status: c.status || 'New Lead',
    is_active_joining: Boolean(c.isActiveJoining ?? c.is_active_joining),
    active_joining_date: c.activeJoinedDate || c.active_joining_date || null,
    joining_date: c.joiningDate || c.joining_date || null,
    interview_date: c.interviewDate || c.interview_date || null,
    offer_letter_issued: Boolean(c.offerLetterIssued ?? c.offer_letter_issued),
    is_locked: Boolean(c.isLocked ?? c.is_locked),
    locked_by: c.lockedBy || c.locked_by || null,
    locked_at: c.lockedAt || c.locked_at || null,
    first_call_date: c.firstCallDate || c.first_call_date || null,
    last_activity_date: c.lastActivityDate || c.last_activity_date || new Date().toISOString(),
    created_at: c.createdAt || c.created_at || new Date().toISOString(),
    updated_at: c.updatedAt || c.updated_at || new Date().toISOString(),
  };
}

export function candidateFromDb(r: any): Candidate {
  return {
    id: r.id,
    fullName: r.full_name || r.fullName || '',
    mobileNumber: r.mobile_number || r.mobileNumber || '',
    whatsappNumber: r.whatsapp_number || r.whatsappNumber || r.mobile_number || '',
    gender: r.gender || 'Male',
    age: r.age !== null && r.age !== undefined ? Number(r.age) : undefined,
    dateOfBirth: r.date_of_birth || r.dateOfBirth || undefined,
    email: r.email || '',
    city: r.city || '',
    area: r.area || '',
    address: r.address || undefined,
    positionApplied: r.position_applied || r.positionApplied || '',
    department: r.department || 'HR Recruitment',
    companyId: r.company_id || r.companyId || undefined,
    companyName: r.company_name || r.companyName || undefined,
    qualification: r.qualification || '',
    totalExperience: r.total_experience || r.totalExperience || '',
    relevantExperience: r.relevant_experience || r.relevantExperience || '',
    currentCompany: r.current_company || r.currentCompany || undefined,
    currentSalary: r.current_salary !== null && r.current_salary !== undefined ? Number(r.current_salary) : (r.currentSalary ?? undefined),
    expectedSalary: r.expected_salary !== null && r.expected_salary !== undefined ? Number(r.expected_salary) : (r.expectedSalary ?? undefined),
    salaryOffered: r.salary_offered !== null && r.salary_offered !== undefined ? Number(r.salary_offered) : (r.salaryOffered ?? undefined),
    noticePeriod: r.notice_period || r.noticePeriod || undefined,
    preferredLocation: r.preferred_location || r.preferredLocation || undefined,
    candidateSource: r.candidate_source || r.candidateSource || 'Indeed',
    assignedHr: r.assigned_hr || r.assignedHr || 'Nandani',
    remarks: r.remarks || undefined,
    status: r.status || 'New Lead',
    isActiveJoining: Boolean(r.is_active_joining ?? r.isActiveJoining),
    activeJoinedDate: r.active_joining_date || r.activeJoinedDate || undefined,
    joiningDate: r.joining_date || r.joiningDate || undefined,
    selectionDate: r.interview_date || r.selection_date || r.selectionDate || undefined,
    isArchived: Boolean(r.is_archived ?? r.isArchived),
    firstCallDate: r.first_call_date || r.firstCallDate || undefined,
    lastActivityDate: r.last_activity_date || r.lastActivityDate || new Date().toISOString(),
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export function companyToDb(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name || '',
    code: c.code || '',
    legal_name: c.legalName || c.legal_name || null,
    cin: c.cin || null,
    gstin: c.gstin || null,
    address: c.address || '',
    city: c.city || '',
    state: c.state || '',
    pincode: c.pincode || null,
    phone: c.phone || '',
    email: c.email || '',
    logo_url: c.logoUrl || c.logo_url || null,
    website: c.website || null,
    departments: Array.isArray(c.departments) ? c.departments : [],
    is_active: Boolean(c.isActive ?? c.is_active ?? true),
    admin_user_id: c.adminUserId || c.admin_user_id || null,
    admin_password: c.adminPassword || c.admin_password || null,
    master_contact_person: c.masterContactPerson || c.master_contact_person || null,
    last_password_changed: c.lastPasswordChanged || c.last_password_changed || null,
    created_at: c.createdAt || c.created_at || new Date().toISOString(),
    updated_at: c.updatedAt || c.updated_at || new Date().toISOString(),
  };
}

export function companyFromDb(r: any): Company {
  return {
    id: r.id,
    name: r.name || '',
    code: r.code || '',
    legalName: r.legal_name || r.legalName || undefined,
    cin: r.cin || undefined,
    gstin: r.gstin || undefined,
    address: r.address || '',
    city: r.city || '',
    state: r.state || '',
    pincode: r.pincode || undefined,
    phone: r.phone || '',
    email: r.email || '',
    website: r.website || undefined,
    logoUrl: r.logo_url || r.logoUrl || null,
    departments: Array.isArray(r.departments) ? r.departments : [],
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
    adminUserId: r.admin_user_id || r.adminUserId || undefined,
    adminPassword: r.admin_password || r.adminPassword || undefined,
    masterContactPerson: r.master_contact_person || r.masterContactPerson || undefined,
    lastPasswordChanged: r.last_password_changed || r.lastPasswordChanged || undefined,
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export function departmentToDb(d: any, validCompanyIds?: Set<string>) {
  if (!d) return null;
  const compId = d.companyId || d.company_id || null;
  return {
    id: d.id,
    name: d.name || '',
    code: d.code || '',
    description: d.description || null,
    company_id: (validCompanyIds && compId && !validCompanyIds.has(compId)) ? null : compId,
    head_of_department: d.headName || d.head_of_department || null,
    target_hires: d.targetHires ?? d.target_hires ?? d.dailyInterviewTarget ?? 0,
    current_employees: d.currentEmployees ?? d.current_employees ?? 0,
    is_active: Boolean(d.isActive ?? d.is_active ?? true),
    created_at: d.createdAt || d.created_at || new Date().toISOString(),
  };
}

export function departmentFromDb(r: any): DepartmentItem {
  return {
    id: r.id,
    name: r.name || '',
    code: r.code || '',
    companyId: r.company_id || r.companyId || '',
    companyName: r.company_name || r.companyName || '',
    headName: r.head_of_department || r.headName || '',
    headEmail: r.head_email || r.headEmail || undefined,
    dailyInterviewTarget: r.target_hires ?? r.dailyInterviewTarget ?? 5,
    monthlyActiveJoiningTarget: r.current_employees ?? r.monthlyActiveJoiningTarget ?? 10,
    description: r.description || undefined,
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export function userToDb(u: any, validCompanyIds?: Set<string>) {
  if (!u) return null;
  const compId = u.companyId || u.company_id || null;
  return {
    id: u.id,
    name: u.name || '',
    email: u.email || '',
    phone: u.phone || null,
    role: u.role || 'HR Executive',
    department: u.department || 'HR Recruitment',
    company_id: (validCompanyIds && compId && !validCompanyIds.has(compId)) ? null : compId,
    company_name: u.companyName || u.company_name || null,
    user_id: u.userId || u.user_id || null,
    password: u.password || null,
    daily_interview_target: u.dailyInterviewTarget ?? u.daily_interview_target ?? 10,
    monthly_active_joining_target: u.monthlyActiveJoiningTarget ?? u.monthly_active_joining_target ?? 20,
    status: u.status || 'Active',
    avatar_url: u.avatar || u.avatar_url || null,
    created_at: u.createdAt || u.created_at || new Date().toISOString(),
    updated_at: u.updatedAt || u.updated_at || new Date().toISOString(),
  };
}

export function userFromDb(r: any): UserProfile {
  return {
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    phone: r.phone || undefined,
    role: r.role || 'HR Executive',
    department: r.department || 'HR Recruitment',
    companyId: r.company_id || r.companyId || undefined,
    companyName: r.company_name || r.companyName || undefined,
    userId: r.user_id || r.userId || undefined,
    password: r.password || undefined,
    dailyInterviewTarget: r.daily_interview_target ?? r.dailyInterviewTarget ?? 10,
    monthlyActiveJoiningTarget: r.monthly_active_joining_target ?? r.monthlyActiveJoiningTarget ?? 20,
    status: r.status || 'Active',
    avatar: r.avatar_url || r.avatar || undefined,
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export function jobOpeningToDb(j: any, validCompanyIds?: Set<string>) {
  if (!j) return null;
  const compId = j.companyId || j.company_id || null;
  return {
    id: j.id,
    title: j.jobTitle || j.title || 'Recruitment Opening',
    department: j.department || 'HR Recruitment',
    company_id: (validCompanyIds && compId && !validCompanyIds.has(compId)) ? null : compId,
    positions: j.vacancies ?? j.positions ?? 1,
    experience_min: j.experienceMin ?? j.experience_min ?? 0,
    experience_max: j.experienceMax ?? j.experience_max ?? 5,
    salary_min: j.salaryMin ?? j.salary_min ?? null,
    salary_max: j.salaryMax ?? j.salary_max ?? null,
    location: j.jobLocation || j.location || 'Head Office',
    job_type: j.jobType || j.job_type || 'Full-Time',
    description: j.description || `Job opening for ${j.jobTitle || j.title || 'role'}`,
    requirements: j.requirements || j.experience || null,
    status: j.status === 'Open' || j.status === 'Urgent' ? 'Active' : (j.status || 'Active'),
    posted_date: j.postedDate || j.posted_date || new Date().toISOString().split('T')[0],
    closing_date: j.hiringDeadline || j.closing_date || null,
    created_at: j.createdAt || j.created_at || new Date().toISOString(),
  };
}

export function jobOpeningFromDb(r: any): JobOpening {
  return {
    id: r.id,
    jobTitle: r.title || r.jobTitle || '',
    department: r.department || 'HR Recruitment',
    vacancies: r.positions ?? r.vacancies ?? 1,
    filledPositions: r.filled_positions ?? r.filledPositions ?? 0,
    salaryRange: r.salary_min ? `₹${r.salary_min} - ₹${r.salary_max || r.salary_min}` : (r.salaryRange || 'As per industry'),
    jobLocation: r.location || r.jobLocation || '',
    experience: r.requirements || `${r.experience_min || 0}-${r.experience_max || 5} yrs`,
    hrResponsible: r.hr_responsible || r.hrResponsible || 'Nandani',
    hiringDeadline: r.closing_date || r.hiringDeadline || '',
    status: r.status || 'Open',
  };
}

export function interviewToDb(i: any, validCandidateIds?: Set<string>) {
  if (!i) return null;
  const candId = i.candidateId || i.candidate_id || null;
  if (validCandidateIds && candId && !validCandidateIds.has(candId)) {
    return null;
  }
  return {
    id: i.id,
    candidate_id: candId,
    candidate_name: i.candidateName || i.candidate_name || '',
    candidate_phone: i.candidateMobile || i.candidate_phone || '',
    candidate_role: i.position || i.candidate_role || '',
    scheduled_date: i.interviewDate || i.scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: i.interviewTime || i.scheduled_time || '11:00',
    round: i.round || 'Round 1 (HR Screening)',
    interviewer_name: i.interviewer || i.interviewer_name || 'Vikram Singh',
    interviewer_role: i.interviewerRole || i.interviewer_role || 'Interviewer',
    status: i.attendanceStatus || i.status || 'Scheduled',
    attendance_status: i.attendanceStatus || i.attendance_status || 'Scheduled',
    evaluation: i.evaluation || null,
    notes: i.remarks || i.notes || '',
    created_at: i.createdAt || i.created_at || new Date().toISOString(),
  };
}

export function interviewFromDb(r: any): InterviewRecord {
  return {
    id: r.id,
    candidateId: r.candidate_id || r.candidateId || '',
    candidateName: r.candidate_name || r.candidateName || '',
    candidateMobile: r.candidate_phone || r.candidateMobile || '',
    position: r.candidate_role || r.position || '',
    department: r.department || 'HR Recruitment',
    hrExecutive: r.conducted_by || r.hrExecutive || 'Nandani',
    interviewer: r.interviewer_name || r.interviewer || 'Vikram Singh',
    interviewDate: r.scheduled_date || r.interviewDate || new Date().toISOString().split('T')[0],
    interviewTime: r.scheduled_time || r.interviewTime || '11:00',
    interviewMode: r.mode || r.interviewMode || 'Office Interview',
    interviewLocation: r.location || r.interviewLocation || 'Main Office',
    attendanceStatus: r.attendance_status || r.attendanceStatus || 'Scheduled',
    reminderSent: Boolean(r.reminder_sent ?? r.reminderSent),
    remarks: r.notes || r.remarks || undefined,
    evaluation: r.evaluation || undefined,
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export function followUpToDb(f: any, validCandidateIds?: Set<string>) {
  if (!f) return null;
  const candId = f.candidateId || f.candidate_id || null;
  if (validCandidateIds && candId && !validCandidateIds.has(candId)) {
    return null;
  }
  return {
    id: f.id,
    candidate_id: candId,
    scheduled_date: f.followUpDate || f.scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: f.followUpTime || f.scheduled_time || '11:00',
    type: f.followUpMode || f.type || 'Call',
    notes: f.candidateResponse || f.notes || '',
    completed: Boolean(f.isCompleted ?? f.completed),
    completed_date: f.completedDate || f.completed_date || null,
    conducted_by: f.hrExecutive || f.conducted_by || 'Nandani',
    outcome: f.resultingStatus || f.outcome || 'Follow-up',
    next_follow_up_date: f.nextFollowUpDate || f.next_follow_up_date || null,
    created_at: f.createdAt || f.created_at || new Date().toISOString(),
  };
}

export function followUpFromDb(r: any): FollowUpRecord {
  return {
    id: r.id,
    candidateId: r.candidate_id || r.candidateId || '',
    candidateName: r.candidate_name || r.candidateName || '',
    candidateMobile: r.candidate_phone || r.candidateMobile || '',
    position: r.position || '',
    hrExecutive: r.conducted_by || r.hrExecutive || 'Nandani',
    followUpDate: r.scheduled_date || r.followUpDate || new Date().toISOString().split('T')[0],
    followUpTime: r.scheduled_time || r.followUpTime || '11:00',
    followUpMode: r.type || r.followUpMode || 'Call',
    candidateResponse: r.notes || r.candidateResponse || '',
    notes: r.notes || '',
    nextFollowUpDate: r.next_follow_up_date || r.nextFollowUpDate || undefined,
    resultingStatus: r.outcome || r.resultingStatus || 'Follow-up',
    isCompleted: Boolean(r.completed ?? r.isCompleted),
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export function offerLetterToDb(o: any, validCandidateIds?: Set<string>, validCompanyIds?: Set<string>) {
  if (!o) return null;
  const candId = o.candidateId || o.candidate_id || null;
  const compId = o.companyId || o.company_id || null;
  return {
    id: o.id,
    candidate_id: (validCandidateIds && candId && !validCandidateIds.has(candId)) ? null : candId,
    candidate_name: o.candidateName || o.candidate_name || '',
    candidate_email: o.candidateEmail || o.candidate_email || '',
    candidate_phone: o.candidatePhone || o.candidate_phone || '',
    company_id: (validCompanyIds && compId && !validCompanyIds.has(compId)) ? null : compId,
    company_name: o.companyName || o.company_name || '',
    department: o.department || '',
    designation: o.designation || 'Staff',
    annual_ctc: o.annualCtc !== undefined && o.annualCtc !== null ? Number(o.annualCtc) : (o.annual_ctc ? Number(o.annual_ctc) : 0),
    monthly_gross: o.monthlyGross !== undefined && o.monthlyGross !== null ? Number(o.monthlyGross) : (o.monthly_gross ? Number(o.monthly_gross) : null),
    basic_salary: o.basicSalary !== undefined && o.basicSalary !== null ? Number(o.basicSalary) : null,
    hra: o.hra !== undefined && o.hra !== null ? Number(o.hra) : null,
    special_allowance: o.specialAllowance !== undefined && o.specialAllowance !== null ? Number(o.specialAllowance) : null,
    joining_date: o.joiningDate || o.joining_date || null,
    status: o.status || 'Draft',
    offer_date: o.offerDate || o.offer_date || new Date().toISOString().split('T')[0],
    validity_date: o.validityDate || o.validity_date || null,
    authorized_signatory_name: o.authorizedSignatoryName || o.authorized_signatory_name || 'HR Director',
    authorized_signatory_title: o.authorizedSignatoryTitle || o.authorized_signatory_title || 'Director',
    compensation_breakup: o.compensationBreakup || o.compensation_breakup || null,
    created_at: o.createdAt || o.created_at || new Date().toISOString(),
    updated_at: o.updatedAt || o.updated_at || new Date().toISOString(),
  };
}

export function offerLetterFromDb(r: any): OfferLetter {
  return {
    id: r.id,
    candidateId: r.candidate_id || r.candidateId || undefined,
    candidateName: r.candidate_name || r.candidateName || '',
    candidateEmail: r.candidate_email || r.candidateEmail || '',
    candidatePhone: r.candidate_phone || r.candidatePhone || '',
    companyId: r.company_id || r.companyId || '',
    companyName: r.company_name || r.companyName || '',
    companyAddress: r.company_address || r.companyAddress || '',
    department: r.department || '',
    designation: r.designation || '',
    employmentType: r.employment_type || r.employmentType || 'Full-Time',
    workLocation: r.work_location || r.workLocation || '',
    reportingManager: r.reporting_manager || r.reportingManager || '',
    offerDate: r.offer_date || r.offerDate || new Date().toISOString().split('T')[0],
    joiningDate: r.joining_date || r.joiningDate || '',
    validityDate: r.validity_date || r.validityDate || '',
    annualCtc: Number(r.annual_ctc || r.annualCtc || 0),
    monthlyGross: Number(r.monthly_gross || r.monthlyGross || 0),
    basicSalary: Number(r.basic_salary || r.basicSalary || 0),
    hra: Number(r.hra || 0),
    specialAllowance: Number(r.special_allowance || r.specialAllowance || 0),
    monthlyInHand: Number(r.monthly_in_hand || r.monthlyInHand || r.monthly_gross || 0),
    probationMonths: Number(r.probation_months || r.probationMonths || 3),
    noticePeriodDays: Number(r.notice_period_days || r.noticePeriodDays || 30),
    status: r.status || 'Draft',
    authorizedSignatoryName: r.authorized_signatory_name || r.authorizedSignatoryName || 'HR Director',
    authorizedSignatoryTitle: r.authorized_signatory_title || r.authorizedSignatoryTitle || 'Director',
    compensationBreakup: r.compensation_breakup || r.compensationBreakup || undefined,
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
  };
}

export function targetSettingToDb(t: any) {
  if (!t) return null;
  return {
    id: t.id,
    role: t.targetEntityName || t.role || t.metric || 'HR Executive',
    department: t.department || 'HR Recruitment',
    company_id: t.companyId || t.company_id || null,
    daily_interviews: t.targetValue !== undefined ? Number(t.targetValue) : (t.daily_interviews ?? 8),
    monthly_active_joinings: t.minimumBenchmark !== undefined ? Number(t.minimumBenchmark) : (t.monthly_active_joinings ?? 15),
    min_calling_per_day: t.minCallingPerDay !== undefined ? Number(t.minCallingPerDay) : (t.min_calling_per_day ?? 60),
    updated_at: t.updatedAt || t.updated_at || new Date().toISOString(),
  };
}

export function targetSettingFromDb(r: any): TargetSetting {
  return {
    id: r.id,
    targetType: r.target_type || r.targetType || 'HR Executive',
    targetEntityId: r.company_id || r.targetEntityId || r.id,
    targetEntityName: r.role || r.targetEntityName || 'Target Benchmark',
    period: r.period || 'Daily',
    metric: r.metric || 'Interviews Conducted',
    targetValue: r.daily_interviews ?? r.targetValue ?? 8,
    minimumBenchmark: r.monthly_active_joinings ?? r.minimumBenchmark ?? 15,
    updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
    updatedBy: r.updated_by || r.updatedBy || 'Admin',
  };
}

export function termsClauseToDb(tc: any) {
  if (!tc) return null;
  return {
    id: tc.id,
    clause_number: tc.clauseNumber || tc.clause_number || '1',
    category: tc.category || 'Code of Conduct',
    title: tc.title || '',
    content: tc.content || '',
    is_mandatory_in_offer: Boolean(tc.isMandatoryInOffer ?? tc.is_mandatory_in_offer ?? true),
    is_active: Boolean(tc.isActive ?? tc.is_active ?? true),
    updated_at: tc.updatedAt || tc.updated_at || new Date().toISOString(),
  };
}

export function termsClauseFromDb(r: any): TermsClause {
  return {
    id: r.id,
    clauseNumber: r.clause_number || r.clauseNumber || '1',
    category: r.category || 'Code of Conduct',
    title: r.title || '',
    content: r.content || '',
    isMandatoryInOffer: Boolean(r.is_mandatory_in_offer ?? r.isMandatoryInOffer ?? true),
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
    updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
    updatedBy: r.updated_by || r.updatedBy || 'Admin',
  };
}

export function auditLogToDb(a: any) {
  if (!a) return null;
  return {
    id: a.id,
    timestamp: a.timestamp || new Date().toISOString(),
    user_id: a.performedBy || a.user_id || 'System',
    user_name: a.performedBy || a.user_name || 'System Admin',
    user_role: a.userRole || a.user_role || 'Admin',
    action: a.action || 'Updated',
    entity_type: a.entityType || a.entity_type || 'Candidate',
    entity_id: a.candidateId || a.entity_id || '',
    details: a.details || a.candidateName || null,
    ip_address: a.ipAddress || a.ip_address || '127.0.0.1',
  };
}

export function auditLogFromDb(r: any): AuditLogEntry {
  return {
    id: r.id,
    candidateId: r.entity_id || r.candidateId || '',
    candidateName: r.details || r.candidateName || 'Candidate',
    action: r.action || 'Created',
    performedBy: r.user_name || r.performedBy || 'System',
    timestamp: r.timestamp || new Date().toISOString(),
    details: r.details || undefined,
  };
}

// =========================================================================
// CONFIGURATION & HEALTH CHECKS
// =========================================================================

export async function updateSupabaseServerConfig(url: string, key: string): Promise<{
  success: boolean;
  isConnected: boolean;
  hasTablesCreated?: boolean;
  projectId?: string;
  supabaseUrl?: string;
  apiUrl?: string;
  maskedKey?: string;
  latencyMs?: number;
  message?: string;
  error?: string;
}> {
  // Always save in browser localStorage first so Vercel client operations persist credentials!
  setSupabaseConfigOverride(url, key);

  // 1. Try server-side config update (for container / Express setups)
  try {
    const res = await fetch('/api/supabase/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Expected on Vercel (static deployment)
  }

  // 2. Direct browser test on Vercel
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      isConnected: false,
      error: 'Please provide a valid Supabase Project URL and API Key.',
    };
  }

  const startTime = Date.now();
  const cleanUrl = getSupabaseUrl();
  const activeKey = getSupabaseAnonKey();
  const maskedKey = activeKey.length > 8 ? `${activeKey.slice(0, 4)}...${activeKey.slice(-4)}` : '****';

  try {
    const { data: testData, error: tableError } = await client
      .from('candidates')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (!tableError) {
      return {
        success: true,
        isConnected: true,
        hasTablesCreated: true,
        projectId: extractProjectId(cleanUrl),
        supabaseUrl: cleanUrl,
        apiUrl: `${cleanUrl}/rest/v1/`,
        maskedKey,
        latencyMs,
        message: `Connected to Supabase! PostgreSQL database tables are active and ready for sync (latency: ${latencyMs}ms).`,
      };
    }

    const tableErrMsg = ((tableError.message || '') + ' ' + (tableError.details || '') + ' ' + (tableError.hint || '')).toLowerCase();
    const isMissingTable =
      tableError.code === '42P01' ||
      tableError.code === 'PGRST205' ||
      tableError.code === 'PGRST204' ||
      tableError.code === 'PGRST200' ||
      tableErrMsg.includes('schema cache') ||
      tableErrMsg.includes('not find the table') ||
      tableErrMsg.includes('does not exist') ||
      tableErrMsg.includes('relation');

    if (isMissingTable) {
      return {
        success: true,
        isConnected: true,
        hasTablesCreated: false,
        projectId: extractProjectId(cleanUrl),
        supabaseUrl: cleanUrl,
        apiUrl: `${cleanUrl}/rest/v1/`,
        maskedKey,
        latencyMs,
        message: 'Connected to Supabase REST API! (Database online · Next step: create tables using the SQL Schema script in Supabase SQL Editor).',
      };
    }

    const isAuth =
      tableErrMsg.includes('jwt') ||
      tableErrMsg.includes('apikey') ||
      tableErrMsg.includes('api key') ||
      tableErrMsg.includes('unregistered') ||
      tableErrMsg.includes('unauthorized') ||
      tableErrMsg.includes('invalid api key') ||
      tableError.code === 'PGRST301' ||
      tableError.code === '401' ||
      tableError.code === '403';

    if (isAuth) {
      const isUnregistered = tableErrMsg.includes('unregistered') || tableErrMsg.includes('invalid api key');
      return {
        success: false,
        isConnected: false,
        error: isUnregistered
          ? `Unregistered API key: The provided API key is not registered for Supabase project "${extractProjectId(cleanUrl)}". Please ensure both your Project URL and anon public key match your Supabase project in Project Settings > API.`
          : `Supabase authentication failed: ${tableError.message}. Please check your anon public key.`,
      };
    }

    return {
      success: true,
      isConnected: true,
      hasTablesCreated: false,
      projectId: extractProjectId(cleanUrl),
      supabaseUrl: cleanUrl,
      apiUrl: `${cleanUrl}/rest/v1/`,
      maskedKey,
      latencyMs,
      message: `Connected to Supabase: ${tableError.message || tableError.details || 'Connection verified'}`,
    };
  } catch (err: any) {
    return {
      success: false,
      isConnected: false,
      error: err?.message || 'Network error connecting to Supabase from browser',
    };
  }
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  const startTime = Date.now();
  const currentUrl = getSupabaseUrl();
  const currentProjId = extractProjectId(currentUrl);
  const currentApiUrl = `${currentUrl}/rest/v1/`;

  // 1. Try server-side API status (if running fullstack container)
  try {
    const res = await fetch('/api/supabase/status');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const serverStatus = await res.json();
      if (serverStatus && serverStatus.isConfigured !== undefined) {
        return {
          isConfigured: serverStatus.isConfigured,
          isConnected: serverStatus.isConnected,
          hasAnonKey: true,
          hasTablesCreated: serverStatus.hasTablesCreated,
          projectId: serverStatus.projectId || currentProjId,
          apiUrl: serverStatus.apiUrl || currentApiUrl,
          supabaseUrl: serverStatus.supabaseUrl || currentUrl,
          maskedKey: serverStatus.maskedKey,
          latencyMs: serverStatus.latencyMs ?? (Date.now() - startTime),
          error: serverStatus.error,
          errorCode: serverStatus.errorCode,
          candidateCount: serverStatus.candidateCount,
        };
      }
    }
  } catch {
    // Expected on Vercel static deployment
  }

  // 2. Direct browser check
  const anonKey = getSupabaseAnonKey();
  if (!anonKey) {
    return {
      isConfigured: false,
      isConnected: false,
      hasAnonKey: false,
      projectId: currentProjId,
      apiUrl: currentApiUrl,
      supabaseUrl: currentUrl,
      error: 'Supabase API Key is not configured. Please enter your project anon key.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      isConfigured: false,
      isConnected: false,
      hasAnonKey: true,
      projectId: currentProjId,
      apiUrl: currentApiUrl,
      supabaseUrl: currentUrl,
      error: 'Failed to initialize Supabase client instance in browser.',
    };
  }

  const maskedKey = anonKey.length > 8 ? `${anonKey.slice(0, 4)}...${anonKey.slice(-4)}` : '****';

  try {
    const { data: testData, error } = await client
      .from('candidates')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      const errMsg = ((error.message || '') + ' ' + (error.details || '') + ' ' + (error.hint || '')).toLowerCase();
      const isTableMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST200' ||
        errMsg.includes('schema cache') ||
        errMsg.includes('not find the table') ||
        errMsg.includes('does not exist') ||
        errMsg.includes('relation');

      if (isTableMissing) {
        return {
          isConfigured: true,
          isConnected: true,
          hasAnonKey: true,
          hasTablesCreated: false,
          projectId: currentProjId,
          apiUrl: currentApiUrl,
          supabaseUrl: currentUrl,
          maskedKey,
          latencyMs: latency,
          error: 'Connected to Supabase! The database tables have not been created yet in PostgreSQL. Please run the SQL schema script in Supabase SQL Editor.',
          tableStatus: {
            candidates: { exists: false, error: error.message },
          },
        };
      }

      const isAuthError =
        errMsg.includes('jwt') ||
        errMsg.includes('apikey') ||
        errMsg.includes('api key') ||
        errMsg.includes('unregistered') ||
        errMsg.includes('unauthorized') ||
        errMsg.includes('invalid api key') ||
        error.code === 'PGRST301' ||
        error.code === '401' ||
        error.code === '403';

      const isUnregistered = errMsg.includes('unregistered') || errMsg.includes('invalid api key');

      return {
        isConfigured: true,
        isConnected: !isAuthError,
        hasAnonKey: true,
        hasTablesCreated: false,
        projectId: currentProjId,
        apiUrl: currentApiUrl,
        supabaseUrl: currentUrl,
        maskedKey,
        latencyMs: latency,
        errorCode: isUnregistered ? 'UNREGISTERED_API_KEY' : (isAuthError ? 'AUTH_ERROR' : error.code),
        error: isUnregistered
          ? `Unregistered API key: The API key provided is not registered for Supabase project "${currentProjId}". Please make sure your Supabase Project URL (${currentUrl}) and Anon API Key are from the same Supabase project.`
          : (error.message || error.details || 'Error querying Supabase API'),
      };
    }

    let candidateCount = testData ? testData.length : 0;
    try {
      const { count: exactCount } = await client.from('candidates').select('*', { count: 'exact', head: true });
      if (exactCount !== null && exactCount !== undefined) candidateCount = exactCount;
    } catch {}

    return {
      isConfigured: true,
      isConnected: true,
      hasAnonKey: true,
      hasTablesCreated: true,
      projectId: currentProjId,
      apiUrl: currentApiUrl,
      supabaseUrl: currentUrl,
      maskedKey,
      latencyMs: latency,
      candidateCount,
      tableStatus: {
        candidates: { exists: true, count: candidateCount },
      },
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      hasAnonKey: true,
      projectId: currentProjId,
      apiUrl: currentApiUrl,
      supabaseUrl: currentUrl,
      maskedKey,
      error: err?.message || 'Network error connecting to Supabase from browser',
    };
  }
}

// =========================================================================
// DATASET SYNCHRONIZATION (BULK UPSERTS)
// =========================================================================

export async function syncDatasetToSupabase(payload: {
  companies: Company[];
  departments: DepartmentItem[];
  users: UserProfile[];
  candidates: Candidate[];
  jobOpenings: JobOpening[];
  interviews: InterviewRecord[];
  followUps: FollowUpRecord[];
  offerLetters: OfferLetter[];
  targetSettings: TargetSetting[];
  termsClauses: TermsClause[];
  auditLogs?: AuditLogEntry[];
}): Promise<{
  success: boolean;
  syncedCounts: Record<string, number>;
  errors: string[];
}> {
  // 1. Try server-side secure sync first (for Express/Node environment)
  try {
    const res = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.success !== undefined) {
        return {
          success: data.success,
          syncedCounts: data.syncedCounts || {},
          errors: data.errors || [],
        };
      }
    }
  } catch {
    // Expected on Vercel deployment -> Proceed directly with client-side execution
  }

  // 2. Client-side execution (Works seamlessly on Vercel!)
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCounts: {},
      errors: ['Supabase client is not configured. Please enter your Project URL and Anon Key in Database Master.'],
    };
  }

  const syncedCounts: Record<string, number> = {};
  const errors: string[] = [];

  // Track valid IDs for relational integrity
  const validCompanyIds = new Set<string>();
  const validCandidateIds = new Set<string>();

  // Chunked batch upsert helper
  async function upsertInChunks(tableName: string, rows: any[], chunkSize: number = 50) {
    if (!rows || rows.length === 0) return;
    try {
      for (let i = 0; i < rows.length; i += chunkSize) {
        const batch = rows.slice(i, i + chunkSize);
        const { error } = await client!.from(tableName).upsert(batch, { onConflict: 'id' });
        if (error) {
          errors.push(`${tableName}: ${error.message}`);
          return; // Stop further chunks for this table if error occurs
        }
      }
      syncedCounts[tableName] = rows.length;
    } catch (e: any) {
      errors.push(`${tableName}: ${e?.message || 'Unknown upsert error'}`);
    }
  }

  // 1. Companies first (so children can reference company_id)
  const dbCompanies = (payload.companies || []).map(companyToDb).filter(Boolean);
  dbCompanies.forEach((c: any) => { if (c?.id) validCompanyIds.add(c.id); });
  await upsertInChunks('companies', dbCompanies);

  // 2. Departments
  const dbDepartments = (payload.departments || []).map((d) => departmentToDb(d, validCompanyIds)).filter(Boolean);
  await upsertInChunks('departments', dbDepartments);

  // 3. Users
  const dbUsers = (payload.users || []).map((u) => userToDb(u, validCompanyIds)).filter(Boolean);
  await upsertInChunks('users', dbUsers);

  // 4. Candidates (core ATS table)
  const dbCandidates = (payload.candidates || []).map(candidateToDb).filter(Boolean);
  dbCandidates.forEach((c: any) => { if (c?.id) validCandidateIds.add(c.id); });
  await upsertInChunks('candidates', dbCandidates);

  // 5. Job Openings
  const dbJobOpenings = (payload.jobOpenings || []).map((j) => jobOpeningToDb(j, validCompanyIds)).filter(Boolean);
  await upsertInChunks('job_openings', dbJobOpenings);

  // 6. Interviews (references candidates)
  const dbInterviews = (payload.interviews || []).map((i) => interviewToDb(i, validCandidateIds)).filter(Boolean);
  await upsertInChunks('interviews', dbInterviews);

  // 7. Follow-ups (references candidates)
  const dbFollowUps = (payload.followUps || []).map((f) => followUpToDb(f, validCandidateIds)).filter(Boolean);
  await upsertInChunks('follow_ups', dbFollowUps);

  // 8. Offer Letters (references candidates & companies)
  const dbOfferLetters = (payload.offerLetters || []).map((o) => offerLetterToDb(o, validCandidateIds, validCompanyIds)).filter(Boolean);
  await upsertInChunks('offer_letters', dbOfferLetters);

  // 9. Target Settings
  const dbTargetSettings = (payload.targetSettings || []).map(targetSettingToDb).filter(Boolean);
  await upsertInChunks('target_settings', dbTargetSettings);

  // 10. Terms Clauses
  const dbTermsClauses = (payload.termsClauses || []).map(termsClauseToDb).filter(Boolean);
  await upsertInChunks('terms_clauses', dbTermsClauses);

  // 11. Audit Logs (recent 100 entries)
  if (payload.auditLogs && payload.auditLogs.length > 0) {
    const dbAuditLogs = payload.auditLogs.slice(0, 100).map(auditLogToDb).filter(Boolean);
    await upsertInChunks('audit_logs', dbAuditLogs);
  }

  return {
    success: errors.length === 0,
    syncedCounts,
    errors,
  };
}

// =========================================================================
// FETCH DATASET FROM SUPABASE
// =========================================================================

export async function fetchDatasetFromSupabase(): Promise<{
  success: boolean;
  data?: {
    companies?: Company[];
    departments?: DepartmentItem[];
    users?: UserProfile[];
    candidates?: Candidate[];
    jobOpenings?: JobOpening[];
    interviews?: InterviewRecord[];
    followUps?: FollowUpRecord[];
    offerLetters?: OfferLetter[];
    targetSettings?: TargetSetting[];
    termsClauses?: TermsClause[];
  };
  error?: string;
}> {
  // 1. Try server-side proxy first
  try {
    const res = await fetch('/api/supabase/data');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json.success && json.data) {
        return { success: true, data: json.data };
      }
    }
  } catch {
    // Expected on Vercel deployment
  }

  // 2. Direct browser fetch
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase client is not configured on client or server.',
    };
  }

  try {
    const [
      { data: rawCompanies },
      { data: rawDepartments },
      { data: rawUsers },
      { data: rawCandidates },
      { data: rawJobOpenings },
      { data: rawInterviews },
      { data: rawFollowUps },
      { data: rawOfferLetters },
      { data: rawTargetSettings },
      { data: rawTermsClauses },
    ] = await Promise.all([
      client.from('companies').select('*'),
      client.from('departments').select('*'),
      client.from('users').select('*'),
      client.from('candidates').select('*'),
      client.from('job_openings').select('*'),
      client.from('interviews').select('*'),
      client.from('follow_ups').select('*'),
      client.from('offer_letters').select('*'),
      client.from('target_settings').select('*'),
      client.from('terms_clauses').select('*'),
    ]);

    return {
      success: true,
      data: {
        companies: rawCompanies ? rawCompanies.map(companyFromDb) : undefined,
        departments: rawDepartments ? rawDepartments.map(departmentFromDb) : undefined,
        users: rawUsers ? rawUsers.map(userFromDb) : undefined,
        candidates: rawCandidates ? rawCandidates.map(candidateFromDb) : undefined,
        jobOpenings: rawJobOpenings ? rawJobOpenings.map(jobOpeningFromDb) : undefined,
        interviews: rawInterviews ? rawInterviews.map(interviewFromDb) : undefined,
        followUps: rawFollowUps ? rawFollowUps.map(followUpFromDb) : undefined,
        offerLetters: rawOfferLetters ? rawOfferLetters.map(offerLetterFromDb) : undefined,
        targetSettings: rawTargetSettings ? rawTargetSettings.map(targetSettingFromDb) : undefined,
        termsClauses: rawTermsClauses ? rawTermsClauses.map(termsClauseFromDb) : undefined,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to fetch data from Supabase',
    };
  }
}

// =========================================================================
// REAL-TIME DIRECT CANDIDATE ACTIONS (Single & Batch Push)
// =========================================================================

export async function pushCandidateToSupabase(candidate: Candidate): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not initialized' };

  try {
    const dbRow = candidateToDb(candidate);
    if (!dbRow) return { success: false, error: 'Invalid candidate data' };

    const { error } = await client.from('candidates').upsert(dbRow, { onConflict: 'id' });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to push candidate' };
  }
}

export async function pushCandidatesBatchToSupabase(candidates: Candidate[]): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client || candidates.length === 0) return { success: false, count: 0, error: 'Supabase client not initialized' };

  try {
    const dbRows = candidates.map(candidateToDb).filter(Boolean);
    const chunkSize = 50;
    for (let i = 0; i < dbRows.length; i += chunkSize) {
      const batch = dbRows.slice(i, i + chunkSize);
      const { error } = await client.from('candidates').upsert(batch, { onConflict: 'id' });
      if (error) {
        return { success: false, count: i, error: error.message };
      }
    }
    return { success: true, count: dbRows.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'Failed to push candidates batch' };
  }
}

export async function deleteCandidateFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not initialized' };

  try {
    const { error } = await client.from('candidates').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to delete candidate' };
  }
}

/**
 * Complete PostgreSQL DDL Script for Supabase SQL Editor
 */
export const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- ESSENTIAL SOUL RECRUITMENT CRM - SUPABASE POSTGRESQL SCHEMA DDL
-- Project ID: snvgarluywefmlsimikf
-- Base API: https://snvgarluywefmlsimikf.supabase.co/rest/v1/
-- Generated for: Essential Soul Lifestyle Pvt Ltd
-- =========================================================================

-- 1. COMPANIES (Multiple Company Master & Credentials)
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  legal_name TEXT,
  cin TEXT,
  gstin TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  website TEXT,
  departments JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  admin_user_id TEXT,
  admin_password TEXT,
  master_contact_person TEXT,
  last_password_changed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS (Department Master)
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  head_of_department TEXT,
  target_hires INTEGER DEFAULT 0,
  current_employees INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS (Staff Credentials & Roles)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name TEXT,
  user_id TEXT UNIQUE,
  password TEXT,
  daily_interview_target INTEGER DEFAULT 10,
  monthly_active_joining_target INTEGER DEFAULT 20,
  status TEXT DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CANDIDATES (Recruitment Master & ATS Lifecycle)
CREATE TABLE IF NOT EXISTS public.candidates (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  whatsapp_number TEXT,
  gender TEXT,
  age INTEGER,
  date_of_birth DATE,
  email TEXT,
  city TEXT,
  area TEXT,
  address TEXT,
  position_applied TEXT NOT NULL,
  department TEXT NOT NULL,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name TEXT,
  qualification TEXT,
  total_experience TEXT,
  relevant_experience TEXT,
  current_company TEXT,
  current_salary NUMERIC,
  expected_salary NUMERIC,
  salary_offered NUMERIC,
  notice_period TEXT,
  preferred_location TEXT,
  candidate_source TEXT NOT NULL,
  assigned_hr TEXT,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'New Lead',
  is_active_joining BOOLEAN DEFAULT false,
  active_joining_date DATE,
  joining_date DATE,
  interview_date DATE,
  offer_letter_issued BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  first_call_date TIMESTAMPTZ,
  last_activity_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JOB OPENINGS (Vacancies & Requisitions)
CREATE TABLE IF NOT EXISTS public.job_openings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  positions INTEGER DEFAULT 1,
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER DEFAULT 5,
  salary_min NUMERIC,
  salary_max NUMERIC,
  location TEXT,
  job_type TEXT DEFAULT 'Full-Time',
  description TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'Active',
  posted_date DATE DEFAULT CURRENT_DATE,
  closing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INTERVIEWS (Interview Schedules & Feedback)
CREATE TABLE IF NOT EXISTS public.interviews (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES public.candidates(id) ON DELETE CASCADE,
  candidate_name TEXT,
  candidate_phone TEXT,
  candidate_role TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT,
  round TEXT DEFAULT 'Round 1 (HR Screening)',
  interviewer_name TEXT,
  interviewer_role TEXT,
  status TEXT DEFAULT 'Scheduled',
  attendance_status TEXT DEFAULT 'Scheduled',
  evaluation JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FOLLOW-UPS (Caller Queues & Reminders)
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES public.candidates(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT,
  type TEXT DEFAULT 'Call',
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMPTZ,
  conducted_by TEXT,
  outcome TEXT,
  next_follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OFFER LETTERS & CTC
CREATE TABLE IF NOT EXISTS public.offer_letters (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES public.candidates(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  candidate_phone TEXT,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name TEXT,
  department TEXT,
  designation TEXT NOT NULL,
  annual_ctc NUMERIC NOT NULL,
  monthly_gross NUMERIC,
  basic_salary NUMERIC,
  hra NUMERIC,
  special_allowance NUMERIC,
  joining_date DATE,
  status TEXT DEFAULT 'Draft',
  offer_date DATE DEFAULT CURRENT_DATE,
  validity_date DATE,
  authorized_signatory_name TEXT,
  authorized_signatory_title TEXT,
  compensation_breakup JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TARGET SETTINGS
CREATE TABLE IF NOT EXISTS public.target_settings (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  department TEXT,
  company_id TEXT,
  daily_interviews INTEGER DEFAULT 8,
  monthly_active_joinings INTEGER DEFAULT 15,
  min_calling_per_day INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TERMS & CLAUSES
CREATE TABLE IF NOT EXISTS public.terms_clauses (
  id TEXT PRIMARY KEY,
  clause_number TEXT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_mandatory_in_offer BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT
);

-- =========================================================================
-- SAFE SCHEMA UPGRADE: ENSURE ALL COLUMNS EXIST IF TABLES PREVIOUSLY CREATED
-- =========================================================================
DO $$
BEGIN
  -- Companies
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS admin_password TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS admin_user_id TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS master_contact_person TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS last_password_changed TEXT;

  -- Departments
  ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS company_id TEXT;
  ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS head_of_department TEXT;
  ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS target_hires INTEGER DEFAULT 0;
  ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS current_employees INTEGER DEFAULT 0;

  -- Users
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_id TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_interview_target INTEGER DEFAULT 10;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_active_joining_target INTEGER DEFAULT 20;

  -- Job Openings
  ALTER TABLE public.job_openings ADD COLUMN IF NOT EXISTS company_id TEXT;

  -- Offer Letters
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS candidate_id TEXT;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS company_id TEXT;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS annual_ctc NUMERIC DEFAULT 0;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS monthly_gross NUMERIC;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS basic_salary NUMERIC;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS hra NUMERIC;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS special_allowance NUMERIC;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS authorized_signatory_name TEXT;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS authorized_signatory_title TEXT;
  ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS compensation_breakup JSONB;

  -- Target Settings
  ALTER TABLE public.target_settings ADD COLUMN IF NOT EXISTS role TEXT;
  ALTER TABLE public.target_settings ADD COLUMN IF NOT EXISTS department TEXT;
  ALTER TABLE public.target_settings ADD COLUMN IF NOT EXISTS company_id TEXT;
  ALTER TABLE public.target_settings ADD COLUMN IF NOT EXISTS daily_interviews INTEGER DEFAULT 8;
  ALTER TABLE public.target_settings ADD COLUMN IF NOT EXISTS monthly_active_joinings INTEGER DEFAULT 15;
  ALTER TABLE public.target_settings ADD COLUMN IF NOT EXISTS min_calling_per_day INTEGER DEFAULT 60;

  -- Terms Clauses
  ALTER TABLE public.terms_clauses ADD COLUMN IF NOT EXISTS clause_number TEXT;
  ALTER TABLE public.terms_clauses ADD COLUMN IF NOT EXISTS is_mandatory_in_offer BOOLEAN DEFAULT true;

  -- Audit Logs
  ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT;
  ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
EXCEPTION WHEN OTHERS THEN
  -- Ignored if column already exists
END $$;

-- =========================================================================
-- CREATE HIGH-PERFORMANCE INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_mobile ON public.candidates(mobile_number);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_dept ON public.candidates(department);
CREATE INDEX IF NOT EXISTS idx_candidates_company ON public.candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_code ON public.companies(code);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON public.interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followups_date ON public.follow_ups(scheduled_date, completed);

-- =========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) WITH ACCESS POLICIES
-- =========================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create Open / Authenticated Policies for seamless CRM access
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'companies', 'departments', 'users', 'candidates', 
    'job_openings', 'interviews', 'follow_ups', 
    'offer_letters', 'target_settings', 'terms_clauses', 'audit_logs'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow All CRM Ops" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Allow All CRM Ops" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- Reload Supabase PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
`;
