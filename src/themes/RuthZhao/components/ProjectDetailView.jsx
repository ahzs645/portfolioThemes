import React from 'react';
import styled from 'styled-components';

const glyphSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="48" height="36">
    <path d="M 0 3.075 C 0 1.929 0.924 1 2.064 1 L 9.312 1 C 10.452 1 11.376 1.929 11.376 3.075 L 11.376 10.362 C 11.376 11.508 10.452 12.437 9.312 12.437 L 2.064 12.437 C 0.924 12.437 0 11.508 0 10.362 Z M 11.376 14.512 C 11.376 13.366 12.301 12.437 13.441 12.437 L 20.688 12.437 C 21.829 12.437 22.753 13.366 22.753 14.512 L 22.753 21.798 C 22.753 22.944 21.829 23.874 20.688 23.874 L 13.441 23.874 C 12.301 23.874 11.376 22.944 11.376 21.798 Z M 11.376 25.949 C 11.376 24.803 10.452 23.874 9.312 23.874 L 2.064 23.874 C 0.924 23.874 0 24.803 0 25.949 L 0 33.235 C 0 34.381 0.924 35.31 2.064 35.31 L 9.312 35.31 C 10.452 35.31 11.376 34.381 11.376 33.235 Z" fill="rgb(223, 232, 232)" />
    <path d="M 36.212 33.235 C 36.212 34.381 37.136 35.31 38.276 35.31 L 45.524 35.31 C 46.664 35.31 47.588 34.381 47.588 33.235 L 47.588 25.949 C 47.588 24.803 46.664 23.874 45.524 23.874 L 38.276 23.874 C 37.136 23.874 36.212 24.803 36.212 25.949 Z M 36.212 10.362 C 36.212 11.508 37.136 12.437 38.276 12.437 L 45.524 12.437 C 46.664 12.437 47.588 11.508 47.588 10.362 L 47.588 3.075 C 47.588 1.929 46.664 1 45.524 1 L 38.276 1 C 37.136 1 36.212 1.929 36.212 3.075 Z" fill="rgb(223, 232, 232)" />
    <path d="M 23.7 14.5 C 23.7 13.395 24.595 12.5 25.7 12.5 L 33.2 12.5 C 34.305 12.5 35.2 13.395 35.2 14.5 L 35.2 22 C 35.2 23.105 34.305 24 33.2 24 L 25.7 24 C 24.595 24 23.7 23.105 23.7 22 Z" fill="rgb(247, 124, 17)" />
  </svg>
);

function formatDate(value) {
  if (!value) return '';
  const s = String(value).trim();
  if (s.toLowerCase() === 'present') return 'Present';
  if (/^\d{4}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }
  return s;
}

function formatRange(start, end) {
  const l = formatDate(start);
  const r = formatDate(end);
  if (!l && !r) return '';
  if (!r) return l;
  return `${l} – ${r}`;
}

export function ProjectDetailView({ project, cv, onBack }) {
  // Try to find matching CV project for richer data
  const cvProject = (cv?.projects || []).find(
    (p) => p.name?.toUpperCase() === project?.label
  );

  const title = cvProject?.name || project?.label || 'Project';
  const summary = cvProject?.summary || cvProject?.description || '';
  const highlights = cvProject?.highlights || [];
  const keywords = cvProject?.keywords || [];
  const url = cvProject?.url || project?.href || '';
  const date = cvProject?.startDate
    ? formatRange(cvProject.startDate, cvProject.endDate)
    : project?.meta || '';
  const roles = cvProject?.roles || [];
  const type = cvProject?.type || '';

  return (
    <Page>
      <Sidebar>
        <BackButton onClick={onBack} type="button" title="Back to map">
          {glyphSvg}
        </BackButton>
      </Sidebar>

      <Content>
        <Header>
          <ProjectTitle>{title}</ProjectTitle>
          {url && (
            <ProjectLink href={url} target="_blank" rel="noreferrer">
              Visit project ↗
            </ProjectLink>
          )}
        </Header>

        <MetaGrid>
          {date && (
            <MetaItem>
              <MetaLabel>Time</MetaLabel>
              <MetaValue>{date}</MetaValue>
            </MetaItem>
          )}
          {type && (
            <MetaItem>
              <MetaLabel>Genre</MetaLabel>
              <MetaValue>{type}</MetaValue>
            </MetaItem>
          )}
          {roles.length > 0 && (
            <MetaItem>
              <MetaLabel>Context</MetaLabel>
              <MetaValue>{roles.join(', ')}</MetaValue>
            </MetaItem>
          )}
          {keywords.length > 0 && (
            <MetaItem>
              <MetaLabel>Skills</MetaLabel>
              <MetaValue>{keywords.join(', ')}</MetaValue>
            </MetaItem>
          )}
        </MetaGrid>

        {summary && (
          <Section>
            <SectionLabel>Body</SectionLabel>
            <BodyText>{summary}</BodyText>
          </Section>
        )}

        {highlights.length > 0 && (
          <Section>
            <HighlightList>
              {highlights.map((h, i) => (
                <HighlightItem key={i}>{h}</HighlightItem>
              ))}
            </HighlightList>
          </Section>
        )}

        {project?.previewImage && (
          <Section>
            <ProjectImage src={project.previewImage} alt={title} />
          </Section>
        )}
      </Content>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background: #f7fafa;
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.nav`
  width: 90px;
  flex-shrink: 0;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    padding: 20px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const Content = styled.main`
  flex: 1;
  max-width: 800px;
  padding: 80px 60px 80px 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProjectTitle = styled.h1`
  font-family: 'Instrument Serif', 'Georgia', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  color: #000;
  margin: 0;
  line-height: 1.1;
`;

const ProjectLink = styled.a`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #ff8012;
  text-decoration: none;
  letter-spacing: 0.04em;

  &:hover {
    text-decoration: underline;
  }
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
  border-top: 1px solid rgb(223, 232, 232);
  border-bottom: 1px solid rgb(223, 232, 232);
  padding: 24px 0;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetaLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: rgb(128, 140, 146);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const MetaValue = styled.span`
  font-family: 'Geist', 'Inter', sans-serif;
  font-size: 14px;
  color: rgb(81, 93, 98);
  line-height: 1.5;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: rgb(128, 140, 146);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const BodyText = styled.p`
  font-family: 'Geist', 'Inter', sans-serif;
  font-size: 16px;
  color: rgb(81, 93, 98);
  line-height: 1.65;
  margin: 0;
  max-width: 600px;
`;

const HighlightList = styled.ul`
  margin: 0;
  padding: 0 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HighlightItem = styled.li`
  font-family: 'Geist', 'Inter', sans-serif;
  font-size: 14px;
  color: rgb(81, 93, 98);
  line-height: 1.55;
`;

const ProjectImage = styled.img`
  width: 100%;
  max-width: 600px;
  height: auto;
  border: 1px solid rgb(223, 232, 232);
  display: block;
`;
