import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { ArrowUpRight, Mail, MapPin, Phone, Radio, RotateCcw } from 'lucide-react';
import { useCV } from '../../contexts/ConfigContext';
import { useGitHubContext } from '../../contexts/GitHubContext';
import { filterActive, formatMonthYear, isArchived, normalizeHighlights } from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';

const FONT_REGULAR = withBase('rodney-v2/fonts/IoskeleyMono-Regular.woff2');
const FONT_MEDIUM = withBase('rodney-v2/fonts/IoskeleyMono-Medium.woff2');
const FONT_PIXEL = withBase('rodney-v2/fonts/GeistPixel-Square.woff2');

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789傲慢貪欲嫉妬오만탐욕';
const NAV_ITEMS = [
  ['intro', 'home'],
  ['experience', 'work'],
  ['projects', 'projects'],
  ['research', 'research'],
  ['education', 'education'],
  ['community', 'community'],
  ['contact', 'contact'],
];

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

function formatDateRange(start, end) {
  const startDate = formatMonthYear(start);
  const endDate = formatMonthYear(end);
  if (!startDate && !endDate) return '';
  if (!endDate || startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
}

function externalHref(url) {
  if (!url) return '';
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

function getSocialLabel(item = {}) {
  return firstText(item.network, item.name, item.label, item.username, item.url).toLowerCase();
}

function getEntryTitle(entry = {}) {
  const degree = [entry.degree || entry.studyType, entry.area].filter(Boolean).join(' in ');
  return firstText(entry.title, entry.position, entry.name, degree, entry.institution, entry.company);
}

function getEntrySubtitle(entry = {}) {
  return firstText(entry.company, entry.institution, entry.summary, entry.journal, entry.location);
}

function getEntryDate(entry = {}) {
  return firstText(
    entry.date && String(entry.date),
    formatDateRange(entry.start_date, entry.end_date),
    formatDateRange(entry.startDate, entry.endDate),
  );
}

function flattenWork(entries = []) {
  const rows = [];

  for (const entry of entries) {
    if (!entry || isArchived(entry)) continue;

    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      for (const position of entry.positions) {
        rows.push({
          ...position,
          company: entry.company,
          location: entry.location,
          url: entry.url,
          title: position?.title || entry.position,
          start_date: position?.start_date ?? entry.start_date,
          end_date: position?.end_date ?? entry.end_date,
          highlights: normalizeHighlights(position?.highlights || entry.highlights),
        });
      }
      continue;
    }

    rows.push({
      ...entry,
      title: entry.position || entry.title,
      highlights: normalizeHighlights(entry.highlights),
    });
  }

  return rows;
}

function projectTechnology(project = {}) {
  const fromHighlight = normalizeHighlights(project.highlights)
    .find((item) => /^technolog(y|ies)\s*-/i.test(item));

  if (fromHighlight) return fromHighlight.replace(/^technolog(y|ies)\s*-\s*/i, '');
  if (Array.isArray(project.keywords)) return project.keywords.join(', ');
  if (Array.isArray(project.tags)) return project.tags.join(', ');
  return '';
}

function buildContributionColumns(days = []) {
  const columns = [];
  if (!Array.isArray(days) || days.length === 0) return columns;

  for (const day of days.slice(-371)) {
    const date = new Date(`${day.date}T00:00:00`);
    const weekday = Number.isNaN(date.getTime()) ? 0 : date.getDay();
    if (columns.length === 0 || weekday === 0) columns.push(new Array(7).fill(null));
    columns[columns.length - 1][weekday] = day;
  }

  return columns;
}

function ScrambleText({ children, className }) {
  const text = String(children || '');
  const [display, setDisplay] = useState(text);

  const play = useCallback(() => {
    const chars = [...SCRAMBLE_CHARS];
    const target = [...text];
    let frame = 0;
    const maxFrames = Math.max(18, target.length * 2);
    const interval = window.setInterval(() => {
      frame += 1;
      const locked = Math.floor((frame / maxFrames) * target.length);
      setDisplay(
        target
          .map((char, index) => {
            if (/\s/.test(char) || index < locked) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(''),
      );

      if (frame >= maxFrames) {
        window.clearInterval(interval);
        setDisplay(text);
      }
    }, 24);
  }, [text]);

  useEffect(() => {
    play();
  }, [play]);

  return (
    <span className={className} onMouseEnter={play}>
      {display}
    </span>
  );
}

function ContributionGraph() {
  const { github, loading } = useGitHubContext();
  const columns = useMemo(
    () => buildContributionColumns(github?.contributions?.days || []),
    [github?.contributions?.days],
  );
  const total = github?.contributions?.totalYear || 0;
  const year = github?.contributions?.days?.at(-1)?.date?.slice(0, 4) || new Date().getFullYear();

  if (loading && columns.length === 0) {
    return (
      <GraphBlock aria-hidden="true">
        <GraphHeader>
          <Label>contributions</Label>
          <Label>loading</Label>
        </GraphHeader>
        <GraphScroller>
          <GraphGrid>
            {Array.from({ length: 53 }).map((_, week) => (
              <GraphColumn key={week}>
                {Array.from({ length: 7 }).map((__, day) => (
                  <Cell key={day} $level={0} />
                ))}
              </GraphColumn>
            ))}
          </GraphGrid>
        </GraphScroller>
      </GraphBlock>
    );
  }

  if (columns.length === 0) return null;

  return (
    <GraphBlock>
      <GraphHeader>
        <Label>contributions</Label>
        <Label>{total} in {year}</Label>
      </GraphHeader>
      <GraphScroller>
        <GraphGrid role="grid" aria-label="GitHub contributions">
          {columns.map((week, weekIndex) => (
            <GraphColumn key={weekIndex}>
              {week.map((day, dayIndex) => (
                <Cell
                  key={`${weekIndex}-${dayIndex}`}
                  $level={day?.level || 0}
                  title={day ? `${day.count} contributions on ${day.date}` : undefined}
                />
              ))}
            </GraphColumn>
          ))}
        </GraphGrid>
      </GraphScroller>
      <Legend>
        <span>less</span>
        {[0, 1, 2, 3, 4].map((level) => <Cell key={level} $level={level} />)}
        <span>more</span>
      </Legend>
    </GraphBlock>
  );
}

function Section({ id, label, title, children }) {
  return (
    <PageSection id={id}>
      <SectionHeader>
        <Label>{label}</Label>
        <SectionTitle>{title}</SectionTitle>
      </SectionHeader>
      {children}
    </PageSection>
  );
}

function EntryList({ items, compact = false }) {
  if (!items?.length) return null;

  return (
    <List>
      {items.map((item, index) => {
        const title = getEntryTitle(item);
        const subtitle = getEntrySubtitle(item);
        const date = getEntryDate(item);
        const highlights = normalizeHighlights(item.highlights).slice(0, compact ? 1 : 3);

        return (
          <Entry key={`${title}-${subtitle}-${index}`}>
            <EntryMeta>
              {date && <span>{date}</span>}
              {item.location && <span>{item.location}</span>}
            </EntryMeta>
            <EntryBody>
              <EntryTitle>
                {item.url ? (
                  <TextLink href={externalHref(item.url)} target="_blank" rel="noreferrer">
                    {title}
                    <ArrowUpRight size={13} />
                  </TextLink>
                ) : title}
              </EntryTitle>
              {subtitle && subtitle !== title && <EntrySubtitle>{subtitle}</EntrySubtitle>}
              {item.summary && item.summary !== subtitle && <EntrySummary>{item.summary}</EntrySummary>}
              {highlights.length > 0 && (
                <Highlights>
                  {highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex}>{highlight}</li>
                  ))}
                </Highlights>
              )}
            </EntryBody>
          </Entry>
        );
      })}
    </List>
  );
}

export function RodneyV2Theme() {
  const cv = useCV() || {};
  const [activeSection, setActiveSection] = useState('intro');
  const sections = cv.sections || {};
  const fullName = cv.name || 'Your Name';
  const workItems = useMemo(() => flattenWork(sections.experience || cv.experience), [sections.experience, cv.experience]);
  const volunteerItems = useMemo(() => flattenWork(sections.volunteer || cv.volunteer), [sections.volunteer, cv.volunteer]);
  const projects = useMemo(() => filterActive(sections.projects || cv.projects || []), [sections.projects, cv.projects]);
  const education = useMemo(() => filterActive(sections.education || cv.education || []), [sections.education, cv.education]);
  const awards = useMemo(() => filterActive(sections.awards || cv.awards || []), [sections.awards, cv.awards]);
  const publications = useMemo(() => filterActive(sections.publications || cv.publications || []), [sections.publications, cv.publications]);
  const presentations = useMemo(() => filterActive(sections.presentations || cv.presentations || []), [sections.presentations, cv.presentations]);
  const professionalDevelopment = useMemo(
    () => filterActive(sections.professional_development || cv.professionalDevelopment || []),
    [sections.professional_development, cv.professionalDevelopment],
  );
  const certificationsSkills = sections.certifications_skills || cv.certificationsSkills || [];
  const socialLinks = cv.socialRaw || cv.social || [];
  const about = firstText(
    cv.about,
    sections.about,
    cv.headline,
    cv.label,
    `${fullName} is currently focused on research, systems, and applied technology.`,
  );
  const currentRole = firstText(cv.currentJobTitle, cv.label, workItems[0]?.title, 'Portfolio');
  const updated = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Vancouver',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()).replaceAll('-', '/');
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
    );

    NAV_ITEMS.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Shell>
      <RodneyFonts />
      <DesktopNav aria-label="Sections">
        {NAV_ITEMS.map(([id, label]) => (
          <NavLink key={id} href={`#${id}`} $active={activeSection === id}>
            {label}
          </NavLink>
        ))}
      </DesktopNav>
      <MobileNav aria-label="Sections">
        {NAV_ITEMS.map(([id, label]) => (
          <NavLink key={id} href={`#${id}`} $active={activeSection === id}>
            {label}
          </NavLink>
        ))}
      </MobileNav>

      <Main>
        <Hero id="intro">
          <Kicker>home</Kicker>
          <TitleRow>
            <HeroTitle>
              <ScrambleText>{fullName.toLowerCase()}</ScrambleText>
            </HeroTitle>
            <Clock />
          </TitleRow>
          <IntroText>
            {about}
          </IntroText>

          <StatusGrid>
            <StatusItem>
              <Label>currently</Label>
              <strong>{currentRole}</strong>
            </StatusItem>
            {cv.location && (
              <StatusItem>
                <Label>based</Label>
                <strong>{cv.location}</strong>
              </StatusItem>
            )}
            <StatusItem>
              <Label>last updated</Label>
              <strong>{updated}</strong>
            </StatusItem>
          </StatusGrid>

          <ContributionGraph />

          <LinkLine>
            {socialLinks.map((link, index) => (
              <React.Fragment key={`${link.url}-${index}`}>
                {index > 0 && <span>/</span>}
                <TextLink href={externalHref(link.url)} target="_blank" rel="noreferrer">
                  {getSocialLabel(link)}
                  <ArrowUpRight size={12} />
                </TextLink>
              </React.Fragment>
            ))}
            {cv.website && (
              <>
                {socialLinks.length > 0 && <span>/</span>}
                <TextLink href={externalHref(cv.website)} target="_blank" rel="noreferrer">
                  website
                  <ArrowUpRight size={12} />
                </TextLink>
              </>
            )}
          </LinkLine>
        </Hero>

        <Section id="experience" label="work" title="Selected experience">
          <EntryList items={workItems} />
        </Section>

        <Section id="projects" label="projects" title="Things shipped">
          <ProjectGrid>
            {projects.map((project, index) => {
              const tech = projectTechnology(project);
              return (
                <ProjectCard key={`${project.name}-${index}`}>
                  <CardTop>
                    <Label>{project.date || `0${index + 1}`}</Label>
                    {project.url && (
                      <IconLink href={externalHref(project.url)} target="_blank" rel="noreferrer" aria-label={`${project.name} link`}>
                        <ArrowUpRight size={15} />
                      </IconLink>
                    )}
                  </CardTop>
                  <ProjectTitle>{project.name}</ProjectTitle>
                  {project.summary && <EntrySummary>{project.summary}</EntrySummary>}
                  {tech && <Tech>{tech}</Tech>}
                </ProjectCard>
              );
            })}
          </ProjectGrid>
        </Section>

        <Section id="research" label="research" title="Public output">
          <SplitStack>
            <SubBlock>
              <SubTitle>publications</SubTitle>
              <EntryList items={publications} compact />
            </SubBlock>
            <SubBlock>
              <SubTitle>presentations</SubTitle>
              <EntryList items={presentations} compact />
            </SubBlock>
            <SubBlock>
              <SubTitle>awards</SubTitle>
              <EntryList items={awards} compact />
            </SubBlock>
          </SplitStack>
        </Section>

        <Section id="education" label="education" title="Training and credentials">
          <SplitStack>
            <SubBlock>
              <SubTitle>formal</SubTitle>
              <EntryList items={education} compact />
            </SubBlock>
            <SubBlock>
              <SubTitle>professional development</SubTitle>
              <EntryList items={professionalDevelopment} compact />
            </SubBlock>
            {certificationsSkills.length > 0 && (
              <SubBlock>
                <SubTitle>certifications and skills</SubTitle>
                <ChipGrid>
                  {certificationsSkills.map((group, index) => (
                    <SkillGroup key={`${group.label}-${index}`}>
                      <Label>{group.label}</Label>
                      <p>{group.details}</p>
                    </SkillGroup>
                  ))}
                </ChipGrid>
              </SubBlock>
            )}
          </SplitStack>
        </Section>

        <Section id="community" label="community" title="Volunteer work">
          <EntryList items={volunteerItems} compact />
        </Section>

        <Section id="contact" label="contact" title="Open channel">
          <ContactGrid>
            {cv.email && (
              <ContactLink href={`mailto:${cv.email}`}>
                <Mail size={16} />
                <span>{cv.email}</span>
              </ContactLink>
            )}
            {cv.phone && (
              <ContactLink href={`tel:${cv.phone}`}>
                <Phone size={16} />
                <span>{cv.phone}</span>
              </ContactLink>
            )}
            {cv.location && (
              <ContactLink as="div">
                <MapPin size={16} />
                <span>{cv.location}</span>
              </ContactLink>
            )}
          </ContactGrid>
          <FooterNote>
            <Radio size={14} />
            <span>built from CV.yaml / inspired by v2.rodney.lol</span>
            <RotateCcw size={14} />
          </FooterNote>
        </Section>
      </Main>
    </Shell>
  );
}

function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return <TimeText>{time}</TimeText>;
}

const RodneyFonts = createGlobalStyle`
  @font-face {
    font-family: 'Rodney Ioskeley Mono';
    src: url('${FONT_REGULAR}') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Rodney Ioskeley Mono';
    src: url('${FONT_MEDIUM}') format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Rodney Geist Pixel';
    src: url('${FONT_PIXEL}') format('woff2');
    font-weight: 400 700;
    font-style: normal;
    font-display: swap;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`;

const Shell = styled.div`
  --paper: #f7f6f5;
  --ink: #0a0a0a;
  --muted: #6b6b6b;
  --line: #e3e1da;
  --accent: #2200ff;
  --accent-soft: rgba(34, 0, 255, 0.1);
  --font-mono: 'Rodney Ioskeley Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-pixel: 'Rodney Geist Pixel', 'Rodney Ioskeley Mono', ui-monospace, monospace;

  min-height: 100vh;
  background:
    linear-gradient(90deg, rgba(227, 225, 218, 0.4) 1px, transparent 1px) 0 0 / 12.5% 100%,
    var(--paper);
  color: var(--ink);
  font-family: var(--font-mono);
  overflow-x: clip;
  scroll-behavior: smooth;

  ::selection {
    background: var(--accent);
    color: var(--paper);
  }
`;

const DesktopNav = styled.nav`
  position: fixed;
  z-index: 5;
  top: 0;
  left: 12.5%;
  width: 12.5%;
  height: 100vh;
  padding: 80px 16px;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 920px) {
    display: none;
  }
`;

const MobileNav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 6;
  display: none;
  gap: 16px;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
  background: rgba(247, 246, 245, 0.94);
  padding: 14px 16px;
  backdrop-filter: blur(12px);

  @media (max-width: 920px) {
    display: flex;
  }
`;

const NavLink = styled.a`
  position: relative;
  color: ${(p) => (p.$active ? 'var(--accent)' : 'var(--ink)')};
  font-size: 14px;
  line-height: 1.8;
  text-decoration: none;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    right: -12px;
    top: 0.35em;
    width: 2px;
    height: 1em;
    background: var(--accent);
    opacity: ${(p) => (p.$active ? 1 : 0)};
    transition: opacity 160ms ease;
  }

  &:hover {
    color: var(--accent);
  }

  @media (max-width: 920px) {
    font-size: 13px;

    &::after {
      right: 0;
      left: 0;
      top: auto;
      bottom: -14px;
      width: 100%;
      height: 2px;
    }
  }
`;

const Main = styled.main`
  width: min(100%, 720px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 76px 24px 120px;

  @media (max-width: 920px) {
    padding-top: 48px;
  }

  @media (max-width: 560px) {
    padding-inline: 16px;
  }
`;

const Hero = styled.section`
  min-height: 100vh;
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;

  @media (max-width: 720px) {
    min-height: auto;
    padding: 44px 0 56px;
  }
`;

const Kicker = styled.div`
  color: var(--muted);
  font-size: 12px;
  line-height: 1;
  text-transform: uppercase;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: var(--font-pixel);
  font-size: clamp(32px, 7vw, 58px);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: 0;
  overflow-wrap: anywhere;
`;

const TimeText = styled.div`
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 12px;
  line-height: 1;
  text-align: right;
  white-space: nowrap;

  @media (max-width: 560px) {
    display: none;
  }
`;

const IntroText = styled.p`
  max-width: 68ch;
  margin: 0;
  color: var(--ink);
  font-size: 15px;
  line-height: 1.75;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const StatusItem = styled.div`
  min-width: 0;
  border-top: 1px solid var(--line);
  padding-top: 10px;

  strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
  }
`;

const Label = styled.span`
  color: var(--muted);
  font-size: 11px;
  line-height: 1.2;
  text-transform: uppercase;
`;

const GraphBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GraphHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const GraphScroller = styled.div`
  overflow-x: auto;
  padding-bottom: 2px;
`;

const GraphGrid = styled.div`
  display: flex;
  width: max-content;
  gap: 3px;
`;

const GraphColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Cell = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${(p) => {
    if (p.$level >= 4) return 'var(--accent)';
    if (p.$level === 3) return 'rgba(34, 0, 255, 0.78)';
    if (p.$level === 2) return 'rgba(34, 0, 255, 0.52)';
    if (p.$level === 1) return 'rgba(34, 0, 255, 0.28)';
    return 'var(--line)';
  }};
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: var(--muted);
  font-size: 11px;
`;

const LinkLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  line-height: 1.4;
`;

const TextLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: inherit;
  text-decoration: none;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-size: 0% 0.075em;
  transition: color 160ms ease, background-size 220ms ease;

  &:hover {
    color: var(--accent);
    background-size: 100% 0.075em;
  }
`;

const PageSection = styled.section`
  padding: 84px 0 0;
  scroll-margin-top: 80px;
`;

const SectionHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-top: 1px solid var(--line);
  padding-top: 16px;
  margin-bottom: 22px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-family: var(--font-pixel);
  font-size: clamp(21px, 3vw, 30px);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Entry = styled.article`
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 18px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const EntryMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.35;
  text-transform: uppercase;
`;

const EntryBody = styled.div`
  min-width: 0;
`;

const EntryTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
`;

const EntrySubtitle = styled.p`
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
`;

const EntrySummary = styled.p`
  margin: 8px 0 0;
  color: var(--ink);
  font-size: 13px;
  line-height: 1.6;
`;

const Highlights = styled.ul`
  margin: 10px 0 0;
  padding-left: 16px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.article`
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: rgba(247, 246, 245, 0.72);
  padding: 14px;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
`;

const IconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: 2px;
  color: var(--ink);
  text-decoration: none;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const ProjectTitle = styled.h3`
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.15;
`;

const Tech = styled.p`
  margin: 12px 0 0;
  color: var(--accent);
  font-size: 11px;
  line-height: 1.45;
  text-transform: uppercase;
`;

const SplitStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
`;

const SubBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubTitle = styled.h3`
  width: fit-content;
  margin: 0;
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  text-transform: uppercase;
`;

const ChipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SkillGroup = styled.div`
  border-top: 1px solid var(--line);
  padding-top: 10px;

  p {
    margin: 6px 0 0;
    color: var(--ink);
    font-size: 13px;
    line-height: 1.6;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const ContactLink = styled.a`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 12px;
  color: var(--ink);
  font-size: 12px;
  line-height: 1.3;
  text-decoration: none;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &:is(a):hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const FooterNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 28px;
  border-top: 1px solid var(--line);
  padding-top: 12px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.3;

  svg:first-child {
    color: var(--accent);
    animation: ${pulse} 1.8s ease-in-out infinite;
  }
`;
