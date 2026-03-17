import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { FONT } from '../utils/tokens';
import { useGitHubContext } from '../../../contexts/GitHubContext';

const DAYS = 30;

/**
 * Build bar chart data from contribution calendar (build-time data).
 * Each bar = one day, using real contribution counts.
 */
function buildBars(contributions) {
  const now = new Date();
  const counts = new Array(DAYS).fill(0);
  let total = 0;

  if (!contributions?.days) return { counts, total, max: 1 };

  // Build a date→count lookup from contribution data
  const lookup = {};
  for (const day of contributions.days) {
    lookup[day.date] = day.count;
  }

  // Fill last N days
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const count = lookup[key] || 0;
    counts[i] = count;
    total += count;
  }

  const max = Math.max(...counts, 1);
  return { counts, total, max };
}

function getBarOpacity(count, max) {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.15) return 0.22;
  if (ratio <= 0.3) return 0.333;
  if (ratio <= 0.45) return 0.44;
  if (ratio <= 0.6) return 0.565;
  if (ratio <= 0.8) return 0.72;
  return 1;
}

export default function Activity({ theme, baseDelay = 460 }) {
  const { github, loading } = useGitHubContext();

  const { counts, total, max } = useMemo(() => {
    if (!github?.contributions) return { counts: new Array(DAYS).fill(0), total: 0, max: 1 };
    return buildBars(github.contributions);
  }, [github?.contributions]);

  return (
    <Section>
      <FadeIn $delay={baseDelay}>
        <SectionHeader $theme={theme}>
          <LabelRow>
            <Label $theme={theme}>Activity</Label>
            <BlinkCursor $theme={theme} />
          </LabelRow>
        </SectionHeader>
      </FadeIn>

      <FadeIn $delay={baseDelay + 50}>
        <StatsRow>
          <StatLabel $theme={theme}>Last {DAYS} days</StatLabel>
          <DottedFill $theme={theme} />
          <StatLabel $theme={theme}>
            {loading ? '…' : total} contributions
          </StatLabel>
        </StatsRow>
      </FadeIn>

      <BarChart>
        {counts.map((count, i) => (
          <BarSlot key={i}>
            <Bar
              $theme={theme}
              $opacity={getBarOpacity(count, max)}
              $empty={count === 0}
              title={`${count} contribution${count !== 1 ? 's' : ''}`}
            />
          </BarSlot>
        ))}
      </BarChart>
    </Section>
  );
}

/* ── Animations ───────────────────────────────────────── */

const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const FadeIn = styled.div`
  opacity: 0;
  animation: ${fadeSlideUp} 1.2s forwards;
  animation-delay: ${p => p.$delay || 0}ms;
`;

/* ── Layout ───────────────────────────────────────────── */

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  padding-top: 32px;
  border-top: 1px dotted ${p => p.$theme.border};
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Label = styled.h2`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${p => p.$theme.muted};
`;

const BlinkCursor = styled.span`
  display: inline-block;
  width: 7px;
  height: 11px;
  border-radius: 1px;
  background: ${p => p.$theme.muted};
  animation: ${blink} 1s step-end infinite;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
`;

const StatLabel = styled.span`
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
`;

const DottedFill = styled.span`
  flex: 1;
  height: 0;
  margin: 0 12px;
  border-bottom: 1px dotted ${p => p.$theme.border};
`;

const BarChart = styled.div`
  display: flex;
  gap: 3px;
  width: 100%;
  margin-top: 10px;
`;

const BarSlot = styled.div`
  flex: 1;
  position: relative;
`;

const Bar = styled.div`
  width: 100%;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.15s, box-shadow 0.15s;
  background-color: ${p => {
    if (p.$empty) return p.$theme.barEmpty;
    const g = p.$theme.green;
    const r = parseInt(g.slice(1, 3), 16);
    const gr = parseInt(g.slice(3, 5), 16);
    const b = parseInt(g.slice(5, 7), 16);
    if (p.$opacity >= 1) return g;
    return `rgba(${r}, ${gr}, ${b}, ${p.$opacity})`;
  }};
`;
