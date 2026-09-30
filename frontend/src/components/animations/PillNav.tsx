import React from 'react';
import { motion } from 'framer-motion';

export interface PillNavItem {
  id: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface PillNavProps {
  items: PillNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const PillNav: React.FC<PillNavProps> = ({
  items,
  activeId,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-midnight-900/90 border border-slate-700/60 backdrop-blur-md ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium font-display transition-colors duration-200 flex items-center gap-1.5 select-none ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="pillNavIndicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-lynx-amber/30 to-lynx-gold/20 border border-lynx-amber/50"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.icon}
              {item.label}
              {item.badge && (
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

