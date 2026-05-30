import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { getBioText } from '../../utils/bioText';
import { filterActive, flattenExperience } from '../../utils/cvHelpers';
import faviconUrl from './assets/favicon.png';

function hostLabel(url) {
  if (!url) return '';
  if (url.startsWith('mailto:')) return url.replace(/^mailto:/, '');
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

function linkLabel(text = '') {
  return String(text).trim().toLowerCase() || 'link';
}

function formatDate(start, end) {
  const years = [start, end]
    .filter(Boolean)
    .map((date) => String(date).toLowerCase() === 'present' ? 'now' : String(date).slice(0, 4));

  return years.length ? years.join(' - ') : '';
}

function MarkdownLink({ label, href }) {
  return (
    <span>
      [{label}](<a href={href} target="_blank" rel="noreferrer noopener">{hostLabel(href)}</a>)
    </span>
  );
}

export function LochieAxonTheme({ darkMode = false }) {
  const cv = useCV() || {};

  const name = cv.name || 'Your Name';
  const title = cv.currentJobTitle || 'design engineer';
  const about = getBioText(cv, { type: 'creative' });

  const experience = useMemo(() => (
    flattenExperience(cv.sections?.experience || [], { limit: 4 })
  ), [cv.sections?.experience]);

  const projects = useMemo(() => (
    filterActive(cv.projects || cv.sections?.projects || [], 6)
  ), [cv.projects, cv.sections?.projects]);

  const sideQuests = useMemo(() => {
    const extras = [
      ...(cv.sections?.awards || []),
      ...(cv.sections?.presentations || []),
      ...(cv.sections?.publications || []),
      ...(cv.sections?.professional_development || []),
      ...(cv.sections?.volunteer || []),
    ];

    return filterActive(extras, 6);
  }, [cv.sections]);

  const contactLinks = useMemo(() => {
    const links = [];
    const socials = cv.socialLinks || {};

    if (cv.website) links.push({ label: 'website', href: cv.website });
    if (socials.github) links.push({ label: 'github', href: socials.github });
    if (socials.linkedin) links.push({ label: 'linkedin', href: socials.linkedin });
    if (socials.twitter) links.push({ label: 'twitter', href: socials.twitter });
    if (cv.email) links.push({ label: 'email', href: `mailto:${cv.email}` });

    return links;
  }, [cv.email, cv.socialLinks, cv.website]);

  return (
    <Page $darkMode={darkMode}>
      <Main>
        <Avatar src={faviconUrl} alt="" />

        <Heading><Hash aria-hidden="true"># </Hash>{name.toLowerCase()}</Heading>
        <Subheading><Hash aria-hidden="true">## </Hash>{title.toLowerCase()}</Subheading>
        <Lead>{about}</Lead>

        {experience.length > 0 && (
          <Section>
            <SectionTitle><Hash aria-hidden="true">### </Hash>work</SectionTitle>
            <DashList>
              {experience.map((item, index) => (
                <li key={`${item.company}-${item.title}-${index}`}>
                  <strong>{linkLabel(item.company)}</strong>
                  {item.title && <span> - {item.title.toLowerCase()}</span>}
                  {formatDate(item.startDate, item.endDate) && (
                    <Meta>({formatDate(item.startDate, item.endDate)})</Meta>
                  )}
                </li>
              ))}
            </DashList>
          </Section>
        )}

        {projects.length > 0 && (
          <Section>
            <SectionTitle><Hash aria-hidden="true">### </Hash>projects</SectionTitle>
            <DashList>
              {projects.map((project, index) => (
                <li key={`${project.name}-${index}`}>
                  {project.url ? (
                    <MarkdownLink label={linkLabel(project.name)} href={project.url} />
                  ) : (
                    <span>[{linkLabel(project.name)}]</span>
                  )}
                  {project.summary && <Summary> - {project.summary}</Summary>}
                </li>
              ))}
            </DashList>
          </Section>
        )}

        {sideQuests.length > 0 && (
          <Section>
            <SectionTitle><Hash aria-hidden="true">### </Hash>side quests</SectionTitle>
            <DashList>
              {sideQuests.map((item, index) => {
                const label = item.name || item.title || item.organization || item.institution || 'side quest';
                const href = item.url || (item.doi ? `https://doi.org/${item.doi}` : null);

                return (
                  <li key={`${label}-${index}`}>
                    {href ? (
                      <MarkdownLink label={linkLabel(label)} href={href} />
                    ) : (
                      <span>[{linkLabel(label)}]</span>
                    )}
                    {(item.summary || item.location || item.date) && (
                      <Summary> - {[item.summary, item.location, item.date].filter(Boolean).join(', ')}</Summary>
                    )}
                  </li>
                );
              })}
            </DashList>
          </Section>
        )}

        {contactLinks.length > 0 && (
          <Contact>
            {contactLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                {index > 0 && <span> </span>}
                <MarkdownLink label={link.label} href={link.href} />
              </React.Fragment>
            ))}
          </Contact>
        )}

        <Passion>Design is my passion.</Passion>
      </Main>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100%;
  overflow: auto;
  background: ${({ $darkMode }) => ($darkMode ? '#101010' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111111')};
  color-scheme: ${({ $darkMode }) => ($darkMode ? 'dark' : 'light')};
  font-family: Times, 'Times New Roman', serif;
`;

const Main = styled.main`
  width: min(100% - 32px, 720px);
  margin: 0;
  padding: 16px 0 64px 16px;

  @media (min-width: 720px) {
    padding-left: 24px;
  }
`;

const Avatar = styled.img`
  display: block;
  width: 64px;
  height: 64px;
  image-rendering: auto;
  margin: 0 0 22px;
`;

const Heading = styled.h1`
  margin: 0 0 12px;
  font-size: 2em;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: 0;
`;

const Subheading = styled.h2`
  margin: 0 0 18px;
  font-size: 1.5em;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0;
`;

const Hash = styled.span`
  font-weight: inherit;
`;

const Lead = styled.p`
  max-width: 56ch;
  margin: 0 0 24px;
`;

const Section = styled.section`
  margin: 24px 0 0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 1.17em;
  line-height: 1.25;
`;

const DashList = styled.ul`
  margin: 0;
  padding: 0 0 0 1.4em;
  list-style: '- ';

  li + li {
    margin-top: 7px;
  }
`;

const Meta = styled.span`
  margin-left: 0.35em;
  opacity: 0.72;
`;

const Summary = styled.span`
  opacity: 0.82;
`;

const Contact = styled.p`
  margin: 28px 0 0;
`;

const Passion = styled.p`
  display: inline-block;
  margin: 12px 0 0;
  padding: 2rem;
  color: green;
  transform: rotate(-4deg);
  font-family: 'Comic Sans MS', 'Comic Sans', Papyrus, Courier, Arial, sans-serif;
`;
