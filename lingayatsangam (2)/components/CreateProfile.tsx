
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Check, Loader2, Mail, Eye, EyeOff, ShieldCheck,
  ChevronRight, ChevronLeft, Upload, X, FileText, Camera
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';
import { checkRegistrationRateLimit, resetRegistrationRateLimit } from '../services/rateLimiter';
import { sanitizeInput, sanitizeEmail } from '../services/sanitizer';

interface CreateProfileProps {
  onNavigate: (view: string) => void;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    dob: '',
    createdFor: 'Self',
    subCaste: 'Panchamasali',
    gender: 'Male',
    education: '',
    location: '',
    mobile: '',
  });

  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const photoRef0 = useRef<HTMLInputElement>(null);
  const photoRef1 = useRef<HTMLInputElement>(null);
  const photoRef2 = useRef<HTMLInputElement>(null);
  const photoRef3 = useRef<HTMLInputElement>(null);
  const photoRef4 = useRef<HTMLInputElement>(null);
  const photoRefs = [photoRef0, photoRef1, photoRef2, photoRef3, photoRef4];
  const pdfRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatedForSelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      createdFor: value,
      gender: value === 'Son' ? 'Male' : value === 'Daughter' ? 'Female' : prev.gender,
    }));
  };

  // Max DOB date: user must be 18+ years old
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 1) {
      if (!formData.email.trim()) return 'Email address is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return 'Please enter a valid email address.';
      if (!formData.password) return 'Password is required.';
      if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    }
    if (currentStep === 2) {
      if (!formData.fullName.trim()) return 'Full name is required.';
      if (!formData.dob) return 'Date of birth is required.';
      const dob = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) return 'Minimum age for registration is 18 years.';
      if (!formData.mobile.trim()) return 'Mobile number is required.';
      const digits = formData.mobile.replace(/\D/g, '');
      if (digits.length < 10) return 'Please enter a valid 10-digit mobile number.';
    }
    if (currentStep === 3) {
      if (!formData.education.trim()) return 'Education qualification is required.';
      if (!formData.location.trim()) return 'Current location is required.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) { setErrorMsg(err); return; }
    setErrorMsg(null);
    setStep(s => s + 1);
  };

  const handlePhotoSelect = (index: number, file: File) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = file;
    setPhotos(updatedPhotos);
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedPreviews = [...photoPreviews];
      updatedPreviews[index] = e.target?.result as string;
      setPhotoPreviews(updatedPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = null;
    setPhotos(updatedPhotos);
    const updatedPreviews = [...photoPreviews];
    updatedPreviews[index] = null;
    setPhotoPreviews(updatedPreviews);
    if (photoRefs[index].current) photoRefs[index].current!.value = '';
  };

  const handlePdfSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('PDF file size must be under 10MB.');
      return;
    }
    setPdfFile(file);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Rate limiting: Check if email has exceeded registration attempts
      checkRegistrationRateLimit(formData.email.toLowerCase());

      // Sanitize all user inputs to prevent XSS attacks
      const sanitizedFullName = sanitizeInput(formData.fullName);
      const sanitizedEmail = sanitizeEmail(formData.email);
      const sanitizedEducation = sanitizeInput(formData.education);
      const sanitizedLocation = sanitizeInput(formData.location);

      setUploadProgress('Creating your account...');
      await profileService.resolveConflicts(sanitizedEmail, formData.mobile);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
      });
      if (authError) throw authError;
      const userId = authData.user!.id;

      setUploadProgress('Saving your profile...');
      const profileId = await profileService.createProfile({
        user_id: userId,
        full_name: sanitizedFullName,
        dob: formData.dob,
        created_for: formData.createdFor,
        sub_caste: formData.subCaste,
        gender: formData.gender,
        education: sanitizedEducation,
        location: sanitizedLocation,
        mobile: formData.mobile || null,
        email: formData.email || null,
        status: 'pending_approval',
        subscription_status: 'free',
      });

      const photoCount = photos.filter(Boolean).length;
      let uploaded = 0;
      for (let i = 0; i < photos.length; i++) {
        if (photos[i]) {
          uploaded++;
          setUploadProgress(`Uploading photo ${uploaded} of ${photoCount}...`);
          const fileId = await profileService.uploadPhoto(photos[i]!, userId, i + 1);
          await profileService.updatePhotoId(profileId, i + 1, fileId);
        }
      }

      if (pdfFile) {
        setUploadProgress('Uploading PDF bio...');
        const pdfPath = await profileService.uploadPdf(pdfFile, userId);
        await supabase
          .from('profiles')
          .update({ bio_pdf_url: pdfPath, bio_pdf_status: 'pending_approval' })
          .eq('id', profileId);
      }

      // Reset rate limit on successful registration
      resetRegistrationRateLimit(formData.email.toLowerCase());
      onNavigate('pending');
    } catch (err: any) {
      // Rate limit errors should be displayed as-is
      if (err.message?.includes('Too many')) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  const steps = [
    { title: 'Account', icon: Mail },
    { title: 'Personal', icon: User },
    { title: 'Community', icon: ShieldCheck },
    { title: 'Photos & PDF', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-950 flex items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <button
          onClick={() => onNavigate('landing')}
          className="mb-8 flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest hover:-translate-x-1 transition-transform"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <h2 className="text-4xl font-serif font-black mb-10 text-center">
          Create Your <span className="text-primary-600">Soulmate Profile</span>
        </h2>

        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-12 max-w-xl mx-auto relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800 z-0">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          {steps.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step === idx + 1 ? 'bg-primary-600 text-white shadow-lg scale-110'
                : step > idx + 1 ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {step > idx + 1 ? <Check size={18} /> : <s.icon size={18} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${
                step === idx + 1 ? 'text-primary-600' : 'text-gray-400'
              }`}>{s.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Account */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 bottom-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Personal */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile For chips */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Profile Created For *</label>
                  <div className="flex gap-3 flex-wrap">
                    {['Self', 'Son', 'Daughter', 'Sibling'].map(opt => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleCreatedForSelect(opt)}
                        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                          formData.createdFor === opt
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <Input label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per documents" />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Date of Birth * <span className="normal-case font-medium text-gray-300">(18+ years required)</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    max={maxDob}
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <Input label="Mobile Number *" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={formData.createdFor === 'Son' || formData.createdFor === 'Daughter'}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold disabled:opacity-60 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="Male">Groom (Male)</option>
                    <option value="Female">Bride (Female)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Community */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sub-Caste *</label>
                  <select
                    name="subCaste"
                    value={formData.subCaste}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option>Panchamasali</option>
                    <option>Banajiga</option>
                    <option>Jangama</option>
                    <option>Sadar</option>
                    <option>Kadu Banajiga</option>
                    <option>Kumbar</option>
                    <option>Other</option>
                  </select>
                </div>
                <Input label="Education *" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.E., MBA, B.Sc." />
                <Input label="Current Location *" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
              </motion.div>
            )}

            {/* STEP 4 — Photos & PDF */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">

                {/* Photos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Profile Photos <span className="normal-case font-medium text-gray-400">(Optional — max 5)</span>
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Click any slot to upload. JPG, PNG supported.</p>
                    </div>
                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg">
                      {photos.filter(Boolean).length} / 5
                    </span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {photos.map((_, idx) => (
                      <div key={idx} className="relative aspect-square">
                        {photoPreviews[idx] ? (
                          <div className="relative w-full h-full rounded-2xl overflow-hidden group border-2 border-primary-300 dark:border-primary-700">
                            <img
                              src={photoPreviews[idx]!}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handlePhotoRemove(idx)}
                              className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => photoRefs[idx].current?.click()}
                            className="w-full h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1.5 text-gray-300 dark:text-gray-600 hover:border-primary-400 hover:text-primary-400 transition-all"
                          >
                            <Camera size={18} />
                            <span className="text-[9px] font-black uppercase">Photo {idx + 1}</span>
                          </button>
                        )}
                        <input
                          ref={photoRefs[idx]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handlePhotoSelect(idx, e.target.files[0])}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center gap-2">
                    <Check size={12} /> Photos are published immediately after your profile is approved.
                  </p>
                </div>

                {/* PDF Bio */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      PDF Bio <span className="normal-case font-medium text-gray-400">(Optional — max 10MB)</span>
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">Upload horoscope, family details, or any bio document.</p>
                  </div>

                  {pdfFile ? (
                    <div className="flex items-center gap-4 p-5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800">
                      <FileText className="text-primary-600 shrink-0" size={24} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-primary-800 dark:text-primary-200 truncate">{pdfFile.name}</p>
                        <p className="text-[10px] text-primary-500 font-bold mt-0.5">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPdfFile(null); if (pdfRef.current) pdfRef.current.value = ''; }}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pdfRef.current?.click()}
                      className="w-full p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all"
                    >
                      <Upload size={28} />
                      <span className="font-black text-sm">Click to Upload PDF Bio</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Horoscope, family details, expectations • PDF only • Max 10MB
                      </span>
                    </button>
                  )}

                  <input
                    ref={pdfRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePdfSelect(e.target.files[0])}
                  />

                  <p className="text-[10px] text-orange-500 font-bold flex items-center gap-2">
                    <ShieldCheck size={12} /> PDF requires admin approval before it becomes visible to subscribers.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMsg && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-xl">
              {errorMsg}
            </p>
          )}

          {uploadProgress && (
            <p className="text-primary-600 text-xs font-bold text-center bg-primary-50 dark:bg-primary-900/20 py-3 px-4 rounded-xl flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={14} /> {uploadProgress}
            </p>
          )}

          <div className="flex justify-between gap-4 mt-12 border-t pt-8 border-gray-50 dark:border-gray-800">
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep(s => s - 1); setErrorMsg(null); }}
                className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-colors"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="ml-auto px-12 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary-600/30 disabled:opacity-50"
              >
                {isLoading
                  ? <><Loader2 className="animate-spin" size={16} /> Submitting...</>
                  : <><Check size={16} /> Complete Registration</>
                }
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none ring-1 ring-gray-100 dark:ring-gray-700 font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
    />
  </div>
);

export default CreateProfile;
