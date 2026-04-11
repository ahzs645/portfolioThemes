import React, { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const GlobalFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
`;

function formatYear(value) {
  if (!value) return '';
  const str = String(value).trim();
  if (str.toLowerCase() === 'present') return 'now';
  const match = str.match(/\d{4}/);
  return match ? match[0] : str;
}

function formatRange(start, end) {
  const s = formatYear(start);
  const e = formatYear(end);
  if (s && e && s !== e) return `${s}—${e}`;
  return s || e || '';
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatClock(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDay(date) {
  return String(date.getDate()).padStart(2, '0');
}

export function JoostDamhuisTheme() {
  const cv = useCV();
  const now = useClock();

  const sections = useMemo(() => {
    if (!cv) return [];
    const out = [];
    if (cv.experience?.length) out.push({ key: 'work', label: 'work' });
    if (cv.projects?.length) out.push({ key: 'projects', label: 'projects' });
    if (cv.skills?.length) out.push({ key: 'skills', label: 'skills' });
    if (cv.education?.length) out.push({ key: 'education', label: 'education' });
    if (cv.awards?.length) out.push({ key: 'awards', label: 'awards' });
    return out;
  }, [cv]);

  if (!cv) return null;

  const name = (cv.name || 'your name').toLowerCase();
  const title = (cv.currentJobTitle || cv.currentTitle || '').toLowerCase();
  const location = (cv.location || '').toLowerCase();
  const about = cv.about || '';
  const social = cv.socialLinks || {};

  const contactLinks = [
    social.twitter && { label: 'twitter', href: social.twitter },
    social.linkedin && { label: 'linkedin', href: social.linkedin },
    social.github && { label: 'github', href: social.github },
    cv.email && { label: 'email', href: `mailto:${cv.email}` },
  ].filter(Boolean);

  return (
    <>
      <GlobalFonts />
      <Page>
        <Backdrop />
        <Viewport>
          <TopBar>
            <Mono>joost_damhuis/clone</Mono>
            <Mono className="dim">{name}</Mono>
          </TopBar>

          <Hero>
            <Name>{name}</Name>
            {title && <Subline>{title}</Subline>}
            {location && <LocationLine>{location}</LocationLine>}
            {contactLinks.length > 0 && (
              <ContactLine>
                don’t be a stranger — say hi on{' '}
                {contactLinks.map((link, i) => (
                  <React.Fragment key={link.label}>
                    <Accent href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </Accent>
                    {i < contactLinks.length - 2 && ', '}
                    {i === contactLinks.length - 2 && ' or '}
                  </React.Fragment>
                ))}
                .
              </ContactLine>
            )}
          </Hero>

          <ClockWidget>
            <ClockTime>{formatClock(now)}</ClockTime>
            <ClockDay>{formatDay(now)}</ClockDay>
          </ClockWidget>

          <NowPlaying>
            <NpRow>
              <NpDot />
              <NpLabel>now playing</NpLabel>
            </NpRow>
            <NpTitle>{title || 'available for work'}</NpTitle>
            <NpArtist>{name}</NpArtist>
          </NowPlaying>

          <ScrollHint>scroll ↓</ScrollHint>
        </Viewport>

        <Content>
          {about && (
            <Section>
              <SectionHead>about</SectionHead>
              <About>{about}</About>
            </Section>
          )}

          {cv.experience?.length > 0 && (
            <Section>
              <SectionHead>work</SectionHead>
              <EntryList>
                {cv.experience.map((job, i) => (
                  <Entry key={i}>
                    <EntryTime>{formatRange(job.startDate, job.endDate)}</EntryTime>
                    <EntryBody>
                      <EntryTitle>
                        {(job.title || job.position || '').toLowerCase()}
                        {job.company && (
                          <>
                            <EntrySep>@</EntrySep>
                            <Accent as="span">
                              {String(job.company).toLowerCase()}
                            </Accent>
                          </>
                        )}
                      </EntryTitle>
                      {job.location && (
                        <EntryMeta>{String(job.location).toLowerCase()}</EntryMeta>
                      )}
                      {job.summary && <EntryText>{job.summary}</EntryText>}
                      {Array.isArray(job.highlights) && job.highlights.length > 0 && (
                        <Highlights>
                          {job.highlights.map((h, idx) => (
                            <li key={idx}>{h}</li>
                          ))}
                        </Highlights>
                      )}
                    </EntryBody>
                  </Entry>
                ))}
              </EntryList>
            </Section>
          )}

          {cv.projects?.length > 0 && (
            <Section>
              <SectionHead>projects</SectionHead>
              <EntryList>
                {cv.projects.map((project, i) => (
                  <Entry key={i}>
                    <EntryTime>{formatRange(project.startDate, project.endDate)}</EntryTime>
                    <EntryBody>
                      <EntryTitle>
                        {project.url ? (
                          <Accent href={project.url} target="_blank" rel="noreferrer">
                            {String(project.name || '').toLowerCase()}
                          </Accent>
                        ) : (
                          String(project.name || '').toLowerCase()
                        )}
                      </EntryTitle>
                      {project.summary && <EntryText>{project.summary}</EntryText>}
                      {Array.isArray(project.highlights) && project.highlights.length > 0 && (
                        <Highlights>
                          {project.highlights.map((h, idx) => (
                            <li key={idx}>{h}</li>
                          ))}
                        </Highlights>
                      )}
                    </EntryBody>
                  </Entry>
                ))}
              </EntryList>
            </Section>
          )}

          {cv.skills?.length > 0 && (
            <Section>
              <SectionHead>skills</SectionHead>
              <SkillGrid>
                {cv.skills.map((skill, i) => {
                  const label =
                    typeof skill === 'string'
                      ? skill
                      : skill?.name || skill?.category || '';
                  if (!label) return null;
                  return <SkillCell key={i}>{String(label).toLowerCase()}</SkillCell>;
                })}
              </SkillGrid>
            </Section>
          )}

          {cv.education?.length > 0 && (
            <Section>
              <SectionHead>education</SectionHead>
              <EntryList>
                {cv.education.map((edu, i) => (
                  <Entry key={i}>
                    <EntryTime>{formatRange(edu.startDate, edu.endDate)}</EntryTime>
                    <EntryBody>
                      <EntryTitle>
                        {String(edu.degree || edu.studyType || edu.area || '').toLowerCase()}
                        {edu.school && (
                          <>
                            <EntrySep>@</EntrySep>
                            <Accent as="span">
                              {String(edu.school).toLowerCase()}
                            </Accent>
                          </>
                        )}
                      </EntryTitle>
                      {edu.summary && <EntryText>{edu.summary}</EntryText>}
                    </EntryBody>
                  </Entry>
                ))}
              </EntryList>
            </Section>
          )}

          {cv.awards?.length > 0 && (
            <Section>
              <SectionHead>awards</SectionHead>
              <EntryList>
                {cv.awards.map((award, i) => (
                  <Entry key={i}>
                    <EntryTime>{formatYear(award.date)}</EntryTime>
                    <EntryBody>
                      <EntryTitle>{String(award.title || '').toLowerCase()}</EntryTitle>
                      {award.issuer && (
                        <EntryMeta>{String(award.issuer).toLowerCase()}</EntryMeta>
                      )}
                      {award.summary && <EntryText>{award.summary}</EntryText>}
                    </EntryBody>
                  </Entry>
                ))}
              </EntryList>
            </Section>
          )}

          <Footer>
            <FootLine>
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
              <FootSep>·</FootSep>
              <span>{name}</span>
              {sections.length > 0 && (
                <>
                  <FootSep>·</FootSep>
                  <span>{sections.map((s) => s.label).join(' / ')}</span>
                </>
              )}
            </FootLine>
          </Footer>
        </Content>
      </Page>
    </>
  );
}

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const Page = styled.div`
  min-height: 100vh;
  background: #000;
  color: #e8e8e8;
  font-family: 'Geist Mono', 'SFMono-Regular', Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0.01em;
  font-feature-settings: 'ss01' on, 'ss02' on;
  position: relative;
  overflow-x: hidden;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 255, 223, 0.06), transparent 70%),
    linear-gradient(180deg, rgb(23, 23, 23) 0%, rgb(10, 10, 10) 60%, #000 100%);
  z-index: 0;
`;

const Viewport = styled.section`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 32px 48px 64px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 32px;

  @media (max-width: 720px) {
    padding: 24px 20px 48px;
  }
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;

  .dim {
    opacity: 0.5;
  }
`;

const Mono = styled.span`
  font-family: 'Geist Mono', monospace;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  color: rgba(232, 232, 232, 0.75);
`;

const Hero = styled.div`
  align-self: center;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Name = styled.h1`
  font-family: 'Geist', 'Inter', sans-serif;
  font-weight: 500;
  font-size: clamp(42px, 7vw, 88px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: #fff;
  margin: 0;
`;

const Subline = styled.p`
  font-size: 14px;
  color: rgba(232, 232, 232, 0.72);
  margin: 0;
`;

const LocationLine = styled.p`
  font-size: 12px;
  color: rgba(232, 232, 232, 0.45);
  margin: 0;
`;

const ContactLine = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: rgba(232, 232, 232, 0.8);
  max-width: 520px;
  line-height: 1.7;
`;

const Accent = styled.a`
  color: #78ffdf;
  text-decoration: none;
  border-bottom: 1px solid rgba(120, 255, 223, 0.35);
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: #a7ffea;
    border-bottom-color: #a7ffea;
  }
`;

const ClockWidget = styled.aside`
  position: absolute;
  top: 32px;
  right: 48px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: 'Geist Mono', monospace;
  font-feature-settings: 'ss02' on;
  color: rgba(232, 232, 232, 0.65);

  @media (max-width: 720px) {
    top: 56px;
    right: 20px;
  }
`;

const ClockTime = styled.span`
  font-size: 22px;
  color: #fff;
  letter-spacing: -0.01em;
`;

const ClockDay = styled.span`
  font-size: 11px;
  opacity: 0.55;
`;

const NowPlaying = styled.div`
  position: absolute;
  left: 48px;
  bottom: 48px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(6px);
  min-width: 220px;

  @media (max-width: 720px) {
    left: 20px;
    right: 20px;
    bottom: 24px;
    min-width: 0;
  }
`;

const NpRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NpDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #78ffdf;
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

const NpLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(232, 232, 232, 0.55);
`;

const NpTitle = styled.span`
  font-size: 13px;
  color: #fff;
  margin-top: 2px;
`;

const NpArtist = styled.span`
  font-size: 11px;
  color: rgba(232, 232, 232, 0.55);
`;

const ScrollHint = styled.div`
  position: absolute;
  right: 48px;
  bottom: 48px;
  font-size: 11px;
  color: rgba(232, 232, 232, 0.45);
  letter-spacing: 0.08em;

  @media (max-width: 720px) {
    display: none;
  }
`;

const Content = styled.main`
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
  padding: 96px 48px 120px;
  display: flex;
  flex-direction: column;
  gap: 72px;

  @media (max-width: 720px) {
    padding: 64px 20px 96px;
    gap: 56px;
  }
`;

const Section = styled.section`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const SectionHead = styled.h2`
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  text-transform: lowercase;
  letter-spacing: 0.14em;
  color: rgba(232, 232, 232, 0.45);
  margin: 4px 0 0;

  &::before {
    content: '// ';
    color: #78ffdf;
  }
`;

const About = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: rgba(232, 232, 232, 0.85);
  max-width: 60ch;
  margin: 0;
  white-space: pre-wrap;
`;

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Entry = styled.article`
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const EntryTime = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: rgba(232, 232, 232, 0.45);
  letter-spacing: 0.04em;
  padding-top: 4px;
`;

const EntryBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EntryTitle = styled.div`
  font-size: 15px;
  color: #fff;
  text-transform: lowercase;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
`;

const EntrySep = styled.span`
  color: rgba(232, 232, 232, 0.35);
`;

const EntryMeta = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: rgba(232, 232, 232, 0.45);
`;

const EntryText = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(232, 232, 232, 0.72);
`;

const Highlights = styled.ul`
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    position: relative;
    padding-left: 16px;
    font-size: 13px;
    color: rgba(232, 232, 232, 0.7);
    line-height: 1.6;

    &::before {
      content: '—';
      position: absolute;
      left: 0;
      color: #78ffdf;
      opacity: 0.6;
    }
  }
`;

const SkillGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SkillCell = styled.span`
  font-size: 12px;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: rgba(232, 232, 232, 0.78);
  background: rgba(255, 255, 255, 0.015);
`;

const Footer = styled.footer`
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const FootLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: rgba(232, 232, 232, 0.4);
  text-transform: lowercase;
`;

const FootSep = styled.span`
  opacity: 0.4;
`;
