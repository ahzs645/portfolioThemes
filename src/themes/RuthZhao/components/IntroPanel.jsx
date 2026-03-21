import React from 'react';
import styled from 'styled-components';

const glyphSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="48" height="36">
    <path d="M 0 3.075 C 0 1.929 0.924 1 2.064 1 L 9.312 1 C 10.452 1 11.376 1.929 11.376 3.075 L 11.376 10.362 C 11.376 11.508 10.452 12.437 9.312 12.437 L 2.064 12.437 C 0.924 12.437 0 11.508 0 10.362 Z M 11.376 14.512 C 11.376 13.366 12.301 12.437 13.441 12.437 L 20.688 12.437 C 21.829 12.437 22.753 13.366 22.753 14.512 L 22.753 21.798 C 22.753 22.944 21.829 23.874 20.688 23.874 L 13.441 23.874 C 12.301 23.874 11.376 22.944 11.376 21.798 Z M 11.376 25.949 C 11.376 24.803 10.452 23.874 9.312 23.874 L 2.064 23.874 C 0.924 23.874 0 24.803 0 25.949 L 0 33.235 C 0 34.381 0.924 35.31 2.064 35.31 L 9.312 35.31 C 10.452 35.31 11.376 34.381 11.376 33.235 Z" fill="rgb(223, 232, 232)" />
    <path d="M 36.212 33.235 C 36.212 34.381 37.136 35.31 38.276 35.31 L 45.524 35.31 C 46.664 35.31 47.588 34.381 47.588 33.235 L 47.588 25.949 C 47.588 24.803 46.664 23.874 45.524 23.874 L 38.276 23.874 C 37.136 23.874 36.212 24.803 36.212 25.949 Z M 36.212 10.362 C 36.212 11.508 37.136 12.437 38.276 12.437 L 45.524 12.437 C 46.664 12.437 47.588 11.508 47.588 10.362 L 47.588 3.075 C 47.588 1.929 46.664 1 45.524 1 L 38.276 1 C 37.136 1 36.212 1.929 36.212 3.075 Z" fill="rgb(223, 232, 232)" />
    <path d="M 23.7 14.5 C 23.7 13.395 24.595 12.5 25.7 12.5 L 33.2 12.5 C 34.305 12.5 35.2 13.395 35.2 14.5 L 35.2 22 C 35.2 23.105 34.305 24 33.2 24 L 25.7 24 C 24.595 24 23.7 23.105 23.7 22 Z" fill="rgb(247, 124, 17)" />
  </svg>
);

export function IntroPanel({ cv }) {
  return (
    <Panel>
      <TopSection>
        <GlyphWrap>
          {glyphSvg}
        </GlyphWrap>
        <TextGroup>
          <Wordmark>
            {cv.name || 'Your Name'}
          </Wordmark>
          <Prompt>{cv.label || 'What do you dream of?'}</Prompt>
        </TextGroup>
      </TopSection>
      <Lead>
        {cv.about || `${cv.name || 'This person'} is building at the intersection of research, systems, and care.`}
      </Lead>
    </Panel>
  );
}

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 25px;
  padding-top: 50px;
  width: min-content;

  @media (max-width: 1104px) {
    width: 100%;
    padding-top: 50px;
    padding-left: 10px;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const GlyphWrap = styled.div`
  display: flex;
  overflow: clip;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Wordmark = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1f2328;
  white-space: pre;
  will-change: transform;
`;

const Prompt = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 400;
  line-height: 1;
  color: rgba(0, 0, 0, 0.5);
  white-space: pre-wrap;
  width: 232px;

  @media (max-width: 1104px) {
    width: 75%;
  }
`;

const Lead = styled.p`
  margin: 0;
  color: rgba(0, 0, 0, 0.5);
  font-size: 1rem;
  line-height: 1.45;
  max-width: 250px;
  white-space: pre-wrap;
  word-break: break-word;

  @media (max-width: 1104px) {
    max-width: 75%;
  }
`;
