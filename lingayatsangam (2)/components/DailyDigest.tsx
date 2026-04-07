
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, ArrowRight, Crown, Calendar, Zap, Phone, Mail } from 'lucide-react';
import { profileService } from '../services/profileService';
import { sanitizeProfileForDisplay, getSafeDisplayValue } from '../services/displaySanitizer';

interface DailyDigestProps {
  profileId: string;
  isPremium: boolean;
  onNavigate: (view: string) => void;
}

const DailyDigest: React.FC<DailyDigestProps> = ({ profileId, isPremium, onNavigate }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      const data = await profileService.getActivitySummary(profileId);
      setSummary(data);
      setLoading(false);
    };
    loadSummary();
  }, [profileId]);

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-3xl" />
        <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-3xl" />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-[3rem] p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-serif font-black flex items-center gap-3">
            Today's <span className="text-primary-600">Digest</span>
            <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
          </h2>
          <p className="text-gray-500 font-bold text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} className="text-primary-400" /> Activity for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        {!isPremium && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('subscription')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-950 rounded-2xl font-black text-xs shadow-lg shadow-gold-500/20"
          >
            <Crown size={16} /> UNLOCK PREMIUM INSIGHTS
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Views */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Eye size={16} className="text-primary-600" /> Profile Views ({summary.views.length})
          </h3>
          <div className="space-y-4">
            {summary.views.length > 0 ? summary.views.slice(0, 3).map((v: any, i: number) => (
              <ActivityCard key={i} profile={v.viewer.profiles} isPremium={isPremium} />
            )) : <EmptyActivity msg="No views yet today" />}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Heart size={16} className="text-red-500" /> Interests Recieved ({summary.interests.length})
          </h3>
          <div className="space-y-4">
            {summary.interests.length > 0 ? summary.interests.slice(0, 3).map((v: any, i: number) => (
              <ActivityCard key={i} profile={v.sender.profiles} isPremium={isPremium} isInterest />
            )) : <EmptyActivity msg="Awaiting interests..." />}
          </div>
        </div>
      </div>

      {/* Recommended Matches */}
      <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Zap size={16} className="text-gold-500" /> Smart Matches For You
          </h3>
          <button onClick={() => onNavigate('browse')} className="text-primary-600 font-black text-xs hover:underline flex items-center gap-1">Browse All <ArrowRight size={14}/></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {summary.matches.map((m: any, i: number) => (
            <MatchCard key={i} profile={m} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ActivityCard = ({ profile, isPremium, isInterest }: any) => {
  const safe = sanitizeProfileForDisplay(profile);
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-primary-100 transition-all group">
      <div className={`w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 ${!isPremium ? 'blur-[3px] grayscale' : ''}`}>
        <img src={profileService.getGoogleDriveUrl(profile.photo_1_file_id) || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="User" />
      </div>
      <div className="flex-grow min-w-0">
        <h4 className={`text-sm font-black truncate ${!isPremium ? 'blur-[4px]' : ''}`}>
          {isPremium ? safe.full_name : 'Premium User'}
        </h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          {safe.sub_caste} • {safe.location}
        </p>
      </div>
      {isPremium && isInterest && (
        <div className="flex gap-2">
          <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:scale-110 transition-transform"><Phone size={14}/></button>
          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:scale-110 transition-transform"><Mail size={14}/></button>
        </div>
      )}
      {!isPremium && <Crown size={14} className="text-gold-500 opacity-50" />}
    </div>
  );
};

const MatchCard = ({ profile, onNavigate }: any) => {
  const safe = sanitizeProfileForDisplay(profile);
  return (
    <button onClick={() => onNavigate('browse')} className="flex flex-col items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-3xl transition-all group">
      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary-50 group-hover:border-primary-500 transition-colors">
        <img src={profileService.getGoogleDriveUrl(profile.photo_1_file_id) || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Match" />
      </div>
      <div className="text-center">
        <p className="text-xs font-black truncate max-w-[80px]">{safe.full_name.split(' ')[0]}</p>
        <p className="text-[10px] text-gray-400 font-bold">{safe.sub_caste}</p>
      </div>
    </button>
  );
};

const EmptyActivity = ({ msg }: { msg: string }) => (
  <div className="py-6 px-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{msg}</p>
  </div>
);

export default DailyDigest;
