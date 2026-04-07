import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    couple: "Amit & Priya",
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1621623403673-c15c0e1db539?q=80&w=2070&auto=format&fit=crop",
    text: "We were both looking for someone who understands the importance of our Lingayat traditions but lives a modern life. This platform made it effortless."
  },
  {
    couple: "Vinay & Sneha",
    location: "Davangere",
    image: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?q=80&w=2036&auto=format&fit=crop",
    text: "The verified profiles gave my parents peace of mind. We met, our families met, and everything just clicked. Thank you for bringing us together."
  },
  {
    couple: "Karthik & Megha",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1628867499696-6819ae5c84d7?q=80&w=2070&auto=format&fit=crop",
    text: "I was skeptical about online matrimony, but the AI recommendations were surprisingly accurate. I found a partner who shares my love for Vachanas."
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300" id="stories">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold-500 font-bold tracking-widest uppercase text-sm"
          >
            Real Stories
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-3 mb-6"
          >
            Happily Ever Afters
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative bg-primary-50/30 dark:bg-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 border border-transparent hover:border-primary-100 dark:hover:border-gray-700"
            >
              {/* Image */}
              <div className="relative h-72 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img 
                  src={t.image} 
                  alt={t.couple} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h4 className="font-serif font-bold text-xl">{t.couple}</h4>
                  <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                    {t.location}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 relative">
                <div className="absolute -top-6 right-6 bg-gold-500 text-white p-3 rounded-full shadow-lg">
                  <Quote size={20} fill="currentColor" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed font-serif text-lg">"{t.text}"</p>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(star => <span key={star} className="text-gold-400 text-sm">★</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;