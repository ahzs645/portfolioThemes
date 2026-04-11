import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CardTopBar } from './CardTopBar';
import { Tag } from './Tag';
import { cardVariants, colors, fonts } from '../styles';

const Slot = styled(motion.div)`
  padding: 0 0.25rem 0.5rem;
  aspect-ratio: ${(p) => (p.$large ? '2 / 1' : '1 / 1')};

  @media (min-width: 640px) {
    grid-column: ${(p) => (p.$large ? 'span 2 / span 2' : 'auto')};
  }
`;

const Surface = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
  background: ${colors.bg50};
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};

  &:hover, &:focus-within { background: ${colors.bg100}; }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgb(191 219 254);
  }
`;

const IsolateLayer = styled.div`
  position: relative;
  isolation: isolate;
  height: 100%;
  width: 100%;
`;

const ProjectArtwork = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 2rem 2rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .group:hover & { transform: scale(1.05); }
`;

const ProjectGlyph = styled.div`
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 144, "SOFT" 50;
  font-weight: 300;
  font-size: clamp(4rem, 18vw, 14rem);
  line-height: 1;
  color: ${colors.text200};
  letter-spacing: -0.06em;
  user-select: none;
`;

const ProjectMeta = styled.div`
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const ProjectHeading = styled.h3`
  margin: 0;
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 72, "SOFT" 50;
  font-weight: 300;
  font-size: ${(p) => (p.$large ? '2.5rem' : '1.75rem')};
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${colors.text900};
`;

const ProjectDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: ${colors.text700};
  font-weight: 300;
  display: -webkit-box;
  -webkit-line-clamp: ${(p) => (p.$large ? 3 : 2)};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const HobbyTextBody = styled.div`
  position: absolute;
  inset: 2.25rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const HobbyHeading = styled.h3`
  margin: 0;
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 72, "SOFT" 50;
  font-weight: 300;
  font-size: ${(p) => (p.$large ? '3rem' : '2rem')};
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: ${colors.text900};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const HobbySubheading = styled.p`
  margin: 0;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text400};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const HobbyBody = styled.p`
  margin: 0;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text700};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
`;

const WritingBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.25rem;
`;

const WritingTitle = styled.h3`
  margin: 0;
  font-family: ${fonts.serif};
  font-variation-settings: "opsz" 72, "SOFT" 50;
  font-weight: 300;
  font-size: 1.875rem;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: ${colors.text900};
`;

const WritingDate = styled.span`
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text400};
`;

const WritingPreview = styled.p`
  margin: 0;
  line-height: 1.625;
  letter-spacing: -0.025em;
  color: ${colors.text700};
  font-weight: 300;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

function ProjectCard({ large, category, label, url, properties }) {
  const initial = String(properties.name || '?').charAt(0).toUpperCase();
  return (
    <IsolateLayer>
      <CardTopBar category={category} label={label} url={url} />
      <ProjectArtwork>
        <ProjectGlyph>{initial}</ProjectGlyph>
      </ProjectArtwork>
      <ProjectMeta>
        <ProjectHeading $large={large}>{properties.name}</ProjectHeading>
        {properties.description && (
          <ProjectDescription $large={large}>{properties.description}</ProjectDescription>
        )}
      </ProjectMeta>
    </IsolateLayer>
  );
}

function HobbyTextCard({ large, category, label, url, properties }) {
  return (
    <>
      <CardTopBar category={category} label={label} url={url} />
      <HobbyTextBody>
        {properties.tags && properties.tags.length > 0 && (
          <TagRow>
            {properties.tags.map((tag, index) => (
              <Tag key={`${tag.label}-${index}`} label={tag.label} color={tag.color} />
            ))}
          </TagRow>
        )}
        <HobbyHeading $large={large} title={properties.heading}>
          {properties.heading}
        </HobbyHeading>
        {properties.subheading && (
          <HobbySubheading title={properties.subheading}>{properties.subheading}</HobbySubheading>
        )}
        {properties.body && <HobbyBody title={properties.body}>{properties.body}</HobbyBody>}
      </HobbyTextBody>
    </>
  );
}

function WritingCard({ category, label, url, properties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <CardTopBar category={category} label={label} url={url} />
      <WritingBody>
        <WritingTitle>{properties.title}</WritingTitle>
        {properties.publishedOn && <WritingDate>{properties.publishedOn}</WritingDate>}
        {properties.contentPreview && <WritingPreview>{properties.contentPreview}</WritingPreview>}
      </WritingBody>
    </div>
  );
}

export function Card({ card, onOpen }) {
  const { kind } = card;
  const clickable = typeof onOpen === 'function';
  const handleClick = () => {
    if (clickable) onOpen(card);
  };
  const handleKey = (event) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(card);
    }
  };
  return (
    <Slot $large={card.large} variants={cardVariants}>
      <Surface
        className="group"
        $clickable={clickable}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? handleClick : undefined}
        onKeyDown={clickable ? handleKey : undefined}
      >
        {kind === 'project' ? (
          <ProjectCard {...card} />
        ) : kind === 'writing' ? (
          <WritingCard {...card} />
        ) : (
          <HobbyTextCard {...card} />
        )}
      </Surface>
    </Slot>
  );
}
