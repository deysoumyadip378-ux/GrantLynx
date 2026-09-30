import React from 'react';
import { motion } from 'framer-motion';

interface SpringCheckProps {
  checked: boolean;
  size?: number;
  className?: string;
}

export const SpringCheck: React.FC<SpringCheckProps> = ({ checked, size = 22, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full transition-colors duration-300 ${
        checked ? 'bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/40' : 'bg-slate-800 text-slate-500 border border-slate-700'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {checked && (
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      )}
    </div>
  );
};

