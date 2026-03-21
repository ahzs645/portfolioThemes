import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from './ProjectCard';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectsSection({ cv }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelector('[data-label]'),
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      }
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
    <Section id="projects" ref={ref}>
      <SectionLabel data-label>PROJECTS</SectionLabel>

      {experience.length > 0 && (
        <Group>
          <GroupLabel>Select Clients</GroupLabel>
          <CardGrid>
            {experience.map((item, i) => (
              <ProjectCard key={`exp-${i}`} {...item} />
            ))}
          </CardGrid>
        </Group>
      )}

      {projects.length > 0 && (
        <Group>
          <GroupLabel>Featured Work</GroupLabel>
          <CardGrid>
            {projects.map((item, i) => (
              <ProjectCard key={`proj-${i}`} {...item} />
            ))}
          </CardGrid>
        </Group>
      )}
    </Section>
  );
}

const Section = styled.section`
  padding: 60px 64px 80px;

  @media (max-width: 809px) {
    padding: 40px 24px 60px;
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
  font-family: 'HAL Timezone', 'Cormorant Garamond', Georgia, serif;
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
