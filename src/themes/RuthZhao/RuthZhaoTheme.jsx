import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
`;

const palette = {
  bg: '#f7fafa',
  surface: '#ffffff',
  text: '#14212b',
  muted: '#62717d',
  border: '#d5dfeb',
  borderStrong: '#c2d0dd',
  accent: '#f77c11',
  accentSoft: '#dfe8e8',
};

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
  if (!left && !right) return null;
  if (!right) return left;
  return `${left} - ${right}`;
}

function getPrimarySocial(cv, preferredNetworks) {
  const links = cv?.socialLinks || [];
  const desired = preferredNetworks.map((item) => item.toLowerCase());
  return links.find((link) => desired.includes(String(link.label || '').toLowerCase())) || null;
}

function getFeatureCards(cv) {
  const projectCards = (cv?.projects || []).slice(0, 4).map((project) => ({
    eyebrow: project.date || 'Project',
    title: project.name || 'Untitled project',
    summary: project.summary || 'No summary provided.',
    href: project.url || null,
    meta: Array.isArray(project.highlights) ? project.highlights[0] : null,
  }));

  const workCards = (cv?.experience || []).slice(0, 2).map((item) => ({
    eyebrow: formatRange(item.startDate, item.endDate) || 'Experience',
    title: item.company || item.title || 'Role',
    summary: item.highlights?.[0] || item.title || 'Professional experience.',
    href: null,
    meta: item.title || null,
  }));

  return [...projectCards, ...workCards].slice(0, 6);
}

export function RuthZhaoTheme() {
  const cv = useCV();

  if (!cv) return null;

  const linkedin = getPrimarySocial(cv, ['linkedin']);
  const github = getPrimarySocial(cv, ['github']);
  const primaryLink = linkedin || github || (cv.website ? { url: cv.website, label: 'Website' } : null);
  const featureCards = getFeatureCards(cv);
  const archiveItems = [...(cv.education || []), ...(cv.volunteer || [])].slice(0, 5);

  return (
    <>
      <FontLoader />
      <Page>
        <Shell>
          <IntroPanel>
            <BadgeRow>
              <Glyph aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </Glyph>
              <Wordmark>{cv.name || 'Your Name'}</Wordmark>
            </BadgeRow>

            <Prompt>What do you dream of?</Prompt>
            <Lead>
              {cv.about || `${cv.name || 'This person'} is building at the intersection of research, systems, and care.`}
            </Lead>

            <MetaLine>
              {cv.currentJobTitle ? <span>{cv.currentJobTitle}</span> : null}
              {cv.location ? <span>{cv.location}</span> : null}
            </MetaLine>

            <ActionRow>
              {primaryLink?.url ? (
                <PrimaryAction href={primaryLink.url} target="_blank" rel="noreferrer">
                  Open {primaryLink.label || 'Link'}
                </PrimaryAction>
              ) : null}
              {cv.email ? <SecondaryAction href={`mailto:${cv.email}`}>{cv.email}</SecondaryAction> : null}
            </ActionRow>
          </IntroPanel>

          <ContentGrid>
            <Column>
              <Section>
                <SectionLabel>Selected work</SectionLabel>
                <CardGrid>
                  {featureCards.map((card, index) => {
                    const content = (
                      <FeatureCard $accent={index === 0}>
                        <CardEyebrow>{card.eyebrow}</CardEyebrow>
                        <CardTitle>{card.title}</CardTitle>
                        <CardSummary>{card.summary}</CardSummary>
                        {card.meta ? <CardMeta>{card.meta}</CardMeta> : null}
                      </FeatureCard>
                    );

                    if (!card.href) {
                      return <div key={`${card.title}-${index}`}>{content}</div>;
                    }

                    return (
                      <CardLink href={card.href} key={`${card.title}-${index}`} target="_blank" rel="noreferrer">
                        {content}
                      </CardLink>
                    );
                  })}
                </CardGrid>
              </Section>

              <Section>
                <SectionLabel>Experience</SectionLabel>
                <Timeline>
                  {(cv.experience || []).slice(0, 6).map((item, index) => (
                    <TimelineItem key={`${item.company}-${item.title}-${index}`}>
                      <TimelineDate>{formatRange(item.startDate, item.endDate) || 'Recent'}</TimelineDate>
                      <TimelineBody>
                        <TimelineTitle>{item.title}</TimelineTitle>
                        <TimelineSubtitle>{item.company}{item.location ? `, ${item.location}` : ''}</TimelineSubtitle>
                        {item.highlights?.[0] ? <TimelineText>{item.highlights[0]}</TimelineText> : null}
                      </TimelineBody>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Section>
            </Column>

            <Sidebar>
              <Section>
                <SectionLabel>Archive</SectionLabel>
                <ArchiveList>
                  {archiveItems.map((item, index) => (
                    <ArchiveItem key={index}>
                      <ArchiveTitle>{item.institution || item.company || item.name || 'Entry'}</ArchiveTitle>
                      <ArchiveMeta>
                        {item.degree || item.position || item.area || formatDate(item.date) || 'Details'}
                      </ArchiveMeta>
                    </ArchiveItem>
                  ))}
                </ArchiveList>
              </Section>

              <Section>
                <SectionLabel>Signals</SectionLabel>
                <SignalList>
                  {(cv.projects || []).slice(0, 4).map((project, index) => (
                    <SignalItem key={`${project.name}-${index}`}>
                      <span>{project.name}</span>
                      <SignalYear>{project.date || 'Now'}</SignalYear>
                    </SignalItem>
                  ))}
                </SignalList>
              </Section>

              <Section>
                <SectionLabel>Links</SectionLabel>
                <LinksList>
                  {(cv.socialLinks || []).slice(0, 5).map((link) => (
                    <LinkItem href={link.url} key={link.url} target="_blank" rel="noreferrer">
                      <span>{link.label}</span>
                      <Arrow aria-hidden="true">+</Arrow>
                    </LinkItem>
                  ))}
                  {cv.website ? (
                    <LinkItem href={cv.website} target="_blank" rel="noreferrer">
                      <span>Website</span>
                      <Arrow aria-hidden="true">+</Arrow>
                    </LinkItem>
                  ) : null}
                </LinksList>
              </Section>
            </Sidebar>
          </ContentGrid>
        </Shell>
      </Page>
    </>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(247, 124, 17, 0.08), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, ${palette.bg} 40%, #f2f6f6 100%);
  color: ${palette.text};
  font-family: 'Inter', sans-serif;
`;

const Shell = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px 72px;

  @media (min-width: 900px) {
    padding: 40px 28px 96px;
  }
`;

const IntroPanel = styled.section`
  display: grid;
  gap: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid ${palette.border};
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(20, 33, 43, 0.06);
  backdrop-filter: blur(10px);
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Glyph = styled.div`
  width: 48px;
  height: 36px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;

  span {
    border-radius: 4px;
    background: ${palette.accentSoft};
  }

  span:nth-child(3) {
    grid-column: 3 / 5;
    grid-row: 2 / 3;
    background: ${palette.accent};
  }
`;

const Wordmark = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Prompt = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.75rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  max-width: 11ch;
`;

const Lead = styled.p`
  margin: 0;
  max-width: 60ch;
  color: ${palette.muted};
  font-size: 1rem;
  line-height: 1.7;
`;

const MetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: ${palette.muted};
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const actionStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.84rem;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const PrimaryAction = styled.a`
  ${actionStyles}
  color: white;
  background: ${palette.accent};
  box-shadow: 0 14px 30px rgba(247, 124, 17, 0.28);
`;

const SecondaryAction = styled.a`
  ${actionStyles}
  color: ${palette.text};
  background: ${palette.surface};
  border: 1px solid ${palette.borderStrong};
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 24px;
  margin-top: 24px;

  @media (min-width: 1080px) {
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    align-items: start;
  }
`;

const Column = styled.div`
  display: grid;
  gap: 24px;
`;

const Sidebar = styled.aside`
  display: grid;
  gap: 24px;
`;

const Section = styled.section`
  padding: 22px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid ${palette.border};
  border-radius: 24px;
`;

const SectionLabel = styled.h2`
  margin: 0 0 18px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: ${palette.muted};
`;

const CardGrid = styled.div`
  display: grid;
  gap: 14px;

  @media (min-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const CardLink = styled.a`
  color: inherit;
  text-decoration: none;
`;

const FeatureCard = styled.article`
  height: 100%;
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid ${palette.border};
  background: ${({ $accent }) =>
    $accent
      ? 'linear-gradient(180deg, rgba(247, 124, 17, 0.96), rgba(235, 111, 4, 0.96))'
      : palette.surface};
  color: ${({ $accent }) => ($accent ? '#fff' : palette.text)};
  box-shadow: ${({ $accent }) =>
    $accent ? '0 18px 36px rgba(247, 124, 17, 0.22)' : 'none'};
  transition: transform 180ms ease, box-shadow 180ms ease;

  ${CardLink}:hover & {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px rgba(20, 33, 43, 0.08);
  }
`;

const CardEyebrow = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.2;
`;

const CardSummary = styled.p`
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.6;
  opacity: 0.9;
`;

const CardMeta = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  opacity: 0.8;
`;

const Timeline = styled.div`
  display: grid;
  gap: 18px;
`;

const TimelineItem = styled.article`
  display: grid;
  gap: 8px;
  padding-top: 18px;
  border-top: 1px solid ${palette.border};

  &:first-child {
    padding-top: 0;
    border-top: 0;
  }

  @media (min-width: 760px) {
    grid-template-columns: 160px minmax(0, 1fr);
  }
`;

const TimelineDate = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  color: ${palette.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const TimelineBody = styled.div`
  display: grid;
  gap: 6px;
`;

const TimelineTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

const TimelineSubtitle = styled.div`
  color: ${palette.muted};
  font-size: 0.92rem;
`;

const TimelineText = styled.p`
  margin: 0;
  color: ${palette.muted};
  line-height: 1.6;
`;

const ArchiveList = styled.div`
  display: grid;
  gap: 12px;
`;

const ArchiveItem = styled.div`
  padding: 14px 0;
  border-top: 1px solid ${palette.border};

  &:first-child {
    padding-top: 0;
    border-top: 0;
  }
`;

const ArchiveTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 0.98rem;
`;

const ArchiveMeta = styled.div`
  color: ${palette.muted};
  font-size: 0.9rem;
`;

const SignalList = styled.div`
  display: grid;
  gap: 10px;
`;

const SignalItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: ${palette.surface};
  border: 1px solid ${palette.border};
  font-size: 0.94rem;
`;

const SignalYear = styled.span`
  color: ${palette.muted};
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
`;

const LinksList = styled.div`
  display: grid;
`;

const LinkItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid ${palette.border};
  color: inherit;
  text-decoration: none;

  &:first-child {
    padding-top: 0;
    border-top: 0;
  }
`;

const Arrow = styled.span`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${palette.accent};
  color: white;
  font-family: 'IBM Plex Mono', monospace;
  line-height: 1;
`;
