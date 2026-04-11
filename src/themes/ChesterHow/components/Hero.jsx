import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { cardVariants, colors, fonts, TAG_PALETTE } from '../styles';

const HeroSlot = styled(motion.div)`
  padding: 0 0.25rem 0.5rem;
  grid-row: span 2 / span 2;

  @media (min-width: 640px) {
    grid-column: span 2 / span 2;
  }
  @media (min-width: 1024px) {
    aspect-ratio: 1 / 1;
  }
`;

const HeroSurface = styled.div`
  height: 100%;
  width: 100%;
  padding: 1rem;

  @media (min-width: 640px) { padding: 2rem; }
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 72, "SOFT" 50;
  font-weight: 300;
  font-size: 1.5rem;
  line-height: 1.25;
  letter-spacing: -0.03em;
  color: ${colors.text400};

  @media (min-width: 640px) { font-size: 1.875rem; }
  @media (min-width: 1024px) { font-size: 2.25rem; }

  strong {
    font-weight: 300;
    color: ${colors.text900};
  }

  a {
    cursor: pointer;
    border-radius: 0.25rem;
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-underline-offset: 4px;
    color: ${colors.text900};
    transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1);

    &.dotted { text-decoration-style: dotted; }
    &:hover { color: ${colors.text500}; }
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px rgb(191 219 254);
    }

    &.c-orange  { text-decoration-color: ${TAG_PALETTE.orange.decoration}; }
    &.c-lime    { text-decoration-color: ${TAG_PALETTE.lime.decoration}; }
    &.c-teal    { text-decoration-color: ${TAG_PALETTE.teal.decoration}; }
    &.c-sky     { text-decoration-color: ${TAG_PALETTE.sky.decoration}; }
    &.c-purple  { text-decoration-color: ${TAG_PALETTE.purple.decoration}; }
    &.c-fuchsia { text-decoration-color: ${TAG_PALETTE.fuchsia.decoration}; }
    &.c-rose    { text-decoration-color: ${TAG_PALETTE.rose.decoration}; }
  }
`;

export function Hero({ name, sections, onSelect, currentTitle, location, website, email }) {
  const firstName = (name || 'there').split(' ')[0];

  const go = (id) => (event) => {
    event.preventDefault();
    onSelect(id);
  };

  const sectionHref = (id) => `#${id}`;
  const has = (id) => sections.some((section) => section.id === id);

  return (
    <HeroSlot variants={cardVariants}>
      <HeroSurface>
        <HeroTitle>
          Hey there, I’m <strong>{firstName}</strong> 👋  Welcome to my{' '}
          <a className="dotted" href="#about" onClick={go('about')}>
            digital garden
          </a>{' '}
          🌱 I like building{' '}
          {has('projects') ? (
            <a className="c-orange" href={sectionHref('projects')} onClick={go('projects')}>
              things
            </a>
          ) : (
            <span>things</span>
          )}
          {currentTitle ? <>, currently working as <strong>{currentTitle}</strong></> : null}
          {location ? <> out of <strong>{location}</strong></> : null}.
          <br />
          <br />
          In the meantime, I like to explore{' '}
          {has('experience') ? (
            <a className="c-sky" href={sectionHref('experience')} onClick={go('experience')}>
              work &amp; study
            </a>
          ) : (
            <span>work &amp; study</span>
          )}
          , jot down{' '}
          {has('writing') ? (
            <a className="c-teal" href={sectionHref('writing')} onClick={go('writing')}>
              writing
            </a>
          ) : (
            <span>writing</span>
          )}
          , and collect{' '}
          {has('extras') ? (
            <a className="c-lime" href={sectionHref('extras')} onClick={go('extras')}>
              curiosities
            </a>
          ) : (
            <span>curiosities</span>
          )}
          .
          <br />
          <br />
          Say hi at{' '}
          {email ? (
            <a className="c-rose" href={`mailto:${email}`}>
              {email}
            </a>
          ) : website ? (
            <a className="c-rose" href={website} target="_blank" rel="noreferrer">
              {website.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span>any time</span>
          )}
          .
        </HeroTitle>
      </HeroSurface>
    </HeroSlot>
  );
}
