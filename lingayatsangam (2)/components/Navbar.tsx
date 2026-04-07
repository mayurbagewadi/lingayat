
import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, ChevronRight, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  session?: any;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, isDarkMode, toggleTheme, session, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', action: () => onNavigate('landing') },
    { name: 'Search', action: () => onNavigate('browse') },
    { name: 'Success Stories', action: () => onNavigate('not-found') },
    { name: 'Admin', action: () => onNavigate('admin-login') },
  ];

  // Using the primary-950 from tailwind config (Midnight Purple) with 85% opacity and heavy blur
  const headerBgColor = 'bg-primary-950/85 backdrop-blur-2xl'; 

  const navBgClass = isScrolled 
    ? `${headerBgColor} shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 border-b border-white/10` 
    : `${headerBgColor} py-5 border-b border-white/5`;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 w-full z-50 transition-all duration-500 ${navBgClass}`}
    >
      <div className="container mx-auto px-8 flex justify-between items-center">
        {/* Brand Identity */}
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-4 group">
          <div className="relative">
            <div className={`relative p-2.5 rounded-2xl bg-primary-600 text-white shadow-xl group-hover:bg-primary-500 transition-colors duration-500`}>
              <Heart size={22} fill="currentColor" />
            </div>
          </div>
          <span className={`font-serif text-2xl md:text-3xl font-black tracking-tight text-white`}>
            Lingayat<span className="text-gold-500">Sangam</span>
          </span>
        </button>

        {/* Navigation Links - Light Gray to match screenshot */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <div key={link.name} className="relative px-1">
              <button
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => link.action()}
                className={`relative z-10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  hoveredLink === link.name ? 'text-gold-500' : 'text-gray-300'
                }`}
              >
                {link.name}
              </button>
            </div>
          ))}
          
          <div className="w-[1px] h-6 bg-white/10 mx-4" />

          {/* Theme Toggle - Squared Border Style */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border border-white/10 text-gold-500 hover:bg-white/10 transition-all`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {session ? (
            <div className="flex items-center gap-6 ml-6">
              <button 
                onClick={onLogout}
                className={`p-2.5 rounded-xl text-white/40 hover:text-red-400 transition-all`}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('login')}
              className={`ml-6 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-3 transition-all bg-gradient-to-r from-primary-600 to-primary-800 text-white`}
            >
              Member Login <ChevronRight size={14} />
            </motion.button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${headerBgColor} border-t border-white/5 md:hidden overflow-hidden`}
          >
            <div className="p-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    link.action();
                  }}
                  className="text-left text-gray-300 font-black uppercase text-xs tracking-widest"
                >
                  {link.name}
                </button>
              ))}
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="w-full py-4 bg-primary-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest mt-4"
              >
                Member Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
