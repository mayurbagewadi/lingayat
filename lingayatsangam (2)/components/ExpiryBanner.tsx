
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ShieldAlert } from 'lucide-react';

interface ExpiryBannerProps {
  expiresAt?: string;
  status: 'free' | 'premium' | 'expired';
  onRenew: () => void;
}

const ExpiryBanner: React.FC<ExpiryBannerProps> = ({ expiresAt, status, onRenew }) => {
  if (status === 'free') return null;

  const daysRemaining = expiresAt 
    ? Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (status === 'expired') {
    return (
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/50 p-4 sticky top-[72px] z-40"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-tight">Subscription Expired</p>
              <p className="text-xs font-bold text-red-700/70 dark:text-red-400/70">Renew now to view contact numbers and send interests.</p>
            </div>
          </div>
          <button 
            onClick={onRenew}
            className="w-full sm:w-auto px-8 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            Renew Subscription <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    );
  }

  if (daysRemaining > 30) return null;

  const isUrgent = daysRemaining <= 7;

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`border-b p-4 sticky top-[72px] z-40 transition-colors ${
        isUrgent 
          ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50' 
          : 'bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-800'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isUrgent ? 'bg-orange-100 text-orange-600' : 'bg-primary-100 text-primary-600'}`}>
            <Clock size={20} className={isUrgent ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className={`text-sm font-black uppercase tracking-tight ${isUrgent ? 'text-orange-900 dark:text-orange-200' : 'text-primary-900 dark:text-primary-200'}`}>
              Renewal Due Soon
            </p>
            <p className={`text-xs font-bold ${isUrgent ? 'text-orange-700/70' : 'text-primary-700/70'}`}>
              Your Royal membership expires in <span className="underline">{daysRemaining} days</span>.
            </p>
          </div>
        </div>
        <button 
          onClick={onRenew}
          className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            isUrgent 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700' 
              : 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700'
          }`}
        >
          {isUrgent ? 'Renew Now' : 'Manage Subscription'} <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default ExpiryBanner;
