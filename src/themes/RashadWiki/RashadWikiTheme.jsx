import React from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const WikiLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M50 6C25.7 6 6 25.7 6 50s19.7 44 44 44 44-19.7 44-44S74.3 6 50 6z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    {/* Globe grid lines */}
    <ellipse cx="50" cy="50" rx="20" ry="44" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <ellipse cx="50" cy="50" rx="35" ry="44" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <line x1="6" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="50" y1="6" x2="50" y2="94" stroke="currentColor" strokeWidth="1.2"/>
    <ellipse cx="50" cy="30" rx="42" ry="0" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 35 Q50 28 88 35" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M12 65 Q50 72 88 65" stroke="currentColor" strokeWidth="1" fill="none"/>
    {/* Puzzle piece jigsaw top */}
    <text x="50" y="56" textAnchor="middle" fontSize="28" fontFamily="serif" fontWeight="bold" fill="currentColor">W</text>
  </svg>
);

const Wrapper = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap');

  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: ${p => p.$dark ? '#e0e0e0' : '#202122'};
  background: ${p => p.$dark ? '#1a1a1a' : '#ffffff'};
  flex: 1;

  a {
    color: ${p => p.$dark ? '#6b9eff' : '#0645ad'};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  * { box-sizing: border-box; }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Banner = styled.div`
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #36c, #69c, #9cf);
`;

const Header = styled.header`
  width: 100%;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${p => p.$dark ? '#333' : '#a2a9b1'};
  font-size: 13px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoWrap = styled.div`
  color: ${p => p.$dark ? '#e0e0e0' : '#202122'};
  display: flex;
  align-items: center;
`;

const HeaderName = styled.a`
  font-family: 'Nanum Myeongjo', serif;
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.$dark ? '#e0e0e0' : '#202122'} !important;
  text-decoration: none !important;
`;

const HeaderSubtitle = styled.div`
  font-family: 'Nanum Myeongjo', serif;
  font-size: 11px;
  color: ${p => p.$dark ? '#888' : '#72777d'};
  margin-top: -2px;
`;

const MainLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 30px;
  }
`;

const Sidebar = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 15px 0;

  @media (min-width: 768px) {
    flex-direction: column;
    width: 200px;
    min-width: 200px;
    padding: 20px 0;
    gap: 18px;
  }
`;

const SidebarLink = styled.div`
  font-size: 13px;

  .desc {
    color: ${p => p.$dark ? '#777' : '#bababa'};
    margin-top: 2px;
    display: none;
  }

  @media (min-width: 768px) {
    .desc { display: block; }
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 20px 0;
  min-width: 0;
`;

const Title = styled.h1`
  font-family: 'Nanum Myeongjo', serif;
  font-size: 30px;
  font-weight: 400;
  margin: 0 0 4px 0;
`;

const SectionTitle = styled.h2`
  font-family: 'Nanum Myeongjo', serif;
  font-size: 22px;
  font-weight: 400;
  margin: 30px 0 4px 0;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${p => p.$dark ? '#444' : '#bababa'};
  margin-bottom: 16px;
`;

const InfoBox = styled.aside`
  width: 100%;
  max-width: 300px;
  margin: 30px auto;
  border: 1px solid ${p => p.$dark ? '#444' : '#bababa'};
  background: ${p => p.$dark ? '#252525' : '#f8f9fa'};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  font-size: 13px;

  @media (min-width: 768px) {
    margin-top: 100px;
    margin-bottom: 30px;
  }
`;

const InfoBoxTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
`;

const InfoRow = styled.div`
  display: flex;
  width: 100%;
  padding: 0 10px;
  margin-top: 12px;

  .label {
    width: 40%;
    font-weight: bold;
    font-size: 13px;
  }
  .value {
    width: 60%;
    font-size: 13px;
  }
`;

const Paragraph = styled.p`
  margin: 0 0 12px 0;
  line-height: 1.6;
`;

const TOCBox = styled.div`
  background: ${p => p.$dark ? '#252525' : '#f8f9fa'};
  border: 1px solid ${p => p.$dark ? '#444' : '#bababa'};
  padding: 12px 16px;
  margin-bottom: 20px;
  display: inline-block;
  font-size: 13px;

  .toc-title {
    font-weight: bold;
    margin-bottom: 6px;
  }

  ol {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 2px;
  }

  a {
    color: ${p => p.$dark ? '#6b9eff' : '#0645ad'};
  }
`;

function formatDateRange(start, end) {
  const fmt = d => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const s = fmt(start);
  const e = end ? fmt(end) : 'present';
  return `${s} – ${e}`;
}

export function RashadWikiTheme({ darkMode }) {
  const cv = useCV();

  const socialLinks = cv.socialLinks || {};
  const links = [];
  if (socialLinks.linkedin) links.push({ url: socialLinks.linkedin, label: 'LinkedIn', desc: 'Professional profile' });
  if (socialLinks.github) links.push({ url: socialLinks.github, label: 'GitHub', desc: 'Public code and projects' });
  if (cv.website) links.push({ url: cv.website, label: 'Website', desc: cv.website });
  if (socialLinks.twitter) links.push({ url: socialLinks.twitter, label: 'Twitter', desc: 'Posts and updates' });

  const experience = cv.experience || [];
  const education = cv.education || [];
  const projects = cv.projects || [];
  const volunteer = cv.volunteer || [];
  const publications = cv.publications || [];
  const skills = cv.skills || [];

  const currentTitle = cv.currentJobTitle || (experience[0]?.title) || '';

  const sections = [];
  if (education.length > 0) sections.push({ id: 'education', label: 'Early Life and Education' });
  if (experience.length > 0) sections.push({ id: 'career', label: 'Career' });
  if (projects.length > 0) sections.push({ id: 'projects', label: 'Projects' });
  if (volunteer.length > 0) sections.push({ id: 'volunteer', label: 'Volunteer Work' });
  if (publications.length > 0) sections.push({ id: 'publications', label: 'Publications' });
  sections.push({ id: 'personal', label: 'Personal Life' });

  return (
    <Wrapper $dark={darkMode}>
      <Banner />
      <Container>
        <Header $dark={darkMode}>
          <HeaderLeft>
            <LogoWrap $dark={darkMode}>
              <WikiLogo />
            </LogoWrap>
            <div>
              <HeaderName $dark={darkMode} href="#">{cv.name}</HeaderName>
              <HeaderSubtitle $dark={darkMode}>The Free Encyclopedia</HeaderSubtitle>
            </div>
          </HeaderLeft>
          <div>
            {cv.email && <a href={`mailto:${cv.email}`}>{cv.email}</a>}
            {cv.location && <span style={{ marginLeft: 16, color: darkMode ? '#999' : '#666' }}>{cv.location}</span>}
          </div>
        </Header>

        <MainLayout>
          <Sidebar>
            {links.map((l, i) => (
              <SidebarLink key={i} $dark={darkMode}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">&raquo; {l.label}</a>
                <div className="desc">{l.desc}</div>
              </SidebarLink>
            ))}
          </Sidebar>

          <Content>
            <Title>{cv.name}</Title>
            <Divider $dark={darkMode} />

            {cv.about && (
              <Paragraph>
                <strong>{cv.name}</strong> is {currentTitle ? `a ${currentTitle}` : 'a professional'}{' '}
                {cv.location ? `based in ${cv.location}` : ''}.{' '}
                <span dangerouslySetInnerHTML={{ __html: cv.about }} />
              </Paragraph>
            )}

            <TOCBox $dark={darkMode}>
              <div className="toc-title">Contents</div>
              <ol>
                {sections.map((s, i) => (
                  <li key={s.id}><a href={`#wiki-${s.id}`}>{s.label}</a></li>
                ))}
              </ol>
            </TOCBox>

            {education.length > 0 && (
              <>
                <SectionTitle id="wiki-education">Early Life and Education</SectionTitle>
                <Divider $dark={darkMode} />
                {education.map((edu, i) => (
                  <Paragraph key={i}>
                    {cv.name?.split(' ')[0]} {edu.description ? (
                      <>studied at <a href={edu.url || '#'}>{edu.institution}</a>{edu.area ? `, focusing on ${edu.area}` : ''}{edu.studyType ? ` (${edu.studyType})` : ''}.{' '}
                        {edu.description && <span dangerouslySetInnerHTML={{ __html: edu.description }} />}
                      </>
                    ) : (
                      <>attended <a href={edu.url || '#'}>{edu.institution}</a>{edu.area ? `, studying ${edu.area}` : ''}{edu.studyType ? ` (${edu.studyType})` : ''}{edu.startDate ? `, graduating in ${new Date(edu.endDate || edu.startDate).getFullYear()}` : ''}.
                      </>
                    )}
                  </Paragraph>
                ))}
              </>
            )}

            {experience.length > 0 && (
              <>
                <SectionTitle id="wiki-career">Career</SectionTitle>
                <Divider $dark={darkMode} />
                {experience.map((job, i) => (
                  <Paragraph key={i}>
                    {i === 0 ? `${cv.name?.split(' ')[0]}'s career includes work as ` : 'Subsequently, they worked as '}
                    <strong>{job.title}</strong> at <a href={job.url || '#'}>{job.company}</a>{' '}
                    ({formatDateRange(job.startDate, job.endDate)}).
                    {job.description && (
                      <> <span dangerouslySetInnerHTML={{ __html: job.description }} /></>
                    )}
                    {job.highlights && job.highlights.length > 0 && (
                      <> {job.highlights.map(h => typeof h === 'string' ? h : h.text || '').join(' ')}</>
                    )}
                  </Paragraph>
                ))}
              </>
            )}

            {projects.length > 0 && (
              <>
                <SectionTitle id="wiki-projects">Projects</SectionTitle>
                <Divider $dark={darkMode} />
                {projects.map((p, i) => (
                  <Paragraph key={i}>
                    <a href={p.url || '#'}><strong>{p.name}</strong></a>
                    {p.description && <> — <span dangerouslySetInnerHTML={{ __html: p.description }} /></>}
                  </Paragraph>
                ))}
              </>
            )}

            {volunteer.length > 0 && (
              <>
                <SectionTitle id="wiki-volunteer">Volunteer Work</SectionTitle>
                <Divider $dark={darkMode} />
                {volunteer.map((v, i) => (
                  <Paragraph key={i}>
                    <strong>{v.position || v.title}</strong> at {v.organization || v.company}
                    {v.startDate && <> ({formatDateRange(v.startDate, v.endDate)})</>}.
                    {v.summary && <> <span dangerouslySetInnerHTML={{ __html: v.summary }} /></>}
                  </Paragraph>
                ))}
              </>
            )}

            {publications.length > 0 && (
              <>
                <SectionTitle id="wiki-publications">Publications</SectionTitle>
                <Divider $dark={darkMode} />
                {publications.map((pub, i) => (
                  <Paragraph key={i}>
                    <a href={pub.url || '#'}><strong>{pub.name}</strong></a>
                    {pub.publisher && <>, {pub.publisher}</>}
                    {pub.releaseDate && <> ({new Date(pub.releaseDate).getFullYear()})</>}.
                    {pub.summary && <> <span dangerouslySetInnerHTML={{ __html: pub.summary }} /></>}
                  </Paragraph>
                ))}
              </>
            )}

            {cv.about && (
              <>
                <SectionTitle id="wiki-personal">Personal Life</SectionTitle>
                <Divider $dark={darkMode} />
                <Paragraph>
                  {cv.location && <>{cv.name?.split(' ')[0]} is currently based in {cv.location}. </>}
                  {skills.length > 0 && (
                    <>Their skills include {skills.map(s => typeof s === 'string' ? s : s.name).join(', ')}.</>
                  )}
                </Paragraph>
              </>
            )}
          </Content>

          <InfoBox $dark={darkMode}>
            <InfoBoxTitle>{cv.name}</InfoBoxTitle>
            <InfoRow>
              <div className="label">Location</div>
              <div className="value">{cv.location || 'N/A'}</div>
            </InfoRow>
            {currentTitle && (
              <InfoRow>
                <div className="label">Occupation</div>
                <div className="value">{currentTitle}</div>
              </InfoRow>
            )}
            {cv.email && (
              <InfoRow>
                <div className="label">Email</div>
                <div className="value"><a href={`mailto:${cv.email}`}>{cv.email}</a></div>
              </InfoRow>
            )}
            {cv.website && (
              <InfoRow>
                <div className="label">Website</div>
                <div className="value"><a href={cv.website} target="_blank" rel="noopener noreferrer">{cv.website}</a></div>
              </InfoRow>
            )}
            {education.length > 0 && (
              <InfoRow>
                <div className="label">Education</div>
                <div className="value">
                  {education.map((e, i) => (
                    <div key={i}>{e.institution}{e.studyType ? ` (${e.studyType})` : ''}</div>
                  ))}
                </div>
              </InfoRow>
            )}
            {skills.length > 0 && (
              <InfoRow>
                <div className="label">Skills</div>
                <div className="value">{skills.slice(0, 5).map(s => typeof s === 'string' ? s : s.name).join(', ')}</div>
              </InfoRow>
            )}
          </InfoBox>
        </MainLayout>
      </Container>
    </Wrapper>
  );
}
