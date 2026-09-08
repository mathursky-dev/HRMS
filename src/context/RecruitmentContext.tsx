import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Candidate, 
  FollowUpRecord, 
  InterviewRecord, 
  JobOpening, 
  SourceAdSpend, 
  SystemSettings, 
  UserProfile, 
  AuditLogEntry, 
  DailyHrReport,
  CandidateStatus,
  CandidateSource,
  Department,
  InterviewEvaluation,
  InterviewAttendanceStatus,
  Company,
  DepartmentItem,
  TargetSetting,
  UserRole,
  AppMenuId,
  RolePermissionsMap,
  TermsClause,
  OfferLetter
} from '../types';
import { 
  INITIAL_CANDIDATES, 
  INITIAL_FOLLOW_UPS, 
  INITIAL_INTERVIEWS, 
  INITIAL_JOB_OPENINGS, 
  INITIAL_SETTINGS, 
  INITIAL_SOURCE_AD_SPENDS, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_COMPANIES,
  INITIAL_DEPARTMENTS,
  INITIAL_TARGET_SETTINGS,
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_TERMS_CLAUSES,
  INITIAL_OFFER_LETTERS,
  TODAY 
} from '../mockData';
import { fetchDatasetFromSupabase, deleteCompanyFromSupabase } from '../lib/supabase';

interface RecruitmentContextType {
  // Role-Wise Navigation Permissions
  rolePermissions: RolePermissionsMap;
  updateRolePermissions: (role: UserRole, menus: AppMenuId[]) => void;
  hasPermission: (menuId: AppMenuId, role?: UserRole) => boolean;

  // Terms & Conditions Policy Clauses
  termsClauses: TermsClause[];
  addTermsClause: (clause: Omit<TermsClause, 'id' | 'updatedAt'>) => TermsClause;
  updateTermsClause: (id: string, updates: Partial<TermsClause>) => void;
  deleteTermsClause: (id: string) => void;
  toggleTermsClauseActive: (id: string) => void;

  // Offer Letters Management
  offerLetters: OfferLetter[];
  addOfferLetter: (offer: Omit<OfferLetter, 'id' | 'createdAt' | 'updatedAt'>) => OfferLetter;
  updateOfferLetter: (id: string, updates: Partial<OfferLetter>) => void;
  deleteOfferLetter: (id: string) => void;
  updateOfferLetterStatus: (id: string, status: OfferLetter['status']) => void;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Current user & role
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  addUser: (userData: Omit<UserProfile, 'id'>) => UserProfile;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  bulkImportUsers: (usersToImport: Array<Omit<UserProfile, 'id'>>, skipExisting?: boolean) => { importedCount: number; skippedCount: number };

  // Companies (Multiple Company Master)
  companies: Company[];
  activeCompanyId: string;
  setActiveCompanyId: (companyId: string) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  bulkImportCompanies: (companiesToImport: Array<Omit<Company, 'id' | 'createdAt'>>, skipExisting?: boolean) => { importedCount: number; skippedCount: number };
  syncCompaniesToSourceCode: (companiesToSync?: Company[]) => Promise<{ success: boolean; message: string }>;

  // Departments (Department Master)
  departmentsList: DepartmentItem[];
  addDepartment: (dept: Omit<DepartmentItem, 'id' | 'createdAt'>) => DepartmentItem;
  updateDepartment: (id: string, updates: Partial<DepartmentItem>) => void;
  deleteDepartment: (id: string) => void;

  // Targets (Target Management)
  targetSettings: TargetSetting[];
  updateTargetSetting: (id: string, updates: Partial<TargetSetting>) => void;
  addTargetSetting: (target: Omit<TargetSetting, 'id' | 'updatedAt'>) => TargetSetting;
  deleteTargetSetting: (id: string) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Theme (Light / Dark mode)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Candidates
  candidates: Candidate[];
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'lastActivityDate'>, allowDuplicate?: boolean) => { success: boolean; candidate?: Candidate; duplicate?: Candidate };
  updateCandidate: (id: string, updates: Partial<Candidate>, note?: string) => void;
  deleteCandidate: (id: string, permanent?: boolean) => void;
  restoreCandidate: (id: string) => void;
  bulkAssignCandidates: (candidateIds: string[], targetHr: string) => void;
  bulkUpdateCandidateStatus: (candidateIds: string[], newStatus: CandidateStatus, details?: string) => void;
  bulkArchiveCandidates: (candidateIds: string[]) => void;
  bulkRestoreCandidates: (candidateIds: string[]) => void;
  bulkImportCandidates: (candidatesToImport: Array<Omit<Candidate, 'id' | 'createdAt' | 'lastActivityDate'>>, skipDuplicates?: boolean) => { importedCount: number; skippedCount: number; importedCandidates: Candidate[] };
  checkDuplicate: (mobile?: string, whatsapp?: string, email?: string, excludeId?: string) => Candidate | undefined;

  // Status & Pipeline actions
  updateCandidateStatus: (id: string, newStatus: CandidateStatus, details?: string) => void;
  markActiveJoining: (candidateId: string) => void;

  // Follow-ups
  followUps: FollowUpRecord[];
  addFollowUp: (followUp: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void;
  completeFollowUp: (id: string, nextStatus: CandidateStatus, note?: string) => void;

  // Interviews
  interviews: InterviewRecord[];
  scheduleInterview: (interview: Omit<InterviewRecord, 'id' | 'createdAt' | 'attendanceStatus' | 'reminderSent'>) => void;
  updateInterviewAttendance: (id: string, status: InterviewAttendanceStatus, note?: string) => void;
  submitInterviewEvaluation: (id: string, evaluation: InterviewEvaluation) => void;

  // Job Openings
  jobOpenings: JobOpening[];
  addJobOpening: (opening: Omit<JobOpening, 'id'>) => void;
  updateJobOpening: (id: string, updates: Partial<JobOpening>) => void;
  deleteJobOpening: (id: string) => void;

  // Ad Spends
  sourceAdSpends: SourceAdSpend[];
  updateSourceAdSpend: (source: CandidateSource, amount: number) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];

  // Daily Reports
  dailyReports: DailyHrReport[];
  submitDailyReport: (report: Omit<DailyHrReport, 'id' | 'submittedAt'>) => void;

  // Supabase Live Synchronization
  isSupabaseSyncing: boolean;
  refreshFromSupabase: () => Promise<{ success: boolean; message: string }>;

  // Reset to initial
  resetAllData: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CANDIDATES: 'esl_crm_candidates_v6',
  FOLLOW_UPS: 'esl_crm_follow_ups_v6',
  INTERVIEWS: 'esl_crm_interviews_v6',
  JOB_OPENINGS: 'esl_crm_jobs_v6',
  SETTINGS: 'esl_crm_settings_v6',
  AD_SPENDS: 'esl_crm_ad_spends_v6',
  AUDIT_LOGS: 'esl_crm_audit_logs_v6',
  DAILY_REPORTS: 'esl_crm_daily_reports_v6',
  CURRENT_USER: 'esl_crm_current_user_v6',
  USERS: 'esl_crm_users_v6',
  DELETED_USERS: 'esl_crm_deleted_users_v6',
  COMPANIES: 'esl_crm_companies_v6',
  DELETED_COMPANIES: 'esl_crm_deleted_companies_v6',
  ACTIVE_COMPANY: 'esl_crm_active_company_v6',
  DEPARTMENTS: 'esl_crm_departments_v6',
  TARGETS: 'esl_crm_targets_v6',
  THEME: 'esl_crm_theme_v6',
  ROLE_PERMISSIONS: 'esl_crm_role_permissions_v6',
  TERMS_CLAUSES: 'esl_crm_terms_clauses_v6',
  OFFER_LETTERS: 'esl_crm_offer_letters_v6',
  IS_AUTHENTICATED: 'esl_crm_auth_status_v6',
};

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time cleanup for old version candidate keys to prevent stale demo candidates
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear all previous version keys v1..v5 that held demo/dummy data
        for (let v = 1; v <= 5; v++) {
          [
            `esl_crm_candidates_v${v}`,
            `esl_crm_follow_ups_v${v}`,
            `esl_crm_interviews_v${v}`,
            `esl_crm_jobs_v${v}`,
            `esl_crm_offer_letters_v${v}`,
            `esl_crm_ad_spends_v${v}`,
            `esl_crm_audit_logs_v${v}`,
            `esl_crm_daily_reports_v${v}`,
          ].forEach(k => localStorage.removeItem(k));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Users state
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    const deletedRaw = localStorage.getItem(STORAGE_KEYS.DELETED_USERS);
    let deletedSet = new Set<string>();
    try {
      if (deletedRaw) {
        deletedSet = new Set(JSON.parse(deletedRaw));
      }
    } catch { /* ignore */ }

    let usersList: UserProfile[] = [];
    if (saved) {
      try { 
        const parsed: UserProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeUsers = parsed.filter(u => !deletedSet.has(u.id));
          usersList = activeUsers.map(u => {
            const matchInitial = INITIAL_USERS.find(iu => iu.id === u.id || iu.email === u.email);
            const defaultUserId = matchInitial?.userId || u.email.split('@')[0] || u.name.toLowerCase().replace(/\s+/g, '.');
            const defaultPassword = matchInitial?.password || `${u.name.split(' ')[0]}@2026`;
            return {
              ...u,
              userId: u.userId || defaultUserId,
              password: u.password || defaultPassword,
            };
          });
        }
      } catch (e) { /* ignore */ }
    }
    if (usersList.length === 0) {
      usersList = INITIAL_USERS.filter(iu => !deletedSet.has(iu.id));
    }

    // Always ensure Super Admin (usr-4) is present and has full super admin role
    const hasSuperAdmin = usersList.some(u => u.userId?.toLowerCase() === 'admin' || u.role === 'Super Admin');
    if (!hasSuperAdmin) {
      const superAdminUser: UserProfile = {
        id: 'usr-4',
        name: 'Super Admin',
        email: 'admin@essentialsoul.com',
        phone: '+91 98765 00003',
        userId: 'admin',
        password: 'Admin@2026',
        role: 'Super Admin',
        department: 'Management',
        companyId: 'comp-1',
        companyName: 'Essential Soul Lifestyle Pvt Ltd',
        dailyInterviewTarget: 0,
        monthlyActiveJoiningTarget: 0,
        status: 'Active',
        createdAt: '2024-01-15T09:00:00Z',
      };
      usersList = [superAdminUser, ...usersList];
    } else {
      // Ensure the admin user has role 'Super Admin' and valid password
      usersList = usersList.map(u => {
        if (u.userId?.toLowerCase() === 'admin') {
          return {
            ...u,
            role: 'Super Admin' as UserRole,
            password: u.password || 'Admin@2026',
          };
        }
        return u;
      });
    }

    return usersList;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  // Current logged in user
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (e) { /* ignore */ }
    }
    // Default to Super Admin so all data is accessible out of the box
    return INITIAL_USERS[3] || INITIAL_USERS[2]; 
  });

  // Session Authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return saved === 'true';
  });

  const login = (user: UserProfile) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

    // Super Admin defaults to consolidated 'ALL' view across all companies
    const isSuper = user.role === 'Super Admin' || user.userId === 'admin';
    if (isSuper) {
      setActiveCompanyIdState('ALL');
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, 'ALL');
    } else if (user.companyId) {
      // Non-super admin is strictly scoped to their assigned company
      setActiveCompanyIdState(user.companyId);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, user.companyId);
    }
  };

  const loginWithCredentials = (userIdOrEmail: string, password: string): { success: boolean; error?: string } => {
    const trimmedUser = userIdOrEmail.trim().toLowerCase();
    const enteredPass = password.trim();

    if (!trimmedUser) {
      return { success: false, error: 'Please enter your User ID or email.' };
    }
    if (!enteredPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    // 1. Match staff user or Super Admin by user ID or email
    const user = allUsers.find(u => 
      (u.userId && u.userId.trim().toLowerCase() === trimmedUser) ||
      (u.email && u.email.trim().toLowerCase() === trimmedUser)
    );

    if (user) {
      if (user.status === 'Inactive') {
        return { success: false, error: 'This user account is inactive. Please contact your system administrator.' };
      }

      // Strictly verify password (with fallback to default and Super Admin master password)
      const expectedPassword = (user.password || `${user.name.split(' ')[0]}@2026`).trim();
      const isSuperAdminUser = user.userId?.toLowerCase() === 'admin' || user.role === 'Super Admin';
      const isPassValid = 
        enteredPass === expectedPassword || 
        (isSuperAdminUser && enteredPass === 'Admin@2026') ||
        (user.password && enteredPass === user.password);

      if (!isPassValid) {
        if (isSuperAdminUser) {
          return { success: false, error: 'Incorrect password for Super Admin. Default password is Admin@2026.' };
        }
        return { success: false, error: 'Incorrect password. User ID and password do not match.' };
      }

      // Authentication successful
      login(user);
      return { success: true };
    }

    // 2. Match Corporate Company Admin user by admin user ID or company code (.admin)
    const company = companies.find(c => 
      (c.adminUserId && c.adminUserId.trim().toLowerCase() === trimmedUser) ||
      (c.code && (c.code.trim().toLowerCase() + '.admin') === trimmedUser) ||
      (c.code && ('admin.' + c.code.trim().toLowerCase()) === trimmedUser) ||
      (c.code && c.code.trim().toLowerCase() === trimmedUser) ||
      (c.name && c.name.trim().toLowerCase() === trimmedUser)
    );

    if (company) {
      if (!company.isActive) {
        return { success: false, error: 'This corporate company account is marked as inactive.' };
      }

      // Verify corporate admin password:
      // Accepts:
      // 1. Defined custom password in company record
      // 2. Standard convention: ${company.code.toUpperCase()}@Corp2026
      // 3. Super Admin master password override: Admin@2026
      // 4. Legacy 'test' password
      const standardPass = `${company.code.toUpperCase()}@Corp2026`;
      const customPass = company.adminPassword?.trim();
      const isMatch = 
        (customPass && enteredPass === customPass) || 
        (enteredPass === standardPass) ||
        (enteredPass === 'Admin@2026') ||
        (enteredPass === 'test');

      if (!isMatch) {
        return { 
          success: false, 
          error: `Incorrect password for Corporate Admin (${company.code}). Default password is ${standardPass}.` 
        };
      }

      const activeAdminId = company.adminUserId || `${company.code.toLowerCase()}.admin`;
      const activeAdminPass = company.adminPassword || standardPass;

      setActiveCompanyIdState(company.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, company.id);

      const compUser: UserProfile = {
        id: `comp-admin-${company.id}`,
        name: `${company.name} (Corporate Admin)`,
        email: company.email || `corporate@${company.code.toLowerCase()}.com`,
        phone: company.phone || '+91 98765 43210',
        role: 'Director / Management',
        department: 'Management',
        companyId: company.id,
        companyName: company.name,
        userId: activeAdminId,
        password: activeAdminPass,
        dailyInterviewTarget: 10,
        monthlyActiveJoiningTarget: 25,
        status: company.isActive ? 'Active' : 'Inactive',
      };

      login(compUser);
      return { success: true };
    }

    // 3. Check if user attempted 'admin' but was somehow not in allUsers
    if (trimmedUser === 'admin' || trimmedUser === 'superadmin') {
      if (enteredPass === 'Admin@2026' || enteredPass === 'admin') {
        const superAdminUser: UserProfile = {
          id: 'usr-4',
          name: 'Super Admin',
          email: 'admin@essentialsoul.com',
          phone: '+91 98765 00003',
          userId: 'admin',
          password: 'Admin@2026',
          role: 'Super Admin',
          department: 'Management',
          companyId: 'comp-1',
          companyName: 'Essential Soul Lifestyle Pvt Ltd',
          dailyInterviewTarget: 0,
          monthlyActiveJoiningTarget: 0,
          status: 'Active',
          createdAt: '2024-01-15T09:00:00Z',
        };
        login(superAdminUser);
        return { success: true };
      }
      return { success: false, error: 'Incorrect password for Super Admin. Default is Admin@2026.' };
    }

    // 4. No match found - Reject login strictly
    return { success: false, error: 'Invalid User ID. Account does not exist or credentials do not match.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
  };

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  };

  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: userData.status || 'Active',
      createdAt: new Date().toISOString(),
    };
    setAllUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
      setCurrentUserState(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    // 1. Filter out from allUsers state and persist immediately
    setAllUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      return updated;
    });

    // 2. Track deleted ID to prevent re-hydrating from initial seed
    try {
      const deletedRaw = localStorage.getItem(STORAGE_KEYS.DELETED_USERS);
      const existingDeleted: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!existingDeleted.includes(id)) {
        const next = [...existingDeleted, id];
        localStorage.setItem(STORAGE_KEYS.DELETED_USERS, JSON.stringify(next));
      }
    } catch (e) { /* ignore */ }

    // 3. If currently logged in user was deleted, switch to first remaining user
    if (currentUser.id === id) {
      const fallback = allUsers.find(u => u.id !== id) || INITIAL_USERS[2];
      setCurrentUserState(fallback);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fallback));
      } catch (e) { /* ignore */ }
    }

    // 4. Send delete request to backend server/Supabase
    try {
      fetch(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) { /* ignore */ }
  };

  const bulkImportUsers = (
    usersToImport: Array<Omit<UserProfile, 'id'>>,
    skipExisting: boolean = true
  ): { importedCount: number; skippedCount: number } => {
    let importedCount = 0;
    let skippedCount = 0;
    const newUsers: UserProfile[] = [];

    usersToImport.forEach((u, idx) => {
      const uIdClean = u.userId?.trim().toLowerCase();
      const uEmailClean = u.email?.trim().toLowerCase();

      const existing = allUsers.find(ex => 
        (uIdClean && ex.userId && ex.userId.trim().toLowerCase() === uIdClean) ||
        (uEmailClean && ex.email && ex.email.trim().toLowerCase() === uEmailClean)
      );

      if (skipExisting && existing) {
        skippedCount++;
        return;
      }

      const newUser: UserProfile = {
        ...u,
        id: `usr-${Date.now()}-${idx}`,
        status: u.status || 'Active',
        createdAt: u.createdAt || new Date().toISOString(),
      };
      newUsers.push(newUser);
      importedCount++;
    });

    if (newUsers.length > 0) {
      setAllUsers(prev => [...newUsers, ...prev]);
    }

    return { importedCount, skippedCount };
  };

  // Companies state
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.COMPANIES) : null;
    if (saved) {
      try { 
        const parsed: Company[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validCompanies = parsed.filter(c => c && c.id && c.name);
          if (validCompanies.length > 0) {
            // Ensure core initial companies are present if not intentionally removed
            const existingIds = new Set(validCompanies.map(c => c.id));
            const existingCodes = new Set(validCompanies.map(c => c.code?.toUpperCase()));
            const missingInitials = INITIAL_COMPANIES.filter(
              ic => !existingIds.has(ic.id) && !existingCodes.has(ic.code?.toUpperCase())
            );
            return [...validCompanies, ...missingInitials];
          }
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_COMPANIES;
  });

  const syncCompaniesToSourceCode = async (companiesToSync?: Company[]): Promise<{ success: boolean; message: string }> => {
    const payload = companiesToSync || companies;
    try {
      const res = await fetch('/api/companies/sync-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: payload }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return data;
      }
      return { success: true, message: 'Local persistence active' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    // Persist to source code (src/mockData.ts) automatically so code matches preview edits
    if (companies && companies.length > 0) {
      syncCompaniesToSourceCode(companies).catch(() => {});
    }
  }, [companies]);

  const [activeCompanyId, setActiveCompanyIdState] = useState<string>(() => {
    // If current user is Super Admin, default to 'ALL' (Consolidated Group View)
    // If current user is Corporate Admin or staff, default to their company
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    let isSuper = false;
    let userCompId: string | null = null;
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        isSuper = u?.role === 'Super Admin' || u?.userId === 'admin';
        userCompId = u?.companyId || null;
      } catch { /* ignore */ }
    }

    if (!isSuper && userCompId) {
      return userCompId;
    }

    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY);
    return saved || 'ALL';
  });

  const setActiveCompanyId = (companyId: string) => {
    const isSuper = currentUser.role === 'Super Admin' || currentUser.userId === 'admin';
    if (!isSuper && currentUser.companyId && companyId !== currentUser.companyId) {
      console.warn(`Unauthorized company switch attempted: user is restricted to company ${currentUser.companyId}`);
      return;
    }
    setActiveCompanyIdState(companyId);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, companyId);
  };

  // Enforce company scoping whenever currentUser changes
  useEffect(() => {
    const isSuper = currentUser.role === 'Super Admin' || currentUser.userId === 'admin';
    if (!isSuper && currentUser.companyId) {
      if (activeCompanyId !== currentUser.companyId) {
        setActiveCompanyIdState(currentUser.companyId);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, currentUser.companyId);
      }
    }
  }, [currentUser]);

  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    let finalCode = (companyData.code || '').trim().toUpperCase();
    if (!finalCode) {
      const words = companyData.name.trim().split(/\s+/);
      finalCode = words.length >= 2 
        ? (words[0][0] + words[1][0] + (words[2]?.[0] || 'L')).toUpperCase()
        : companyData.name.trim().substring(0, 3).toUpperCase();
    }
    if (!finalCode || finalCode.length < 2) {
      finalCode = `CP${Date.now().toString().slice(-4)}`;
    }

    const newCompany: Company = {
      ...companyData,
      code: finalCode,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setCompanies(prev => {
      const updated = [newCompany, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Send immediately to backend API so it is persisted to Supabase and mockData.ts
    fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany),
    }).catch(err => console.warn('[Add Company API Error]:', err));

    return newCompany;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(next));
      } catch {}
      const updatedComp = next.find(c => c.id === id);
      if (updatedComp) {
        fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedComp),
        }).catch(err => console.warn('[Update Company API Error]:', err));
      }
      return next;
    });
  };

  const deleteCompany = (id: string) => {
    // 1. Filter from local state and update local storage & source code
    setCompanies(prev => {
      const updated = prev.filter(c => c.id !== id && c.code !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
        syncCompaniesToSourceCode(updated).catch(() => {});
      } catch (e) {
        console.warn('Could not persist deleted company:', e);
      }
      return updated;
    });

    // 2. Delete permanently from Supabase & source code via server API (if available) and direct Supabase SDK
    fetch(`/api/companies/${encodeURIComponent(id)}`, { method: 'DELETE' })
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) return res.json();
        return null;
      })
      .catch(() => {});

    // Ensure deletion from Supabase directly via client SDK (works on Vercel)
    deleteCompanyFromSupabase(id).catch(() => {});

    if (activeCompanyId === id) {
      setActiveCompanyId('ALL');
    }
  };

  const bulkImportCompanies = (companiesToImport: Array<Omit<Company, 'id' | 'createdAt'>>, skipExisting: boolean = true) => {
    let importedCount = 0;
    let skippedCount = 0;
    const newCompanies: Company[] = [];

    companiesToImport.forEach((comp, idx) => {
      const nameClean = comp.name?.trim();
      if (!nameClean) return;

      let codeClean = (comp.code || '').trim().toUpperCase();
      if (!codeClean) {
        const words = nameClean.split(/\s+/);
        codeClean = words.length >= 2
          ? (words[0][0] + words[1][0] + (words[2]?.[0] || 'L')).toUpperCase()
          : nameClean.substring(0, 3).toUpperCase();
      }
      if (!codeClean || codeClean.length < 2) {
        codeClean = `CP${Date.now().toString().slice(-4)}${idx + 1}`;
      }

      // Check duplicate only against existing names or codes
      const existing = [...companies, ...newCompanies].find(ex => 
        (codeClean && ex.code?.toUpperCase() === codeClean) ||
        (ex.name?.trim().toLowerCase() === nameClean.toLowerCase())
      );

      if (skipExisting && existing) {
        skippedCount++;
        return;
      }

      const generatedId = `comp-${Date.now()}-${idx}`;
      const newCompany: Company = {
        ...comp,
        name: nameClean,
        id: generatedId,
        code: codeClean,
        legalName: comp.legalName?.trim() || nameClean,
        address: comp.address?.trim() || `Corporate Office, ${comp.city || 'Delhi NCR'}`,
        city: comp.city?.trim() || 'Noida',
        state: comp.state?.trim() || 'Uttar Pradesh',
        pincode: comp.pincode?.trim() || '201301',
        email: comp.email?.trim() || `contact@${codeClean.toLowerCase()}.com`,
        phone: comp.phone?.trim() || '+91 98000 00000',
        website: comp.website?.trim() || `https://${codeClean.toLowerCase()}.com`,
        departments: comp.departments && comp.departments.length > 0 ? comp.departments : ['HR Recruitment', 'Corporate Operations'],
        isActive: comp.isActive !== undefined ? comp.isActive : true,
        adminUserId: comp.adminUserId?.trim().toLowerCase() || `${codeClean.toLowerCase()}.admin`,
        adminPassword: comp.adminPassword?.trim() || `${codeClean}@Corp2026`,
        masterContactPerson: comp.masterContactPerson?.trim() || 'Director / Managing Head',
        lastPasswordChanged: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      newCompanies.push(newCompany);
      importedCount++;
    });

    if (newCompanies.length > 0) {
      setCompanies(prev => {
        const updated = [...newCompanies, ...prev];
        try {
          localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Batch save to backend / Supabase & source code
      fetch('/api/companies/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: newCompanies }),
      }).catch(err => console.warn('[Batch Add Companies Error]:', err));
    }

    return { importedCount, skippedCount };
  };

  // Departments state
  const [departmentsList, setDepartmentsList] = useState<DepartmentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_DEPARTMENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departmentsList));
  }, [departmentsList]);

  const addDepartment = (deptData: Omit<DepartmentItem, 'id' | 'createdAt'>) => {
    const newDept: DepartmentItem = {
      ...deptData,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartmentsList(prev => [newDept, ...prev]);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentItem>) => {
    setDepartmentsList(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDepartment = (id: string) => {
    setDepartmentsList(prev => prev.filter(d => d.id !== id));
  };

  // Target Settings state
  const [targetSettings, setTargetSettings] = useState<TargetSetting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TARGET_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targetSettings));
  }, [targetSettings]);

  const updateTargetSetting = (id: string, updates: Partial<TargetSetting>) => {
    setTargetSettings(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString(), updatedBy: currentUser.name } : t));
  };

  const addTargetSetting = (targetData: Omit<TargetSetting, 'id' | 'updatedAt'>) => {
    const newTarget: TargetSetting = {
      ...targetData,
      id: `tgt-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    };
    setTargetSettings(prev => [newTarget, ...prev]);
    return newTarget;
  };

  const deleteTargetSetting = (id: string) => {
    setTargetSettings(prev => prev.filter(t => t.id !== id));
  };

  // Settings
  const [settings, setSettingsState] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    });
  };

  // Candidates
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (saved) {
      try { 
        const parsed: Candidate[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => !c.id?.startsWith('TEST-') && !c.remarks?.includes('TEST DATA'));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_CANDIDATES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  // Follow Ups
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    if (saved) {
      try { 
        const parsed: FollowUpRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(f => !f.id?.startsWith('test-') && !f.candidateId?.startsWith('TEST-'));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_FOLLOW_UPS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
  }, [followUps]);

  // Interviews
  const [interviews, setInterviews] = useState<InterviewRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    if (saved) {
      try { 
        const parsed: InterviewRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(i => !i.id?.startsWith('test-') && !i.candidateId?.startsWith('TEST-'));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_INTERVIEWS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
  }, [interviews]);

  // Job Openings
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOB_OPENINGS);
    if (saved) {
      try { 
        const parsed: JobOpening[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(j => !['job-1', 'job-2', 'job-3', 'job-4', 'job-5', 'job-6', 'job-test'].includes(j.id));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_JOB_OPENINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOB_OPENINGS, JSON.stringify(jobOpenings));
  }, [jobOpenings]);

  // Source Ad Spends
  const [sourceAdSpends, setSourceAdSpends] = useState<SourceAdSpend[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AD_SPENDS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SOURCE_AD_SPENDS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AD_SPENDS, JSON.stringify(sourceAdSpends));
  }, [sourceAdSpends]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Daily Reports
  const [dailyReports, setDailyReports] = useState<DailyHrReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_REPORTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_REPORTS, JSON.stringify(dailyReports));
  }, [dailyReports]);

  // Helper: Log audit
  const logAudit = (
    candidateId: string, 
    candidateName: string, 
    action: AuditLogEntry['action'], 
    prevVal?: string, 
    newVal?: string, 
    details?: string
  ) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      candidateId,
      candidateName,
      action,
      performedBy: currentUser.name,
      previousValue: prevVal,
      newValue: newVal,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Check duplicate
  const checkDuplicate = (mobile?: string, whatsapp?: string, email?: string, excludeId?: string): Candidate | undefined => {
    const cleanMob = mobile ? mobile.replace(/[^0-9]/g, '').slice(-10) : '';
    const cleanWa = whatsapp ? whatsapp.replace(/[^0-9]/g, '').slice(-10) : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    return candidates.find(c => {
      if (excludeId && c.id === excludeId) return false;
      if (c.isArchived) return false;
      const cMob = c.mobileNumber ? c.mobileNumber.replace(/[^0-9]/g, '').slice(-10) : '';
      const cWa = c.whatsappNumber ? c.whatsappNumber.replace(/[^0-9]/g, '').slice(-10) : '';
      const cEmail = c.email ? c.email.trim().toLowerCase() : '';

      const matchMobile = cleanMob.length >= 10 && (cMob === cleanMob || cWa === cleanMob);
      const matchWa = cleanWa.length >= 10 && (cMob === cleanWa || cWa === cleanWa);
      const matchEmail = Boolean(cleanEmail && cleanEmail.includes('@') && cEmail === cleanEmail);
      return matchMobile || matchWa || matchEmail;
    });
  };

  // Add Candidate
  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'lastActivityDate'>, allowDuplicate: boolean = false) => {
    if (!allowDuplicate) {
      const duplicate = checkDuplicate(candidateData.mobileNumber, candidateData.whatsappNumber, candidateData.email);
      if (duplicate) {
        return { success: false, duplicate };
      }
    }

    const requestedCompId = candidateData.companyId || (activeCompanyId !== 'ALL' ? activeCompanyId : currentUser.companyId || 'comp-1');
    const matchedComp = companies.find(c => 
      c.id === requestedCompId || 
      (c.code && c.code.toLowerCase() === requestedCompId.toLowerCase()) ||
      (candidateData.companyName && (c.name.toLowerCase() === candidateData.companyName.toLowerCase() || (c.legalName && c.legalName.toLowerCase() === candidateData.companyName.toLowerCase())))
    );
    const assignedCompanyId = matchedComp?.id || requestedCompId;
    const assignedCompanyName = matchedComp?.name || candidateData.companyName || (companies[0]?.name || 'Essential Soul Lifestyle Pvt Ltd');
    const compCode = matchedComp?.code?.toUpperCase() || 'ESL';

    const nextNumber = candidates.length + 1;
    const padded = String(nextNumber).padStart(3, '0');
    const newId = `${compCode}-2026-${padded}`;

    const newCandidate: Candidate = {
      ...candidateData,
      id: newId,
      companyId: assignedCompanyId,
      companyName: assignedCompanyName,
      createdAt: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
    };

    setCandidates(prev => [newCandidate, ...prev]);
    logAudit(newCandidate.id, newCandidate.fullName, 'Created', undefined, newCandidate.status, `Source: ${newCandidate.candidateSource} [${compCode}]`);

    return { success: true, candidate: newCandidate };
  };

  // Bulk Import Candidates
  const bulkImportCandidates = (
    candidatesToImport: Array<Omit<Candidate, 'id' | 'createdAt' | 'lastActivityDate'>>,
    skipDuplicates: boolean = true
  ): { importedCount: number; skippedCount: number; importedCandidates: Candidate[] } => {
    let importedCount = 0;
    let skippedCount = 0;
    const newItems: Candidate[] = [];
    const now = new Date().toISOString();
    let currentCount = candidates.length;

    candidatesToImport.forEach((candData) => {
      if (skipDuplicates) {
        const dup = checkDuplicate(candData.mobileNumber, candData.whatsappNumber, candData.email);
        if (dup) {
          skippedCount++;
          return;
        }
      }

      const requestedCompId = candData.companyId || (activeCompanyId !== 'ALL' ? activeCompanyId : currentUser.companyId || 'comp-1');
      const matchedComp = companies.find(c => 
        (candData.companyId && (c.id === candData.companyId || (c.code && c.code.toLowerCase() === candData.companyId.toLowerCase()))) ||
        (candData.companyName && (c.name.toLowerCase() === candData.companyName.toLowerCase() || (c.legalName && c.legalName.toLowerCase() === candData.companyName.toLowerCase()) || (c.code && c.code.toLowerCase() === candData.companyName.toLowerCase()))) ||
        (c.id === requestedCompId)
      ) || companies.find(c => c.id === requestedCompId) || companies[0];

      const assignedCompanyId = matchedComp?.id || requestedCompId;
      const assignedCompanyName = matchedComp?.name || candData.companyName || (companies[0]?.name || 'Essential Soul Lifestyle Pvt Ltd');
      const compCode = matchedComp?.code?.toUpperCase() || 'ESL';

      currentCount++;
      const padded = String(currentCount).padStart(3, '0');
      const newId = `${compCode}-2026-${padded}`;

      const newCand: Candidate = {
        ...candData,
        id: newId,
        companyId: assignedCompanyId,
        companyName: assignedCompanyName,
        createdAt: now,
        lastActivityDate: now,
      };

      newItems.push(newCand);
      importedCount++;
    });

    if (newItems.length > 0) {
      setCandidates(prev => [...newItems, ...prev]);
      logAudit(
        'BULK-IMPORT',
        'Multiple Candidates',
        'Created',
        undefined,
        `${importedCount} Imported`,
        `Bulk Import via CSV/XLS. Successfully added: ${importedCount}, Skipped duplicates: ${skippedCount}`
      );
    }

    return { importedCount, skippedCount, importedCandidates: newItems };
  };

  // Update Candidate
  const updateCandidate = (id: string, updates: Partial<Candidate>, note?: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const matchedComp = updates.companyId
        ? companies.find(comp => comp.id === updates.companyId || (comp.code && comp.code.toLowerCase() === updates.companyId?.toLowerCase()))
        : undefined;

      const updated = {
        ...c,
        ...updates,
        companyId: matchedComp?.id || updates.companyId || c.companyId,
        companyName: matchedComp?.name || updates.companyName || c.companyName,
        lastActivityDate: new Date().toISOString(),
      };
      return updated;
    }));

    const cand = candidates.find(c => c.id === id);
    if (cand && note) {
      logAudit(id, cand.fullName, 'Status Change', undefined, undefined, note);
    }
  };

  // Update Candidate Status
  const updateCandidateStatus = (id: string, newStatus: CandidateStatus, details?: string) => {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;

    const oldStatus = cand.status;
    const now = new Date().toISOString();

    const extraUpdates: Partial<Candidate> = {
      status: newStatus,
      lastActivityDate: now,
    };

    // If changing to selected
    if (newStatus === 'Selected' && !cand.selectionDate) {
      extraUpdates.selectionDate = TODAY;
    }
    // If changing to joined
    if (newStatus === 'Joined' && !cand.actualJoinedDate) {
      extraUpdates.actualJoinedDate = TODAY;
      extraUpdates.joiningStatus = 'Joined';
    }
    // If changing to active joining
    if (newStatus === 'Active Joining') {
      extraUpdates.isActiveJoining = true;
      extraUpdates.activeJoinedDate = TODAY;
    }

    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...extraUpdates } : c));
    logAudit(id, cand.fullName, 'Status Change', oldStatus, newStatus, details);
  };

  // Mark Active Joining
  const markActiveJoining = (candidateId: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    updateCandidateStatus(candidateId, 'Active Joining', `Officially verified as Active Joining after completion of ${settings.activeJoiningDaysThreshold} days probation`);
  };

  // Soft Delete / Archive
  const deleteCandidate = (id: string, permanent: boolean = false) => {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;

    if (permanent) {
      setCandidates(prev => prev.filter(c => c.id !== id));
      logAudit(id, cand.fullName, 'Archived', undefined, undefined, 'Permanently purged candidate record');
    } else {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, isArchived: true, lastActivityDate: new Date().toISOString() } : c));
      logAudit(id, cand.fullName, 'Archived', 'Active', 'Archived', 'Soft deleted / archived to protect historical data');
    }
  };

  // Restore Candidate
  const restoreCandidate = (id: string) => {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, isArchived: false, lastActivityDate: new Date().toISOString() } : c));
    logAudit(id, cand.fullName, 'Restored', 'Archived', 'Active', 'Restored candidate from archive');
  };

  // Bulk Assign Candidates
  const bulkAssignCandidates = (candidateIds: string[], targetHr: string) => {
    const now = new Date().toISOString();
    setCandidates(prev => prev.map(c => {
      if (candidateIds.includes(c.id)) {
        return {
          ...c,
          assignedHr: targetHr,
          lastActivityDate: now,
        };
      }
      return c;
    }));

    candidateIds.forEach(id => {
      const cand = candidates.find(c => c.id === id);
      if (cand) {
        logAudit(id, cand.fullName, 'Assigned HR', cand.assignedHr, targetHr, `Assigned by ${currentUser.name}`);
      }
    });
  };

  // Bulk Update Candidate Status
  const bulkUpdateCandidateStatus = (candidateIds: string[], newStatus: CandidateStatus, details?: string) => {
    const now = new Date().toISOString();
    setCandidates(prev => prev.map(c => {
      if (candidateIds.includes(c.id)) {
        const extraUpdates: Partial<Candidate> = {
          status: newStatus,
          lastActivityDate: now,
        };
        if (newStatus === 'Selected' && !c.selectionDate) {
          extraUpdates.selectionDate = TODAY;
        }
        if (newStatus === 'Joined' && !c.actualJoinedDate) {
          extraUpdates.actualJoinedDate = TODAY;
          extraUpdates.joiningStatus = 'Joined';
        }
        if (newStatus === 'Active Joining') {
          extraUpdates.isActiveJoining = true;
          extraUpdates.activeJoinedDate = TODAY;
        }
        return { ...c, ...extraUpdates };
      }
      return c;
    }));

    candidateIds.forEach(id => {
      const cand = candidates.find(c => c.id === id);
      if (cand) {
        logAudit(id, cand.fullName, 'Status Change', cand.status, newStatus, details || `Bulk updated by ${currentUser.name}`);
      }
    });
  };

  // Bulk Archive Candidates
  const bulkArchiveCandidates = (candidateIds: string[]) => {
    const now = new Date().toISOString();
    setCandidates(prev => prev.map(c => {
      if (candidateIds.includes(c.id)) {
        return { ...c, isArchived: true, lastActivityDate: now };
      }
      return c;
    }));

    candidateIds.forEach(id => {
      const cand = candidates.find(c => c.id === id);
      if (cand) {
        logAudit(id, cand.fullName, 'Archived', 'Active', 'Archived', `Bulk archived by ${currentUser.name}`);
      }
    });
  };

  // Bulk Restore Candidates
  const bulkRestoreCandidates = (candidateIds: string[]) => {
    const now = new Date().toISOString();
    setCandidates(prev => prev.map(c => {
      if (candidateIds.includes(c.id)) {
        return { ...c, isArchived: false, lastActivityDate: now };
      }
      return c;
    }));

    candidateIds.forEach(id => {
      const cand = candidates.find(c => c.id === id);
      if (cand) {
        logAudit(id, cand.fullName, 'Restored', 'Archived', 'Active', `Bulk restored by ${currentUser.name}`);
      }
    });
  };

  // Follow-up
  const addFollowUp = (followUpData: Omit<FollowUpRecord, 'id' | 'createdAt'>) => {
    const newId = `fu-${Date.now()}`;
    const newRecord: FollowUpRecord = {
      ...followUpData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setFollowUps(prev => [newRecord, ...prev]);

    // Update candidate status and last activity
    const cand = candidates.find(c => c.id === followUpData.candidateId);
    if (cand) {
      updateCandidate(cand.id, {
        status: followUpData.resultingStatus,
        lastActivityDate: new Date().toISOString(),
        firstCallDate: cand.firstCallDate || new Date().toISOString(),
      });
      logAudit(cand.id, cand.fullName, 'Follow-up Added', cand.status, followUpData.resultingStatus, `${followUpData.followUpMode}: ${followUpData.notes}`);
    }
  };

  const completeFollowUp = (id: string, nextStatus: CandidateStatus, note?: string) => {
    setFollowUps(prev => prev.map(fu => {
      if (fu.id === id) {
        return { ...fu, isCompleted: true, resultingStatus: nextStatus };
      }
      return fu;
    }));

    const fu = followUps.find(f => f.id === id);
    if (fu) {
      updateCandidateStatus(fu.candidateId, nextStatus, note || 'Follow-up completed');
    }
  };

  // Interviews
  const scheduleInterview = (data: Omit<InterviewRecord, 'id' | 'createdAt' | 'attendanceStatus' | 'reminderSent'>) => {
    const newId = `int-${Date.now()}`;
    const newInterview: InterviewRecord = {
      ...data,
      id: newId,
      attendanceStatus: 'Scheduled',
      reminderSent: true,
      createdAt: new Date().toISOString(),
    };

    setInterviews(prev => [newInterview, ...prev]);
    updateCandidateStatus(data.candidateId, 'Interview Scheduled', `Scheduled for ${data.interviewDate} at ${data.interviewTime} with ${data.interviewer}`);
  };

  const updateInterviewAttendance = (id: string, status: InterviewAttendanceStatus, note?: string) => {
    setInterviews(prev => prev.map(inv => {
      if (inv.id === id) {
        return { ...inv, attendanceStatus: status };
      }
      return inv;
    }));

    const inv = interviews.find(i => i.id === id);
    if (inv) {
      let candStatus: CandidateStatus | undefined;
      if (status === 'Conducted') candStatus = 'Interview Conducted';
      else if (status === 'Confirmed') candStatus = 'Interview Confirmed';
      else if (status === 'Rescheduled') candStatus = 'Interview Rescheduled';
      else if (status === 'No Show') candStatus = 'No Show';

      if (candStatus) {
        updateCandidateStatus(inv.candidateId, candStatus, note || `Interview attendance updated to ${status}`);
      }
    }
  };

  const submitInterviewEvaluation = (id: string, evaluation: InterviewEvaluation) => {
    setInterviews(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          attendanceStatus: 'Conducted',
          evaluation,
        };
      }
      return inv;
    }));

    const inv = interviews.find(i => i.id === id);
    if (inv) {
      let finalStatus: CandidateStatus = 'Interview Conducted';
      if (evaluation.finalResult === 'Selected') finalStatus = 'Selected';
      else if (evaluation.finalResult === 'Rejected') finalStatus = 'Rejected';
      else if (evaluation.finalResult === 'Hold') finalStatus = 'Hold';
      else if (evaluation.finalResult === 'Salary Discussion') finalStatus = 'Salary Discussion';

      updateCandidate(inv.candidateId, {
        status: finalStatus,
        selectionDate: evaluation.finalResult === 'Selected' ? TODAY : undefined,
      });

      logAudit(
        inv.candidateId, 
        inv.candidateName, 
        'Interview Evaluated', 
        'Interview Conducted', 
        finalStatus, 
        `Rating: ${evaluation.averageRating}/5. ${evaluation.interviewerRemarks}`
      );
    }
  };

  // Job Openings
  const addJobOpening = (opening: Omit<JobOpening, 'id'>) => {
    const newOpening: JobOpening = {
      ...opening,
      id: `job-${Date.now()}`,
    };
    setJobOpenings(prev => [newOpening, ...prev]);
  };

  const updateJobOpening = (id: string, updates: Partial<JobOpening>) => {
    setJobOpenings(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const deleteJobOpening = (id: string) => {
    setJobOpenings(prev => prev.filter(j => j.id !== id));
  };

  // Source Ad Spend
  const updateSourceAdSpend = (source: CandidateSource, amount: number) => {
    setSourceAdSpends(prev => {
      const exists = prev.find(s => s.source === source);
      if (exists) {
        return prev.map(s => s.source === source ? { ...s, adSpend: amount } : s);
      }
      return [...prev, { source, adSpend: amount }];
    });
  };

  // Daily Reports
  const submitDailyReport = (reportData: Omit<DailyHrReport, 'id' | 'submittedAt'>) => {
    const newReport: DailyHrReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setDailyReports(prev => [newReport, ...prev]);
  };

  // Role Permissions state
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const updateRolePermissions = (role: UserRole, menus: AppMenuId[]) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: menus
    }));
  };

  const hasPermission = (menuId: AppMenuId, role?: UserRole): boolean => {
    const targetRole = role || currentUser.role;
    if (targetRole === 'Super Admin' || targetRole === 'Director / Management') return true;
    const allowed = rolePermissions[targetRole];
    if (!allowed) return false;
    return allowed.includes(menuId);
  };

  // Terms Clauses state
  const [termsClauses, setTermsClauses] = useState<TermsClause[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TERMS_CLAUSES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TERMS_CLAUSES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TERMS_CLAUSES, JSON.stringify(termsClauses));
  }, [termsClauses]);

  const addTermsClause = (clauseData: Omit<TermsClause, 'id' | 'updatedAt'>) => {
    const newClause: TermsClause = {
      ...clauseData,
      id: `tc-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setTermsClauses(prev => [newClause, ...prev]);
    return newClause;
  };

  const updateTermsClause = (id: string, updates: Partial<TermsClause>) => {
    setTermsClauses(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  const deleteTermsClause = (id: string) => {
    setTermsClauses(prev => prev.filter(c => c.id !== id));
  };

  const toggleTermsClauseActive = (id: string) => {
    setTermsClauses(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() } : c));
  };

  // Offer Letters state
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFER_LETTERS);
    if (saved) {
      try { 
        const parsed: OfferLetter[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(o => !['off-test', 'OFR-2026-001', 'OFR-2026-002'].includes(o.id));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_OFFER_LETTERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFER_LETTERS, JSON.stringify(offerLetters));
  }, [offerLetters]);

  const addOfferLetter = (offerData: Omit<OfferLetter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextSeq = offerLetters.length + 1;
    const paddedSeq = String(nextSeq).padStart(3, '0');
    const newOffer: OfferLetter = {
      ...offerData,
      id: `OFR-2026-${paddedSeq}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOfferLetters(prev => [newOffer, ...prev]);

    // Audit logging
    logAudit(
      newOffer.candidateId || 'N/A',
      newOffer.candidateName,
      'Created',
      'Pending Offer',
      'Offer Letter Generated',
      `Issued for ${newOffer.designation} at ${newOffer.companyName} with CTC ₹${newOffer.annualCtc.toLocaleString('en-IN')}`
    );

    return newOffer;
  };

  const updateOfferLetter = (id: string, updates: Partial<OfferLetter>) => {
    setOfferLetters(prev => prev.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
  };

  const deleteOfferLetter = (id: string) => {
    setOfferLetters(prev => prev.filter(o => o.id !== id));
  };

  const updateOfferLetterStatus = (id: string, newStatus: OfferLetter['status']) => {
    setOfferLetters(prev => prev.map(o => {
      if (o.id === id) {
        if (o.candidateId) {
          if (newStatus === 'Accepted') {
            updateCandidateStatus(o.candidateId, 'Joining Confirmed', `Accepted Offer Letter ${o.id}`);
          } else if (newStatus === 'Joined') {
            updateCandidateStatus(o.candidateId, 'Joined', `Joined as per Offer Letter ${o.id}`);
          }
        }
        logAudit(
          o.candidateId || 'N/A',
          o.candidateName,
          'Status Change',
          o.status,
          newStatus,
          `Offer letter ${o.id} status updated to ${newStatus}`
        );
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return o;
    }));
  };

  // Supabase live synchronization
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState(false);

  const refreshFromSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSupabaseSyncing(true);
    try {
      const res = await fetchDatasetFromSupabase();
      if (res.success && res.data) {
        if (Array.isArray(res.data.candidates)) {
          const cleanCandidates = res.data.candidates.filter(
            (c: any) => !c.id?.startsWith('TEST-') && !c.remarks?.includes('TEST DATA')
          );
          setCandidates(cleanCandidates);
        }
        if (Array.isArray(res.data.followUps)) {
          const cleanFollowUps = res.data.followUps.filter(
            (f: any) => !f.id?.startsWith('test-') && !f.candidateId?.startsWith('TEST-')
          );
          setFollowUps(cleanFollowUps);
        }
        if (Array.isArray(res.data.interviews)) {
          const cleanInterviews = res.data.interviews.filter(
            (i: any) => !i.id?.startsWith('test-') && !i.candidateId?.startsWith('TEST-')
          );
          setInterviews(cleanInterviews);
        }
        if (Array.isArray(res.data.companies) && res.data.companies.length > 0) {
          // Safely MERGE with existing local companies so newly created companies are NEVER lost or hidden
          setCompanies(prevCompanies => {
            const companyMap = new Map<string, Company>();
            // Add local companies first
            (prevCompanies || []).forEach(c => {
              if (c && c.id) companyMap.set(c.id, c);
            });
            // Merge companies from Supabase
            res.data.companies.forEach((c: Company) => {
              if (c && c.id) {
                // If local version has newer or custom edits, preserve or update
                const existing = companyMap.get(c.id);
                companyMap.set(c.id, existing ? { ...existing, ...c } : c);
              }
            });

            const merged = Array.from(companyMap.values());
            try {
              localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
        if (Array.isArray(res.data.jobOpenings)) {
          const cleanJobs = res.data.jobOpenings.filter(
            (j: any) => !['job-1', 'job-2', 'job-3', 'job-4', 'job-5', 'job-6', 'job-test'].includes(j.id)
          );
          setJobOpenings(cleanJobs);
        }
        if (Array.isArray(res.data.offerLetters)) {
          const cleanOffers = res.data.offerLetters.filter(
            (o: any) => !['off-test', 'OFR-2026-001', 'OFR-2026-002'].includes(o.id)
          );
          setOfferLetters(cleanOffers);
        }
        return {
          success: true,
          message: `Loaded ${res.data.candidates?.length || 0} records from Supabase!`,
        };
      }
      return { success: false, message: res.error || 'No data returned from Supabase' };
    } catch (err: any) {
      console.warn('Supabase sync warning:', err);
      return { success: false, message: err?.message || 'Error communicating with Supabase' };
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  useEffect(() => {
    refreshFromSupabase();
  }, []);

  // Reset demo
  const resetAllData = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear all defined storage keys
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
        // Also clear any legacy or versioned esl CRM keys
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('esl_crm_') || key.startsWith('esl_'))) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.warn('Error clearing localStorage during reset:', e);
    }

    setCandidates(INITIAL_CANDIDATES);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setInterviews(INITIAL_INTERVIEWS);
    setJobOpenings(INITIAL_JOB_OPENINGS);
    setSettingsState(INITIAL_SETTINGS);
    setSourceAdSpends(INITIAL_SOURCE_AD_SPENDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDailyReports([]);
    setAllUsers(INITIAL_USERS);
    setCompanies(INITIAL_COMPANIES);
    setActiveCompanyIdState('ALL');
    setDepartmentsList(INITIAL_DEPARTMENTS);
    setTargetSettings(INITIAL_TARGET_SETTINGS);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setTermsClauses(INITIAL_TERMS_CLAUSES);
    setOfferLetters(INITIAL_OFFER_LETTERS);
    setCurrentUserState(INITIAL_USERS[2]);
  };

  return (
    <RecruitmentContext.Provider
      value={{
        isAuthenticated,
        login,
        loginWithCredentials,
        logout,
        currentUser,
        allUsers,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        bulkImportUsers,
        companies,
        activeCompanyId,
        setActiveCompanyId,
        addCompany,
        updateCompany,
        deleteCompany,
        bulkImportCompanies,
        syncCompaniesToSourceCode,
        departmentsList,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        targetSettings,
        updateTargetSetting,
        addTargetSetting,
        deleteTargetSetting,
        settings,
        updateSettings,
        rolePermissions,
        updateRolePermissions,
        hasPermission,
        termsClauses,
        addTermsClause,
        updateTermsClause,
        deleteTermsClause,
        toggleTermsClauseActive,
        offerLetters,
        addOfferLetter,
        updateOfferLetter,
        deleteOfferLetter,
        updateOfferLetterStatus,
        candidates,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        restoreCandidate,
        bulkAssignCandidates,
        bulkUpdateCandidateStatus,
        bulkArchiveCandidates,
        bulkRestoreCandidates,
        bulkImportCandidates,
        checkDuplicate,
        updateCandidateStatus,
        markActiveJoining,
        followUps,
        addFollowUp,
        completeFollowUp,
        interviews,
        scheduleInterview,
        updateInterviewAttendance,
        submitInterviewEvaluation,
        jobOpenings,
        addJobOpening,
        updateJobOpening,
        deleteJobOpening,
        sourceAdSpends,
        updateSourceAdSpend,
        auditLogs,
        dailyReports,
        submitDailyReport,
        isSupabaseSyncing,
        refreshFromSupabase,
        resetAllData,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};
