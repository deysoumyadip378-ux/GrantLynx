import React from 'react';
import { motion } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitBy?: 'words' | 'chars';
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 0.5,
  splitBy = 'words',
}) => {
  const elements = splitBy === 'words' ? text.split(' ') : text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: delay / 1000, delayChildren: 0.04 * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 14,
        stiffness: 100,
        duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 18,
      filter: 'blur(4px)',
    },
  };

  return (
    <motion.span
      className={`inline-block overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {elements.map((el, idx) => (
        <motion.span
          key={idx}
          className="inline-block mr-[0.25em] last:mr-0 will-change-transform"
          variants={childVariants}
        >
          {el}
        </motion.span>
      ))}
    </motion.span>
  );
};

