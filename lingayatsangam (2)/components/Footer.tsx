import React from 'react';
import { Heart, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-950 text-white pt-24 pb-10 border-t border-primary-900" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-white text-primary-900 p-2 rounded-full">
                <Heart size={20} fill="currentColor" />
              </div>
              <span className="font-serif text-3xl font-bold">
                Lingayat<span className="text-gold-400">Sangam</span>
              </span>
            </div>
            <p className="text-primary-100/70 leading-relaxed">
              The most trusted matrimonial platform dedicated to the Lingayat community. 
              Connecting souls, preserving traditions, and building future legacies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-8 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-gold-500"></span>
            </h4>
            <ul className="space-y-4 text-primary-100/70">
              {['Home', 'About Us', 'Success Stories', 'Membership', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-gold-400 transition-colors flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-8 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-gold-500"></span>
            </h4>
            <ul className="space-y-6 text-primary-100/70">
              <li className="flex items-start gap-4">
                <div className="bg-primary-900 p-2 rounded-lg text-gold-400">
                  <MapPin size={20} />
                </div>
                <span>#12, Basava Marg,<br/>Bangalore, Karnataka 560001</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-primary-900 p-2 rounded-lg text-gold-400">
                   <Phone size={20} />
                </div>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-4">
                 <div className="bg-primary-900 p-2 rounded-lg text-gold-400">
                   <Mail size={20} />
                 </div>
                <span>support@lingayatsangam.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h4 className="font-bold text-lg mb-8 relative inline-block">
              Stay Connected
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-gold-500"></span>
            </h4>
            <div className="flex gap-4 mb-8">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-200 hover:bg-gold-500 hover:text-primary-950 transition-all transform hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <p className="text-primary-200/50 text-xs">
              Subscribe to get updates on community events and new features.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-900 pt-8 flex flex-col md:flex-row justify-between items-center text-primary-200/40 text-sm">
          <p>© {new Date().getFullYear()} LingayatSangam. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;