import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const DEMO_ACCOUNTS = [
  { name: 'Arjun Sharma (Rank #1)', email: 'arjun@hacktracker.io', password: 'password123', role: 'CSE 4th Year' },
  { name: 'Priya Nair (Rank #2)', email: 'priya@hacktracker.io', password: 'password123', role: 'AI & DS 3rd Year' },
  { name: 'Rahul Mehta (Rank #3)', email: 'rahul@hacktracker.io', password: 'password123', role: 'IT 3rd Year' },
];

const Login: React.FC = () => {
  const { login, verify2FALogin } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await login(email.trim(), password, rememberMe);

      if (result.requires2FA) {
        setRequires2FA(true);
        setTempToken(result.tempToken || '');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      addToast('success', 'Welcome Back!', `Logged in successfully.`);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Invalid email or password.');
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length < 6) {
      setError('Please enter a 6-digit TOTP code or valid backup code.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await verify2FALogin(tempToken, twoFactorCode.trim(), rememberDevice);
      setIsLoading(false);
      addToast('success', '2FA Verified', 'Authentication successful.');
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Invalid 2FA code.');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <Layers className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {requires2FA ? 'Two-Factor Verification' : 'Sign in to HackTracker'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {requires2FA
              ? 'Enter the 6-digit code from your authenticator app or backup code.'
              : 'Access your projects, achievements, and leaderboard rankings.'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!requires2FA ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* 2FA Prompt Form */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="text-center p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                <KeyRound className="w-8 h-8 text-teal-500 mx-auto mb-1" />
                <span className="text-xs text-teal-800 dark:text-teal-300 font-semibold">
                  Two-Factor Authentication Active
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={8}
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.4em] text-2xl font-mono py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Trust this device for 30 days</span>
              </label>

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length < 6}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : 'Verify Code & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-xs text-gray-500 hover:underline text-center"
              >
                &larr; Back to login with another account
              </button>
            </form>
          )}

          {/* 1-Click Demo Logins */}
          {!requires2FA && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> 1-Click Demo Accounts
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {DEMO_ACCOUNTS.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email, acc.password)}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-gray-200 dark:border-gray-700/60 text-left flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{acc.name}</span>
                      <span className="text-[10px] text-gray-400 block">{acc.role}</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                      Auto-fill
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Create account free &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
