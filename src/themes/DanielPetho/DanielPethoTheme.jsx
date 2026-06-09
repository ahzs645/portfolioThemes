import React, { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { filterActive, formatDateRange, isPresent } from '../../utils/cvHelpers';

const BG = '#fefefe';
const FG = '#0a0a0a';
const MUTED = 'rgba(10, 10, 10, 0.45)';
const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
const SCRAMBLE_SPEED = 26;
const SCRAMBLED_LETTER_COUNT = 5;
const ROW_DELAY = 28;
const MAX_INTRO_DELAY = 1100; // cap so late rows don't sit blank for too long

function randChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

// Approximate the on-load reveal duration so later rows can stagger after earlier ones.
function revealDuration(text = '') {
  return Math.min((text.length - SCRAMBLED_LETTER_COUNT) * SCRAMBLE_SPEED, 120);
}

/**
 * Signature danielpetho.com text effect: letters scramble in on mount (one at a
 * time behind a moving band of noise), then re-scramble on hover using only the
 * word's own characters. `hover` can be driven externally (so a whole row can
 * scramble together) or left undefined to use the element's own pointer events.
 */
function Scramble({ text = '', delay = 0, hover, className }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [selfHover, setSelfHover] = useState(false);
  const external = hover !== undefined;
  const hovering = external ? hover : selfHover;

  // Scramble-in on mount.
  useEffect(() => {
    if (!text) {
      setDisplay('');
      setDone(true);
      return undefined;
    }
    let visible = 0;
    let interval;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        visible += 1;
        const remaining = Math.max(0, text.length - visible);
        const tail = Math.min(remaining, SCRAMBLED_LETTER_COUNT);
        let scrambled = '';
        for (let i = 0; i < tail; i += 1) scrambled += randChar();
        setDisplay(text.slice(0, visible) + scrambled);
        if (visible >= text.length) {
          clearInterval(interval);
          setDisplay(text);
          setDone(true);
        }
      }, SCRAMBLE_SPEED);
    }, delay);
    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, [text, delay]);

  // Re-scramble on hover, once the intro has finished.
  useEffect(() => {
    if (!done) return undefined;
    if (!hovering) {
      setDisplay(text);
      return undefined;
    }
    const pool = Array.from(new Set(text.replace(/\s/g, '').split('')));
    if (pool.length === 0) return undefined;
    let iterations = 0;
    const maxIterations = 10;
    const interval = setInterval(() => {
      const scrambled = text
        .split('')
        .map((c) => (c === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)]))
        .join('');
      setDisplay(scrambled);
      iterations += 1;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, SCRAMBLE_SPEED * 1.3);
    return () => clearInterval(interval);
  }, [done, hovering, text]);

  const handlers = external
    ? {}
    : {
        onMouseEnter: () => setSelfHover(true),
        onMouseLeave: () => setSelfHover(false),
      };

  return (
    <ScrambleSpan className={className} {...handlers}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display || ' '}</span>
    </ScrambleSpan>
  );
}

function getYear(value) {
  const match = String(value || '').match(/\d{4}/);
  return match ? match[0] : '';
}

function getProjectImage(project) {
  return project?.image || project?.img || project?.thumbnail || project?.image_url || null;
}

function isExternal(url) {
  return typeof url === 'string' && /^https?:\/\//.test(url);
}

// A label/content row: external-link wrapper, left title (with optional muted
// secondary line) + right meta, all sharing one hover state so the title, the
// secondary line and the year scramble together and a thumbnail can peek.
function Row({ title, sub, meta, href, delay, image }) {
  const [hover, setHover] = useState(false);
  const external = isExternal(href);

  const inner = (
    <RowInner
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-active={hover ? '' : undefined}
    >
      <RowMain>
        <RowTitle>
          <Scramble text={title} delay={delay} hover={hover} />
          {external && <Arrow aria-hidden="true"> ↗</Arrow>}
        </RowTitle>
        {sub && (
          <RowSub>
            <Scramble text={sub} delay={delay + 30} hover={hover} />
          </RowSub>
        )}
      </RowMain>
      {image && (
        <Thumb data-visible={hover ? '' : undefined} aria-hidden="true">
          <img src={image} alt="" decoding="async" loading="lazy" />
        </Thumb>
      )}
      {meta && (
        <RowMeta>
          <Scramble text={meta} delay={delay + 40} hover={hover} />
        </RowMeta>
      )}
    </RowInner>
  );

  if (!href) return inner;
  return (
    <RowLink href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
      {inner}
    </RowLink>
  );
}

function Section({ label, labelDelay, children }) {
  return (
    <SectionRow>
      <SectionLabel>
        <Scramble text={label} delay={labelDelay} />
      </SectionLabel>
      <SectionBody>{children}</SectionBody>
    </SectionRow>
  );
}

export function DanielPethoTheme() {
  const cv = useCV();

  const data = useMemo(() => {
    const safe = cv || {};
    const experience = (safe.experience || []).filter(Boolean);
    const current = experience.find((job) => job.isCurrent || isPresent(job.endDate));

    // Build the ordered list of sections, each as { label, rows: [{ title, sub, meta, href, image }] }.
    const sections = [];
    const pushSection = (label, rows) => {
      const cleaned = (rows || []).filter((r) => r && r.title);
      if (cleaned.length) sections.push({ label, rows: cleaned });
    };

    pushSection(
      'previous',
      experience.map((job) => ({
        title: job.company || job.title,
        sub: job.company && job.title ? job.title : null,
        meta: formatDateRange(job.startDate, job.endDate),
        href: job.url || job.website || null,
      })),
    );

    pushSection(
      'education',
      (safe.education || []).map((school) => ({
        title: [school.degree, school.area].filter(Boolean).join(' — ') || school.institution,
        sub: school.institution || school.location || null,
        meta: formatDateRange(school.start_date, school.end_date),
        href: school.url || null,
      })),
    );

    pushSection(
      'projects',
      filterActive(safe.projects || []).map((project) => ({
        title: project.name || project.title,
        sub: project.summary || project.description || null,
        meta: getYear(project.date || project.end_date || project.start_date),
        href: project.url || project.website || project.link || null,
        image: getProjectImage(project),
      })),
    );

    pushSection(
      'awards',
      (safe.awards || []).map((award) => ({
        title: award.name || award.title,
        sub: award.summary || award.issuer || null,
        meta: getYear(award.date),
        href: award.url || null,
      })),
    );

    pushSection(
      'publications',
      (safe.publications || []).map((pub) => ({
        title: pub.title || pub.name,
        sub: pub.journal || (Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors) || null,
        meta: getYear(pub.date),
        href: pub.url || (pub.doi ? `https://doi.org/${pub.doi}` : null),
      })),
    );

    pushSection(
      'talks',
      (safe.presentations || []).map((talk) => ({
        title: talk.name || talk.title,
        sub: [talk.summary, talk.location].filter(Boolean).join(' · ') || null,
        meta: getYear(talk.date),
        href: talk.url || null,
      })),
    );

    pushSection(
      'courses',
      (safe.professionalDevelopment || []).map((course) => ({
        title: course.name || course.title,
        sub: [course.summary, course.location].filter(Boolean).join(' · ') || null,
        meta: getYear(course.date),
        href: course.url || null,
      })),
    );

    pushSection(
      'volunteer',
      (safe.volunteer || []).map((entry) => ({
        title: entry.company || entry.title,
        sub: entry.company && entry.title ? entry.title : null,
        meta: formatDateRange(entry.startDate, entry.endDate),
        href: entry.url || entry.website || null,
      })),
    );

    pushSection(
      'skills',
      (safe.certificationsSkills || []).map((entry) => ({
        title: entry.label || entry.name,
        sub: entry.details || (Array.isArray(entry.keywords) ? entry.keywords.join(', ') : entry.keywords) || null,
        meta: '',
        href: null,
      })),
    );

    return {
      name: safe.name || 'Your Name',
      tagline: safe.headline || safe.tagline || safe.label || 'design ✺ tech ∿ build ◳',
      role: current
        ? `${current.title || 'design engineer'}${current.company ? ` @ ${current.company}` : ''}`
        : safe.currentJobTitle || null,
      about: safe.about || '',
      email: safe.email || null,
      socials: (safe.socialRaw || []).filter((s) => s && s.url),
      sections,
    };
  }, [cv]);

  const introDuration = revealDuration(data.name);

  // Running delay counter so the scramble-in cascades section by section but is
  // capped, and so the contact block lands after everything else.
  let cursor = introDuration + ROW_DELAY * 2;
  const stepLabel = () => {
    const d = Math.min(cursor, MAX_INTRO_DELAY);
    cursor += ROW_DELAY * 2;
    return d;
  };
  const stepRow = () => {
    const d = Math.min(cursor, MAX_INTRO_DELAY);
    cursor += ROW_DELAY;
    return d;
  };

  return (
    <>
      <GlobalStyle />
      <Page>
        <Layout>
          {/* Header */}
          <Header>
            <HeaderLabel>
              <Name>
                <Scramble text={data.name} delay={0} />
              </Name>
            </HeaderLabel>
            <HeaderBody>
              <Tagline>
                <Scramble text={data.tagline} delay={introDuration} />
              </Tagline>
              {data.role && (
                <Role>
                  <Scramble text={data.role} delay={introDuration + ROW_DELAY} />
                </Role>
              )}
            </HeaderBody>
          </Header>

          {/* About */}
          {data.about && (
            <Section label="about" labelDelay={stepLabel()}>
              <About>
                <Scramble text={data.about} delay={stepRow()} />
              </About>
            </Section>
          )}

          {/* CV sections */}
          {data.sections.map((section) => (
            <Section key={section.label} label={section.label} labelDelay={stepLabel()}>
              {section.rows.map((row, index) => (
                <Row
                  key={`${section.label}-${index}`}
                  title={row.title}
                  sub={row.sub}
                  meta={row.meta}
                  href={row.href}
                  image={row.image}
                  delay={stepRow()}
                />
              ))}
            </Section>
          ))}

          {/* Contact */}
          <Section label="contact" labelDelay={stepLabel()}>
            <ContactList>
              {data.email && (
                <RowLink href={`mailto:${data.email}`}>
                  <RowInner as="span">
                    <RowMain>
                      <RowTitle>
                        <Scramble text={data.email} delay={stepRow()} />
                      </RowTitle>
                    </RowMain>
                  </RowInner>
                </RowLink>
              )}
              <Spacer />
              {data.socials.map((social, index) => (
                <Row
                  key={`${social.network}-${index}`}
                  title={String(social.network || 'link')}
                  href={social.url}
                  delay={stepRow()}
                />
              ))}
            </ContactList>
          </Section>
        </Layout>
      </Page>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: ${BG};
  }
`;

const Page = styled.main`
  min-height: 100%;
  background: ${BG};
  color: ${FG};
  font-family: 'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-weight: 400;
  line-height: 1.15;
  text-transform: lowercase;
  -webkit-font-smoothing: antialiased;
  padding: 40px 16px;
  box-sizing: border-box;
  font-size: 4.9vw;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  ::selection {
    background: ${FG};
    color: ${BG};
  }

  @media (min-width: 640px) {
    padding: 40px;
    font-size: 1.5rem;
  }
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
  @media (min-width: 1024px) {
    padding: 48px;
    font-size: 1.875rem;
  }
  @media (min-width: 1280px) {
    font-size: 2.25rem;
  }
`;

const Layout = styled.div`
  max-width: 1536px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 64px;

  @media (min-width: 768px) {
    gap: 80px;
  }
  @media (min-width: 1024px) {
    gap: 104px;
  }
`;

const SectionRow = styled.section`
  display: flex;
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const labelColumn = `
  width: 100%;
  margin-bottom: 2vw;
  font-weight: 700;

  @media (min-width: 640px) {
    width: 25%;
    margin-bottom: 0;
    padding-right: 24px;
    text-align: right;
  }
  @media (min-width: 768px) {
    padding-right: 32px;
  }
  @media (min-width: 1024px) {
    padding-right: 48px;
  }
  @media (min-width: 1280px) {
    width: 22%;
  }
`;

const SectionLabel = styled.h2`
  ${labelColumn}
  margin-top: 0;
  font-size: inherit;

  @media (min-width: 640px) {
    position: sticky;
    top: calc(var(--app-top-offset, 0px) + 16px);
    align-self: flex-start;
  }
`;

const SectionBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const HeaderLabel = styled.div`
  ${labelColumn}
`;

const Name = styled.h1`
  margin: 0;
  font-size: inherit;
  font-weight: 700;
`;

const HeaderBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const Tagline = styled.div`
  white-space: pre-wrap;
`;

const Role = styled.div`
  margin-top: 2px;
`;

const About = styled.p`
  margin: 0;
  max-width: 30ch;
  font-size: 0.82em;
  line-height: 1.4;
`;

const RowLink = styled.a`
  display: block;
  color: inherit;
  text-decoration: none;
`;

const RowInner = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.15s ease;

  @media (min-width: 768px) {
    &[data-active] {
      border-bottom-color: ${FG};
    }
  }
`;

const RowMain = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const RowTitle = styled.span`
  display: inline-flex;
  align-items: baseline;
`;

const RowSub = styled.span`
  margin-top: 2px;
  font-size: 0.62em;
  line-height: 1.3;
  color: ${MUTED};
`;

const RowMeta = styled.span`
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
  }
`;

const Arrow = styled.span`
  font-size: 0.5em;
  font-weight: 500;
  margin-left: 2px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Thumb = styled.span`
  pointer-events: none;
  position: absolute;
  bottom: 0;
  right: 12%;
  display: none;
  width: 96px;
  height: 96px;
  opacity: 0;
  transition: opacity 0.15s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 768px) {
    display: block;
    &[data-visible] {
      opacity: 1;
    }
  }
  @media (min-width: 1280px) {
    width: 144px;
    height: 144px;
  }
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Spacer = styled.div`
  height: 1em;
`;

const ScrambleSpan = styled.span`
  display: inline;
  white-space: pre-wrap;

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

export default DanielPethoTheme;
