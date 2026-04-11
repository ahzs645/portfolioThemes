import React from 'react';
import { SectionCard } from './SectionCard';
import { MiniCard, MiniGrid } from './MiniCard';
import { formatMonthYear } from '../../../utils/cvHelpers';

export function PastCollabsSection({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <SectionCard tone="lavender" heading="Past collabs">
      <MiniGrid>
        {jobs.slice(0, 6).map((job, i) => {
          const start = formatMonthYear(job.startDate);
          const end = job.endDate ? formatMonthYear(job.endDate) : '';
          const eyebrow = end ? `${start} – ${end}` : start;
          return (
            <MiniCard
              key={i}
              rotate={i % 2 === 0 ? 1.3 : -1.1}
              eyebrow={eyebrow}
              title={job.company}
              body={job.title}
            />
          );
        })}
      </MiniGrid>
    </SectionCard>
  );
}
