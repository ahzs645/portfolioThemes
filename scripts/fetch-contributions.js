#!/usr/bin/env node
/**
 * Fetches GitHub contribution data from the public profile page
 * and saves it as JSON for the portfolio Activity component.
 *
 * Usage: node scripts/fetch-contributions.js [username]
 * If no username is given, extracts it from public/CV.yaml
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Extract username ───────────────────────────────────────

function getUsernameFromCV() {
  try {
    const yaml = readFileSync(resolve(ROOT, 'public/CV.yaml'), 'utf8');
    const match = yaml.match(/github\.com\/([a-zA-Z0-9_-]+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

// ── Parse contributions HTML ───────────────────────────────

function parseContributions(html) {
  const days = [];

  // Extract all td elements with data-date and data-level
  const tdRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d)"/g;
  const dateToId = {};
  let match;

  while ((match = tdRegex.exec(html)) !== null) {
    const [, date, id, level] = match;
    dateToId[id] = date;
    days.push({ date, level: parseInt(level), count: 0 });
  }

  // Extract counts from tool-tip elements
  const tipRegex = /for="(contribution-day-component-[^"]+)"[^>]*>(\d+)\s+contribution/g;
  const countMap = {};

  while ((match = tipRegex.exec(html)) !== null) {
    const [, id, count] = match;
    const date = dateToId[id];
    if (date) countMap[date] = parseInt(count);
  }

  // Merge counts into days
  for (const day of days) {
    if (countMap[day.date]) {
      day.count = countMap[day.date];
    }
  }

  // Extract total from heading
  let totalYear = 0;
  const totalMatch = html.match(/([\d,]+)\s*\n\s*contributions\s*\n\s*in the last year/);
  if (totalMatch) {
    totalYear = parseInt(totalMatch[1].replace(/,/g, ''));
  }

  return {
    days: days.sort((a, b) => a.date.localeCompare(b.date)),
    totalYear,
    fetchedAt: new Date().toISOString(),
  };
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  const username = process.argv[2] || getUsernameFromCV();

  if (!username) {
    console.error('Could not determine GitHub username. Pass it as an argument or add a GitHub URL to CV.yaml.');
    process.exit(1);
  }

  console.log(`Fetching contributions for ${username}...`);

  const res = await fetch(`https://github.com/users/${username}/contributions`);
  if (!res.ok) {
    console.error(`Failed to fetch contributions: ${res.status}`);
    process.exit(1);
  }

  const html = await res.text();
  const data = parseContributions(html);

  console.log(`  ${data.days.length} days, ${data.totalYear} contributions in the last year`);

  const outPath = resolve(ROOT, 'public/github-activity.json');
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`  Saved to public/github-activity.json`);
}

main().catch((err) => {
  console.error('Error fetching contributions:', err.message);
  // Don't fail the build — the Activity component handles missing data gracefully
  process.exit(0);
});
