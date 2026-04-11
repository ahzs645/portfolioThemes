import React from 'react';
import { FolderCard } from './FolderCard';
import { formatMonthYear } from '../../../utils/cvHelpers';

export function DevelopmentSection({ items = [] }) {
  if (items.length === 0) return null;

  const folderItems = items.slice(0, 3).map((entry) => ({
    label: entry.name || 'Professional Development',
    detail: [entry.summary, formatMonthYear(entry.date)]
      .filter(Boolean)
      .join('\n'),
  }));

  return <FolderCard tone="mustard" label="Development" items={folderItems} variant="founder" />;
}
