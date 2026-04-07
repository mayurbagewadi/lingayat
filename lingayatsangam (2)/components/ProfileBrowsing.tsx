
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Phone, Heart, Shield,
  X, ArrowLeft, AlertCircle, Crown,
  HeartOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { profileService, UserProfile } from '../services/profileService';
import { sanitizeProfileForDisplay, getSafeDisplayValue } from '../services/displaySanitizer';

interface ProfileBrowsingProps {
  onNavigate: (view: string) => void;
}

const ProfileBrowsing: React.FC<ProfileBrowsingProps> = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  const isPremium = userProfile?.subscription_status === 'premium';
  const isExpired = userProfile?.subscription_status === 'expired';

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      console.log("Fetching active profiles...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await profileService.getProfile(session.user.id);
          setUserProfile(profile);
          if (profile?.id) {
            const usage = await profileService.getContactUsage(profile.id);
            setUsageCount(usage);
          }
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) {
           console.error("Supabase Select Error:", error);
        } else {
           console.log("Profiles Found:", data?.length);
           setProfiles(data || []);
        }
      } catch (err) {
        console.error("Browse Logic Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(p => {
    const name = p.full_name?.toLowerCase() || "";
    const loc = p.location?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || loc.includes(query);
  });

  const handleExpressInterest = async (profile: UserProfile) => {
    if (!userProfile) return onNavigate('login');
    if (!isPremium) {
       alert(isExpired ? "Your subscription has expired. Please renew." : "This feature is for Premium members.");
       return onNavigate('subscription');
    }

    if (usageCount >= 10) {
      alert("Daily interest limit (10) reached. Upgrade for more.");
      return;
    }

    const message = prompt(`Express interest in ${profile.full_name}? (Optional message):`);
    if (message === null) return;

    try {
      await profileService.sendInterest(userProfile.id!, profile.id!, message || "I'm interested.");
      alert("Interest sent successfully!");
      setUsageCount(prev => prev + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-8">
        
        {isExpired && (
          <div className="mb-8 bg-red-50 dark:bg-red-950/20 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600"><AlertCircle size={24}/></div>
               <div>
                  <h4 className="font-black text-red-900 dark:text-red-200 uppercase text-xs tracking-widest">Limited Access</h4>
                  <p className="text-sm font-bold text-red-700/70">Renew your plan to see phone numbers and connect with matches.</p>
               </div>
            </div>
            <button onClick={() => onNavigate('subscription')} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20">Renew Now</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:scale-105 transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-serif font-black text-primary-950 dark:text-white">Discover <span className="text-gold-500">Matches</span></h1>
              <p className="text-gray-500 text-sm mt-1">Explore verified Lingayat profiles across the globe.</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search city, caste, or name..." 
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all font-bold"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            [1,2,3,4].map(i => <div key={i} className="bg-white dark:bg-gray-900 h-[480px] rounded-[3rem] animate-pulse" />)
          ) : filteredProfiles.length > 0 ? filteredProfiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              isPremium={isPremium}
              onClick={() => setSelectedProfile(profile)} 
              onInterest={() => handleExpressInterest(profile)}
            />
          )) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
               <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300">
                  <HeartOff size={40} />
               </div>
               <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No Active Profiles Found</h3>
               <p className="text-gray-500 text-sm font-bold">Ensure RLS is disabled in Supabase or run the Seed Demo Data again from Admin.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedProfile && (
          <FullProfileModal 
            profile={selectedProfile} 
            isPremium={isPremium}
            onClose={() => setSelectedProfile(null)}
            onInterest={() => handleExpressInterest(selectedProfile)}
            onUpgrade={() => onNavigate('subscription')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileCard = ({ profile, isPremium, onClick, onInterest }: any) => {
  const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '??';
  const photoUrl = profileService.getGoogleDriveUrl(profile.photo_1_file_id) || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop';
  const safe = sanitizeProfileForDisplay(profile);

  return (
    <motion.div
      layout
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full group relative"
    >
      <div className="relative h-80 cursor-pointer" onClick={onClick}>
        <img src={photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Profile" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white pr-4">
          <h4 className="text-2xl font-serif font-black">{safe.full_name || 'Unnamed'}, {age}</h4>
          <p className="text-xs font-bold text-white/70 flex items-center gap-1 mt-1"><MapPin size={12} className="text-gold-500" /> {safe.location || 'Unknown'}</p>
        </div>
        {isPremium && (
          <div className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
            <Shield size={16} />
          </div>
        )}
      </div>

      <div className="p-8 space-y-6 flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Sub-Caste" value={safe.sub_caste} />
          <DetailItem label="Education" value={safe.education} />
        </div>

        <div className="flex gap-3 mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
          <button onClick={onClick} className="flex-1 py-4 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest">View Profile</button>
          <button 
            onClick={onInterest}
            className={`px-6 py-4 rounded-2xl transition-all ${isPremium ? 'bg-gold-500 text-primary-950 shadow-lg shadow-gold-500/20' : 'bg-gray-50 text-gray-400'}`}
          >
            <Heart size={20} fill={isPremium ? "currentColor" : "none"}/>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DetailItem = ({ label, value }: any) => (
  <div className="min-w-0">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-100">{getSafeDisplayValue(value)}</p>
  </div>
);

const FullProfileModal = ({ profile, isPremium, onClose, onInterest, onUpgrade }: any) => {
  const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '??';
  const photoUrl = profileService.getGoogleDriveUrl(profile.photo_1_file_id) || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop';
  const safe = sanitizeProfileForDisplay(profile);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 50 }} 
        className="relative bg-white dark:bg-gray-900 rounded-[4rem] w-full max-w-6xl h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-30 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-xl"><X size={28}/></button>
        
        {/* Photo Column */}
        <div className="md:w-[45%] h-full relative">
          <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
          <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-transparent text-white">
            <h2 className="text-6xl font-serif font-black">{safe.full_name || 'Unnamed'}, {age}</h2>
            <div className="flex gap-3 mt-6">
                {[profile.photo_1_file_id, profile.photo_2_file_id, profile.photo_3_file_id, profile.photo_4_file_id].filter(id => !!id).map((id, i) => (
                  <div key={i} className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/50 shadow-lg">
                    <img src={profileService.getGoogleDriveUrl(id)!} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="md:w-[55%] p-10 md:p-20 overflow-y-auto space-y-12 custom-scrollbar">
          <div className="flex flex-wrap gap-4">
             <span className="px-6 py-2 bg-primary-50 dark:bg-primary-950 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">{safe.sub_caste}</span>
             <span className="px-6 py-2 bg-gold-500 text-primary-950 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-gold-500/10"><Shield size={14}/> Verified Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-y-12">
             <DetailItem label="Location" value={safe.location} />
             <DetailItem label="Education" value={safe.education} />
             <DetailItem label="Birth Date" value={safe.dob} />
             <DetailItem label="Sub-Caste" value={safe.sub_caste} />
          </div>

          <div className="bg-primary-50 dark:bg-primary-950/20 p-10 rounded-[3rem] border border-primary-100 dark:border-primary-800 space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-black flex items-center gap-3"><Phone className="text-primary-600" size={24}/> Connection Center</h4>
                {!isPremium && <Crown className="text-gold-500" size={24}/>}
             </div>
             
             {isPremium ? (
               <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile Number</p>
                      <p className="text-xl font-black text-primary-600 tracking-tighter">{safe.mobile || 'Private'}</p>
                    </div>
                    <button onClick={() => window.open(`tel:${safe.mobile}`)} className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/20"><Phone size={24}/></button>
                  </div>
               </div>
             ) : (
               <div className="text-center py-6 space-y-6">
                  <p className="text-sm text-gray-500 font-bold max-w-xs mx-auto">This information is only available to active Royal subscribers. Renew or upgrade to unlock.</p>
                  <button onClick={onUpgrade} className="px-12 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-600/30">Renew Now</button>
               </div>
             )}
          </div>

          <div className="flex gap-4 pt-10">
            <button 
              onClick={onInterest}
              className="flex-1 py-6 bg-gold-500 text-primary-950 rounded-[2.5rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-gold-500/20 hover:scale-[1.02] transition-all"
            >
              <Heart size={24} fill="currentColor"/> Express Interest
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileBrowsing;
