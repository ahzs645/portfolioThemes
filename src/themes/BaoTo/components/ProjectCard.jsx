import React from 'react';
import styled, { keyframes } from 'styled-components';

const COLORS = {
  text: '#2a2520',
  text80: 'rgba(42, 37, 32, 0.80)',
  text65: 'rgba(42, 37, 32, 0.65)',
  text35: 'rgba(42, 37, 32, 0.35)',
  text08: 'rgba(42, 37, 32, 0.08)',
  white: '#ffffff',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div`
  padding: 20px 16px;
  border: 1px solid ${COLORS.text08};
  background: ${COLORS.white};
  transition: all 0.3s ease;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => p.$i * 0.06}s;
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};

  &:hover {
    box-shadow: 0 4px 20px rgba(42, 37, 32, 0.06);
    border-color: rgba(42, 37, 32, 0.12);
  }
`;

const Title = styled.h3`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.text80};
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Summary = styled.p`
  font-size: 12px;
  line-height: 1.55;
  color: ${COLORS.text65};
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: ${COLORS.text35};
  padding: 2px 6px;
  border-radius: 2px;
  background: rgba(42, 37, 32, 0.03);
  letter-spacing: 0.02em;
`;

const ArrowIcon = styled.span`
  color: ${COLORS.text35};
  display: inline-flex;
  transition: color 0.2s;
  ${Card}:hover & { color: ${COLORS.text80}; }
`;

export function ProjectCard({ project, index }) {
  const hasLink = !!project.url;

  const handleClick = () => {
    if (hasLink) window.open(project.url, '_blank', 'noreferrer');
  };

  return (
    <Card $i={index} $clickable={hasLink} onClick={handleClick}>
      <Title>
        {project.name}
        {hasLink && (
          <ArrowIcon>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </ArrowIcon>
        )}
      </Title>
      {project.summary && <Summary>{project.summary}</Summary>}
      <Tags>
        {project.technologies?.slice(0, 4).map((t, i) => (
          <Tag key={i}>{t}</Tag>
        ))}
        {!project.technologies?.length && project.keywords?.slice(0, 4).map((k, i) => (
          <Tag key={i}>{k}</Tag>
        ))}
      </Tags>
    </Card>
  );
}
