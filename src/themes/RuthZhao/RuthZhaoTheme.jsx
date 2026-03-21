import React, { useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { IntroPanel } from './components/IntroPanel';
import { TopographicMap } from './components/TopographicMap';
import { DetailPanel, buildRegionEntries } from './components/DetailPanel';
import { MAP_REGIONS } from './themeData';

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

  if (!cv) return null;

  const socialEntries = useMemo(() => getSocialEntries(cv), [cv]);
  const activeRegion = MAP_REGIONS.find((item) => item.id === activeRegionId) || MAP_REGIONS[0];
  const entries = buildRegionEntries(cv, activeRegion.id, socialEntries);

  return (
    <>
      <FontLoader />
      <Page>
        <Layout>
          <IntroPanel cv={cv} />
          <MapColumn>
            <TopographicMap regions={MAP_REGIONS} activeId={activeRegion.id} onSelect={setActiveRegionId} />
            <Footer>
              {socialEntries.slice(0, 4).map((link) => (
                <FooterLink href={link.url} key={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </FooterLink>
              ))}
            </Footer>
          </MapColumn>
          <DetailPanel region={activeRegion} entries={entries} />
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
