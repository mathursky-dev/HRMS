import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, KeyRound, ChevronDown, ChevronUp, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';

export const LoginScreen: React.FC = () => {
  const { loginWithCredentials, companies, allUsers, resetAllData } = useRecruitment();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Primary company info for branding
  const companyName = companies[0]?.name || 'Essential Soul Lifestyle';

  const handleResetDemoData = () => {
    resetAllData();
    setUserId('');
    setPassword('');
    setErrorMsg('');
    setResetSuccessMsg('All demo data has been reset to factory defaults.');
    setTimeout(() => setResetSuccessMsg(''), 4000);
  };

  const handleSelectDemo = (uId: string, pwd: string) => {
    setUserId(uId);
    setPassword(pwd);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userId.trim()) {
      setErrorMsg('Please enter your User ID.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithCredentials(userId, password);
      if (!result.success) {
        setIsLoading(false);
        setErrorMsg(result.error || 'Invalid User ID or Password.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      
      {/* Clean Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-7 sm:p-8"
      >
        {/* Company Logo and Name */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl tracking-wider shadow-md shadow-blue-500/20 mb-3.5 border border-blue-400/20">
            ES
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {companyName}
          </h1>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {resetSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{resetSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form: User ID & Password Only */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label 
              htmlFor="input-userid" 
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
            >
              User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-userid"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                required
                autoFocus
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label 
              htmlFor="input-password" 
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-500" />
              <span>Available Demo Credentials</span>
            </span>
            {showDemoAccounts ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <AnimatePresence>
            {showDemoAccounts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-2">
                  Click any account below to auto-fill its registered User ID and Password:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {allUsers.slice(0, 4).map((user) => {
                    const uPass = user.password || `${user.name.split(' ')[0]}@2026`;
                    const uId = user.userId || user.email;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectDemo(uId, uPass)}
                        className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {user.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: <span className="text-slate-600 dark:text-slate-300 font-semibold">{uId}</span> • Pass: <span className="text-slate-600 dark:text-slate-300 font-semibold">{uPass}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Direct Reset Dummy Data Option */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
            <button
              id="btn-login-reset-dummy-data"
              type="button"
              onClick={handleResetDemoData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
              title="Reset all CRM records (candidates, jobs, users, companies) back to factory default"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>Reset Dummy Data to Factory Defaults</span>
            </button>
          </div>
        </div>

      </motion.div>

    </div>
  );
};
