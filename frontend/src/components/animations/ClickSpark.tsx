import React from 'react';
import confetti from 'canvas-confetti';

interface ClickSparkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({ children, className = '', onClick }) => {
  const triggerSpark = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      origin: { x, y },
      particleCount: 28,
      spread: 60,
      startVelocity: 18,
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706', '#ea580c'],
      ticks: 120,
      disableForReducedMotion: true,
    });

    if (onClick) onClick();
  };

  return (
    <div className={`w-full block ${className}`} onClick={triggerSpark}>
      {children}
    </div>
  );
};

