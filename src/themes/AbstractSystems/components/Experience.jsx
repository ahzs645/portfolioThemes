import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { getTimelineExperience, formatRange } from '../utils/helpers';

export default function Experience({ cv, theme, baseDelay = 340 }) {
  const entries = getTimelineExperience(cv.experience || []);

  if (entries.length === 0) return null;

  let companyIndex = 0;

  return (
    <Section id="as-experience">
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Experience</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <List className="blur-hover-group">
        {entries.map((entry, i) => {
          if (entry.type === 'company') companyIndex++;
          const delay = baseDelay + 50 + companyIndex * 50;

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
              <CompanyRow className="blur-hover" $theme={theme}>
                <TimelineCol>
                  <InitialBadge $theme={theme}>
                    {(entry.company || '?')[0].toUpperCase()}
                  </InitialBadge>
                  {entry.hasChildren && (
                    <TimelineLine $theme={theme} $half="bottom" />
                  )}
                </TimelineCol>
                <CompanyContent>
                  <CompanyName $theme={theme}>{entry.company}</CompanyName>
                  <InlineDetail>
                    <RoleText $theme={theme}>{entry.title}</RoleText>
                    <DottedFill $theme={theme} />
                    <DateText $theme={theme}>
                      {formatRange(entry.startDate, entry.endDate)}
                    </DateText>
                  </InlineDetail>
                </CompanyContent>
              </CompanyRow>
            </FadeIn>
          );
        })}
      </List>
    </Section>
  );
}

/* ── Animations ───────────────────────────────────────── */

const fadeSlideUp = keyframes`
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

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const FadeIn = styled.div`
  opacity: 0;
  animation: ${fadeSlideUp} 1.2s forwards;
  animation-delay: ${p => p.$delay || 0}ms;
`;

/* ── Layout ───────────────────────────────────────────── */

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  padding-top: 32px;
  border-top: 1px dotted ${p => p.$theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
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

const BlinkCursor = styled.span`
  display: inline-block;
  width: 7px;
  height: 11px;
  border-radius: 1px;
  background: ${p => p.$theme.muted};
  animation: ${blink} 1s step-end infinite;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

/* ── Timeline column ──────────────────────────────────── */

const TimelineCol = styled.div`
  width: 17px;
  position: relative;
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

/* ── Company row ──────────────────────────────────────── */

const CompanyRow = styled.div`
  display: flex;
  cursor: default;
  transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
              transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
  min-height: 36px;

  @media (hover: hover) {
    &:hover {
      transform: translateX(2px);
    }
  }
`;

const CompanyContent = styled.div`
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

const CompanyName = styled.span`
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

const RoleText = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
  padding-left: 0;

  @media (min-width: ${BREAKPOINT}px) {
    padding-left: 8px;
  }
`;

const DottedFill = styled.span`
  flex: 1;
  height: 0;
  margin: 0 12px;
  border-bottom: 1px dotted ${p => p.$theme.border};
  min-width: 16px;
`;

const DateText = styled.span`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$theme.muted};
  white-space: nowrap;
  flex-shrink: 0;
`;

/* ── Sub-position row ─────────────────────────────────── */

const SubRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 36px;
  cursor: default;
  transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
              transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);

  @media (hover: hover) {
    &:hover {
      transform: translateX(2px);
    }
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
  flex-shrink: 0;
`;
