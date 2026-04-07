
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onNavigate: (view: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Sign out any existing session first
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (!data.user) throw new Error('Login failed.');

      // Check if this user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile || profile.role !== 'admin') {
        // Not an admin — sign them out immediately
        await supabase.auth.signOut();
        setErrorMsg('Access denied. This login is for administrators only.');
        return;
      }

      // Admin verified — navigate to admin panel
      onNavigate('admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 dark:bg-black relative flex items-center justify-center overflow-hidden py-12 px-4 transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-950 to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
      >
        <button
          onClick={() => onNavigate('landing')}
          className="absolute top-6 left-6 text-primary-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-full bg-gold-500/20 text-gold-400 mb-4 ring-1 ring-gold-500/30">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Admin Panel</h2>
          <p className="text-primary-300 text-sm">Authorized personnel only</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-primary-200 text-sm font-semibold ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-primary-900/50 border border-primary-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="admin@lingayatsangam.com"
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
                placeholder="Enter admin password"
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

          <motion.button
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-primary-950 font-bold py-4 rounded-xl shadow-lg shadow-gold-500/20 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Shield size={18} /> Access Admin Panel</>}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-primary-500 text-xs">
          This area is restricted to platform administrators.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
