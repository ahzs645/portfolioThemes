import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';
import { useGitHubContext } from '../../../contexts/GitHubContext';

const DAYS = 30;
const CELL_SIZE = 11;
const CELL_GAP = 3;

function buildGrid(events) {
  // Count push events per day over the last 30 days
  const now = new Date();
  const counts = new Array(DAYS).fill(0);
  let total = 0;

  for (const e of events) {
    if (e.type !== 'PushEvent') continue;
    const d = new Date(e.createdAt);
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < DAYS) {
      const commitCount = e.commits?.length || 1;
      counts[DAYS - 1 - diff] += commitCount;
      total += commitCount;
    }
  }

  const max = Math.max(...counts, 1);
  return { counts, total, max };
}

function getLevel(count, max) {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export default function Activity({ theme }) {
  const { github, loading, error } = useGitHubContext();

  const { counts, total, max } = useMemo(() => {
    if (!github?.events) return { counts: new Array(DAYS).fill(0), total: 0, max: 1 };
    return buildGrid(github.events);
  }, [github?.events]);

  // Arrange into rows (7 days per column, like GitHub)
  const cols = Math.ceil(DAYS / 7);

  return (
    <Section>
      <Header>
        <Label $theme={theme}>Activity</Label>
      </Header>

      <Card $theme={theme}>
        <GridRow>
          <Grid>
            {counts.map((count, i) => (
              <Cell
                key={i}
                $theme={theme}
                $level={getLevel(count, max)}
                title={`${count} commit${count !== 1 ? 's' : ''}`}
              />
            ))}
          </Grid>
        </GridRow>

        <Stats>
          <StatRow>
            <StatLabel $theme={theme}>Last {DAYS} days</StatLabel>
            <StatValue $theme={theme}>
              {loading ? '—' : total}
              <StatUnit $theme={theme}> commits</StatUnit>
            </StatValue>
          </StatRow>
          {github && (
            <StatRow>
              <StatLabel $theme={theme}>Public repos</StatLabel>
              <StatValue $theme={theme}>{github.repoCount}</StatValue>
            </StatRow>
          )}
          {github?.followers != null && (
            <StatRow>
              <StatLabel $theme={theme}>Followers</StatLabel>
              <StatValue $theme={theme}>{github.followers}</StatValue>
            </StatRow>
          )}
        </Stats>

        {github?.recentPushes?.length > 0 && (
          <RecentList>
            <StatLabel $theme={theme} style={{ marginBottom: 8 }}>Recent pushes</StatLabel>
            {github.recentPushes.slice(0, 4).map((push, i) => (
              <PushEntry key={push.id || i} $theme={theme}>
                <PushRepo
                  $theme={theme}
                  as={push.repoUrl ? 'a' : 'span'}
                  href={push.repoUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {push.repo?.split('/')[1] || push.repo}
                </PushRepo>
                <PushMessage $theme={theme}>
                  {push.commits?.[0]?.message || push.branch || 'push'}
                </PushMessage>
              </PushEntry>
            ))}
          </RecentList>
        )}

        {error && !github && (
          <ErrorText $theme={theme}>{error}</ErrorText>
        )}
      </Card>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 0 0 12px;
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

const Card = styled.div`
  background: ${p => p.$theme.surface};
  border: 1px solid ${p => p.$theme.border};
  border-radius: 10px;
  padding: 16px 20px;
`;

const GridRow = styled.div`
  margin-bottom: 16px;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${CELL_GAP}px;
`;

const levelColors = (theme, level) => {
  const light = [
    theme.border,         // 0 - empty
    `${theme.green}40`,   // 1 - low
    `${theme.green}80`,   // 2 - med
    `${theme.green}b3`,   // 3 - high
    theme.green,          // 4 - max
  ];
  return light[level] || light[0];
};

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  border-radius: 2px;
  background: ${p => levelColors(p.$theme, p.$level)};
  transition: background 0.15s ease;
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px dotted ${p => p.$theme?.border || '#e3e8ee'};
  padding-top: 12px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatLabel = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.04em;
  color: ${p => p.$theme.muted};
`;

const StatValue = styled.span`
  font-family: ${FONT.mono};
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  letter-spacing: -0.02em;
`;

const StatUnit = styled.span`
  font-weight: 400;
  color: ${p => p.$theme.muted};
  font-size: 11px;
`;

const RecentList = styled.div`
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px dotted ${p => p.$theme?.border || '#e3e8ee'};
  display: flex;
  flex-direction: column;
`;

const PushEntry = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 0;
  min-width: 0;
`;

const PushRepo = styled.span`
  font-family: ${FONT.mono};
  font-size: 12px;
  line-height: 18px;
  color: ${p => p.$theme.heading};
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: ${p => p.$theme.blue};
  }
`;

const PushMessage = styled.span`
  font-family: ${FONT.sans};
  font-size: 12px;
  line-height: 18px;
  color: ${p => p.$theme.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const ErrorText = styled.p`
  font-family: ${FONT.mono};
  font-size: 11px;
  color: ${p => p.$theme.muted};
  margin: 8px 0 0;
`;
