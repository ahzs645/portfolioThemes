import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { getSocialDisplayName, getSocialUsername } from '../utils/helpers';

export default function Connect({ cv, theme }) {
  const links = [];

  if (cv.socialRaw) {
    for (const s of cv.socialRaw) {
      if (s.url) {
        links.push({
          label: getSocialDisplayName(s.network),
          username: getSocialUsername(s.url, s.network),
          href: s.url,
        });
      }
    }
  }

  if (cv.email) {
    links.push({
      label: 'Email',
      username: cv.email,
      href: `mailto:${cv.email}`,
    });
  }

  if (links.length === 0) return null;

  return (
    <Section id="as-connect">
      <Header>
        <Label $theme={theme}>Connect</Label>
      </Header>

      <List className="blur-hover-group">
        {links.map((link, i) => (
          <LinkRow
            key={i}
            className="blur-hover"
            $theme={theme}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkLabel $theme={theme}>{link.label}</LinkLabel>
            <LinkValue $theme={theme}>
              {link.username}
              <ArrowIcon $theme={theme}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ArrowIcon>
            </LinkValue>
          </LinkRow>
        ))}
      </List>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 0 0 12px;
`;

const Label = styled.h2`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${p => p.$theme.muted};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const LinkRow = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px dotted ${p => p.$theme.border};
  text-decoration: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      transform: translateX(2px);
    }
  }
`;

const LinkLabel = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
`;

const LinkValue = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 16px;
  color: ${p => p.$theme.muted};
`;

const ArrowIcon = styled.span`
  color: ${p => p.$theme.muted};
  opacity: 0;
  transform: translateX(-4px) translateY(2px);
  transition: opacity 0.15s ease, transform 0.15s ease;

  ${LinkRow}:hover & {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
`;
