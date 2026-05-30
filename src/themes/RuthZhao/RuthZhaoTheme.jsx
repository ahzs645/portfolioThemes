import React, { useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { IntroPanel } from './components/IntroPanel';
import { TopographicMap } from './components/TopographicMap';
import { MobileProjectCard } from './components/MobileProjectCard';
import { ProjectDetailView } from './components/ProjectDetailView';
import { PROJECT_MARKERS, MOBILE_PROJECTS } from './themeData';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&family=Instrument+Serif&family=Geist:wght@400;500&display=swap');
`;

function getSocialEntries(cv) {
  if (Array.isArray(cv?.socialLinks)) return cv.socialLinks;

  if (cv?.socialLinks && typeof cv.socialLinks === 'object') {
    return Object.entries(cv.socialLinks)
      .filter(([, url]) => Boolean(url))
      .map(([label, url]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        url,
      }));
  }

  if (Array.isArray(cv?.socialRaw)) {
    return cv.socialRaw
      .filter((item) => item?.url)
      .map((item) => ({
        label: item.network || item.username || 'Link',
        url: item.url,
      }));
  }

  return [];
}

function hasContent(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function buildSectionItems(cv) {
  const sectionDefinitions = [
    { id: 'experience', label: 'EXPERIENCE', value: cv.experience },
    { id: 'volunteer', label: 'VOLUNTEER', value: cv.volunteer },
    { id: 'media', label: 'MEDIA', value: cv.sectionsRaw?.media },
    { id: 'education', label: 'EDUCATION', value: cv.education },
    { id: 'certifications', label: 'CERTIFICATIONS', value: cv.certifications },
    { id: 'skills', label: 'SKILLS', value: cv.skills },
    { id: 'awards', label: 'AWARDS', value: cv.awards },
    { id: 'publications', label: 'PUBLICATIONS', value: cv.publications },
    { id: 'presentations', label: 'PRESENTATIONS', value: cv.presentations },
    { id: 'professional-development', label: 'PROFESSIONAL DEVELOPMENT', value: cv.professionalDevelopment },
  ];

  return sectionDefinitions
    .filter((section) => hasContent(section.value))
    .map((section, index) => {
      const marker = PROJECT_MARKERS[index % PROJECT_MARKERS.length];
      return {
        ...marker,
        id: section.id,
        kind: 'section',
        sectionId: section.id,
        label: section.label,
        meta: `${Array.isArray(section.value) ? section.value.length : 1} ${Array.isArray(section.value) && section.value.length === 1 ? 'entry' : 'entries'}`,
        accent: index === 0,
      };
    });
}

function buildProjectItems(cv) {
  const cvProjects = cv.projects || [];

  if (cvProjects.length !== PROJECT_MARKERS.length) {
    return buildSectionItems(cv);
  }

  return PROJECT_MARKERS.map((marker, i) => ({
    ...marker,
    kind: 'project',
    label: cvProjects[i]?.name?.toUpperCase() || marker.label,
    meta: cvProjects[i]?.date || marker.meta,
    href: cvProjects[i]?.url || null,
  }));
}

export function RuthZhaoTheme({ darkMode = false }) {
  const cv = useCV();
  const [selectedProject, setSelectedProject] = useState(null);

  if (!cv) return null;

  const socialEntries = useMemo(() => getSocialEntries(cv), [cv]);

  const projects = useMemo(() => {
    return buildProjectItems(cv);
  }, [cv]);

  const mobileProjects = useMemo(() => {
    if (projects.some((project) => project.kind === 'section')) return projects;

    const cvProjects = cv.projects || [];
    return MOBILE_PROJECTS.slice(0, cvProjects.length).map((card, i) => ({
      ...card,
      kind: 'project',
      label: cvProjects[i]?.name?.toUpperCase() || card.label,
      meta: cvProjects[i]?.date || card.meta,
      href: cvProjects[i]?.url || null,
    }));
  }, [cv.projects, projects]);

  // Show project detail view
  if (selectedProject) {
    return (
      <>
        <FontLoader />
        <ProjectDetailView
          project={selectedProject}
          allProjects={projects}
          cv={cv}
          onBack={() => setSelectedProject(null)}
          onSelectProject={setSelectedProject}
          darkMode={darkMode}
        />
      </>
    );
  }

  return (
    <>
      <FontLoader />
      <Page $dark={darkMode}>
        {/* Desktop layout */}
        <DesktopLayout>
          <LeftColumn>
            <IntroPanel cv={cv} darkMode={darkMode} />
          </LeftColumn>
          <MapColumn>
            <TopographicMap
              projects={projects}
              onSelectProject={(project) => setSelectedProject(project)}
              darkMode={darkMode}
            />
          </MapColumn>
        </DesktopLayout>

        {/* Mobile layout */}
        <MobileLayout $dark={darkMode}>
          <IntroPanel cv={cv} darkMode={darkMode} />
          <MobileCards>
            {mobileProjects.map((project) => (
              <MobileProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                darkMode={darkMode}
              />
            ))}
          </MobileCards>
          <MobileFooter>
            {socialEntries.slice(0, 4).map((link) => (
              <FooterLink $dark={darkMode} href={link.url} key={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </FooterLink>
            ))}
          </MobileFooter>
        </MobileLayout>
      </Page>
    </>
  );
}

const Page = styled.div`
  min-height: 100%;
  background: ${(p) => (p.$dark ? '#111415' : '#fff')};
  color: ${(p) => (p.$dark ? '#d8dfe0' : '#1f2328')};
  font-family: 'Inter', sans-serif;
`;

const DesktopLayout = styled.main`
  display: flex;
  flex-direction: row;
  gap: 100px;
  height: 100%;
  overflow: clip;
  padding: 100px 140px 130px 90px;
  justify-content: center;

  @media (max-width: 1104px) {
    display: none;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  width: min-content;
  height: min-content;
`;

const MapColumn = styled.div`
  flex: 1 0 0px;
  height: 100%;
  display: flex;
`;

const MobileLayout = styled.div`
  display: none;
  flex-direction: column;
  gap: 50px;
  padding: 150px 20px 20px 20px;
  background: ${(p) => (p.$dark ? '#161c1e' : '#f7fafa')};

  @media (max-width: 1104px) {
    display: flex;
  }
`;

const MobileCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  align-items: center;
  width: 100%;
`;

const MobileFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding: 10px 0;
`;

const FooterLink = styled.a`
  color: ${(p) => (p.$dark ? '#6a7275' : '#8a8e90')};
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;
