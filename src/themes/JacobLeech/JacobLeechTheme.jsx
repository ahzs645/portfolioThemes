import React, { useEffect, useMemo } from 'react';
import { useCV, useConfig } from '../../contexts/ConfigContext';
import { ShadowRoot } from '../../ui/ShadowRoot';
import { formatMonthYear, filterActive } from '../../utils/cvHelpers';

import rawStyles from './jacobLeech.css?raw';
import cormorantMediumUrl from './assets/CormorantGaramond-Medium.woff2?url';
import cormorantMediumItalicUrl from './assets/CormorantGaramond-MediumItalic.woff2?url';
import cormorantBoldUrl from './assets/CormorantGaramond-Bold.woff2?url';
import cormorantBoldItalicUrl from './assets/CormorantGaramond-BoldItalic.woff2?url';
import bluuItalicUrl from './assets/bluunext-bolditalic.woff2?url';
import bluuTitlingUrl from './assets/bluunext-titling.woff2?url';

import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { IntroSection } from './components/IntroSection';
import { SkillsSection } from './components/SkillsSection';
import { HistorySection } from './components/HistorySection';
import { ProjectsSection } from './components/ProjectsSection';
import { EducationSection } from './components/EducationSection';
import { ContactSection } from './components/ContactSection';

const FONT_FACE_CSS = `
@font-face { font-family: CormorantGaramond; src: url(${cormorantMediumUrl}) format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: CormorantGaramond; src: url(${cormorantMediumItalicUrl}) format("woff2"); font-weight: 500; font-style: italic; font-display: swap; }
@font-face { font-family: CormorantGaramond; src: url(${cormorantBoldUrl}) format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: CormorantGaramond; src: url(${cormorantBoldItalicUrl}) format("woff2"); font-weight: 700; font-style: italic; font-display: swap; }
@font-face { font-family: Bluu; src: url(${bluuItalicUrl}) format("woff2"); font-weight: 400; font-style: italic; font-display: swap; }
@font-face { font-family: BluuTitling; src: url(${bluuTitlingUrl}) format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
`;

function getInitials(name) {
  if (!name) return ['J', 'L'];
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '';
  return [first.toUpperCase(), (last || first).toUpperCase()];
}

function formatRange(start, end) {
  const s = formatMonthYear(start);
  const e = formatMonthYear(end) || (end ? formatMonthYear(end) : '') || 'Current';
  if (!s && !e) return '';
  if (!s) return e;
  return `${s} - ${e}`;
}

function splitIntoParagraphs(text) {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSkillGroups(cv) {
  const groups = [];
  const flatSkills = cv?.skills || [];
  if (Array.isArray(flatSkills) && flatSkills.length > 0) {
    groups.push({ label: 'Tools & technologies', items: flatSkills });
  }
  const certSkills = cv?.certificationsSkills || cv?.sectionsRaw?.certifications_skills || [];
  if (Array.isArray(certSkills) && certSkills.length > 0) {
    certSkills.forEach((entry) => {
      if (!entry) return;
      const label = entry.label || entry.name || 'Skills';
      const details = entry.details || entry.summary || '';
      const items = String(details)
        .split(/[,;]\s*/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (items.length > 0) groups.push({ label, items });
    });
  }
  return groups;
}

export function JacobLeechTheme() {
  const cv = useCV();
  const { cvData } = useConfig();

  useEffect(() => {
    const id = 'jacob-leech-fonts';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = FONT_FACE_CSS;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  const experienceDisplay = useMemo(() => {
    const list = (cv?.experience || []).map((item) => ({
      ...item,
      range: formatRange(item.startDate, item.endDate),
    }));
    return list.slice(0, 10);
  }, [cv?.experience]);

  const educationDisplay = useMemo(() => {
    const raw = filterActive(cvData?.cv?.sections?.education || []);
    return raw.map((edu) => ({
      institution: edu.institution,
      school: edu.institution,
      degree: edu.degree,
      area: edu.area,
      range: formatRange(edu.start_date, edu.end_date),
    }));
  }, [cvData]);

  const awardsDisplay = useMemo(() => {
    const raw = cv?.awards || [];
    return raw.slice(0, 4).map((award) => ({
      name: award.name || award.title,
      summary: award.summary || award.issuer,
      date: award.date,
    }));
  }, [cv?.awards]);

  const skillGroups = useMemo(() => parseSkillGroups(cv), [cv]);

  const companyChips = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const item of experienceDisplay) {
      if (item.company && !seen.has(item.company)) {
        seen.add(item.company);
        out.push(item.company);
      }
      if (out.length >= 10) break;
    }
    return out;
  }, [experienceDisplay]);

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const firstName = name.split(/\s+/)[0];
  const initials = getInitials(name);
  const tagline = cv.currentJobTitle || 'Digital Craftsman';
  const email = cv.email;
  const location = cv.location;
  const website = cv.website;
  const socialLinks = cv.socialLinks || {};

  // Build intro text with graceful fallbacks when cv.about is missing.
  const aboutParagraphs = splitIntoParagraphs(cv.about);
  const currentRole = experienceDisplay.find((item) => item.isCurrent);
  const fallbackFeature =
    `Welcome! I'm ${firstName} — a ${tagline.toLowerCase()}` +
    (location ? ` based in ${location}` : '') +
    `. This page gathers the research, projects, and tools that shape what I do.`;
  const fallbackSecondary = currentRole
    ? `Currently, I'm working as ${currentRole.title} at ${currentRole.company}, focused on the details that quietly make research feel considered.`
    : `I care about careful work — the details that quietly make a piece of research or a project feel considered.`;

  const featureText = aboutParagraphs[0] || fallbackFeature;
  const extraParagraphs = aboutParagraphs.length > 1
    ? aboutParagraphs.slice(1)
    : [fallbackSecondary];

  const externalLinks = [
    socialLinks.github ? { label: 'GitHub', href: socialLinks.github } : null,
    socialLinks.linkedin ? { label: 'LinkedIn', href: socialLinks.linkedin } : null,
    socialLinks.twitter ? { label: 'Twitter', href: socialLinks.twitter } : null,
    socialLinks.youtube ? { label: 'YouTube', href: socialLinks.youtube } : null,
  ].filter(Boolean);

  const headerLinks = [
    experienceDisplay.length > 0 ? { label: 'History', href: '#history' } : null,
    { label: 'Contact', href: '#contact' },
  ].filter(Boolean);

  const footerLinks = [
    ...externalLinks.slice(0, 2).map((l) => ({ ...l, external: true })),
    email ? { label: 'Email', href: `mailto:${email}` } : null,
  ].filter(Boolean);

  const skillsFeature = `Digital projects — and research — thrive when the people building them understand how the pieces fit together. I focus on the craft of the work, and the quiet details that make it feel considered.`;
  const skillsSecondary = `My approach is project dependent. I try to pick the right tools for the job, rather than whatever is fashionable at the time.`;

  const historyFeature = `For several years now I've worked across labs, classrooms, and field sites — the positions below are a short selection of the more recent chapters.`;

  const projectsFeature = `A handful of things I've built, shipped, or contributed to — tools, scripts, and experiments tied to my research or the odd side quest.`;

  const educationFeature = `Formal study in environmental health, biomedical science, and the natural resources space — with a few awards along the way I'm grateful for.`;

  const wrapperStyle = {
    height: '100%',
    width: '100%',
    overflow: 'auto',
    overscrollBehavior: 'none',
    backgroundColor: 'hsl(42, 75%, 85%)',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ecc979' fill-opacity='0.65' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E\")",
  };

  return (
    <div style={wrapperStyle}>
      <ShadowRoot styleText={rawStyles}>
        <div className="jl-root">
          <SiteHeader name={name} tagline={tagline} links={headerLinks} />

          <main>
            <IntroSection
              initials={initials}
              externalLinks={externalLinks}
              featureText={featureText}
              extraParagraphs={extraParagraphs}
            />

            <SkillsSection
              groups={skillGroups}
              featureText={skillsFeature}
              secondaryText={skillsSecondary}
            />

            <HistorySection
              experience={experienceDisplay}
              featureText={historyFeature}
              companies={companyChips}
            />

            <ProjectsSection
              projects={cv.projects || []}
              featureText={projectsFeature}
            />

            <EducationSection
              education={educationDisplay}
              awards={awardsDisplay}
              featureText={educationFeature}
            />

            <ContactSection
              email={email}
              location={location}
              website={website}
              socialLinks={socialLinks}
            />
          </main>

          <SiteFooter
            initials={initials}
            links={footerLinks}
            year={new Date().getFullYear()}
          />
        </div>
      </ShadowRoot>
    </div>
  );
}
