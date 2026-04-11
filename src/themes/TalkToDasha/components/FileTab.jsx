import React from 'react';
import styled from 'styled-components';
import { palette, FILE_TAB_PATH, FILE_TAB_VIEWBOX } from '../styles';

export function FileTabStack({ children }) {
  return <Stack>{children}</Stack>;
}

export function FileTab({ label, sub, index = 0, total = 1 }) {
  const isLast = index === total - 1;
  return (
    <TabWrap $index={index} $isLast={isLast}>
      <Shape
        viewBox={FILE_TAB_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`ftsh-${index}`} x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>
        <path d={FILE_TAB_PATH} fill={palette.white} filter={`url(#ftsh-${index})`} />
      </Shape>
      <Content>
        <Title>{label}</Title>
        {sub && isLast && <Sub>{sub}</Sub>}
      </Content>
    </TabWrap>
  );
}

const Stack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const TabWrap = styled.div`
  position: relative;
  aspect-ratio: ${(p) => (p.$isLast ? '230 / 120' : '230 / 46')};
  margin-top: ${(p) => (p.$index === 0 ? '0' : '-4px')};
  z-index: ${(p) => 10 + p.$index};
`;

const Shape = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  padding: 14% 18% 8% 10%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${palette.textDark};
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sub = styled.div`
  font-size: 12px;
  color: ${palette.text};
  margin-top: 6px;
  line-height: 1.4;
`;
