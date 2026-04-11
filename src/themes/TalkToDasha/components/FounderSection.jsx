import React from 'react';
import { SectionCard } from './SectionCard';
import { MiniCard, MiniGrid } from './MiniCard';

export function FounderSection({ awards = [], certifications = [] }) {
  if (awards.length === 0 && certifications.length === 0) return null;

  const items = [
    ...awards.slice(0, 4).map((award, i) => ({
      key: `a-${i}`,
      eyebrow: award.date,
      title: award.title,
      body: award.issuer,
    })),
    ...certifications.slice(0, 4).map((cert, i) => ({
      key: `c-${i}`,
      eyebrow: cert.date,
      title: cert.name || cert.title,
      body: cert.issuer,
    })),
  ];

  return (
    <SectionCard tone="mustard" heading="Recognitions">
      <MiniGrid>
        {items.map((item, i) => (
          <MiniCard
            key={item.key}
            rotate={i % 2 === 0 ? -1.5 : 1.2}
            eyebrow={item.eyebrow}
            title={item.title}
            body={item.body}
          />
        ))}
      </MiniGrid>
    </SectionCard>
  );
}
