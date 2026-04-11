import React from 'react';
import styled from 'styled-components';
import { palette } from '../styles';

export function CurrentStatus({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <Wrap>
      <LiveBadge>
        <Dot /> Currently
      </LiveBadge>
      <List>
        {jobs.slice(0, 2).map((job, i) => (
          <Line key={i}>
            <strong>{job.title}</strong>
            <span> @ {job.company}</span>
          </Line>
        ))}
      </List>
    </Wrap>
  );
}

const Wrap = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${palette.liveBg};
  color: ${palette.live};
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 1000px;
  text-transform: lowercase;
  letter-spacing: 0.02em;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${palette.live};
  animation: pulse 1.6s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Line = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${palette.textDark};
  margin: 0;

  strong { font-weight: 500; }
  span { color: ${palette.text}; }
`;
