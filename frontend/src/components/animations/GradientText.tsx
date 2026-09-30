import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  colors = ['#f59e0b', '#fbbf24', '#fef08a', '#ea580c', '#d97706', '#f59e0b'],
  animationSpeed = 4,
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    backgroundSize: '250% auto',
    animation: `shimmer ${animationSpeed}s linear infinite`,
  };

  return (
    <span
      className={`inline-block bg-clip-text text-transparent font-semibold ${className}`}
      style={gradientStyle}
    >
      {children}
    </span>
  );
};

