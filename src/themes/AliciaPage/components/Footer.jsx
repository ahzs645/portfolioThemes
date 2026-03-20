import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';

export default function Footer({ cv, theme }) {
  const email = cv?.email || '';

  return (
    <FooterBar $theme={theme}>
      <FooterInner>
        <FooterLeft>
          <FooterLine $theme={theme}>
            Powered by CV.yaml & React
          </FooterLine>
        </FooterLeft>
        <FooterRight>
          <Decorative $theme={theme}>{'\u22B9 \u0A3A \u02D6'}</Decorative>
          {email && (
            <EmailLink href={`mailto:${email}`} $theme={theme}>
              <SendIcon viewBox="0 0 24 24">
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939" />
              </SendIcon>
              {email}
            </EmailLink>
          )}
        </FooterRight>
      </FooterInner>
    </FooterBar>
  );
}

const FooterBar = styled.footer`
  background: ${p => p.$theme.footerBg};
  color: ${p => p.$theme.footerText};
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: auto;
`;

const FooterInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 948px;
  width: 100%;
  padding: 24px 8px;
  @media (min-width: 768px) { padding: 24px 12px; }
`;

const FooterLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterLine = styled.div`
  font-size: 12px;
  color: ${p => p.$theme.footerMuted};
`;

const FooterRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const Decorative = styled.div`
  font-size: 12px;
  color: ${p => p.$theme.footerMuted};
  user-select: none;
`;

const EmailLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${p => p.$theme.footerText};
  text-decoration: none;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: currentColor;
    transform: scaleX(0);
    transform-origin: 100% 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &:hover::after {
    transform: scaleX(1);
    transform-origin: 0 100%;
  }
`;

const SendIcon = styled.svg`
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
`;
