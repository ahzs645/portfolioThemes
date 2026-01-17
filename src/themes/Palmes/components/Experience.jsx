import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  min-height: 100vh;
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

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ExperienceCard = styled.div`
  position: relative;
  padding-left: 2rem;
  border-left: 2px solid #27272a;

  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 0;
    width: 10px;
    height: 10px;
    background: #06b6d4;
    border-radius: 50%;
  }
`;

const Company = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const Role = styled.p`
  font-size: 1rem;
  color: #db2777;
  margin-bottom: 0.5rem;
`;

const DateRange = styled.span`
  font-size: 0.875rem;
  color: #71717a;
`;

const Description = styled.div`
  margin-top: 1rem;
  color: #a1a1aa;
  line-height: 1.6;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;

    &::before {
      content: '▹';
      position: absolute;
      left: 0;
      color: #06b6d4;
    }
  }
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

export default function Experience({ experiences = [] }) {
  const filteredExperiences = experiences.filter(e => !isArchived(e));

  if (filteredExperiences.length === 0) {
    return null;
  }

  const flattenedExperiences = [];
  for (const exp of filteredExperiences) {
    if (Array.isArray(exp.positions) && exp.positions.length > 0) {
      for (const pos of exp.positions) {
        flattenedExperiences.push({
          company: exp.organization || exp.company,
          role: pos.title || pos.position,
          startDate: pos.startDate || exp.startDate,
          endDate: pos.endDate || exp.endDate,
          description: pos.description || pos.summary,
          highlights: pos.highlights || [],
        });
      }
    } else {
      flattenedExperiences.push({
        company: exp.organization || exp.company,
        role: exp.position || exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description || exp.summary,
        highlights: exp.highlights || [],
      });
    }
  }

  return (
    <Section id="experience">
      <SectionTitle>Experience</SectionTitle>
      <Timeline>
        {flattenedExperiences.map((exp, index) => (
          <ExperienceCard key={index}>
            <Company>{exp.company}</Company>
            <Role>{exp.role}</Role>
            <DateRange>
              {formatDate(exp.startDate)} — {formatDate(exp.endDate) || 'Present'}
            </DateRange>
            {(exp.description || exp.highlights.length > 0) && (
              <Description>
                {exp.description && <p>{exp.description}</p>}
                {exp.highlights.length > 0 && (
                  <ul>
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </Description>
            )}
          </ExperienceCard>
        ))}
      </Timeline>
    </Section>
  );
}
