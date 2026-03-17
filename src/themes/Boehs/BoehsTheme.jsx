import React, { useMemo, useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatMonthYear } from '../../utils/cvHelpers';
import { randomGreeting } from './greetings';
import { ProceduralTrees } from './ProceduralTrees';
import { AnimatedFlower } from './AnimatedFlower';

/* ── colour helpers ──────────────────────────────────────────── */

function rainbow(index, total) {
  return `hsl(${Math.round((360 / total) * index)}, 50%, 60%)`;
}

const FOOTER_LINK_COUNT = 11;

/* ── data helpers ────────────────────────────────────────────── */

const statusFallbacks = [
  'keeps a small internet home',
  'likes tools that age well',
  'prefers careful software over noisy software',
  'still believes personal sites should feel personal',
];

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatRange(start, end) {
  const startLabel = formatMonthYear(start);
  const endLabel = end ? formatMonthYear(end) : '';
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel || endLabel || '';
}

function summarizeHighlight(highlights = []) {
  return Array.isArray(highlights) && highlights.length > 0 ? highlights[0] : '';
}

/* ── animation ───────────────────────────────────────────────── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── main component ──────────────────────────────────────────── */

export function BoehsTheme({ darkMode }) {
  const cv = useCV();
  const [statusIndex, setStatusIndex] = useState(0);
  const [greeting] = useState(() => randomGreeting());

  const cycleStatus = useCallback(
    () => setStatusIndex((i) => (i + 1) % statusLines.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* derived data */
  const introParagraphs = useMemo(() => {
    if (!cv) return [];
    const paragraphs = splitParagraphs(cv.about);
    if (paragraphs.length > 0) return paragraphs;
    const generated = [];
    if (cv.currentJobTitle && cv.location) {
      generated.push(`Current work centers on ${cv.currentJobTitle} in ${cv.location}.`);
    } else if (cv.currentJobTitle) {
      generated.push(`Current work centers on ${cv.currentJobTitle}.`);
    } else if (cv.location) {
      generated.push(`This page is organized from ${cv.location}.`);
    }
    if (cv.projects.length > 0) {
      generated.push(
        `This version keeps the page calm and readable while still surfacing ${cv.projects.length} active project${cv.projects.length === 1 ? '' : 's'} and the work behind them.`
      );
    } else {
      generated.push('This version keeps the page calm, readable, and focused on the work itself.');
    }
    return generated;
  }, [cv]);

  const statusLines = useMemo(() => {
    if (!cv) return statusFallbacks;
    return [
      cv.currentJobTitle ? `currently: ${cv.currentJobTitle}` : null,
      cv.location ? `based in ${cv.location}` : null,
      cv.projects.length > 0
        ? `building across ${cv.projects.length} active project${cv.projects.length === 1 ? '' : 's'}`
        : null,
      ...statusFallbacks,
    ].filter(Boolean);
  }, [cv]);

  const workItems = useMemo(() => cv?.experience.slice(0, 6) || [], [cv]);
  const projectItems = useMemo(() => cv?.projects.slice(0, 6) || [], [cv]);
  const educationItems = useMemo(() => cv?.education.slice(0, 4) || [], [cv]);
  const volunteerItems = useMemo(() => cv?.volunteer.slice(0, 3) || [], [cv]);

  const fieldNotes = useMemo(() => {
    if (!cv) return [];
    return [
      ...cv.publications.map((item) => ({
        label: item.title,
        meta: [item.journal, item.date].filter(Boolean).join(' / '),
        href: item.doi ? `https://doi.org/${item.doi}` : item.url || null,
      })),
      ...cv.presentations.map((item) => ({
        label: item.name,
        meta: [item.location, item.date].filter(Boolean).join(' / '),
        href: item.url || null,
      })),
      ...cv.awards.map((item) => ({
        label: item.name,
        meta: [item.date, item.summary].filter(Boolean).join(' / '),
        href: item.url || null,
      })),
      ...cv.professionalDevelopment.map((item) => ({
        label: item.name,
        meta: [item.summary, item.date].filter(Boolean).join(' / '),
        href: item.url || null,
      })),
    ]
      .filter((n) => n.label)
      .slice(0, 6);
  }, [cv]);

  const footerLinks = useMemo(() => {
    if (!cv) return [];
    const seen = new Set();
    return [
      cv.website || cv.socialLinks.website
        ? { label: 'Website', href: cv.website || cv.socialLinks.website }
        : null,
      cv.socialLinks.github ? { label: 'GitHub', href: cv.socialLinks.github } : null,
      cv.socialLinks.linkedin ? { label: 'LinkedIn', href: cv.socialLinks.linkedin } : null,
      cv.socialLinks.twitter ? { label: 'Twitter', href: cv.socialLinks.twitter } : null,
      cv.email ? { label: 'Email', href: `mailto:${cv.email}` } : null,
      cv.phone ? { label: 'Phone', href: `tel:${cv.phone}` } : null,
    ]
      .filter(Boolean)
      .filter((item) => {
        if (seen.has(item.href)) return false;
        seen.add(item.href);
        return true;
      });
  }, [cv]);

  const metaItems = useMemo(() => {
    if (!cv) return [];
    return [
      cv.currentJobTitle ? `Current: ${cv.currentJobTitle}` : null,
      cv.location ? `Location: ${cv.location}` : null,
      workItems.length > 0 ? `Work entries: ${workItems.length}` : null,
      projectItems.length > 0 ? `Projects: ${projectItems.length}` : null,
    ].filter(Boolean);
  }, [cv, workItems.length, projectItems.length]);

  if (!cv) return null;

  /* rainbow colour counter */
  let colorIdx = 0;

  return (
    <Page $darkMode={darkMode}>
      <ProceduralTrees />

      <Column>
        {/* mobile-only flower at top */}
        <AnimatedFlower placement="top" />

        {/* ── header ── */}
        <Header style={{ '--delay': '0ms' }}>
          <Identity>
            <HomeAnchor href="#top">
              <strong>{cv.name}</strong>
            </HomeAnchor>
            {cv.email && <HeaderLink href={`mailto:${cv.email}`}>email</HeaderLink>}
            {cv.location && <MetaText>{cv.location}</MetaText>}
          </Identity>
          <StatusButton
            type="button"
            onClick={cycleStatus}
            title="Cycle status line"
          >
            is {statusLines[statusIndex]}
          </StatusButton>
        </Header>

        {/* ── main ── */}
        <Main id="top">
          {/* hero */}
          <Hero style={{ '--delay': '40ms' }}>
            <HeroTitle title={`"${greeting.hello}" is ${greeting.language}`}>
              {greeting.hello}.
            </HeroTitle>
            {(cv.currentJobTitle || cv.location) && (
              <HeroMeta>
                {[cv.currentJobTitle, cv.location].filter(Boolean).join(' / ')}
              </HeroMeta>
            )}
            {introParagraphs.map((paragraph, index) => (
              <Paragraph key={`intro-${index}`}>{paragraph}</Paragraph>
            ))}
          </Hero>

          {/* work */}
          {workItems.length > 0 && (
            <Section id="work" style={{ '--delay': '90ms' }}>
              <SectionHeading>Selected work</SectionHeading>
              <CardGrid>
                {workItems.map((item, index) => (
                  <Card
                    key={`work-${item.company}-${item.title}-${index}`}
                    style={{ '--accent': rainbow(index, workItems.length + 2) }}
                  >
                    <CardMeta>{formatRange(item.startDate, item.endDate) || 'Current'}</CardMeta>
                    <CardTitle>{item.title}</CardTitle>
                    <CardSubtitle>{item.company}</CardSubtitle>
                    {summarizeHighlight(item.highlights) && (
                      <CardText>{summarizeHighlight(item.highlights)}</CardText>
                    )}
                  </Card>
                ))}
              </CardGrid>
            </Section>
          )}

          {/* projects */}
          {projectItems.length > 0 && (
            <Section id="projects" style={{ '--delay': '140ms' }}>
              <SectionHeading>Projects</SectionHeading>
              <MasonryGrid>
                {projectItems.map((project, index) => (
                  <Card
                    key={`project-${project.name}-${index}`}
                    as={project.url ? 'a' : 'article'}
                    href={project.url || undefined}
                    target={project.url ? '_blank' : undefined}
                    rel={project.url ? 'noreferrer' : undefined}
                    style={{ '--accent': rainbow(index + 3, projectItems.length + 5) }}
                    $clickable={!!project.url}
                  >
                    {project.date && <CardMeta>{project.date}</CardMeta>}
                    <CardTitle>
                      {project.name}
                      {project.url && <ExternalMark> [link]</ExternalMark>}
                    </CardTitle>
                    {project.summary && <CardText>{project.summary}</CardText>}
                    {summarizeHighlight(project.highlights) && (
                      <CardHint>{summarizeHighlight(project.highlights)}</CardHint>
                    )}
                  </Card>
                ))}
              </MasonryGrid>
            </Section>
          )}

          {/* detail grid */}
          {(educationItems.length > 0 || fieldNotes.length > 0 || volunteerItems.length > 0) && (
            <DetailGrid style={{ '--delay': '190ms' }}>
              {educationItems.length > 0 && (
                <CompactSection id="background">
                  <SectionHeading>Education</SectionHeading>
                  <CompactList>
                    {educationItems.map((item, index) => (
                      <CompactItem key={`edu-${item.institution}-${index}`}>
                        <CompactTitle>
                          {item.degree} in {item.area}
                        </CompactTitle>
                        <CompactMeta>{item.institution}</CompactMeta>
                        <CompactText>{formatRange(item.start_date, item.end_date)}</CompactText>
                      </CompactItem>
                    ))}
                  </CompactList>
                </CompactSection>
              )}

              {fieldNotes.length > 0 && (
                <CompactSection>
                  <SectionHeading>Field notes</SectionHeading>
                  <CompactList>
                    {fieldNotes.map((item, index) => (
                      <CompactItem key={`note-${item.label}-${index}`}>
                        {item.href ? (
                          <CompactAnchor href={item.href} target="_blank" rel="noreferrer">
                            {item.label}
                          </CompactAnchor>
                        ) : (
                          <CompactTitle>{item.label}</CompactTitle>
                        )}
                        {item.meta && <CompactText>{item.meta}</CompactText>}
                      </CompactItem>
                    ))}
                  </CompactList>
                </CompactSection>
              )}

              {volunteerItems.length > 0 && (
                <CompactSection>
                  <SectionHeading>Volunteer</SectionHeading>
                  <CompactList>
                    {volunteerItems.map((item, index) => (
                      <CompactItem key={`vol-${item.company}-${item.title}-${index}`}>
                        <CompactTitle>{item.title}</CompactTitle>
                        <CompactMeta>{item.company}</CompactMeta>
                        <CompactText>{formatRange(item.startDate, item.endDate)}</CompactText>
                      </CompactItem>
                    ))}
                  </CompactList>
                </CompactSection>
              )}
            </DetailGrid>
          )}
        </Main>

        {/* ── footer ── */}
        <Footer style={{ '--delay': '240ms' }}>
          <AnimatedFlower />

          <FooterNav aria-label="Theme footer navigation">
            <FooterGrid>
              <FooterTitle>Main</FooterTitle>
              <FooterValue>
                <FooterList>
                  <li>
                    <FooterAnchor href="#top" style={{ '--light': rainbow(colorIdx++, FOOTER_LINK_COUNT) }}>
                      Home
                    </FooterAnchor>
                  </li>
                  {workItems.length > 0 && (
                    <li>
                      <FooterAnchor href="#work" style={{ '--light': rainbow(colorIdx++, FOOTER_LINK_COUNT) }}>
                        Work
                      </FooterAnchor>
                    </li>
                  )}
                  {projectItems.length > 0 && (
                    <li>
                      <FooterAnchor href="#projects" style={{ '--light': rainbow(colorIdx++, FOOTER_LINK_COUNT) }}>
                        Projects
                      </FooterAnchor>
                    </li>
                  )}
                  {educationItems.length > 0 && (
                    <li>
                      <FooterAnchor href="#background" style={{ '--light': rainbow(colorIdx++, FOOTER_LINK_COUNT) }}>
                        Background
                      </FooterAnchor>
                    </li>
                  )}
                </FooterList>
              </FooterValue>

              <FooterTitle>Links</FooterTitle>
              <FooterValue>
                <FooterList>
                  {footerLinks.map((item) => (
                    <li key={`footer-link-${item.label}`}>
                      <FooterAnchor
                        href={item.href}
                        target={/^https?:/i.test(item.href) ? '_blank' : undefined}
                        rel={/^https?:/i.test(item.href) ? 'noreferrer' : undefined}
                        style={{ '--light': rainbow(colorIdx++, FOOTER_LINK_COUNT) }}
                      >
                        {item.label}
                      </FooterAnchor>
                    </li>
                  ))}
                </FooterList>
              </FooterValue>

              <FooterTitle>Meta</FooterTitle>
              <FooterValue>
                <FooterList>
                  {metaItems.map((item, index) => (
                    <li key={`meta-${index}`}>
                      <FooterMeta style={{ '--light': rainbow(colorIdx++, FOOTER_LINK_COUNT) }}>
                        {item}
                      </FooterMeta>
                    </li>
                  ))}
                </FooterList>
              </FooterValue>
            </FooterGrid>
          </FooterNav>
        </Footer>
      </Column>
    </Page>
  );
}

/* ── styled components ───────────────────────────────────────── */

const SERIF = "'Crimson Text', 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const MONO = "'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace";

const animatedBlock = css`
  opacity: 0;
  animation: ${fadeUp} 480ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay, 0ms);
`;

/* ── page shell ── */

const Page = styled.div`
  --light: ${({ $darkMode }) => ($darkMode ? '#00a79b' : '#009388')};
  --warn: #b45c5c;
  --flower-color: ${({ $darkMode }) => ($darkMode ? 'hsl(174 56% 58%)' : 'hsl(174 56% 46%)')};
  position: relative;
  min-height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 75px 20px 48px;
  background: ${({ $darkMode }) => ($darkMode ? '#282828' : '#fff8f5')};
  color: ${({ $darkMode }) => ($darkMode ? 'whitesmoke' : '#101010')};
  overflow-y: auto;
  font-family: ${SERIF};
  font-size: 1.2rem;
  line-height: 1.6;

  a {
    color: inherit;
    text-decoration-color: var(--light);
    text-decoration-thickness: 2px;
    transition: color 0.3s;
  }
  a:hover {
    color: var(--light);
  }
  a:active {
    color: #ff9e9e;
  }
  /* external links get warning colour */
  a[href*="//"]:not([href*="${typeof window !== 'undefined' ? window.location.hostname : ''}"]) {
    --light: var(--warn);
  }
`;

const Column = styled.div`
  width: min(600px, 100%);
  position: relative;
  z-index: 1;
`;

/* ── header ── */

const Header = styled.header`
  ${animatedBlock};
  margin-bottom: 28px;
  text-align: center;
  line-height: 1.6;

  & > * {
    display: block;
    font-size: 1.25rem;
  }
`;

const Identity = styled.span`
  display: block;
  font-size: 1.25rem;

  a {
    text-decoration: inherit;
  }
`;

const HomeAnchor = styled.a`
  margin-right: 0.45rem;
  text-decoration: none;
  color: var(--light);
`;

const HeaderLink = styled.a`
  font-size: 1rem;
  margin-right: 0.45rem;
  font-family: ${MONO};
`;

const MetaText = styled.span`
  display: inline-block;
  font-size: 0.95rem;
  opacity: 0.75;
`;

const StatusButton = styled.button`
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  margin-top: 0.1rem;
  padding: 0;
  font: italic 1.05rem ${SERIF};
  opacity: 0.82;
  display: block;
  width: 100%;
  text-align: center;

  &:hover {
    opacity: 1;
  }
`;

/* ── main / hero ── */

const Main = styled.main`
  font-family: ${SERIF};
  font-size: 1.2rem;
  line-height: 1.6;
`;

const Hero = styled.article`
  ${animatedBlock};
  margin-bottom: 34px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 0.2rem;
  font-size: 1.5em;
  line-height: 1.05;
  font-weight: 700;
`;

const HeroMeta = styled.p`
  margin: 0 0 1.1rem;
  font-size: 0.82rem;
  font-family: ${MONO};
  letter-spacing: 0.03em;
  opacity: 0.75;
`;

const Paragraph = styled.p`
  margin: 0 0 1em;
  &:last-child { margin-bottom: 0; }
`;

/* ── sections ── */

const Section = styled.section`
  ${animatedBlock};
  margin-bottom: 34px;
  scroll-margin-top: 110px;
`;

const SectionHeading = styled.h2`
  margin: 0 0 0.9rem;
  font-size: 1.45rem;
  line-height: 1.15;
`;

/* ── cards ── */

const CardGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const MasonryGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Card = styled.article`
  display: block;
  border-left: 2px solid var(--accent, var(--light));
  padding-left: 20px;
  color: inherit;
  text-decoration: none;
  transition: transform 160ms ease, border-color 160ms ease;

  > p {
    margin-block: 0.25em;
  }

  ${({ $clickable }) => $clickable && css`cursor: pointer;`}

  &:hover {
    transform: translateX(4px);
  }
`;

const CardMeta = styled.p`
  margin: 0 0 0.25rem;
  font-size: 0.82rem;
  font-family: ${MONO};
  opacity: 0.72;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.16rem;
  line-height: 1.3;
`;

const CardSubtitle = styled.p`
  margin: 0.15rem 0 0;
  font-weight: 700;
`;

const CardText = styled.p`
  margin: 0.35rem 0 0;
`;

const CardHint = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.88rem;
  font-family: ${MONO};
  opacity: 0.78;
`;

const ExternalMark = styled.span`
  font-size: 0.84rem;
  font-family: ${MONO};
  opacity: 0.7;
`;

/* ── detail grid ── */

const DetailGrid = styled.section`
  ${animatedBlock};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 26px;
  margin-bottom: 38px;
`;

const CompactSection = styled.section`
  scroll-margin-top: 110px;
`;

const CompactList = styled.div`
  display: grid;
  gap: 14px;
`;

const CompactItem = styled.article`
  margin: 0;
`;

const CompactTitle = styled.p`
  margin: 0;
  font-weight: 700;
`;

const CompactMeta = styled.p`
  margin: 0.15rem 0 0;
  font-size: 0.95rem;
`;

const CompactText = styled.p`
  margin: 0.2rem 0 0;
  font-size: 0.84rem;
  font-family: ${MONO};
  opacity: 0.74;
`;

const CompactAnchor = styled.a`
  font-weight: 700;
`;

/* ── footer ── */

const Footer = styled.footer`
  ${animatedBlock};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
`;

const FooterNav = styled.nav`
  width: 100%;
  line-height: 1.6;
`;

const FooterGrid = styled.dl`
  font-feature-settings: 'onum';
  display: grid;
  grid-template-columns: auto max-content;
  gap: 5px;
  margin: 0;

  & > dd {
    margin-left: auto;
  }

  * {
    margin-block: 0;
  }

  @media (max-width: 800px) {
    display: block;
  }
`;

const FooterTitle = styled.dt`
  margin: 0;
  font-weight: 700;

  @media (max-width: 800px) {
    margin-top: 10px;
  }
`;

const FooterValue = styled.dd`
  margin: 0;

  @media (max-width: 800px) {
    margin-bottom: 12px;
  }
`;

const FooterList = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0 15px;
  margin: 0;
  padding: 0;
`;

const FooterAnchor = styled.a`
  text-decoration-color: var(--light) !important;

  &:hover {
    color: var(--light) !important;
  }
`;

const FooterMeta = styled.span`
  color: var(--light);
`;
