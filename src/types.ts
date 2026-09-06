export type Department = 'HR Recruitment' | 'BKD Recruitment' | 'Management' | string;

export type UserRole = 
  | 'Super Admin' 
  | 'Director / Management' 
  | 'HR Head' 
  | 'HR Executive' 
  | 'Interviewer'
  | 'Recruiter'
  | 'Team Leader';

export interface Company {
  id: string;
  name: string;
  code: string; // e.g. ESL, BKD, SOW
  legalName?: string;
  cin?: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  email: string;
  phone: string;
  website?: string;
  departments: string[];
  isActive: boolean;
  createdAt: string;

  // Company User ID & Password Master credentials
  adminUserId?: string;           // Unique Corporate Login User ID (e.g. esl.admin, bkd.corporate)
  adminPassword?: string;         // Company Master Password (e.g. ESL@Corp2026)
  masterContactPerson?: string;   // Primary corporate administrator / Director / SPOC
  lastPasswordChanged?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  companyId: string;
  companyName: string;
  headName: string;
  headEmail?: string;
  dailyInterviewTarget: number;
  monthlyActiveJoiningTarget: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TargetSetting {
  id: string;
  targetType: 'Company' | 'Department' | 'HR Executive';
  targetEntityId: string; // companyId, deptId, or userId
  targetEntityName: string;
  period: 'Daily' | 'Monthly' | 'Quarterly';
  metric: 'Interviews Conducted' | 'Active Joinings' | 'Candidate Calls' | 'Offers Released';
  targetValue: number;
  minimumBenchmark?: number;
  updatedAt: string;
  updatedBy: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department: Department;
  companyId?: string;
  companyName?: string;
  avatar?: string;
  dailyInterviewTarget: number;
  monthlyActiveJoiningTarget: number;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  userId?: string;     // Unique Login User ID (e.g. aditya.mathur, nandani.hr)
  password?: string;   // Login Security Password
  lastPasswordChanged?: string;
}

export type CandidateStatus =
  | 'New Lead'
  | 'Not Contacted'
  | 'Attempted'
  | 'Connected'
  | 'Call Back'
  | 'Interested'
  | 'Not Interested'
  | 'Not Reachable'
  | 'Wrong Number'
  | 'Follow-up'
  | 'Interview Scheduled'
  | 'Interview Confirmed'
  | 'Interview Rescheduled'
  | 'Interview Conducted'
  | 'Selected'
  | 'Rejected'
  | 'Hold'
  | 'Salary Discussion'
  | 'Training Scheduled'
  | 'Training Started'
  | 'Training Completed'
  | 'Joining Confirmed'
  | 'Joined'
  | 'Active Joining'
  | 'No Show'
  | 'Resigned';

export type CandidateSource =
  | 'Meta Ads'
  | 'Facebook'
  | 'Instagram'
  | 'WhatsApp'
  | 'Indeed'
  | 'Naukri'
  | 'Apna'
  | 'WorkIndia'
  | 'Referral'
  | 'Walk-in'
  | 'Data Vendor'
  | 'Existing Database'
  | 'Other';

export interface Candidate {
  id: string; // ESL-2026-001
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  age?: number;
  dateOfBirth?: string;
  email: string;
  city: string;
  area: string;
  address?: string;
  positionApplied: string;
  department: Department;
  companyId?: string;
  companyName?: string;
  qualification: string;
  totalExperience: string;
  relevantExperience: string;
  currentCompany?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  preferredLocation?: string;
  candidateSource: CandidateSource;
  assignedHr: string; // HR name e.g. "Nandani", "Shivani"
  remarks?: string;
  status: CandidateStatus;
  
  createdAt: string; // ISO date string
  firstCallDate?: string;
  lastActivityDate: string;
  isArchived?: boolean;

  // Selected & Joining details if applicable
  salaryOffered?: number;
  selectionDate?: string;
  joiningDate?: string;
  reportingTime?: string;
  reportingManager?: string;
  officeLocation?: string;
  documentsStatus?: 'Pending' | 'Partial' | 'Verified';
  joiningConfirmation?: boolean;
  joiningStatus?: 'Pending Confirmation' | 'Confirmed' | 'Joined' | 'Delayed' | 'No Show' | 'Cancelled';
  actualJoinedDate?: string;
  activeJoinedDate?: string;
  isActiveJoining?: boolean;

  // Training info
  trainingStatus?: 'Scheduled' | 'In Training' | 'Completed' | 'Failed' | 'Retraining' | 'Dropped';
  trainerName?: string;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainingScore?: number; // 0-100
  trainingAttendance?: string;
}

export type FollowUpMode = 'Call' | 'WhatsApp' | 'Interview' | 'In-person';

export interface FollowUpRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateMobile: string;
  position: string;
  hrExecutive: string;
  followUpDate: string; // YYYY-MM-DD
  followUpTime: string; // HH:mm
  followUpMode: FollowUpMode;
  candidateResponse: string;
  notes: string;
  nextFollowUpDate?: string; // YYYY-MM-DD
  nextFollowUpTime?: string;
  resultingStatus: CandidateStatus;
  isCompleted: boolean;
  createdAt: string;
}

export type InterviewMode = 'Office Interview' | 'Phone Interview' | 'Video Interview';

export type InterviewAttendanceStatus = 
  | 'Scheduled' 
  | 'Confirmed' 
  | 'Arrived' 
  | 'Conducted' 
  | 'Rescheduled' 
  | 'No Show' 
  | 'Cancelled';

export type AttendanceStatus = InterviewAttendanceStatus;

export interface InterviewRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateMobile: string;
  position: string;
  department: Department;
  hrExecutive: string;
  interviewer: string;
  interviewDate: string; // YYYY-MM-DD
  interviewTime: string; // HH:mm
  interviewMode: InterviewMode;
  interviewLocation: string;
  attendanceStatus: InterviewAttendanceStatus;
  reminderSent: boolean;
  remarks?: string;
  createdAt: string;

  // Evaluation
  evaluation?: InterviewEvaluation;
}

export interface InterviewEvaluation {
  communication: number; // 1-5
  confidence: number; // 1-5
  experience: number; // 1-5
  jobKnowledge: number; // 1-5
  stability: number; // 1-5
  salaryFit: number; // 1-5
  attitude: number; // 1-5
  overallSuitability: number; // 1-5
  averageRating: number;
  finalResult: 'Selected' | 'Rejected' | 'Hold' | 'Second Round' | 'Salary Discussion';
  interviewerRemarks: string;
  evaluatedAt: string;
}

export interface TrainingRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  trainer: string;
  department: Department;
  startDate: string;
  endDate: string;
  attendance: string;
  trainingScore: number;
  productKnowledgeScore: number; // 1-5
  callingSkillScore: number; // 1-5
  communicationScore: number; // 1-5
  disciplineScore: number; // 1-5
  trainerRemarks: string;
  status: 'Scheduled' | 'In Training' | 'Completed' | 'Failed' | 'Retraining' | 'Dropped';
}

export interface AuditLogEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  action: 'Created' | 'Status Change' | 'Assigned HR' | 'Follow-up Added' | 'Interview Scheduled' | 'Interview Evaluated' | 'Joined' | 'Marked Active' | 'Archived' | 'Restored';
  performedBy: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  details?: string;
}

export interface JobOpening {
  id: string;
  jobTitle: string;
  department: Department;
  vacancies: number;
  filledPositions: number;
  salaryRange: string;
  jobLocation: string;
  experience: string;
  hrResponsible: string;
  hiringDeadline: string;
  status: 'Open' | 'Urgent' | 'Hold' | 'Closed';
}

export interface SourceAdSpend {
  source: CandidateSource;
  adSpend: number; // in INR
}

export interface DailyHrReport {
  id: string;
  hrName: string;
  date: string; // YYYY-MM-DD
  leadsReceived: number;
  callsMade: number;
  connected: number;
  followUpsDone: number;
  interviewsScheduled: number;
  interviewsConducted: number;
  selected: number;
  rejected: number;
  joiningConfirmed: number;
  joined: number;
  activeJoining: number;
  noShows: number;
  pendingFollowUps: number;
  remarks: string;
  submittedAt: string;
}

export interface SystemSettings {
  activeJoiningDaysThreshold: 3 | 7 | 15 | 30; // Default 7
  companyName: string;
  companyAddress: string;
  companyPhone: string;
}

export type AppMenuId = 
  | 'dashboard'
  | 'candidates'
  | 'followups'
  | 'interviews'
  | 'joining'
  | 'offer-letters'
  | 'terms-conditions'
  | 'jobs'
  | 'companies'
  | 'users'
  | 'departments'
  | 'targets'
  | 'permissions'
  | 'import-export'
  | 'reports'
  | 'templates'
  | 'audit'
  | 'database';

export interface CompensationBreakup {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  performanceBonus?: number;
  statutoryPf?: number;
  medicalInsurance?: number;
}

export interface OfferLetter {
  id: string; // OFR-2026-001
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateAddress?: string;
  companyId: string;
  companyName: string;
  companyLegalName?: string;
  companyAddress: string;
  companyCin?: string;
  companyGstin?: string;
  department: string;
  designation: string;
  employmentType: 'Full-Time' | 'Probationary' | 'Contract' | 'Internship';
  workLocation: string;
  location?: string;
  reportingManager: string;
  offerDate: string; // YYYY-MM-DD
  joiningDate: string; // YYYY-MM-DD
  validityDate: string; // YYYY-MM-DD
  annualCtc: number;
  monthlyGross: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  performanceIncentive?: number;
  monthlyInHand: number;
  probationMonths: number;
  noticePeriodDays: number;
  noticeDays?: number;
  status: 'Draft' | 'Issued' | 'Accepted' | 'Declined' | 'Joined';
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  selectedClauseIds?: string[];
  attachedClauseIds?: string[];
  compensationBreakup?: CompensationBreakup;
  issuedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TermsCategory = 
  | 'Probation & Confirmation'
  | 'Working Hours & Attendance'
  | 'Compensation & Incentives'
  | 'Code of Conduct'
  | 'Confidentiality & NDA'
  | 'Leave & Time Off'
  | 'Termination & Notice'
  | 'Onboarding Documents';

export interface TermsClause {
  id: string;
  clauseNumber: string;
  category: TermsCategory;
  title: string;
  content: string;
  isMandatoryInOffer: boolean;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type RolePermissionsMap = Record<UserRole, AppMenuId[]>;
