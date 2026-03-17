import styled, { keyframes } from 'styled-components';
import { FONT } from '../utils/tokens';

export const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
`;

export const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const FadeIn = styled.div`
  opacity: 0;
  animation: ${fadeSlideUp} 1.2s forwards;
  animation-delay: ${p => p.$delay || 0}ms;
`;

export const SectionHeader = styled.div`
  padding-top: 32px;
  border-top: 1px dotted ${p => p.$theme.border};
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

export const Label = styled.h2`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${p => p.$theme.muted};
`;

export const BlinkCursor = styled.span`
  display: inline-block;
  width: 7px;
  height: 11px;
  border-radius: 1px;
  background: ${p => p.$theme.muted};
  animation: ${blink} 1s step-end infinite;
`;

export const DottedFill = styled.span`
  flex: 1;
  height: 0;
  margin: 0 12px;
  border-bottom: 1px dotted ${p => p.$theme.border};
  min-width: 16px;
`;
