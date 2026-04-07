import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { generateMatrimonialBio } from '../services/geminiService';
import { BioFormData } from '../types';

const AIBioGenerator: React.FC = () => {
  const [formData, setFormData] = useState<BioFormData>({
    name: '',
    age: '',
    gender: 'Groom',
    education: '',
    profession: '',
    location: '',
    values: '',
    hobbies: ''
  });

  const [generatedBio, setGeneratedBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.education) {
      setError("Please fill in at least Name and Education.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const bio = await generateMatrimonialBio(formData);
      setGeneratedBio(bio);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-primary-50 to-white" id="ai-helper">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-100 text-primary-800 px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border border-purple-200"
            >
              <Sparkles size={16} className="text-gold-500" />
              <span>AI-Powered Profile Assistant</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Craft the Perfect <br/> <span className="text-primary-600">First Impression</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 mb-8 leading-relaxed"
            >
              Struggling to find the right words? Let our intelligent Gemini AI craft a 
              dignified, culturally respectful bio that highlights your values and personality. 
              Stand out in the community with elegance.
            </motion.p>

            {/* Example Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Sample Output
              </h4>
              <p className="text-gray-500 italic text-sm leading-relaxed">
                "A software engineer with a blend of modern outlook and traditional Lingayat values. 
                Believing in the philosophy of 'Kayakave Kailasa', I seek a partner who values family, 
                education, and mutual growth..."
              </p>
            </motion.div>
          </div>

          {/* Right Form */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full bg-white rounded-3xl shadow-2xl shadow-primary-900/10 p-8 border border-gray-100 relative"
          >
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-200 rounded-full blur-3xl opacity-30"></div>

            <AnimatePresence mode="wait">
              {!generatedBio ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 relative z-10"
                >
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                      <input name="name" onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition" placeholder="e.g. Arun Patil" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Profile For</label>
                      <select name="gender" onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition">
                        <option value="Groom">Groom</option>
                        <option value="Bride">Bride</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                      <input name="age" onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition" placeholder="28" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Profession</label>
                      <input name="profession" onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition" placeholder="e.g. Architect" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Education</label>
                    <input name="education" onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition" placeholder="e.g. M.Tech in CS" />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Values / Family</label>
                     <textarea name="values" onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition resize-none" rows={3} placeholder="Traditional, Nuclear family, Vegetarian..." />
                  </div>

                  {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> Magic in progress...</span>
                    ) : (
                      <>
                        <Wand2 size={20} /> Generate Professional Bio
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 relative z-10"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-xl text-gray-800">Your AI Bio</h3>
                    <button onClick={() => setGeneratedBio('')} className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1">
                      <RefreshCw size={14} /> Create New
                    </button>
                  </div>
                  <div className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100 relative">
                    <p className="text-gray-800 leading-relaxed font-serif text-lg whitespace-pre-wrap">{generatedBio}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyToClipboard}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    {copied ? "Copied Successfully!" : "Copy to Clipboard"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIBioGenerator;