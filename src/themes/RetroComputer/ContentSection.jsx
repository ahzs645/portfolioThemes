import styled from 'styled-components';
import {
  formatEntryDate,
  getProjectHighlights,
  getProjectTechnologies,
  valueOr,
} from './contentUtils';

const C = { beige: '#f6d4b1', dark: '#525252' };

const Main = styled.main`
  color: ${C.dark};
  margin-top: var(--retro-view-height, 100vh);
  text-align: center;
  position: relative;
  z-index: 2;
`;

const Section = styled.section`
  padding-bottom: 64px;
  margin-bottom: 80px;
  position: relative;

  &::after {
    content: '';
    border-bottom: dashed 2px ${C.dark};
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: clamp(0px, 95vw, 680px);
  }

  &:last-of-type::after {
    display: none;
  }
`;

const H1 = styled.h1`
  display: inline-block;
  color: ${C.beige};
  background-color: ${C.dark};
  font-family: 'public-pixel', monospace;
  font-size: clamp(1em, 4vw, 2em);
  padding: 4px 16px 8px;
  margin: 0 auto 0.3em;
`;

const H2 = styled.h2`
  display: inline-block;
  font-size: clamp(0.75em, 3vw, 1.2em);
  color: ${C.beige};
  background-color: ${C.dark};
  font-family: 'public-pixel', monospace;
  padding: 4px 16px 8px;
  margin: 0.3em auto;
`;

const H3 = styled.h3`
  font-size: 1.2em;
  color: ${C.dark};
  font-family: 'public-pixel', monospace;
  padding-top: 4px;
  padding-bottom: 8px;
  margin: 0.3em auto;
`;

const P = styled.p`
  padding: 16px;
  text-align: left;
  line-height: 1.5;
  width: clamp(0px, 95vw, 680px);
  margin: auto;
  box-sizing: border-box;
  font-family: 'chill', sans-serif;
`;

const Hr = styled.hr`
  width: 100px;
  height: 2px;
  background: none;
  margin: 40px auto;
  border: none;
  border-bottom: dashed 2px ${C.dark};
`;

const Skills = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  list-style: none;
  width: clamp(0px, 95vw, 680px);
  margin: auto;
  box-sizing: border-box;
`;

const Tag = styled.li`
  display: inline-block;
  padding: 4px 8px;
  border: dashed 1px ${C.dark};
  font-family: 'chill', sans-serif;
  font-size: 0.9em;
  box-shadow: 1px 1px 0px ${C.beige}, 4px 4px 0px rgba(82, 82, 82, 0.25);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Link = styled.a`
  display: inline-block;
  color: inherit;
  text-decoration-style: solid;
  text-decoration-thickness: 2px;
  transition: all 0.3s;
  font-family: 'chill', sans-serif;

  &:hover {
    transform: scale(1.05);
    box-shadow: 1px 1px 0px ${C.beige}, 4px 4px 0px rgba(82, 82, 82, 0.25);
  }
`;

const Btn = styled.a`
  display: inline-flex;
  gap: 0.25rem;
  font-family: 'chill', sans-serif;
  font-size: 18px;
  box-shadow: 6px 6px 0px rgba(82, 82, 82, 0.25);
  background-color: ${C.dark};
  color: ${C.beige};
  cursor: pointer;
  transition: all 0.3s;
  padding: 4px 24px;
  border: ${C.beige} solid 1px;
  text-decoration: none;

  &:hover {
    transform: scale(1.1);
    box-shadow: 8px 8px 6px rgba(82, 82, 82, 0.25);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 4px 4px 0px rgba(82, 82, 82, 0.4);
  }
`;

const Card = styled.div`
  width: clamp(0px, 95vw, 680px);
  margin: 16px auto;
  padding: 16px;
  text-align: left;
  box-sizing: border-box;
  font-family: 'chill', sans-serif;
  line-height: 1.5;
`;

const CardTitle = styled.div`
  font-weight: 700;
  font-size: 1.1em;
`;

const CardSub = styled.div`
  color: ${C.dark};
  opacity: 0.8;
`;

const CardDate = styled.div`
  font-family: 'public-pixel', monospace;
  font-size: 0.55em;
  color: ${C.dark};
  opacity: 0.6;
  margin-top: 4px;
`;

const CardText = styled.div`
  margin-top: 8px;
  font-size: 0.95em;
`;

const Highlights = styled.ul`
  margin-top: 8px;
  padding-left: 20px;
  font-size: 0.95em;
`;

const Footer = styled.footer`
  display: flex;
  gap: 32px;
  flex-direction: column;
  font-size: 12px;
  width: clamp(0px, 95vw, 680px);
  margin: auto;
  padding: 32px 0;
  text-align: center;
  color: ${C.dark};
  font-family: 'chill', sans-serif;
`;

function flatSkills(skills) {
  if (!skills) return [];

  const out = [];
  skills.forEach((skill) => {
    if (typeof skill === 'string') out.push(skill);
    else if (skill.items) skill.items.forEach((item) => out.push(item));
  });

  return out;
}

function formatLanguage(language) {
  if (typeof language === 'string') return language;

  const label = valueOr(language?.language, language?.name, language?.label);
  const detail = valueOr(language?.fluency, language?.level, language?.details);

  if (label && detail) return `${label} (${detail})`;
  return label;
}

function displayUrl(url) {
  return String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function renderHighlights(highlights) {
  if (!highlights?.length) return null;

  return (
    <Highlights>
      {highlights.map((highlight, index) => (
        <li key={index}>{highlight}</li>
      ))}
    </Highlights>
  );
}

export default function ContentSection({ cv }) {
  if (!cv) return null;

  const socialLinks = cv.socialLinks || {};
  const allSkills = flatSkills(cv.skills);
  const languages = (cv.languages || []).map(formatLanguage).filter(Boolean);

  return (
    <>
      <Main>
        <Section id="retro-about">
          <H1>Hi there</H1>
          {cv.currentJobTitle && <H2>{cv.currentJobTitle}</H2>}
          {cv.location && <H3>{cv.location}</H3>}
          {cv.about && <P>{cv.about}</P>}

          {allSkills.length > 0 && (
            <>
              <Hr />
              <H2>Skills</H2>
              <Skills>
                {allSkills.map((skill, index) => (
                  <Tag key={index}>{skill}</Tag>
                ))}
              </Skills>
            </>
          )}
        </Section>

        {cv.experience?.length > 0 && (
          <Section id="retro-experience">
            <H1>Experience</H1>
            {cv.experience.map((entry, index) => (
              <Card key={`${entry.company || entry.title}-${index}`}>
                <CardTitle>{entry.position || entry.title}</CardTitle>
                <CardSub>{entry.company || entry.organization}</CardSub>
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.summary && <CardText>{entry.summary}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {cv.projects?.length > 0 && (
          <Section id="retro-projects">
            <H1>Projects</H1>
            {cv.projects.map((project, index) => {
              const technologies = getProjectTechnologies(project);
              const highlights = getProjectHighlights(project);

              return (
                <Card key={`${project.name || project.title}-${index}`}>
                  <CardTitle>{project.name || project.title}</CardTitle>
                  <CardDate>{formatEntryDate(project)}</CardDate>
                  {technologies.length > 0 && (
                    <Skills>
                      {technologies.map((technology) => (
                        <Tag key={technology}>{technology}</Tag>
                      ))}
                    </Skills>
                  )}
                  {valueOr(project.summary, project.description) && (
                    <CardText>{valueOr(project.summary, project.description)}</CardText>
                  )}
                  {project.url && (
                    <CardText>
                      <Link href={project.url} target="_blank" rel="noopener noreferrer">
                        <u>
                          <b>{displayUrl(project.url)}</b>
                        </u>
                      </Link>
                    </CardText>
                  )}
                  {renderHighlights(highlights)}
                </Card>
              );
            })}
          </Section>
        )}

        {cv.education?.length > 0 && (
          <Section id="retro-education">
            <H1>Education</H1>
            {cv.education.map((entry, index) => (
              <Card key={`${entry.institution}-${index}`}>
                <CardTitle>{entry.degree || entry.studyType}</CardTitle>
                <CardSub>{entry.institution}</CardSub>
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.area && <CardText>{entry.area}</CardText>}
                {entry.location && <CardText>{entry.location}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {cv.volunteer?.length > 0 && (
          <Section id="retro-volunteer">
            <H1>Volunteer</H1>
            {cv.volunteer.map((entry, index) => (
              <Card key={`${entry.company || entry.title}-${index}`}>
                <CardTitle>{entry.position || entry.title}</CardTitle>
                <CardSub>{entry.company || entry.organization}</CardSub>
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.summary && <CardText>{entry.summary}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {cv.awards?.length > 0 && (
          <Section id="retro-awards">
            <H1>Awards</H1>
            {cv.awards.map((entry, index) => (
              <Card key={`${entry.name || entry.title}-${index}`}>
                <CardTitle>{entry.name || entry.title}</CardTitle>
                {entry.summary && <CardSub>{entry.summary}</CardSub>}
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.description && <CardText>{entry.description}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {cv.publications?.length > 0 && (
          <Section id="retro-publications">
            <H1>Publications</H1>
            {cv.publications.map((entry, index) => (
              <Card key={`${entry.title || entry.name}-${index}`}>
                <CardTitle>{entry.title || entry.name}</CardTitle>
                {entry.journal && <CardSub>{entry.journal}</CardSub>}
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.authors?.length > 0 && <CardText>{entry.authors.join(', ')}</CardText>}
                {entry.doi && (
                  <CardText>
                    <Link
                      href={`https://doi.org/${entry.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <u>{entry.doi}</u>
                    </Link>
                  </CardText>
                )}
                {entry.summary && <CardText>{entry.summary}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {cv.presentations?.length > 0 && (
          <Section id="retro-presentations">
            <H1>Presentations</H1>
            {cv.presentations.map((entry, index) => (
              <Card key={`${entry.name || entry.title}-${index}`}>
                <CardTitle>{entry.name || entry.title}</CardTitle>
                {entry.summary && <CardSub>{entry.summary}</CardSub>}
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.location && <CardText>{entry.location}</CardText>}
                {entry.description && <CardText>{entry.description}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {cv.professionalDevelopment?.length > 0 && (
          <Section id="retro-professional-development">
            <H1>Professional Development</H1>
            {cv.professionalDevelopment.map((entry, index) => (
              <Card key={`${entry.name || entry.title}-${index}`}>
                <CardTitle>{entry.name || entry.title}</CardTitle>
                {entry.summary && <CardSub>{entry.summary}</CardSub>}
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.location && <CardText>{entry.location}</CardText>}
                {entry.description && <CardText>{entry.description}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}
          </Section>
        )}

        {(cv.certificationsSkills?.length > 0 || cv.certifications?.length > 0 || languages.length > 0) && (
          <Section id="retro-credentials">
            <H1>Credentials</H1>

            {cv.certificationsSkills?.map((entry, index) => (
              <Card key={`${entry.label}-${index}`}>
                <CardTitle>{entry.label}</CardTitle>
                {entry.details && <CardText>{entry.details}</CardText>}
              </Card>
            ))}

            {cv.certifications?.map((entry, index) => (
              <Card key={`${entry.name || entry.title}-${index}`}>
                <CardTitle>{entry.name || entry.title}</CardTitle>
                {entry.issuer && <CardSub>{entry.issuer}</CardSub>}
                <CardDate>{formatEntryDate(entry)}</CardDate>
                {entry.summary && <CardText>{entry.summary}</CardText>}
                {entry.description && <CardText>{entry.description}</CardText>}
                {renderHighlights(entry.highlights)}
              </Card>
            ))}

            {languages.length > 0 && (
              <>
                <Hr />
                <H2>Languages</H2>
                <Skills>
                  {languages.map((language) => (
                    <Tag key={language}>{language}</Tag>
                  ))}
                </Skills>
              </>
            )}
          </Section>
        )}

        <Section id="retro-contact">
          <H1>Contact</H1>
          {cv.email && (
            <P style={{ textAlign: 'center' }}>
              <Btn href={`mailto:${cv.email}`}>{cv.email}</Btn>
            </P>
          )}
          {socialLinks.linkedin && (
            <P style={{ textAlign: 'center' }}>
              Reach out on{' '}
              <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <u>
                  <b>LinkedIn</b>
                </u>
              </Link>
            </P>
          )}
          {socialLinks.github && (
            <P style={{ textAlign: 'center' }}>
              Explore{' '}
              <Link href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                <u>
                  <b>GitHub</b>
                </u>
              </Link>
            </P>
          )}
          {cv.website && (
            <P style={{ textAlign: 'center' }}>
              <Link href={cv.website} target="_blank" rel="noopener noreferrer">
                <u>{displayUrl(cv.website)}</u>
              </Link>
            </P>
          )}
        </Section>
      </Main>

      <Footer>
        <div>Computer design inspired by the Commodore PET 8296.</div>
        <div>Powered by CV.yaml</div>
      </Footer>
    </>
  );
}
