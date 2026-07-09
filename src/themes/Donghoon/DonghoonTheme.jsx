import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import {
  filterActive,
  formatDate,
  formatRange,
  isArchived,
  pickSocialUrl,
} from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';
import geistFont from './assets/fonts/geist.woff2';
import newsreaderFont from './assets/fonts/newsreader.woff2';

/**
 * DonghoonTheme — a faithful, CV-driven remake of donghoon.io.
 *
 * Donghoon Shin's homepage is a clean academic researcher page: a serif name,
 * a bio built from many inline links to affiliations, a top-right nav that
 * anchors to sections, a "Selected publications" strip of horizontally
 * scrolling cards (each with a venue/year badge, title, blurb, and small
 * action links), and compact project cards. We rebuild that structure from the
 * app's CV.yaml rather than reproducing Donghoon's own content.
 *
 * Palette + type notes (matched to the source): the paper is a warm CREAM
 * (--surface #f9f6f0, a slightly darker #efeae0 for cards); the ink is a warm
 * charcoal (#2c2925, not pure black); links are a quiet, warm muted GREY
 * (~#4a4744) that darkens toward the ink and picks up the accent on hover —
 * inline bio links read as softly-underlined grey text, never blue. The accent
 * is a muted OLIVE/gold (#8a850c) used sparingly (nav underline, small marks,
 * venue-badge borders). Body text is a clean light sans (Geist) at a
 * comfortable size with line-height ~1.7; the name, card titles and section
 * sub-headings are a serif (Newsreader, loaded via this theme's own @import
 * below). Section titles are small, uppercase, letter-spaced, muted, with a
 * thin bottom rule.
 */

const SERIF = "'Donghoon Newsreader', 'Newsreader', 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif";
const SANS = "'Donghoon Geist', 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Helvetica Neue', Arial, sans-serif";

const lightTheme = {
  page: '#f9f6f0',
  card: '#f9f6f0',
  cardAlt: '#efeae0',
  // Card surfaces + on-card ink. Kept as explicit tokens so the publication and
  // project cards track dark mode instead of staying cream (they used to hardcode
  // these light literals inline).
  cardGrad: 'linear-gradient(180deg, rgb(249 246 240 / 0.98), rgb(239 234 224 / 0.96))',
  cardBorder: 'rgb(138 133 12 / 0.10)',
  cardTitle: 'rgb(72 57 33)',
  cardBody: 'rgb(88 72 46 / 0.78)',
  ink: '#2c2925',
  inkSoft: 'rgba(44, 41, 37, 0.66)',
  inkFaint: 'rgba(44, 41, 37, 0.46)',
  link: '#4a4744',
  linkHover: '#2c2925',
  linkUnderline: 'rgba(44, 41, 37, 0.30)',
  accent: '#8a850c',
  accentSoft: 'rgba(138, 133, 12, 0.42)',
  border: 'rgba(44, 41, 37, 0.14)',
  borderStrong: 'rgba(44, 41, 37, 0.28)',
  badgeBg: 'rgba(138, 133, 12, 0.08)',
  badgeInk: 'rgba(44, 41, 37, 0.72)',
  badgeBorder: 'rgba(138, 133, 12, 0.34)',
  navBg: 'rgba(249, 246, 240, 0.85)',
  buttonBg: 'rgba(249, 246, 240, 0.9)',
};

const darkTheme = {
  page: '#1c1a16',
  card: '#211e19',
  cardAlt: '#26221c',
  cardGrad: 'linear-gradient(180deg, rgb(33 30 25 / 0.98), rgb(38 34 28 / 0.96))',
  cardBorder: 'rgb(201 194 78 / 0.16)',
  cardTitle: 'rgb(236 231 220)',
  cardBody: 'rgb(236 231 220 / 0.66)',
  ink: '#ece7dc',
  inkSoft: 'rgba(236, 231, 220, 0.64)',
  inkFaint: 'rgba(236, 231, 220, 0.42)',
  link: '#c3bcae',
  linkHover: '#ece7dc',
  linkUnderline: 'rgba(236, 231, 220, 0.32)',
  accent: '#c9c24e',
  accentSoft: 'rgba(201, 194, 78, 0.42)',
  border: 'rgba(236, 231, 220, 0.13)',
  borderStrong: 'rgba(236, 231, 220, 0.26)',
  badgeBg: 'rgba(201, 194, 78, 0.10)',
  badgeInk: 'rgba(236, 231, 220, 0.74)',
  badgeBorder: 'rgba(201, 194, 78, 0.32)',
  navBg: 'rgba(28, 26, 22, 0.85)',
  buttonBg: 'rgba(33, 30, 25, 0.9)',
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Donghoon Geist';
    src: url(${geistFont}) format('woff2');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Donghoon Newsreader';
    src: url(${newsreaderFont}) format('woff2');
    font-weight: 200 800;
    font-style: normal;
    font-display: swap;
  }

  body { background-color: ${(p) => p.theme.page}; }
`;

const NAV_ITEMS = [
  { id: 'top', label: 'Home' },
  { id: 'publications', label: 'Publication' },
  { id: 'projects', label: 'Project' },
  { id: 'cv', label: 'CV' },
  { id: 'links', label: 'others' },
];

function yearOf(date) {
  return formatDate(date, { month: 'none', fallback: '' });
}

function numYear(date) {
  const y = parseInt(String(date ?? '').slice(0, 4), 10);
  return Number.isFinite(y) ? y : 0;
}

function stripTech(text = '') {
  return String(text).replace(/^\s*technolog(?:y|ies)\s*[-:–]\s*/i, '').trim();
}

function shortAuthors(authors = [], self = '') {
  const list = Array.isArray(authors) ? authors.filter(Boolean) : [];
  if (list.length === 0) return null;
  const selfLower = String(self).trim().toLowerCase();
  const shown = list.slice(0, 4);
  return (
    <>
      {shown.map((a, i) => {
        const isSelf = a.trim().toLowerCase() === selfLower;
        return (
          <React.Fragment key={a + i}>
            {isSelf ? <Self>{a}</Self> : a}
            {i < shown.length - 1 ? ', ' : ''}
          </React.Fragment>
        );
      })}
      {list.length > shown.length ? ', et al.' : ''}
    </>
  );
}

function RefLink({ href, children }) {
  if (href) {
    return (
      <Anchor href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Anchor>
    );
  }
  return <FauxLink>{children}</FauxLink>;
}

export function DonghoonTheme({ darkMode = false }) {
  const cvData = useCV();
  const cv = useMemo(() => cvData || {}, [cvData]);
  const theme = darkMode ? darkTheme : lightTheme;

  const name = cv.name || 'Your Name';
  const avatarSrc = cv.avatar ? withBase(cv.avatar) : null;
  const location = cv.location || null;
  const website = cv.website || null;
  const email = cv.email || null;

  const socials = cv.social || [];
  const education = useMemo(() => filterActive(cv.education || []), [cv]);
  const experience = useMemo(
    () => (cv.experience || []).filter((e) => e && !isArchived(e)),
    [cv],
  );
  const awards = useMemo(() => filterActive(cv.awards || []), [cv]);
  const projects = useMemo(() => filterActive(cv.projects || []), [cv]);

  // Derive a research field from the primary degree's highlights, e.g.
  // "Focus on air quality and environmental health" → "air quality and…".
  const primaryEdu = education[0] || null;
  const field = useMemo(() => {
    const hs = primaryEdu?.highlights || [];
    const focus = hs.find((h) => /focus/i.test(String(h)));
    if (focus) return String(focus).replace(/^\s*focus on\s*/i, '').replace(/\.$/, '').trim();
    return 'environmental health';
  }, [primaryEdu]);

  const degreeWord = (primaryEdu?.degree || 'PhD').replace(/\./g, '');
  const subtitle = [
    primaryEdu ? `${degreeWord} candidate` : cv.currentJobTitle,
    location,
  ]
    .filter(Boolean)
    .join(' · ');

  // A few distinct employers for the background paragraph.
  const backgroundRoles = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const e of experience) {
      const key = String(e.company || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ company: e.company, title: e.title });
      if (out.length >= 3) break;
    }
    return out;
  }, [experience]);

  const priorDegrees = useMemo(
    () => education.filter((e) => e !== primaryEdu).slice(0, 2),
    [education, primaryEdu],
  );
  const priorSameInst =
    priorDegrees.length > 0 &&
    priorDegrees.every((d) => d.institution === priorDegrees[0].institution);

  const topAward = awards[0] || null;

  // Selected publications = papers + talks, newest first.
  const pubCards = useMemo(() => {
    const papers = (cv.publications || []).map((p) => ({
      key: `pub-${p.title || Math.random()}`,
      kind: 'Paper',
      year: yearOf(p.date) || '—',
      title: p.title || p.name || 'Untitled',
      venue: p.journal || null,
      authors: p.authors || null,
      location: null,
      links: [
        p.doi ? { label: 'DOI', href: `https://doi.org/${p.doi}` } : null,
        p.url ? { label: 'Link', href: p.url } : null,
      ].filter(Boolean),
      sortY: numYear(p.date),
    }));
    const talks = (cv.presentations || []).map((p) => ({
      key: `talk-${p.name || Math.random()}`,
      kind: 'Talk',
      year: yearOf(p.date) || '—',
      title: p.name || 'Untitled talk',
      venue: p.summary || null,
      authors: null,
      location: p.location || null,
      links: p.url ? [{ label: 'Link', href: p.url }] : [],
      sortY: numYear(p.date),
    }));
    return [...papers, ...talks].sort((a, b) => b.sortY - a.sortY);
  }, [cv]);

  // Horizontal scroller state (buttons fade at the ends). Listeners cleaned up.
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth - 1;
      setEdges({ atStart: el.scrollLeft <= 2, atEnd: el.scrollLeft >= max });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pubCards.length]);

  const scrollByStep = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.82), behavior: 'smooth' });
  };

  const handleNav = (e, id) => {
    e.preventDefault();
    const target = id === 'top' ? document.getElementById('top') : document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updatedLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const renderPortrait = () => (
    avatarSrc ? <img src={avatarSrc} alt={name} /> : null
  );

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Nav aria-label="Primary">
          <NavLinks>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <NavLink href={`#${item.id}`} onClick={(e) => handleNav(e, item.id)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </NavLinks>
        </Nav>

        <Content>
          <Hero id="top">
            <HeroText>
              <Name>{name}</Name>
              {subtitle && <ScreenReaderOnly>{subtitle}</ScreenReaderOnly>}
              {avatarSrc && <MobilePortrait>{renderPortrait()}</MobilePortrait>}

              <Bio>
                <p>
                  I am a researcher working on{' '}
                  <FauxLink>{field}</FauxLink>
                  {primaryEdu ? (
                    <>
                      {' '}and a {degreeWord} candidate in{' '}
                      <FauxLink>{primaryEdu.area}</FauxLink> at the{' '}
                      <RefLink href={primaryEdu.url}>{primaryEdu.institution}</RefLink>
                    </>
                  ) : null}
                  {location ? (
                    <>
                      , based in <FauxLink>{location}</FauxLink>
                    </>
                  ) : null}
                  .
                </p>

                <p>
                  My work measures particulate matter, black carbon, and airborne
                  metals across northern communities, and turns those measurements
                  into evidence that supports public and environmental health.
                </p>

                {(priorDegrees.length > 0 || backgroundRoles.length > 0) && (
                  <p>
                    {priorDegrees.length > 0 && (
                      <>
                        I earned my{' '}
                        {priorDegrees.map((d, i) => (
                          <React.Fragment key={`${d.degree}-${i}`}>
                            <FauxLink>{d.degree}</FauxLink>
                            {priorSameInst ? '' : (
                              <> from <RefLink href={d.url}>{d.institution}</RefLink></>
                            )}
                            {i < priorDegrees.length - 2
                              ? ', '
                              : i === priorDegrees.length - 2
                                ? ' and '
                                : ''}
                          </React.Fragment>
                        ))}
                        {priorSameInst && (
                          <> from the <RefLink href={priorDegrees[0].url}>{priorDegrees[0].institution}</RefLink></>
                        )}
                        .{' '}
                      </>
                    )}
                    {backgroundRoles.length > 0 && (
                      <>
                        Along the way I have worked at{' '}
                        {backgroundRoles.map((r, i) => (
                          <React.Fragment key={`${r.company}-${i}`}>
                            <RefLink href={r.url}>{r.company}</RefLink>
                            {r.title ? ` (${r.title})` : ''}
                            {i < backgroundRoles.length - 2
                              ? ', '
                              : i === backgroundRoles.length - 2
                                ? ', and '
                                : '.'}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </p>
                )}

                {topAward && (
                  <p>
                    I am a{' '}
                    <FauxLink>{topAward.name}</FauxLink>
                    {topAward.summary ? (
                      <> recipient ({topAward.summary}).</>
                    ) : (
                      <> recipient.</>
                    )}
                  </p>
                )}
              </Bio>
            </HeroText>

            {avatarSrc && (
              <Portrait>
                {renderPortrait()}
              </Portrait>
            )}
          </Hero>

          {pubCards.length > 0 && (
            <Section id="publications">
              <SectionHead>
                <SectionTitle>Selected publications</SectionTitle>
                {website && (
                  <ViewAll href={website} target="_blank" rel="noopener noreferrer">
                    View all <span aria-hidden="true">&rsaquo;</span>
                  </ViewAll>
                )}
              </SectionHead>

              <ScrollerShell>
                <ScrollButton
                  type="button"
                  data-side="left"
                  aria-label="Scroll publications left"
                  disabled={edges.atStart}
                  onClick={() => scrollByStep(-1)}
                >
                  <span aria-hidden="true">&larr;</span>
                </ScrollButton>

                <Scroller ref={scrollerRef}>
                  <ScrollerInner>
                    {pubCards.map((c) => (
                      <PubCard key={c.key}>
                        <CardCopy>
                          <ProjectHead>
                            <ProjectTitle as="p">{c.title}</ProjectTitle>
                            <Badge>{c.year}</Badge>
                          </ProjectHead>
                          {c.location ? (
                            <ProjectSummary>{c.location}</ProjectSummary>
                          ) : c.authors ? (
                            <ProjectSummary>{shortAuthors(c.authors, name)}</ProjectSummary>
                          ) : (
                            c.venue && <ProjectSummary>{c.kind}</ProjectSummary>
                          )}
                          <ProjectMeta>
                            <span>{c.year}</span>
                            <span>{c.kind}</span>
                            {c.links.map((l) => (
                              <Anchor key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                                {l.label}
                              </Anchor>
                            ))}
                          </ProjectMeta>
                        </CardCopy>
                      </PubCard>
                    ))}
                  </ScrollerInner>
                </Scroller>

                <ScrollButton
                  type="button"
                  data-side="right"
                  aria-label="Scroll publications right"
                  disabled={edges.atEnd}
                  onClick={() => scrollByStep(1)}
                >
                  <span aria-hidden="true">&rarr;</span>
                </ScrollButton>
              </ScrollerShell>
            </Section>
          )}

          {projects.length > 0 && (
            <Section id="projects">
              <SectionHead>
                <SectionTitle>Projects</SectionTitle>
              </SectionHead>
              <ProjectGrid>
                {projects.map((p, i) => {
                  const tech = stripTech(p.highlights?.[0] || '');
                  return (
                    <ProjectCard key={`${p.name}-${i}`}>
                      <CardCopy>
                        <ProjectHead>
                          <ProjectTitle>
                            {p.url ? (
                              <Anchor href={p.url} target="_blank" rel="noopener noreferrer">
                                {p.name}
                              </Anchor>
                            ) : (
                              p.name
                            )}
                          </ProjectTitle>
                          {p.date && <Badge>{yearOf(p.date) || p.date}</Badge>}
                        </ProjectHead>
                        {p.summary && <ProjectSummary>{p.summary}</ProjectSummary>}
                        {(tech || p.url) && (
                          <ProjectMeta>
                            {tech && <span>{tech}</span>}
                            {p.url && (
                              <Anchor href={p.url} target="_blank" rel="noopener noreferrer">
                                Link
                              </Anchor>
                            )}
                          </ProjectMeta>
                        )}
                      </CardCopy>
                    </ProjectCard>
                  );
                })}
              </ProjectGrid>
            </Section>
          )}

          {(education.length > 0 || experience.length > 0 || awards.length > 0) && (
            <Section id="cv">
              <SectionHead>
                <SectionTitle>CV</SectionTitle>
                {website && (
                  <ViewAll href={website} target="_blank" rel="noopener noreferrer">
                    Full CV <span aria-hidden="true">&rsaquo;</span>
                  </ViewAll>
                )}
              </SectionHead>

              {education.length > 0 && (
                <SubBlock>
                  <SubTitle>Education</SubTitle>
                  <EntryList>
                    {education.map((e, i) => (
                      <Entry key={`edu-${i}`}>
                        <EntryDate>{formatRange(e.start_date, e.end_date, { month: 'none' })}</EntryDate>
                        <EntryBody>
                          <strong>{e.degree}</strong>
                          {e.area ? `, ${e.area}` : ''}
                          {' — '}
                          <RefLink href={e.url}>{e.institution}</RefLink>
                        </EntryBody>
                      </Entry>
                    ))}
                  </EntryList>
                </SubBlock>
              )}

              {experience.length > 0 && (
                <SubBlock>
                  <SubTitle>Experience</SubTitle>
                  <EntryList>
                    {experience.slice(0, 6).map((e, i) => (
                      <Entry key={`exp-${i}`}>
                        <EntryDate>
                          {formatRange(e.startDate, e.endDate, { month: 'none', ongoingWhenNoEnd: e.isCurrent })}
                        </EntryDate>
                        <EntryBody>
                          <strong>{e.title}</strong>
                          {' — '}
                          <RefLink href={e.url}>{e.company}</RefLink>
                        </EntryBody>
                      </Entry>
                    ))}
                  </EntryList>
                </SubBlock>
              )}

              {awards.length > 0 && (
                <SubBlock>
                  <SubTitle>Awards</SubTitle>
                  <EntryList>
                    {awards.slice(0, 6).map((a, i) => (
                      <Entry key={`award-${i}`}>
                        <EntryDate>{yearOf(a.date)}</EntryDate>
                        <EntryBody>
                          <strong>{a.name}</strong>
                          {a.summary ? <EntryMuted> — {a.summary}</EntryMuted> : null}
                        </EntryBody>
                      </Entry>
                    ))}
                  </EntryList>
                </SubBlock>
              )}
            </Section>
          )}

          <Section id="links">
            <SectionHead>
              <SectionTitle>Links</SectionTitle>
            </SectionHead>
            <LinkRow>
              {email && (
                <Anchor href={`mailto:${email}`}>{email}</Anchor>
              )}
              {website && (
                <Anchor href={website} target="_blank" rel="noopener noreferrer">
                  {website.replace(/^https?:\/\//, '')}
                </Anchor>
              )}
              {socials.map((s) => (
                <Anchor key={s.url || s.network} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.network}
                </Anchor>
              ))}
            </LinkRow>
          </Section>

          <Footer>
            <FooterText>Up to date as of {updatedLabel}</FooterText>
            <FooterLinks>
              {pickSocialUrl(socials, ['github']) && (
                <Anchor href={pickSocialUrl(socials, ['github'])} target="_blank" rel="noopener noreferrer">GitHub</Anchor>
              )}
              {pickSocialUrl(socials, ['linkedin']) && (
                <Anchor href={pickSocialUrl(socials, ['linkedin'])} target="_blank" rel="noopener noreferrer">LinkedIn</Anchor>
              )}
              {email && <Anchor href={`mailto:${email}`}>Email</Anchor>}
            </FooterLinks>
          </Footer>
        </Content>
      </Page>
    </ThemeProvider>
  );
}

/* ---------- layout ---------- */

const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: ${(p) => p.theme.page};
  color: ${(p) => p.theme.ink};
  font-family: ${SANS};
  font-weight: 300;
  line-height: 1.7;
  transition: background-color 0.25s ease, color 0.25s ease;
  box-sizing: border-box;
`;

const Nav = styled.nav`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  max-width: 1200px;
  min-height: 2rem;
  margin: 0 auto;
  padding: 1.8rem 0.75rem;
  background: transparent;
  box-sizing: border-box;

  @media (max-width: 767px) {
    padding: 2.75rem 1rem 1rem;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavLink = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 350;
  line-height: 1;
  letter-spacing: 0.047em;
  text-transform: lowercase;
  color: ${(p) => p.theme.ink} !important;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.18s ease, font-weight 0.18s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -0.08rem;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.22s ease;
  }

  &:hover {
    color: ${(p) => p.theme.ink} !important;
    font-weight: 500;
  }

  &:hover::after {
    transform: scaleX(1);
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.accent};
    outline-offset: 3px;
    border-radius: 2px;
  }
`;

const Content = styled.main`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.75rem 4rem;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    padding-left: 4rem;
    padding-right: 4rem;
  }

  @media (max-width: 991px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (max-width: 575px) {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0 0.75rem;
  scroll-margin-top: 1rem;

  @media (max-width: 720px) {
    flex-direction: column;
    gap: 1.25rem;
    align-items: flex-start;
    padding: 0 0.45rem;
  }
`;

const HeroText = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const Portrait = styled.div`
  flex: 0 0 auto;
  width: 225px;
  max-width: 45%;
  text-align: center;

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  @media (max-width: 720px) {
    display: none;
  }
`;

const MobilePortrait = styled.div`
  display: none;

  @media (max-width: 720px) {
    display: block;
    width: min(60%, 300px);
    max-width: 300px;
    margin: 1.1rem auto 1.45rem;

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }
`;

const Name = styled.h1`
  margin: 0 0 1.2rem;
  font-family: ${SERIF};
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  color: ${(p) => p.theme.ink};
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Anchor = styled.a`
  color: ${(p) => p.theme.link};
  font-weight: 400;
  text-decoration: none;
  transition: color 0.16s ease, font-weight 0.16s ease;

  &:hover {
    color: ${(p) => p.theme.linkHover};
    font-weight: 500;
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.accent};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const FauxLink = styled.span`
  color: ${(p) => p.theme.link};
  font-weight: 400;
`;

const Bio = styled.div`
  p {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    font-weight: 250;
    line-height: 1.7;
    color: ${(p) => p.theme.ink};
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

const Self = styled.span`
  font-weight: 500;
  color: ${(p) => p.theme.ink};
`;

/* ---------- sections ---------- */

const Section = styled.section`
  margin-top: 3rem;
  scroll-margin-top: 1rem;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 5px;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid ${(p) => p.theme.borderStrong};
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: ${(p) => p.theme.inkSoft};
`;

const ViewAll = styled.a`
  font-size: 0.82rem;
  font-weight: 350;
  white-space: nowrap;
  color: ${(p) => p.theme.inkFaint};
  text-decoration: none;

  span {
    margin-left: 0.15rem;
  }

  &:hover {
    color: ${(p) => p.theme.ink};
  }
`;

/* ---------- publications scroller ---------- */

const ScrollerShell = styled.div`
  position: relative;
`;

const Scroller = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  cursor: grab;
  -webkit-mask: linear-gradient(90deg, transparent, white 5%, white 95%, transparent);
  mask: linear-gradient(90deg, transparent, white 5%, white 95%, transparent);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ScrollerInner = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  width: max-content;
  padding-block: 0.5rem;
`;

const PubCard = styled.article`
  flex: 0 0 auto;
  width: 215px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${(p) => p.theme.cardBorder};
  background: ${(p) => p.theme.cardGrad};
  box-sizing: border-box;

  @media (min-width: 1560px) {
    width: 230px;
  }

  @media (max-width: 460px) {
    width: 72vw;
    max-width: 230px;
  }
`;

const CardCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 0.55rem;
  min-height: 9.25rem;
  padding: 16px 13px 14px;
  text-align: left;
  box-sizing: border-box;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 4px 0.5px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 350;
  white-space: nowrap;
  color: ${(p) => p.theme.ink};
  background: ${(p) => p.theme.card};
  border: 1px solid ${(p) => p.theme.cardBorder};
  flex: 0 0 auto;
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 2.3rem;
  height: 2.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.buttonBg};
  color: ${(p) => p.theme.inkSoft};
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  transition: opacity 0.2s ease, color 0.2s ease;

  &[data-side='left'] {
    left: -0.4rem;
  }
  &[data-side='right'] {
    right: -0.4rem;
  }

  &:hover:not(:disabled) {
    color: ${(p) => p.theme.ink};
  }

  &:disabled {
    opacity: 0;
    pointer-events: none;
  }

  span {
    font-size: 1rem;
    line-height: 1;
  }

  @media (max-width: 720px) {
    display: none;
  }
`;

/* ---------- projects ---------- */

const ProjectGrid = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 0.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask: linear-gradient(90deg, transparent, white 5%, white 95%, transparent);
  mask: linear-gradient(90deg, transparent, white 5%, white 95%, transparent);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProjectCard = styled.article`
  flex: 0 0 auto;
  width: 215px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${(p) => p.theme.cardBorder};
  background: ${(p) => p.theme.cardGrad};
  transition: border-color 0.18s ease;

  &:hover {
    border-color: ${(p) => p.theme.borderStrong};
  }

  @media (min-width: 1560px) {
    width: 230px;
  }

  @media (max-width: 460px) {
    width: 72vw;
    max-width: 230px;
  }
`;

const ProjectHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ProjectTitle = styled.h3`
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-family: ${SERIF};
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.25;
  color: ${(p) => p.theme.cardTitle};
  min-width: 0;

  a {
    color: ${(p) => p.theme.cardTitle};
    text-decoration: none;
  }
  a:hover {
    color: ${(p) => p.theme.linkHover};
  }
`;

const ProjectSummary = styled.p`
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 0.78rem;
  font-weight: 300;
  line-height: 1.35;
  color: ${(p) => p.theme.cardBody};
`;

const ProjectMeta = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.8rem;
  margin: 0;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 300;
  line-height: 1.35;
  color: ${(p) => p.theme.cardBody};

  span,
  a {
    color: ${(p) => p.theme.cardTitle};
    font-weight: 350;
    white-space: nowrap;
  }
`;

/* ---------- CV lists ---------- */

const SubBlock = styled.div`
  margin-bottom: 1.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubTitle = styled.h3`
  margin: 0 0 0.7rem;
  font-family: ${SERIF};
  font-size: 1.02rem;
  font-weight: 500;
  color: ${(p) => p.theme.ink};
`;

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const Entry = styled.div`
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  gap: 0.4rem 1rem;
  align-items: baseline;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }
`;

const EntryDate = styled.div`
  font-size: 0.78rem;
  font-weight: 350;
  color: ${(p) => p.theme.inkFaint};
  white-space: nowrap;
`;

const EntryBody = styled.div`
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.5;
  color: ${(p) => p.theme.ink};

  strong {
    font-weight: 500;
  }
`;

const EntryMuted = styled.span`
  color: ${(p) => p.theme.inkSoft};
`;

/* ---------- links + footer ---------- */

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.4rem;
  font-size: 0.9rem;
`;

const Footer = styled.footer`
  margin-top: 3.5rem;
  padding-top: 1.4rem;
  border-top: 1px solid ${(p) => p.theme.border};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem 1.5rem;
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 300;
  color: ${(p) => p.theme.inkFaint};
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.1rem;
  font-size: 0.8rem;
`;

export default DonghoonTheme;
