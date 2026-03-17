import React from 'react';
import styled from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { formatYear } from '../utils/helpers';
import { filterActive } from '../../../utils/cvHelpers';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor, DottedFill } from './SectionShared';

export default function Presentations({ cv, theme, baseDelay = 1020 }) {
  const items = filterActive(cv.presentations || []);

  if (items.length === 0) return null;

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Presentations</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List className="blur-hover-group">
        {items.map((item, i) => (
          <FadeIn key={i} $delay={baseDelay + 50 + i * 50}>
            <Entry className="blur-hover" $theme={theme}>
              <EntryContent>
                <EntryName $theme={theme}>{item.name}</EntryName>
                <InlineDetail>
                  <Venue $theme={theme}>
                    {[item.summary, item.location].filter(Boolean).join(' · ')}
                  </Venue>
                  <DottedFill $theme={theme} />
                  <DateText $theme={theme}>
                    {formatYear(item.date)}
                  </DateText>
                </InlineDetail>
              </EntryContent>
            </Entry>
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

const Entry = styled.div`
  display: flex;
  cursor: default;
  min-height: 36px;
  transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
              transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);

  @media (hover: hover) {
    &:hover { transform: translateX(2px); }
  }
`;

const EntryContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  min-width: 0;
  flex: 1;

  @media (min-width: ${BREAKPOINT}px) {
    flex-direction: row;
    align-items: center;
    padding: 0;
    height: 36px;
  }
`;

const EntryName = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const InlineDetail = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
`;

const Venue = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$theme.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  padding-left: 0;

  @media (min-width: ${BREAKPOINT}px) {
    padding-left: 8px;
  }
`;

const DateText = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$theme.muted};
  white-space: nowrap;
  flex-shrink: 0;
`;
