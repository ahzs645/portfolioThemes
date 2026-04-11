import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { SectionHeader } from './components/SectionHeader';
import { Grid } from './components/Grid';
import { Card } from './components/Card';
import { Footer } from './components/Footer';
import { Modal } from './components/Modal';
import { FRAUNCES_HREF, GlobalReset, colors, fonts } from './styles';
import { buildCards, loadFraunces } from './utils';

const SECTION_DEFS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects', title: 'projects', description: "Things I've built — most, if not all, for the joy of it." },
  { id: 'experience', label: 'Experience', title: 'experience', description: 'Places I have worked, studied, and learned.' },
  { id: 'writing', label: 'Writing', title: 'writing', description: 'Publications, talks, and a few things I have written down.' },
  { id: 'extras', label: 'Extras', title: 'extras', description: 'Awards, certifications, languages — the rest of the garden.' },
];

const Main = styled.main`
  min-height: 100vh;
  width: 100%;
  background: ${colors.bg};
  color: ${colors.text900};
  font-family: ${fonts.sans};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0 2rem;
`;

const Container = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 640px;

  @media (min-width: 768px) { max-width: 768px; }
  @media (min-width: 1024px) { max-width: 1024px; }
  @media (min-width: 1280px) { max-width: 1536px; }
`;

function readHashSection() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '').trim();
  return hash || null;
}

function readOpenId() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('open') || null;
}

export function ChesterHowTheme() {
  const cv = useCV();
  const [activeId, setActiveId] = useState(() => readHashSection() || 'about');
  const [openCard, setOpenCard] = useState(null);

  useEffect(() => {
    loadFraunces(FRAUNCES_HREF);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onHashChange = () => {
      const next = readHashSection();
      if (next) setActiveId(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash.replace(/^#/, '') !== activeId) {
      window.history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  const groups = useMemo(() => buildCards(cv), [cv]);

  useEffect(() => {
    const id = readOpenId();
    if (!id) return;
    const all = [
      ...groups.projects,
      ...groups.experience,
      ...groups.writing,
      ...groups.extras,
    ];
    const match = all.find((card) => card.id === id);
    if (match) setOpenCard(match);
  }, [groups]);

  const availableSections = useMemo(() => {
    return SECTION_DEFS.filter((section) => {
      if (section.id === 'about') return true;
      if (section.id === 'projects') return groups.projects.length > 0;
      if (section.id === 'experience') return groups.experience.length > 0;
      if (section.id === 'writing') return groups.writing.length > 0;
      if (section.id === 'extras') return groups.extras.length > 0;
      return false;
    });
  }, [groups]);

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const social = cv.socialLinks || {};
  const sideLinks = [
    social.github && { label: 'GitHub', href: social.github },
    social.linkedin && { label: 'LinkedIn', href: social.linkedin },
    social.twitter && { label: 'Twitter', href: social.twitter },
    cv.email && { label: 'Email', href: `mailto:${cv.email}` },
  ].filter(Boolean);

  const activeSection = availableSections.find((section) => section.id === activeId) || availableSections[0];

  const cardsForSection =
    activeSection.id === 'about'
      ? []
      : activeSection.id === 'projects'
      ? groups.projects
      : activeSection.id === 'experience'
      ? groups.experience
      : activeSection.id === 'writing'
      ? groups.writing
      : groups.extras;

  const firstName = name.split(' ')[0];
  const aboutPreview = [
    ...groups.projects.slice(0, 3),
    ...groups.experience.slice(0, 2),
    ...groups.writing.slice(0, 1),
    ...groups.extras.slice(0, 2),
  ];

  return (
    <>
      <GlobalReset />
      <Main className="chester-how-main">
        <Container>
          <Nav
            sections={availableSections}
            activeId={activeSection.id}
            onSelect={setActiveId}
            sideLinks={sideLinks}
          />

          {activeSection.id === 'about' ? (
            <Grid>
              <Hero
                name={name}
                sections={availableSections}
                onSelect={setActiveId}
                currentTitle={cv.currentTitle}
                location={cv.location}
                website={cv.website}
                email={cv.email}
              />
              {aboutPreview.map((card) => (
                <Card key={card.id} card={card} onOpen={setOpenCard} />
              ))}
            </Grid>
          ) : (
            <>
              <SectionHeader title={activeSection.title} description={activeSection.description} />
              <Grid>
                {cardsForSection.map((card) => (
                  <Card key={card.id} card={card} onOpen={setOpenCard} />
                ))}
              </Grid>
            </>
          )}

          <Footer name={firstName} />
        </Container>
      </Main>
      <Modal card={openCard} onClose={() => setOpenCard(null)} />
    </>
  );
}
