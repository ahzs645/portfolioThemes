import React from 'react';
import styled from 'styled-components';

export default function ProjectCard({ title, role, description, href, index = 0 }) {
  const Tag = href ? CardLink : Card;

  return (
    <Tag href={href} target={href ? '_blank' : undefined} rel={href ? 'noreferrer' : undefined} data-cursor-hover>
      <CardIndex>{String(index + 1).padStart(2, '0')}</CardIndex>
      <CardTitle>{title}</CardTitle>
      {role && <CardRole>{role}</CardRole>}
      {description && <CardDesc>{description}</CardDesc>}
      <CardArrow>&#x2197;</CardArrow>
    </Tag>
  );
}

const cardStyles = `
  display: grid;
  grid-template-columns: 40px 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  padding: 20px 24px;
  border: 1px solid rgba(41, 73, 111, 0.08);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(4px);
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
  text-decoration: none;
  color: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(41, 73, 111, 0.15);
    box-shadow: 0 8px 32px rgba(41, 73, 111, 0.06);
  }
`;

const Card = styled.div`${cardStyles}`;
const CardLink = styled.a`${cardStyles}`;

const CardIndex = styled.span`
  grid-row: 1 / 3;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: rgb(175, 184, 196);
  padding-top: 3px;
`;

const CardTitle = styled.span`
  grid-column: 2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 20px;
  letter-spacing: -0.02em;
  color: rgb(41, 72, 110);
  line-height: 1.3;
`;

const CardRole = styled.span`
  grid-column: 2;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: rgb(115, 131, 153);
  letter-spacing: -0.01em;
`;

const CardDesc = styled.span`
  grid-column: 2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14px;
  color: rgb(146, 159, 176);
  line-height: 1.5;
`;

const CardArrow = styled.span`
  grid-column: 3;
  grid-row: 1;
  font-size: 18px;
  color: rgb(175, 184, 196);
  transition: color 0.2s;

  ${Card}:hover &,
  ${CardLink}:hover & {
    color: rgb(41, 72, 110);
  }
`;
