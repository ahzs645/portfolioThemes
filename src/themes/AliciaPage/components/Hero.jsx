import React, { useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT } from '../utils/tokens';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*▓░▒█▀▄▌▐←→↑↓◆◇○●';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/* ── Core scramble engine ──
   All animation is JS-driven via setTimeout. No CSS keyframes fighting. */
function scrambleAndResolve(chars, { perCharDelay = 30, frames = 6, frameMs = 40 } = {}) {
  const timeouts = [];

  chars.forEach((c, i) => {
    if (c.isSpace) return;
    const span = c.span;

    // Immediately show a random glyph
    span.textContent = randomGlyph();
    span.style.opacity = '1';

    const base = i * perCharDelay;

    // Cycle through random glyphs
    for (let f = 0; f < frames; f++) {
      timeouts.push(setTimeout(() => {
        span.textContent = randomGlyph();
      }, base + f * frameMs));
    }

    // Resolve to correct char
    timeouts.push(setTimeout(() => {
      span.textContent = c.target;
    }, base + frames * frameMs));
  });

  return () => timeouts.forEach(clearTimeout);
}

/* ── ShuffleText: splits text into char spans, scrambles on mount + hover ── */
function ShuffleText({ text, delay = 0, perCharDelay = 35, frames = 8, frameMs = 40 }) {
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const cleanupRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !text) return;

    // Build char spans
    el.innerHTML = '';
    const chars = [];
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.setAttribute('data-char', text[i]);
      span.style.setProperty('--char-index', String(i));
      span.style.display = 'inline-block';

      if (text[i] === ' ') {
        span.innerHTML = '&nbsp;';
        span.style.width = '0.25em';
        span.style.opacity = '1';
      } else {
        span.textContent = randomGlyph();
        span.style.opacity = '0'; // Hidden until initial scramble
      }
      el.appendChild(span);
      chars.push({ span, target: text[i], isSpace: text[i] === ' ' });
    }
    charsRef.current = chars;

    // Initial reveal after delay
    const initTimeout = setTimeout(() => {
      cleanupRef.current = scrambleAndResolve(chars, { perCharDelay, frames, frameMs });
      const totalMs = (chars.length - 1) * perCharDelay + frames * frameMs + 100;
      setTimeout(() => { busyRef.current = false; }, totalMs);
    }, delay);

    return () => {
      clearTimeout(initTimeout);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [text]);

  const handleHover = useCallback(() => {
    if (charsRef.current.length === 0) return;
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = scrambleAndResolve(charsRef.current, { perCharDelay, frames, frameMs });
  }, [perCharDelay, frames, frameMs]);

  return <ShuffleSpan ref={containerRef} onMouseEnter={handleHover} />;
}

/* ── ShuffleAscii: same but for multi-line ASCII art ── */
function ShuffleAscii({ lines, theme, delay = 300 }) {
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';
    const allChars = [];
    let globalIdx = 0;

    lines.forEach((line) => {
      const div = document.createElement('div');
      line.text.split('').forEach((ch, ci) => {
        const span = document.createElement('span');
        span.setAttribute('data-char', ch);
        span.style.setProperty('--char-index', String(globalIdx));
        span.style.display = 'inline';
        span.style.opacity = '0';
        span.textContent = randomGlyph();
        if (line.highlights.includes(ci)) span.dataset.highlight = '1';
        div.appendChild(span);
        allChars.push({ span, target: ch, highlighted: line.highlights.includes(ci), isSpace: false });
        globalIdx++;
      });
      el.appendChild(div);
    });
    charsRef.current = allChars;

    const initTimeout = setTimeout(() => {
      cleanupRef.current = scrambleAndResolve(allChars, { perCharDelay: 8, frames: 4, frameMs: 20 });
      // Apply highlight colors after all chars resolve
      const totalMs = (allChars.length - 1) * 8 + 4 * 20 + 100;
      setTimeout(() => {
        allChars.forEach(c => {
          if (c.highlighted) c.span.style.color = theme.blue;
        });
      }, totalMs);
    }, delay);

    return () => {
      clearTimeout(initTimeout);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [lines, theme, delay]);

  const handleHover = useCallback(() => {
    if (charsRef.current.length === 0) return;
    if (cleanupRef.current) cleanupRef.current();
    // Clear highlights during scramble
    charsRef.current.forEach(c => { if (c.highlighted) c.span.style.color = ''; });
    cleanupRef.current = scrambleAndResolve(charsRef.current, { perCharDelay: 8, frames: 4, frameMs: 20 });
    const totalMs = (charsRef.current.length - 1) * 8 + 4 * 20 + 100;
    setTimeout(() => {
      charsRef.current.forEach(c => {
        if (c.highlighted) c.span.style.color = theme.blue;
      });
    }, totalMs);
  }, [theme]);

  return <AsciiPre ref={containerRef} $theme={theme} onMouseEnter={handleHover} />;
}

/* ── Section label with shuffle ── */
export function ShuffleSectionLabel({ children, theme }) {
  const text = typeof children === 'string' ? children : '';
  return (
    <SectionLabelWrap $theme={theme}>
      <ShuffleText text={text} delay={500} perCharDelay={25} frames={5} frameMs={30} />
    </SectionLabelWrap>
  );
}

/* ── Hero ── */
export default function Hero({ cv, theme }) {
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
            <ShuffleText text={name.toLowerCase()} delay={100} perCharDelay={40} frames={8} frameMs={45} />
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
              <Bio>I'm {name.split(' ')[0]}, {/^[aeiou]/i.test(title) ? 'an' : 'a'} {title}.</Bio>
            ) : null}
          </FadeIn>
          <FadeIn delay={700}>
            <SocialLine>
              Find me on{' '}
              {socialLinks.github && <><BlueLink href={socialLinks.github} $theme={theme} target="_blank">Github</BlueLink>, </>}
              {socialLinks.linkedin && <><BlueLink href={socialLinks.linkedin} $theme={theme} target="_blank">LinkedIn</BlueLink>, </>}
              {socialLinks.twitter && <><BlueLink href={socialLinks.twitter} $theme={theme} target="_blank">Twitter</BlueLink>, </>}
              {email && <>or email me at <BlueLink href={`mailto:${email}`} $theme={theme}>{email}</BlueLink>.</>}
            </SocialLine>
          </FadeIn>
        </ListContent>
      </ListContainer>
    </Section>
  );
}

/* ── Styled Components ── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;
const FadeIn = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: ${p => p.delay || 0}ms;
`;
const Section = styled.section`padding-top: 120px;`;
const ListContainer = styled.dl`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem; row-gap: 0.5rem; margin-bottom: 3rem;
  @media (min-width: 768px) { margin-bottom: 4rem; row-gap: 1rem; }
`;
const ListTitle = styled.dt`
  grid-column: span 12; padding: 8px;
  @media (min-width: 768px) { grid-column: span 4; }
`;
const ListContent = styled.dd`
  grid-column: span 12;
  border-top: 1px solid rgba(115,115,115,0.1);
  padding: 16px 8px 0; display: flex; flex-direction: column; gap: 16px; font-size: 15px;
  @media (min-width: 768px) { grid-column: span 8; }
`;
const ShuffleSpan = styled.span`cursor: default; display: inline;`;
const NameWrap = styled.h1`
  font-weight: 700; font-size: 1rem; color: ${p => p.$theme.primary};
  margin: 0; line-height: 1.625;
`;
const AsciiWrap = styled.div`margin-top: 24px;`;
const AsciiPre = styled.pre`
  font-family: ${FONT.mono}; font-size: 12px; line-height: 1.15;
  color: ${p => p.$theme.silverDark}; white-space: pre; margin: 0; cursor: default;
`;
const SectionLabelWrap = styled.h2`
  font-weight: 700; font-size: 1rem; margin: 0;
  color: ${p => p.$theme.primary}; cursor: default;
`;
const Greeting = styled.p`margin: 0;`;
const Bio = styled.p`margin: 0; line-height: 1.6;`;
const SocialLine = styled.p`margin: 0; line-height: 1.6;`;
const BlueLink = styled.a`
  color: ${p => p.$theme.blue}; text-decoration: none; position: relative;
  font-weight: 400; transition: color 0.3s linear;
  &::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
    background-color: currentColor; transform: scaleX(0); transform-origin: 100% 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &:hover::after { transform: scaleX(1); transform-origin: 0 100%; }
`;
