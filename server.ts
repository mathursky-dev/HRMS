import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const PORT = 3000;
const CONFIG_FILE = path.join(process.cwd(), '.supabase-config.json');

const DEFAULT_SUPABASE_URL = 'https://snvgarluywefmlsimikf.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_secret_D32T4_vaOP_1qkDE5TYpgg_T5PnlF9m';

function normalizeUrl(input: string): string {
  if (!input) return '';
  let str = input.trim();
  str = str.replace(/^["']|["']$/g, '').trim();

  // If input contains multiple env variable assignments (e.g. "https://xxx.supabase.co VITE_..."), extract the first .supabase.co URL
  const supabaseMatch = str.match(/https?:\/\/[a-z0-9_-]+\.supabase\.co/i);
  if (supabaseMatch) {
    return supabaseMatch[0].toLowerCase();
  }

  // Check if input is just the 20-character project ref (e.g. "snvgarluywefmlsimikf")
  const refMatch = str.match(/\b([a-z0-9]{20})\b/i);
  if (refMatch) {
    return `https://${refMatch[1].toLowerCase()}.supabase.co`;
  }

  // Take the first token before whitespace and strip any variable prefix like SUPABASE_URL=
  const firstWord = str.split(/\s+/)[0].replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();
  let cleaned = firstWord;
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}.supabase.co`;
  }
  return cleaned.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

function normalizeKey(input: string): string {
  if (!input) return '';
  let str = input.trim();
  str = str.replace(/^["']|["']$/g, '').trim();
  str = str.replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();

  // If multiple tokens are pasted together, pick the secret or service_role/anon token
  if (str.includes(' ') || str.includes('\n')) {
    const tokens = str.split(/\s+/);
    const foundSecret = tokens.find(t => t.includes('sb_secret_'));
    if (foundSecret) {
      return foundSecret.replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();
    }
    const foundJwt = tokens.find(t => t.includes('eyJ'));
    if (foundJwt) {
      return foundJwt.replace(/^[A-Z0-9_]+=\s*/i, '').replace(/^["']|["']$/g, '').trim();
    }
    return tokens[0].trim();
  }
  return str;
}

function extractProjectId(url: string): string {
  try {
    const cleanUrl = normalizeUrl(url);
    const parsed = new URL(cleanUrl);
    const parts = parsed.hostname.split('.');
    if (parts.length >= 3 && parts[1] === 'supabase' && parts[2] === 'co') {
      return parts[0];
    }
    return parsed.hostname.replace('.supabase.co', '');
  } catch {
    return (url || '').replace('https://', '').replace('.supabase.co', '').split('/')[0] || 'snvgarluywefmlsimikf';
  }
}

function loadSavedConfig(): { url: string; key: string } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data.url || data.key) {
        return {
          url: data.url ? normalizeUrl(data.url) : '',
          key: data.key ? normalizeKey(data.key) : '',
        };
      }
    }
  } catch (err) {
    console.error('Error reading saved Supabase config:', err);
  }
  return { url: '', key: '' };
}

const saved = loadSavedConfig();
let currentSupabaseUrl = normalizeUrl(
  saved.url ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
);
let currentSupabaseKey = normalizeKey(
  saved.key ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_KEY ||
  DEFAULT_SUPABASE_KEY
);

let currentProjectId = extractProjectId(currentSupabaseUrl);

let supabaseClient: SupabaseClient | null = null;

function initSupabaseClient(url: string, key: string): SupabaseClient | null {
  const cleanUrl = normalizeUrl(url);
  const cleanKey = normalizeKey(key);
  if (!cleanUrl || !cleanKey) return null;
  try {
    return createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err: any) {
    console.warn('Could not initialize Supabase client:', err?.message || err);
    return null;
  }
}

supabaseClient = initSupabaseClient(currentSupabaseUrl, currentSupabaseKey);

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 10) return '***';
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}

async function testSupabaseConnection(client: SupabaseClient, url: string) {
  const startTime = Date.now();
  try {
    const { data, error } = await client
      .from('candidates')
      .select('id')
      .abortSignal(AbortSignal.timeout(3500))
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      const errMsg = (error.message || '') + ' ' + (error.details || '');
      const isDnsOrNetwork = 
        errMsg.toLowerCase().includes('fetch failed') || 
        errMsg.toLowerCase().includes('enotfound') ||
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('econnrefused') ||
        errMsg.toLowerCase().includes('timeout');

      if (isDnsOrNetwork) {
        return {
          isConnected: false,
          hasTablesCreated: false,
          latencyMs,
          error: `Could not connect to Supabase host (${url}). Please verify that your Supabase Project URL or Project Reference ID is correct in your Supabase dashboard.`,
          errorCode: 'NETWORK_ERROR',
        };
      }

      const isTableMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('not find the table') ||
        error.message?.toLowerCase().includes('does not exist');

      const isUnauthorized =
        error.code === '401' ||
        error.code === 'PGRST301' ||
        error.message?.toLowerCase().includes('unauthorized') ||
        error.message?.toLowerCase().includes('jwt') ||
        error.message?.toLowerCase().includes('apikey');

      return {
        isConnected: !isUnauthorized,
        hasTablesCreated: !isTableMissing && !isUnauthorized,
        latencyMs,
        error: isUnauthorized
          ? 'Authentication failed: Invalid Supabase API Key or insufficient permissions.'
          : isTableMissing
          ? 'Connected to Supabase! PostgreSQL database tables have not been created yet. Run the SQL schema script in Supabase SQL Editor.'
          : error.message,
        errorCode: error.code,
      };
    }

    return {
      isConnected: true,
      hasTablesCreated: true,
      latencyMs,
      candidateCount: data?.length ?? 0,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    const isDnsError = msg.includes('ENOTFOUND') || msg.includes('fetch failed');
    return {
      isConnected: false,
      hasTablesCreated: false,
      latencyMs: Date.now() - startTime,
      error: isDnsError
        ? `Could not reach ${url}. Please verify that your Supabase Project URL or Project ID is correct and active.`
        : msg,
    };
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Essential Soul Recruitment CRM Backend',
      timestamp: new Date().toISOString(),
      supabaseConfigured: !!currentSupabaseKey,
      supabaseUrl: currentSupabaseUrl,
      projectId: currentProjectId,
    });
  });

  // 2. Supabase Connection Status
  app.get('/api/supabase/status', async (req, res) => {
    if (!supabaseClient) {
      return res.json({
        isConfigured: false,
        isConnected: false,
        projectId: currentProjectId,
        apiUrl: `${currentSupabaseUrl}/rest/v1/`,
        supabaseUrl: currentSupabaseUrl,
        maskedKey: maskKey(currentSupabaseKey),
        error: 'Supabase client is not configured. Please provide your Supabase URL and API Key.',
      });
    }

    const testRes = await testSupabaseConnection(supabaseClient, currentSupabaseUrl);

    return res.json({
      isConfigured: true,
      isConnected: testRes.isConnected,
      hasTablesCreated: testRes.hasTablesCreated,
      projectId: currentProjectId,
      apiUrl: `${currentSupabaseUrl}/rest/v1/`,
      supabaseUrl: currentSupabaseUrl,
      maskedKey: maskKey(currentSupabaseKey),
      latencyMs: testRes.latencyMs,
      error: testRes.error,
      errorCode: testRes.errorCode,
      candidateCount: testRes.candidateCount,
    });
  });

  // 3. Update & Test Supabase Configuration dynamically
  app.post('/api/supabase/config', async (req, res) => {
    const { url, key } = req.body || {};
    if (!url && !key) {
      return res.status(400).json({ success: false, error: 'Please provide a Supabase URL or API Key' });
    }

    if (url) {
      currentSupabaseUrl = normalizeUrl(url);
      currentProjectId = extractProjectId(currentSupabaseUrl);
    }
    if (key) {
      currentSupabaseKey = normalizeKey(key);
    }

    // Persist to local config file
    try {
      fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify({ url: currentSupabaseUrl, key: currentSupabaseKey }, null, 2),
        'utf8'
      );
    } catch (err) {
      console.error('Failed to save config file:', err);
    }

    supabaseClient = initSupabaseClient(currentSupabaseUrl, currentSupabaseKey);

    if (!supabaseClient) {
      return res.status(400).json({
        success: false,
        error: 'Could not initialize Supabase client with the provided parameters.',
      });
    }

    const testRes = await testSupabaseConnection(supabaseClient, currentSupabaseUrl);

    return res.json({
      success: testRes.isConnected,
      isConnected: testRes.isConnected,
      hasTablesCreated: testRes.hasTablesCreated,
      projectId: currentProjectId,
      supabaseUrl: currentSupabaseUrl,
      apiUrl: `${currentSupabaseUrl}/rest/v1/`,
      maskedKey: maskKey(currentSupabaseKey),
      latencyMs: testRes.latencyMs,
      message: testRes.isConnected
        ? (testRes.hasTablesCreated 
            ? 'Successfully connected to Supabase! All tables are active.' 
            : 'Connected to Supabase! Please execute the SQL Schema script to create the tables.')
        : 'Connection failed.',
      error: testRes.error,
    });
  });

  // 4. Sync CRM Data to Supabase via Server-side Upsert
  app.post('/api/supabase/sync', async (req, res) => {
    const client = supabaseClient;
    if (!client) {
      return res.status(500).json({
        success: false,
        error: 'Supabase server client not initialized. Please connect your database in Supabase Settings.',
      });
    }

    const {
      companies = [],
      departments = [],
      users = [],
      candidates = [],
      jobOpenings = [],
      interviews = [],
      followUps = [],
      offerLetters = [],
      targetSettings = [],
      termsClauses = [],
      auditLogs = [],
    } = req.body || {};

    const syncedCounts: Record<string, number> = {};
    const errors: string[] = [];

    // Conversion helpers between TypeScript CRM interfaces and Supabase PostgreSQL schema
    function candidateToDb(c: any) {
      if (!c) return null;
      return {
        id: c.id,
        full_name: c.fullName || c.full_name || '',
        mobile_number: c.mobileNumber || c.mobile_number || '',
        whatsapp_number: c.whatsappNumber || c.whatsapp_number || c.mobileNumber || '',
        gender: c.gender || null,
        age: c.age || null,
        date_of_birth: c.dateOfBirth || c.date_of_birth || null,
        email: c.email || null,
        city: c.city || null,
        area: c.area || null,
        address: c.address || null,
        position_applied: c.positionApplied || c.position_applied || '',
        department: c.department || '',
        company_id: c.companyId || c.company_id || null,
        company_name: c.companyName || c.company_name || null,
        qualification: c.qualification || null,
        total_experience: c.totalExperience || c.total_experience || null,
        relevant_experience: c.relevantExperience || c.relevant_experience || null,
        current_company: c.currentCompany || c.current_company || null,
        current_salary: c.currentSalary !== undefined ? c.currentSalary : (c.current_salary || null),
        expected_salary: c.expectedSalary !== undefined ? c.expectedSalary : (c.expected_salary || null),
        salary_offered: c.salaryOffered !== undefined ? c.salaryOffered : (c.salary_offered || null),
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
        first_call_date: c.firstCallDate || c.first_call_date || null,
        last_activity_date: c.lastActivityDate || c.last_activity_date || new Date().toISOString(),
        created_at: c.createdAt || c.created_at || new Date().toISOString(),
        updated_at: c.updatedAt || c.updated_at || new Date().toISOString(),
      };
    }

    function followUpToDb(f: any) {
      if (!f) return null;
      return {
        id: f.id,
        candidate_id: f.candidateId || f.candidate_id,
        scheduled_date: f.followUpDate || f.scheduled_date,
        scheduled_time: f.followUpTime || f.scheduled_time || '11:00',
        type: f.followUpMode || f.type || 'Call',
        notes: f.notes || f.candidateResponse || '',
        completed: Boolean(f.isCompleted ?? f.completed),
        conducted_by: f.hrExecutive || f.conducted_by || 'Nandani',
        outcome: f.resultingStatus || f.outcome || 'Follow-up',
        next_follow_up_date: f.nextFollowUpDate || f.next_follow_up_date || null,
        created_at: f.createdAt || f.created_at || new Date().toISOString(),
      };
    }

    function interviewToDb(i: any) {
      if (!i) return null;
      return {
        id: i.id,
        candidate_id: i.candidateId || i.candidate_id,
        candidate_name: i.candidateName || i.candidate_name || '',
        candidate_phone: i.candidateMobile || i.candidate_phone || '',
        candidate_role: i.position || i.candidate_role || '',
        scheduled_date: i.interviewDate || i.scheduled_date,
        scheduled_time: i.interviewTime || i.scheduled_time || '11:00',
        round: i.round || 'Initial Round',
        interviewer_name: i.interviewer || i.interviewer_name || 'Vikram Singh',
        interviewer_role: i.interviewer_role || 'Interviewer',
        status: i.attendanceStatus || i.status || 'Scheduled',
        attendance_status: i.attendanceStatus || i.attendance_status || 'Scheduled',
        evaluation: i.evaluation || null,
        notes: i.remarks || i.notes || '',
        created_at: i.createdAt || i.created_at || new Date().toISOString(),
      };
    }

    async function upsertBatch(tableName: string, rows: any[]) {
      if (!rows || rows.length === 0) return;
      try {
        let transformedRows = rows;
        if (tableName === 'candidates') {
          transformedRows = rows.map(candidateToDb).filter(Boolean);
        } else if (tableName === 'follow_ups') {
          transformedRows = rows.map(followUpToDb).filter(Boolean);
        } else if (tableName === 'interviews') {
          transformedRows = rows.map(interviewToDb).filter(Boolean);
        }

        const { error } = await client!.from(tableName).upsert(transformedRows, { onConflict: 'id' });
        if (error) {
          errors.push(`${tableName}: ${error.message}`);
        } else {
          syncedCounts[tableName] = rows.length;
        }
      } catch (err: any) {
        errors.push(`${tableName}: ${err?.message || 'Unknown upsert error'}`);
      }
    }

    await upsertBatch('companies', companies);
    await upsertBatch('departments', departments);
    await upsertBatch('users', users);
    await upsertBatch('candidates', candidates);
    await upsertBatch('job_openings', jobOpenings);
    await upsertBatch('interviews', interviews);
    await upsertBatch('follow_ups', followUps);
    await upsertBatch('offer_letters', offerLetters);
    await upsertBatch('target_settings', targetSettings);
    await upsertBatch('terms_clauses', termsClauses);
    if (auditLogs.length > 0) {
      await upsertBatch('audit_logs', auditLogs.slice(0, 100));
    }

    return res.json({
      success: errors.length === 0,
      syncedCounts,
      errors,
      totalSynced: Object.values(syncedCounts).reduce((a, b) => a + b, 0),
    });
  });

  // 5. Fetch CRM Data from Supabase
  app.get('/api/supabase/data', async (req, res) => {
    const client = supabaseClient;
    if (!client) {
      return res.status(500).json({ success: false, error: 'Supabase client not initialized' });
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

      const candidateMap: Record<string, any> = {};
      const formattedCandidates = (rawCandidates || []).map((row: any) => {
        const cand = {
          id: row.id,
          fullName: row.full_name || row.fullName || '',
          mobileNumber: row.mobile_number || row.mobileNumber || '',
          whatsappNumber: row.whatsapp_number || row.whatsappNumber || row.mobile_number || '',
          gender: row.gender,
          age: row.age,
          dateOfBirth: row.date_of_birth,
          email: row.email,
          city: row.city,
          area: row.area,
          address: row.address,
          positionApplied: row.position_applied || row.positionApplied || '',
          department: row.department || '',
          companyId: row.company_id || row.companyId || 'comp-1',
          companyName: row.company_name || row.companyName || 'Essential Soul Lifestyle Pvt Ltd',
          qualification: row.qualification || 'Graduate',
          totalExperience: row.total_experience || row.totalExperience || '1 Year',
          relevantExperience: row.relevant_experience || row.relevantExperience || '1 Year',
          currentCompany: row.current_company || row.currentCompany,
          currentSalary: row.current_salary !== null && row.current_salary !== undefined ? Number(row.current_salary) : 0,
          expectedSalary: row.expected_salary !== null && row.expected_salary !== undefined ? Number(row.expected_salary) : 0,
          salaryOffered: row.salary_offered !== null && row.salary_offered !== undefined ? Number(row.salary_offered) : undefined,
          noticePeriod: row.notice_period || 'Immediate',
          preferredLocation: row.preferred_location || 'Delhi / NCR',
          candidateSource: row.candidate_source || 'Indeed',
          assignedHr: row.assigned_hr || 'Nandani',
          remarks: row.remarks || '',
          status: row.status || 'New Lead',
          isActiveJoining: Boolean(row.is_active_joining),
          activeJoinedDate: row.active_joining_date || undefined,
          joiningDate: row.joining_date || undefined,
          selectionDate: row.status === 'Selected' ? (row.joining_date || row.created_at?.split('T')[0] || '2026-09-06') : undefined,
          actualJoinedDate: (row.is_active_joining || row.status === 'Joined') ? (row.joining_date || row.active_joining_date || '2026-09-06') : undefined,
          reportingManager: row.company_name?.includes('BKD') ? 'Pooja Verma' : 'Nandani Sharma (HR Head)',
          reportingTime: '09:30 AM',
          officeLocation: row.company_name?.includes('BKD') ? 'B-12, Sector 63, Noida' : 'Plot A-40, Sector 62, Noida',
          joiningStatus: (row.status === 'Joined' || row.is_active_joining) ? 'Joined' : (row.status === 'Selected' ? 'Confirmed' : undefined),
          createdAt: row.created_at || new Date().toISOString(),
          firstCallDate: row.first_call_date || undefined,
          lastActivityDate: row.last_activity_date || row.created_at || new Date().toISOString(),
          isArchived: false,
        };
        candidateMap[cand.id] = cand;
        return cand;
      });

      const formattedFollowUps = (rawFollowUps || []).map((row: any) => {
        const cand = candidateMap[row.candidate_id];
        return {
          id: row.id,
          candidateId: row.candidate_id,
          candidateName: cand?.fullName || row.candidate_name || 'Candidate',
          candidateMobile: cand?.mobileNumber || row.candidate_phone || '',
          position: cand?.positionApplied || row.position || '',
          hrExecutive: row.conducted_by || cand?.assignedHr || 'Nandani',
          followUpDate: row.scheduled_date || row.followUpDate || '',
          followUpTime: row.scheduled_time || row.followUpTime || '11:00',
          followUpMode: row.type || row.followUpMode || 'Call',
          candidateResponse: row.notes || 'Discussed interview schedule',
          notes: row.notes || '',
          nextFollowUpDate: row.next_follow_up_date || undefined,
          resultingStatus: row.outcome || cand?.status || 'Follow-up',
          isCompleted: Boolean(row.completed),
          createdAt: row.created_at || new Date().toISOString(),
        };
      });

      const formattedInterviews = (rawInterviews || []).map((row: any) => {
        const cand = candidateMap[row.candidate_id];
        return {
          id: row.id,
          candidateId: row.candidate_id,
          candidateName: row.candidate_name || cand?.fullName || 'Candidate',
          candidateMobile: row.candidate_phone || cand?.mobileNumber || '',
          position: row.candidate_role || cand?.positionApplied || 'Executive',
          department: cand?.department || 'HR Recruitment',
          hrExecutive: cand?.assignedHr || 'Nandani',
          interviewer: row.interviewer_name || row.interviewer || 'Vikram Singh',
          interviewDate: row.scheduled_date || row.interviewDate || '',
          interviewTime: row.scheduled_time || row.interviewTime || '11:00',
          interviewMode: row.round?.includes('Video') ? 'Video Interview' : (row.round?.includes('Calling') ? 'Phone Interview' : 'Office Interview'),
          interviewLocation: row.round?.includes('Video') ? 'Google Meet' : 'ITHUM Tower, Noida Sector 62',
          attendanceStatus: row.attendance_status || row.status || 'Scheduled',
          reminderSent: true,
          remarks: row.notes || '',
          evaluation: row.evaluation || undefined,
          createdAt: row.created_at || new Date().toISOString(),
        };
      });

      const formattedUsers = (rawUsers || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        department: row.department,
        companyId: row.company_id || row.companyId || 'comp-1',
        companyName: row.company_name || row.companyName || 'Essential Soul Lifestyle Pvt Ltd',
        userId: row.user_id || row.userId || '',
        password: row.password || '',
        dailyInterviewTarget: row.daily_interview_target || 5,
        monthlyActiveJoiningTarget: row.monthly_active_joining_target || 20,
        status: row.status || 'Active',
        avatarUrl: row.avatar_url,
      }));

      const formattedCompanies = (rawCompanies || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        legalName: row.legal_name,
        cin: row.cin,
        gstin: row.gstin,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        phone: row.phone,
        email: row.email,
        logoUrl: row.logo_url,
        website: row.website,
        departments: row.departments || [],
        isActive: Boolean(row.is_active),
        adminUserId: row.admin_user_id,
        adminPassword: row.admin_password,
        masterContactPerson: row.master_contact_person,
        lastPasswordChanged: row.last_password_changed,
        createdAt: row.created_at,
      }));

      const formattedJobOpenings = (rawJobOpenings || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        department: row.department,
        companyId: row.company_id || row.companyId || 'comp-1',
        positions: row.positions || 1,
        experienceMin: row.experience_min || 0,
        experienceMax: row.experience_max || 3,
        salaryMin: row.salary_min || 15000,
        salaryMax: row.salary_max || 25000,
        location: row.location || 'Noida',
        jobType: row.job_type || 'Full-time',
        description: row.description || '',
        requirements: row.requirements || '',
        status: row.status || 'Open',
        postedDate: row.posted_date || '2026-08-20',
      }));

      return res.json({
        success: true,
        data: {
          companies: formattedCompanies,
          departments: rawDepartments || [],
          users: formattedUsers,
          candidates: formattedCandidates,
          jobOpenings: formattedJobOpenings,
          interviews: formattedInterviews,
          followUps: formattedFollowUps,
          offerLetters: rawOfferLetters || [],
          targetSettings: rawTargetSettings || [],
          termsClauses: rawTermsClauses || [],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch from Supabase' });
    }
  });

  // 6. Direct Source Code Sync for Companies (updates src/mockData.ts)
  app.post('/api/companies/sync-source', (req, res) => {
    try {
      const { companies } = req.body || {};
      if (!Array.isArray(companies)) {
        return res.status(400).json({ success: false, error: 'Expected an array of companies' });
      }

      const mockDataPath = path.join(process.cwd(), 'src', 'mockData.ts');
      if (!fs.existsSync(mockDataPath)) {
        return res.status(404).json({ success: false, error: 'src/mockData.ts not found' });
      }

      let content = fs.readFileSync(mockDataPath, 'utf8');

      // Replace INITIAL_COMPANIES array in src/mockData.ts
      const regex = /export const INITIAL_COMPANIES:\s*Company\[\]\s*=\s*\[[\s\S]*?\n\];/;
      const formattedArray = 'export const INITIAL_COMPANIES: Company[] = ' + JSON.stringify(companies, null, 2) + ';';

      if (regex.test(content)) {
        content = content.replace(regex, formattedArray);
        fs.writeFileSync(mockDataPath, content, 'utf8');
        console.log(`[Source Code Sync] Updated src/mockData.ts with ${companies.length} companies.`);
        return res.json({ 
          success: true, 
          message: `Successfully synchronized ${companies.length} company records to src/mockData.ts`,
          count: companies.length 
        });
      } else {
        return res.status(500).json({ success: false, error: 'Could not match INITIAL_COMPANIES declaration in src/mockData.ts' });
      }
    } catch (err: any) {
      console.error('Error syncing companies to source code:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update source file' });
    }
  });

  app.get('/api/companies/sync-status', (req, res) => {
    const mockDataPath = path.join(process.cwd(), 'src', 'mockData.ts');
    if (!fs.existsSync(mockDataPath)) {
      return res.json({ exists: false });
    }
    const stat = fs.statSync(mockDataPath);
    return res.json({ exists: true, lastModified: stat.mtime });
  });

  // 7. Delete User API
  app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient.from('users').delete().eq('id', id);
        if (error) {
          console.warn(`[Supabase] Could not delete user ${id}:`, error.message);
        }
      }
      return res.json({ success: true, message: `User ${id} removed successfully` });
    } catch (err: any) {
      console.error(`Error removing user ${id}:`, err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to delete user' });
    }
  });

  // 8. Update User Status API (Active / Inactive)
  app.patch('/api/users/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    try {
      if (supabaseClient && status) {
        const { error } = await supabaseClient.from('users').update({ status }).eq('id', id);
        if (error) {
          console.warn(`[Supabase] Could not update status for user ${id}:`, error.message);
        }
      }
      return res.json({ success: true, message: `User ${id} status updated to ${status}` });
    } catch (err: any) {
      console.error(`Error updating user status for ${id}:`, err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update user status' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
