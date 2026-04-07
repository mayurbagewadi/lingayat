
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, Variants, useSpring } from 'framer-motion';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';

interface HeroProps {
  onNavigate: (view: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const yBg = useTransform(scrollY, [0, 1000], [0, 300]);
  const scaleBg = useTransform(scrollY, [0, 1000], [1, 1.2]);
  const opacityMain = useTransform(scrollY, [0, 600], [1, 0]);

  // Spring animations for mouse reactivity
  const springConfig = { damping: 30, stiffness: 200 };
  const mouseXSpring = useSpring(0, springConfig);
  const mouseYSpring = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / 35;
    const y = (clientY - innerHeight / 2) / 35;
    mouseXSpring.set(x);
    mouseYSpring.set(y);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const charVariants: Variants = {
    hidden: { y: 100, opacity: 0, rotateX: -90, filter: 'blur(15px)' },
    visible: { 
      y: 0, 
      opacity: 1, 
      rotateX: 0, 
      filter: 'blur(0px)',
      transition: { type: "spring", damping: 15, stiffness: 120 }
    }
  };

  const title = "Divine Unions Guided by Vachana Wisdom";

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden flex items-start justify-center bg-primary-950 px-4 cursor-default"
    >
      {/* Ken Burns Cinematic Background */}
      <motion.div 
        style={{ y: yBg, scale: scaleBg }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/95 via-primary-950/40 to-primary-950/95 z-10" />
      </motion.div>

      {/* Floating Sacred Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
         {[...Array(6)].map((_, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0 }}
             animate={{ 
               opacity: [0, 0.5, 0],
               y: [-20, -150],
               x: Math.random() * 100 - 50,
               rotate: 360
             }}
             transition={{ 
               duration: 10 + Math.random() * 5, 
               repeat: Infinity, 
               delay: Math.random() * 5,
               ease: "linear"
             }}
             className="absolute text-gold-500"
             style={{ 
               left: `${Math.random() * 100}%`, 
               top: `${Math.random() * 100}%`,
               fontSize: `${20 + Math.random() * 40}px`
             }}
           >
             <Sparkles strokeWidth={1} />
           </motion.div>
         ))}
      </div>

      {/* Interactive Light Cursor Glow */}
      <motion.div 
        style={{ x: mouseXSpring, y: mouseYSpring }}
        className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[150px]" />
      </motion.div>

      {/* Main Content - Moved exactly 10px higher than baseline (pt-16 [64px] -> pt-[54px], pt-32 [128px] -> pt-[118px]) */}
      <motion.div 
        style={{ opacity: opacityMain }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto relative z-30 text-center flex flex-col items-center pt-[54px] md:pt-[118px] pb-24"
      >
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
          className="mb-8 md:mb-10 px-8 py-3 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <Sparkles size={16} className="text-gold-400 animate-pulse" />
            <span className="text-gold-400 font-black tracking-[0.5em] uppercase text-[10px]">
              Lingayat Exclusive Matrimony
            </span>
          </div>
        </motion.div>

        <h1 className="font-serif text-5xl md:text-6xl lg:text-[7rem] font-black text-white leading-[0.9] mb-10 md:mb-12 tracking-tighter perspective-[1500px]">
          {title.split(" ").map((word, i) => (
            <span key={i} className="inline-block mr-[0.3em] last:mr-0 overflow-hidden py-3">
              {word.split("").map((char, j) => (
                <motion.span
                  key={j}
                  variants={charVariants}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gold-200/40"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p 
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="text-lg md:text-2xl text-primary-50/70 mb-12 md:mb-16 max-w-3xl mx-auto font-medium leading-relaxed px-6 italic"
        >
          Discover a sanctuary where souls connect through tradition, dignity, and shared spiritual values. 
          LingayatSangam — Crafting divine futures with the grace of the 12th century.
        </motion.p>

        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
          className="flex flex-col sm:flex-row gap-8 md:gap-10 justify-center items-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05, y: -6, boxShadow: "0 25px 60px -12px rgba(124, 58, 237, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('register')}
            className="group relative bg-primary-600 text-white px-14 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.35em] transition-all overflow-hidden flex items-center gap-4"
          >
            <span className="relative z-10 flex items-center gap-4">Start Journey <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-700" /></span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)", y: -6 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('browse')}
            className="px-14 py-6 rounded-[2.5rem] border-2 border-white/20 text-white font-black text-[11px] uppercase tracking-[0.35em] backdrop-blur-2xl transition-all flex items-center gap-4"
          >
            <Heart size={20} className="text-gold-500" fill="currentColor" /> Browse Souls
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Decorative Vachana Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-5"
      >
        <span className="text-[10px] font-black text-gold-500/60 uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr]">Discover More</span>
        <div className="w-[2px] h-16 bg-gradient-to-b from-gold-500/80 via-gold-500/20 to-transparent"></div>
      </motion.div>
    </div>
  );
};

export default Hero;
