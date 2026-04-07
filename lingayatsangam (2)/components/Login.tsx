
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkLoginRateLimit, resetLoginRateLimit } from '../services/rateLimiter';

interface LoginProps {
  onNavigate: (view: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Rate limiting: Check if email has exceeded login attempts
      checkLoginRateLimit(email.toLowerCase());

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        // Reset rate limit on successful login
        resetLoginRateLimit(email.toLowerCase());
        onNavigate('dashboard');
      }
    } catch (err: any) {
      // Rate limit errors should be displayed as-is
      if (err.message?.includes('Too many')) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/?view=reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setForgotMode(false);
    setResetEmail('');
    setResetSent(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-primary-950 dark:bg-black relative flex items-center justify-center overflow-hidden py-12 px-4 transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1583934555026-6d2c4b8b6d81?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/90 to-primary-950/95 dark:from-gray-900/90 dark:to-black/95" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
      >
        <button
          onClick={() => forgotMode ? handleBackToLogin() : onNavigate('landing')}
          className="absolute top-6 left-6 text-primary-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <AnimatePresence mode="wait">

          {/* ── LOGIN FORM ── */}
          {!forgotMode && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <div className="inline-flex p-3 rounded-full bg-primary-600/30 text-gold-400 mb-4 ring-1 ring-gold-500/30">
                  <Heart fill="currentColor" size={32} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-primary-200">Log in to your LingayatSangam account</p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-primary-200 text-sm font-semibold ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-primary-900/50 border border-primary-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-primary-200 text-sm font-semibold ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-primary-900/50 border border-primary-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end px-1">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setResetEmail(email); setErrorMsg(null); }}
                    className="text-gold-400 text-sm font-bold hover:text-gold-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <motion.button
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary-950 font-bold py-4 rounded-xl shadow-lg shadow-gold-500/20 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-primary-200">
                  Don't have an account?{' '}
                  <button
                    onClick={() => onNavigate('register')}
                    className="text-white font-bold hover:text-gold-400 underline decoration-gold-500/50 hover:decoration-gold-400 transition-all"
                  >
                    Create Profile
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {forgotMode && (
            <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <div className="inline-flex p-3 rounded-full bg-gold-500/20 text-gold-400 mb-4 ring-1 ring-gold-500/30">
                  <KeyRound size={32} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Reset Password</h2>
                <p className="text-primary-200 text-sm">
                  Enter your registered email and we'll send you a reset link.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {resetSent ? (
                <div className="space-y-6">
                  <div className="p-6 bg-green-900/30 border border-green-500/30 rounded-2xl flex flex-col items-center gap-4 text-center">
                    <CheckCircle size={40} className="text-green-400" />
                    <div>
                      <p className="text-white font-black text-base mb-1">Reset Link Sent!</p>
                      <p className="text-green-300 text-sm">
                        Check your inbox at <span className="font-bold text-white">{resetEmail}</span>. Click the link in the email to set a new password.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToLogin}
                    className="w-full py-4 border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <div className="space-y-2">
                    <label className="text-primary-200 text-sm font-semibold ml-1">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
                      <input
                        required
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-primary-900/50 border border-primary-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <motion.button
                    disabled={resetLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary-950 font-bold py-4 rounded-xl shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full py-3 text-primary-300 text-sm font-bold hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
