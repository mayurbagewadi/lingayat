
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, LogOut, CheckCircle2 } from 'lucide-react';

interface PendingApprovalProps {
    onLogout: () => void;
    userName?: string;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ onLogout, userName = "Member" }) => {
    return (
        <div className="min-h-screen bg-primary-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1605634645603-9e19489f6608?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/90 via-primary-950/95 to-primary-950"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 max-w-lg w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl"
            >
                <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold-500/20">
                    <Clock className="text-gold-500 animate-pulse" size={48} />
                </div>

                <h1 className="text-3xl font-serif font-black text-white mb-4">Verification in Progress</h1>

                <p className="text-primary-200 text-lg mb-8 leading-relaxed">
                    Namaste <span className="text-gold-400 font-bold">{userName}</span>, your profile is currently under review by our community elders.
                </p>

                <div className="space-y-4 text-left bg-black/20 rounded-3xl p-6 mb-8 border border-white/5">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={20} />
                        <div>
                            <p className="text-white font-bold text-sm">Profile Submitted</p>
                            <p className="text-white/40 text-xs">Your details have been securely recorded.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Shield className="text-gold-500 mt-1 shrink-0" size={20} />
                        <div>
                            <p className="text-white font-bold text-sm">Under Review</p>
                            <p className="text-white/40 text-xs">Admins are verifying your information for community safety.</p>
                        </div>
                    </div>
                </div>

                <p className="text-white/30 text-xs mb-8">
                    This process usually takes 2-4 hours. You will receive a notification once approved.
                </p>

                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all uppercase tracking-widest text-xs"
                >
                    <LogOut size={16} /> Logout
                </button>
            </motion.div>
        </div>
    );
};

export default PendingApproval;
