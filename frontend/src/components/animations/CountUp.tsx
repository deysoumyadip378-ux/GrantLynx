import React, { useEffect, useState } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = from + (to - from) * easedProgress;
      setCurrent(val);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [to, from, duration]);

  const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

