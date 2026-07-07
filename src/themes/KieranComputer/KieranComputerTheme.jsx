import React, { useMemo } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDate, formatRange, isPresent } from '../../utils/cvHelpers';
import { withBase } from '../../utils/assetPath';

/**
 * KieranComputerTheme - CV-driven remake of www.kieran.computer.
 *
 * The source page is two layers: a full-viewport iframe that runs the archived
 * "monogrid b8" WebGL piece, then a fixed black panel in the lower-left with a
 * compact "things I've built" list and a tiny outbound-link row.
 */

const MONOGRID_SRC = withBase('kieran-computer/monogrid/index.html');

const GlobalStyle = createGlobalStyle`
  body { background-color: #000; }
`;

const panelIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

function ExternalArrow() {
  return (
    <Arrow
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 7L7 1M7 1H2M7 1V6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Arrow>
  );
}

function aOrAn(word = '') {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

function eduIsOngoing(entry) {
  const end = entry?.end_date;
  if (!end || isPresent(end)) return true;
  const year = parseInt(String(end).slice(0, 4), 10);
  return Number.isFinite(year) ? year >= new Date().getFullYear() : false;
}

function deriveRole(cv) {
  const phd = (cv.education || []).find(
    (entry) => /ph\.?\s*d/i.test(String(entry?.degree || '')) && eduIsOngoing(entry),
  );

  return (
    cv.headline ||
    cv.label ||
    cv.tagline ||
    (phd ? 'PhD researcher' : null) ||
    cv.currentJobTitle ||
    cv.experience?.[0]?.title ||
    'builder'
  );
}

function deriveFocus(cv) {
  for (const entry of cv.education || []) {
    for (const highlight of entry.highlights || []) {
      const match = String(highlight).match(/focus(?:ing)?\s+on\s+(.+)/i);
      if (match) return match[1].replace(/[.;]+$/, '').trim().toLowerCase();
    }
  }
  return '';
}

function formatBuiltYears(item) {
  const range = formatRange(item.start_date, item.end_date, {
    month: 'none',
    separator: '-',
    presentLabel: 'present',
    fallback: '',
  });

  if (range) return range;
  return formatDate(item.date, { month: 'none', presentLabel: 'present', fallback: '' });
}

function deriveBuiltThings(cv) {
  const projects = (cv.projects || [])
    .filter((project) => project?.name || project?.summary)
    .slice(0, 3)
    .map((project) => ({
      label: project.name || project.summary,
      years: formatBuiltYears(project),
    }));

  if (projects.length > 0) return projects;

  return (cv.experience || [])
    .filter((entry) => entry?.title || entry?.company)
    .slice(0, 3)
    .map((entry) => ({
      label: [entry.title, entry.company ? `at ${entry.company}` : ''].filter(Boolean).join(' '),
      years: formatRange(entry.startDate, entry.endDate, {
        month: 'none',
        separator: '-',
        presentLabel: 'present',
        fallback: '',
      }),
    }));
}

function deriveClosing(cv) {
  const focus = deriveFocus(cv);
  if (focus) {
    return `I enjoy exploring the edge of ${focus}, data systems, design, and applied research.`;
  }
  return 'I enjoy exploring the edge of AI, digital experiences, design, and distribution.';
}

function socialLabel(social) {
  const network = String(social?.network || '').toLowerCase();
  if (network === 'linkedin') return 'LI';
  if (network === 'twitter' || network === 'x' || network === 'github') {
    return social?.username ? `@${social.username}` : social.network;
  }
  if (network === 'instagram') return 'IG';
  if (network === 'facebook') return 'FB';
  return social?.network || 'link';
}

function deriveLinks(cv) {
  const socials = Array.isArray(cv.social) ? cv.social : [];
  const preferredNetworks = ['twitter', 'x', 'github', 'linkedin', 'instagram', 'facebook'];
  const seen = new Set();
  const links = [];

  const add = (item) => {
    if (!item?.href || seen.has(item.href)) return;
    seen.add(item.href);
    links.push(item);
  };

  for (const network of preferredNetworks) {
    const social = socials.find(
      (item) => String(item?.network || '').toLowerCase() === network && item?.url,
    );
    if (social) {
      add({
        key: `${social.network}-${social.url}`,
        label: socialLabel(social),
        href: social.url,
        external: true,
      });
    }
    if (links.length >= 3) break;
  }

  if (cv.website) {
    add({ key: 'website', label: 'web', href: cv.website, external: true });
  }

  if (cv.email && links.length < 4) {
    add({ key: 'email', label: 'email', href: `mailto:${cv.email}`, external: false });
  }

  return links.slice(0, 4);
}

export function KieranComputerTheme() {
  const rawCv = useCV();
  const cv = useMemo(() => rawCv || {}, [rawCv]);

  const name = cv.name || 'Your Name';
  const location = cv.location || '';

  const intro = useMemo(() => {
    const role = deriveRole(cv);
    const where = location ? ` based in ${location}` : '';
    return `I'm ${aOrAn(role)} ${role}${where}.`;
  }, [cv, location]);

  const built = useMemo(() => deriveBuiltThings(cv), [cv]);
  const closing = useMemo(() => deriveClosing(cv), [cv]);
  const links = useMemo(() => deriveLinks(cv), [cv]);

  return (
    <Page>
      <GlobalStyle />
      <BackgroundFrame
        src={MONOGRID_SRC}
        title="Monogrid background"
        aria-hidden="true"
        tabIndex="-1"
      />

      <Panel aria-label={`${name} profile summary`}>
        <PanelInner>
          <Header>
            <Name>{name}</Name>
          </Header>

          <section>
            <Paragraph>{intro}</Paragraph>

            {built.length > 0 && (
              <>
                <Lead>Some things I&apos;ve built:</Lead>
                <BuiltList>
                  {built.map((item, idx) => (
                    <BuiltItem key={`${item.label}-${idx}`}>
                      <Bullet aria-hidden="true">▸</Bullet>
                      <span>
                        {item.label}
                        {item.years ? ` (${item.years})` : ''}
                      </span>
                    </BuiltItem>
                  ))}
                </BuiltList>
              </>
            )}

            <Paragraph>{closing}</Paragraph>

            {links.length > 0 && (
              <LinkRow>
                {links.map((link, idx) => (
                  <React.Fragment key={link.key}>
                    {idx > 0 && <Dot aria-hidden="true">·</Dot>}
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                      {link.external && <ExternalArrow />}
                    </Link>
                  </React.Fragment>
                ))}
              </LinkRow>
            )}
          </section>
        </PanelInner>
      </Panel>
    </Page>
  );
}

const Page = styled.main`
  position: relative;
  min-height: calc(100vh - var(--app-top-offset, 0px));
  height: calc(100vh - var(--app-top-offset, 0px));
  width: 100%;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  isolation: isolate;
`;

const BackgroundFrame = styled.iframe`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
`;

const Panel = styled.aside`
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 20px;
  z-index: 1;
  max-width: 28rem;
  background: rgba(0, 0, 0, 0.9);
  color: #d1d5db;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${panelIn} 0.45s ease-out both;
  }

  @media (max-width: 540px) {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-height: calc(100% - 32px);
    overflow: auto;
  }
`;

const PanelInner = styled.div`
  padding: 1rem 2rem 0.5rem;

  @media (max-width: 540px) {
    padding: 0.875rem 1.25rem 0.375rem;
  }
`;

const Header = styled.header`
  margin: 0 0 1.5rem;
`;

const Name = styled.h1`
  margin: 2.75rem 0 0;
  padding: 0;
  color: #fff;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.75rem;
  letter-spacing: 0;

  @media (max-width: 540px) {
    margin-top: 1.5rem;
  }
`;

const Paragraph = styled.p`
  margin: 0 0 1.5rem;
  color: #d1d5db;
  font-size: 1rem;
  line-height: 1.625;
`;

const Lead = styled.p`
  margin: 0 0 0.75rem;
  color: #d1d5db;
  font-size: 1rem;
  line-height: 1.625;
`;

const BuiltList = styled.ul`
  display: grid;
  gap: 0.25rem;
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;
  color: #d1d5db;
`;

const BuiltItem = styled.li`
  display: flex;
  align-items: flex-start;
  font-size: 1rem;
  line-height: 1.625;
`;

const Bullet = styled.span`
  flex: none;
  margin-top: 0.125rem;
  margin-right: 0.75rem;
  color: #fff;
  line-height: 1.625;
`;

const LinkRow = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin: 2.25rem 0;
  color: #fff;
  font-size: 1rem;
  line-height: 1.625;
`;

const Dot = styled.span`
  color: #fff;
`;

const Link = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #fff;
  text-decoration: none;
  transition: color 0.18s ease;

  &:hover,
  &:focus-visible {
    color: #d1d5db;
    outline: none;
  }

  &:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 3px;
  }
`;

const Arrow = styled.svg`
  flex: none;
`;
