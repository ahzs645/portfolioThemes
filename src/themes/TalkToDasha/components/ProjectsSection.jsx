import React from 'react';
import { FolderCard } from './FolderCard';

export function ProjectsSection({ projects }) {
  if (!projects || projects.length === 0) return null;
  const items = projects.slice(0, 3).map((project) => ({
    label: project.name,
    detail: project.summary || project.highlights?.[0] || 'Open project',
    href: project.url,
  }));

  return (
    <FolderCard tone="sage" label="Projects" items={items} />
  );
}
