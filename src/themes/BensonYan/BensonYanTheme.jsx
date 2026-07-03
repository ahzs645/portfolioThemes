import React, { useEffect, useMemo, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { filterActive, formatDateRange } from '../../utils/cvHelpers';
import { createLiquidEther } from './liquidEther';

// Palette and props lifted verbatim from 1800benson.ca, which renders its
// background with ReactBits' LiquidEther fluid. The colours map to velocity
// magnitude over a transparent canvas, so the near-black page (BG) shows through
// the low-motion areas — that compositing is what yields the dark wine-red look.
const BG = '#111115';
const PRIMARY = '#e8b4ab';
const FLUID_COLORS = ['#FFD1CA', '#E8B4AB', '#4A3845'];

/**
 * The source's exact background: a faithful vanilla port of ReactBits'
 * LiquidEther (see ./liquidEther), driven with 1800benson.ca's own props.
 * Mounts into a fixed full-viewport container behind the content.
 */
function FluidBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    // Pin the container to the viewport via inline styles BEFORE LiquidEther
    // runs — it sets `style.position ||= 'relative'`, which would otherwise win
    // over our stylesheet and collapse the container to 0 height.
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    let dispose = () => {};
    try {
      dispose = createLiquidEther(container, {
        colors: FLUID_COLORS,
        mouseForce: 20,
        cursorSize: 100,
        isViscous: false,
        viscous: 30,
        iterationsViscous: 32,
        iterationsPoisson: 32,
        resolution: 0.5,
        dt: 0.014,
        BFECC: true,
        isBounce: false,
        autoDemo: true,
        autoSpeed: 0.3,
        autoIntensity: 1.5,
        takeoverDuration: 0.25,
        autoResumeDelay: 1000,
        autoRampDuration: 0.6,
      });
    } catch (err) {
      // Leave the dark body background in place if WebGL can't start.
      dispose = () => {};
    }
    return () => dispose();
  }, []);

  return <Canvas ref={containerRef} aria-hidden="true" />;
}

function isExternal(url) {
  return typeof url === 'string' && /^https?:\/\//.test(url);
}

function ExtLink({ href, children, className }) {
  if (!href) return <span className={className}>{children}</span>;
  const external = isExternal(href);
  return (
    <Link
      className={className}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </Link>
  );
}

// "↳ name - detail   year" entry shared by every section list.
function ArrowItem({ label, href, detail, year }) {
  return (
    <ArrowLi>
      <ArrowMark aria-hidden="true">↳</ArrowMark>
      <ArrowBody>
        {href ? <ExtLink href={href}>{label}</ExtLink> : <Em>{label}</Em>}
        {detail ? <Muted>{` - ${detail}`}</Muted> : null}
      </ArrowBody>
      {year ? <YearMeta>{year}</YearMeta> : null}
    </ArrowLi>
  );
}

// A titled section: lowercase italic heading + a ↳ list, matching the source.
function Section({ id, title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <Block id={id}>
      <Heading>{title}</Heading>
      <ArrowList>
        {items.map((it, i) => (
          <ArrowItem key={`${it.label}-${i}`} label={it.label} href={it.href} detail={it.detail} year={it.year} />
        ))}
      </ArrowList>
    </Block>
  );
}

function firstHighlight(entry) {
  if (Array.isArray(entry?.highlights) && entry.highlights.length) {
    return typeof entry.highlights[0] === 'string' ? entry.highlights[0] : entry.highlights[0]?.text || '';
  }
  return '';
}

function detailOf(entry) {
  return entry?.summary || entry?.description || firstHighlight(entry) || '';
}

function yearOf(dateStr) {
  const m = String(dateStr || '').match(/\d{4}/);
  return m ? m[0] : '';
}

export function BensonYanTheme() {
  const cv = useCV();

  const data = useMemo(() => {
    const safe = cv || {};
    const experience = (safe.experience || []).filter(Boolean);
    const education = filterActive(safe.education || []);
    const projects = filterActive(safe.projects || []);
    const volunteer = (safe.volunteer || []).filter(Boolean);
    const awards = filterActive(safe.awards || []);
    const publications = filterActive(safe.publications || []);
    const presentations = filterActive(safe.presentations || []);
    const certSkills = (safe.certificationsSkills || []).filter(Boolean);
    const profDev = filterActive(safe.professionalDevelopment || []);
    const current = experience.find((job) => job.isCurrent);

    // Top diamond bullets: a quick "current" snapshot (role + in-progress study).
    const credentials = [];
    if (current) {
      credentials.push({ prefix: current.title || '', label: current.company || '' });
    }
    const currentEdu = education.find((e) => /present|current/i.test(String(e.end_date || ''))) || education[0];
    if (currentEdu) {
      credentials.push({
        prefix: [currentEdu.degree, currentEdu.area].filter(Boolean).join(' '),
        label: currentEdu.institution || '',
        href: currentEdu.url || null,
      });
    }

    const sections = [
      {
        id: 'experience',
        title: 'experience:',
        items: experience.map((j) => ({
          label: j.title || j.company || '',
          detail: j.title && j.company ? j.company : '',
          year: formatDateRange(j.startDate, j.endDate),
        })),
      },
      {
        id: 'education',
        title: 'education:',
        items: education.map((e) => ({
          label: [e.degree, e.area].filter(Boolean).join(' ') || e.institution || '',
          detail: e.degree || e.area ? e.institution : '',
          href: e.url || null,
          year: formatDateRange(e.start_date, e.end_date),
        })),
      },
      {
        id: 'projects',
        title: "what I've been building:",
        items: projects.map((p) => ({
          label: p.name || p.title || '',
          detail: detailOf(p),
          href: p.url || p.link || p.website || null,
          year: yearOf(p.date || p.end_date || p.start_date),
        })),
      },
      {
        id: 'awards',
        title: 'awards:',
        items: awards.map((a) => ({
          label: a.name || a.title || '',
          detail: a.summary || '',
          year: yearOf(a.date),
        })),
      },
      {
        id: 'publications',
        title: 'publications:',
        items: publications.map((p) => ({
          label: p.name || p.title || '',
          detail: p.journal || p.summary || '',
          href: p.doi ? `https://doi.org/${p.doi}` : p.url || null,
          year: yearOf(p.date),
        })),
      },
      {
        id: 'presentations',
        title: 'talks & presentations:',
        items: presentations.map((p) => ({
          label: p.name || p.title || '',
          detail: p.summary || '',
          year: yearOf(p.date),
        })),
      },
      {
        id: 'volunteer',
        title: 'volunteering:',
        items: volunteer.map((v) => ({
          label: v.title || v.company || '',
          detail: v.title && v.company ? v.company : '',
          year: formatDateRange(v.startDate, v.endDate),
        })),
      },
      {
        id: 'skills',
        title: 'skills & certifications:',
        items: certSkills.map((c) => ({ label: c.label || '', detail: c.details || '' })),
      },
      {
        id: 'development',
        title: 'professional development:',
        items: profDev.map((d) => ({
          label: d.name || d.label || '',
          detail: d.summary || d.details || d.location || '',
          year: yearOf(d.date),
        })),
      },
    ].filter((s) => s.items.length > 0);

    return {
      name: safe.name || 'Your Name',
      location: safe.location || null,
      intro: safe.about || safe.headline || safe.tagline || safe.label || '',
      credentials,
      sections,
      socials: (safe.socialRaw || []).filter((s) => s && s.url),
    };
  }, [cv]);

  const hasProjects = data.sections.some((s) => s.id === 'projects');

  return (
    <>
      <GlobalStyle />
      <FluidBackground />
      <Page>
        <Main>
          <Column>
            <Nav>
              <NavLink href="#about" data-active>About</NavLink>
              <NavLink href="#experience">Experience</NavLink>
              {hasProjects && <NavLink href="#projects">Projects</NavLink>}
              <NavLink href="#contact">Contact</NavLink>
            </Nav>

            <Head id="about">
              <Name>{data.name}</Name>
              {data.location && <Location>{data.location}</Location>}
            </Head>

            {data.intro && <Intro>{data.intro}</Intro>}

            {data.credentials.length > 0 && (
              <Credentials>
                {data.credentials.map((c, i) => (
                  <DiamondLi key={`${c.label}-${i}`}>
                    <Diamond aria-hidden="true" />
                    <span>
                      {c.prefix ? <Muted>{`${c.prefix} `}</Muted> : null}
                      {c.href ? <ExtLink href={c.href}>{c.label}</ExtLink> : <Strong>{c.label}</Strong>}
                    </span>
                  </DiamondLi>
                ))}
              </Credentials>
            )}

            {data.sections.map((s) => (
              <Section key={s.id} id={s.id} title={s.title} items={s.items} />
            ))}

            <Footer id="contact">
              <Socials>
                {data.socials.map((s, i) => (
                  <ExtLink key={`${s.network}-${i}`} href={s.url} className="social">
                    {s.network || 'link'}
                  </ExtLink>
                ))}
              </Socials>
              <Webring aria-hidden="true">
                <span>←</span>
                <Diamond />
                <span>→</span>
              </Webring>
            </Footer>
          </Column>
        </Main>
      </Page>
    </>
  );
}

const GlobalStyle = createGlobalStyle`

  body {
    background: ${BG};
  }
`;

const Canvas = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  /* Viewport units so the container can't collapse to 0 height under a
     transformed/overflow ancestor (which would give LiquidEther a 1px canvas). */
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`;

const Page = styled.div`
  position: relative;
  min-height: 100%;
  color: #d4d4d4;
  font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;

  ::selection {
    background: ${PRIMARY};
    color: #000;
  }
`;

const Main = styled.main`
  position: relative;
  z-index: 10;
  margin: 0 auto;
  max-width: 550px;
  padding: 64px 24px;

  @media (min-width: 768px) {
    padding: 96px 0;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 32px;
`;

const NavLink = styled.a`
  font-size: 1.125rem;
  color: #a3a3a3;
  text-decoration: none;
  transition: color 0.15s ease;

  &[data-active] {
    color: ${PRIMARY};
  }

  &:hover {
    color: ${PRIMARY};
  }
`;

const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Name = styled.h1`
  margin: 0;
  font-family: 'Lora', Georgia, 'Times New Roman', serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: ${PRIMARY};
`;

const Location = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #a3a3a3;
`;

const Intro = styled.p`
  margin: 0;
  font-weight: 300;
  line-height: 1.7;
`;

const Credentials = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DiamondLi = styled.li`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-left: 16px;
`;

const Diamond = styled.span`
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  background: #a3a3a3;
  transform: rotate(45deg);
  flex-shrink: 0;
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  font-style: italic;
  color: ${PRIMARY};
`;

const ArrowList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ArrowLi = styled.li`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  line-height: 1.6;
`;

const ArrowBody = styled.span`
  flex: 1;
  min-width: 0;
`;

const YearMeta = styled.span`
  flex-shrink: 0;
  margin-left: 12px;
  color: #737373;
  font-variant-numeric: tabular-nums;
  font-size: 0.85em;
  padding-top: 0.15em;
  white-space: nowrap;
`;

const ArrowMark = styled.span`
  position: absolute;
  left: -16px;
  top: 2px;
  color: #737373;
`;

const Link = styled.a`
  color: #f5f5f5;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s ease;

  &:hover {
    color: ${PRIMARY};
  }
`;

const Strong = styled.span`
  color: #f5f5f5;
`;

const Em = styled.span`
  color: #f5f5f5;
`;

const Muted = styled.span`
  color: #a3a3a3;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  font-size: 1rem;
  color: #a3a3a3;

  .social {
    color: #a3a3a3;
    text-decoration: none;

    &:hover {
      color: #f5f5f5;
    }
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 16px;
`;

const Webring = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.8;
`;

export default BensonYanTheme;
