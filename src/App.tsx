import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RecruitmentProvider, useRecruitment } from './context/RecruitmentContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { LoginScreen } from './components/Auth/LoginScreen';

// Views
import { ManagementDashboard } from './components/Dashboard/ManagementDashboard';
import { CandidateList } from './components/Candidates/CandidateList';
import { FollowUpPanel } from './components/FollowUps/FollowUpPanel';
import { InterviewPanel } from './components/Interviews/InterviewPanel';
import { SelectedJoiningPipeline } from './components/Pipeline/SelectedJoiningPipeline';
import { ReportsAnalytics } from './components/Reports/ReportsAnalytics';
import { JobOpeningsPanel } from './components/Jobs/JobOpeningsPanel';
import { AuditLogView } from './components/Audit/AuditLogView';
import { CompanyMaster } from './components/Company/CompanyMaster';
import { UserManagement } from './components/Users/UserManagement';
import { DepartmentMaster } from './components/Departments/DepartmentMaster';
import { TargetManagement } from './components/Targets/TargetManagement';
import { RolePermissionsPanel } from './components/Permissions/RolePermissionsPanel';
import { OfferLetterPanel } from './components/OfferLetters/OfferLetterPanel';
import { BulkImportExport } from './components/BulkData/BulkImportExport';
import { SupabaseDatabaseMaster } from './components/Database/SupabaseDatabaseMaster';

// Global Modals
import { CandidateModal } from './components/Candidates/CandidateModal';
import { WhatsAppTemplatesModal } from './components/Templates/WhatsAppTemplatesModal';

function AppContent() {
  const { isAuthenticated } = useRecruitment();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const handleNavigate = (navId: string) => {
    if (navId === 'templates') {
      setIsTemplatesOpen(true);
    } else {
      setActiveNav(navId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login-screen-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <LoginScreen />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="crm-workspace"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200"
      >
        
        {/* Top Navigation Bar with live alerts and role switcher */}
        <Navbar
          onOpenAddCandidate={() => setIsAddCandidateOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* Main Workspace Layout */}
        <div className="flex-1 flex w-full">
          
          {/* Desktop Left Navigation Sidebar */}
          <Sidebar
            activeNav={activeNav}
            onNavigate={handleNavigate}
            onOpenAddCandidate={() => setIsAddCandidateOpen(true)}
          />

          {/* Dynamic Center View Container */}
          <main className="flex-1 p-3 sm:p-4 max-w-full overflow-x-hidden flex flex-col gap-4">
            {activeNav === 'dashboard' && (
              <ManagementDashboard
                onOpenAddCandidate={() => setIsAddCandidateOpen(true)}
                onNavigate={handleNavigate}
              />
            )}

            {activeNav === 'candidates' && (
              <CandidateList 
                onOpenAddModal={() => setIsAddCandidateOpen(true)} 
                onNavigate={handleNavigate}
              />
            )}

            {activeNav === 'followups' && <FollowUpPanel />}

            {activeNav === 'interviews' && <InterviewPanel />}

            {(activeNav === 'joining' || activeNav === 'selected') && (
              <SelectedJoiningPipeline />
            )}

            {activeNav === 'reports' && <ReportsAnalytics />}

            {activeNav === 'companies' && <CompanyMaster />}

            {activeNav === 'users' && <UserManagement />}

            {activeNav === 'departments' && <DepartmentMaster />}

            {activeNav === 'targets' && <TargetManagement />}

            {activeNav === 'permissions' && <RolePermissionsPanel />}

            {activeNav === 'import-export' && (
              <BulkImportExport onNavigate={handleNavigate} />
            )}

            {activeNav === 'offer-letters' && <OfferLetterPanel />}

            {activeNav === 'jobs' && <JobOpeningsPanel />}

            {activeNav === 'audit' && <AuditLogView />}

            {activeNav === 'database' && (
              <SupabaseDatabaseMaster onNavigate={handleNavigate} />
            )}
          </main>

        </div>

        {/* Mobile Bottom Navigation Bar & FAB */}
        <MobileNav
          activeNav={activeNav}
          onNavigate={handleNavigate}
          onOpenAddCandidate={() => setIsAddCandidateOpen(true)}
        />

        {/* Global Modals */}
        <CandidateModal
          isOpen={isAddCandidateOpen}
          onClose={() => setIsAddCandidateOpen(false)}
        />

        <WhatsAppTemplatesModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
        />

      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <RecruitmentProvider>
      <AppContent />
    </RecruitmentProvider>
  );
}
