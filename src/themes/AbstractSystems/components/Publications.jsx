import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { formatYear } from '../utils/helpers';
import { filterActive } from '../../../utils/cvHelpers';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor } from './SectionShared';

export default function Publications({ cv, theme, baseDelay = 940 }) {
  const pubs = filterActive(cv.publications || []);

  if (pubs.length === 0) return null;

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Publications</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List>
        {pubs.map((pub, i) => {
          const num = String(i + 1).padStart(2, '0');
          const doiUrl = pub.doi
            ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`)
            : null;

          return (
            <FadeIn key={i} $delay={baseDelay + 50 + i * 50}>
              <Entry $theme={theme}>
                <EntryNum $theme={theme}>{num}</EntryNum>
                <EntryContent>
                  <EntryHeader>
                    <EntryTitle
                      $theme={theme}
                      as={doiUrl ? 'a' : 'span'}
                      href={doiUrl || undefined}
                      target={doiUrl ? '_blank' : undefined}
                      rel={doiUrl ? 'noopener noreferrer' : undefined}
                    >
                      {pub.title || 'Publication'}
                      {doiUrl && <Arrow $theme={theme}> ↗</Arrow>}
                    </EntryTitle>
                    {pub.date && (
                      <DateBadge $theme={theme}>
                        {formatYear(pub.date)}
                      </DateBadge>
                    )}
                  </EntryHeader>
                  {pub.journal && (
                    <Journal $theme={theme}>{pub.journal}</Journal>
                  )}
                  {Array.isArray(pub.authors) && pub.authors.length > 0 && (
                    <Authors $theme={theme}>
                      {pub.authors.join(', ')}
                    </Authors>
                  )}
                </EntryContent>
              </Entry>
            </FadeIn>
          );
        })}
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

const Entry = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px dotted ${p => p.$theme.border};
`;

const EntryNum = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  line-height: 20px;
  letter-spacing: 0.02em;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
  padding-top: 1px;
`;

const EntryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const EntryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const EntryTitle = styled.span`
  font-family: ${FONT.sans};
  font-size: 15px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${p => p.$theme.body};
  }
`;

const Arrow = styled.span`
  font-size: 12px;
  color: ${p => p.$theme.muted};
`;

const DateBadge = styled.span`
  font-family: ${FONT.mono};
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${p => p.$theme.blue}1a;
  color: ${p => p.$theme.blue};
  border: 1px solid ${p => p.$theme.blue}4d;
`;

const Journal = styled.span`
  font-family: ${FONT.sans};
  font-size: 13px;
  line-height: 18px;
  font-style: italic;
  color: ${p => p.$theme.body};
`;

const Authors = styled.p`
  font-family: ${FONT.sans};
  font-size: 12px;
  line-height: 18px;
  color: ${p => p.$theme.muted};
  margin: 0;
`;
