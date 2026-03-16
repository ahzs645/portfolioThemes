import React, { useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatMonthYear } from '../../utils/cvHelpers';

const accentHues = [0, 28, 64, 98, 132, 168, 202, 236, 270, 324];

const statusFallbacks = [
  'keeps a small internet home',
  'likes tools that age well',
  'prefers careful software over noisy software',
  'still believes personal sites should feel personal',
];

const flowerArt = `




        _/\\_
     .-' || '-.
        _||_
   _____/____\\_____,....-----'------'-----''-------'---'----'--
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

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

function makeAccent(index) {
  return accentHues[index % accentHues.length];
}

export function BoehsTheme({ darkMode }) {
  const cv = useCV();
  const [statusIndex, setStatusIndex] = useState(0);

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

    const dynamicLines = [
      cv.currentJobTitle ? `currently: ${cv.currentJobTitle}` : null,
      cv.location ? `based in ${cv.location}` : null,
      cv.projects.length > 0
        ? `building across ${cv.projects.length} active project${cv.projects.length === 1 ? '' : 's'}`
        : null,
      ...statusFallbacks,
    ].filter(Boolean);

    return dynamicLines;
  }, [cv]);

  const workItems = useMemo(() => cv?.experience.slice(0, 6) || [], [cv]);
  const projectItems = useMemo(() => cv?.projects.slice(0, 6) || [], [cv]);
  const educationItems = useMemo(() => cv?.education.slice(0, 4) || [], [cv]);
  const volunteerItems = useMemo(() => cv?.volunteer.slice(0, 3) || [], [cv]);

  const fieldNotes = useMemo(() => {
    if (!cv) return [];

    const notes = [
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
    ].filter((item) => item.label);

    return notes.slice(0, 6);
  }, [cv]);

  const footerLinks = useMemo(() => {
    if (!cv) return [];

    const seen = new Set();
    const items = [
      cv.website || cv.socialLinks.website
        ? { label: 'Website', href: cv.website || cv.socialLinks.website }
        : null,
      cv.socialLinks.github ? { label: 'GitHub', href: cv.socialLinks.github } : null,
      cv.socialLinks.linkedin ? { label: 'LinkedIn', href: cv.socialLinks.linkedin } : null,
      cv.socialLinks.twitter ? { label: 'Twitter', href: cv.socialLinks.twitter } : null,
      cv.email ? { label: 'Email', href: `mailto:${cv.email}` } : null,
      cv.phone ? { label: 'Phone', href: `tel:${cv.phone}` } : null,
    ].filter(Boolean);

    return items.filter((item) => {
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

  return (
    <Page $darkMode={darkMode}>
      <Column>
        <Header>
          <Identity>
            <HomeAnchor href="#top">
              <strong>{cv.name}</strong>
            </HomeAnchor>
            {cv.email && <HeaderLink href={`mailto:${cv.email}`}>email</HeaderLink>}
            {cv.location && <MetaText>{cv.location}</MetaText>}
          </Identity>
          <StatusButton
            type="button"
            onClick={() => setStatusIndex((current) => (current + 1) % statusLines.length)}
            title="Cycle status line"
          >
            {statusLines[statusIndex]}
          </StatusButton>
        </Header>

        <Main id="top">
          <Hero style={{ '--delay': '40ms' }}>
            <HeroTitle>Hello.</HeroTitle>
            {(cv.currentJobTitle || cv.location) && (
              <HeroMeta>
                {[cv.currentJobTitle, cv.location].filter(Boolean).join(' / ')}
              </HeroMeta>
            )}
            {introParagraphs.map((paragraph, index) => (
              <Paragraph key={`intro-${index}`}>{paragraph}</Paragraph>
            ))}
          </Hero>

          {workItems.length > 0 && (
            <Section id="work" style={{ '--delay': '90ms' }}>
              <SectionHeading>Selected work</SectionHeading>
              <CardStack>
                {workItems.map((item, index) => (
                  <Card key={`work-${item.company}-${item.title}-${index}`} $accentHue={makeAccent(index)}>
                    <CardMeta>{formatRange(item.startDate, item.endDate) || 'Current'}</CardMeta>
                    <CardTitle>{item.title}</CardTitle>
                    <CardSubtitle>{item.company}</CardSubtitle>
                    {summarizeHighlight(item.highlights) && (
                      <CardText>{summarizeHighlight(item.highlights)}</CardText>
                    )}
                  </Card>
                ))}
              </CardStack>
            </Section>
          )}

          {projectItems.length > 0 && (
            <Section id="projects" style={{ '--delay': '140ms' }}>
              <SectionHeading>Projects</SectionHeading>
              <CardStack>
                {projectItems.map((project, index) => (
                  <Card
                    key={`project-${project.name}-${index}`}
                    as={project.url ? 'a' : 'article'}
                    href={project.url || undefined}
                    target={project.url ? '_blank' : undefined}
                    rel={project.url ? 'noreferrer' : undefined}
                    $accentHue={makeAccent(index + 2)}
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
              </CardStack>
            </Section>
          )}

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

        <Footer style={{ '--delay': '240ms' }}>
          <Flower aria-hidden="true">{flowerArt}</Flower>
          <FooterNav aria-label="Theme footer navigation">
            <FooterGrid>
              <FooterTitle>Main</FooterTitle>
              <FooterValue>
                <FooterList>
                  <li><FooterAnchor href="#top" $accentHue={makeAccent(0)}>Home</FooterAnchor></li>
                  {workItems.length > 0 && (
                    <li><FooterAnchor href="#work" $accentHue={makeAccent(1)}>Work</FooterAnchor></li>
                  )}
                  {projectItems.length > 0 && (
                    <li><FooterAnchor href="#projects" $accentHue={makeAccent(2)}>Projects</FooterAnchor></li>
                  )}
                  {educationItems.length > 0 && (
                    <li><FooterAnchor href="#background" $accentHue={makeAccent(3)}>Background</FooterAnchor></li>
                  )}
                </FooterList>
              </FooterValue>

              <FooterTitle>Links</FooterTitle>
              <FooterValue>
                <FooterList>
                  {footerLinks.map((item, index) => (
                    <li key={`footer-link-${item.label}`}>
                      <FooterAnchor
                        href={item.href}
                        target={/^https?:/i.test(item.href) ? '_blank' : undefined}
                        rel={/^https?:/i.test(item.href) ? 'noreferrer' : undefined}
                        $accentHue={makeAccent(index + 4)}
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
                      <FooterMeta $accentHue={makeAccent(index + 7)}>{item}</FooterMeta>
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

const linkStyles = css`
  color: inherit;
  text-decoration-color: ${({ $accentHue }) =>
    `hsl(${$accentHue || 174} 58% var(--link-lightness))`};
  text-decoration-thickness: 2px;
  text-underline-offset: 0.18em;
  transition:
    color 140ms ease,
    text-decoration-color 140ms ease;

  &:hover {
    color: ${({ $accentHue }) =>
      `hsl(${$accentHue || 174} 62% var(--link-hover-lightness))`};
  }
`;

const Page = styled.div`
  --link-lightness: ${({ $darkMode }) => ($darkMode ? '62%' : '42%')};
  --link-hover-lightness: ${({ $darkMode }) => ($darkMode ? '74%' : '34%')};
  --card-lightness: ${({ $darkMode }) => ($darkMode ? '62%' : '52%')};
  --card-hover-lightness: ${({ $darkMode }) => ($darkMode ? '72%' : '60%')};
  --meta-lightness: ${({ $darkMode }) => ($darkMode ? '68%' : '54%')};
  --flower-color: ${({ $darkMode }) => ($darkMode ? 'hsl(174 56% 58%)' : 'hsl(174 56% 46%)')};
  min-height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(32px, 6vw, 72px) 20px 48px;
  background:
    radial-gradient(circle at top right, ${({ $darkMode }) => ($darkMode ? 'rgba(0, 167, 155, 0.16)' : 'rgba(0, 147, 136, 0.14)')}, transparent 28%),
    radial-gradient(circle at bottom left, ${({ $darkMode }) => ($darkMode ? 'rgba(180, 92, 92, 0.12)' : 'rgba(180, 92, 92, 0.1)')}, transparent 32%),
    ${({ $darkMode }) =>
      $darkMode
        ? 'linear-gradient(180deg, #24211f 0%, #171515 100%)'
        : 'linear-gradient(180deg, #fffaf5 0%, #f7f0e9 100%)'};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f0ea' : '#111111')};
  overflow-y: auto;
`;

const Column = styled.div`
  width: min(620px, 100%);
`;

const animatedBlock = css`
  opacity: 0;
  animation: ${fadeUp} 480ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay, 0ms);
`;

const Header = styled.header`
  ${animatedBlock};
  margin-bottom: 28px;
  text-align: center;
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
  line-height: 1.6;
`;

const Identity = styled.span`
  display: block;
  font-size: 1.2rem;
`;

const HomeAnchor = styled.a`
  ${linkStyles};
  margin-right: 0.45rem;
  text-decoration: none;
`;

const HeaderLink = styled.a`
  ${linkStyles};
  font-size: 1rem;
  margin-right: 0.45rem;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
`;

const MetaText = styled.span`
  display: inline-block;
  font-size: 0.95rem;
  color: ${({ theme }) => theme?.muted || 'inherit'};
  opacity: 0.75;
`;

const StatusButton = styled.button`
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  margin-top: 0.35rem;
  padding: 0;
  font: italic 1.05rem 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
  opacity: 0.82;

  &:hover {
    opacity: 1;
  }
`;

const Main = styled.main`
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
  font-size: 1.14rem;
  line-height: 1.7;
`;

const Hero = styled.article`
  ${animatedBlock};
  margin-bottom: 34px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 0.2rem;
  font-size: clamp(2.2rem, 5vw, 2.8rem);
  line-height: 1.05;
  font-weight: 700;
`;

const HeroMeta = styled.p`
  margin: 0 0 1.1rem;
  font-size: 0.82rem;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  letter-spacing: 0.03em;
  opacity: 0.75;
`;

const Paragraph = styled.p`
  margin: 0 0 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

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

const CardStack = styled.div`
  display: grid;
  gap: 16px;
`;

const Card = styled.article`
  display: block;
  border-left: 2px solid hsl(${({ $accentHue }) => $accentHue} 56% var(--card-lightness));
  padding-left: 18px;
  color: inherit;
  text-decoration: none;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    color 160ms ease;

  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
    `}

  &:hover {
    transform: translateX(4px);
    border-color: hsl(${({ $accentHue }) => $accentHue} 62% var(--card-hover-lightness));
  }
`;

const CardMeta = styled.p`
  margin: 0 0 0.25rem;
  font-size: 0.82rem;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
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
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  opacity: 0.78;
`;

const ExternalMark = styled.span`
  font-size: 0.84rem;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  opacity: 0.7;
`;

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
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  opacity: 0.74;
`;

const CompactAnchor = styled.a`
  ${linkStyles};
  font-weight: 700;
`;

const Footer = styled.footer`
  ${animatedBlock};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
`;

const Flower = styled.pre`
  margin: 0;
  width: 100%;
  font-size: 0.96rem;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  line-height: 1;
  color: var(--flower-color);
  white-space: pre;
  overflow: hidden;
  text-align: center;
  opacity: 0.85;
`;

const FooterNav = styled.nav`
  width: 100%;
  line-height: 1.6;
`;

const FooterGrid = styled.dl`
  display: grid;
  grid-template-columns: auto max-content;
  gap: 6px 20px;
  margin: 0;
  font-feature-settings: 'onum';

  @media (max-width: 640px) {
    display: block;
  }
`;

const FooterTitle = styled.dt`
  margin: 0;
  font-weight: 700;

  @media (max-width: 640px) {
    margin-top: 10px;
  }
`;

const FooterValue = styled.dd`
  margin: 0;

  @media (max-width: 640px) {
    margin-bottom: 12px;
  }
`;

const FooterList = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0 14px;
  margin: 0;
  padding: 0;
`;

const FooterAnchor = styled.a`
  ${linkStyles};
`;

const FooterMeta = styled.span`
  color: ${({ $accentHue }) => `hsl(${$accentHue} 48% var(--meta-lightness))`};
`;
