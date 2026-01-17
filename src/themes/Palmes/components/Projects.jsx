import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  min-height: 100vh;
  padding: 6rem 2rem;
  max-width: 1000px;
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

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.a`
  display: block;
  padding: 1.5rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    border-color: #06b6d4;
    transform: translateY(-4px);
    box-shadow: 0 10px 40px rgba(6, 182, 212, 0.1);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const FolderIcon = styled.div`
  color: #06b6d4;

  svg {
    width: 40px;
    height: 40px;
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ProjectLink = styled.span`
  color: #71717a;
  transition: color 0.2s ease;

  &:hover {
    color: #06b6d4;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ProjectName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.75rem;
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  color: #a1a1aa;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tech = styled.span`
  font-size: 0.75rem;
  color: #71717a;
  font-family: monospace;
`;

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

export default function Projects({ projects = [] }) {
  const filteredProjects = projects.filter(p => !isArchived(p));

  if (filteredProjects.length === 0) {
    return null;
  }

  return (
    <Section id="projects">
      <SectionTitle>Projects</SectionTitle>
      <ProjectGrid>
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={index}
            href={project.url || project.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ProjectHeader>
              <FolderIcon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </FolderIcon>
              <ProjectLinks>
                {project.github && (
                  <ProjectLink as="a" href={project.github} target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </ProjectLink>
                )}
                {(project.url || project.link) && (
                  <ProjectLink>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </ProjectLink>
                )}
              </ProjectLinks>
            </ProjectHeader>
            <ProjectName>{project.name || project.title}</ProjectName>
            <ProjectDescription>
              {project.description || project.summary || 'No description available.'}
            </ProjectDescription>
            {(project.technologies || project.stack || project.keywords) && (
              <TechStack>
                {(project.technologies || project.stack || project.keywords || []).slice(0, 5).map((tech, i) => (
                  <Tech key={i}>{tech}</Tech>
                ))}
              </TechStack>
            )}
          </ProjectCard>
        ))}
      </ProjectGrid>
    </Section>
  );
}
