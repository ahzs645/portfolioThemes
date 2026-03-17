import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { getTimelineExperience, formatRange } from '../utils/helpers';

const DEFAULT_VISIBLE = 4; // company groups shown in collapsed mode

export default function Experience({ cv, theme, baseDelay = 340 }) {
  // Use raw experience data (not flattened) so getTimelineExperience can detect nested positions
  const entries = getTimelineExperience(cv.sectionsRaw?.experience || []);
  const [expanded, setExpanded] = useState(false);

  // Group entries by company so we can collapse by group
  const { groups, totalGroups } = useMemo(() => {
    const g = [];
    for (const entry of entries) {
      if (entry.type === 'company') {
        g.push({ company: entry, subs: [] });
      } else if (g.length > 0) {
        g[g.length - 1].subs.push(entry);
      }
    }
    return { groups: g, totalGroups: g.length };
  }, [entries]);

  if (groups.length === 0) return null;

  const canExpand = totalGroups > DEFAULT_VISIBLE;
  const visibleGroups = expanded ? groups : groups.slice(0, DEFAULT_VISIBLE);

  let companyIndex = 0;

  return (
    <Section id="as-experience">
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Experience</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
          {canExpand && (
            <ToggleButton onClick={() => setExpanded(v => !v)}>
              <ToggleLabel $theme={theme}>
                {expanded ? 'Less' : 'More'}
              </ToggleLabel>
              <Chevron $theme={theme} $expanded={expanded}>
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Chevron>
            </ToggleButton>
          )}
        </SectionHeader>
      </FadeIn>

      <List className="blur-hover-group">
        {visibleGroups.map((group, gi) => {
          companyIndex++;
          const delay = baseDelay + 50 + companyIndex * 50;
          const entry = group.company;

          return (
            <React.Fragment key={gi}>
              <FadeIn $delay={delay}>
                <CompanyRow className="blur-hover" $theme={theme}>
                  <TimelineCol>
                    <InitialBadge $theme={theme}>
                      {(entry.company || '?')[0].toUpperCase()}
                    </InitialBadge>
                    {group.subs.length > 0 && expanded && (
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

              {expanded && group.subs.map((sub, si) => (
                <ExpandedRow key={`${gi}-sub-${si}`}>
                  <SubRow className="blur-hover" $theme={theme}>
                    <TimelineCol>
                      <TimelineLine $theme={theme} $half={sub.isLast ? 'top' : 'full'} />
                      <TimelineDot $theme={theme} />
                    </TimelineCol>
                    <SubContent>
                      <SubTitle $theme={theme}>{sub.title}</SubTitle>
                      <DottedFill $theme={theme} />
                      <DateText $theme={theme}>
                        {formatRange(sub.startDate, sub.endDate)}
                      </DateText>
                    </SubContent>
                  </SubRow>
                </ExpandedRow>
              ))}
            </React.Fragment>
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

/* ── Toggle button ────────────────────────────────────── */

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
`;

const ToggleLabel = styled.span`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.02em;
  color: ${p => p.$theme.muted};
  transition: color 0.15s;

  ${ToggleButton}:hover & {
    color: ${p => p.$theme.body};
  }
`;

const Chevron = styled.svg.attrs({ width: 10, height: 10, viewBox: '0 0 10 10' })`
  color: ${p => p.$theme.muted};
  transform: ${p => p.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s, color 0.15s;

  ${ToggleButton}:hover & {
    color: ${p => p.$theme.body};
  }
`;

/* ── List ─────────────────────────────────────────────── */

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

/* ── Expanded row transition ──────────────────────────── */

const ExpandedRow = styled.div`
  animation: ${fadeSlideUp} 0.3s forwards;
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
