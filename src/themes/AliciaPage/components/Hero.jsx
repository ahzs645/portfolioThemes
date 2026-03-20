import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT } from '../utils/tokens';

/* ── Shuffle text animation ──
   Splits text into individual char spans, shows random glyphs that
   "decrypt" into the real character one-by-one with staggered timing. */

const GLYPHS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz▓░▒█▀▄▌▐■□▪▫';

function ShuffleText({ children, delay = 0, scrambleDuration = 40, holdFrames = 3 }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const textRef = useRef(typeof children === 'string' ? children : '');

  useEffect(() => {
    const text = textRef.current;
    if (!ref.current || !text) return;

    const el = ref.current;
    el.textContent = '';

    const chars = [];
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      if (text[i] === ' ') {
        span.innerHTML = '&nbsp;';
        span.style.width = '0.25em';
      } else {
        span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.appendChild(span);
      chars.push({ span, target: text[i], isSpace: text[i] === ' ' });
    }

    const timeout = setTimeout(() => {
      // Phase 1: fade in all chars showing random glyphs
      chars.forEach((c, i) => {
        setTimeout(() => {
          c.span.style.transition = 'opacity 0.15s ease';
          c.span.style.opacity = '1';
        }, i * 15);
      });

      // Phase 2: scramble then resolve each char
      chars.forEach((c, i) => {
        if (c.isSpace) return;
        const charDelay = i * scrambleDuration;
        let frame = 0;

        const scrambleInterval = setInterval(() => {
          frame++;
          if (frame < holdFrames) {
            c.span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else {
            c.span.textContent = c.target;
            c.span.style.color = '';
            clearInterval(scrambleInterval);
          }
        }, 30);

        setTimeout(() => {
          // Start scrambling for this char
        }, charDelay);

        // Set a hard resolve time
        setTimeout(() => {
          c.span.textContent = c.target;
        }, charDelay + holdFrames * 30 + 60);
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, scrambleDuration, holdFrames]);

  return <span ref={ref}>{children}</span>;
}

/* ── ASCII art shuffle — same effect but for multi-line pre blocks ── */
function ShuffleAscii({ lines, theme, delay = 300 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.innerHTML = '';

    const allChars = [];

    lines.forEach((line, li) => {
      const lineDiv = document.createElement('div');
      line.text.split('').forEach((ch, ci) => {
        const span = document.createElement('span');
        span.style.opacity = '0';
        span.style.display = 'inline';
        span.dataset.char = ch;
        if (line.highlights.includes(ci)) {
          span.style.color = theme.blue;
        }
        span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        lineDiv.appendChild(span);
        allChars.push({ span, target: ch, highlighted: line.highlights.includes(ci) });
      });
      el.appendChild(lineDiv);
    });

    const timeout = setTimeout(() => {
      // Fade in
      allChars.forEach((c, i) => {
        setTimeout(() => {
          c.span.style.transition = 'opacity 0.12s ease';
          c.span.style.opacity = '1';
        }, i * 8);
      });

      // Resolve
      allChars.forEach((c, i) => {
        setTimeout(() => {
          c.span.textContent = c.target;
        }, i * 12 + 100);
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [lines, theme, delay]);

  return <AsciiPre ref={ref} $theme={theme} />;
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
            <ShuffleText delay={100} scrambleDuration={35} holdFrames={4}>
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
