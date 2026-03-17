import React from 'react';
import styled, { keyframes } from 'styled-components';
import { BREAKPOINT } from '../utils/tokens';

/**
 * Reusable badge card wrapper — the rounded outer shell with
 * optional lanyard clip, punch hole, and white inner content area.
 */
export default function BadgeCard({ theme, children, lanyard = false, animate = false }) {
  const Outer = animate ? AnimatedContainer : Container;

  return (
    <Outer>
      {lanyard && (
        <LanyardClip $animate={animate}>
          <LanyardStrap $theme={theme} />
          <ClipBody />
          <ClipMechanism />
        </LanyardClip>
      )}
      <Card $theme={theme} $lanyard={lanyard}>
        <Hole $theme={theme} />
        <Content $theme={theme}>
          {children}
        </Content>
      </Card>
    </Outer>
  );
}

/* ── Keyframes ── */

const badgeFall = keyframes`
  from {
    opacity: 0.001;
    transform: rotate(14deg) rotateX(43deg) rotateY(28deg) translateY(-360px);
  }
  to {
    opacity: 1;
    transform: rotate(0) rotateX(0) rotateY(0) translateY(0);
  }
`;

const clipSettle = keyframes`
  from { transform: translateX(-50%) rotate(-17deg) translate(-25px, 4px); }
  to   { transform: translateX(-50%) rotate(0) translate(0, 0); }
`;

/* ── Styled ── */

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 550px;
`;

const AnimatedContainer = styled(Container)`
  animation: ${badgeFall} 1.5s cubic-bezier(0.68, 0, 0.31, 0.91) both;
`;

const LanyardClip = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 63px;
  animation: ${p => p.$animate ? clipSettle : 'none'} 1.5s cubic-bezier(0.68, 0, 0.31, 0.91) both;

  @media (max-width: ${BREAKPOINT}px) {
    width: 54px;
  }
`;

const LanyardStrap = styled.div`
  width: 53px;
  height: 70px;
  background: ${p => p.$theme.accent};

  @media (max-width: ${BREAKPOINT}px) {
    width: 46px;
    height: 50px;
  }
`;

const ClipBody = styled.div`
  width: 63px;
  height: 44px;
  background: rgb(23, 23, 23);
  border-radius: 6px;

  @media (max-width: ${BREAKPOINT}px) {
    width: 54px;
    height: 37px;
  }
`;

const ClipMechanism = styled.div`
  width: 31px;
  height: 26px;
  background: linear-gradient(180deg, rgba(7,7,7,1) 0%, rgba(45,45,45,1) 100%);
  border-radius: 4px 4px 4px 0px;
  align-self: flex-start;
  margin-left: 16px;

  @media (max-width: ${BREAKPOINT}px) {
    width: 24px;
    height: 17px;
    margin-left: 15px;
  }
`;

const Card = styled.div`
  position: relative;
  margin-top: ${p => p.$lanyard ? '100px' : '0'};
  background: ${p => p.$theme.formBg};
  border: 1px solid ${p => p.$theme.border};
  border-radius: 46px;
  padding: 12px 9px 22px 9px;

  @media (max-width: ${BREAKPOINT}px) {
    margin-top: ${p => p.$lanyard ? '70px' : '0'};
    border-radius: 36px;
  }
`;

const Hole = styled.div`
  width: 63px;
  height: 19px;
  background: ${p => p.$theme.background};
  border: 1px solid ${p => p.$theme.border};
  border-radius: 46px;
  margin: 0 auto 12px;
`;

const Content = styled.div`
  background: ${p => p.$theme.cardBg};
  border-radius: 36px;
  box-shadow: 0 7px 26.5px rgba(0, 0, 0, 0.03);
  padding: 30px 40px 40px;

  @media (max-width: ${BREAKPOINT}px) {
    padding: 20px 24px 30px;
  }
`;
