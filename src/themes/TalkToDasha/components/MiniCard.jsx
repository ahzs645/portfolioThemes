import React from 'react';
import styled from 'styled-components';
import { palette } from '../styles';

export function MiniGrid({ children }) {
  return <Grid>{children}</Grid>;
}

export function MiniCard({ eyebrow, title, body, href, rotate = 0 }) {
  return (
    <Card $rotate={rotate}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && <Title>{title}</Title>}
      {body && <Body>{body}</Body>}
      {href && (
        <Link href={href} target="_blank" rel="noreferrer">
          visit ↗
        </Link>
      )}
    </Card>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${palette.white};
  border-radius: 14px;
  padding: 22px 20px;
  text-align: left;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: rotate(${(p) => p.$rotate || 0}deg);
  transition: transform 180ms ease;

  &:hover {
    transform: rotate(0deg) translateY(-2px);
  }
`;

const Eyebrow = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${palette.text};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${palette.textDark};
  margin: 0 0 6px;
`;

const Body = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${palette.text};
  margin: 0 0 10px;
`;

const Link = styled.a`
  font-size: 13px;
  font-weight: 500;
  color: ${palette.textDark};
  text-decoration: underline;
  text-underline-offset: 3px;
`;
