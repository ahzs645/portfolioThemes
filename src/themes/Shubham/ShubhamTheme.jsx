import React, { useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Current';
  return dateStr;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Light and dark themes matching shubhwym.me
const lightTheme = {
  background: '#ffffff',
  foreground: '#333333',
  accent: 'dodgerblue',
  muted: '#666666',
  border: '#333333',
  codeBackground: '#f5f5f5',
};

const darkTheme = {
  background: '#121212',
  foreground: '#eeeeee',
  accent: 'dodgerblue',
  muted: '#aaaaaa',
  border: '#eeeeee',
  codeBackground: '#2a2a2a',
};

export function ShubhamTheme({ darkMode }) {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [activePage, setActivePage] = useState('home');

  const fullName = cv?.name || 'User';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const location = cv?.location || null;
  const website = cv?.website || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Experience items with nested positions support (grouped by company)
  const experienceItems = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    return experiences.map(exp => {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        return {
          type: 'nested',
          company: exp.company,
          location: exp.location,
          url: exp.url,
          positions: exp.positions.map(pos => ({
            title: pos.title || pos.position || exp.position,
            startDate: formatDate(pos.start_date),
            endDate: formatDate(pos.end_date),
            summary: pos.summary,
          })),
        };
      }
      return {
        type: 'single',
        company: exp.company,
        location: exp.location,
        url: exp.url,
        title: exp.position,
        startDate: formatDate(exp.start_date),
        endDate: formatDate(exp.end_date),
        summary: exp.summary,
      };
    }).slice(0, 8);
  }, [cv]);

  // Volunteer items with nested positions support
  const volunteerItems = useMemo(() => {
    const volunteers = (cv?.sections?.volunteer || []).filter(e => !isArchived(e));
    return volunteers.map(vol => {
      if (Array.isArray(vol.positions) && vol.positions.length > 0) {
        return {
          type: 'nested',
          organization: vol.organization,
          location: vol.location,
          url: vol.url,
          positions: vol.positions.map(pos => ({
            title: pos.title || pos.position || pos.role || vol.position || vol.role,
            startDate: formatDate(pos.start_date),
            endDate: formatDate(pos.end_date),
            summary: pos.summary,
          })),
        };
      }
      return {
        type: 'single',
        organization: vol.organization,
        location: vol.location,
        url: vol.url,
        title: vol.position || vol.role,
        startDate: formatDate(vol.start_date),
        endDate: formatDate(vol.end_date),
        summary: vol.summary,
      };
    }).slice(0, 6);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e)).slice(0, 4);
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 10);
  }, [cv]);

  // Skills
  const skills = useMemo(() => {
    return cv?.sections?.certifications_skills || [];
  }, [cv]);

  // Awards
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentations
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Publications
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional Development
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  const theme = darkMode ? darkTheme : lightTheme;

  const renderBreadcrumbs = (currentPage) => (
    <Breadcrumbs>
      {currentPage !== 'home' && (
        <>
          <BreadcrumbLink onClick={() => setActivePage('home')}>home</BreadcrumbLink>
          <span> / </span>
        </>
      )}
      <span>{currentPage}</span>
    </Breadcrumbs>
  );

  const renderHomePage = () => (
    <Page>
      {renderBreadcrumbs('home')}
      <Title>Home</Title>
      {aboutText && <Paragraph>{aboutText}</Paragraph>}
      <NavLink onClick={() => setActivePage('resume')}>resume</NavLink>
      <NavLink onClick={() => setActivePage('projects')}>projects</NavLink>
      {(awardItems.length > 0 || presentationItems.length > 0 || publicationItems.length > 0) && (
        <NavLink onClick={() => setActivePage('achievements')}>achievements</NavLink>
      )}
      <Divider />
      <Paragraph>
        {email && (
          <>
            Email: <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>
            <br />
          </>
        )}
        {phone && (
          <>
            Phone: {phone}
            <br />
          </>
        )}
        {location && (
          <>
            Location: {location}
            <br />
          </>
        )}
        {website && (
          <>
            <ExternalLink href={website} target="_blank" rel="noopener noreferrer">
              Website
            </ExternalLink>
            <br />
          </>
        )}
        {githubUrl && (
          <>
            <ExternalLink href={githubUrl} target="_blank" rel="noopener noreferrer">
              Github
            </ExternalLink>
            <br />
          </>
        )}
        {linkedinUrl && (
          <>
            <ExternalLink href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </ExternalLink>
            <br />
          </>
        )}
        {twitterUrl && (
          <ExternalLink href={twitterUrl} target="_blank" rel="noopener noreferrer">
            Twitter/X
          </ExternalLink>
        )}
      </Paragraph>
    </Page>
  );

  const renderExperienceItem = (item, idx) => {
    if (item.type === 'nested') {
      return (
        <NestedBlockQuote key={`exp-${idx}`}>
          <CompanyHeader>
            {item.url ? (
              <ExternalLink href={item.url} target="_blank" rel="noopener noreferrer">
                {item.company}
              </ExternalLink>
            ) : (
              item.company
            )}
            {item.location && ` (${item.location.toLowerCase()})`}
          </CompanyHeader>
          {item.positions.map((pos, posIdx) => (
            <PositionItem key={`pos-${posIdx}`}>
              <p>
                {pos.title}
                <br />
                <Small>{pos.startDate}-{pos.endDate}</Small>
                {pos.summary && <><br /><Small>{pos.summary}</Small></>}
              </p>
            </PositionItem>
          ))}
        </NestedBlockQuote>
      );
    }
    return (
      <BlockQuote key={`exp-${idx}`}>
        <p>
          {item.title}
          <br />
          {item.url ? (
            <ExternalLink href={item.url} target="_blank" rel="noopener noreferrer">
              {item.company}
            </ExternalLink>
          ) : (
            item.company
          )}
          {item.location && ` (${item.location.toLowerCase()})`}
          <br />
          {item.startDate}-{item.endDate}
          {item.summary && <><br /><Small>{item.summary}</Small></>}
        </p>
      </BlockQuote>
    );
  };

  const renderVolunteerItem = (item, idx) => {
    if (item.type === 'nested') {
      return (
        <NestedBlockQuote key={`vol-${idx}`}>
          <CompanyHeader>
            {item.url ? (
              <ExternalLink href={item.url} target="_blank" rel="noopener noreferrer">
                {item.organization}
              </ExternalLink>
            ) : (
              item.organization
            )}
            {item.location && ` (${item.location.toLowerCase()})`}
          </CompanyHeader>
          {item.positions.map((pos, posIdx) => (
            <PositionItem key={`vpos-${posIdx}`}>
              <p>
                {pos.title}
                <br />
                <Small>{pos.startDate}-{pos.endDate}</Small>
                {pos.summary && <><br /><Small>{pos.summary}</Small></>}
              </p>
            </PositionItem>
          ))}
        </NestedBlockQuote>
      );
    }
    return (
      <BlockQuote key={`vol-${idx}`}>
        <p>
          {item.title}
          <br />
          {item.url ? (
            <ExternalLink href={item.url} target="_blank" rel="noopener noreferrer">
              {item.organization}
            </ExternalLink>
          ) : (
            item.organization
          )}
          {item.location && ` (${item.location.toLowerCase()})`}
          <br />
          {item.startDate}-{item.endDate}
          {item.summary && <><br /><Small>{item.summary}</Small></>}
        </p>
      </BlockQuote>
    );
  };

  const renderResumePage = () => (
    <Page>
      {renderBreadcrumbs('resume')}
      <Title>Career</Title>

      {experienceItems.length > 0 && (
        <>
          <CodeBlock>Work</CodeBlock>
          <Divider />
          {experienceItems.map((item, idx) => renderExperienceItem(item, idx))}
        </>
      )}

      {volunteerItems.length > 0 && (
        <>
          <CodeBlock>Volunteer</CodeBlock>
          <Divider />
          {volunteerItems.map((item, idx) => renderVolunteerItem(item, idx))}
        </>
      )}

      {educationItems.length > 0 && (
        <>
          <CodeBlock>Education</CodeBlock>
          <Divider />
          {educationItems.map((edu, idx) => (
            <BlockQuote key={`edu-${idx}`}>
              <p>
                {edu.degree} {edu.area && `in ${edu.area}`}
                <br />
                [{edu.institution}]{edu.location && ` (${edu.location.toLowerCase()})`}
                <br />
                {formatDate(edu.start_date)}-{formatDate(edu.end_date)}
              </p>
            </BlockQuote>
          ))}
        </>
      )}

      {skills.length > 0 && (
        <>
          <CodeBlock>Skills</CodeBlock>
          <Divider />
          {skills.map((skill, idx) => (
            <Paragraph key={`skill-${idx}`}>
              <strong>{skill.label}:</strong> {skill.details}
            </Paragraph>
          ))}
        </>
      )}

      {professionalDevItems.length > 0 && (
        <>
          <CodeBlock>Professional Development</CodeBlock>
          <Divider />
          {professionalDevItems.map((item, idx) => (
            <BlockQuote key={`profdev-${idx}`}>
              <p>
                {item.name}
                <br />
                {item.location && <>{item.location}<br /></>}
                {item.date && <Small>{formatDate(item.date)}</Small>}
                {item.summary && <><br /><Small>{item.summary}</Small></>}
              </p>
            </BlockQuote>
          ))}
        </>
      )}
    </Page>
  );

  const renderProjectsPage = () => (
    <Page>
      {renderBreadcrumbs('projects')}
      <Title>
        Projects{' '}
        {githubUrl && (
          <TitleLink href={githubUrl} target="_blank" rel="noopener noreferrer">
            Github
          </TitleLink>
        )}
      </Title>
      <Divider />
      <Paragraph>
        Projects showcase - click on any project to learn more.
      </Paragraph>

      {projectItems.length > 0 && (
        <ProjectTable>
          <thead>
            <tr>
              <th>name</th>
              <th>tech</th>
              <th>info</th>
            </tr>
          </thead>
          <tbody>
            {projectItems.map((project, idx) => (
              <tr key={`proj-${idx}`}>
                <td>
                  {project.url ? (
                    <ExternalLink href={project.url} target="_blank" rel="noopener noreferrer">
                      {project.name}
                    </ExternalLink>
                  ) : (
                    project.name
                  )}
                </td>
                <td>
                  {project.technologies?.slice(0, 3).map((tech, i) => (
                    <TechCode key={i}>{tech}</TechCode>
                  ))}
                </td>
                <td>{project.summary}</td>
              </tr>
            ))}
          </tbody>
        </ProjectTable>
      )}
    </Page>
  );

  const renderAchievementsPage = () => (
    <Page>
      {renderBreadcrumbs('achievements')}
      <Title>Achievements</Title>

      {awardItems.length > 0 && (
        <>
          <CodeBlock>Awards</CodeBlock>
          <Divider />
          {awardItems.map((award, idx) => (
            <BlockQuote key={`award-${idx}`}>
              <p>
                {award.name}
                <br />
                {award.summary && <>{award.summary}<br /></>}
                {award.date && <Small>{formatDate(award.date)}</Small>}
              </p>
            </BlockQuote>
          ))}
        </>
      )}

      {presentationItems.length > 0 && (
        <>
          <CodeBlock>Presentations</CodeBlock>
          <Divider />
          {presentationItems.map((pres, idx) => (
            <BlockQuote key={`pres-${idx}`}>
              <p>
                {pres.name}
                <br />
                {pres.location && <>{pres.location}<br /></>}
                {pres.summary && <>{pres.summary}<br /></>}
                {pres.date && <Small>{formatDate(pres.date)}</Small>}
              </p>
            </BlockQuote>
          ))}
        </>
      )}

      {publicationItems.length > 0 && (
        <>
          <CodeBlock>Publications</CodeBlock>
          <Divider />
          {publicationItems.map((pub, idx) => (
            <BlockQuote key={`pub-${idx}`}>
              <p>
                {pub.doi ? (
                  <ExternalLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                    {pub.title || pub.name}
                  </ExternalLink>
                ) : pub.url ? (
                  <ExternalLink href={pub.url} target="_blank" rel="noopener noreferrer">
                    {pub.title || pub.name}
                  </ExternalLink>
                ) : (
                  pub.title || pub.name
                )}
                <br />
                {pub.journal && <>{pub.journal}<br /></>}
                {pub.authors && <Small>Authors: {Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors}</Small>}
                {pub.date && <><br /><Small>{formatDate(pub.date)}</Small></>}
              </p>
            </BlockQuote>
          ))}
        </>
      )}
    </Page>
  );

  return (
    <ThemeProvider theme={theme}>
      <Wrapper $bg={theme.background}>
        <Container>
          <Pages>
            {activePage === 'home' && renderHomePage()}
            {activePage === 'resume' && renderResumePage()}
            {activePage === 'projects' && renderProjectsPage()}
            {activePage === 'achievements' && renderAchievementsPage()}
          </Pages>
        </Container>
      </Wrapper>
    </ThemeProvider>
  );
}

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
  background: ${props => props.$bg};
`;

const Container = styled.div`
  min-height: 100%;
  width: 100%;
  margin: 0;
  font-family: sans-serif;
  background: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Pages = styled.div`
  margin: 0 auto;
  max-width: 600px;
  padding-left: 1em;
  padding-right: 1em;
`;

const Page = styled.div`
  padding-top: 2em;
  padding-bottom: 10em;
`;

const Breadcrumbs = styled.div`
  font-family: monospace;
  text-transform: uppercase;
  font-size: small;
  margin-bottom: 1em;
`;

const BreadcrumbLink = styled.a`
  color: ${props => props.theme.accent};
  border-bottom: 1px dotted ${props => props.theme.accent};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: 2em;
  font-weight: bold;
  margin: 0.5em 0;
`;

const TitleLink = styled.a`
  float: right;
  font-size: 0.5em;
  margin-top: 0.9em;
  color: ${props => props.theme.accent};
  border-bottom: 1px dotted ${props => props.theme.accent};
  text-decoration: none;

  &:after {
    content: " ↗";
  }

  &:hover {
    opacity: 0.8;
  }
`;

const Paragraph = styled.p`
  line-height: 22px;
  margin: 1em 0;
`;

const NavLink = styled.a`
  display: block;
  width: fit-content;
  color: ${props => props.theme.accent};
  border-bottom: 1px dotted ${props => props.theme.accent};
  text-decoration: none;
  cursor: pointer;
  margin: 0.5em 0;

  &:hover {
    opacity: 0.8;
  }
`;

const ExternalLink = styled.a`
  width: fit-content;
  color: ${props => props.theme.accent};
  border-bottom: 1px dotted ${props => props.theme.accent};
  text-decoration: none;

  &:after {
    content: " ↗";
  }

  &:hover {
    opacity: 0.8;
  }
`;

const Divider = styled.hr`
  border-style: solid;
  border-bottom: 1px;
  margin-top: 1em;
  margin-bottom: 1em;
  border-color: ${props => props.theme.muted};
`;

const BlockQuote = styled.blockquote`
  border-left: 0.5em solid ${props => props.theme.muted};
  padding: 0 1em;
  margin: 1em 0;

  p {
    font-style: italic;
    margin: 0;
    line-height: 1.8;
  }
`;

const NestedBlockQuote = styled.div`
  border-left: 0.5em solid ${props => props.theme.muted};
  padding: 0 1em;
  margin: 1em 0;
`;

const CompanyHeader = styled.div`
  font-weight: bold;
  margin-bottom: 0.5em;
  font-style: normal;
`;

const PositionItem = styled.div`
  margin-left: 1em;
  padding-left: 0.5em;
  border-left: 2px solid ${props => props.theme.codeBackground};
  margin-bottom: 0.5em;

  p {
    font-style: italic;
    margin: 0;
    line-height: 1.6;
  }
`;

const Small = styled.small`
  opacity: 0.7;
  font-style: normal;
`;

const CodeBlock = styled.code`
  background: ${props => props.theme.codeBackground};
  border-radius: 0.25em;
  padding: 0.5em;
  font-family: monospace;
  display: inline-block;
`;

const TechCode = styled.code`
  background: ${props => props.theme.codeBackground};
  border-radius: 0.25em;
  padding: 0 0.25em;
  font-family: monospace;
  display: inline-block;
  font-size: 0.85em;
  margin-right: 0.25em;
`;

const ProjectTable = styled.table`
  margin-top: 0.25em;
  border-collapse: collapse;
  width: 100%;

  thead {
    text-align: left;
    font-weight: 700;
  }

  thead tr {
    border-bottom: 1px solid ${props => props.theme.foreground};
  }

  tr {
    border-bottom: 1px dashed ${props => props.theme.muted};
  }

  td, th {
    padding: 8px 4px;
    vertical-align: top;
  }

  td:first-child {
    white-space: nowrap;
  }
`;
