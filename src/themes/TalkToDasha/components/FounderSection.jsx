import React from 'react';
import { FolderCard } from './FolderCard';

export function FounderSection({ education = [], professionalDevelopment = [] }) {
  const items = [
    ...education.map((entry) => ({
      label: entry.degree || entry.school || entry.institution || 'Education',
      detail: [entry.institution || entry.school, entry.area]
        .filter(Boolean)
        .join('\n'),
    })),
    ...professionalDevelopment.map((entry) => ({
      label: entry.name || 'Professional Development',
      detail: [entry.summary, entry.date]
        .filter(Boolean)
        .join('\n'),
    })),
  ].slice(0, 3);

  if (items.length === 0) return null;

  return <FolderCard tone="mustard" label="Education" items={items} variant="founder" />;
}
