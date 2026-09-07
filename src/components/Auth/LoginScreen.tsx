import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, KeyRound, ShieldCheck, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';

export const LoginScreen: React.FC = () => {
  const { loginWithCredentials, companies } = useRecruitment();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(true);

  // Primary company info for branding
  const companyName = companies[0]?.name || 'Essential Soul Lifestyle';

  const fillCredentials = (uid: string, pass: string) => {
    setUserId(uid);
    setPassword(pass);
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
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      
      {/* Clean Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        {/* Company Logo and Name */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl tracking-wider shadow-md shadow-blue-500/20 mb-3 border border-blue-400/20">
            ES
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {companyName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Recruitment ATS & Enterprise Lifecycle System
          </p>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] opacity-80 mt-1">
                  Tip: Use the quick credentials reference below to auto-fill valid credentials.
                </p>
              </div>
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
                placeholder="e.g. admin or esl.admin"
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
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to ATS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials Quick Reference Master Guide */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-500" />
              <span>Verified Account Credentials</span>
            </span>
            {showCredentialsHelper ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {showCredentialsHelper && (
            <div className="mt-3 space-y-2">
              {/* Super Admin */}
              <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Super Admin (All Companies)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                    ID: <strong className="text-indigo-700 dark:text-indigo-300">admin</strong> | Pass: <strong className="text-indigo-700 dark:text-indigo-300">Admin@2026</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin', 'Admin@2026')}
                  className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Fill
                </button>
              </div>

              {/* Corporate Admins */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Corporate Company Admins (Separated Data)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {/* ESL */}
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">ESL Admin</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">esl.admin / ESL@Corp2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillCredentials('esl.admin', 'ESL@Corp2026')}
                      className="px-2 py-0.5 text-[9px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 rounded transition-colors cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>

                  {/* BKD */}
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">BKD Admin</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">bkd.admin / BKD@Corp2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillCredentials('bkd.admin', 'BKD@Corp2026')}
                      className="px-2 py-0.5 text-[9px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 rounded transition-colors cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </motion.div>

    </div>
  );
};
