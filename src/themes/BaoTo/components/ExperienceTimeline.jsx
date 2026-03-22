import React from 'react';
import styled, { keyframes } from 'styled-components';

const COLORS = {
  text: '#2a2520',
  text80: 'rgba(42, 37, 32, 0.80)',
  text65: 'rgba(42, 37, 32, 0.65)',
  text35: 'rgba(42, 37, 32, 0.35)',
  text15: 'rgba(42, 37, 32, 0.15)',
  text08: 'rgba(42, 37, 32, 0.08)',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Item = styled.div`
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${COLORS.text08};
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => p.$i * 0.08}s;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const DateCol = styled.div`
  flex-shrink: 0;
  width: 80px;
  padding-top: 2px;

  @media (min-width: 768px) {
    width: 100px;
  }
`;

const DateText = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: ${COLORS.text35};
  letter-spacing: 0.02em;
`;

const ContentCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const Position = styled.h3`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.text80};
  margin: 0 0 2px;
`;

const Company = styled.p`
  font-size: 12px;
  color: ${COLORS.text65};
  margin: 0 0 8px;
`;

const Highlights = styled.ul`
  margin: 0;
  padding-left: 14px;
  list-style: none;

  li {
    font-size: 12px;
    line-height: 1.6;
    color: ${COLORS.text65};
    margin-bottom: 3px;
    position: relative;
    padding-left: 0;

    &::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 8px;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: ${COLORS.text15};
    }
  }
`;

function formatDate(d) {
  if (!d) return '';
  if (String(d).toLowerCase().trim() === 'present') return 'Present';
  return d;
}

export function ExperienceTimeline({ item, index }) {
  const start = formatDate(item.startDate || item.start_date);
  const end = formatDate(item.endDate || item.end_date);

  return (
    <Item $i={index}>
      <DateCol>
        <DateText>{start}{end ? ` — ${end}` : ''}</DateText>
      </DateCol>
      <ContentCol>
        <Position>{item.position || item.title}</Position>
        <Company>{item.company}{item.location ? `, ${item.location}` : ''}</Company>
        {item.highlights?.length > 0 && (
          <Highlights>
            {item.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </Highlights>
        )}
      </ContentCol>
    </Item>
  );
}
