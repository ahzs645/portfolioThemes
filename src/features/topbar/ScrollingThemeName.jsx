import { useState, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';

// Gap between the two copies in the marquee loop (px).
const MARQUEE_GAP = 32;

// Theme name in the top bar: shows statically when it fits, and turns into a
// seamless infinite ticker when it's wider than the space available.
export function ScrollingThemeName({ name, darkMode }) {
  const viewportRef = useRef(null);
  const textRef = useRef(null);
  const [distance, setDistance] = useState(0); // 0 = fits, no scrolling

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const text = textRef.current;
    if (!viewport || !text) return undefined;
    const measure = () => {
      const overflow = text.scrollWidth - viewport.clientWidth;
      setDistance(overflow > 1 ? text.scrollWidth + MARQUEE_GAP : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [name]);

  return (
    <ThemeNameViewport ref={viewportRef}>
      {distance > 0 ? (
        <MarqueeTrack
          style={{
            '--marquee-distance': `${distance}px`,
            animationDuration: `${Math.max(6, distance / 35)}s`,
          }}
        >
          <CurrentThemeName ref={textRef} $darkMode={darkMode}>{name}</CurrentThemeName>
          <CurrentThemeName $darkMode={darkMode} aria-hidden="true">{name}</CurrentThemeName>
        </MarqueeTrack>
      ) : (
        <CurrentThemeName ref={textRef} $darkMode={darkMode}>{name}</CurrentThemeName>
      )}
    </ThemeNameViewport>
  );
}

const ThemeNameViewport = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const MarqueeTrack = styled.div`
  display: flex;
  width: max-content;
  gap: ${MARQUEE_GAP}px;
  will-change: transform;
  animation-name: marqueeScroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-1 * var(--marquee-distance))); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CurrentThemeName = styled.span`
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;
