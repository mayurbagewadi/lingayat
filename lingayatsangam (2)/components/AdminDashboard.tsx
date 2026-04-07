
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, User, ShieldCheck, Clock, Search, ArrowLeft, Check, X,
  IndianRupee, RefreshCw, Eye, AlertCircle, CheckCircle, CheckCircle2, History, Trash2,
  MailPlus, Send, CreditCard, Settings2, Crown, Key,
  Lock, Shield, Save, UserX, XCircle, Activity, Database,
  Sparkles, FileText, LayoutDashboard, UserCheck, Megaphone, BarChart4
} from 'lucide-react';
import { profileService, UserProfile, AuditLog, PaymentRecord, Announcement } from '../services/profileService';

const AVATAR_FALLBACK = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%23e5e7eb%22/%3E%3Ccircle cx=%2220%22 cy=%2216%22 r=%228%22 fill=%22%239ca3af%22/%3E%3Cellipse cx=%2220%22 cy=%2234%22 rx=%2214%22 ry=%228%22 fill=%22%239ca3af%22/%3E%3C/svg%3E`;

// Toast context to share across sub-components
let _showToast: (msg: string, type?: 'success' | 'error') => void = () => {};
const toast = (msg: string, type: 'success' | 'error' = 'success') => _showToast(msg, type);

const Toast = ({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-6 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {message}
    </motion.div>
  );
};

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [toastData, setToastData] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  _showToast = (msg, type = 'success') => setToastData({ message: msg, type });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verifications' | 'payments' | 'subscriptions' | 'health' | 'settings' | 'reports' | 'logs' | 'announcements'>(() => {
    const saved = sessionStorage.getItem('adminActiveTab');
    return (saved as any) || 'overview';
  });
  const [verificationSubTab, setVerificationSubTab] = useState<'all' | 'profiles' | 'pdfs'>('all');
  const [paymentSubTab, setPaymentSubTab] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [settingsSubTab, setSettingsSubTab] = useState<'payments' | 'notifications' | 'admins'>('payments');

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [_auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, total: 0, pendingPayments: 0 });
  const [isSidebarOpen, _setIsSidebarOpen] = useState(true);

  const [selectedItem, setSelectedItem] = useState<any>(null); // For Review Modals

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingProfiles, statsData, logsData, moderationData, paymentData] = await Promise.all([
        profileService.getPendingProfiles(verificationSubTab),
        profileService.getAdminStats(),
        profileService.getAuditLogs(),
        profileService.getAllProfilesForModeration(),
        profileService.getPayments(paymentSubTab)
      ]);
      setProfiles(pendingProfiles);
      setStats(statsData);
      setAuditLogs(logsData);
      setAllProfiles(moderationData);
      setPayments(paymentData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem('adminActiveTab', activeTab);
    fetchData();
  }, [verificationSubTab, paymentSubTab, activeTab]);

  const navLinks = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'verifications', label: 'Approvals', icon: ShieldCheck, count: stats.pending },
    { id: 'payments', label: 'Payments', icon: IndianRupee, count: stats.pendingPayments },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart4 },
    { id: 'logs', label: 'Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#020202] font-sans transition-colors duration-500">

      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-screen bg-primary-950 dark:bg-[#050505] text-white z-50 flex flex-col border-r border-primary-900/30"
      >
        <div className="p-6 mb-8 flex items-center gap-4">
          <div className="bg-gold-500 text-primary-950 p-2 rounded-xl shrink-0 shadow-lg shadow-gold-500/20">
            <Shield size={24} />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-serif font-black text-xl tracking-tight whitespace-nowrap"
              >
                Lingayat<span className="text-gold-500">Sangam</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-grow px-3 space-y-2">
          {navLinks.map((item) => (
            <SidebarItem
              key={item.id}
              active={activeTab === item.id}
              label={item.label}
              icon={item.icon}
              count={item.count}
              isOpen={isSidebarOpen}
              onClick={() => setActiveTab(item.id as any)}
            />
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-primary-900/30 space-y-2">
          <button
            onClick={() => onNavigate('landing')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-primary-200 hover:bg-white/5 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <ArrowLeft size={20} />
            {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Exit Panel</span>}
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        <header className="sticky top-0 z-40 bg-white/60 dark:bg-primary-950/40 backdrop-blur-2xl border-b border-gray-100 dark:border-gold-500/10 p-6 md:p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif font-black capitalize text-primary-950 dark:text-white">
              {navLinks.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <button onClick={fetchData} className="p-3 bg-white/50 dark:bg-primary-900/30 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 dark:border-white/10 text-primary-600 hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeTab === 'overview' && <OverviewStats stats={stats} />}
              {activeTab === 'users' && <AllUsersView profiles={allProfiles} onRefresh={fetchData} />}
              {activeTab === 'verifications' && <ApprovalsView profiles={profiles} subTab={verificationSubTab} setSubTab={setVerificationSubTab} onReview={setSelectedItem} />}
              {activeTab === 'payments' && <PaymentsView payments={payments} subTab={paymentSubTab} setSubTab={setPaymentSubTab} onVerify={setSelectedItem} />}
              {activeTab === 'subscriptions' && <SubscriptionsView onRefresh={fetchData} />}
              {activeTab === 'health' && <SystemHealthView onRefresh={fetchData} />}
              {activeTab === 'settings' && <SettingsView subTab={settingsSubTab} setSubTab={setSettingsSubTab} />}
              {activeTab === 'announcements' && <AnnouncementsView />}
              {activeTab === 'logs' && <LogsView />}
              {activeTab === 'reports' && <ReportsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* GLOBAL MODALS FOR MODERATION */}
      <AnimatePresence>
        {selectedItem && selectedItem.full_name && (
          <ReviewModal
            profile={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAction={async (status: string, reason?: string) => {
              try {
                await profileService.updateProfileStatus(selectedItem.id, status, reason);
                setSelectedItem(null);
                fetchData();
              } catch (err: any) {
                console.error("Approval error:", err);
                toast(err.message || 'Database error', 'error');
              }
            }}
          />
        )}
        {selectedItem && selectedItem.transaction_id && (
          <PaymentModal
            payment={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAction={async (status: 'completed' | 'rejected', notes?: string) => {
              try {
                await profileService.verifyPayment(selectedItem.id, selectedItem.profile_id, status, notes);
                setSelectedItem(null);
                fetchData();
              } catch (err: any) {
                console.error("Payment verification error:", err);
                toast(err.message || 'Database error', 'error');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toastData && <Toast message={toastData.message} type={toastData.type} onDone={() => setToastData(null)} />}
      </AnimatePresence>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const OverviewStats = ({ stats }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard title="Total Profiles" value={stats.total} trend="+12" icon={Users} bg="bg-primary-50 dark:bg-primary-500/10 text-primary-600" />
    <StatCard title="Active Members" value={stats.active} trend="+18" icon={UserCheck} bg="bg-green-50 dark:bg-green-500/10 text-green-600" />
    <StatCard title="Pending Approvals" value={stats.pending} trend="-5" icon={ShieldCheck} bg="bg-orange-50 dark:bg-orange-500/10 text-orange-600" />
    <StatCard title="New Payments" value={stats.pendingPayments} trend="+2" icon={IndianRupee} bg="bg-gold-50 dark:bg-gold-500/10 text-gold-600" />
  </div>
);

const ApprovalsView = ({ profiles, subTab, setSubTab, onReview }: any) => (
  <div className="space-y-8">
    <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 gap-1 w-fit shadow-inner">
      <SettingsTab active={subTab === 'all'} label="All Pending" onClick={() => setSubTab('all')} icon={ShieldCheck} />
      <SettingsTab active={subTab === 'profiles'} label="Profiles" onClick={() => setSubTab('profiles')} icon={User} />
      <SettingsTab active={subTab === 'pdfs'} label="PDFs" onClick={() => setSubTab('pdfs')} icon={FileText} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((p: any) => (
        <div key={p.id} className="bg-white dark:bg-[#0A0A0A] p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl dark:hover:border-white/10 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0"><img src={profileService.getGoogleDriveUrl(p.photo_1_file_id) || AVATAR_FALLBACK} className="w-full h-full object-cover" /></div>
            <div><h4 className="font-black text-sm">{p.full_name}</h4><p className="text-[10px] text-gray-400 font-bold uppercase">{p.sub_caste}</p></div>
          </div>
          <button onClick={() => onReview(p)} className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary-600/20 active:scale-95 transition-transform">Review Identity</button>
        </div>
      ))}
      {profiles.length === 0 && <p className="col-span-full py-20 text-center text-gray-400 font-black uppercase tracking-widest">Queue is clear</p>}
    </div>
  </div>
);

const PaymentsView = ({ payments, subTab, setSubTab, onVerify }: any) => (
  <div className="space-y-8">
    <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 gap-1 w-fit">
      <SettingsTab active={subTab === 'pending'} label="Pending Proofs" onClick={() => setSubTab('pending')} icon={Clock} />
      <SettingsTab active={subTab === 'completed'} label="Successful" onClick={() => setSubTab('completed')} icon={CheckCircle} />
    </div>
    <div className="bg-white dark:bg-[#0A0A0A] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-white/5">
          <tr className="border-b border-gray-100 dark:border-white/5">
            <th className="p-6 text-[10px] font-black uppercase text-gray-400">TXN ID</th>
            <th className="p-6 text-[10px] font-black uppercase text-gray-400">User</th>
            <th className="p-6 text-[10px] font-black uppercase text-gray-400">Amount</th>
            <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right">Verification</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
          {payments.map((pmt: any) => (
            <tr key={pmt.id} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.02] transition-colors">
              <td className="p-6 font-black text-xs">{pmt.transaction_id}</td>
              <td className="p-6 font-bold text-sm">{pmt.profiles?.full_name}</td>
              <td className="p-6 font-black text-primary-600">₹{pmt.amount}</td>
              <td className="p-6 text-right"><button onClick={() => onVerify(pmt)} className="px-5 py-2 bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-xl font-black text-[10px] uppercase">Review Proof</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReviewModal = ({ profile, onClose, onAction }: any) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0C0C0C] w-full max-w-2xl rounded-[3rem] p-10 space-y-8 overflow-hidden shadow-2xl border border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif font-black">Moderation Panel</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-all"><X size={20} /></button>
        </div>
        <div className="flex gap-6 items-center p-6 bg-gray-50 dark:bg-white/[0.03] rounded-3xl">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0"><img src={profileService.getGoogleDriveUrl(profile.photo_1_file_id) || AVATAR_FALLBACK} className="w-full h-full object-cover" /></div>
          <div>
            <p className="text-xl font-black">{profile.full_name}</p>
            <p className="text-sm font-bold text-gray-500">{profile.education} • {profile.location}</p>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-gray-400">Admin Notes / Rejection Reason</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide feedback if rejecting..." className="w-full h-32 p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border-none ring-1 ring-gray-100 dark:ring-white/10 outline-none font-bold" />
        </div>
        <div className="flex gap-4">
          <button onClick={() => onAction('active')} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-500/20">Approve Profile</button>
          <button onClick={() => onAction('rejected', reason)} className="px-10 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-2xl font-black uppercase tracking-widest">Reject</button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentModal = ({ payment, onClose, onAction }: any) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0C0C0C] w-full max-w-4xl h-[80vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5">
        <div className="md:w-1/2 bg-black flex items-center justify-center">
          {payment.proof_url ? (
            <img src={payment.proof_url} className="max-h-full max-w-full object-contain" />
          ) : (
            <p className="text-white font-black uppercase tracking-widest text-xs opacity-50">No screenshot attached</p>
          )}
        </div>
        <div className="md:w-1/2 p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-black">Verify Proof</h3>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <span className="text-gray-400">User</span> <span>{payment.profiles?.full_name}</span>
                <span className="text-gray-400">Amount</span> <span className="text-primary-600 font-black">₹{payment.amount}</span>
                <span className="text-gray-400">TXN ID</span> <span className="tracking-widest">{payment.transaction_id}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium bg-primary-50 dark:bg-primary-500/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/50">
                Check your bank statement for a credit of <b>₹{payment.amount}</b> with reference <b>{payment.transaction_id}</b> before approving.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onAction('completed')} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase shadow-lg shadow-green-500/20">Verify & Activate</button>
            <button onClick={() => onAction('rejected')} className="px-8 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-2xl font-black uppercase">Reject</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SystemHealthView = ({ onRefresh: _onRefresh }: { onRefresh?: () => void }) => {
  const [healthData, setHealthData] = useState<Record<string, { status: string, message: string }>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    const data = await profileService.checkSystemHealth();
    setHealthData(data);
    setLastChecked(new Date().toLocaleTimeString());
    setIsChecking(false);
  };

  useEffect(() => { runHealthCheck(); }, []);

  const counts = Object.values(healthData).reduce((acc, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cardStyle = (status: string) => {
    if (status === 'healthy') return 'bg-green-50/30 dark:bg-green-500/[0.03] border-green-100 dark:border-green-500/20';
    if (status === 'warning') return 'bg-amber-50/30 dark:bg-amber-500/[0.03] border-amber-100 dark:border-amber-500/20';
    return 'bg-red-50/30 dark:bg-red-500/[0.03] border-red-100 dark:border-red-500/20';
  };

  const cardIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle2 className="text-green-500" size={18} />;
    if (status === 'warning') return <AlertCircle className="text-amber-500" size={18} />;
    return <XCircle className="text-red-500" size={18} />;
  };

  const labelMap: Record<string, string> = {
    auth: 'Authentication',
    profiles: 'Profiles Table',
    payments: 'Payments Table',
    audit_logs: 'Audit Logs',
    activity_logs: 'Activity Logs',
    app_settings: 'App Settings',
    announcements: 'Announcements',
    interests: 'Interests Table',
    payment_config: 'Payment Gateway',
    storage: 'Storage Buckets',
    pending_approvals: 'Approval Queue',
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-[3.5rem] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center shadow-sm gap-6">
        <div>
          <h3 className="text-xl font-black">System Health</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Auth, Database, Config & Storage</p>
          {lastChecked && <p className="text-xs text-gray-400 mt-1">Last checked: {lastChecked}</p>}
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {Object.keys(counts).length > 0 && (
            <div className="flex items-center gap-3 text-xs font-bold">
              {counts['healthy'] && <span className="text-green-600">{counts['healthy']} OK</span>}
              {counts['warning'] && <span className="text-amber-600">{counts['warning']} Warn</span>}
              {counts['error'] && <span className="text-red-600">{counts['error']} Fail</span>}
            </div>
          )}
          <button onClick={runHealthCheck} disabled={isChecking} className="flex-1 md:flex-none px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg">
            {isChecking ? <RefreshCw className="animate-spin" size={16} /> : <Activity size={16} />} Run Check
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(healthData).map(([key, result]: [string, any]) => (
          <div key={key} className={`p-6 rounded-[2.5rem] border-2 shadow-sm transition-all ${cardStyle(result.status)}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{key.replace(/_/g, ' ')}</span>
              {cardIcon(result.status)}
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider mb-2">{labelMap[key] || key}</h4>
            <p className="text-xs font-bold text-gray-500 line-clamp-2">{result.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = ({ subTab, setSubTab }: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({ rzp_key_id: '', rzp_key_secret: '', rzp_webhook_secret: '', merchant_name: 'Lingayat Sangam Org', manual_upi_id: '', manual_bank_acc: '', manual_bank_ifsc: '', yearly_price: 2999 });

  useEffect(() => {
    profileService.getSettings(['rzp_key_id', 'rzp_key_secret', 'rzp_webhook_secret', 'merchant_name', 'manual_upi_id', 'manual_bank_acc', 'manual_bank_ifsc', 'yearly_price'])
      .then(s => setConfig(prev => ({ ...prev, ...s })));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileService.updateSettings(config);
      toast('Settings saved successfully.');
    } catch (err: any) {
      toast('Save failed: ' + err.message, 'error');
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 gap-1 w-fit">
        <SettingsTab active={subTab === 'payments'} icon={CreditCard} label="Payment Gateway" onClick={() => setSubTab('payments')} />
        <SettingsTab active={subTab === 'admins'} icon={Shield} label="Admin Roles" onClick={() => setSubTab('admins')} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white dark:bg-[#0A0A0A] p-10 md:p-14 rounded-[3.5rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConfigInput label="Razorpay Key ID" value={config.rzp_key_id} onChange={(v: any) => setConfig({ ...config, rzp_key_id: v })} icon={Key} />
            <ConfigInput label="Razorpay Key Secret" type="password" value={config.rzp_key_secret} onChange={(v: any) => setConfig({ ...config, rzp_key_secret: v })} icon={Lock} />
            <ConfigInput label="UPI ID for Manual" value={config.manual_upi_id} onChange={(v: any) => setConfig({ ...config, manual_upi_id: v })} icon={IndianRupee} />
            <ConfigInput label="Bank IFSC" value={config.manual_bank_ifsc} onChange={(v: any) => setConfig({ ...config, manual_bank_ifsc: v })} icon={Database} />
          </div>
          <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Save All Credentials
          </button>
        </div>
        <div className="lg:col-span-4 bg-primary-950 dark:bg-[#080808] text-white rounded-[3rem] p-10 space-y-6 border border-white/5">
          <h4 className="text-lg font-black flex items-center gap-3"><ShieldCheck className="text-gold-500" /> Privacy Guard</h4>
          <p className="text-sm text-primary-200 leading-relaxed font-medium">All credentials stored here are encrypted and only accessible to Superadmins. If the 'app_settings' table is missing from your database, this form will fail to save.</p>
        </div>
      </div>
    </div>
  );
};

const SubscriptionsView = ({ onRefresh }: { onRefresh: () => void }) => {
  const [subFilter, setSubFilter] = useState<'all' | 'premium' | 'free' | 'expired'>('all');
  const [subscribers, setSubscribers] = useState<UserProfile[]>([]);
  const [subStats, setSubStats] = useState({ premium: 0, free: 0, expired: 0, total: 0, expiringSoon: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [autoAssign, setAutoAssign] = useState({ enabled: false, plan: 'free', durationMonths: 12 });
  const [isSavingAuto, setIsSavingAuto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('2999');
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const fetchSubs = async () => {
    setIsLoading(true);
    const [stats, users, autoConfig, settings] = await Promise.all([
      profileService.getSubscriptionStats(),
      profileService.getAllSubscribers(subFilter),
      profileService.getAutoAssignPlan(),
      profileService.getSettings(['yearly_price'])
    ]);
    setSubStats(stats);
    setSubscribers(users);
    setAutoAssign(autoConfig);
    if (settings.yearly_price) setPremiumPrice(String(settings.yearly_price));
    setIsLoading(false);
  };

  useEffect(() => { fetchSubs(); }, [subFilter]);

  const handleSavePrice = async () => {
    const price = Number(premiumPrice);
    if (!price || price <= 0) { toast('Enter a valid amount', 'error'); return; }
    setIsSavingPrice(true);
    try {
      await profileService.updateSettings({ yearly_price: price });
      toast('Premium plan price updated to ₹' + price);
    } catch (err: any) {
      toast('Failed to save: ' + err.message, 'error');
    } finally { setIsSavingPrice(false); }
  };

  const handleSaveAutoAssign = async () => {
    setIsSavingAuto(true);
    try {
      await profileService.setAutoAssignPlan(autoAssign.enabled, autoAssign.plan, autoAssign.durationMonths);
      toast('Auto-assign settings saved.');
    } catch (err: any) {
      toast('Failed to save: ' + err.message, 'error');
    } finally { setIsSavingAuto(false); }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return subscribers;
    return subscribers.filter(p =>
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subscribers, searchTerm]);

  return (
    <div className="space-y-8">
      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard title="Premium" value={subStats.premium} trend={`${subStats.total ? Math.round((subStats.premium / subStats.total) * 100) : 0}`} icon={Crown} bg="bg-gold-50 dark:bg-gold-500/10 text-gold-600" />
        <StatCard title="Free Users" value={subStats.free} trend="—" icon={Users} bg="bg-gray-50 dark:bg-gray-500/10 text-gray-500" />
        <StatCard title="Expired" value={subStats.expired} trend="—" icon={Clock} bg="bg-red-50 dark:bg-red-500/10 text-red-500" />
        <StatCard title="Expiring Soon" value={subStats.expiringSoon} trend="30d" icon={AlertCircle} bg="bg-orange-50 dark:bg-orange-500/10 text-orange-500" />
        <StatCard title="Total Users" value={subStats.total} trend="—" icon={Users} bg="bg-primary-50 dark:bg-primary-500/10 text-primary-600" />
      </div>

      {/* PREMIUM PLAN PRICING */}
      <div className="bg-white dark:bg-[#0A0A0A] p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black flex items-center gap-3"><IndianRupee className="text-gold-500" size={20} /> Premium Plan Pricing</h3>
          <p className="text-xs text-gray-400 font-bold mt-1">Set the yearly subscription amount. This price is shown to users on the payment page.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Yearly Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">₹</span>
              <input
                type="number"
                min="1"
                value={premiumPrice}
                onChange={e => setPremiumPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-black text-2xl dark:text-white focus:ring-2 focus:ring-gold-500/30 transition-all"
                placeholder="2999"
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Per Month Equivalent</p>
            <p className="font-black text-lg">₹{premiumPrice ? Math.round(Number(premiumPrice) / 12) : '—'}<span className="text-xs text-gray-400 font-bold">/mo</span></p>
          </div>
          <button onClick={handleSavePrice} disabled={isSavingPrice} className="py-4 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
            {isSavingPrice ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Update Price
          </button>
        </div>
      </div>

      {/* AUTO-ASSIGN CONFIG */}
      <div className="bg-white dark:bg-[#0A0A0A] p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black flex items-center gap-3"><Sparkles className="text-gold-500" size={20} /> Auto-Assign Plan for New Users</h3>
            <p className="text-xs text-gray-400 font-bold mt-1">When enabled, every new user who registers gets automatically assigned the selected plan.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</label>
            <button
              onClick={() => setAutoAssign(p => ({ ...p, enabled: !p.enabled }))}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${autoAssign.enabled ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
            >
              {autoAssign.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Plan to Assign</label>
            <select
              value={autoAssign.plan}
              onChange={e => setAutoAssign(p => ({ ...p, plan: e.target.value }))}
              className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Duration (Months)</label>
            <select
              value={autoAssign.durationMonths}
              onChange={e => setAutoAssign(p => ({ ...p, durationMonths: parseInt(e.target.value) }))}
              disabled={autoAssign.plan === 'free'}
              className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white disabled:opacity-40"
            >
              <option value={1}>1 Month</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months (1 Year)</option>
              <option value={24}>24 Months (2 Years)</option>
            </select>
          </div>
          <button onClick={handleSaveAutoAssign} disabled={isSavingAuto} className="py-4 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
            {isSavingAuto ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Save
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-gold-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] outline-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 gap-1 w-full lg:w-auto shadow-inner">
          <SettingsTab active={subFilter === 'all'} label="All" onClick={() => setSubFilter('all')} icon={Users} />
          <SettingsTab active={subFilter === 'premium'} label="Premium" onClick={() => setSubFilter('premium')} icon={Crown} />
          <SettingsTab active={subFilter === 'free'} label="Free" onClick={() => setSubFilter('free')} icon={User} />
          <SettingsTab active={subFilter === 'expired'} label="Expired" onClick={() => setSubFilter('expired')} icon={Clock} />
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">User</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-center">Plan</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Started</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Expires</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                      <img src={profileService.getGoogleDriveUrl(p.photo_1_file_id) || AVATAR_FALLBACK} className="w-full h-full object-cover" alt={p.full_name} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{p.full_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{p.email || p.mobile || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                    p.subscription_status === 'premium' ? 'bg-gold-500/10 text-gold-500 ring-1 ring-gold-500/20' :
                    p.subscription_status === 'expired' ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20' :
                    'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20'
                  }`}>
                    {p.subscription_status || 'free'}
                  </span>
                </td>
                <td className="p-6 text-xs font-bold text-gray-400">
                  {p.subscription_started_at ? new Date(p.subscription_started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="p-6 text-xs font-bold">
                  {p.subscription_expires_at ? (
                    <span className={new Date(p.subscription_expires_at) < new Date() ? 'text-red-500' : new Date(p.subscription_expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-orange-500' : 'text-green-500'}>
                      {new Date(p.subscription_expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  ) : '—'}
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => setSelectedUser(p)}
                    className="px-5 py-2 bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-xl font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-400 font-black uppercase tracking-[0.2em] opacity-40">
                  {isLoading ? 'Loading...' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MANAGE SUBSCRIPTION MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <ManageSubscriptionModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onDone={() => { setSelectedUser(null); fetchSubs(); onRefresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ManageSubscriptionModal = ({ user, onClose, onDone }: { user: UserProfile; onClose: () => void; onDone: () => void }) => {
  const [action, setAction] = useState<'set' | 'extend'>('set');
  const [plan, setPlan] = useState<'free' | 'premium' | 'expired'>(user.subscription_status || 'free');
  const [duration, setDuration] = useState(12);
  const [extendMonths, setExtendMonths] = useState(12);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      if (action === 'set') {
        await profileService.updateSubscription(user.id!, plan, duration);
      } else {
        await profileService.extendSubscription(user.id!, extendMonths);
      }
      onDone();
    } catch (err: any) {
      toast('Failed: ' + err.message, 'error');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0C0C0C] w-full max-w-lg rounded-[3rem] p-10 space-y-8 shadow-2xl border border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif font-black">Manage Subscription</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-all"><X size={20} /></button>
        </div>

        {/* User info */}
        <div className="flex gap-5 items-center p-5 bg-gray-50 dark:bg-white/[0.03] rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0">
            <img src={profileService.getGoogleDriveUrl(user.photo_1_file_id) || AVATAR_FALLBACK} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-black text-base">{user.full_name}</p>
            <p className="text-xs text-gray-400 font-bold">{user.email || user.mobile}</p>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-lg text-[8px] font-black uppercase ${
              user.subscription_status === 'premium' ? 'bg-gold-500/10 text-gold-500' :
              user.subscription_status === 'expired' ? 'bg-red-500/10 text-red-500' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              Currently: {user.subscription_status || 'free'}
              {user.subscription_expires_at ? ` (expires ${new Date(user.subscription_expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})` : ''}
            </span>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-[2rem] gap-1">
          <button onClick={() => setAction('set')} className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${action === 'set' ? 'bg-white dark:bg-white/10 shadow-md text-primary-600 dark:text-gold-500' : 'text-gray-400'}`}>
            Set Plan
          </button>
          <button onClick={() => setAction('extend')} disabled={user.subscription_status !== 'premium'} className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 ${action === 'extend' ? 'bg-white dark:bg-white/10 shadow-md text-primary-600 dark:text-gold-500' : 'text-gray-400'}`}>
            Extend
          </button>
        </div>

        {action === 'set' ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assign Plan</label>
              <select value={plan} onChange={e => setPlan(e.target.value as any)} className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white">
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            {plan === 'premium' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Duration</label>
                <select value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white">
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Extend By</label>
            <select value={extendMonths} onChange={e => setExtendMonths(parseInt(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white">
              <option value={1}>+1 Month</option>
              <option value={3}>+3 Months</option>
              <option value={6}>+6 Months</option>
              <option value={12}>+12 Months (1 Year)</option>
            </select>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full py-4 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Crown size={16} />}
          {action === 'set' ? `Set to ${plan}` : `Extend ${extendMonths} months`}
        </button>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon: Icon, bg }: any) => (
  <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm relative group hover:shadow-xl transition-all overflow-hidden">
    <div className="absolute top-0 right-0 p-12 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
    <div className={`relative z-10 p-4 rounded-2xl mb-6 inline-block ${bg} group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
    <p className="relative z-10 text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{title}</p>
    <div className="relative z-10 flex items-end justify-between">
      <h4 className="text-3xl font-black">{value}</h4>
      <span className="text-[9px] font-black px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600">{trend}%</span>
    </div>
  </div>
);

const ConfigInput = ({ label, value, onChange, type = "text", icon: Icon }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-2">{Icon && <Icon size={12} />} {label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm focus:ring-2 focus:ring-primary-500/20 transition-all" />
  </div>
);

const SidebarItem = ({ active, label, icon: Icon, count, isOpen, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative ${active ? 'bg-gold-500 text-primary-950 shadow-lg' : 'text-primary-300 hover:bg-white/5'}`}>
    <Icon size={20} />
    {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>}
    {count > 0 && <div className="absolute right-4 px-2 py-0.5 rounded-lg text-[8px] font-black bg-primary-950 text-gold-500">{count}</div>}
  </button>
);

const SettingsTab = ({ active, icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${active ? 'bg-white dark:bg-white/10 shadow-md text-primary-600 dark:text-gold-500' : 'text-gray-400'}`}>
    <Icon size={16} /> {label}
  </button>
);

/* Mock Components for minor tabs */
const LogsView = () => <div className="p-20 text-center font-black text-gray-300 uppercase tracking-widest">Audit Trails Loading...</div>;
const ReportsView = () => <div className="p-20 text-center font-black text-gray-300 uppercase tracking-widest">BI Intelligence Engine Starting...</div>;
const AnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<{ subject: string; body: string; recipient_group: 'all' | 'paid' | 'free' | 'specific'; status: 'draft' | 'scheduled' | 'sent' }>({
    subject: '', body: '', recipient_group: 'all', status: 'draft'
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const data = await profileService.getAnnouncements();
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const resetForm = () => {
    setForm({ subject: '', body: '', recipient_group: 'all', status: 'draft' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (a: Announcement) => {
    setForm({ subject: a.subject, body: a.body, recipient_group: a.recipient_group, status: a.status });
    setEditingId(a.id || null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.subject.trim() || !form.body.trim()) { toast('Subject and body are required', 'error'); return; }
    setIsSaving(true);
    try {
      if (editingId) {
        await profileService.updateAnnouncement(editingId, {
          subject: form.subject, body: form.body, recipient_group: form.recipient_group, status: form.status,
          ...(form.status === 'sent' ? { sent_at: new Date().toISOString() } : {})
        });
        toast('Announcement updated');
      } else {
        await profileService.saveAnnouncement({
          subject: form.subject, body: form.body, recipient_group: form.recipient_group, status: form.status,
          delivery_channels: ['in_app'],
          ...(form.status === 'sent' ? { sent_at: new Date().toISOString() } : {})
        });
        toast('Announcement created');
      }
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      toast('Failed: ' + err.message, 'error');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await profileService.deleteAnnouncement(id);
      toast('Announcement deleted');
      setDeleteConfirm(null);
      fetchAnnouncements();
    } catch (err: any) {
      toast('Delete failed: ' + err.message, 'error');
    }
  };

  const handleMarkSent = async (a: Announcement) => {
    try {
      await profileService.updateAnnouncement(a.id!, { status: 'sent', sent_at: new Date().toISOString() });
      toast('Marked as sent');
      fetchAnnouncements();
    } catch (err: any) {
      toast('Failed: ' + err.message, 'error');
    }
  };

  const stats = useMemo(() => ({
    total: announcements.length,
    draft: announcements.filter(a => a.status === 'draft').length,
    sent: announcements.filter(a => a.status === 'sent').length,
    scheduled: announcements.filter(a => a.status === 'scheduled').length,
  }), [announcements]);

  const groupLabel = (g: string) => g === 'all' ? 'All Users' : g === 'paid' ? 'Premium' : g === 'free' ? 'Free Users' : 'Specific';
  const statusColor = (s: string) => s === 'sent' ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : s === 'draft' ? 'bg-gray-100 dark:bg-gray-500/10 text-gray-500' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600';

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard title="Total" value={stats.total} trend="—" icon={Megaphone} bg="bg-primary-50 dark:bg-primary-500/10 text-primary-600" />
        <StatCard title="Drafts" value={stats.draft} trend="—" icon={FileText} bg="bg-gray-50 dark:bg-gray-500/10 text-gray-500" />
        <StatCard title="Sent" value={stats.sent} trend="—" icon={Send} bg="bg-green-50 dark:bg-green-500/10 text-green-600" />
        <StatCard title="Scheduled" value={stats.scheduled} trend="—" icon={Clock} bg="bg-orange-50 dark:bg-orange-500/10 text-orange-500" />
      </div>

      {/* Create Button */}
      {!showForm && (
        <button onClick={() => { resetForm(); setShowForm(true); }} className="py-4 px-8 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-3 hover:shadow-xl transition-all">
          <MailPlus size={16} /> New Announcement
        </button>
      )}

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0A0A0A] p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-3"><Megaphone className="text-gold-500" size={20} /> {editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} /></button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Announcement subject..." className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white focus:ring-2 focus:ring-gold-500/30 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Body</label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={5} placeholder="Write your announcement..." className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white focus:ring-2 focus:ring-gold-500/30 transition-all resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recipients</label>
                <select value={form.recipient_group} onChange={e => setForm(f => ({ ...f, recipient_group: e.target.value as any }))} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white focus:ring-2 focus:ring-gold-500/30 transition-all">
                  <option value="all">All Users</option>
                  <option value="paid">Premium Users</option>
                  <option value="free">Free Users</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white focus:ring-2 focus:ring-gold-500/30 transition-all">
                  <option value="draft">Draft</option>
                  <option value="sent">Send Now</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={handleSave} disabled={isSaving} className="py-4 px-8 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-3 disabled:opacity-50 hover:shadow-xl transition-all">
              {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} {editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} className="py-4 px-8 bg-gray-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Announcements List */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-lg font-black flex items-center gap-3"><History className="text-gold-500" size={20} /> All Announcements</h3>
        </div>

        {isLoading ? (
          <div className="p-20 text-center"><RefreshCw className="animate-spin mx-auto text-gold-500" size={24} /></div>
        ) : announcements.length === 0 ? (
          <div className="p-20 text-center text-gray-300 font-black text-xs uppercase tracking-widest">No announcements yet</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {announcements.map(a => (
              <div key={a.id} className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusColor(a.status)}`}>{a.status}</span>
                      <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 text-primary-600">{groupLabel(a.recipient_group)}</span>
                    </div>
                    <h4 className="font-black text-sm dark:text-white truncate">{a.subject}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.body}</p>
                    <p className="text-[10px] text-gray-300 mt-2">
                      Created {new Date(a.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {a.sent_at && <> · Sent {new Date(a.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.status === 'draft' && (
                      <button onClick={() => handleMarkSent(a)} className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all" title="Send Now">
                        <Send size={14} />
                      </button>
                    )}
                    <button onClick={() => handleEdit(a)} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all" title="Edit">
                      <FileText size={14} />
                    </button>
                    {deleteConfirm === a.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(a.id!)} className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all" title="Confirm Delete">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 transition-all" title="Cancel">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(a.id!)} className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
const AllUsersView = ({ profiles, onRefresh }: { profiles: UserProfile[]; onRefresh: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_approval' | 'rejected'>('all');
  const [viewUser, setViewUser] = useState<UserProfile | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRoleUpdate = async (id: string, role: string) => {
    setIsProcessing(true);
    try {
      await profileService.updateProfileRole(id, role);
      setEditRoleUser(null);
      onRefresh();
    } catch (err: any) {
      toast('Failed to update role: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await profileService.deleteProfile(id);
      setDeleteUser(null);
      onRefresh();
    } catch (err: any) {
      toast('Failed to delete user: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [profiles, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* SEARCH & FILTERS */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-gold-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] outline-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 gap-1 w-full lg:w-auto shadow-inner">
          <SettingsTab active={statusFilter === 'all'} label="All" onClick={() => setStatusFilter('all')} icon={Users} />
          <SettingsTab active={statusFilter === 'active'} label="Active" onClick={() => setStatusFilter('active')} icon={CheckCircle2} />
          <SettingsTab active={statusFilter === 'pending_approval'} label="Pending" onClick={() => setStatusFilter('pending_approval')} icon={Clock} />
          <SettingsTab active={statusFilter === 'rejected'} label="Rejected" onClick={() => setStatusFilter('rejected')} icon={XCircle} />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0A0A0A] rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">User</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-center">Role</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Join Date</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {filteredProfiles.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                      <img src={profileService.getGoogleDriveUrl(p.photo_1_file_id) || AVATAR_FALLBACK} className="w-full h-full object-cover" alt={p.full_name} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{p.full_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-center">
                    <RoleBadge role={p.role || 'user'} />
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${p.status === 'active' ? 'bg-green-500/10 text-green-500 ring-1 ring-green-500/20' :
                      p.status === 'pending_approval' ? 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20' :
                        'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
                    }`}>
                    {p.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-6 text-xs font-bold text-gray-400">
                  {new Date(p.created_at || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setViewUser(p)} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg transition-colors" title="View Profile">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => setEditRoleUser(p)} className="p-2 hover:bg-gold-50 dark:hover:bg-gold-500/10 text-gold-600 rounded-lg transition-colors" title="Edit Role">
                      <Shield size={18} />
                    </button>
                    <button onClick={() => setDeleteUser(p)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-lg transition-colors" title="Delete User">
                      <UserX size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProfiles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-32 text-center text-gray-400 font-black uppercase tracking-[0.2em] opacity-40">
                  <div className="flex flex-col items-center gap-4">
                    <Search size={48} className="text-gray-200 dark:text-white/5" />
                    <span>No members match your criteria</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {viewUser && <UserViewModal user={viewUser} onClose={() => setViewUser(null)} />}
        {editRoleUser && <EditRoleModal user={editRoleUser} onClose={() => setEditRoleUser(null)} onSave={handleRoleUpdate} isProcessing={isProcessing} />}
        {deleteUser && <DeleteConfirmModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={() => handleDelete(deleteUser.id!)} isProcessing={isProcessing} />}
      </AnimatePresence>
    </div>
  );
};

const UserViewModal = ({ user, onClose }: { user: UserProfile; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0C0C0C] w-full max-w-xl rounded-[3rem] p-10 space-y-6 shadow-2xl border border-white/5 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif font-black">User Profile</h3>
        <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-all"><X size={20} /></button>
      </div>
      <div className="flex items-center gap-5 p-6 bg-gray-50 dark:bg-white/[0.03] rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0">
          <img src={profileService.getGoogleDriveUrl(user.photo_1_file_id) || AVATAR_FALLBACK} className="w-full h-full object-cover" alt={user.full_name} />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-black">{user.full_name}</p>
          <p className="text-xs font-bold text-gray-400">{user.email}</p>
          <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-gold-500/10 text-gold-500' : user.role === 'moderator' ? 'bg-primary-500/10 text-primary-500' : user.role === 'support' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'}`}>{user.role || 'user'}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs font-bold">
        {([
          ['Mobile', user.mobile || '—'],
          ['Gender', user.gender || '—'],
          ['Sub Caste', user.sub_caste || '—'],
          ['Education', user.education || '—'],
          ['Location', user.location || '—'],
          ['Created For', user.created_for || '—'],
          ['Status', user.status?.replace('_', ' ') || '—'],
          ['Subscription', user.subscription_status || '—'],
          ['Joined', user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
          ['Admin Created', user.is_admin_created ? 'Yes' : 'No'],
        ] as [string, string][]).map(([label, val]) => (
          <div key={label} className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">{label}</p>
            <p className="font-black capitalize">{val}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

const EditRoleModal = ({ user, onClose, onSave, isProcessing }: { user: UserProfile; onClose: () => void; onSave: (id: string, role: string) => void; isProcessing: boolean }) => {
  const [role, setRole] = useState(user.role || 'user');
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0C0C0C] w-full max-w-sm rounded-[3rem] p-10 space-y-6 shadow-2xl border border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif font-black">Edit Role</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-all"><X size={20} /></button>
        </div>
        <p className="text-sm font-bold text-gray-500">{user.full_name}</p>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assign Role</label>
          <select value={role} onChange={e => setRole(e.target.value as 'user' | 'admin' | 'moderator' | 'support')} className="w-full p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-white/10 font-bold text-sm dark:text-white">
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="support">Support</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={() => onSave(user.id!, role)} disabled={isProcessing || role === user.role} className="w-full py-4 bg-gold-500 text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg">
          {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />} Save Role
        </button>
      </motion.div>
    </div>
  );
};

const DeleteConfirmModal = ({ user, onClose, onConfirm, isProcessing }: { user: UserProfile; onClose: () => void; onConfirm: () => void; isProcessing: boolean }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0C0C0C] w-full max-w-sm rounded-[3rem] p-10 space-y-6 shadow-2xl border border-white/5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif font-black text-red-500">Delete User</h3>
        <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-all"><X size={20} /></button>
      </div>
      <p className="text-sm font-bold text-gray-500 leading-relaxed">
        Are you sure you want to permanently delete <span className="text-primary-800 dark:text-white font-black">{user.full_name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-4">
        <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs uppercase">Cancel</button>
        <button onClick={onConfirm} disabled={isProcessing} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-3">
          {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <UserX size={16} />} Delete
        </button>
      </div>
    </motion.div>
  </div>
);

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    admin: 'bg-gold-500/10 text-gold-500 ring-1 ring-gold-500/30',
    moderator: 'bg-primary-500/10 text-primary-500 ring-1 ring-primary-500/30',
    support: 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/30',
    user: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${styles[role] || styles.user}`}>
      {role}
    </span>
  );
};

export default AdminDashboard;
