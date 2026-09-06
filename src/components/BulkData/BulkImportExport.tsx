import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Filter, 
  Users, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Search,
  Sparkles,
  ChevronDown,
  Layers,
  Phone,
  Briefcase,
  KeyRound
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateStatus, CandidateSource, Department, UserProfile, UserRole } from '../../types';
import { TODAY } from '../../mockData';

type EntityType = 'candidates' | 'users' | 'companies';
type ActiveTab = 'import' | 'export' | 'sample-formats';

interface ColumnSpec {
  name: string;
  key: string;
  required: boolean;
  type: string;
  sample: string;
  allowedValues?: string;
  description: string;
}

const CANDIDATE_COLUMN_SPECS: ColumnSpec[] = [
  { name: 'Full Name', key: 'fullName', required: true, type: 'String', sample: 'Pooja Verma', description: 'Complete name of candidate' },
  { name: 'Mobile Number', key: 'mobileNumber', required: true, type: 'Phone (10 digits)', sample: '9876543210', description: 'Primary 10-digit mobile contact number' },
  { name: 'WhatsApp Number', key: 'whatsappNumber', required: false, type: 'Phone (10 digits)', sample: '9876543210', description: 'WhatsApp contact number (defaults to Mobile if empty)' },
  { name: 'Email', key: 'email', required: false, type: 'Email', sample: 'pooja.verma@gmail.com', description: 'Valid candidate email address' },
  { name: 'Gender', key: 'gender', required: false, type: 'Enum', sample: 'Female', allowedValues: 'Female / Male / Other', description: 'Candidate gender' },
  { name: 'Age', key: 'age', required: false, type: 'Number', sample: '24', description: 'Candidate age in years' },
  { name: 'City', key: 'city', required: true, type: 'String', sample: 'Delhi', description: 'Current residence city' },
  { name: 'Area', key: 'area', required: false, type: 'String', sample: 'Laxmi Nagar', description: 'Locality or sector' },
  { name: 'Position Applied', key: 'positionApplied', required: true, type: 'String', sample: 'Telecaller', description: 'Job role applying for' },
  { name: 'Department', key: 'department', required: true, type: 'String', sample: 'HR Recruitment', allowedValues: 'HR Recruitment / BKD Recruitment / Management', description: 'Target business department' },
  { name: 'Candidate Source', key: 'candidateSource', required: false, type: 'Enum', sample: 'Meta Ads', allowedValues: 'Meta Ads / Instagram / Referral / Walk-in / Calling Database / Job Fair / Campus / WhatsApp / LinkedIn / Naukri / Indeed / Direct', description: 'Lead acquisition channel' },
  { name: 'Total Experience', key: 'totalExperience', required: false, type: 'String', sample: '1.5 Years', description: 'Total work experience' },
  { name: 'Relevant Experience', key: 'relevantExperience', required: false, type: 'String', sample: '1 Year in Telecalling', description: 'Domain-specific experience' },
  { name: 'Current Salary', key: 'currentSalary', required: false, type: 'Number (INR)', sample: '18000', description: 'Current monthly take-home/gross salary' },
  { name: 'Expected Salary', key: 'expectedSalary', required: false, type: 'Number (INR)', sample: '22000', description: 'Monthly salary expectation' },
  { name: 'Assigned HR', key: 'assignedHr', required: false, type: 'String', sample: 'Nandani', description: 'HR Executive handle/name handling the lead' },
  { name: 'Status', key: 'status', required: false, type: 'Enum', sample: 'New Lead', allowedValues: 'New Lead / Attempted / Connected / Follow-up / Interview Scheduled / Selected / Joined / Active Joining', description: 'Initial CRM pipeline status' },
  { name: 'Remarks', key: 'remarks', required: false, type: 'Text', sample: 'Good Hindi & English communication skills', description: 'Initial notes or recruiter screening remarks' },
];

const USER_COLUMN_SPECS: ColumnSpec[] = [
  { name: 'Full Name', key: 'name', required: true, type: 'String', sample: 'Naveen Rawat', description: 'Staff employee name' },
  { name: 'User ID', key: 'userId', required: true, type: 'String', sample: 'naveen.hr', description: 'Unique login username for CRM portal' },
  { name: 'Login Password', key: 'password', required: true, type: 'String', sample: 'Naveen@2026', description: 'Initial login credential' },
  { name: 'Email Address', key: 'email', required: true, type: 'Email', sample: 'naveen.rawat@essentialsoul.com', description: 'Official email address' },
  { name: 'Phone', key: 'phone', required: false, type: 'Phone', sample: '9811223344', description: 'Contact phone number' },
  { name: 'Role', key: 'role', required: true, type: 'Enum', sample: 'HR Executive', allowedValues: 'Super Admin / Director / Management / HR Head / Team Leader / HR Executive / Recruiter / Interviewer', description: 'System role' },
  { name: 'Department', key: 'department', required: true, type: 'String', sample: 'HR Recruitment', description: 'Assigned department' },
  { name: 'Company Name', key: 'companyName', required: false, type: 'String', sample: 'Essential Soul Lifestyle Pvt Ltd', description: 'Employing legal entity' },
  { name: 'Daily Interview Target', key: 'dailyInterviewTarget', required: false, type: 'Number', sample: '5', description: 'Daily target for interviews conducted' },
  { name: 'Monthly Active Joining Target', key: 'monthlyActiveJoiningTarget', required: false, type: 'Number', sample: '3', description: 'Monthly quota for 7-day active retentions' },
  { name: 'Status', key: 'status', required: false, type: 'Enum', sample: 'Active', allowedValues: 'Active / Inactive', description: 'Account status' },
];

const COMPANY_COLUMN_SPECS: ColumnSpec[] = [
  { name: 'Company Name', key: 'name', required: true, type: 'String', sample: 'Essential Soul Lifestyle Pvt Ltd', description: 'Official legal operating entity name' },
  { name: 'Entity Code', key: 'code', required: true, type: 'String (2-6 chars)', sample: 'ESL', description: 'Short unique prefix code for branding & candidate IDs' },
  { name: 'Company Admin User ID', key: 'adminUserId', required: true, type: 'String', sample: 'esl.admin', description: 'Master administrator login username' },
  { name: 'Master Password', key: 'adminPassword', required: true, type: 'String', sample: 'ESL@Corp2026', description: 'Master administrator portal password' },
  { name: 'Master Contact SPOC', key: 'masterContactPerson', required: false, type: 'String', sample: 'Aditya Mathur (Director)', description: 'Authorized Director or primary corporate SPOC' },
  { name: 'Contact Email', key: 'email', required: true, type: 'Email', sample: 'hr@essentialsoul.com', description: 'Official corporate email' },
  { name: 'Contact Phone', key: 'phone', required: true, type: 'Phone', sample: '+91 98765 43210', description: 'Official contact phone' },
  { name: 'Registered Address', key: 'address', required: true, type: 'String', sample: 'Plot A-40, Sector 62', description: 'Office premises address' },
  { name: 'City', key: 'city', required: true, type: 'String', sample: 'Noida', description: 'Operating city' },
  { name: 'State', key: 'state', required: true, type: 'String', sample: 'Uttar Pradesh', description: 'Operating state' },
  { name: 'CIN', key: 'cin', required: false, type: 'String', sample: 'U74999UP2022PTC168921', description: 'Corporate Identification Number (MCA)' },
  { name: 'GSTIN', key: 'gstin', required: false, type: 'String', sample: '09AAECE1234F1Z5', description: 'GSTIN registration number' },
  { name: 'Status', key: 'isActive', required: false, type: 'Enum', sample: 'Active', allowedValues: 'Active / Inactive', description: 'Operational status for recruitment' },
];

export const BulkImportExport: React.FC<{ onNavigate?: (nav: string) => void }> = ({ onNavigate }) => {
  const { 
    candidates, 
    bulkImportCandidates, 
    allUsers, 
    bulkImportUsers, 
    companies, 
    bulkImportCompanies,
    departmentsList,
    currentUser,
    checkDuplicate 
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<ActiveTab>('import');
  const [entityType, setEntityType] = useState<EntityType>('candidates');
  const [copiedFormat, setCopiedFormat] = useState(false);

  // Import State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseHeaders, setParseHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultHr, setDefaultHr] = useState(currentUser.name || 'Nandani');
  const [defaultDept, setDefaultDept] = useState('HR Recruitment');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export State
  const [exportCompany, setExportCompany] = useState<string>('ALL');
  const [exportDept, setExportDept] = useState<string>('ALL');
  const [exportStatus, setExportStatus] = useState<string>('ALL');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls'>('csv');
  const [includeHistory, setIncludeHistory] = useState<boolean>(true);

  // Sample CSV generators
  const generateSampleCSV = (type: EntityType): string => {
    if (type === 'candidates') {
      const headers = [
        'Full Name',
        'Mobile Number',
        'WhatsApp Number',
        'Email',
        'Gender',
        'Age',
        'City',
        'Area',
        'Position Applied',
        'Department',
        'Candidate Source',
        'Total Experience',
        'Relevant Experience',
        'Current Salary',
        'Expected Salary',
        'Assigned HR',
        'Status',
        'Remarks'
      ];
      const sampleRow1 = [
        'Pooja Verma',
        '9876543210',
        '9876543210',
        'pooja.verma@gmail.com',
        'Female',
        '24',
        'Delhi',
        'Laxmi Nagar',
        'Telecaller',
        'HR Recruitment',
        'Meta Ads',
        '1.5 Years',
        '1 Year in Lifestyle calling',
        '18000',
        '22000',
        'Nandani',
        'New Lead',
        'Good spoken communication, ready for immediate joining'
      ];
      const sampleRow2 = [
        'Vikram Singh',
        '9811223344',
        '9811223344',
        'vikram.singh@yahoo.com',
        'Male',
        '27',
        'Noida',
        'Sector 62',
        'Sales Executive',
        'BKD Recruitment',
        'Instagram',
        '3 Years',
        '2 Years in Retail Sales',
        '24000',
        '28000',
        'Shivani',
        'Interview Scheduled',
        'Experienced in luxury lifestyle retail stores'
      ];
      const sampleRow3 = [
        'Neha Kashyap',
        '9822334455',
        '9822334455',
        'neha.kashyap@gmail.com',
        'Female',
        '23',
        'Gurgaon',
        'DLF Phase 3',
        'Customer Support',
        'HR Recruitment',
        'Referral',
        'Fresher',
        'Graduate 2025',
        '0',
        '18000',
        'Pooja',
        'New Lead',
        'Fast learner with pleasant voice tone'
      ];

      return [
        headers.join(','),
        sampleRow1.map(v => `"${v}"`).join(','),
        sampleRow2.map(v => `"${v}"`).join(','),
        sampleRow3.map(v => `"${v}"`).join(',')
      ].join('\n');
    }

    if (type === 'users') {
      const headers = [
        'Full Name',
        'User ID',
        'Login Password',
        'Email Address',
        'Phone',
        'Role',
        'Department',
        'Company Name',
        'Daily Interview Target',
        'Monthly Active Joining Target',
        'Status'
      ];
      const sampleRows = [
        ['Aarav Mehta', 'aarav.hr', 'Aarav@2026', 'aarav.mehta@essentialsoul.com', '9871122334', 'HR Executive', 'HR Recruitment', 'Essential Soul Lifestyle Pvt Ltd', '5', '3', 'Active'],
        ['Kavita Sharma', 'kavita.tl', 'Kavita@2026', 'kavita.sharma@essentialsoul.com', '9899112233', 'Team Leader', 'BKD Recruitment', 'BKD Retail Private Limited', '8', '5', 'Active'],
        ['Rohit Bansal', 'rohit.rec', 'Rohit@2026', 'rohit.bansal@essentialsoul.com', '9810112233', 'Recruiter', 'HR Recruitment', 'Essential Soul Lifestyle Pvt Ltd', '4', '2', 'Active']
      ];
      return [
        headers.join(','),
        ...sampleRows.map(r => r.map(v => `"${v}"`).join(','))
      ].join('\n');
    }

    if (type === 'companies') {
      const headers = [
        'Company Name',
        'Entity Code',
        'Company Admin User ID',
        'Master Password',
        'Master Contact SPOC',
        'Contact Email',
        'Contact Phone',
        'Registered Address',
        'City',
        'State',
        'CIN',
        'GSTIN',
        'Status'
      ];
      const sampleRows = [
        ['Essential Soul Lifestyle Pvt Ltd', 'ESL', 'esl.admin', 'ESL@Corp2026', 'Aditya Mathur (Director)', 'hr@essentialsoul.com', '+91 98765 43210', 'Plot A-40, Sector 62', 'Noida', 'Uttar Pradesh', 'U74999UP2022PTC168921', '09AAECE1234F1Z5', 'Active'],
        ['BKD Retail Private Limited', 'BKD', 'bkd.admin', 'BKD@Corp2026', 'Vikram Singh (VP Operations)', 'careers@bkdretail.in', '+91 98112 23344', 'Tower B, Cyber City', 'Gurugram', 'Haryana', 'U52100HR2021PTC095112', '06AAACB1234E1Z8', 'Active'],
        ['Soul Retail Venture LLP', 'SRV', 'srv.admin', 'SRV@Corp2026', 'Pooja Verma (Authorized Signatory)', 'jobs@soulretail.com', '+91 98711 55667', 'Unit 12, Express Trade Tower', 'Noida', 'Uttar Pradesh', 'AAR-1234', '09AACCS9876Q1Z2', 'Active']
      ];
      return [
        headers.join(','),
        ...sampleRows.map(r => r.map(v => `"${v}"`).join(','))
      ].join('\n');
    }

    return '';
  };

  // Generate Sample XLS content (Excel-compatible HTML spreadsheet)
  const generateSampleXLS = (type: EntityType): string => {
    const csv = generateSampleCSV(type);
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      // simple quote-aware split
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      return matches.map(m => m.replace(/^"|"$/g, ''));
    });

    const title = type === 'candidates' 
      ? 'Candidate Import Master' 
      : (type === 'users' ? 'User Credentials Master' : 'Company Master Credentials');

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
          <style>
            th { background-color: #0F172A; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; border: 1px solid #334155; padding: 8px; }
            td { font-family: Arial, sans-serif; font-size: 10pt; border: 1px solid #CBD5E1; padding: 6px; }
            .meta { font-family: Arial, sans-serif; font-size: 12pt; font-weight: bold; color: #1E293B; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="${headers.length}" class="meta">Essential Soul Recruitment CRM - Sample ${title} (${TODAY})</td></tr>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
            ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </table>
        </body>
      </html>
    `;
  };

  const handleDownloadSample = (format: 'csv' | 'xls') => {
    const entityLabel = entityType === 'candidates' 
      ? 'Candidate_Import_Template' 
      : (entityType === 'users' ? 'User_Import_Template' : 'Company_Master_Credentials_Template');
    const filename = `Sample_${entityLabel}_${TODAY}.${format}`;
    
    if (format === 'csv') {
      const csvContent = generateSampleCSV(entityType);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const xlsContent = generateSampleXLS(entityType);
      const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyHeaderRow = () => {
    const specs = entityType === 'candidates' 
      ? CANDIDATE_COLUMN_SPECS 
      : (entityType === 'users' ? USER_COLUMN_SPECS : COMPANY_COLUMN_SPECS);
    const headerStr = specs.map(s => s.name).join('\t');
    navigator.clipboard.writeText(headerStr);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  // Load Built-in Demo Test Batch
  const handleLoadDemoData = () => {
    const csvContent = generateSampleCSV(entityType);
    parseFileContent(csvContent, 'sample_test_batch.csv');
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    setParseError(null);
    setImportResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseFileContent(content, file.name);
    };
    reader.onerror = () => {
      setParseError('Failed to read file. Please ensure it is a valid CSV or XLS text file.');
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  // Robust CSV / TSV / Table text parser
  const parseFileContent = (content: string, filename: string) => {
    try {
      // Check if it's HTML table (XLS export format)
      if (content.includes('<table') || content.includes('<tr')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const trs = Array.from(doc.querySelectorAll('tr'));
        if (trs.length < 2) {
          throw new Error('No data rows found in the uploaded spreadsheet.');
        }

        // Find header row (tr with th or first tr)
        let headerTr = trs.find(tr => tr.querySelectorAll('th').length > 0) || trs[0];
        let headers = Array.from(headerTr.querySelectorAll('th, td')).map(cell => cell.textContent?.trim() || '');
        let dataTrs = trs.filter(tr => tr !== headerTr);

        const rows = dataTrs.map(tr => {
          const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
          const rowObj: Record<string, string> = {};
          headers.forEach((h, i) => {
            rowObj[h] = cells[i] || '';
          });
          return rowObj;
        });

        setParseHeaders(headers);
        setParsedRows(rows);
        setIsParsing(false);
        return;
      }

      // Normal CSV / TSV Parsing
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('File has no data rows. Found fewer than 2 rows.');
      }

      // Detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') ? ';' : ',');

      // Helper for comma in quotes
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const rawHeaders = parseCSVLine(lines[0]);
      const cleanHeaders = rawHeaders.map(h => h.trim());

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = parseCSVLine(line);
        const rowObj: Record<string, string> = {};
        cleanHeaders.forEach((h, idx) => {
          rowObj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        rows.push(rowObj);
      }

      setParseHeaders(cleanHeaders);
      setParsedRows(rows);
      setIsParsing(false);
    } catch (err: any) {
      setParseError(err.message || 'Error parsing file format.');
      setIsParsing(false);
    }
  };

  // Map parsed rows to Candidate interface
  const mappedCandidates = useMemo(() => {
    if (entityType !== 'candidates' || parsedRows.length === 0) return [];

    return parsedRows.map((row, idx) => {
      // Flexible key matcher
      const findVal = (keys: string[]): string => {
        for (const k of keys) {
          // direct match
          if (row[k] !== undefined && row[k] !== '') return row[k];
          // case-insensitive match
          const foundKey = Object.keys(row).find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
          if (foundKey && row[foundKey]) return row[foundKey];
        }
        return '';
      };

      const fullName = findVal(['Full Name', 'Name', 'Candidate Name', 'Candidate', 'Applicant']);
      const rawMobile = findVal(['Mobile Number', 'Mobile', 'Phone', 'Contact Number', 'Contact No', 'Phone Number', 'Cell']);
      const cleanMobile = rawMobile.replace(/[^0-9]/g, '').slice(-10);
      const rawWa = findVal(['WhatsApp Number', 'Whatsapp', 'WA Number', 'WhatsApp', 'WhatsApp No']);
      const cleanWa = rawWa ? rawWa.replace(/[^0-9]/g, '').slice(-10) : cleanMobile;
      const email = findVal(['Email', 'Email Address', 'Mail']);
      const city = findVal(['City', 'Location', 'Current City']) || 'Delhi NCR';
      const area = findVal(['Area', 'Locality', 'Address']);
      const gender = (findVal(['Gender', 'Sex']) || 'Other') as any;
      const age = parseInt(findVal(['Age']), 10) || 24;
      const positionApplied = findVal(['Position Applied', 'Position', 'Job Role', 'Role', 'Designation', 'Profile']) || 'Sales Executive';
      const department = findVal(['Department', 'Dept']) || defaultDept;
      const candidateSource = (findVal(['Candidate Source', 'Source', 'Lead Source', 'Channel']) || 'Meta Ads') as CandidateSource;
      const totalExperience = findVal(['Total Experience', 'Experience', 'Exp', 'Total Exp']) || 'Fresher';
      const relevantExperience = findVal(['Relevant Experience', 'Relevant Exp']);
      const currentSalary = parseInt(findVal(['Current Salary', 'Current CTC', 'CTC', 'Present Salary']), 10) || 0;
      const expectedSalary = parseInt(findVal(['Expected Salary', 'Expected CTC']), 10) || 0;
      const assignedHr = findVal(['Assigned HR', 'HR', 'Recruiter', 'Owner']) || defaultHr;
      const status = (findVal(['Status', 'Lead Status', 'Initial Status']) || 'New Lead') as CandidateStatus;
      const remarks = findVal(['Remarks', 'Notes', 'Comment', 'Screening Notes']) || 'Imported via Bulk CSV/XLS';

      const isDuplicate = Boolean(checkDuplicate(cleanMobile, cleanWa, email));
      const isValid = Boolean(fullName && cleanMobile.length >= 10);

      return {
        _index: idx + 1,
        fullName,
        mobileNumber: cleanMobile,
        whatsappNumber: cleanWa,
        email,
        gender,
        age,
        city,
        area,
        positionApplied,
        department,
        candidateSource,
        totalExperience,
        relevantExperience,
        currentSalary,
        expectedSalary,
        assignedHr,
        status,
        remarks,
        _isValid: isValid,
        _isDuplicate: isDuplicate,
        _error: !fullName ? 'Missing Full Name' : (cleanMobile.length < 10 ? 'Invalid 10-digit mobile' : null)
      };
    });
  }, [entityType, parsedRows, defaultDept, defaultHr, checkDuplicate]);

  // Map parsed rows to User interface
  const mappedUsers = useMemo(() => {
    if (entityType !== 'users' || parsedRows.length === 0) return [];

    return parsedRows.map((row, idx) => {
      const findVal = (keys: string[]): string => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== '') return row[k];
          const foundKey = Object.keys(row).find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
          if (foundKey && row[foundKey]) return row[foundKey];
        }
        return '';
      };

      const name = findVal(['Full Name', 'Name', 'Employee Name', 'Staff Name']);
      const userId = findVal(['User ID', 'Username', 'Login ID', 'Handle']) || (name ? name.toLowerCase().replace(/\s+/g, '.') : `user.${idx + 1}`);
      const password = findVal(['Login Password', 'Password', 'Pass']) || `${name ? name.split(' ')[0] : 'Soul'}@2026`;
      const email = findVal(['Email Address', 'Email', 'Official Email']) || `${userId}@essentialsoul.com`;
      const phone = findVal(['Phone', 'Mobile Number', 'Mobile']);
      const role = (findVal(['Role', 'Designation', 'User Role']) || 'HR Executive') as UserRole;
      const department = findVal(['Department', 'Dept']) || 'HR Recruitment';
      const companyName = findVal(['Company Name', 'Company']) || 'Essential Soul Lifestyle Pvt Ltd';
      const dailyInterviewTarget = parseInt(findVal(['Daily Interview Target', 'Interview Target']), 10) || 5;
      const monthlyActiveJoiningTarget = parseInt(findVal(['Monthly Active Joining Target', 'Joining Target']), 10) || 3;
      const status = (findVal(['Status']) || 'Active') as 'Active' | 'Inactive';

      const existing = allUsers.some(u => 
        (u.userId && u.userId.toLowerCase() === userId.toLowerCase()) || 
        (u.email && u.email.toLowerCase() === email.toLowerCase())
      );

      const isValid = Boolean(name && userId && password);

      return {
        _index: idx + 1,
        name,
        userId,
        password,
        email,
        phone,
        role,
        department,
        companyName,
        dailyInterviewTarget,
        monthlyActiveJoiningTarget,
        status,
        _isValid: isValid,
        _isDuplicate: existing,
        _error: !name ? 'Missing Name' : (!userId ? 'Missing User ID' : null)
      };
    });
  }, [entityType, parsedRows, allUsers]);

  // Mapped Company Records Preview
  const mappedCompanies = useMemo(() => {
    if (entityType !== 'companies' || parsedRows.length === 0) return [];

    return parsedRows.map((row, idx) => {
      const findVal = (keys: string[]) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return String(row[k]).trim();
          const foundKey = Object.keys(row).find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
          if (foundKey && row[foundKey]) return String(row[foundKey]).trim();
        }
        return '';
      };

      const name = findVal(['Company Name', 'Name', 'Entity Name', 'Company']);
      const code = (findVal(['Entity Code', 'Code', 'Short Code']) || (name ? name.substring(0, 3).toUpperCase() : `C${idx + 1}`)).toUpperCase();
      const adminUserId = findVal(['Company Admin User ID', 'Admin User ID', 'User ID', 'Admin ID']) || `${code.toLowerCase()}.admin`;
      const adminPassword = findVal(['Master Password', 'Admin Password', 'Password']) || `${code}@Corp2026`;
      const masterContactPerson = findVal(['Master Contact SPOC', 'Contact Person', 'SPOC', 'Director']) || 'Director / Authorized SPOC';
      const email = findVal(['Contact Email', 'Email', 'Official Email']) || `info@${code.toLowerCase()}.com`;
      const phone = findVal(['Contact Phone', 'Phone', 'Mobile']) || '+91 98765 43210';
      const address = findVal(['Registered Address', 'Address', 'Office']) || 'Corporate Office Tower';
      const city = findVal(['City']) || 'Noida';
      const state = findVal(['State']) || 'Uttar Pradesh';
      const pincode = findVal(['Pincode', 'Pin Code']) || '201309';
      const cin = findVal(['CIN', 'Corporate Identification Number']) || '';
      const gstin = findVal(['GSTIN', 'GSTIN Number', 'GST']) || '';
      const isActive = findVal(['Status', 'Active']).toLowerCase() !== 'inactive';

      const existing = companies.some(c => 
        (c.code && c.code.toUpperCase() === code) ||
        (c.name && c.name.toLowerCase() === name.toLowerCase()) ||
        (c.adminUserId && c.adminUserId.toLowerCase() === adminUserId.toLowerCase())
      );

      const isValid = Boolean(name && code && adminUserId && adminPassword);

      return {
        _index: idx + 1,
        name,
        code,
        legalName: name,
        adminUserId,
        adminPassword,
        masterContactPerson,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        cin,
        gstin,
        isActive,
        departments: ['HR Recruitment'],
        _isValid: isValid,
        _isDuplicate: existing,
        _error: !name ? 'Missing Name' : (!code ? 'Missing Code' : null)
      };
    });
  }, [entityType, parsedRows, companies]);

  // Execute Bulk Import
  const handleExecuteImport = () => {
    if (entityType === 'candidates') {
      const candidatesToImport = mappedCandidates
        .filter(c => c._isValid && (!skipDuplicates || !c._isDuplicate))
        .map(c => {
          const { _index, _isValid, _isDuplicate, _error, ...rest } = c;
          return rest;
        });

      if (candidatesToImport.length === 0) {
        setParseError('No valid rows available to import based on your duplicate settings.');
        return;
      }

      const result = bulkImportCandidates(candidatesToImport, skipDuplicates);
      setImportResult({ imported: result.importedCount, skipped: result.skippedCount });
      setParsedRows([]);
      setUploadedFile(null);
    } else if (entityType === 'users') {
      const usersToImport = mappedUsers
        .filter(u => u._isValid && (!skipDuplicates || !u._isDuplicate))
        .map(u => {
          const { _index, _isValid, _isDuplicate, _error, ...rest } = u;
          return rest;
        });

      if (usersToImport.length === 0) {
        setParseError('No valid staff records to import.');
        return;
      }

      const result = bulkImportUsers(usersToImport, skipDuplicates);
      setImportResult({ imported: result.importedCount, skipped: result.skippedCount });
      setParsedRows([]);
      setUploadedFile(null);
    } else if (entityType === 'companies') {
      const compsToImport = mappedCompanies
        .filter(c => c._isValid && (!skipDuplicates || !c._isDuplicate))
        .map(c => {
          const { _index, _isValid, _isDuplicate, _error, ...rest } = c;
          return rest;
        });

      if (compsToImport.length === 0) {
        setParseError('No valid company records to import.');
        return;
      }

      const result = bulkImportCompanies(compsToImport, skipDuplicates);
      setImportResult({ imported: result.importedCount, skipped: result.skippedCount });
      setParsedRows([]);
      setUploadedFile(null);
    }
  };

  // Export Filtered Records Engine
  const exportCandidatesList = useMemo(() => {
    return candidates.filter(c => {
      if (exportCompany !== 'ALL' && c.companyId !== exportCompany && c.companyName !== exportCompany) return false;
      if (exportDept !== 'ALL' && c.department !== exportDept) return false;
      if (exportStatus !== 'ALL') {
        if (exportStatus === 'ACTIVE_JOINING' && !c.isActiveJoining) return false;
        if (exportStatus === 'PIPELINE' && (c.status === 'Rejected' || c.status === 'Joined')) return false;
        if (exportStatus !== 'ACTIVE_JOINING' && exportStatus !== 'PIPELINE' && c.status !== exportStatus) return false;
      }
      return true;
    });
  }, [candidates, exportCompany, exportDept, exportStatus]);

  const handleExportData = () => {
    if (entityType === 'candidates') {
      const headers = [
        'Candidate ID',
        'Full Name',
        'Mobile Number',
        'WhatsApp Number',
        'Email',
        'City',
        'Area',
        'Position Applied',
        'Department',
        'Status',
        'Active Joining',
        'Assigned HR',
        'Candidate Source',
        'Total Experience',
        'Current Salary',
        'Expected Salary',
        'Offered Salary',
        'Interview Date',
        'Joining Date',
        'Created Date'
      ];

      const rows = exportCandidatesList.map(c => [
        c.id,
        `"${(c.fullName || '').replace(/"/g, '""')}"`,
        c.mobileNumber,
        c.whatsappNumber,
        c.email || '',
        `"${(c.city || '').replace(/"/g, '""')}"`,
        `"${(c.area || '').replace(/"/g, '""')}"`,
        `"${(c.positionApplied || '').replace(/"/g, '""')}"`,
        `"${(c.department || '').replace(/"/g, '""')}"`,
        `"${c.status}"`,
        c.isActiveJoining ? 'YES' : 'NO',
        `"${c.assignedHr}"`,
        `"${c.candidateSource}"`,
        `"${c.totalExperience}"`,
        c.currentSalary || '',
        c.expectedSalary || '',
        c.salaryOffered || '',
        c.interviewDate || '',
        c.joiningDate || '',
        c.createdAt || ''
      ]);

      const filename = `Essential_Soul_Candidates_Export_${TODAY}.${exportFormat}`;

      if (exportFormat === 'csv') {
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      } else {
        const xlsContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <style>
                th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; border: 1px solid #475569; padding: 6px 12px; }
                td { border: 1px solid #E2E8F0; padding: 6px 10px; font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              <h2>Essential Soul Recruitment CRM - Candidate Export (${TODAY})</h2>
              <p>Generated by: ${currentUser.name} (${currentUser.role}) | Records: ${exportCandidatesList.length}</p>
              <table>
                <thead>
                  <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${rows.map(r => `<tr>${r.map(cell => `<td>${cell.replace(/^"|"$/g, '')}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;
        const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      }
    } else if (entityType === 'users') {
      const headers = [
        'Staff ID',
        'Full Name',
        'User ID',
        'Password',
        'Email Address',
        'Phone',
        'Role',
        'Department',
        'Company',
        'Daily Target',
        'Monthly Target',
        'Status'
      ];
      const rows = allUsers.map(u => [
        u.id,
        `"${u.name}"`,
        u.userId || '',
        u.password || '',
        u.email,
        u.phone || '',
        `"${u.role}"`,
        `"${u.department}"`,
        `"${u.companyName || ''}"`,
        u.dailyInterviewTarget,
        u.monthlyActiveJoiningTarget,
        u.status || 'Active'
      ]);

      const filename = `Essential_Soul_Staff_Credentials_${TODAY}.${exportFormat}`;

      if (exportFormat === 'csv') {
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      } else {
        const xlsContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
            <body>
              <h2>Staff & User ID Password Master Export (${TODAY})</h2>
              <table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c.replace(/^"|"$/g, '')}</td>`).join('')}</tr>`).join('')}</tbody>
              </table>
            </body>
          </html>
        `;
        const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      }
    } else if (entityType === 'companies') {
      const headers = [
        'Company ID',
        'Company Name',
        'Entity Code',
        'Company Admin User ID',
        'Master Password',
        'Master Contact SPOC',
        'Contact Email',
        'Contact Phone',
        'Address',
        'City',
        'State',
        'Pincode',
        'CIN',
        'GSTIN',
        'Status'
      ];
      const rows = companies.map(c => [
        c.id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        c.code,
        c.adminUserId || `${c.code.toLowerCase()}.admin`,
        c.adminPassword || `${c.code.toUpperCase()}@Corp2026`,
        `"${(c.masterContactPerson || '').replace(/"/g, '""')}"`,
        c.email,
        c.phone,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        `"${c.city || ''}"`,
        `"${c.state || ''}"`,
        c.pincode || '',
        c.cin || '',
        c.gstin || '',
        c.isActive ? 'Active' : 'Inactive'
      ]);

      const filename = `Essential_Soul_Company_Credentials_Master_${TODAY}.${exportFormat}`;

      if (exportFormat === 'csv') {
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      } else {
        const xlsContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
            <body>
              <h2>Essential Soul Group - Company Master Credentials Export (${TODAY})</h2>
              <p>Generated by: ${currentUser.name} (${currentUser.role}) | Total Entities: ${companies.length}</p>
              <table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c.replace(/^"|"$/g, '')}</td>`).join('')}</tr>`).join('')}</tbody>
              </table>
            </body>
          </html>
        `;
        const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      }
    }
  };

  const validRowsCount = entityType === 'candidates' 
    ? mappedCandidates.filter(c => c._isValid && (!skipDuplicates || !c._isDuplicate)).length
    : (entityType === 'users'
      ? mappedUsers.filter(u => u._isValid && (!skipDuplicates || !u._isDuplicate)).length
      : mappedCompanies.filter(comp => comp._isValid && (!skipDuplicates || !comp._isDuplicate)).length);

  const duplicatesCount = entityType === 'candidates'
    ? mappedCandidates.filter(c => c._isDuplicate).length
    : (entityType === 'users'
      ? mappedUsers.filter(u => u._isDuplicate).length
      : mappedCompanies.filter(comp => comp._isDuplicate).length);

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Bulk Import / Export & Data Center
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  CSV & XLS Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Batch import candidate leads & user credentials with sample format templates, automatic column mapping, and deduplication
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Downloads in Top Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleDownloadSample('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
            title="Download formatted sample CSV file"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Sample CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadSample('xls')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-2xs transition-colors"
            title="Download formatted sample Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sample XLS (Excel)</span>
          </button>
        </div>
      </div>

      {/* Primary Entity Selector Tabs & Action Mode Tabs */}
      <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Entity Tabs (Candidates vs Staff Users vs Company Master) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg flex-wrap">
          <button
            type="button"
            onClick={() => { setEntityType('candidates'); setParsedRows([]); setUploadedFile(null); setImportResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              entityType === 'candidates'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Candidate Master & Leads</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold">
              {candidates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setEntityType('users'); setParsedRows([]); setUploadedFile(null); setImportResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              entityType === 'users'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff & User ID Credentials</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold">
              {allUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setEntityType('companies'); setParsedRows([]); setUploadedFile(null); setImportResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              entityType === 'companies'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Company Master Credentials</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-extrabold">
              {companies.length}
            </span>
          </button>
        </div>

        {/* Action Mode (Bulk Import vs Bulk Export vs Format Specs) */}
        <div className="flex items-center gap-1.5 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'import'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import (Upload)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'export'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bulk Export (Download)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sample-formats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'sample-formats'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Sample File Formats</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importResult && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Bulk Import Processed Successfully!
              </p>
              <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                Successfully added <strong className="font-extrabold">{importResult.imported}</strong> new {entityType} to CRM. 
                {importResult.skipped > 0 && ` (${importResult.skipped} duplicate records skipped)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate(entityType === 'candidates' ? 'candidates' : 'users')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1"
              >
                <span>View in {entityType === 'candidates' ? 'Candidate Master' : 'User Master'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setImportResult(null)}
              className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: BULK IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          
          {/* Sample Format Quick Bar */}
          <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Need the exact column structure? Download our ready-to-use template or test with sample data:
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadSample('csv')}
                className="font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample .CSV</span>
              </button>
              <span className="text-blue-300 dark:text-blue-700">•</span>
              <button
                type="button"
                onClick={() => handleDownloadSample('xls')}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Download Sample .XLS</span>
              </button>
              <span className="text-blue-300 dark:text-blue-700">•</span>
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Load 3 Sample Rows</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xls,.xlsx,.tsv,.txt"
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Click to browse or drag and drop your file here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Supports <strong className="font-semibold text-slate-700 dark:text-slate-200">.CSV</strong>,{' '}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">.XLS</strong>, and{' '}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">.TSV</strong> spreadsheets.
                Auto-detects columns and formats.
              </p>
              {uploadedFile && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Import Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Skip existing duplicate records
                </span>
              </label>

              {entityType === 'candidates' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                      Default Recruiter (if empty):
                    </label>
                    <select
                      value={defaultHr}
                      onChange={(e) => setDefaultHr(e.target.value)}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium"
                    >
                      {allUsers.map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                      Default Department:
                    </label>
                    <select
                      value={defaultDept}
                      onChange={(e) => setDefaultDept(e.target.value)}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium"
                    >
                      <option value="HR Recruitment">HR Recruitment</option>
                      <option value="BKD Recruitment">BKD Recruitment</option>
                      <option value="Management">Management</option>
                      {departmentsList.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              
              {/* Stats Bar & Confirmation Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <div className="font-bold text-slate-800 dark:text-white">
                    Parsed <strong className="text-blue-600 dark:text-blue-400">{parsedRows.length}</strong> rows from file
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{validRowsCount} ready to import</span>
                  </div>
                  {duplicatesCount > 0 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <div className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{duplicatesCount} duplicates {skipDuplicates ? '(will skip)' : '(will allow)'}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setParsedRows([]); setUploadedFile(null); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={validRowsCount === 0}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs text-white shadow-2xs flex items-center gap-1.5 ${
                      validRowsCount > 0 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete Import ({validRowsCount} {entityType})</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto max-h-96 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5">Status</th>
                      {entityType === 'candidates' ? (
                        <>
                          <th className="p-2.5">Candidate Name</th>
                          <th className="p-2.5">Mobile</th>
                          <th className="p-2.5">Position</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">City</th>
                          <th className="p-2.5">Source</th>
                          <th className="p-2.5">Assigned HR</th>
                        </>
                      ) : entityType === 'users' ? (
                        <>
                          <th className="p-2.5">Full Name</th>
                          <th className="p-2.5">User ID</th>
                          <th className="p-2.5">Initial Password</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">Email</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5">Company Name</th>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Admin User ID</th>
                          <th className="p-2.5">Master Password</th>
                          <th className="p-2.5">Contact SPOC</th>
                          <th className="p-2.5">Contact Email</th>
                          <th className="p-2.5">City / State</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {entityType === 'candidates' ? (
                      mappedCandidates.map((c) => (
                        <tr 
                          key={c._index}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                            !c._isValid ? 'bg-red-50/50 dark:bg-red-950/20' : (c._isDuplicate ? 'bg-amber-50/40 dark:bg-amber-950/20' : '')
                          }`}
                        >
                          <td className="p-2.5 text-center text-slate-400">{c._index}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            {!c._isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full">
                                <X className="w-3 h-3" /> {c._error}
                              </span>
                            ) : c._isDuplicate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Duplicate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{c.fullName || '—'}</td>
                          <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{c.mobileNumber || '—'}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-200">{c.positionApplied}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{c.department}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{c.city}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{c.candidateSource}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{c.assignedHr}</td>
                        </tr>
                      ))
                    ) : entityType === 'users' ? (
                      mappedUsers.map((u) => (
                        <tr 
                          key={u._index}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                            !u._isValid ? 'bg-red-50/50 dark:bg-red-950/20' : (u._isDuplicate ? 'bg-amber-50/40 dark:bg-amber-950/20' : '')
                          }`}
                        >
                          <td className="p-2.5 text-center text-slate-400">{u._index}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            {!u._isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full">
                                <X className="w-3 h-3" /> {u._error}
                              </span>
                            ) : u._isDuplicate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Exists
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                          <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{u.userId}</td>
                          <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{u.password}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-200">{u.role}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{u.department}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                        </tr>
                      ))
                    ) : (
                      mappedCompanies.map((comp) => (
                        <tr 
                          key={comp._index}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                            !comp._isValid ? 'bg-red-50/50 dark:bg-red-950/20' : (comp._isDuplicate ? 'bg-amber-50/40 dark:bg-amber-950/20' : '')
                          }`}
                        >
                          <td className="p-2.5 text-center text-slate-400">{comp._index}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            {!comp._isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full">
                                <X className="w-3 h-3" /> {comp._error}
                              </span>
                            ) : comp._isDuplicate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Exists
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{comp.name}</td>
                          <td className="p-2.5 font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 rounded">{comp.code}</td>
                          <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400 font-bold">{comp.adminUserId}</td>
                          <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{comp.adminPassword}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-200">{comp.masterContactPerson}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{comp.email}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{comp.city}, {comp.state}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: BULK EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Export {entityType === 'candidates' ? 'Candidate Master Database' : (entityType === 'users' ? 'Staff Credentials Master' : 'Company Master Credentials')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter and export verified records in clean CSV format or formatted Microsoft Excel spreadsheets
              </p>
            </div>

            {/* Export Format Selector */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  exportFormat === 'csv'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV File (.csv)</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('xls')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  exportFormat === 'xls'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel Spreadsheet (.xls)</span>
              </button>
            </div>
          </div>

          {/* Export Filters Grid */}
          {entityType === 'candidates' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Company Entity
                </label>
                <select
                  value={exportCompany}
                  onChange={(e) => setExportCompany(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium"
                >
                  <option value="ALL">All Companies</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Department
                </label>
                <select
                  value={exportDept}
                  onChange={(e) => setExportDept(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium"
                >
                  <option value="ALL">All Departments</option>
                  <option value="HR Recruitment">HR Recruitment</option>
                  <option value="BKD Recruitment">BKD Recruitment</option>
                  <option value="Management">Management</option>
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Stage / Status Scope
                </label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium"
                >
                  <option value="ALL">All Stages & Candidates ({candidates.length})</option>
                  <option value="ACTIVE_JOINING">Only Active Joinings (7+ days)</option>
                  <option value="PIPELINE">Active In-Pipeline (Exclude Rejected)</option>
                  <option value="New Lead">New Leads</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Joined">Joined</option>
                </select>
              </div>
            </div>
          )}

          {/* Export Action Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Ready to generate export file
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Matches <strong className="font-extrabold text-blue-600 dark:text-blue-400">
                  {entityType === 'candidates' 
                    ? exportCandidatesList.length 
                    : (entityType === 'users' ? allUsers.length : companies.length)}
                </strong> total records in <span className="uppercase font-bold">{exportFormat}</span> format.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download {exportFormat.toUpperCase()} ({entityType === 'candidates' ? exportCandidatesList.length : (entityType === 'users' ? allUsers.length : companies.length)} Records)</span>
            </button>
          </div>

          {/* Export Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Preview (First 5 records):
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">
                      {entityType === 'candidates' ? 'Name' : (entityType === 'users' ? 'Staff Name' : 'Company Name')}
                    </th>
                    <th className="p-2.5">
                      {entityType === 'candidates' ? 'Mobile' : (entityType === 'users' ? 'User ID' : 'Entity Code')}
                    </th>
                    <th className="p-2.5">
                      {entityType === 'candidates' ? 'Role' : (entityType === 'users' ? 'Role' : 'Admin User ID')}
                    </th>
                    <th className="p-2.5">
                      {entityType === 'candidates' ? 'Status' : (entityType === 'users' ? 'Password' : 'Password')}
                    </th>
                    <th className="p-2.5">
                      {entityType === 'candidates' ? 'Department' : (entityType === 'users' ? 'Department' : 'Contact SPOC')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {entityType === 'candidates' ? (
                    exportCandidatesList.slice(0, 5).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{c.id}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{c.fullName}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{c.mobileNumber}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-200">{c.positionApplied}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {c.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{c.department}</td>
                      </tr>
                    ))
                  ) : entityType === 'users' ? (
                    allUsers.slice(0, 5).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{u.id}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{u.userId}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-200">{u.role}</td>
                        <td className="p-2.5 font-mono text-slate-500">••••••••</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{u.department}</td>
                      </tr>
                    ))
                  ) : (
                    companies.slice(0, 5).map(comp => (
                      <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{comp.id}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{comp.name}</td>
                        <td className="p-2.5 font-mono font-bold text-amber-700 dark:text-amber-400">{comp.code}</td>
                        <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{comp.adminUserId || `${comp.code.toLowerCase()}.admin`}</td>
                        <td className="p-2.5 font-mono text-slate-500">••••••••</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{comp.masterContactPerson || 'Director'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SAMPLE FILE FORMATS & DATA SPECIFICATION */}
      {activeTab === 'sample-formats' && (
        <div className="space-y-4">
          
          {/* Format Downloads Header */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Sample File Format & Data Dictionary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact column headers and accepted formats for seamless batch importing
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyHeaderRow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
                title="Copy TSV header row for pasting directly into Excel or Google Sheets"
              >
                {copiedFormat ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedFormat ? 'Copied Headers!' : 'Copy Column Headers'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadSample('csv')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadSample('xls')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Sample .XLS</span>
              </button>
            </div>
          </div>

          {/* Column Specifications Table */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {entityType === 'candidates' 
                ? 'Candidate Master Schema' 
                : (entityType === 'users' ? 'User Master Schema' : 'Company Master Credentials Schema')} (Columns Reference):
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Column Header</th>
                    <th className="p-3">Requirement</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Sample Value</th>
                    <th className="p-3">Accepted Values / Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {(entityType === 'candidates' 
                    ? CANDIDATE_COLUMN_SPECS 
                    : (entityType === 'users' ? USER_COLUMN_SPECS : COMPANY_COLUMN_SPECS)).map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                        {col.name}
                      </td>
                      <td className="p-3">
                        {col.required ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            Required *
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {col.type}
                      </td>
                      <td className="p-3 text-blue-700 dark:text-blue-300 font-mono bg-blue-50/40 dark:bg-blue-950/20 px-2 rounded">
                        {col.sample}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        <div>{col.description}</div>
                        {col.allowedValues && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            Allowed: {col.allowedValues}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
