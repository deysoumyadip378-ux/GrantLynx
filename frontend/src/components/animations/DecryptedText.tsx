import React, { useState, useEffect } from 'react';

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  characters?: string;
}

const GLYPHS = '0123456789ABCDEFabcdef!@#$%^&*<>~';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  className = '',
  speed = 30,
  characters = GLYPHS,
}) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === ' ') return ' ';
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, characters]);

  return <span className={`font-mono ${className}`}>{displayText || text}</span>;
};

