import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { ShuffleSectionLabel } from './Hero';

export default function Projects({ cv, theme }) {
  const projects = cv?.projects || [];
  if (!projects.length) return null;

  return (
    <Section id="projects">
      <ListContainer>
        <ListTitle $theme={theme}>
          <ShuffleSectionLabel theme={theme}>projects</ShuffleSectionLabel>
        </ListTitle>
        <ListContent $theme={theme}>
          <TableHeader $theme={theme}>
            <span style={{ gridColumn: 'span 4' }}>Title</span>
            <TagsHeader>Tags</TagsHeader>
          </TableHeader>
          <ListWrapper>
            {projects.map((project, i) => (
              <ProjectRow key={i} $theme={theme}>
                <ProjectLink
                  href={project.url || project.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  $theme={theme}
                >
                  <ProjectGrid>
                    <ProjectName>{project.name || project.title}</ProjectName>
                    <Tags>
                      {(project.technologies || project.keywords || []).slice(0, 3).map((tag, j) => (
                        <Tag key={j} $theme={theme}>{tag}</Tag>
                      ))}
                    </Tags>
                  </ProjectGrid>
                </ProjectLink>
              </ProjectRow>
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

const TableHeader = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    padding: 0 8px 8px;
    font-size: 13px;
    font-weight: 500;
    color: ${p => p.$theme.gray100};
  }
`;

const TagsHeader = styled.span`
  grid-column: span 3;
  display: none;
  @media (min-width: 768px) { display: block; }
`;

const ListWrapper = styled.div``;

const ProjectRow = styled.div`
  border-top: 1px solid ${p => p.$theme.gray100}33;
`;

const ProjectLink = styled.a`
  display: block;
  padding: 12px 8px;
  text-decoration: none;
  color: ${p => p.$theme.primary};
  transition: color 0.3s ease-linear;
  &:hover {
    color: ${p => p.$theme.blue};
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  gap: 8px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(8, 1fr);
  }
`;

const ProjectName = styled.span`
  grid-column: span 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  @media (min-width: 768px) { grid-column: span 4; }
`;

const Tags = styled.span`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    grid-column: span 3;
    gap: 8px;
  }
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  background: ${p => p.$theme.gray900}33;
  color: ${p => p.$theme.primary};
  transition: all 0.3s ease-linear;
`;
