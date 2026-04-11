import React from 'react';
import styled from 'styled-components';
import { palette, cards } from '../styles';

export function Hero({ name, title, location }) {
  const firstName = (name || '').split(' ')[0] || name;

  return (
    <Wrap>
      <Greeting>
        Hi, I am <span>{firstName}</span>.
      </Greeting>
      <Role>{title}</Role>
      {location && <Location>based in {location}</Location>}
    </Wrap>
  );
}

const Wrap = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 40px;
`;

const Greeting = styled.h1`
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 500;
  color: ${palette.textDark};
  margin: 0;
  line-height: 1.15;

  span {
    color: ${palette.textDark};
    text-decoration: underline;
    text-decoration-color: ${cards.terracotta.bg};
    text-decoration-thickness: 3px;
    text-underline-offset: 6px;
  }
`;

const Role = styled.p`
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 400;
  color: ${palette.text};
  margin: 0;
`;

const Location = styled.p`
  font-size: 16px;
  color: ${palette.text};
  margin: 4px 0 0;
  font-style: italic;
`;
