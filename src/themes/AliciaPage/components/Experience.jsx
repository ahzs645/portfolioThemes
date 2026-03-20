import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';

export default function Experience({ cv, theme }) {
  const experience = cv?.experience || [];
  if (!experience.length) return null;

  return (
    <Section id="experience">
      <ListContainer>
        <ListTitle $theme={theme}>
          <SectionLabel>experience</SectionLabel>
        </ListTitle>
        <ListContent $theme={theme}>
          <ListWrapper className="group-list-wrapper">
            {experience.map((job, i) => (
              <JobRow key={i} $theme={theme}>
                <JobGrid>
                  <JobName $theme={theme}>
                    {job.organization || job.company}
                    {job.position && <Role> — {job.position}</Role>}
                  </JobName>
                  <JobDate $theme={theme}>
                    {job.startDate || ''}{job.endDate ? ` – ${job.endDate}` : job.startDate ? ' – Present' : ''}
                  </JobDate>
                </JobGrid>
                {job.highlights && job.highlights.length > 0 && (
                  <Highlights>
                    {job.highlights.map((h, j) => (
                      <li key={j}>{typeof h === 'string' ? h : h.text || h}</li>
                    ))}
                  </Highlights>
                )}
              </JobRow>
            ))}
          </ListWrapper>
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
  @media (min-width: 768px) {
    margin-bottom: 4rem;
    row-gap: 1rem;
  }
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

const ListWrapper = styled.div``;

const JobRow = styled.div`
  padding: 0 8px 20px;
  font-size: 15px;
  transition: color 0.3s ease-linear;
  &:hover {
    color: ${p => p.$theme.blue};
  }
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  align-items: baseline;
  gap: 8px;
  @media (min-width: 768px) {
    grid-template-columns: 4fr 1fr;
  }
`;

const JobName = styled.span`
  font-weight: 500;
  color: ${p => p.$theme.primary};
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Role = styled.span`
  font-weight: 400;
  opacity: 0.7;
`;

const JobDate = styled.span`
  text-align: right;
  font-size: 13px;
  color: ${p => p.$theme.gray100};
  white-space: nowrap;
`;

const Highlights = styled.ul`
  margin: 8px 0 0;
  padding-left: 20px;
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.6;
  li { margin-bottom: 4px; }
`;
