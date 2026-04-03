import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { ShuffleSectionLabel } from './Hero';

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (/present/i.test(String(dateStr))) return 'Present';
  return String(dateStr);
}

export default function Skills({ cv, theme }) {
  const skills = cv?.skills || [];
  const certifications = cv?.certifications || [];
  const certificationsSkills = cv?.certificationsSkills || [];
  const volunteer = cv?.volunteer || [];
  const awards = cv?.awards || [];
  const publications = cv?.publications || [];
  const presentations = cv?.presentations || [];
  const professionalDevelopment = cv?.professionalDevelopment || [];

  const hasSkillsContent = skills.length > 0 || certifications.length > 0 || certificationsSkills.length > 0;
  const hasContent = hasSkillsContent || volunteer.length > 0 || awards.length > 0 ||
    publications.length > 0 || presentations.length > 0 || professionalDevelopment.length > 0;

  if (!hasContent) return null;

  return (
    <Section id="about">
      {hasSkillsContent && (
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
            {certificationsSkills.map((item, i) => (
              <SkillRow key={`cs-${i}`}>
                <Label>{item.label}:</Label>
                <Value>{item.details}</Value>
              </SkillRow>
            ))}
          </ListContent>
        </ListContainer>
      )}

      {volunteer.length > 0 && (
        <ListContainer>
          <ListTitle $theme={theme}>
            <ShuffleSectionLabel theme={theme}>volunteer</ShuffleSectionLabel>
          </ListTitle>
          <ListContent $theme={theme}>
            {volunteer.map((v, i) => (
              <EntryBlock key={i}>
                <EntryTitle $theme={theme}>{v.position || v.title}</EntryTitle>
                <EntryMeta $theme={theme}>
                  {v.company || v.organization}
                  {v.startDate && <> &middot; {formatDate(v.startDate)} - {formatDate(v.endDate)}</>}
                </EntryMeta>
              </EntryBlock>
            ))}
          </ListContent>
        </ListContainer>
      )}

      {awards.length > 0 && (
        <ListContainer>
          <ListTitle $theme={theme}>
            <ShuffleSectionLabel theme={theme}>awards</ShuffleSectionLabel>
          </ListTitle>
          <ListContent $theme={theme}>
            {awards.map((a, i) => (
              <EntryBlock key={i}>
                <EntryTitle $theme={theme}>{a.name || a.title}</EntryTitle>
                <EntryMeta $theme={theme}>
                  {a.summary || a.awarder}
                  {a.date && <> &middot; {a.date}</>}
                </EntryMeta>
              </EntryBlock>
            ))}
          </ListContent>
        </ListContainer>
      )}

      {publications.length > 0 && (
        <ListContainer>
          <ListTitle $theme={theme}>
            <ShuffleSectionLabel theme={theme}>publications</ShuffleSectionLabel>
          </ListTitle>
          <ListContent $theme={theme}>
            {publications.map((p, i) => (
              <EntryBlock key={i}>
                <EntryTitle $theme={theme}>
                  {p.url || p.doi ? (
                    <EntryLink href={p.url || `https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" $theme={theme}>
                      {p.name || p.title}
                    </EntryLink>
                  ) : (p.name || p.title)}
                </EntryTitle>
                <EntryMeta $theme={theme}>
                  {p.journal || p.publisher}
                  {p.date && <> &middot; {p.date}</>}
                </EntryMeta>
              </EntryBlock>
            ))}
          </ListContent>
        </ListContainer>
      )}

      {presentations.length > 0 && (
        <ListContainer>
          <ListTitle $theme={theme}>
            <ShuffleSectionLabel theme={theme}>presentations</ShuffleSectionLabel>
          </ListTitle>
          <ListContent $theme={theme}>
            {presentations.map((p, i) => (
              <EntryBlock key={i}>
                <EntryTitle $theme={theme}>{p.name}</EntryTitle>
                <EntryMeta $theme={theme}>
                  {p.summary || p.location}
                  {p.date && <> &middot; {p.date}</>}
                </EntryMeta>
              </EntryBlock>
            ))}
          </ListContent>
        </ListContainer>
      )}

      {professionalDevelopment.length > 0 && (
        <ListContainer>
          <ListTitle $theme={theme}>
            <ShuffleSectionLabel theme={theme}>professional development</ShuffleSectionLabel>
          </ListTitle>
          <ListContent $theme={theme}>
            {professionalDevelopment.map((p, i) => (
              <EntryBlock key={i}>
                <EntryTitle $theme={theme}>{p.name}</EntryTitle>
                <EntryMeta $theme={theme}>
                  {p.summary}
                  {p.location && <> &middot; {p.location}</>}
                  {p.date && <> &middot; {p.date}</>}
                </EntryMeta>
              </EntryBlock>
            ))}
          </ListContent>
        </ListContainer>
      )}
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

const EntryBlock = styled.div`
  margin-bottom: 12px;
`;

const EntryTitle = styled.div`
  font-weight: 500;
  font-size: 15px;
  color: ${p => p.$theme.primary};
`;

const EntryMeta = styled.div`
  font-size: 13px;
  color: ${p => p.$theme.gray100};
  margin-top: 2px;
`;

const EntryLink = styled.a`
  color: ${p => p.$theme.blue || p.$theme.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;
