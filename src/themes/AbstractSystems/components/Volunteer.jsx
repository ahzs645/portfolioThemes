import React from 'react';
import styled from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { getTimelineExperience, formatRange } from '../utils/helpers';
import { FadeIn, SectionHeader, LabelRow, Label, BlinkCursor, DottedFill } from './SectionShared';

export default function Volunteer({ cv, theme, baseDelay = 860 }) {
  const entries = getTimelineExperience(cv.sectionsRaw?.volunteer || []);

  if (entries.length === 0) return null;

  let idx = 0;

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Volunteer</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List className="blur-hover-group">
        {entries.map((entry, i) => {
          if (entry.type === 'company') idx++;
          const delay = baseDelay + 50 + idx * 50;

          if (entry.type === 'sub') {
            return (
              <SubRow key={i} className="blur-hover" $theme={theme}>
                <TimelineCol>
                  <TimelineLine $theme={theme} $half={entry.isLast ? 'top' : 'full'} />
                  <TimelineDot $theme={theme} />
                </TimelineCol>
                <SubContent>
                  <SubTitle $theme={theme}>{entry.title}</SubTitle>
                  <DottedFill $theme={theme} />
                  <DateText $theme={theme}>
                    {formatRange(entry.startDate, entry.endDate)}
                  </DateText>
                </SubContent>
              </SubRow>
            );
          }

          return (
            <FadeIn key={i} $delay={delay}>
              <EntryRow className="blur-hover" $theme={theme}>
                <TimelineCol>
                  <InitialBadge $theme={theme}>
                    {(entry.company || '?')[0].toUpperCase()}
                  </InitialBadge>
                  {entry.hasChildren && <TimelineLine $theme={theme} $half="bottom" />}
                </TimelineCol>
                <EntryContent>
                  <OrgName $theme={theme}>{entry.company}</OrgName>
                  <InlineDetail>
                    <RoleText $theme={theme}>{entry.title}</RoleText>
                    <DottedFill $theme={theme} />
                    <DateText $theme={theme}>
                      {formatRange(entry.startDate, entry.endDate)}
                    </DateText>
                  </InlineDetail>
                </EntryContent>
              </EntryRow>
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

const TimelineCol = styled.div`
  width: 17px;
  position: relative;
  flex-shrink: 0;
  display: var(--initial-display, flex);
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
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 50%;
  width: 1px;
  background: ${p => p.$theme.borderLight};
  transform: translateX(-0.5px);
  ${p => {
    if (p.$half === 'top') return 'top: 0; height: 50%;';
    if (p.$half === 'bottom') return 'top: 50%; bottom: 0;';
    return 'top: 0; bottom: 0;';
  }}
`;

const TimelineDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${p => p.$theme.border};
  position: relative;
  z-index: 1;
`;

const EntryRow = styled.div`
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
  padding-left: 8px;

  @media (min-width: ${BREAKPOINT}px) {
    flex-direction: row;
    align-items: center;
    padding: 0;
    height: 36px;
  }
`;

const OrgName = styled.span`
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

const RoleText = styled.span`
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

const SubRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 36px;
  cursor: default;
  transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
              transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);

  @media (hover: hover) {
    &:hover { transform: translateX(2px); }
  }
`;

const SubContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding-left: 8px;
`;

const SubTitle = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$theme.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;
