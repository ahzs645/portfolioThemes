import React from 'react';
import { FolderCard } from './FolderCard';
import { FileTabStack, FileTab } from './FileTab';

export function PastCollabsSection({ jobs }) {
  if (!jobs || jobs.length === 0) return null;
  const items = jobs.slice(0, 3);

  return (
    <FolderCard tone="lavender" label="Past collabs">
      <FileTabStack>
        {items.map((job, i) => (
          <FileTab
            key={i}
            index={i}
            total={items.length}
            label={job.company}
            sub={job.title}
          />
        ))}
      </FileTabStack>
    </FolderCard>
  );
}
