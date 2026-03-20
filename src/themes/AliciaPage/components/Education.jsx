import React from 'react';
import styled from 'styled-components';

export default function Education({ cv, theme }) {
  const education = cv?.education || [];
  if (!education.length) return null;

  return (
    <Section id="education">
      <ListContainer>
        <ListTitle $theme={theme}>
          <SectionLabel>education</SectionLabel>
        </ListTitle>
        <ListContent $theme={theme}>
          {education.map((edu, i) => (
            <EduRow key={i} $theme={theme}>
              <EduGrid>
                <EduName $theme={theme}>
                  {edu.institution}
                  {edu.studyType && edu.area && (
                    <Degree> — {edu.studyType} in {edu.area}</Degree>
                  )}
                </EduName>
                <EduDate $theme={theme}>
                  {edu.startDate || ''}{edu.endDate ? ` – ${edu.endDate}` : ''}
                </EduDate>
              </EduGrid>
              {edu.score && <Detail>GPA: {edu.score}</Detail>}
            </EduRow>
          ))}
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
  padding: 16px 0 0;
  @media (min-width: 768px) { grid-column: span 8; }
`;

const SectionLabel = styled.h2`
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
`;

const EduRow = styled.div`
  padding: 0 8px 20px;
  font-size: 15px;
  transition: color 0.3s ease-linear;
  &:hover { color: ${p => p.$theme.blue}; }
`;

const EduGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  align-items: baseline;
  gap: 8px;
`;

const EduName = styled.span`
  font-weight: 500;
  color: ${p => p.$theme.primary};
`;

const Degree = styled.span`
  font-weight: 400;
  opacity: 0.7;
`;

const EduDate = styled.span`
  text-align: right;
  font-size: 13px;
  color: ${p => p.$theme.gray100};
  white-space: nowrap;
`;

const Detail = styled.div`
  font-size: 13px;
  opacity: 0.6;
  margin-top: 4px;
`;
