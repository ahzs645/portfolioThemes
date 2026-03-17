import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { trimText, formatYear } from '../utils/helpers';
import { filterActive } from '../../../utils/cvHelpers';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor } from './SectionShared';

export default function Awards({ cv, theme, baseDelay = 740 }) {
  const awards = filterActive(cv.awards || []).slice(0, 5);

  if (awards.length === 0) return null;

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Awards</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List>
        {awards.map((award, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <FadeIn key={i} $delay={baseDelay + 50 + i * 50}>
              <Entry $theme={theme}>
                <EntryNum $theme={theme}>{num}</EntryNum>
                <EntryContent>
                  <EntryHeader>
                    <EntryTitle $theme={theme}>
                      {award.name || 'Award'}
                    </EntryTitle>
                    {award.date && (
                      <DateBadge $theme={theme}>
                        {formatYear(award.date)}
                      </DateBadge>
                    )}
                  </EntryHeader>
                  {award.summary && (
                    <EntryBody $theme={theme}>
                      {trimText(award.summary, 100)}
                    </EntryBody>
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

const EntryBody = styled.p`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 22px;
  color: ${p => p.$theme.body};
  margin: 0;
`;
