import React from 'react';
import { FolderCard } from './FolderCard';

export function FounderSection({ education = [] }) {
  const items = education.slice(0, 3).map((entry) => ({
    label: entry.degree || entry.school || entry.institution || 'Education',
    detail: [entry.institution || entry.school, entry.area]
      .filter(Boolean)
      .join('\n'),
  }));

  if (items.length === 0) return null;

  return <FolderCard tone="mustard" label="Education" items={items} variant="founder" />;
}
