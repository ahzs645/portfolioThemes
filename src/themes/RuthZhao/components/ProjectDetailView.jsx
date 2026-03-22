import React from 'react';
import styled from 'styled-components';

const glyphSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="48" height="36">
    <path d="M 0 3.075 C 0 1.929 0.924 1 2.064 1 L 9.312 1 C 10.452 1 11.376 1.929 11.376 3.075 L 11.376 10.362 C 11.376 11.508 10.452 12.437 9.312 12.437 L 2.064 12.437 C 0.924 12.437 0 11.508 0 10.362 Z M 11.376 14.512 C 11.376 13.366 12.301 12.437 13.441 12.437 L 20.688 12.437 C 21.829 12.437 22.753 13.366 22.753 14.512 L 22.753 21.798 C 22.753 22.944 21.829 23.874 20.688 23.874 L 13.441 23.874 C 12.301 23.874 11.376 22.944 11.376 21.798 Z M 11.376 25.949 C 11.376 24.803 10.452 23.874 9.312 23.874 L 2.064 23.874 C 0.924 23.874 0 24.803 0 25.949 L 0 33.235 C 0 34.381 0.924 35.31 2.064 35.31 L 9.312 35.31 C 10.452 35.31 11.376 34.381 11.376 33.235 Z" fill="rgb(223, 232, 232)" />
    <path d="M 36.212 33.235 C 36.212 34.381 37.136 35.31 38.276 35.31 L 45.524 35.31 C 46.664 35.31 47.588 34.381 47.588 33.235 L 47.588 25.949 C 47.588 24.803 46.664 23.874 45.524 23.874 L 38.276 23.874 C 37.136 23.874 36.212 24.803 36.212 25.949 Z M 36.212 10.362 C 36.212 11.508 37.136 12.437 38.276 12.437 L 45.524 12.437 C 46.664 12.437 47.588 11.508 47.588 10.362 L 47.588 3.075 C 47.588 1.929 46.664 1 45.524 1 L 38.276 1 C 37.136 1 36.212 1.929 36.212 3.075 Z" fill="rgb(223, 232, 232)" />
    <path d="M 23.7 14.5 C 23.7 13.395 24.595 12.5 25.7 12.5 L 33.2 12.5 C 34.305 12.5 35.2 13.395 35.2 14.5 L 35.2 22 C 35.2 23.105 34.305 24 33.2 24 L 25.7 24 C 24.595 24 23.7 23.105 23.7 22 Z" fill="rgb(247, 124, 17)" />
  </svg>
);

const triangleDiagramSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 126" width="144" height="126">
    <path d="M 71.359 1.065 C 71.644 0.572 72.356 0.572 72.641 1.065 L 73.482 2.522 L 73.976 2.236 L 75.658 5.15 L 75.164 5.435 L 76.846 8.348 L 77.34 8.063 L 79.021 10.976 L 78.528 11.261 L 80.209 14.174 L 80.703 13.889 L 82.385 16.802 L 81.891 17.087 L 83.573 20 L 84.067 19.715 L 85.749 22.628 L 85.255 22.913 L 86.937 25.826 L 87.431 25.541 L 89.112 28.454 L 88.619 28.739 L 90.3 31.652 L 90.794 31.367 L 92.476 34.28 L 91.982 34.565 L 93.664 37.478 L 94.158 37.193 L 95.84 40.106 L 95.346 40.391 L 97.028 43.304 L 97.522 43.019 L 99.203 45.932 L 98.71 46.217 L 100.391 49.13 L 100.885 48.845 L 102.567 51.758 L 102.073 52.043 L 103.755 54.956 L 104.249 54.671 L 105.931 57.584 L 105.437 57.869 L 107.119 60.782 L 107.613 60.497 L 109.294 63.41 L 108.801 63.695 L 110.482 66.608 L 110.976 66.323 L 112.658 69.236 L 112.164 69.521 L 113.846 72.434 L 114.34 72.149 L 116.022 75.062 L 115.528 75.347 L 117.21 78.26 L 117.704 77.975 L 119.385 80.888 L 118.892 81.173 L 120.573 84.086 L 121.067 83.801 L 122.749 86.714 L 122.255 86.999 L 123.937 89.912 L 124.431 89.627 L 126.113 92.54 L 125.619 92.825 L 127.301 95.738 L 127.795 95.453 L 129.476 98.366 L 128.983 98.651 L 130.664 101.565 L 131.158 101.279 L 132.84 104.192 L 132.346 104.478 L 134.028 107.391 L 134.522 107.105 L 136.204 110.018 L 135.71 110.304 L 137.392 113.217 L 137.886 112.931 L 139.567 115.844 L 139.074 116.13 L 140.755 119.043 L 141.249 118.757 L 142.931 121.671 L 142.437 121.956 L 143.278 123.412 C 143.563 123.906 143.207 124.523 142.637 124.523 L 1.363 124.523 C 0.793 124.523 0.437 123.906 0.722 123.412 L 1.563 121.956 L 1.069 121.671 L 2.751 118.758 L 3.245 119.043 L 4.926 116.13 L 4.432 115.844 L 6.114 112.931 L 6.608 113.217 L 8.29 110.304 L 7.796 110.018 L 9.478 107.105 L 9.972 107.391 L 11.654 104.478 L 11.16 104.192 L 12.842 101.279 L 13.336 101.564 L 15.017 98.651 L 14.524 98.366 L 16.205 95.453 L 16.699 95.738 L 18.381 92.825 L 17.887 92.54 L 19.569 89.627 L 20.063 89.912 L 21.745 86.999 L 21.251 86.714 L 22.933 83.801 L 23.427 84.086 L 25.108 81.173 L 24.615 80.888 L 26.296 77.975 L 26.79 78.26 L 28.472 75.347 L 27.978 75.062 L 29.66 72.149 L 30.154 72.434 L 31.836 69.521 L 31.342 69.236 L 33.024 66.323 L 33.518 66.608 L 35.199 63.695 L 34.706 63.41 L 36.387 60.497 L 36.881 60.782 L 38.563 57.869 L 38.069 57.584 L 39.751 54.671 L 40.245 54.956 L 41.927 52.043 L 41.433 51.758 L 43.115 48.845 L 43.609 49.13 L 45.29 46.217 L 44.796 45.932 L 46.478 43.019 L 46.972 43.304 L 48.654 40.391 L 48.16 40.106 L 49.842 37.193 L 50.336 37.478 L 52.018 34.565 L 51.524 34.28 L 53.206 31.367 L 53.7 31.652 L 55.381 28.739 L 54.888 28.454 L 56.569 25.541 L 57.063 25.826 L 58.745 22.913 L 58.251 22.628 L 59.933 19.715 L 60.427 20 L 62.109 17.087 L 61.615 16.802 L 63.297 13.889 L 63.791 14.174 L 65.472 11.261 L 64.979 10.976 L 66.66 8.063 L 67.154 8.348 L 68.836 5.435 L 68.342 5.15 L 70.024 2.236 L 70.518 2.522 Z" fill="transparent" strokeWidth="1.14" stroke="rgba(126,138,143,0.4)" strokeMiterlimit="10" strokeDasharray="3.42,3.42" />
    <path d="M 96.816 97.256 L 46.676 97.256 C 46.106 97.256 45.75 96.639 46.035 96.146 L 71.105 52.723 C 71.39 52.23 72.102 52.23 72.387 52.723 L 97.457 96.146 C 97.742 96.639 97.386 97.256 96.816 97.256 Z" fill="transparent" strokeWidth="1.14" stroke="rgba(126,138,143,0.2)" strokeMiterlimit="10" />
    <path d="M 72.189 1.29 L 72.191 125.007" fill="transparent" strokeWidth="1.14" stroke="rgba(126,138,143,0.2)" strokeLinecap="round" strokeMiterlimit="10" />
    <path d="M 2.033 122.803 L 106.993 60.269" fill="transparent" strokeWidth="1.14" stroke="rgba(126,138,143,0.2)" strokeLinecap="round" strokeMiterlimit="10" />
    <path d="M 142.4 123.632 L 36.947 61.218" fill="transparent" strokeWidth="1.14" stroke="rgba(126,138,143,0.2)" strokeLinecap="round" strokeMiterlimit="10" />
  </svg>
);

// Category mapping for projects
const CATEGORIES = [
  { id: 'case-studies', label: 'CASE STUDIES', projectIds: ['ramp', 'penn-labs'] },
  { id: 'research', label: 'RESEARCH', projectIds: ['living-loom', 'e-textiles'] },
  { id: 'art', label: 'ART', projectIds: ['tarot-cards', 'illustrated-poetry'] },
];

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

export function ProjectDetailView({ project, allProjects, cv, onBack, onSelectProject }) {
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
        <LogoLink onClick={onBack} type="button" title="Back to map">
          {glyphSvg}
          <LogoName>RUTH ZHAO</LogoName>
        </LogoLink>

        <Divider />

        <DiagramWrap>
          {triangleDiagramSvg}
          <DiagramDot />
          <DiagramLabel style={{ top: '28%', right: '-10px' }}>RESEARCH</DiagramLabel>
          <DiagramLabel style={{ bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }}>CASE STUDY</DiagramLabel>
          <DiagramLabel style={{ top: '28%', left: '-10px' }}>ART</DiagramLabel>
        </DiagramWrap>

        <NavSections>
          {CATEGORIES.map((cat) => (
            <NavSection key={cat.id}>
              <NavCategoryLabel>{cat.label}</NavCategoryLabel>
              {(allProjects || [])
                .filter((p) => cat.projectIds.includes(p.id))
                .map((p) => (
                  <NavItem
                    key={p.id}
                    $active={p.id === project?.id}
                    onClick={() => onSelectProject?.(p)}
                    type="button"
                  >
                    {p.label.charAt(0) + p.label.slice(1).toLowerCase()}
                  </NavItem>
                ))}
            </NavSection>
          ))}
        </NavSections>
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
  width: 240px;
  flex-shrink: 0;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid rgb(223, 232, 232);

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgb(223, 232, 232);
    padding: 20px;
  }
`;

const LogoLink = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
`;

const LogoName = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 18px;
  color: rgb(128, 140, 146);
  letter-spacing: 0.04em;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgb(223, 232, 232);
`;

const DiagramWrap = styled.div`
  position: relative;
  width: 144px;
  align-self: center;
`;

const DiagramDot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff8012;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const DiagramLabel = styled.span`
  position: absolute;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgb(126, 138, 143);
  white-space: nowrap;
`;

const NavSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavCategoryLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: rgb(197, 207, 212);
  letter-spacing: 0.04em;
  margin-bottom: 4px;
`;

const NavItem = styled.button`
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${(p) => (p.$active ? '#fff' : 'rgb(81, 93, 98)')};
  background: ${(p) => (p.$active ? '#ff8012' : 'transparent')};
  border: none;
  border-radius: 0;
  padding: 6px 10px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${(p) => (p.$active ? '#fff' : '#000')};
    background: ${(p) => (p.$active ? '#ff8012' : 'rgba(0, 0, 0, 0.04)')};
  }
`;

const Content = styled.main`
  flex: 1;
  max-width: 800px;
  padding: 80px 60px 80px 60px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: 768px) {
    padding: 24px 20px;
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
