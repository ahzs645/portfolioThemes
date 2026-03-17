import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BREAKPOINT, FONT } from '../utils/tokens';
import { buildProjectCards, buildTrajectory } from '../utils/helpers';

export default function Work({ cv, theme }) {
  const cards = useMemo(() => buildProjectCards(cv), [cv]);
  const timeline = useMemo(() => buildTrajectory(cv), [cv]);

  if (cards.length === 0 && timeline.length === 0) return null;

  return (
    <Section id="work">
      {cards.length > 0 && (
        <>
          <SectionLabel $theme={theme}>Work</SectionLabel>
          <SectionHeading $theme={theme}>Selected projects</SectionHeading>
          <CardGrid>
            {cards.map(card => (
              <Card
                key={card.id}
                $theme={theme}
                as={card.href ? 'a' : 'div'}
                href={card.href || undefined}
                target={card.href ? '_blank' : undefined}
                rel={card.href ? 'noreferrer' : undefined}
              >
                <CardMeta $theme={theme}>{card.meta}</CardMeta>
                <CardTitle $theme={theme}>{card.title}</CardTitle>
                <CardBody $theme={theme}>{card.body}</CardBody>
                <CardFooter $theme={theme}>
                  {card.detail}
                  {card.href && <CardArrow>↗</CardArrow>}
                </CardFooter>
              </Card>
            ))}
          </CardGrid>
        </>
      )}

      {timeline.length > 0 && (
        <TimelineSection>
          <SectionLabel $theme={theme}>Experience</SectionLabel>
          <SectionHeading $theme={theme}>Career trajectory</SectionHeading>
          <TimelineList>
            {timeline.map(item => (
              <TimelineItem key={item.id} $theme={theme}>
                <TimelineDate $theme={theme}>{item.eyebrow}</TimelineDate>
                <TimelineRole $theme={theme}>{item.title}</TimelineRole>
                <TimelineCompany $theme={theme}>{item.label}</TimelineCompany>
                <TimelineDesc $theme={theme}>{item.summary}</TimelineDesc>
              </TimelineItem>
            ))}
          </TimelineList>
        </TimelineSection>
      )}
    </Section>
  );
}

const Section = styled.section`
  padding: 40px 0 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionLabel = styled.div`
  color: ${p => p.$theme.accent};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 10px;
`;

const SectionHeading = styled.h2`
  margin: 0 0 32px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: clamp(28px, 5vw, 42px);
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 110%;
  text-align: center;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  width: 100%;
  max-width: 700px;
  margin-bottom: 60px;

  @media (max-width: ${BREAKPOINT}px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: 26px;
  border-radius: 36px;
  background: ${p => p.$theme.cardBg};
  border: 1px solid ${p => p.$theme.border};
  text-decoration: none;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${p => p.$theme.text};
  }
`;

const CardMeta = styled.div`
  color: ${p => p.$theme.accent};
  font-family: ${FONT.family};
  font-size: 12px;
  font-weight: ${FONT.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 14px;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px;
  color: ${p => p.$theme.text};
  font-family: ${FONT.family};
  font-size: 22px;
  font-weight: ${FONT.bold};
  letter-spacing: -0.05em;
  line-height: 110%;
`;

const CardBody = styled.p`
  margin: 0;
  color: ${p => p.$theme.text};
  opacity: 0.6;
  font-family: ${FONT.family};
  font-size: 14px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
  line-height: 1.55;
  flex: 1;
`;

const CardFooter = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${p => p.$theme.textSecondary};
  font-family: ${FONT.family};
  font-size: 13px;
  font-weight: ${FONT.semibold};
  letter-spacing: -0.03em;
`;

const CardArrow = styled.span`
  color: inherit;
  font-size: 16px;
`;

const TimelineSection = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const TimelineItem = styled.div`
  padding: 24px 28px;
  border-radius: 32px;
  background: ${p => p.$theme.formBg};
  border: 1px solid ${p => p.$theme.border};
`;

const TimelineDate = styled.div`
  color: ${p => p.$theme.accent};
  font-family: ${FONT.family};
  font-size: 12px;
  font-weight: ${FONT.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
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
  margin-bottom: 10px;
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
