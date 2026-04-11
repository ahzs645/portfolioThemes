import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

function sizeClass(len) {
  if (len > 80) return { fontSize: 14 };
  if (len > 40) return { fontSize: 20 };
  if (len > 20) return { fontSize: 28 };
  return { fontSize: 36 };
}

export function LiveFeed({ items, onSelect }) {
  const list = useMemo(() => items?.filter(Boolean).slice(0, 20) || [], [items]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    if (list.length < 2) return;
    const tick = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIndex((i) => (i + 1) % list.length);
        setPhase('in');
      }, 500);
    }, 3000);
    return () => clearInterval(tick);
  }, [list.length]);

  if (list.length === 0) return null;
  const current = list[index];

  return (
    <Wrap
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(current);
      }}
    >
      <Header>
        <Label>
          LIVE_FEED::<strong>{current.category}</strong>
        </Label>
        <Date>{current.date}</Date>
      </Header>
      <TitleWrap>
        <Title style={sizeClass(current.title.length)} $phase={phase}>
          {current.title}
        </Title>
      </TitleWrap>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: var(--u11g-surface);
  color: var(--u11g-primary);
  cursor: pointer;
  overflow: hidden;
  user-select: none;

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--u11g-passive);
  padding-bottom: 8px;
`;

const Label = styled.span`
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--u11g-secondary);

  strong {
    color: var(--u11g-primary);
    font-weight: 600;
  }
`;

const Date = styled.span`
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--u11g-secondary);
`;

const TitleWrap = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const Title = styled.div`
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--u11g-primary);
  font-weight: 400;
  transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
  transform: ${(p) => (p.$phase === 'out' ? 'translateX(-100%)' : 'translateX(0)')};
  opacity: ${(p) => (p.$phase === 'out' ? 0 : 1)};
  word-break: break-word;

  @media (min-width: 768px) {
    font-size: 40px;
  }
`;
