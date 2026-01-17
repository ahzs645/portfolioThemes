import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 6rem 2rem;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #06b6d4;
  margin-bottom: 3rem;
`;

const EducationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const EducationCard = styled.div`
  padding: 1.5rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #3f3f46;
  }
`;

const Institution = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const Degree = styled.p`
  font-size: 1rem;
  color: #db2777;
  margin-bottom: 0.5rem;
`;

const DateRange = styled.span`
  font-size: 0.875rem;
  color: #71717a;
`;

const Description = styled.p`
  margin-top: 1rem;
  color: #a1a1aa;
  line-height: 1.6;
  font-size: 0.9rem;
`;

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (String(dateStr).toLowerCase() === 'present') return 'Present';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Education({ education = [] }) {
  const filteredEducation = education.filter(e => !isArchived(e));

  if (filteredEducation.length === 0) {
    return null;
  }

  return (
    <Section id="education">
      <SectionTitle>Education</SectionTitle>
      <EducationList>
        {filteredEducation.map((edu, index) => (
          <EducationCard key={index}>
            <Institution>{edu.institution || edu.school || edu.university}</Institution>
            <Degree>
              {edu.degree || edu.studyType}
              {edu.area || edu.field ? ` in ${edu.area || edu.field}` : ''}
            </Degree>
            <DateRange>
              {formatDate(edu.startDate)} — {formatDate(edu.endDate) || 'Present'}
            </DateRange>
            {(edu.description || edu.summary) && (
              <Description>{edu.description || edu.summary}</Description>
            )}
          </EducationCard>
        ))}
      </EducationList>
    </Section>
  );
}
