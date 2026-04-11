import React from 'react';
import { FolderCard } from './FolderCard';

export function VolunteerSection({ volunteer = [] }) {
  if (volunteer.length === 0) return null;

  const items = volunteer.slice(0, 3).map((entry) => ({
    label: entry.company,
    detail: entry.title || 'Volunteer',
  }));

  return <FolderCard tone="terracotta" label="Volunteer" items={items} variant="past" />;
}
