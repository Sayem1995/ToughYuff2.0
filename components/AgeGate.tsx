import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export const AgeGate: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem('age-verified', 'true');
    setIsVisible(false);
  };

  const handleNo = () => {
    setDenied(true);
  };

  if (!isVisible && !denied) return null;

  if (denied) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center text-center p-6">
         <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
         <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
         <p className="text-text-secondary max-w-md">
           You must be 21 years of age or older to view this website. 
           Please close this tab or navigate away.
         </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-surface border border-gold-subtle p-8 md:p-12 rounded-2xl max-w-lg w-full text-center shadow-2xl shadow-black/50"
          >
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Are you 21 or older?</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              TooughYuff showcases vape products intended for adults 21+ only. 
              No purchases are available on this site.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleYes}
                className="flex-1 bg-gold text-background py-3.5 rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Yes, I am 21+
              </button>
              <button
                onClick={handleNo}
                className="flex-1 border border-white/20 text-white py-3.5 rounded-lg font-semibold hover:bg-white/5 transition-all"
              >
                No
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
