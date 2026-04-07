
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Quote, Sparkles, Heart, Scale, Crown } from 'lucide-react';

const values = [
  {
    icon: Crown,
    title: "Kayakave Kailasa",
    desc: "Work is Heaven. We honor the professional journeys and spiritual dedication of every member.",
    color: "bg-primary-600 shadow-primary-500/20"
  },
  {
    icon: Heart,
    title: "Sacred Brotherhood",
    desc: "Upholding the egalitarian vision of Basavanna where every family is respected as one.",
    color: "bg-red-500 shadow-red-500/20"
  },
  {
    icon: Scale,
    title: "Truth in Living",
    desc: "Building foundations on absolute integrity. Verified profiles for a trusted matrimonial experience.",
    color: "bg-gold-500 shadow-gold-500/20"
  }
];

const VachanaSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textScale = useTransform(scrollYProgress, [0.1, 0.4], [0.8, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35, 0.6, 0.8], [0, 1, 1, 0]);
  const textBlur = useTransform(scrollYProgress, [0.1, 0.3, 0.6, 0.8], [15, 0, 0, 15]);
  const bgY = useTransform(scrollYProgress, [0, 1], [-200, 200]);

  return (
    <section ref={containerRef} className="py-60 bg-gray-950 text-white relative overflow-hidden">
      {/* Background Cinematic Parallax Text Layer */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0"
      >
        <h2 className="text-[35vw] font-black uppercase leading-none tracking-tighter -rotate-12">DHARMA</h2>
      </motion.div>

      <div className="container mx-auto px-8 relative z-10">
        <motion.div 
          style={{ scale: textScale, opacity: textOpacity, filter: `blur(${textBlur}px)` }}
          className="max-w-6xl mx-auto text-center mb-48"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 0.6, scale: 1 }}
            className="mb-16 inline-block"
          >
            <Quote className="text-gold-500" size={140} strokeWidth={0.5} />
          </motion.div>
          
          <h2 className="text-4xl md:text-8xl font-serif font-black italic mb-12 leading-[1.05] tracking-tight text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            "Kallu sakkareya thande, kabbina sakkareya thande... <br/> 
            <span className="text-gold-500 underline decoration-white/10 underline-offset-[16px]">Ella sakkareya thande!</span>"
          </h2>
          
          <p className="text-xl md:text-3xl text-primary-100/50 font-medium max-w-3xl mx-auto leading-relaxed">
            The essence of sweetness is one, just as the essence of truth is universal. 
            We unite families who seek this divine unity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {values.map((v, i) => (
            <ValueCard key={i} value={v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Use React.FC to fix TypeScript prop assignment error for key prop which is internal to React
const ValueCard: React.FC<{ value: any, index: number }> = ({ value, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 100, rotateY: 20 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ delay: index * 0.2, type: "spring", damping: 15, stiffness: 60 }}
      whileHover={{ y: -20, rotateZ: 1 }}
      className="group p-12 rounded-[4rem] bg-white/5 backdrop-blur-3xl border border-white/10 hover:border-gold-500/40 transition-all duration-1000 relative overflow-hidden"
    >
      <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-primary-600/5 rounded-full blur-[100px] group-hover:bg-gold-500/10 transition-all duration-1000" />
      
      <div className={`w-24 h-24 ${value.color} rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700`}>
        <value.icon size={40} className="text-white" />
      </div>
      
      <h3 className="text-4xl font-serif font-black mb-6 text-white leading-none tracking-tight">{value.title}</h3>
      <p className="text-primary-50/50 font-bold text-lg leading-relaxed mb-10">{value.desc}</p>
      
      <div className="flex items-center gap-4">
        <div className="h-[2px] w-16 bg-gold-500 group-hover:w-32 transition-all duration-700"></div>
        <Sparkles size={16} className="text-gold-500 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>
    </motion.div>
  );
};

export default VachanaSection;
