
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Search, Sparkles, Heart, Crown } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: "Community First",
    desc: "Exclusively tailored for the Lingayat community, covering all sub-castes with utmost respect.",
    accent: "bg-primary-600"
  },
  {
    icon: ShieldCheck,
    title: "Verified Trust",
    desc: "Every profile undergoes a manual audit. We prioritize safety and authenticity in every match.",
    accent: "bg-gold-500"
  },
  {
    icon: Search,
    title: "Vachana Wisdom",
    desc: "AI-matching that considers traditional values and modern life aspirations concurrently.",
    accent: "bg-red-500"
  },
  {
    icon: Crown,
    title: "Royal Privacy",
    desc: "Your data is sacred. Advanced privacy controls ensure you only share what you want, when you want.",
    accent: "bg-blue-600"
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-40 bg-white dark:bg-gray-950 transition-colors duration-700 relative overflow-hidden" id="about">
      {/* Background Sacred Geometric Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%" className="text-primary-900">
          <pattern id="sacred-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#sacred-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-600 dark:text-gold-400 font-black uppercase text-[10px] tracking-widest mb-8 border border-primary-100 dark:border-primary-800"
          >
            <Sparkles size={16} /> Our Philosophy
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-serif font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight"
          >
            Where Tradition Meets <br/> <span className="text-primary-600 italic">Technological Excellence</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 50 }}
              whileHover={{ y: -15, transition: { duration: 0.3 } }}
              className="group relative bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 h-full"
            >
              <div className="relative z-10">
                <div className={`w-20 h-20 ${feature.accent} rounded-[2rem] flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm leading-relaxed">{feature.desc}</p>
                
                <div className="mt-8 flex items-center gap-2 text-primary-600 dark:text-gold-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
                  Read More <Heart size={14} fill="currentColor" />
                </div>
              </div>
              
              {/* Subtle accent glow on hover */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-100 dark:bg-primary-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
