import React, { useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { IntroPanel } from './components/IntroPanel';
import { TopographicMap } from './components/TopographicMap';
import { MobileProjectCard } from './components/MobileProjectCard';
import { PROJECT_MARKERS, MOBILE_PROJECTS } from './themeData';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
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

export function RuthZhaoTheme() {
  const cv = useCV();

  if (!cv) return null;

  const socialEntries = useMemo(() => getSocialEntries(cv), [cv]);

  // Map CV projects to markers, falling back to hardcoded positions
  const projects = useMemo(() => {
    const cvProjects = cv.projects || [];
    return PROJECT_MARKERS.map((marker, i) => ({
      ...marker,
      label: cvProjects[i]?.name?.toUpperCase() || marker.label,
      meta: cvProjects[i]?.date || marker.meta,
      href: cvProjects[i]?.url || null,
    }));
  }, [cv.projects]);

  const mobileProjects = useMemo(() => {
    const cvProjects = cv.projects || [];
    return MOBILE_PROJECTS.map((card, i) => ({
      ...card,
      label: cvProjects[i]?.name?.toUpperCase() || card.label,
      meta: cvProjects[i]?.date || card.meta,
      href: cvProjects[i]?.url || null,
    }));
  }, [cv.projects]);

  return (
    <>
      <FontLoader />
      <Page>
        {/* Desktop layout */}
        <DesktopLayout>
          <LeftColumn>
            <IntroPanel cv={cv} />
          </LeftColumn>
          <MapColumn>
            <TopographicMap projects={projects} />
          </MapColumn>
        </DesktopLayout>

        {/* Mobile layout */}
        <MobileLayout>
          <IntroPanel cv={cv} />
          <MobileCards>
            {mobileProjects.map((project) => (
              <MobileProjectCard key={project.id} project={project} />
            ))}
          </MobileCards>
          <MobileFooter>
            {socialEntries.slice(0, 4).map((link) => (
              <FooterLink href={link.url} key={link.url} target="_blank" rel="noreferrer">
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
  min-height: 100vh;
  background: #fff;
  color: #1f2328;
  font-family: 'Inter', sans-serif;
`;

const DesktopLayout = styled.main`
  display: flex;
  flex-direction: row;
  gap: 100px;
  height: 100vh;
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
  background: #f7fafa;

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
  color: #8a8e90;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;
