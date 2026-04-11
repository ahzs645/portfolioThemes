import React from 'react';
import styled from 'styled-components';
import { Briefcase, MapPin, Clock, CheckCircle2, Building2, ArrowUpRight } from 'lucide-react';
import { Block, SectionGrid } from './Block';
import { flattenExperience, formatMonthYear } from '../../../utils/cvHelpers';

export default function Experience({ cv }) {
  const positions = flattenExperience(cv.experience, { limit: 6 });

  if (!positions.length) return null;

  return (
    <Section id="fr-experience">
      <SectionGrid>
        {/* Header */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Briefcase size={28} color="#a1a1aa" style={{ marginBottom: 16 }} />
          <SectionTitle>
            Professional Experience.{' '}
            <Muted>Building real-world solutions and delivering value.</Muted>
          </SectionTitle>
        </Block>

        {/* Experience cards */}
        {positions.map((pos, i) => (
          <ExpCard key={i} whileHover={{ rotate: '1.5deg', scale: 1.02 }}>
            <CompanyRow>
              <Building2 size={18} color="#71717a" />
              <CompanyName>{pos.company}</CompanyName>
            </CompanyRow>
            <JobTitle>{pos.title}</JobTitle>
            <MetaRow>
              <Meta>
                <Clock size={12} />
                <span>
                  {formatMonthYear(pos.startDate)} &ndash;{' '}
                  {pos.isCurrent ? 'Present' : formatMonthYear(pos.endDate)}
                </span>
              </Meta>
            </MetaRow>
            {pos.highlights.length > 0 && (
              <Highlights>
                {pos.highlights.slice(0, 3).map((h, j) => (
                  <HighlightItem key={j}>
                    <CheckCircle2 size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{h}</span>
                  </HighlightItem>
                ))}
              </Highlights>
            )}
          </ExpCard>
        ))}

        {/* Summary */}
        <Block whileHover={{ rotate: '-2deg', scale: 1.03 }} style={{ gridColumn: 'span 12' }}>
          <SummaryCenter>
            <ArrowUpRight size={28} color="#a1a1aa" style={{ marginBottom: 12 }} />
            <SummaryTitle>Career Growth</SummaryTitle>
            <SummaryText>
              Continuously evolving and expanding technical expertise while building on strong communication and problem-solving foundations.
            </SummaryText>
          </SummaryCenter>
        </Block>
      </SectionGrid>
    </Section>
  );
}

const Section = styled.div`
  background: #18181b;
  padding: 48px 16px;
  color: #fafafa;
`;

const SectionTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 16px;
`;

const Muted = styled.span`
  color: #a1a1aa;
`;

const ExpCard = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const CompanyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const CompanyName = styled.span`
  font-size: 14px;
  color: #a1a1aa;
`;

const JobTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a1a1aa;
`;

const Highlights = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HighlightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #a1a1aa;
`;

const SummaryCenter = styled.div`
  display: grid;
  height: 100%;
  place-content: center;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
`;

const SummaryText = styled.p`
  font-size: 14px;
  color: #a1a1aa;
  margin: 0;
  max-width: 500px;
`;
