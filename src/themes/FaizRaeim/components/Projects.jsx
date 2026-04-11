import React from 'react';
import styled from 'styled-components';
import { Rocket, ExternalLink, CheckCircle2, Star } from 'lucide-react';
import { GithubIcon as Github } from './Icons';
import { Block, SectionGrid } from './Block';

export default function Projects({ cv }) {
  const projects = cv.projects || [];
  if (!projects.length) return null;

  const featured = projects[0];
  const others = projects.slice(1);

  return (
    <Section id="fr-projects">
      <SectionGrid>
        {/* Header */}
        <Block style={{ gridColumn: 'span 12' }}>
          <Rocket size={28} color="#a1a1aa" style={{ marginBottom: 16 }} />
          <SectionTitle>
            Featured Projects.{' '}
            <Muted>Shifting ideas into reality through code.</Muted>
          </SectionTitle>
        </Block>

        {/* Featured project */}
        <Block style={{ gridColumn: 'span 12' }}>
          <FeaturedBadge>
            <Star size={16} fill="currentColor" />
            <span>Featured</span>
          </FeaturedBadge>
          <FeaturedTitle>{featured.name}</FeaturedTitle>
          {featured.description && (
            <Description>{featured.description}</Description>
          )}
          {featured.highlights?.length > 0 && (
            <HighlightList>
              {featured.highlights.slice(0, 6).map((h, i) => (
                <HighlightItem key={i}>
                  <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{h}</span>
                </HighlightItem>
              ))}
            </HighlightList>
          )}
          {featured.technologies?.length > 0 && (
            <TechRow>
              {featured.technologies.map((t, i) => (
                <TechPill key={i}>{t}</TechPill>
              ))}
            </TechRow>
          )}
          <LinksRow>
            {featured.url && (
              <ProjectLink href={featured.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> Live Demo
              </ProjectLink>
            )}
            {featured.source && (
              <ProjectLink href={featured.source} target="_blank" rel="noopener noreferrer">
                <Github size={14} /> Source Code
              </ProjectLink>
            )}
          </LinksRow>
        </Block>

        {/* Other projects */}
        {others.map((project, i) => (
          <ProjectCard key={i} whileHover={{ rotate: '1.5deg', scale: 1.02 }}>
            <ProjectTitle>{project.name}</ProjectTitle>
            {project.description && (
              <Description>{project.description}</Description>
            )}
            {project.highlights?.length > 0 && (
              <HighlightList>
                {project.highlights.slice(0, 4).map((h, j) => (
                  <HighlightItem key={j}>
                    <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{h}</span>
                  </HighlightItem>
                ))}
              </HighlightList>
            )}
            {project.technologies?.length > 0 && (
              <TechRow>
                {project.technologies.map((t, j) => (
                  <TechPill key={j}>{t}</TechPill>
                ))}
              </TechRow>
            )}
            {(project.url || project.source) && (
              <ProjectLink
                href={project.url || project.source}
                target="_blank"
                rel="noopener noreferrer"
                $orange
              >
                {project.url ? <ExternalLink size={12} /> : <Github size={12} />}
                View Project
              </ProjectLink>
            )}
          </ProjectCard>
        ))}

        {/* GitHub CTA */}
        {cv.socialLinks?.github && (
          <GithubBlock whileHover={{ rotate: '-2.5deg', scale: 1.05 }}>
            <a href={cv.socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <GithubCTA>
                <Github size={36} color="#000" style={{ marginBottom: 8 }} />
                <GithubText>View All Projects on GitHub</GithubText>
              </GithubCTA>
            </a>
          </GithubBlock>
        )}
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

const FeaturedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fb923c;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
`;

const FeaturedTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px;
`;

const ProjectTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
`;

const Description = styled.p`
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.6;
  margin: 0 0 16px;
`;

const HighlightList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
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

const TechRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const TechPill = styled.span`
  padding: 4px 8px;
  background: #3f3f46;
  color: #d4d4d8;
  font-size: 12px;
  border-radius: 9999px;
`;

const LinksRow = styled.div`
  display: flex;
  gap: 12px;
`;

const ProjectLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: ${(p) => (p.$orange ? '#fdba74' : '#d4d4d8')};
  text-decoration: none;
  &:hover { color: ${(p) => (p.$orange ? '#fb923c' : '#fff')}; }
`;

const ProjectCard = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const GithubBlock = styled(Block)`
  grid-column: span 12;
  background: #fafafa;
  border-color: #e4e4e7;
`;

const GithubCTA = styled.div`
  display: grid;
  height: 100%;
  place-content: center;
  text-align: center;
`;

const GithubText = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: #000;
  margin: 0;
`;
