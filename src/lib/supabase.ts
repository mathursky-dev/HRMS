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

export const SUPABASE_URL = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
export const SUPABASE_PROJECT_ID = extractProjectId(SUPABASE_URL);
export const SUPABASE_REST_API = `${SUPABASE_URL}/rest/v1/`;

const LOCAL_STORAGE_ANON_KEY = 'esl_supabase_anon_key_override';

export function getSupabaseAnonKey(): string {
  // Check Vite environment variable first
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    let clean = envKey.trim().replace(/^["']|["']$/g, '').replace(/^[A-Z0-9_]+=\s*/i, '').trim();
    if (clean.includes(' ')) {
      const tokens = clean.split(/\s+/);
      const jwt = tokens.find(t => t.includes('eyJ'));
      if (jwt) clean = jwt.replace(/^[A-Z0-9_]+=\s*/i, '');
    }
    return clean;
  }
  // Check localStorage fallback if configured
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ANON_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (e) {
    // Ignore localStorage access errors
  }
  return '';
}

export function setSupabaseAnonKeyOverride(key: string) {
  try {
    if (key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_ANON_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
    }
    // Invalidate client instance so next call re-instantiates
    clientInstance = null;
  } catch (e) {
    console.error('Failed to save Supabase key override', e);
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const anonKey = getSupabaseAnonKey();
  if (!anonKey || !SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(SUPABASE_URL, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
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
  try {
    const res = await fetch('/api/supabase/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      isConnected: false,
      error: err?.message || 'Failed to connect to backend server',
    };
  }
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  const startTime = Date.now();

  // 1. Try server-side API proxy first (using backend authenticated secret key)
  try {
    const res = await fetch('/api/supabase/status');
    if (res.ok) {
      const serverStatus = await res.json();
      return {
        isConfigured: serverStatus.isConfigured,
        isConnected: serverStatus.isConnected,
        hasAnonKey: true,
        hasTablesCreated: serverStatus.hasTablesCreated,
        projectId: serverStatus.projectId || SUPABASE_PROJECT_ID,
        apiUrl: serverStatus.apiUrl || SUPABASE_REST_API,
        supabaseUrl: serverStatus.supabaseUrl || SUPABASE_URL,
        maskedKey: serverStatus.maskedKey,
        latencyMs: serverStatus.latencyMs ?? (Date.now() - startTime),
        error: serverStatus.error,
        errorCode: serverStatus.errorCode,
        candidateCount: serverStatus.candidateCount,
      };
    }
  } catch {
    // Fall back to direct client check
  }

  const anonKey = getSupabaseAnonKey();

  if (!anonKey) {
    return {
      isConfigured: false,
      isConnected: false,
      hasAnonKey: false,
      projectId: SUPABASE_PROJECT_ID,
      apiUrl: SUPABASE_REST_API,
      error: 'Supabase API is configured on server. For direct browser connection, configure VITE_SUPABASE_ANON_KEY.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      isConfigured: false,
      isConnected: false,
      hasAnonKey: true,
      projectId: SUPABASE_PROJECT_ID,
      apiUrl: SUPABASE_REST_API,
      error: 'Failed to initialize Supabase client instance',
    };
  }

  try {
    // Probe candidates or companies table
    const { count, error } = await client
      .from('candidates')
      .select('*', { count: 'exact', head: true });

    const latency = Date.now() - startTime;

    if (error) {
      // If table does not exist (relation does not exist code 42P01 or PGRST200 or PGRST205)
      const isTableMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.includes('relation') ||
        error.message?.includes('does not exist') ||
        error.code === 'PGRST200';

      if (isTableMissing) {
        return {
          isConfigured: true,
          isConnected: true,
          hasAnonKey: true,
          hasTablesCreated: false,
          projectId: SUPABASE_PROJECT_ID,
          apiUrl: SUPABASE_REST_API,
          latencyMs: latency,
          error: 'Connected to Supabase! The database tables have not been created yet in PostgreSQL. Please run the SQL schema script in Supabase SQL Editor.',
          tableStatus: {
            candidates: { exists: false, error: error.message },
          },
        };
      }

      return {
        isConfigured: true,
        isConnected: false,
        hasAnonKey: true,
        projectId: SUPABASE_PROJECT_ID,
        apiUrl: SUPABASE_REST_API,
        latencyMs: latency,
        error: error.message || 'Error querying Supabase API',
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      hasAnonKey: true,
      hasTablesCreated: true,
      projectId: SUPABASE_PROJECT_ID,
      apiUrl: SUPABASE_REST_API,
      latencyMs: latency,
      candidateCount: count || 0,
      tableStatus: {
        candidates: { exists: true, count: count || 0 },
      },
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      hasAnonKey: true,
      projectId: SUPABASE_PROJECT_ID,
      apiUrl: SUPABASE_REST_API,
      error: err?.message || 'Network error connecting to Supabase',
    };
  }
}

/**
 * Synchronize full CRM dataset into Supabase tables via bulk upserts
 */
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
  // 1. Try server-side secure sync first
  try {
    const res = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success,
        syncedCounts: data.syncedCounts || {},
        errors: data.errors || [],
      };
    }
  } catch {
    // Fall back to client-side execution
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCounts: {},
      errors: ['Supabase client is not configured on client or server.'],
    };
  }

  const syncedCounts: Record<string, number> = {};
  const errors: string[] = [];

  // Helper to upsert a table safely
  async function upsertTable(tableName: string, rows: any[]) {
    if (!rows || rows.length === 0) return;
    try {
      const { error } = await client!.from(tableName).upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`${tableName}: ${error.message}`);
      } else {
        syncedCounts[tableName] = rows.length;
      }
    } catch (e: any) {
      errors.push(`${tableName}: ${e?.message || 'Unknown upsert error'}`);
    }
  }

  // Sync core entities
  await upsertTable('companies', payload.companies);
  await upsertTable('departments', payload.departments);
  await upsertTable('users', payload.users);
  await upsertTable('candidates', payload.candidates);
  await upsertTable('job_openings', payload.jobOpenings);
  await upsertTable('interviews', payload.interviews);
  await upsertTable('follow_ups', payload.followUps);
  await upsertTable('offer_letters', payload.offerLetters);
  await upsertTable('target_settings', payload.targetSettings);
  await upsertTable('terms_clauses', payload.termsClauses);
  if (payload.auditLogs && payload.auditLogs.length > 0) {
    await upsertTable('audit_logs', payload.auditLogs.slice(0, 100));
  }

  return {
    success: errors.length === 0,
    syncedCounts,
    errors,
  };
}

/**
 * Fetch dataset from Supabase tables
 */
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
  // 1. Try server-side secure fetch first
  try {
    const res = await fetch('/api/supabase/data');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { success: true, data: json.data };
      }
    }
  } catch {
    // Fall back to client
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase client is not configured.',
    };
  }

  try {
    const [
      { data: companies },
      { data: departments },
      { data: users },
      { data: candidates },
      { data: jobOpenings },
      { data: interviews },
      { data: followUps },
      { data: offerLetters },
      { data: targetSettings },
      { data: termsClauses },
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
        companies: companies || undefined,
        departments: departments || undefined,
        users: users || undefined,
        candidates: candidates || undefined,
        jobOpenings: jobOpenings || undefined,
        interviews: interviews || undefined,
        followUps: followUps || undefined,
        offerLetters: offerLetters || undefined,
        targetSettings: targetSettings || undefined,
        termsClauses: termsClauses || undefined,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to fetch data from Supabase',
    };
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
`;
