import React, { useState, useRef } from 'react';

interface HoldButtonProps {
  onConfirm: () => void;
  holdTime?: number; // ms
  label?: string;
  confirmedLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const HoldButton: React.FC<HoldButtonProps> = ({
  onConfirm,
  holdTime = 1800,
  label = 'Hold to Authorize Tranche Release',
  confirmedLabel = 'Authorized & Released',
  className = '',
  disabled = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    if (disabled || isDone) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / holdTime) * 100, 100);
      setProgress(pct);

      if (elapsed >= holdTime) {
        clearInterval(interval);
        setIsHolding(false);
        setIsDone(true);
        onConfirm();
      }
    }, 16);

    timerRef.current = interval;
  };

  const endHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isDone) {
      setIsHolding(false);
      setProgress(0);
    }
  };

  return (
    <button
      type="button"
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      disabled={disabled || isDone}
      className={`relative overflow-hidden font-display font-medium select-none transition-all duration-200 ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
          : isDone
          ? 'bg-lynx-amber text-midnight-950 font-bold shadow-lg shadow-lynx-amber/25 cursor-default'
          : 'bg-midnight-800 text-slate-200 border border-slate-700/80 hover:border-lynx-amber/50'
      } rounded-xl px-5 py-3 ${className}`}
    >
      {/* Background Liquid Fill on hold */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-lynx-amber/40 to-lynx-gold/40 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
        {isDone ? (
          <>
            <svg className="w-4 h-4 text-midnight-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {confirmedLabel}
          </>
        ) : (
          <>
            <span className={`inline-block w-2 h-2 rounded-full ${isHolding ? 'bg-lynx-amber animate-ping' : 'bg-slate-400'}`} />
            {label}
            {isHolding && <span className="text-xs opacity-75 font-mono ml-1">{Math.round(progress)}%</span>}
          </>
        )}
      </span>
    </button>
  );
};

