import React, { useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT } from '../utils/tokens';

/* ── Shuffle-on-hover text effect ──
   On hover: scrambles to random glyphs, then resolves back char-by-char.
   On mount: runs once to reveal the text initially. */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*▓░▒█▀▄▌▐';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function useTextShuffle(ref, text, { charDelay = 30, scrambleFrames = 6, frameInterval = 40, initialDelay = 0 } = {}) {
  const charsRef = useRef([]);
  const animatingRef = useRef(false);
  const timeoutsRef = useRef([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Build char spans on mount
  useEffect(() => {
    if (!ref.current || !text) return;
    const el = ref.current;
    el.innerHTML = '';
    const chars = [];

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      if (text[i] === ' ') {
        span.innerHTML = '&nbsp;';
        span.style.width = '0.25em';
      } else {
        span.textContent = text[i];
        span.style.opacity = '0';
      }
      el.appendChild(span);
      chars.push({ span, target: text[i], isSpace: text[i] === ' ' });
    }
    charsRef.current = chars;

    // Initial reveal animation
    const t = setTimeout(() => runShuffle(chars, true), initialDelay);
    return () => { clearTimeout(t); clearTimeouts(); };
  }, [text]);

  const runShuffle = useCallback((chars, isInitial = false) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    clearTimeouts();

    chars.forEach((c, i) => {
      if (c.isSpace) return;

      // Immediately show scrambled glyph
      if (!isInitial) {
        c.span.textContent = randomGlyph();
      }

      // Stagger: each char starts resolving after i * charDelay ms
      const startTime = i * charDelay;

      // During scramble phase, cycle through random glyphs
      for (let f = 0; f < scrambleFrames; f++) {
        const tid = setTimeout(() => {
          c.span.style.opacity = '1';
          c.span.textContent = randomGlyph();
        }, startTime + f * frameInterval);
        timeoutsRef.current.push(tid);
      }

      // Final resolve to correct character
      const resolveTid = setTimeout(() => {
        c.span.textContent = c.target;
      }, startTime + scrambleFrames * frameInterval);
      timeoutsRef.current.push(resolveTid);
    });

    // Mark animation complete
    const totalDuration = (chars.length - 1) * charDelay + scrambleFrames * frameInterval + 50;
    const doneTid = setTimeout(() => { animatingRef.current = false; }, totalDuration);
    timeoutsRef.current.push(doneTid);
  }, [charDelay, scrambleFrames, frameInterval, clearTimeouts]);

  const triggerShuffle = useCallback(() => {
    runShuffle(charsRef.current, false);
  }, [runShuffle]);

  return triggerShuffle;
}

function ShuffleText({ children, delay = 0, charDelay = 30, scrambleFrames = 6, frameInterval = 40, style }) {
  const ref = useRef(null);
  const text = typeof children === 'string' ? children : '';
  const triggerShuffle = useTextShuffle(ref, text, { charDelay, scrambleFrames, frameInterval, initialDelay: delay });

  return (
    <span
      ref={ref}
      style={{ cursor: 'default', ...style }}
      onMouseEnter={triggerShuffle}
    >
      {children}
    </span>
  );
}

/* ── ASCII art shuffle — same hover-triggered effect for multi-line blocks ── */
function ShuffleAscii({ lines, theme, delay = 300 }) {
  const ref = useRef(null);
  const allCharsRef = useRef([]);
  const animatingRef = useRef(false);
  const timeoutsRef = useRef([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.innerHTML = '';
    const allChars = [];

    lines.forEach((line) => {
      const lineDiv = document.createElement('div');
      line.text.split('').forEach((ch, ci) => {
        const span = document.createElement('span');
        span.style.display = 'inline';
        span.style.opacity = '0';
        if (line.highlights.includes(ci)) {
          span.dataset.highlight = '1';
        }
        span.textContent = ch;
        lineDiv.appendChild(span);
        allChars.push({ span, target: ch, highlighted: line.highlights.includes(ci) });
      });
      el.appendChild(lineDiv);
    });

    allCharsRef.current = allChars;

    // Initial reveal
    const t = setTimeout(() => runAsciiShuffle(allChars, true), delay);
    return () => { clearTimeout(t); clearTimeouts(); };
  }, [lines, theme, delay]);

  const runAsciiShuffle = useCallback((chars, isInitial = false) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    clearTimeouts();

    chars.forEach((c, i) => {
      const startTime = i * 10;

      if (!isInitial) {
        c.span.textContent = randomGlyph();
      }

      // Scramble frames
      for (let f = 0; f < 4; f++) {
        const tid = setTimeout(() => {
          c.span.style.opacity = '1';
          c.span.textContent = randomGlyph();
        }, startTime + f * 25);
        timeoutsRef.current.push(tid);
      }

      // Resolve
      const tid = setTimeout(() => {
        c.span.textContent = c.target;
        if (c.highlighted) {
          c.span.style.color = theme.blue;
        }
      }, startTime + 4 * 25);
      timeoutsRef.current.push(tid);
    });

    const total = (chars.length - 1) * 10 + 4 * 25 + 50;
    const doneTid = setTimeout(() => { animatingRef.current = false; }, total);
    timeoutsRef.current.push(doneTid);
  }, [theme, clearTimeouts]);

  const triggerShuffle = useCallback(() => {
    runAsciiShuffle(allCharsRef.current, false);
  }, [runAsciiShuffle]);

  return (
    <AsciiPre
      ref={ref}
      $theme={theme}
      onMouseEnter={triggerShuffle}
    />
  );
}

/* ── Section label shuffle (for "recent projects" etc.) ── */
export function ShuffleSectionLabel({ children, theme }) {
  const ref = useRef(null);
  const text = typeof children === 'string' ? children : '';
  const triggerShuffle = useTextShuffle(ref, text, {
    charDelay: 25,
    scrambleFrames: 5,
    frameInterval: 35,
    initialDelay: 600,
  });

  return (
    <SectionLabelText
      ref={ref}
      $theme={theme}
      onMouseEnter={triggerShuffle}
    >
      {children}
    </SectionLabelText>
  );
}

export default function Hero({ cv, theme, onNavigate }) {
  const name = cv?.name || '';
  const title = cv?.currentJobTitle || '';
  const summary = cv?.summary || '';
  const email = cv?.email || '';
  const socialLinks = cv?.socialLinks || {};

  const asciiLines = [
    { text: '▐▓█▀▀▀▀▀▀▀▀▀█▓▌░▄▄▄▄▄', highlights: [] },
    { text: '▐▓█░░░░░░░░░█▓▌░█████', highlights: [] },
    { text: '▐▓█░░▀░░▀▄░░█▓▌░█▄▄▄█', highlights: [5, 8, 9] },
    { text: '▐▓█░░▄░░▄▀░░█▓▌░█▄▄▄█', highlights: [5, 8, 9] },
    { text: '▐▓█░░░░░░░░░█▓▌░█████', highlights: [] },
    { text: '▐▓█▄▄▄▄▄▄▄▄▄█▓▌░█████', highlights: [] },
    { text: '░░░░▄▄███▄▄░░░░░█████', highlights: [] },
  ];

  return (
    <Section>
      <ListContainer>
        <ListTitle $theme={theme}>
          <NameWrap $theme={theme}>
            <ShuffleText
              delay={100}
              charDelay={40}
              scrambleFrames={8}
              frameInterval={45}
            >
              {name.toLowerCase()}
            </ShuffleText>
          </NameWrap>
          <AsciiWrap>
            <ShuffleAscii lines={asciiLines} theme={theme} delay={400} />
          </AsciiWrap>
        </ListTitle>
        <ListContent $theme={theme}>
          <FadeIn delay={300}><Greeting>Hi!</Greeting></FadeIn>
          <FadeIn delay={500}>
            {summary ? (
              <Bio>{summary}</Bio>
            ) : title ? (
              <Bio>
                I'm {name.split(' ')[0]}, {/^[aeiou]/i.test(title) ? 'an' : 'a'} {title}.
              </Bio>
            ) : null}
          </FadeIn>
          <FadeIn delay={700}>
            <SocialLine>
              Find me on{' '}
              {socialLinks.github && (
                <><BlueLink href={socialLinks.github} $theme={theme} target="_blank">Github</BlueLink>, </>
              )}
              {socialLinks.linkedin && (
                <><BlueLink href={socialLinks.linkedin} $theme={theme} target="_blank">LinkedIn</BlueLink>, </>
              )}
              {socialLinks.twitter && (
                <><BlueLink href={socialLinks.twitter} $theme={theme} target="_blank">Twitter</BlueLink>, </>
              )}
              {email && (
                <>or email me at <BlueLink href={`mailto:${email}`} $theme={theme}>{email}</BlueLink>.</>
              )}
            </SocialLine>
          </FadeIn>
        </ListContent>
      </ListContainer>
    </Section>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadeIn = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: ${p => p.delay || 0}ms;
`;

const Section = styled.section`
  padding-top: 120px;
`;

const ListContainer = styled.dl`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
  row-gap: 0.5rem;
  margin-bottom: 3rem;
  @media (min-width: 768px) {
    margin-bottom: 4rem;
    row-gap: 1rem;
  }
`;

const ListTitle = styled.dt`
  grid-column: span 12;
  padding: 8px;
  @media (min-width: 768px) { grid-column: span 4; }
`;

const ListContent = styled.dd`
  grid-column: span 12;
  border-top: 1px solid rgba(115, 115, 115, 0.1);
  padding: 16px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 15px;
  @media (min-width: 768px) {
    grid-column: span 8;
  }
`;

const NameWrap = styled.h1`
  font-weight: 700;
  font-size: 1rem;
  color: ${p => p.$theme.primary};
  margin: 0;
  line-height: 1.625;
`;

const AsciiWrap = styled.div`
  margin-top: 24px;
`;

const AsciiPre = styled.pre`
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 1.15;
  color: ${p => p.$theme.silverDark};
  white-space: pre;
  margin: 0;
  cursor: default;
`;

const SectionLabelText = styled.h2`
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
  color: ${p => p.$theme.primary};
  cursor: default;
`;

const Greeting = styled.p`
  margin: 0;
`;

const Bio = styled.p`
  margin: 0;
  line-height: 1.6;
`;

const SocialLine = styled.p`
  margin: 0;
  line-height: 1.6;
`;

const BlueLink = styled.a`
  color: ${p => p.$theme.blue};
  text-decoration: none;
  position: relative;
  font-weight: 400;
  transition: color 0.3s linear;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: currentColor;
    transform: scaleX(0);
    transform-origin: 100% 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &:hover::after {
    transform: scaleX(1);
    transform-origin: 0 100%;
  }
`;
