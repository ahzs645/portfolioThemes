import React from 'react';
import { FolderCard } from './FolderCard';

export function SocialSection({ socials }) {
  if (!socials || socials.length === 0) return null;
  const items = socials.slice(0, 3).map((social) => ({
    label: social.label,
    detail: social.url?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    href: social.url,
  }));

  return (
    <FolderCard tone="sage" label="Social Media" items={items} variant="social" />
  );
}
