import React from 'react';
import styled from 'styled-components';

export default function ProjectCard({ title, role, description, href, index = 0, $dark = false }) {
  const Tag = href ? CardLink : Card;

  return (
    <Tag href={href} target={href ? '_blank' : undefined} rel={href ? 'noreferrer' : undefined} data-cursor-hover $dark={$dark}>
      <CardIndex $dark={$dark}>{String(index + 1).padStart(2, '0')}</CardIndex>
      <CardTitle $dark={$dark}>{title}</CardTitle>
      {role && <CardRole $dark={$dark}>{role}</CardRole>}
      {description && <CardDesc $dark={$dark}>{description}</CardDesc>}
      <CardArrow $dark={$dark}>&#x2197;</CardArrow>
    </Tag>
  );
}

const cardBase = p => `
  display: grid;
  grid-template-columns: 40px 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  padding: 20px 24px;
  border: 1px solid ${p.$dark ? 'rgba(140, 175, 220, 0.1)' : 'rgba(41, 73, 111, 0.08)'};
  border-radius: 2px;
  background: ${p.$dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.35)'};
  backdrop-filter: blur(4px);
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
  text-decoration: none;
  color: inherit;
`;

const Card = styled.div`
  ${p => cardBase(p)}
  &:hover {
    background: ${p => p.$dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)'};
    border-color: ${p => p.$dark ? 'rgba(140, 175, 220, 0.2)' : 'rgba(41, 73, 111, 0.15)'};
    box-shadow: 0 8px 32px ${p => p.$dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(41, 73, 111, 0.06)'};
  }
`;

const CardLink = styled.a`
  ${p => cardBase(p)}
  &:hover {
    background: ${p => p.$dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)'};
    border-color: ${p => p.$dark ? 'rgba(140, 175, 220, 0.2)' : 'rgba(41, 73, 111, 0.15)'};
    box-shadow: 0 8px 32px ${p => p.$dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(41, 73, 111, 0.06)'};
  }
`;

const CardIndex = styled.span`
  grid-row: 1 / 3;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: ${p => p.$dark ? 'rgb(100, 115, 135)' : 'rgb(175, 184, 196)'};
  padding-top: 3px;
`;

const CardTitle = styled.span`
  grid-column: 2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 20px;
  letter-spacing: -0.02em;
  color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  line-height: 1.3;
`;

const CardRole = styled.span`
  grid-column: 2;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(115, 131, 153)'};
  letter-spacing: -0.01em;
`;

const CardDesc = styled.span`
  grid-column: 2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14px;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(146, 159, 176)'};
  line-height: 1.5;
`;

const CardArrow = styled.span`
  grid-column: 3;
  grid-row: 1;
  font-size: 18px;
  color: ${p => p.$dark ? 'rgb(100, 115, 135)' : 'rgb(175, 184, 196)'};
  transition: color 0.2s;

  ${Card}:hover &,
  ${CardLink}:hover & {
    color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  }
`;
