import React from 'react';
import styled from 'styled-components';
import { GraduationCap, Calendar, MapPin, Award, School, Trophy } from 'lucide-react';
import { Block, SectionGrid } from './Block';
import { formatMonthYear } from '../../../utils/cvHelpers';

export default function Education({ cv }) {
  const education = cv.education || [];
  if (!education.length) return null;

  return (
    <Section>
      <SectionGrid>
        {/* Header */}
        <Block style={{ gridColumn: 'span 12' }}>
          <GraduationCap size={28} color="#a1a1aa" style={{ marginBottom: 16 }} />
          <SectionTitle>
            Education.{' '}
            <Muted>Academic foundation in technology and science.</Muted>
          </SectionTitle>
        </Block>

        {/* Education cards */}
        {education.map((edu, i) => (
          <EduCard key={i} whileHover={{ rotate: '1.5deg', scale: 1.02 }}>
            <InstitutionRow>
              <School size={18} color="#71717a" />
              <InstitutionName>{edu.institution}</InstitutionName>
            </InstitutionRow>
            <Degree>{edu.area || edu.studyType || edu.degree}</Degree>
            {edu.studyType && edu.area && (
              <FieldText>{edu.studyType}</FieldText>
            )}
            <MetaRow>
              {edu.location && (
                <Meta>
                  <MapPin size={12} />
                  <span>{edu.location}</span>
                </Meta>
              )}
              <Meta>
                <Calendar size={12} />
                <span>
                  {formatMonthYear(edu.startDate || edu.start_date)} &ndash;{' '}
                  {formatMonthYear(edu.endDate || edu.end_date)}
                </span>
              </Meta>
            </MetaRow>
            {(edu.score || edu.gpa) && (
              <GradeRow>
                <Award size={12} color="#facc15" />
                <GradeText>{edu.score || edu.gpa}</GradeText>
              </GradeRow>
            )}
          </EduCard>
        ))}

        {/* Achievement */}
        <Block whileHover={{ rotate: '-2deg', scale: 1.03 }} style={{ gridColumn: 'span 12' }}>
          <AchievementCenter>
            <Trophy size={28} color="#a1a1aa" style={{ marginBottom: 12 }} />
            <AchievementTitle>Academic Excellence</AchievementTitle>
            <AchievementText>
              Consistently achieved high performance across multiple disciplines, building strong theoretical and practical foundations.
            </AchievementText>
          </AchievementCenter>
        </Block>
      </SectionGrid>
    </Section>
  );
}

const Section = styled.div`
  min-height: 100vh;
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

const EduCard = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const InstitutionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const InstitutionName = styled.span`
  font-size: 14px;
  color: #a1a1aa;
`;

const Degree = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
`;

const FieldText = styled.p`
  font-size: 14px;
  color: #c084fc;
  margin: 0 0 12px;
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

const GradeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const GradeText = styled.span`
  font-size: 12px;
  color: #facc15;
  font-weight: 500;
`;

const AchievementCenter = styled.div`
  display: grid;
  height: 100%;
  place-content: center;
  text-align: center;
`;

const AchievementTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
`;

const AchievementText = styled.p`
  font-size: 14px;
  color: #a1a1aa;
  margin: 0;
  max-width: 500px;
`;
