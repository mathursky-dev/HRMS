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

  // Reset to initial
  resetAllData: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CANDIDATES: 'esl_crm_candidates_v4',
  FOLLOW_UPS: 'esl_crm_follow_ups_v4',
  INTERVIEWS: 'esl_crm_interviews_v4',
  JOB_OPENINGS: 'esl_crm_jobs_v4',
  SETTINGS: 'esl_crm_settings_v4',
  AD_SPENDS: 'esl_crm_ad_spends_v4',
  AUDIT_LOGS: 'esl_crm_audit_logs_v4',
  DAILY_REPORTS: 'esl_crm_daily_reports_v4',
  CURRENT_USER: 'esl_crm_current_user_v4',
  USERS: 'esl_crm_users_v4',
  COMPANIES: 'esl_crm_companies_v4',
  ACTIVE_COMPANY: 'esl_crm_active_company_v4',
  DEPARTMENTS: 'esl_crm_departments_v4',
  TARGETS: 'esl_crm_targets_v4',
  THEME: 'esl_crm_theme_v4',
  ROLE_PERMISSIONS: 'esl_crm_role_permissions_v4',
  TERMS_CLAUSES: 'esl_crm_terms_clauses_v4',
  OFFER_LETTERS: 'esl_crm_offer_letters_v4',
  IS_AUTHENTICATED: 'esl_crm_auth_status_v4',
};

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time cleanup for old version candidate keys to prevent stale demo candidates
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        ['esl_crm_candidates_v1', 'esl_crm_candidates_v2', 'esl_crm_candidates_v3',
         'esl_crm_follow_ups_v1', 'esl_crm_follow_ups_v2', 'esl_crm_follow_ups_v3',
         'esl_crm_interviews_v1', 'esl_crm_interviews_v2', 'esl_crm_interviews_v3',
         'esl_crm_offer_letters_v1', 'esl_crm_offer_letters_v2', 'esl_crm_offer_letters_v3',
         'esl_crm_audit_logs_v1', 'esl_crm_audit_logs_v2', 'esl_crm_audit_logs_v3'].forEach(k => {
          localStorage.removeItem(k);
        });
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
    if (saved) {
      try { 
        const parsed: UserProfile[] = JSON.parse(saved);
        return parsed.map(u => {
          const matchInitial = INITIAL_USERS.find(iu => iu.id === u.id || iu.email === u.email);
          const defaultUserId = matchInitial?.userId || u.email.split('@')[0] || u.name.toLowerCase().replace(/\s+/g, '.');
          const defaultPassword = matchInitial?.password || `${u.name.split(' ')[0]}@2026`;
          return {
            ...u,
            userId: u.userId || defaultUserId,
            password: u.password || defaultPassword,
          };
        });
      } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  // Current logged in user
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS[2]; // Default to Aditya Mathur (Director / Management)
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

    // 1. Match staff user by user ID or email
    const user = allUsers.find(u => 
      (u.userId && u.userId.trim().toLowerCase() === trimmedUser) ||
      (u.email && u.email.trim().toLowerCase() === trimmedUser)
    );

    if (user) {
      if (user.status === 'Inactive') {
        return { success: false, error: 'This user account is inactive. Please contact your system administrator.' };
      }

      // Strictly verify password
      const expectedPassword = (user.password || `${user.name.split(' ')[0]}@2026`).trim();
      if (enteredPass !== expectedPassword) {
        return { success: false, error: 'Incorrect password. User ID and password do not match.' };
      }

      // Authentication successful
      login(user);
      return { success: true };
    }

    // 2. Match Corporate Company Admin user by admin user ID or company code (.admin)
    const company = companies.find(c => 
      (c.adminUserId && c.adminUserId.trim().toLowerCase() === trimmedUser) ||
      (c.code && (c.code.trim().toLowerCase() + '.admin') === trimmedUser)
    );

    if (company) {
      if (!company.isActive) {
        return { success: false, error: 'This corporate company account is marked as inactive.' };
      }

      // Strictly verify corporate admin password
      const expectedCompPassword = (company.adminPassword || `${company.code.toUpperCase()}@Corp2026`).trim();
      if (enteredPass !== expectedCompPassword) {
        return { success: false, error: 'Incorrect password for Corporate Admin account.' };
      }

      setActiveCompanyIdState(company.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, company.id);

      const compUser: UserProfile = {
        id: `comp-admin-${company.id}`,
        name: `${company.name} (Corporate Admin)`,
        email: company.email,
        role: 'Director / Management',
        department: 'Management',
        companyId: company.id,
        companyName: company.name,
        userId: company.adminUserId || `${company.code.toLowerCase()}.admin`,
        password: company.adminPassword || `${company.code.toUpperCase()}@Corp2026`,
        dailyInterviewTarget: 10,
        monthlyActiveJoiningTarget: 25,
        status: company.isActive ? 'Active' : 'Inactive',
      };

      login(compUser);
      return { success: true };
    }

    // 3. No match found - Reject login strictly
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
    setAllUsers(prev => prev.filter(u => u.id !== id));
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
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (saved) {
      try { 
        const parsed: Company[] = JSON.parse(saved);
        return parsed.map(c => {
          if (!c.adminUserId || !c.adminPassword) {
            const initial = INITIAL_COMPANIES.find(ic => ic.id === c.id || ic.code === c.code);
            return {
              ...c,
              adminUserId: c.adminUserId || initial?.adminUserId || `${c.code.toLowerCase()}.admin`,
              adminPassword: c.adminPassword || initial?.adminPassword || `${c.code.toUpperCase()}@Corp2026`,
              masterContactPerson: c.masterContactPerson || initial?.masterContactPerson || 'Director / Managing Head',
            };
          }
          return c;
        });
      } catch (e) { /* ignore */ }
    }
    return INITIAL_COMPANIES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  const [activeCompanyId, setActiveCompanyIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY);
    return saved || 'ALL';
  });

  const setActiveCompanyId = (companyId: string) => {
    setActiveCompanyIdState(companyId);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY, companyId);
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist deleted company:', e);
      }
      return updated;
    });
    if (activeCompanyId === id) {
      setActiveCompanyId('ALL');
    }
  };

  const bulkImportCompanies = (companiesToImport: Array<Omit<Company, 'id' | 'createdAt'>>, skipExisting: boolean = true) => {
    let importedCount = 0;
    let skippedCount = 0;
    const newCompanies: Company[] = [];

    companiesToImport.forEach((comp, idx) => {
      const codeClean = comp.code?.trim().toUpperCase();
      const nameClean = comp.name?.trim().toLowerCase();
      const adminIdClean = comp.adminUserId?.trim().toLowerCase();

      const existing = companies.find(ex => 
        (codeClean && ex.code.toUpperCase() === codeClean) ||
        (nameClean && ex.name.toLowerCase() === nameClean) ||
        (adminIdClean && ex.adminUserId && ex.adminUserId.toLowerCase() === adminIdClean)
      );

      if (skipExisting && existing) {
        skippedCount++;
        return;
      }

      const newCompany: Company = {
        ...comp,
        id: `comp-${Date.now()}-${idx}`,
        code: comp.code?.trim().toUpperCase() || 'CORP',
        adminUserId: comp.adminUserId?.trim().toLowerCase() || `${comp.code?.trim().toLowerCase() || 'corp'}.admin`,
        adminPassword: comp.adminPassword?.trim() || `${comp.code?.trim().toUpperCase() || 'CORP'}@Corp2026`,
        masterContactPerson: comp.masterContactPerson?.trim() || 'Director',
        lastPasswordChanged: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      newCompanies.push(newCompany);
      importedCount++;
    });

    if (newCompanies.length > 0) {
      setCompanies(prev => [...newCompanies, ...prev]);
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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

    const nextNumber = candidates.length + 1;
    const padded = String(nextNumber).padStart(3, '0');
    const newId = `ESL-2026-${padded}`;

    const newCandidate: Candidate = {
      ...candidateData,
      id: newId,
      createdAt: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
    };

    setCandidates(prev => [newCandidate, ...prev]);
    logAudit(newCandidate.id, newCandidate.fullName, 'Created', undefined, newCandidate.status, `Source: ${newCandidate.candidateSource}`);

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

      currentCount++;
      const padded = String(currentCount).padStart(3, '0');
      const newId = `ESL-2026-${padded}`;

      const newCand: Candidate = {
        ...candData,
        id: newId,
        createdAt: (candData as any).createdAt || now,
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
      const updated = {
        ...c,
        ...updates,
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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
