import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { formatRange } from '../utils/helpers';
import { filterActive } from '../../../utils/cvHelpers';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor, DottedFill } from './SectionShared';

export default function Education({ cv, theme, baseDelay = 560 }) {
  const items = filterActive(cv.education || []).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Education</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List className="blur-hover-group">
        {items.map((entry, i) => (
          <FadeIn key={i} $delay={baseDelay + 50 + i * 50}>
            <Entry className="blur-hover" $theme={theme}>
              <TimelineCol>
                <InitialBadge $theme={theme}>
                  {(entry.institution || '?')[0].toUpperCase()}
                </InitialBadge>
              </TimelineCol>
              <EntryContent>
                <Institution $theme={theme}>{entry.institution}</Institution>
                <InlineDetail>
                  <Degree $theme={theme}>
                    {[entry.degree, entry.area].filter(Boolean).join(' — ')}
                  </Degree>
                  <DottedFill $theme={theme} />
                  <DateText $theme={theme}>
                    {formatRange(entry.start_date, entry.end_date)}
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
    &:hover {
      transform: translateX(2px);
    }
  }
`;

const TimelineCol = styled.div`
  width: 17px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
`;

const InitialBadge = styled.div`
  width: 17px;
  height: 17px;
  border-radius: 4px;
  background: ${p => p.$theme.pillBg};
  border: 1px solid ${p => p.$theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${FONT.sans};
  font-size: 9px;
  font-weight: 600;
  color: ${p => p.$theme.heading};
  flex-shrink: 0;
`;

const EntryContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  min-width: 0;
  flex: 1;
  padding-left: 8px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    padding: 0;
    height: 36px;
  }
`;

const Institution = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  white-space: nowrap;
  flex-shrink: 0;
`;

const InlineDetail = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
`;

const Degree = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
  padding-left: 0;

  @media (min-width: 640px) {
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
