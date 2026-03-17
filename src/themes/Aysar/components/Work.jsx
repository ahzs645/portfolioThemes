import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BREAKPOINT, FONT } from '../utils/tokens';
import BadgeCard from './BadgeCard';
import { buildProjectCards, buildTrajectory } from '../utils/helpers';

export default function Work({ cv, theme }) {
  const cards = useMemo(() => buildProjectCards(cv), [cv]);
  const timeline = useMemo(() => buildTrajectory(cv), [cv]);

  if (cards.length === 0 && timeline.length === 0) return null;

  return (
    <Section id="work">
      {/* Projects badge card */}
      {cards.length > 0 && (
        <BadgeCard theme={theme}>
          <SectionLabel $theme={theme}>Work</SectionLabel>
          <SectionHeading $theme={theme}>Selected projects</SectionHeading>
          <CardList>
            {cards.map(card => (
              <ProjectItem
                key={card.id}
                $theme={theme}
                as={card.href ? 'a' : 'div'}
                href={card.href || undefined}
                target={card.href ? '_blank' : undefined}
                rel={card.href ? 'noreferrer' : undefined}
              >
                <ProjectMeta>
                  <ProjectLabel $theme={theme}>{card.meta}</ProjectLabel>
                  {card.href && <ProjectArrow $theme={theme}>↗</ProjectArrow>}
                </ProjectMeta>
                <ProjectTitle $theme={theme}>{card.title}</ProjectTitle>
                <ProjectBody $theme={theme}>{card.body}</ProjectBody>
                <ProjectDetail $theme={theme}>{card.detail}</ProjectDetail>
              </ProjectItem>
            ))}
          </CardList>
        </BadgeCard>
      )}

      {/* Experience badge card */}
      {timeline.length > 0 && (
        <BadgeCard theme={theme}>
          <SectionLabel $theme={theme}>Experience</SectionLabel>
          <SectionHeading $theme={theme}>Career trajectory</SectionHeading>
          <CardList>
            {timeline.map(item => (
              <TimelineItem key={item.id} $theme={theme}>
                <TimelineDate $theme={theme}>{item.eyebrow}</TimelineDate>
                <TimelineRole $theme={theme}>{item.title}</TimelineRole>
                <TimelineCompany $theme={theme}>{item.label}</TimelineCompany>
                <TimelineDesc $theme={theme}>{item.summary}</TimelineDesc>
              </TimelineItem>
            ))}
          </CardList>
        </BadgeCard>
      )}
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 20px 0 60px;
`;

const SectionLabel = styled.div`
  color: ${p => p.$theme.accent};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const SectionHeading = styled.h2`
  margin: 0 0 20px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(24px, 5vw, 34px);
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 110%;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

/* ── Project items ── */

const ProjectItem = styled.div`
  padding: 22px 24px;
  border-radius: 24px;
  background: ${p => p.$theme.formBg};
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.$theme.border};
  }
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ProjectLabel = styled.div`
  color: ${p => p.$theme.accent};
  font-family: ${FONT.family};
  font-size: 12px;
  font-weight: ${FONT.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const ProjectArrow = styled.span`
  color: ${p => p.$theme.textSecondary};
  font-size: 16px;
`;

const ProjectTitle = styled.h3`
  margin: 0 0 6px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 20px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 110%;
`;

const ProjectBody = styled.p`
  margin: 0;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.55;
`;

const ProjectDetail = styled.div`
  margin-top: 12px;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

/* ── Timeline items ── */

const TimelineItem = styled.div`
  padding: 22px 24px;
  border-radius: 24px;
  background: ${p => p.$theme.formBg};
`;

const TimelineDate = styled.div`
  color: ${p => p.$theme.accent};
  font-family: ${FONT.family};
  font-size: 12px;
  font-weight: ${FONT.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const TimelineRole = styled.h3`
  margin: 0 0 4px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 20px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 110%;
`;

const TimelineCompany = styled.div`
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  margin-bottom: 8px;
`;

const TimelineDesc = styled.p`
  margin: 0;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.55;
`;
