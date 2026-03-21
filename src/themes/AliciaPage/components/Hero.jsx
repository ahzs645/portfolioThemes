import { useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT } from '../utils/tokens';

/* ── Character pool (matches Alicia's source) ── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};<>0123456789░▒'.split('');
const getRandomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/* ── Core scramble: recursive setTimeout at 15ms, 44 frames per char ── */
function runScramble(charSpans, originals, { stagger = 30, totalFrames = 44, frameMs = 15 } = {}) {
  const timeouts = [];

  charSpans.forEach((span, i) => {
    const tid = setTimeout(() => {
      let frame = 0;
      const tick = () => {
        if (frame === totalFrames) {
          span.textContent = originals[i]; // resolve to correct char
        } else {
          span.textContent = getRandomChar(); // scramble
        }
        if (++frame <= totalFrames) {
          timeouts.push(setTimeout(tick, frameMs));
        }
      };
      tick();
    }, i * stagger);
    timeouts.push(tid);
  });

  return () => timeouts.forEach(clearTimeout);
}

/* ── Build char spans from text, attach to a DOM element ── */
function buildCharSpans(el, text) {
  el.innerHTML = '';
  const spans = [];
  const originals = [];

  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'char';
    span.setAttribute('data-char', text[i]);
    span.style.cssText = `--char-index:${i};display:inline-block;`;

    if (text[i] === ' ') {
      span.innerHTML = '&nbsp;';
      span.style.width = '0.25em';
    } else {
      span.textContent = text[i];
    }

    el.appendChild(span);
    spans.push(span);
    originals.push(text[i] === ' ' ? '\u00A0' : text[i]);
  }

  return { spans, originals };
}

/* ── ShuffleText component ── */
function ShuffleText({ text, delay = 0, stagger = 30 }) {
  const elRef = useRef(null);
  const dataRef = useRef({ spans: [], originals: [] });
  const cleanupRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || !text) return;

    const { spans, originals } = buildCharSpans(el, text);
    dataRef.current = { spans, originals };

    // Initial mount animation after delay
    const tid = setTimeout(() => {
      cleanupRef.current = runScramble(spans, originals, { stagger, totalFrames: 44, frameMs: 15 });
    }, delay);

    return () => {
      clearTimeout(tid);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [text, delay, stagger]);

  const handleMouseEnter = useCallback(() => {
    const { spans, originals } = dataRef.current;
    if (!spans.length) return;
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = runScramble(spans, originals, { stagger, totalFrames: 44, frameMs: 15 });
  }, [stagger]);

  return <ShuffleSpan ref={elRef} onMouseEnter={handleMouseEnter} />;
}

/* ── ShuffleAscii component ── */
function ShuffleAscii({ lines, theme, delay = 300, stagger = 5 }) {
  const elRef = useRef(null);
  const dataRef = useRef({ spans: [], originals: [], highlightIndices: [] });
  const cleanupRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    el.innerHTML = '';
    const spans = [];
    const originals = [];
    const highlightIndices = [];
    let globalIdx = 0;

    lines.forEach((line) => {
      const div = document.createElement('div');
      line.text.split('').forEach((ch, ci) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.setAttribute('data-char', ch);
        span.style.cssText = `--char-index:${globalIdx};display:inline;`;
        span.textContent = ch;
        if (line.highlights.includes(ci)) highlightIndices.push(globalIdx);
        div.appendChild(span);
        spans.push(span);
        originals.push(ch);
        globalIdx++;
      });
      el.appendChild(div);
    });

    dataRef.current = { spans, originals, highlightIndices };

    // Initial scramble
    const tid = setTimeout(() => {
      cleanupRef.current = runScramble(spans, originals, { stagger, totalFrames: 30, frameMs: 15 });
      // Apply highlights after animation completes
      const totalMs = (spans.length - 1) * stagger + 30 * 15 + 100;
      setTimeout(() => applyHighlights(spans, highlightIndices, theme), totalMs);
    }, delay);

    return () => {
      clearTimeout(tid);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [lines, theme, delay, stagger]);

  const handleMouseEnter = useCallback(() => {
    const { spans, originals, highlightIndices } = dataRef.current;
    if (!spans.length) return;
    if (cleanupRef.current) cleanupRef.current();
    // Clear highlights during scramble
    highlightIndices.forEach(idx => { spans[idx].style.color = ''; });
    cleanupRef.current = runScramble(spans, originals, { stagger, totalFrames: 30, frameMs: 15 });
    const totalMs = (spans.length - 1) * stagger + 30 * 15 + 100;
    setTimeout(() => applyHighlights(spans, highlightIndices, theme), totalMs);
  }, [theme, stagger]);

  return <AsciiPre ref={elRef} $theme={theme} onMouseEnter={handleMouseEnter} />;
}

function applyHighlights(spans, indices, theme) {
  indices.forEach(idx => {
    if (spans[idx]) spans[idx].style.color = theme.blue;
  });
}

/* ── Section label with shuffle on hover ── */
export function ShuffleSectionLabel({ children, theme }) {
  const text = typeof children === 'string' ? children : '';
  return (
    <SectionLabelWrap>
      <ShuffleText text={text} delay={500} stagger={25} />
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
        <ListTitle>
          <NameWrap $theme={theme}>
            <ShuffleText text={name.toLowerCase()} delay={100} stagger={30} />
          </NameWrap>
          <AsciiWrap>
            <ShuffleAscii lines={asciiLines} theme={theme} delay={400} stagger={5} />
          </AsciiWrap>
        </ListTitle>
        <ListContent>
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
  display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem; row-gap: 0.5rem; margin-bottom: 3rem;
  @media (min-width: 768px) { margin-bottom: 4rem; row-gap: 1rem; }
`;
const ListTitle = styled.dt`
  grid-column: span 12; padding: 8px;
  @media (min-width: 768px) { grid-column: span 4; }
`;
const ListContent = styled.dd`
  grid-column: span 12; border-top: 1px solid rgba(115,115,115,0.1);
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
  font-weight: 700; font-size: 1rem; margin: 0; cursor: default;
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
