import React from 'react';
import styled from 'styled-components';

function formatDate(value) {
  if (!value) return '';
  const normalized = String(value).trim();
  if (normalized.toLowerCase() === 'present') return 'Present';
  if (/^\d{4}$/.test(normalized)) return normalized;
  if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [year, month] = normalized.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
  return normalized;
}

function formatRange(start, end) {
  const left = formatDate(start);
  const right = formatDate(end);
  if (!left && !right) return '';
  if (!right) return left;
  return `${left} - ${right}`;
}

export function DetailPanel({ region, entries }) {
  return (
    <Panel>
      <Category $accent={region.tone === 'accent'}>{region.category}</Category>
      <Title>{region.label}</Title>
      <List>
        {entries.map((entry, index) => (
          <Item key={`${entry.title}-${index}`}>
            {entry.href ? (
              <ItemTitle href={entry.href} target="_blank" rel="noreferrer">
                {entry.title}
              </ItemTitle>
            ) : (
              <ItemHeading>{entry.title}</ItemHeading>
            )}
            {entry.meta ? <ItemMeta>{entry.meta}</ItemMeta> : null}
            {entry.summary ? <ItemSummary>{entry.summary}</ItemSummary> : null}
          </Item>
        ))}
      </List>
    </Panel>
  );
}

export function buildRegionEntries(cv, regionId, socialEntries) {
  if (!cv) return [];

  if (regionId === 'research') {
    return [...(cv.experience || []).slice(0, 3), ...(cv.education || []).slice(0, 2)].map((item) => ({
      title: item.title || item.company || item.institution,
      meta: item.company || item.institution || formatRange(item.startDate, item.endDate),
      summary: item.highlights?.[0] || item.area || formatRange(item.startDate, item.endDate),
    }));
  }

  if (regionId === 'case-studies') {
    return (cv.projects || []).slice(0, 4).map((project) => ({
      title: project.name || 'Project',
      meta: project.date || 'Project',
      summary: project.summary || project.highlights?.[0] || '',
      href: project.url || null,
    }));
  }

  if (regionId === 'art') {
    return [...(cv.volunteer || []).slice(0, 3), ...(cv.awards || []).slice(0, 2)].map((item) => ({
      title: item.title || item.company || item.name,
      meta: item.company || item.date || item.awarder || 'Selected practice',
      summary: item.highlights?.[0] || item.summary || item.area || '',
    }));
  }

  return socialEntries.slice(0, 5).map((item) => ({
    title: item.label,
    meta: 'Link',
    summary: item.url,
    href: item.url,
  }));
}

const Panel = styled.aside`
  width: min(320px, 100%);
  padding: 18px 0 0 24px;

  @media (max-width: 1240px) {
    padding: 24px 0 0;
  }
`;

const Category = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  color: ${(p) => (p.$accent ? '#f77c11' : '#8a8e90')};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h2`
  margin: 8px 0 14px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const List = styled.div`
  display: grid;
  gap: 12px;
`;

const Item = styled.article`
  padding: 14px 16px;
  border: 1px solid #d5dfeb;
  background: rgba(255, 255, 255, 0.72);
`;

const ItemTitle = styled.a`
  color: #1f2328;
  text-decoration: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const ItemHeading = styled.div`
  color: #1f2328;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const ItemMeta = styled.div`
  margin-top: 6px;
  color: #8a8e90;
  font-size: 0.82rem;
`;

const ItemSummary = styled.p`
  margin: 8px 0 0;
  color: #8a8e90;
  font-size: 0.88rem;
  line-height: 1.45;
`;
