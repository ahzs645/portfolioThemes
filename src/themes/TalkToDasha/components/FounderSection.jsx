import React from 'react';
import { FolderCard } from './FolderCard';
import { FileTabStack, FileTab } from './FileTab';

export function FounderSection({ awards = [], certifications = [] }) {
  if (awards.length === 0 && certifications.length === 0) return null;

  const items = [
    ...awards.slice(0, 3).map((a) => ({
      label: a.title,
      sub: a.issuer,
    })),
    ...certifications.slice(0, 3).map((c) => ({
      label: c.name || c.title,
      sub: c.issuer,
    })),
  ].slice(0, 3);

  return (
    <FolderCard tone="mustard" label="Founder">
      <FileTabStack>
        {items.map((item, i) => (
          <FileTab
            key={i}
            index={i}
            total={items.length}
            label={item.label}
            sub={item.sub}
          />
        ))}
      </FileTabStack>
    </FolderCard>
  );
}
