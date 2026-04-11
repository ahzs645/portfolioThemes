import React, { useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { palette, FILE_TAB_PATH, FILE_TAB_VIEWBOX } from '../styles';

export function FileTabStack({ children }) {
  return <Stack>{children}</Stack>;
}

export function FileTab({ label, sub, index = 0, total = 1 }) {
  const [hovered, setHovered] = useState(false);
  const isLast = index === total - 1;

  return (
    <TabWrap
      $index={index}
      $isLast={isLast}
      $hovered={hovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={sub ? 0 : -1}
    >
      <Shape
        viewBox={FILE_TAB_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`ftsh-${index}`} x="-5%" y="-15%" width="110%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.08"
            />
          </filter>
        </defs>
        <path d={FILE_TAB_PATH} fill={palette.white} filter={`url(#ftsh-${index})`} />
      </Shape>

      <Content>
        <Title>{label}</Title>
      </Content>

      <AnimatePresence>
        {hovered && sub && (
          <Tooltip
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0.1, 1] }}
          >
            {sub}
          </Tooltip>
        )}
      </AnimatePresence>
    </TabWrap>
  );
}

const Stack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TabWrap = styled.div`
  position: relative;
  width: 100%;
  height: 52px;
  margin-top: ${(p) => (p.$index === 0 ? '0' : '-6px')};
  z-index: ${(p) => (p.$hovered ? 100 : 10 + p.$index)};
  outline: none;
  transition: transform 220ms cubic-bezier(0.2, 0, 0.1, 1);
  transform: ${(p) => (p.$hovered ? 'translateY(-2px)' : 'translateY(0)')};
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
  padding: 18px 18% 0 16px;
  display: flex;
  align-items: flex-start;
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

const Tooltip = styled(motion.div)`
  position: absolute;
  top: 4px;
  left: 50%;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 1000px;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
  pointer-events: none;
  z-index: 1000;
  transform: translateX(-50%);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
