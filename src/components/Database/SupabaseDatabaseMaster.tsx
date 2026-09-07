import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Server, 
  Key, 
  FileCode2,
  Table,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Link,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_REST_API, 
  SUPABASE_SCHEMA_SQL, 
  checkSupabaseHealth, 
  syncDatasetToSupabase, 
  fetchDatasetFromSupabase,
  getSupabaseAnonKey,
  setSupabaseAnonKeyOverride,
  clearSupabaseOverrides,
  updateSupabaseServerConfig,
  extractProjectId,
  normalizeSupabaseUrl,
  getSupabaseUrl,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  extractJwtProjectRef,
  SupabaseHealthResult
} from '../../lib/supabase';

interface SupabaseDatabaseMasterProps {
  onNavigate?: (nav: string) => void;
}

export const SupabaseDatabaseMaster: React.FC<SupabaseDatabaseMasterProps> = ({ onNavigate }) => {
  const { 
    candidates, 
    allUsers, 
    companies, 
    departmentsList, 
    jobOpenings, 
    interviews, 
    followUps, 
    offerLetters, 
    targetSettings, 
    termsClauses,
    auditLogs,
    refreshFromSupabase
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'sync' | 'config'>('overview');
  const [health, setHealth] = useState<SupabaseHealthResult | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; counts?: Record<string, number> } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState<boolean>(false);
  
  // Optional key input for immediate client-side testing
  const [anonKeyInput, setAnonKeyInput] = useState<string>(() => getSupabaseAnonKey());
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // Server-side & client-side dynamic DB Connection state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(() => getSupabaseUrl());
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(() => getSupabaseAnonKey());
  const [showKeyPassword, setShowKeyPassword] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configFeedback, setConfigFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const activeProjectId = health?.projectId || extractProjectId(supabaseUrlInput || getSupabaseUrl());
  const activeSupabaseUrl = health?.supabaseUrl || normalizeSupabaseUrl(supabaseUrlInput || getSupabaseUrl());
  const activeApiUrl = health?.apiUrl || `${activeSupabaseUrl}/rest/v1/`;

  const runHealthCheck = async () => {
    setIsLoadingHealth(true);
    try {
      const result = await checkSupabaseHealth();
      setHealth(result);
      if (result.supabaseUrl) {
        setSupabaseUrlInput(result.supabaseUrl);
      }
    } catch (e: any) {
      setHealth({
        isConfigured: false,
        isConnected: false,
        hasAnonKey: !!getSupabaseAnonKey(),
        projectId: activeProjectId,
        apiUrl: activeApiUrl,
        error: e?.message || 'Failed to ping Supabase'
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleSaveAndConnect = async () => {
    setIsSavingConfig(true);
    setConfigFeedback(null);
    try {
      const res = await updateSupabaseServerConfig(supabaseUrlInput, supabaseKeyInput);
      if (res.isConnected) {
        setConfigFeedback({
          success: true,
          message: res.hasTablesCreated
            ? `Connected to Supabase! PostgreSQL database tables are active and ready for sync (latency: ${res.latencyMs ?? 20}ms).`
            : `Connected to Supabase REST API! (Database online · Next step: create tables using the SQL Schema script).`
        });
      } else {
        setConfigFeedback({
          success: false,
          message: res.error || 'Connection failed. Please check the Supabase Project URL and API Key.'
        });
      }
    } catch (err: any) {
      setConfigFeedback({
        success: false,
        message: err?.message || 'Failed to connect to backend server.'
      });
    } finally {
      setIsSavingConfig(false);
      await runHealthCheck();
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(activeApiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleClearCredentials = () => {
    clearSupabaseOverrides();
    setAnonKeyInput('');
    setSupabaseKeyInput('');
    setSupabaseUrlInput(getSupabaseUrl());
    setConfigFeedback({
      success: true,
      message: 'Cleared all locally stored overrides. Resetting to defaults...',
    });
    runHealthCheck();
  };

  const handleUseDefaultKey = () => {
    setSupabaseUrlInput(DEFAULT_SUPABASE_URL);
    setSupabaseKeyInput(DEFAULT_SUPABASE_ANON_KEY);
    setAnonKeyInput(DEFAULT_SUPABASE_ANON_KEY);
    setSupabaseAnonKeyOverride(DEFAULT_SUPABASE_ANON_KEY);
    setConfigFeedback({
      success: true,
      message: 'Restored verified project anon key. Re-testing connection...',
    });
    runHealthCheck();
  };

  const handleCopyVercelEnv = () => {
    const keyVal = anonKeyInput || supabaseKeyInput || DEFAULT_SUPABASE_ANON_KEY;
    const vercelEnvText = `VITE_SUPABASE_URL=${activeSupabaseUrl}\nVITE_SUPABASE_ANON_KEY=${keyVal}`;
    navigator.clipboard.writeText(vercelEnvText);
    setCopiedVercelEnv(true);
    setTimeout(() => setCopiedVercelEnv(false), 2500);
  };

  const handleSaveAnonKey = () => {
    setSupabaseAnonKeyOverride(anonKeyInput);
    setSupabaseKeyInput(anonKeyInput);
    runHealthCheck();
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncDatasetToSupabase({
        companies,
        departments: departmentsList,
        users: allUsers,
        candidates,
        jobOpenings,
        interviews,
        followUps,
        offerLetters,
        targetSettings,
        termsClauses,
        auditLogs
      });

      if (res.success) {
        setSyncResult({
          success: true,
          message: `Successfully synchronized ${Object.values(res.syncedCounts).reduce((a, b) => a + b, 0)} total records across all tables into Supabase!`,
          counts: res.syncedCounts
        });
      } else {
        setSyncResult({
          success: false,
          message: res.errors.join(' | ') || 'Encountered issues during synchronization. Ensure table DDL has been executed.'
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Synchronization failed.'
      });
    } finally {
      setIsSyncing(false);
      runHealthCheck();
    }
  };

  const tablesSummary = [
    { name: 'candidates', label: 'Candidate Master & Leads', count: candidates.length, desc: 'ATS recruitment pipeline, calling logs, active joinings' },
    { name: 'companies', label: 'Company Master & Credentials', count: companies.length, desc: 'Corporate legal entities, master credentials, GSTIN/CIN' },
    { name: 'users', label: 'User Management & Roles', count: allUsers.length, desc: 'Recruiters, HR heads, Directors, login passwords & targets' },
    { name: 'departments', label: 'Department Master', count: departmentsList.length, desc: 'Recruitment divisions, hiring targets & head counts' },
    { name: 'job_openings', label: 'Job Openings & Vacancies', count: jobOpenings.length, desc: 'Open requisitions, CTC brackets, job descriptions' },
    { name: 'interviews', label: 'Interview Schedules', count: interviews.length, desc: 'Round 1, Round 2, evaluations & attendance' },
    { name: 'follow_ups', label: 'Follow-ups & Calling Queues', count: followUps.length, desc: 'Scheduled calls, callbacks, outcomes & reminders' },
    { name: 'offer_letters', label: 'Offer Letters & CTC Breakups', count: offerLetters.length, desc: 'Generated offers, monthly gross, basic & allowances' },
    { name: 'target_settings', label: 'Target Benchmarks', count: targetSettings.length, desc: 'Daily calling, interview targets, monthly active joinings' },
    { name: 'terms_clauses', label: 'Terms & Policies', count: termsClauses.length, desc: 'Probation, NDA, POSH, operating hours clauses' },
    { name: 'audit_logs', label: 'System Audit Trail', count: auditLogs.length, desc: 'Security audit logs, user actions & timestamp tracking' },
  ];

  const totalLocalRecords = tablesSummary.reduce((acc, t) => acc + t.count, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner & Supabase Project Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black shadow-inner">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    Supabase Cloud Database
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      PostgreSQL
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-300">
                  Cloud Relational Database & Realtime API backend for Essential Soul Recruitment CRM
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge & Ping Trigger */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              health?.isConnected 
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                health?.isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span>
                {health?.isConnected 
                  ? health?.hasTablesCreated 
                    ? `Connected (${health.latencyMs ?? 20}ms)` 
                    : `Connected · Schema Pending (${health.latencyMs ?? 20}ms)`
                  : 'Checking Connection...'}
              </span>
            </div>

            <button
              onClick={runHealthCheck}
              disabled={isLoadingHealth}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Test connection and ping Supabase REST endpoint"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isLoadingHealth ? 'Pinging...' : 'Test Connection'}</span>
            </button>

            <a
              href={`https://supabase.com/dashboard/project/${activeProjectId}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Open Supabase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Project Endpoint Meta Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-700/60 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">PROJECT ID:</span>
            <span className="font-bold text-emerald-400">{activeProjectId}</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between col-span-1 sm:col-span-2">
            <span className="text-slate-400 text-[11px] shrink-0 mr-2">REST API:</span>
            <span className="font-medium text-slate-200 truncate">{activeApiUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="ml-2 text-slate-400 hover:text-white transition-colors"
              title="Copy REST API URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Supabase DB Connection & Setup Panel */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Connect Database with Supabase
                {health?.isConnected ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold">
                    Action Required
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your Supabase Project URL & API Key to synchronize your recruitment pipeline directly with PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('schema')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>SQL Schema Script</span>
            </button>
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing || !health?.isConnected}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Pushing Data...' : 'Push CRM Data'}</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>Supabase Project URL or Reference ID</span>
            </label>
            <input
              type="text"
              value={supabaseUrlInput}
              onChange={(e) => setSupabaseUrlInput(e.target.value)}
              placeholder="e.g. https://your-project.supabase.co or your-project-ref"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Supabase API Key (Secret or Anon)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Server-proxied</span>
            </label>
            <div className="relative">
              <input
                id="supabase-key-input-field"
                type={showKeyPassword ? 'text' : 'password'}
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOi... (Supabase anon public key or service role key)"
                className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowKeyPassword(!showKeyPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showKeyPassword ? 'Hide Key' : 'Show Key'}
              >
                {showKeyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-time mismatch and quick-fill helper */}
            {(() => {
              const inputUrlProjId = extractProjectId(supabaseUrlInput || activeSupabaseUrl);
              const inputKeyRef = extractJwtProjectRef(supabaseKeyInput);
              const isKeyMismatched = Boolean(inputKeyRef && inputUrlProjId && inputKeyRef !== inputUrlProjId);

              if (isKeyMismatched) {
                return (
                  <div className="mt-1 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p>
                        <strong>Key Mismatch:</strong> This API key was issued for project <code>{inputKeyRef}</code>, but your Project URL is <code>{inputUrlProjId}</code>. Supabase will reject this key with <em>"Unregistered API key"</em>.
                      </p>
                      {inputUrlProjId === 'snvgarluywefmlsimikf' && (
                        <button
                          type="button"
                          onClick={handleUseDefaultKey}
                          className="font-bold underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer flex items-center gap-1 mt-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Click here to fill verified project anon key</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              if (inputUrlProjId === 'snvgarluywefmlsimikf' && !supabaseKeyInput) {
                return (
                  <div className="pt-0.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Default project key ready</span>
                    <button
                      type="button"
                      onClick={handleUseDefaultKey}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Use Verified Anon Key</span>
                    </button>
                  </div>
                );
              }

              return null;
            })()}
          </div>

          <div className="md:col-span-2 flex items-center gap-1.5">
            <button
              onClick={handleSaveAndConnect}
              disabled={isSavingConfig}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Connect & Verify</span>
                </>
              )}
            </button>
            <button
              onClick={handleClearCredentials}
              title="Reset to default configuration and purge saved local overrides"
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors h-[38px] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {configFeedback && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
            configFeedback.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}>
            {configFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">{configFeedback.message}</p>
              {configFeedback.message.includes('SQL Schema') && (
                <button
                  onClick={() => setActiveTab('schema')}
                  className="font-bold underline text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <span>Go to SQL Schema DDL Tab to copy the schema script</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Tables & Health ({tablesSummary.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Supabase SQL Schema DDL</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'sync'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Data Sync Center ({totalLocalRecords} records)</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Environment & Key Config</span>
        </button>
      </div>

      {/* TAB 1: TABLES OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick Info / Warning Banner */}
          {health?.error && (() => {
            const errText = (health.error || '').toLowerCase();
            const isUnregistered = health.errorCode === 'UNREGISTERED_API_KEY' || errText.includes('unregistered') || errText.includes('invalid api key');
            const isMissingKey = health.errorCode === 'MISSING_API_KEY' || !health.hasAnonKey || errText.includes('not configured');
            const isAuthIssue = isUnregistered || isMissingKey || errText.includes('jwt') || errText.includes('apikey') || errText.includes('api key') || errText.includes('unauthorized');

            if (isAuthIssue) {
              return (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="font-bold text-sm text-rose-950 dark:text-rose-100 flex items-center gap-2">
                        <span>Supabase Authentication Notice: {isUnregistered ? 'Unregistered API Key' : 'API Key Required'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold">
                          Project: {activeProjectId}
                        </span>
                      </p>
                      <p className="leading-relaxed mt-1 text-rose-800 dark:text-rose-300">
                        {health.error}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white/70 dark:bg-rose-900/30 border border-rose-200/80 dark:border-rose-800 text-[11px] space-y-1.5">
                      <p className="font-semibold text-rose-950 dark:text-rose-100">Fix on Vercel deployment:</p>
                      <ul className="list-disc list-inside space-y-1 text-rose-800 dark:text-rose-300">
                        <li>The API key currently in use does not match your project <strong>{activeProjectId}</strong> (<code>{activeSupabaseUrl}</code>).</li>
                        <li>In Vercel: go to <strong>Settings &rarr; Environment Variables</strong> and set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                        <li>Or paste your anon public key directly into the configuration box above and click <strong>Connect & Verify</strong>.</li>
                      </ul>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      {activeProjectId === 'snvgarluywefmlsimikf' && (
                        <button
                          onClick={handleUseDefaultKey}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Use Verified Project Anon Key</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const el = document.getElementById('supabase-key-input-field');
                          if (el) {
                            el.focus();
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Update API Key Above</span>
                      </button>

                      <button
                        onClick={handleClearCredentials}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear Cached Overrides</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('config')}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Vercel Setup Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <a
                        href={`https://supabase.com/dashboard/project/${activeProjectId}/settings/api`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <span>Open Supabase API Keys</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 dark:text-amber-100">Supabase Setup Notice</p>
                  <p className="leading-relaxed">{health.error}</p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('schema')}
                      className="font-bold underline text-amber-800 dark:text-amber-300 hover:text-amber-900 cursor-pointer flex items-center gap-1"
                    >
                      <span>View and copy the SQL Schema script</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Health Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Total Local CRM Records</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalLocalRecords}</p>
              <p className="text-[11px] text-slate-400 mt-1">Available across 11 relational entities</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Supabase API Protocol</span>
                <Server className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white">PostgREST v1 / REST</p>
              <p className="text-[11px] text-slate-400 mt-1">Auto-generated OpenAPI schema</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Security & Policies</span>
                <ShieldCheck className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">Row Level Security (RLS)</p>
              <p className="text-[11px] text-slate-400 mt-1">Granular database access controls</p>
            </div>
          </div>

          {/* Database Tables Matrix */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600" />
                  CRM Relational Schema Tables
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PostgreSQL tables mapped to your Essential Soul Recruitment CRM modules
                </p>
              </div>

              <button
                onClick={() => setActiveTab('sync')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Sync to Supabase</span>
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Table Name</th>
                    <th className="p-3">Module / Entity</th>
                    <th className="p-3">Local Count</th>
                    <th className="p-3">Primary Key</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {tablesSummary.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        public.{t.name}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {t.label}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {t.count} records
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        id (TEXT PK)
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {t.desc}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Configured
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQL SCHEMA DDL */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-600" />
                PostgreSQL Schema DDL (Supabase SQL Editor Ready)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Execute this SQL script in your Supabase project dashboard to create all tables, indexes, and access policies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema DDL'}</span>
              </button>

              <a
                href={`https://supabase.com/dashboard/project/${activeProjectId}/sql`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Instructions Card */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              3-Step Setup in Supabase Dashboard:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 ml-1">
              <li>Click the green <strong className="text-emerald-400">Copy SQL Schema DDL</strong> button above.</li>
              <li>Open your Supabase Project (<strong className="text-white">{activeProjectId}</strong>) &rarr; Click <strong className="text-white">SQL Editor</strong> on the left.</li>
              <li>Click <strong className="text-white">New Query</strong>, paste the copied script into the query box, and click <strong className="text-emerald-400">Run</strong>.</li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl border border-slate-800 bg-[#0F172A] text-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400">schema_supabase.sql</span>
              <button
                onClick={handleCopySql}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-all">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: DATA SYNC CENTER */}
      {activeTab === 'sync' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              Bi-directional Supabase Sync Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Replicate your active candidate rosters, credentials, and company configurations directly into Supabase PostgreSQL tables.
            </p>
          </div>

          {/* Sync Result Toast */}
          {syncResult && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              syncResult.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              {syncResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{syncResult.success ? 'Sync Completed' : 'Sync Error'}</p>
                <p className="leading-relaxed">{syncResult.message}</p>
                {syncResult.counts && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                    {Object.entries(syncResult.counts).map(([tbl, cnt]) => (
                      <div key={tbl} className="bg-white/60 dark:bg-slate-900/60 p-1.5 rounded border border-emerald-300 dark:border-emerald-700">
                        {tbl}: <strong className="text-emerald-700 dark:text-emerald-400">{cnt}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sync Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Push Local Data &rarr; Supabase</h4>
                    <p className="text-[11px] text-slate-500">Uploads all {totalLocalRecords} verified records using upsert</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  Safely synchronizes all candidates, corporate entities, staff credentials, targets, and offer letters to remote tables without losing existing primary keys.
                </p>
              </div>

              <button
                onClick={handleSyncToSupabase}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing with Supabase...' : `Push All ${totalLocalRecords} Records to Supabase`}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Pull Supabase Data &rarr; Local</h4>
                    <p className="text-[11px] text-slate-500">Fetches live records directly from remote PostgreSQL</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  Reads latest candidate status updates, user credentials, and corporate accounts updated by other team members in real-time.
                </p>
              </div>

              <button
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    const res = await refreshFromSupabase();
                    setSyncResult({
                      success: res.success,
                      message: res.message
                    });
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Pull Remote Records from Supabase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION & ENVIRONMENT */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              Supabase Project & Environment Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely authenticate your application with Supabase PostgREST & Auth services on Cloud Run, Vercel, or locally
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* VERCEL DEPLOYMENT GUIDE */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white text-slate-950 flex items-center justify-center font-black text-xs">
                    ▲
                  </div>
                  <span className="font-bold text-sm text-white">
                    Fix "Unregistered API key" on Vercel Deployment
                  </span>
                </div>
                <button
                  onClick={handleCopyVercelEnv}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedVercelEnv ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied for Vercel!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Vercel Environment Variables</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed">
                When deployed on Vercel, Vite runs as a static client application in the user's browser. If <code className="text-emerald-400 font-mono">VITE_SUPABASE_ANON_KEY</code> is missing or contains an old/mismatched key, Supabase responds with <em>"Unregistered API key"</em>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-200">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
                    Open Vercel Settings
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Go to your project dashboard on <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com</a> &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">2</span>
                    Add Variables
                  </span>
                  <p className="text-[11px] text-slate-300 font-mono">
                    VITE_SUPABASE_URL<br />
                    VITE_SUPABASE_ANON_KEY
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">3</span>
                    Redeploy
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Trigger a new deployment or click <strong>Deployments &rarr; Redeploy</strong> so Vercel bakes the variables into the bundle.
                  </p>
                </div>
              </div>
            </div>

            {/* In-browser key test helper */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>Instant Browser Session Override (No Vercel Redeploy Needed):</span>
                </label>
                <span className="text-[10px] text-slate-400">Stores directly in browser localStorage</span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={anonKeyInput}
                    onChange={(e) => setAnonKeyInput(e.target.value)}
                    placeholder="Paste your Supabase anon/public key (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI...)"
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAnonKey}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Save & Test Key
                  </button>
                  {activeProjectId === 'snvgarluywefmlsimikf' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnonKeyInput(DEFAULT_SUPABASE_ANON_KEY);
                        setSupabaseAnonKeyOverride(DEFAULT_SUPABASE_ANON_KEY);
                        runHealthCheck();
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Use Default Anon Key</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Overrides</span>
                  </button>
                </div>

                {/* Inline check */}
                {(() => {
                  const keyRef = extractJwtProjectRef(anonKeyInput);
                  if (keyRef && keyRef !== activeProjectId) {
                    return (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Warning: This key belongs to project "{keyRef}", not "{activeProjectId}". It will cause "Unregistered API key".</span>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>Where to find your key in Supabase:</span>
                <a
                  href={`https://supabase.com/dashboard/project/${activeProjectId}/settings/api`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold flex items-center gap-1"
                >
                  <span>Project Settings &rarr; API &rarr; Project API keys (anon / public)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Server-Side Secret Key Protection Card */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Full-Stack Architecture & Fallback Resilience
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                When running on full-stack servers, requests are proxied via Node.js Express (<code className="font-mono bg-white/60 dark:bg-slate-900 px-1 py-0.5 rounded">/api/supabase/*</code>). On static hosting environments like Vercel or GitHub Pages, the client smoothly falls back to direct browser-to-Supabase REST API communication with your anon key.
              </p>
              <div className="pt-1 flex items-center gap-3 font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                <span>Active Target: <strong>Project {activeProjectId}</strong></span>
                <span>•</span>
                <span>Endpoint: <strong>{activeSupabaseUrl}</strong></span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Standard Environment Variables Reference:</span>
              <pre className="p-3 rounded-lg bg-[#0F172A] text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`# Client-Side Public Configuration (Vercel & Vite)
VITE_SUPABASE_URL="${activeSupabaseUrl}"
VITE_SUPABASE_ANON_KEY=

# Server-Side Configuration (Cloud Run / Node.js backend)
SUPABASE_URL="${activeSupabaseUrl}"
SUPABASE_SECRET_KEY=`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
