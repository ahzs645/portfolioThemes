import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { ShuffleSectionLabel } from './Hero';

export default function Skills({ cv, theme }) {
  const skills = cv?.skills || [];
  const certifications = cv?.certifications || [];
  if (!skills.length && !certifications.length) return null;

  return (
    <Section id="about">
      <ListContainer>
        <ListTitle $theme={theme}>
          <ShuffleSectionLabel theme={theme}>skills & more</ShuffleSectionLabel>
        </ListTitle>
        <ListContent $theme={theme}>
          {skills.map((skill, i) => (
            <SkillRow key={i}>
              <Label>{skill.name || skill.category}:</Label>
              <Value>{(skill.keywords || skill.details || []).join(' \u22B9 ')}</Value>
            </SkillRow>
          ))}
          {certifications.length > 0 && (
            <SkillRow>
              <Label>CERTIFICATIONS:</Label>
              <Value>{certifications.map(c => c.name || c).join(' \u22B9 ')}</Value>
            </SkillRow>
          )}
        </ListContent>
      </ListContainer>
    </Section>
  );
}

const Section = styled.section``;

const ListContainer = styled.dl`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
  row-gap: 0.5rem;
  margin-bottom: 3rem;
  @media (min-width: 768px) { margin-bottom: 4rem; row-gap: 1rem; }
`;

const ListTitle = styled.dt`
  grid-column: span 12;
  border-top: 1px solid rgba(115, 115, 115, 0.1);
  padding: 16px 8px 0;
  @media (min-width: 768px) { grid-column: span 4; }
`;

const ListContent = styled.dd`
  grid-column: span 12;
  border-top: 1px solid rgba(115, 115, 115, 0.1);
  padding: 16px 8px 0;
  @media (min-width: 768px) { grid-column: span 8; }
`;

const SectionLabel = styled.h2`
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
`;

const SkillRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 15px;
`;

const Label = styled.span`
  font-weight: 500;
  text-transform: uppercase;
  font-size: 13px;
`;

const Value = styled.span`
  line-height: 1.6;
`;
