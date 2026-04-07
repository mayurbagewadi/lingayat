
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Crown, ArrowRight, Star, Sparkles, LogOut, Trash2, X, TrendingUp } from 'lucide-react';
import { profileService, UserProfile } from '../services/profileService';
import { sanitizeProfileForDisplay, getSafeDisplayValue } from '../services/displaySanitizer';
import DailyDigest from './DailyDigest';
import ExpiryBanner from './ExpiryBanner';
import PhotoManager from './PhotoManager';

interface UserDashboardProps {
  onNavigate: (view: string) => void;
  user: any;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate, user, onLogout, onDeleteAccount }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile(user.id);
        setUserProfile(profile);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (isLoading) return (
    <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center bg-white dark:bg-gray-950">
       <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
       <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Synchronizing Your Royal Profile...</p>
    </div>
  );

  const initialPhotoIds = userProfile ? [
    userProfile.photo_1_file_id,
    userProfile.photo_2_file_id,
    userProfile.photo_3_file_id,
    userProfile.photo_4_file_id,
    userProfile.photo_5_file_id
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-500">
      {userProfile && (
        <ExpiryBanner 
          status={userProfile.subscription_status || 'free'} 
          expiresAt={userProfile.subscription_expires_at}
          onRenew={() => onNavigate('subscription')}
        />
      )}

      {/* Royal Hero Greeting Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary-950 dark:bg-black pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary-600/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-primary-950 dark:from-gray-950 to-transparent"></div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-tr from-gold-500 via-primary-500 to-gold-400 rounded-[2.5rem] blur-md opacity-40 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white dark:bg-gray-800 overflow-hidden border-[6px] border-white dark:border-gray-900 shadow-2xl">
                  <img 
                    src={profileService.getGoogleDriveUrl(userProfile?.photo_1_file_id) || 'https://via.placeholder.com/200'} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </div>
                {userProfile?.subscription_status === 'premium' && (
                  <div className="absolute -bottom-2 -right-2 bg-gold-500 text-primary-950 p-2.5 rounded-2xl shadow-xl border-4 border-white dark:border-gray-900">
                    <Crown size={20} fill="currentColor" />
                  </div>
                )}
              </motion.div>

              <div className="text-center md:text-left space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                >
                  <Sparkles size={12} /> Member Since 2025
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-serif font-black text-white"
                >
                  Namaste, <span className="text-gold-400">{userProfile ? getSafeDisplayValue(userProfile.full_name).split(' ')[0] : 'Friend'}!</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-primary-100/70 font-medium text-lg max-w-xl"
                >
                  {userProfile?.subscription_status === 'expired' 
                    ? "Renew your premium access to continue your search." 
                    : "May you find your divine match today under the grace of the Vachanas."}
                </motion.p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4 w-full md:w-auto"
            >
              <button 
                onClick={() => onNavigate('browse')}
                className="group relative px-12 py-5 bg-gold-500 hover:bg-gold-400 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Start Browsing <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
              <button 
                onClick={() => onNavigate('subscription')}
                className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] backdrop-blur-md transition-all flex items-center justify-center gap-3"
              >
                <Crown size={16} className="text-gold-500" /> Manage Membership
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 px-6 space-y-12 pb-20">
        
        {/* Modern Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatBox 
             icon={TrendingUp} 
             label="Account Visibility" 
             value="100% Active" 
             color="text-green-500" 
             bg="bg-green-500/10"
             sub="Everyone can discover you"
             delay={0.1}
           />
           <StatBox
             icon={Clock}
             label="Membership Type"
             value={userProfile?.subscription_status === 'premium' ? 'Royal Premium' : userProfile?.subscription_status === 'expired' ? 'Expired Member' : 'Basic Free'}
             color="text-primary-600"
             bg="bg-primary-600/10"
             sub={userProfile?.subscription_expires_at ? `Expires: ${new Date(userProfile.subscription_expires_at).toLocaleDateString()}` : 'Limited features'}
             delay={0.2}
           />
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* The Daily Digest Component */}
            {userProfile && (
              <DailyDigest 
                profileId={userProfile.id!} 
                isPremium={userProfile.subscription_status === 'premium'} 
                onNavigate={onNavigate} 
              />
            )}

            {/* Photo Manager */}
            {userProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                 <PhotoManager profileId={userProfile.id!} initialPhotos={initialPhotoIds} />
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Upgrade/Renew Side Banner */}
            {userProfile?.subscription_status !== 'premium' && (
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-primary-900 to-primary-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl border border-primary-800"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-gold-400">
                    <Crown size={32} />
                  </div>
                  <h3 className="text-3xl font-serif font-black leading-tight">Unlock Royal Privilege</h3>
                  <p className="text-primary-200 font-medium">Get instant access to phone numbers, PDF bios, and see who viewed your profile.</p>
                  <button 
                    onClick={() => onNavigate('subscription')}
                    className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                  >
                    Upgrade Now
                  </button>
                </div>
              </motion.div>
            )}

            {/* Profile Completeness */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
               <h4 className="text-lg font-black flex items-center gap-2">
                 <Star className="text-gold-500" size={20} fill="currentColor" /> Profile Strength
               </h4>
               <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Completeness</span>
                    <span className="text-sm font-black text-primary-600">85%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
                    />
                  </div>
               </div>
               <p className="text-xs font-bold text-gray-500 leading-relaxed">Add a family bio to reach 100% and get 5x more visibility.</p>
               <button className="text-primary-600 font-black text-xs uppercase tracking-widest hover:underline">Edit Profile Info</button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions Bar - Bottom */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Account Actions</p>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
            >
              <LogOut size={16} />
              Logout
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Padding to prevent content overlap with bottom bar */}
      <div className="h-28 md:h-24"></div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Delete Account?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
              Your profile, all data, and account will be permanently deleted. Photos and documents stored for future Google Drive integration will be removed.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccount?.();
                }}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value, color, bg, sub, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-xl transition-all cursor-default group overflow-hidden"
  >
    <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={28} />
    </div>
    <div className="min-w-0 w-full">
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{label}</p>
      <p className="text-xl font-black tracking-tight">{value}</p>
      <p className="text-[11px] font-bold text-gray-400 mt-1">{sub}</p>
    </div>
  </motion.div>
);

export default UserDashboard;
