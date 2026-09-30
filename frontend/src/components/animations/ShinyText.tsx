import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  disabled?: boolean;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ text, className = '', disabled = false }) => {
  if (disabled) return <span className={className}>{text}</span>;

  return (
    <span
      className={`inline-block bg-gradient-to-r from-slate-200 via-amber-200 to-slate-200 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer ${className}`}
    >
      {text}
    </span>
  );
};

