import React from 'react';
import { FolderCard } from './FolderCard';
import { FileTabStack, FileTab } from './FileTab';

export function ProjectsSection({ projects }) {
  if (!projects || projects.length === 0) return null;
  const items = projects.slice(0, 3);

  return (
    <FolderCard tone="sage" label="Latest release">
      <FileTabStack>
        {items.map((project, i) => (
          <FileTab
            key={i}
            index={i}
            total={items.length}
            label={project.name}
            sub={project.description}
          />
        ))}
      </FileTabStack>
    </FolderCard>
  );
}
