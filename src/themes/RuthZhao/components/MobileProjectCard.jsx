import React from 'react';
import styled from 'styled-components';

const crosshairSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" width="9" height="9">
    <path d="M 4.5 0 L 4.5 9" fill="none" stroke="rgb(255, 255, 255)" strokeWidth="1" />
    <path d="M 0 4.5 L 9 4.5" fill="none" stroke="rgb(255, 255, 255)" strokeWidth="1" />
  </svg>
);

export function MobileProjectCard({ project }) {
  const Tag = project.href ? CardLink : CardDiv;

  return (
    <Tag
      href={project.href || undefined}
      target={project.href ? '_blank' : undefined}
      rel={project.href ? 'noreferrer' : undefined}
    >
      <CardImage src={project.image} alt={project.label} />
      <CardBar>
        <CardInfo>
          <CardLabel>{project.label}</CardLabel>
          <CardMeta>{project.meta}</CardMeta>
        </CardInfo>
        <IconBox $accent={project.id === 'ramp'}>
          {crosshairSvg}
        </IconBox>
      </CardBar>
    </Tag>
  );
}

const cardBase = `
  display: flex;
  flex-direction: column;
  background: #000;
  border: 0.5px solid #d0d6d9;
  overflow: visible;
  width: 100%;
  text-decoration: none;
  cursor: pointer;
  will-change: transform;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: -0.27px 0.56px 0.62px -0.3px rgba(213,223,235,0.16),
      -0.73px 1.53px 1.7px -0.6px rgba(213,223,235,0.17),
      -1.59px 3.37px 3.73px -0.9px rgba(213,223,235,0.19),
      -3.54px 7.47px 8.27px -1.2px rgba(213,223,235,0.23),
      -9px 19px 21px -1.5px rgba(213,223,235,0.35);
  }
`;

const CardLink = styled.a`${cardBase}`;
const CardDiv = styled.div`${cardBase}`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 2.4167 / 1;
  object-fit: fill;
  display: block;
`;

const CardBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
  overflow: clip;
`;

const CardInfo = styled.div`
  display: flex;
  flex: 1 0 0px;
  flex-direction: row;
  justify-content: space-between;
  overflow: clip;
  padding: 10px;
  height: 41px;
  align-items: flex-start;
`;

const CardLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  color: #fff;
  white-space: pre;
`;

const CardMeta = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
`;

const IconBox = styled.div`
  width: 26px;
  align-self: stretch;
  background: ${(p) => (p.$accent ? '#f77c11' : '#fb694c')};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  flex-shrink: 0;
  position: relative;
`;
