import React from 'react';
import { motion } from 'framer-motion';

const items = [
  { label: 'Cali UL 8000', color: 'border-gold/30', rotate: -6, z: 10, top: '10%', left: '10%' },
  { label: 'Geekbar Pulse X', color: 'border-accent-blue/40', rotate: 3, z: 20, top: '20%', left: '50%' },
  { label: 'Airbar Diamond', color: 'border-gold/30', rotate: -3, z: 15, top: '45%', left: '5%' },
  { label: 'Flair Ultra', color: 'border-gold/30', rotate: 6, z: 25, top: '40%', left: '45%' },
  { label: 'UNC No Nicotine', color: 'border-white/20', rotate: -4, z: 5, top: '70%', left: '15%' },
  { label: 'Cali 40000', color: 'border-gold/30', rotate: 2, z: 18, top: '65%', left: '60%' },
  { label: 'Geek Bar Pulse', color: 'border-accent-blue/40', rotate: -5, z: 12, top: '85%', left: '30%' },
];

export const FloatingGallery: React.FC = () => {
  return (
    <div className="relative w-full h-[600px] md:h-[800px] perspective-1000">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
          className={`absolute p-6 rounded-xl backdrop-blur-sm bg-card-bg border ${item.color} shadow-2xl flex items-center justify-center text-center`}
          style={{
            top: item.top,
            left: item.left,
            zIndex: item.z,
            transform: `rotate(${item.rotate}deg)`,
            width: '180px',
            height: '140px',
            borderStyle: 'dashed',
            borderWidth: '2px',
          }}
          whileHover={{ 
            scale: 1.05, 
            rotate: 0,
            zIndex: 50,
            backgroundColor: 'rgba(20,20,30,0.9)',
            borderColor: '#D4AF37'
          }}
        >
          <span className="font-semibold text-sm text-text-secondary uppercase tracking-wider">
            {item.label}
          </span>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 pointer-events-none rounded-xl" />
        </motion.div>
      ))}
    </div>
  );
};
