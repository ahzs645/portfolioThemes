import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import ProjectCard from './ProjectCard';

export default function ProjectsSection({ cv }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll('[data-card]');
    gsap.fromTo(
      cards,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  const projects = cv.projects.slice(0, 6).map((p, i) => ({
    title: p.name,
    role: p.highlights?.[0] || p.summary || '',
    description: p.description || '',
    href: p.url || null,
    index: i,
  }));

  const experience = cv.experience.slice(0, 4).map((e, i) => ({
    title: e.company,
    role: e.title,
    description: e.summary || '',
    href: cv.website || null,
    index: i,
  }));

  return (
    <TabPage ref={ref}>
      <Inner>
        <SectionLabel>PROJECTS</SectionLabel>

        {experience.length > 0 && (
          <Group>
            <GroupLabel>Select Clients</GroupLabel>
            <CardGrid>
              {experience.map((item, i) => (
                <div key={`exp-${i}`} data-card>
                  <ProjectCard {...item} />
                </div>
              ))}
            </CardGrid>
          </Group>
        )}

        {projects.length > 0 && (
          <Group>
            <GroupLabel>Featured Work</GroupLabel>
            <CardGrid>
              {projects.map((item, i) => (
                <div key={`proj-${i}`} data-card>
                  <ProjectCard {...item} />
                </div>
              ))}
            </CardGrid>
          </Group>
        )}
      </Inner>
    </TabPage>
  );
}

const TabPage = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const Inner = styled.div`
  padding: 80px 64px 120px;
  min-height: 100%;

  @media (max-width: 809px) {
    padding: 70px 24px 120px;
  }
`;

const SectionLabel = styled.h2`
  margin: 0 0 40px;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgb(119, 111, 100);
  text-transform: uppercase;
`;

const Group = styled.div`
  margin-bottom: 48px;
`;

const GroupLabel = styled.h3`
  margin: 0 0 20px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 22px;
  color: rgb(41, 72, 110);
  letter-spacing: -0.02em;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 1109px) {
    grid-template-columns: 1fr;
  }
`;
