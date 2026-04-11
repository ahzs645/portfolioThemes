import React from 'react';
import { FolderCard } from './FolderCard';

export function SocialSection({ socials }) {
  if (!socials || socials.length === 0) return null;
  const items = socials.slice(0, 3).map((social) => ({
    label: social.label,
    meta: 'Open',
    detail: social.url?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    href: social.url,
  }));

  return (
    <FolderCard tone="terracotta" label="Social Media" items={items} />
  );
}
