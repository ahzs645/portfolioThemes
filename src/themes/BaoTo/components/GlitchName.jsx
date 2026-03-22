import React, { useState, useEffect, useRef } from 'react';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

export function GlitchName({ text, delay = 0 }) {
  const [display, setDisplay] = useState(() => text.split('').map(() => ''));
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const chars = text.split('');
    const timer = setTimeout(() => {
      let revealed = 0;
      let speed = 1.5;
      let tick = 0;

      const interval = setInterval(() => {
        setDisplay(
          chars.map((ch, i) =>
            ch === ' '
              ? ' '
              : i < revealed
              ? chars[i]
              : CHARSET[Math.floor(Math.random() * CHARSET.length)]
          )
        );

        revealed += speed;
        speed = Math.min(8, 1.5 + ++tick * 0.15);

        if (revealed >= chars.length) {
          clearInterval(interval);
          setDisplay(chars);
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [text, delay]);

  return <span>{display.join('')}</span>;
}
