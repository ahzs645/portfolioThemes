import React from 'react';
import { FolderCard } from './FolderCard';

export function FounderSection({ awards = [], certifications = [] }) {
  if (awards.length === 0 && certifications.length === 0) return null;

  const items = [
    ...awards.slice(0, 3).map((a) => ({
      label: a.title,
      detail: a.issuer || a.summary || 'Recognition',
    })),
    ...certifications.slice(0, 3).map((c) => ({
      label: c.name || c.title,
      detail: c.issuer || c.summary || 'Certification',
    })),
  ].slice(0, 3);

  return <FolderCard tone="mustard" label="Founder" items={items} variant="founder" />;
}
