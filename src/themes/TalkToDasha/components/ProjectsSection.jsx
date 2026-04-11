import React from 'react';
import { SectionCard } from './SectionCard';
import { MiniCard, MiniGrid } from './MiniCard';

export function ProjectsSection({ projects }) {
  if (!projects || projects.length === 0) return null;

  return (
    <SectionCard tone="sage" heading="Latest releases">
      <MiniGrid>
        {projects.slice(0, 6).map((project, i) => (
          <MiniCard
            key={i}
            rotate={i % 2 === 0 ? -1.2 : 1.4}
            title={project.name}
            body={project.description}
            href={project.url}
          />
        ))}
      </MiniGrid>
    </SectionCard>
  );
}
