import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { gsap } from 'gsap';
import { useCV } from '../../contexts/ConfigContext';
import { IntroPanel } from './components/IntroPanel';
import { TopographicMap } from './components/TopographicMap';
import { DetailPanel, buildRegionEntries } from './components/DetailPanel';
import { CASE_STUDY_SLOTS, MAP_REGIONS } from './themeData';
import { FloatingPreview } from './components/FloatingPreview';

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
  const [activeRegionId, setActiveRegionId] = useState('case-studies');
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  const [coords, setCoords] = useState(null);
  const mapRef = useRef(null);
  const previewRef = useRef(null);

  if (!cv) return null;

  const socialEntries = useMemo(() => getSocialEntries(cv), [cv]);
  const caseStudyProjects = useMemo(
    () =>
      (cv.projects || []).slice(0, CASE_STUDY_SLOTS.length).map((project, index) => ({
        id: `project-${index}`,
        title: project.name || 'Project',
        meta: project.date || CASE_STUDY_SLOTS[index].previewMeta,
        summary: project.summary || project.highlights?.[0] || '',
        href: project.url || null,
        previewTitle: project.name || CASE_STUDY_SLOTS[index].previewTitle || 'Project',
        previewMeta: project.date || CASE_STUDY_SLOTS[index].previewMeta,
        previewImage: CASE_STUDY_SLOTS[index].previewImage,
        anchor: { x: CASE_STUDY_SLOTS[index].x, y: CASE_STUDY_SLOTS[index].y },
      })),
    [cv.projects]
  );
  const visibleRegionId = hoveredRegionId || activeRegionId;
  const activeRegion = MAP_REGIONS.find((item) => item.id === visibleRegionId) || MAP_REGIONS[0];
  const entries =
    activeRegion.id === 'case-studies'
      ? caseStudyProjects
      : buildRegionEntries(cv, activeRegion.id, socialEntries);
  const visibleProjectId = hoveredProjectId || activeProjectId || caseStudyProjects[0]?.id || null;
  const activeProject =
    activeRegion.id === 'case-studies'
      ? caseStudyProjects.find((project) => project.id === visibleProjectId) || caseStudyProjects[0] || null
      : null;

  useEffect(() => {
    if (!mapRef.current || !previewRef.current || window.innerWidth <= 900) return undefined;

    const mapNode = mapRef.current;
    const previewNode = previewRef.current;
    const moveMapX = gsap.quickTo(mapNode, 'x', { duration: 0.6, ease: 'power3.out' });
    const moveMapY = gsap.quickTo(mapNode, 'y', { duration: 0.6, ease: 'power3.out' });
    const movePreviewX = gsap.quickTo(previewNode, 'x', { duration: 0.8, ease: 'power3.out' });
    const movePreviewY = gsap.quickTo(previewNode, 'y', { duration: 0.8, ease: 'power3.out' });
    const scalePreview = gsap.quickTo(previewNode, 'scale', { duration: 0.4, ease: 'power2.out' });

    const handleMove = (event) => {
      const rect = mapNode.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setCoords({
        x: Math.max(0, Math.round((event.clientX - rect.left) / rect.width * 1000)),
        y: Math.max(0, Math.round((event.clientY - rect.top) / rect.height * 900)),
      });
      moveMapX(px * -10);
      moveMapY(py * -10);
      if (!hoveredProjectId && !activeProjectId) {
        movePreviewX(px * 20);
        movePreviewY(py * 14);
      }
      scalePreview(1.02);
    };

    const handleLeave = () => {
      moveMapX(0);
      moveMapY(0);
      movePreviewX(0);
      movePreviewY(0);
      scalePreview(1);
      setHoveredRegionId(null);
      setHoveredProjectId(null);
      setCoords(null);
    };

    mapNode.addEventListener('mousemove', handleMove);
    mapNode.addEventListener('mouseleave', handleLeave);

    return () => {
      mapNode.removeEventListener('mousemove', handleMove);
      mapNode.removeEventListener('mouseleave', handleLeave);
    };
  }, [activeProjectId, hoveredProjectId]);

  useEffect(() => {
    if (!previewRef.current || !mapRef.current || window.innerWidth <= 900) return;
    if (!activeProject) return;

    const previewNode = previewRef.current;
    const rect = mapRef.current.getBoundingClientRect();
    const targetX = ((activeProject.anchor.x / 100) - 0.5) * rect.width * 0.18;
    const targetY = ((activeProject.anchor.y / 100) - 0.5) * rect.height * 0.15;

    gsap.to(previewNode, {
      x: targetX,
      y: targetY,
      duration: 0.45,
      ease: 'power2.out',
    });
  }, [activeProject]);

  useEffect(() => {
    if (!previewRef.current) return;
    gsap.fromTo(
      previewRef.current,
      { autoAlpha: 0, y: 16, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
    );
  }, [activeRegion.id]);

  return (
    <>
      <FontLoader />
      <Page>
        <Layout>
          <IntroPanel cv={cv} />
          <MapColumn>
            <MapStage>
              <TopographicMap
                regions={MAP_REGIONS}
                activeId={activeRegion.id}
                onSelect={(regionId) => {
                  setActiveRegionId(regionId);
                  if (regionId !== 'case-studies') {
                    setActiveProjectId(null);
                    setHoveredProjectId(null);
                  }
                }}
                onHoverRegion={setHoveredRegionId}
                onLeaveRegion={() => setHoveredRegionId(null)}
                mapRef={mapRef}
                caseStudyProjects={activeRegion.id === 'case-studies' ? caseStudyProjects : []}
                activeProjectId={visibleProjectId}
                onHoverProject={setHoveredProjectId}
                onLeaveProject={() => setHoveredProjectId(null)}
                onSelectProject={(projectId) => {
                  setActiveRegionId('case-studies');
                  setActiveProjectId(projectId);
                }}
              />
              <FloatingPreview region={activeRegion} project={activeProject} coords={coords} previewRef={previewRef} />
            </MapStage>
            <Footer>
              {socialEntries.slice(0, 4).map((link) => (
                <FooterLink href={link.url} key={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </FooterLink>
              ))}
            </Footer>
          </MapColumn>
          <DetailPanel
            region={activeRegion}
            entries={entries}
            activeEntryId={activeProject?.id || null}
            onHoverEntry={activeRegion.id === 'case-studies' ? setHoveredProjectId : undefined}
            onLeaveEntry={activeRegion.id === 'case-studies' ? () => setHoveredProjectId(null) : undefined}
            onSelectEntry={activeRegion.id === 'case-studies' ? setActiveProjectId : undefined}
          />
        </Layout>
      </Page>
    </>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfa 100%);
  color: #1f2328;
  font-family: 'Inter', sans-serif;
`;

const Layout = styled.main`
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 320px;
  gap: 48px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 42px 40px;

  @media (max-width: 1240px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px 20px 40px;
  }
`;

const MapColumn = styled.div`
  min-width: 0;
`;

const MapStage = styled.div`
  position: relative;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding: 20px 0 0 72px;

  @media (max-width: 820px) {
    padding-left: 46px;
  }
`;

const FooterLink = styled.a`
  color: #8a8e90;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;
