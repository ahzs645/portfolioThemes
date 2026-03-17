import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { getSocialDisplayName, getSocialUsername } from '../utils/helpers';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor, DottedFill } from './SectionShared';

export default function Connect({ cv, theme, baseDelay = 840 }) {
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
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Connect</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List className="blur-hover-group">
        {links.map((link, i) => (
          <FadeIn key={i} $delay={baseDelay + 50 + i * 40}>
            <LinkRow
              className="blur-hover"
              $theme={theme}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkLabel $theme={theme}>{link.label}</LinkLabel>
              <DottedFill $theme={theme} />
              <LinkValue $theme={theme}>
                {link.username}
                <ArrowIcon $theme={theme}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </ArrowIcon>
              </LinkValue>
            </LinkRow>
          </FadeIn>
        ))}
      </List>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const LinkRow = styled.a`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-top: 1px dotted ${p => p.$theme.border};
  text-decoration: none;
  transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
              transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
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
  flex-shrink: 0;
`;

const LinkValue = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 16px;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
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
