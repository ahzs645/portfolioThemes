import React from 'react';
import styled from 'styled-components';

export function IntroPanel({ cv }) {
  return (
    <Panel>
      <Glyph aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </Glyph>

      <Wordmark>{cv.name || 'Your Name'}</Wordmark>
      <Prompt>What do you dream of?</Prompt>
      <Lead>
        {cv.about || `${cv.name || 'This person'} is building at the intersection of research, systems, and care.`}
      </Lead>
    </Panel>
  );
}

const Panel = styled.section`
  display: grid;
  align-content: start;
  gap: 18px;
  max-width: 250px;
  padding-top: 56px;
`;

const Glyph = styled.div`
  width: 48px;
  height: 36px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 3px;
  margin-bottom: 42px;

  span {
    background: #dfe8e8;
    border-radius: 4px;
  }

  span:nth-child(3) {
    background: #f77c11;
  }
`;

const Wordmark = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1f2328;
`;

const Prompt = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 400;
  line-height: 1;
  color: #8a8e90;
`;

const Lead = styled.p`
  margin: 22px 0 0;
  color: #8a8e90;
  font-size: 1rem;
  line-height: 1.45;
  max-width: 13ch;
`;
