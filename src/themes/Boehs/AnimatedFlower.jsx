import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';

// Starry night ASCII animation data - encoded with the original format:
// Numbers 0-9 represent (digit+2) spaces, '!' means repeat previous line
const RAW_FRAMES = `2
9 _94/\`\\9(7/\`\\
9(_)7/\`\\1// \\\\8))5// \\\\
99// \\\\0// \\\\0/\`\\_____||5// \\\\
99// \\\\0// \\\\ // /5\\0/\`\\ // \\\\
99// \\\\0// \\\\ ///_________\\// \\\\// \\\\
99// \\\\0// \\\\ // |-[+]---| // \\\\// \\\\
99// \\\\0// \\\\ // |-------| // \\\\// \\\\
7_____,....-----'------'-----''-------'---'----'--
?2
996/\`\\9 )6/\`\\
99 /\`\\1// \\\\8((5// \\\\
8_9// \\\\0// \\\\0/\`\\_____||5// \\\\
7(_)8// \\\\0// \\\\ // /5\\0/\`\\ // \\\\
!!!!
?2
996/\`\\9(7/\`\\
99 /\`\\1// \\\\8))5// \\\\
99// \\\\0// \\\\0/\`\\_____||5// \\\\
99// \\\\0// \\\\ // /5\\0/\`\\ // \\\\
6_90// \\\\0// \\\\ ///_________\\// \\\\// \\\\
5(_)9 // \\\\0// \\\\ // |-[+]---| // \\\\// \\\\
!!
?2
996/\`\\9 )6/\`\\
99 /\`\\1// \\\\8((5// \\\\
!!99// \\\\0// \\\\ ///_________\\// \\\\// \\\\
99// \\\\0// \\\\ // |-[+]---| // \\\\// \\\\
4_92// \\\\0// \\\\ // |-------| // \\\\// \\\\
3(_) _____,....-----'------'-----''-------'---'----'--
?2
996/\`\\9(7/\`\\
99 /\`\\1// \\\\8))5// \\\\
!!!!99// \\\\0// \\\\ // |-------| // \\\\// \\\\
7_____,....-----'------'-----''-------'---'----'--
?299.
.9 x93/\`\\3+4)6/\`\\
2+95/\`\\1// \\\\8((1*1// \\\\
8*3.3// \\\\0// \\\\0/\`\\_____||5// \\\\
!.6x9 // \\\\0// \\\\ ///_________\\// \\\\// \\\\
!0.92+1// \\\\0// \\\\ // |-------| // \\\\// \\\\
!
?299.
.9 +93/\`\\3x3(7/\`\\
2x95/\`\\1// \\\\8))1*1// \\\\
!!.6+9 // \\\\0// \\\\ ///_________\\// \\\\// \\\\
!0.92x1// \\\\0// \\\\ // |-------| // \\\\// \\\\
!
?299.
.9 x93/\`\\3+4)6/\`\\
2+95/\`\\1// \\\\8((1*1// \\\\
!!.6x9 // \\\\0// \\\\ ///_________\\// \\\\// \\\\
!0.92+1// \\\\0// \\\\ // |-------| // \\\\// \\\\
!
?299.
.9 +93/\`\\3x3(7/\`\\
2x95/\`\\1// \\\\8))1*1// \\\\
!!.6+9 // \\\\0// \\\\ ///_________\\// \\\\// \\\\
!0.92x1// \\\\0// \\\\ // |-------| // \\\\// \\\\
!`;

function parseFrames(raw) {
  let prev = [];
  return raw
    .split('\n?')
    .map((step) => {
      const frameCount = Number(step.substring(0, 1));
      const ascii = step
        .substring(1)
        .replace(/!(?!$)/g, '!\n')
        .split('\n')
        .map((line, i) =>
          line
            .replace(/[0-9]/g, (match) => ' '.repeat(Number(match) + 2))
            .replace(/!/g, prev[i] || '')
        )
        .join('\n');
      prev = ascii.split('\n');
      return [frameCount, ascii];
    })
    .reverse();
}

const FRAMES = parseFrames(RAW_FRAMES);

// Static base frame (last in the reversed array = first parsed = the ground scene)
const BASE_FRAME = FRAMES[FRAMES.length - 1]?.[1] || `



        _/\\_
     .-' || '-.
        _||_
   _____/____\\_____,....-----'------'-----''-------'---'----'--`;

export function AnimatedFlower({ placement = 'footer' }) {
  const [content, setContent] = useState(BASE_FRAME);
  const isAnimating = useRef(false);
  const isHovered = useRef(false);
  const state = useRef(false); // false = base, true = animated
  const timeLeft = useRef(FRAMES.length);
  const autoPlayTimer = useRef(null);

  const doAnimation = useCallback((shouldReverse) => {
    let frames = JSON.parse(JSON.stringify(FRAMES));
    isAnimating.current = true;

    if (shouldReverse) {
      frames = frames.reverse();
      state.current = false;
    } else {
      state.current = true;
    }

    const tl = { value: frames.length };

    const interval = setInterval(() => {
      setContent(frames[tl.value - 1][1]);
      if (frames[tl.value - 1][0] === 0) {
        tl.value -= 1;
      } else {
        frames[tl.value - 1][0] -= 1;
      }
      if (tl.value === 0) {
        clearInterval(interval);
        timeLeft.current = FRAMES.length;
        isAnimating.current = false;
        // Check if state needs to change
        if (!isHovered.current && state.current) {
          doAnimation(true);
        } else if (isHovered.current && !state.current) {
          doAnimation(false);
        }
      }
    }, 200);
  }, []);

  // Auto-play: start animation after a short delay on mount
  useEffect(() => {
    autoPlayTimer.current = setTimeout(() => {
      if (!isAnimating.current && !state.current) {
        doAnimation(false);
      }
    }, 600);
    return () => clearTimeout(autoPlayTimer.current);
  }, [doAnimation]);

  const handleMouseEnter = useCallback(() => {
    isHovered.current = true;
    if (!isAnimating.current && !state.current) {
      doAnimation(false);
    }
  }, [doAnimation]);

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false;
    if (!isAnimating.current && state.current) {
      doAnimation(true);
    }
  }, [doAnimation]);

  const Wrapper = placement === 'top' ? FlowerTop : FlowerFooter;

  return (
    <Wrapper
      aria-hidden="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

const flowerBase = css`
  margin: 0;
  width: 100%;
  font-size: 0.96rem;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  line-height: 1;
  color: var(--flower-color);
  white-space: pre;
  overflow: hidden;
  text-align: center;
  opacity: 0.85;
  cursor: pointer;
  min-height: 9em;
`;

const FlowerFooter = styled.pre`
  ${flowerBase};
  @media (max-width: 800px) {
    display: none;
  }
`;

const FlowerTop = styled.pre`
  ${flowerBase};
  display: none;
  margin-bottom: 16px;
  font-size: 0.72rem;
  min-height: 6em;
  overflow-x: auto;

  @media (max-width: 800px) {
    display: block;
  }
`;
