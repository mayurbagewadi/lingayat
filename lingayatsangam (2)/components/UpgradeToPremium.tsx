
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, Crown, Shield, CreditCard,
  Receipt, Upload, X, ArrowLeft,
  Loader2, Check, Info, Landmark
} from 'lucide-react';
import { profileService } from '../services/profileService';

interface UpgradeToPremiumProps {
  onNavigate: (view: string) => void;
  user: any;
  profileId: string;
}

const UpgradeToPremium: React.FC<UpgradeToPremiumProps> = ({ onNavigate, user, profileId }) => {
  const [activeTab, setActiveTab] = useState<'razorpay' | 'manual'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'pending_verification'>('idle');
  const [yearlyPrice, setYearlyPrice] = useState(2999);

  useEffect(() => {
    profileService.getSettings(['yearly_price']).then(s => {
      if (s.yearly_price) setYearlyPrice(Number(s.yearly_price));
    });
  }, []);
  
  const benefits = [
    { text: "View unlimited profiles", icon: CheckCircle },
    { text: "See phone numbers instantly", icon: CheckCircle },
    { text: "Download PDF bios", icon: CheckCircle },
    { text: "Express interest feature", icon: CheckCircle },
    { text: "Advanced search filters (Income, etc.)", icon: CheckCircle },
    { text: "Contact 20 profiles per day", icon: CheckCircle },
    { text: "See who viewed your profile", icon: CheckCircle },
    { text: "Priority customer support", icon: CheckCircle }
  ];

  const handleRazorpay = async () => {
    setIsProcessing(true);
    // Simulate Razorpay Webhook success after delay
    setTimeout(async () => {
      try {
        await profileService.activateInstantSubscription(user.id, profileId, yearlyPrice, `RZP_${Date.now()}`);
        setStatus('success');
      } catch (err) {
        alert("Payment failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const submitManual = async () => {
    if (!proofFile) return;
    setIsProcessing(true);
    try {
      await profileService.submitManualPayment(user.id, profileId, yearlyPrice, proofFile);
      setStatus('pending_verification');
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (status !== 'idle') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md space-y-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-gold-100 text-gold-600'}`}>
            {status === 'success' ? <Check size={48} /> : <Info size={48} />}
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-black">{status === 'success' ? "Subscription Activated!" : "Verification Started"}</h2>
            <p className="text-gray-500 leading-relaxed text-lg">
              {status === 'success' 
                ? "Your royal membership is now active. Explore unlimited profiles today!" 
                : "Your payment proof is being verified. You'll be notified within 24 hours."}
            </p>
          </div>
          <button onClick={() => onNavigate('dashboard')} className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-lg">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-20 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-400 font-bold mb-10 hover:text-primary-600 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Benefits Column */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-6">
                <Crown size={14} /> Yearly Plan Highlighted
              </div>
              <h1 className="text-5xl font-serif font-black text-primary-950 dark:text-white">Royal Access for <br/><span className="text-gold-500">365 Days</span></h1>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border-2 border-primary-100 dark:border-primary-800 shadow-2xl relative overflow-hidden group">
               <div className="flex justify-between items-end mb-10">
                 <div>
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                   <h2 className="text-5xl font-black text-primary-600 font-serif">₹{yearlyPrice}</h2>
                   <p className="text-sm font-bold text-gray-500">Valid until {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</p>
                 </div>
                 <div className="bg-red-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg animate-bounce">
                   Save 40% vs Monthly
                 </div>
               </div>

               <div className="space-y-4">
                 {benefits.map((b, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="p-1 bg-green-50 text-green-600 rounded-lg"><b.icon size={16} /></div>
                     <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{b.text}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800">
               <Shield className="text-primary-600 shrink-0" size={32} />
               <p className="text-xs font-bold text-primary-900 dark:text-primary-200">
                 Trusted by 10,000+ Lingayat families. Secure 256-bit SSL encrypted payments.
               </p>
            </div>
          </div>

          {/* Payment Column */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
               {/* Tabs */}
               <div className="flex bg-gray-50 dark:bg-gray-800/50 p-2">
                 <button 
                   onClick={() => setActiveTab('razorpay')}
                   className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'razorpay' ? 'bg-white dark:bg-gray-900 shadow-md text-primary-600' : 'text-gray-400'}`}
                 >
                   <CreditCard size={18} /> Razorpay (UPI/Card)
                 </button>
                 <button 
                   onClick={() => setActiveTab('manual')}
                   className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-gray-900 shadow-md text-primary-600' : 'text-gray-400'}`}
                 >
                   <Landmark size={18} /> Bank Transfer
                 </button>
               </div>

               <div className="p-10">
                 {activeTab === 'razorpay' ? (
                   <div className="space-y-8">
                     <div className="text-center space-y-4">
                       <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto"><CreditCard size={32} /></div>
                       <h3 className="text-xl font-black">Fast Automated Activation</h3>
                       <p className="text-sm text-gray-500">Pay using UPI, Cards, Net Banking or Wallets. Your subscription activates immediately.</p>
                     </div>
                     <button 
                       onClick={handleRazorpay}
                       disabled={isProcessing}
                       className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-600/30"
                     >
                       {isProcessing ? <Loader2 className="animate-spin" /> : <Shield size={20} />} Pay ₹{yearlyPrice} with Razorpay
                     </button>
                   </div>
                 ) : (
                   <div className="space-y-8">
                     <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl space-y-4 border border-gray-200 dark:border-gray-700">
                       <h4 className="font-black text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2"><Landmark size={14}/> Bank Details</h4>
                       <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                         <span className="text-gray-400">Account Holder</span> <span className="text-right">Lingayat Sangam Org</span>
                         <span className="text-gray-400">Bank Name</span> <span className="text-right">HDFC Bank</span>
                         <span className="text-gray-400">Account No</span> <span className="text-right tracking-widest">50200001234567</span>
                         <span className="text-gray-400">IFSC Code</span> <span className="text-right">HDFC0000123</span>
                         <span className="text-gray-400">UPI ID</span> <span className="text-right text-primary-600">lingayat@hdfc</span>
                       </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Upload Payment Screenshot</label>
                        {!previewUrl ? (
                          <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-10 text-center hover:bg-gray-50 transition-colors group">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="mx-auto text-gray-300 group-hover:text-primary-600 mb-2" size={32} />
                            <p className="text-sm font-bold text-gray-500">Choose File</p>
                          </div>
                        ) : (
                          <div className="relative rounded-3xl overflow-hidden border-2 border-gray-200">
                             <img src={previewUrl} className="w-full h-40 object-cover" />
                             <button onClick={() => {setPreviewUrl(null); setProofFile(null);}} className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full shadow-lg"><X size={16}/></button>
                          </div>
                        )}
                     </div>

                     <button 
                       onClick={submitManual}
                       disabled={!proofFile || isProcessing}
                       className="w-full py-5 bg-gold-500 text-primary-950 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                     >
                       {isProcessing ? <Loader2 className="animate-spin" /> : <Receipt size={20} />} Submit for Verification
                     </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToPremium;
