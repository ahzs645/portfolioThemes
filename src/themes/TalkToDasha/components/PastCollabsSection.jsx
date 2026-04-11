import React from 'react';
import { FolderCard } from './FolderCard';
import { formatDateRange } from '../../../utils/cvHelpers';

export function PastCollabsSection({ jobs }) {
  if (!jobs || jobs.length === 0) return null;
  const items = jobs.slice(0, 3).map((job) => ({
    label: job.company,
    meta: formatDateRange(job.startDate, job.endDate) || 'Past role',
    detail: job.title,
  }));

  return (
    <FolderCard tone="lavender" label="Past collabs" items={items} />
  );
}
