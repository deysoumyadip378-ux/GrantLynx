import React from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const BlurText: React.FC<BlurTextProps> = ({ text, className = '', delay = 0 }) => {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0, filter: 'blur(10px)', y: 6 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {text}
    </motion.span>
  );
};

