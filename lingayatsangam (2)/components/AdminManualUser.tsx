
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Mail, Phone, Briefcase, Calendar, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { profileService } from '../services/profileService';

const AdminManualUser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dob: '',
    createdFor: 'Self',
    gender: 'Male',
    subCaste: 'Panchamasali',
    education: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile) {
      alert("Name and Mobile are mandatory for conflict resolution.");
      return;
    }
    setLoading(true);
    try {
      // Fix: Manually mapping camelCase form fields to snake_case UserProfile fields expected by the service
      await profileService.createProfile({
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        dob: formData.dob,
        created_for: formData.createdFor,
        gender: formData.gender,
        sub_caste: formData.subCaste,
        education: formData.education,
        location: formData.location,
        is_admin_created: true,
        status: 'pending_approval',
        subscription_status: 'free'
      });
      alert("Manual profile created successfully! It will wait in your verification queue.");
      setFormData({ fullName: '', email: '', mobile: '', dob: '', createdFor: 'Self', gender: 'Male', subCaste: 'Panchamasali', education: '', location: '' });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      {/* Risk Alert Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-100 dark:border-orange-900/50 p-8 rounded-[3rem] mb-10 flex gap-6 items-start shadow-xl shadow-orange-500/5"
      >
        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldAlert className="text-orange-600" size={32} />
        </div>
        <div>
          <h3 className="font-black text-orange-900 dark:text-orange-200 uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
            Automated Conflict Resolution Logic Active
          </h3>
          <p className="text-sm text-orange-800/80 dark:text-orange-300/80 leading-relaxed font-bold">
            Notice: Admin-created profiles are <span className="underline decoration-orange-400 decoration-2">ephemeral</span>. If a user registers themselves using this Email or Phone, this profile will be purged and replaced by their authenticated account.
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-[3.5rem] p-8 md:p-16 border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-gold-500 to-primary-600" />
        
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-3">
            Manual Profile Entry
            <Sparkles className="text-gold-500" size={24} />
          </h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Populate the community database with verified cold leads.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Target Full Name" value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} icon={User} placeholder="e.g. Basavaraj Patil" />
            <Input label="Birth Date" type="date" value={formData.dob} onChange={v => setFormData({...formData, dob: v})} icon={Calendar} />
            <Input label="Conflict Email" value={formData.email} onChange={v => setFormData({...formData, email: v})} icon={Mail} sub="Auto-Purge Trigger" placeholder="example@lingayat.com" />
            <Input label="Conflict Mobile" value={formData.mobile} onChange={v => setFormData({...formData, mobile: v})} icon={Phone} sub="Auto-Purge Trigger" placeholder="+91 00000 00000" />
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sub-Caste Division</label>
              <select 
                value={formData.subCaste}
                onChange={e => setFormData({...formData, subCaste: e.target.value})}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
              >
                <option>Panchamasali</option>
                <option>Banajiga</option>
                <option>Jangama</option>
                <option>Sadar</option>
                <option>Nolamba</option>
              </select>
            </div>

            <Input label="Highest Education" value={formData.education} onChange={v => setFormData({...formData, education: v})} icon={Briefcase} placeholder="e.g. M.Tech, IIT Bombay" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(124, 58, 237, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-5 bg-primary-600 text-white rounded-[2.5rem] font-black text-base tracking-widest shadow-xl flex items-center justify-center gap-4 hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />} STAGE PROFILE FOR APPROVAL
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

interface InputProps {
  label: string;
  icon: React.ComponentType<any>;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  sub?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, value, onChange, type = "text", sub, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex justify-between">
      {label} {sub && <span className="text-gold-600 lowercase font-bold italic">{sub}</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-primary-600 transition-colors">
        <Icon size={20} />
      </div>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold focus:ring-2 focus:ring-primary-500/20 transition-all placeholder-gray-300"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default AdminManualUser;
