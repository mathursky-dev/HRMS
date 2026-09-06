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
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
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

    async function upsertBatch(tableName: string, rows: any[]) {
      if (!rows || rows.length === 0) return;
      try {
        const { error } = await client!.from(tableName).upsert(rows, { onConflict: 'id' });
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

      return res.json({
        success: true,
        data: {
          companies: companies || [],
          departments: departments || [],
          users: users || [],
          candidates: candidates || [],
          jobOpenings: jobOpenings || [],
          interviews: interviews || [],
          followUps: followUps || [],
          offerLetters: offerLetters || [],
          targetSettings: targetSettings || [],
          termsClauses: termsClauses || [],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch from Supabase' });
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
