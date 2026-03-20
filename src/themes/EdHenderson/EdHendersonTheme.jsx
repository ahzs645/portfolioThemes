import React, { useState, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import { parseMarkdown } from '../../utils/parseMarkdown';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (/present/i.test(dateStr)) return 'Present';
  const d = new Date(dateStr + '-01');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
`;

export function EdHendersonTheme({ darkMode }) {
  const { cv } = useConfig();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopyEmail = useCallback(() => {
    if (cv?.email) {
      navigator.clipboard.writeText(cv.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  }, [cv?.email]);

  if (!cv) return null;

  const socials = cv.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);

  const experience = (cv.sections?.experience || []).filter((e) => !isArchived(e));
  const projects = (cv.sections?.projects || []).filter((p) => !isArchived(p));
  const education = (cv.sections?.education || []).filter((e) => !isArchived(e));
  const skills = cv.sections?.skills || [];
  const volunteer = (cv.sections?.volunteer || []).filter((v) => !isArchived(v));
  const publications = cv.sections?.publications || [];
  const awards = cv.sections?.awards || [];

  const navSections = [
    { id: 'about', label: 'About', show: !!cv.sections?.about },
    { id: 'experience', label: 'Work', show: experience.length > 0 },
    { id: 'projects', label: 'Projects', show: projects.length > 0 },
    { id: 'education', label: 'Education', show: education.length > 0 },
  ].filter((s) => s.show);

  const dm = darkMode;

  return (
    <>
      <GlobalStyle />
      <PageContainer $dm={dm}>
        <Header>
          <HeaderNameContainer>
            <HeaderName $dm={dm}>{cv.name}</HeaderName>
          </HeaderNameContainer>
          <HeaderNav $dm={dm}>
            <NavDropdown
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <NavDropdownButton $dm={dm}>
                <ArrowIcon $dm={dm}>&#9662;</ArrowIcon>
                {navSections[0]?.label || 'Menu'}
              </NavDropdownButton>
              {dropdownOpen && (
                <NavDropdownContent $dm={dm}>
                  {navSections.map((s) => (
                    <DropdownLink key={s.id} href={`#${s.id}`} $dm={dm}>
                      {s.label}
                    </DropdownLink>
                  ))}
                </NavDropdownContent>
              )}
            </NavDropdown>
            {githubUrl && (
              <>
                <NavDivider $dm={dm} />
                <NavLink href={githubUrl} target="_blank" rel="noopener noreferrer" $dm={dm}>
                  Github
                </NavLink>
              </>
            )}
            {twitterUrl && (
              <>
                <NavDivider $dm={dm} />
                <NavLink href={twitterUrl} target="_blank" rel="noopener noreferrer" $dm={dm}>
                  X
                </NavLink>
              </>
            )}
            {linkedinUrl && (
              <>
                <NavDivider $dm={dm} />
                <NavLink href={linkedinUrl} target="_blank" rel="noopener noreferrer" $dm={dm}>
                  LinkedIn
                </NavLink>
              </>
            )}
            {cv.email && (
              <>
                <NavDivider $dm={dm} />
                <NavEmailButton onClick={handleCopyEmail} $dm={dm}>
                  Email
                  <CopyIcon $copied={copiedEmail}>
                    {copiedEmail ? '✓' : '⧉'}
                  </CopyIcon>
                </NavEmailButton>
              </>
            )}
          </HeaderNav>
        </Header>

        <ContentContainer>
          {/* About */}
          {cv.sections?.about && (
            <section id="about">
              <IntroText $dm={dm}>{parseMarkdown(cv.sections.about)}</IntroText>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section id="experience">
              {experience.map((job, i) => {
                const positions = job.positions || [];
                if (positions.length > 0) {
                  return (
                    <AboutSection key={i}>
                      <SectionTitle $dm={dm}>
                        {positions.map((p) => p.title).join(' / ')} @{' '}
                        {job.url ? (
                          <AboutLink href={job.url} target="_blank" rel="noopener noreferrer" $dm={dm}>
                            {job.company}
                          </AboutLink>
                        ) : (
                          job.company
                        )}
                      </SectionTitle>
                      <AboutList $dm={dm}>
                        {positions.flatMap((p) =>
                          (p.highlights || []).map((h, j) => (
                            <li key={`${i}-${j}`}>{parseMarkdown(h)}</li>
                          ))
                        )}
                        {(job.highlights || []).map((h, j) => (
                          <li key={`main-${j}`}>{parseMarkdown(h)}</li>
                        ))}
                      </AboutList>
                    </AboutSection>
                  );
                }
                return (
                  <AboutSection key={i}>
                    <SectionTitle $dm={dm}>
                      {job.position} @{' '}
                      {job.url ? (
                        <AboutLink href={job.url} target="_blank" rel="noopener noreferrer" $dm={dm}>
                          {job.company}
                        </AboutLink>
                      ) : (
                        job.company
                      )}
                    </SectionTitle>
                    {job.highlights?.length > 0 && (
                      <AboutList $dm={dm}>
                        {job.highlights.map((h, j) => (
                          <li key={j}>{parseMarkdown(h)}</li>
                        ))}
                      </AboutList>
                    )}
                  </AboutSection>
                );
              })}
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section id="projects">
              <AboutSection>
                <SectionTitle $dm={dm}>Projects</SectionTitle>
                <AboutList $dm={dm}>
                  {projects.map((p, i) => (
                    <li key={i}>
                      {p.url ? (
                        <AboutLink href={p.url} target="_blank" rel="noopener noreferrer" $dm={dm}>
                          {p.name}
                        </AboutLink>
                      ) : (
                        <strong>{p.name}</strong>
                      )}
                      {p.description && <> — {parseMarkdown(p.description)}</>}
                    </li>
                  ))}
                </AboutList>
              </AboutSection>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section id="education">
              <AboutSection>
                <SectionTitle $dm={dm}>Education</SectionTitle>
                <AboutList $dm={dm}>
                  {education.map((e, i) => (
                    <li key={i}>
                      {e.studyType} {e.area && `in ${e.area}`} — {e.school}
                      {e.highlights?.length > 0 && (
                        <SubList $dm={dm}>
                          {e.highlights.map((h, j) => (
                            <li key={j}>{parseMarkdown(h)}</li>
                          ))}
                        </SubList>
                      )}
                    </li>
                  ))}
                </AboutList>
              </AboutSection>
            </section>
          )}

          {/* Volunteer */}
          {volunteer.length > 0 && (
            <section id="volunteer">
              <AboutSection>
                <SectionTitle $dm={dm}>Volunteer</SectionTitle>
                <AboutList $dm={dm}>
                  {volunteer.map((v, i) => (
                    <li key={i}>
                      {v.position} @ {v.company || v.organization}
                      {v.highlights?.length > 0 && (
                        <SubList $dm={dm}>
                          {v.highlights.map((h, j) => (
                            <li key={j}>{parseMarkdown(h)}</li>
                          ))}
                        </SubList>
                      )}
                    </li>
                  ))}
                </AboutList>
              </AboutSection>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <AboutSection>
              <SectionTitle $dm={dm}>Skills</SectionTitle>
              <AboutList $dm={dm}>
                {skills.map((s, i) => (
                  <li key={i}>
                    <strong>{s.name}:</strong> {Array.isArray(s.keywords) ? s.keywords.join(', ') : s.level}
                  </li>
                ))}
              </AboutList>
            </AboutSection>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <AboutSection>
              <SectionTitle $dm={dm}>Awards</SectionTitle>
              <AboutList $dm={dm}>
                {awards.map((a, i) => (
                  <li key={i}>
                    <strong>{a.title}</strong>
                    {a.awarder && <> — {a.awarder}</>}
                    {a.summary && <>. {parseMarkdown(a.summary)}</>}
                  </li>
                ))}
              </AboutList>
            </AboutSection>
          )}

          {/* Publications */}
          {publications.length > 0 && (
            <AboutSection>
              <SectionTitle $dm={dm}>Publications</SectionTitle>
              <AboutList $dm={dm}>
                {publications.map((p, i) => (
                  <li key={i}>
                    {p.url ? (
                      <AboutLink href={p.url} target="_blank" rel="noopener noreferrer" $dm={dm}>
                        {p.name}
                      </AboutLink>
                    ) : (
                      <strong>{p.name}</strong>
                    )}
                    {p.publisher && <> — {p.publisher}</>}
                  </li>
                ))}
              </AboutList>
            </AboutSection>
          )}
        </ContentContainer>
      </PageContainer>
    </>
  );
}

export default EdHendersonTheme;

// ── Styled Components ──

const PageContainer = styled.div`
  min-height: 100vh;
  font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  background-color: ${({ $dm }) => ($dm ? '#0a0a0a' : '#ffffff')};
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000000')};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const Header = styled.header``;

const HeaderNameContainer = styled.div`
  padding: 40px 60px 5px;

  @media (max-width: 700px) {
    padding: 24px 20px 5px;
  }
`;

const HeaderName = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
  text-decoration: none;
`;

const HeaderNav = styled.nav`
  border-top: 1px solid ${({ $dm }) => ($dm ? '#333' : '#e3e3e3')};
  border-bottom: 1px solid ${({ $dm }) => ($dm ? '#333' : '#e3e3e3')};
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 60px;

  @media (max-width: 700px) {
    padding: 7px 20px;
    flex-wrap: wrap;
  }
`;

const NavDropdown = styled.div`
  display: inline-block;
  position: relative;
`;

const NavDropdownButton = styled.button`
  font-family: 'Roboto Mono', monospace;
  cursor: pointer;
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
  background-color: ${({ $dm }) => ($dm ? '#333' : '#e3e3e3')};
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 4px;
  font-size: 14px;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 0.7;
  }
`;

const ArrowIcon = styled.span`
  font-size: 10px;
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
`;

const NavDropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: ${({ $dm }) => ($dm ? '#1a1a1a' : '#fff')};
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-top: 1px;
  min-width: 100%;
`;

const DropdownLink = styled.a`
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
  text-align: right;
  padding: 1px 8px;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    background-color: ${({ $dm }) => ($dm ? '#333' : '#e3e3e3')};
  }
`;

const NavDivider = styled.span`
  display: inline-block;
  width: 1px;
  height: 20px;
  background-color: ${({ $dm }) => ($dm ? '#555' : '#000')};
  vertical-align: middle;
`;

const NavLink = styled.a`
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 0.7;
  }
`;

const NavEmailButton = styled.button`
  font-family: 'Roboto Mono', monospace;
  cursor: pointer;
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  font-size: 14px;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 0.7;
  }
`;

const CopyIcon = styled.span`
  font-size: 14px;
  transition: transform 0.15s ease-out;
  ${({ $copied }) =>
    $copied &&
    `
    animation: checkPop 0.2s ease-out;
  `}

  @keyframes checkPop {
    0% { opacity: 0; transform: scale(0.5); }
    60% { transform: scale(1.15); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const ContentContainer = styled.div`
  width: 600px;
  margin-left: 60px;
  padding-top: 20px;
  padding-bottom: 60px;
  font-size: 12px;
  line-height: 1.6;

  @media (max-width: 700px) {
    width: auto;
    margin: 0;
    padding: 20px 20px 60px;
  }
`;

const IntroText = styled.div`
  margin: 0 0 24px;
  color: ${({ $dm }) => ($dm ? '#ccc' : '#000')};

  p {
    margin: 0 0 12px;
    &:last-child { margin-bottom: 24px; }
  }
`;

const AboutSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
`;

const AboutLink = styled.a`
  color: ${({ $dm }) => ($dm ? '#e5e5e5' : '#000')};
  text-decoration: underline;
  transition: color 0.15s ease-out;

  &:hover {
    color: ${({ $dm }) => ($dm ? '#999' : '#666')};
  }
`;

const AboutList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  color: ${({ $dm }) => ($dm ? '#ccc' : '#000')};

  li {
    padding-left: 14px;
    position: relative;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
    }
  }
`;

const SubList = styled.ul`
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  color: ${({ $dm }) => ($dm ? '#aaa' : '#444')};

  li {
    padding-left: 14px;
    position: relative;
    font-size: 11px;

    &::before {
      content: '–';
      position: absolute;
      left: 0;
    }
  }
`;
