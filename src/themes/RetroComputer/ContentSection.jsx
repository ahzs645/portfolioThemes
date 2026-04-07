import styled from 'styled-components';
import { formatDateRange } from '../../utils/cvHelpers';

const C = { beige: '#f6d4b1', dark: '#525252' };

const Main = styled.main`
  color: ${C.dark};
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
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(1em, 4vw, 2em);
  padding: 16px 16px 8px;
  margin: 0 auto 0.3em;
`;

const H2 = styled.h2`
  display: inline-block;
  font-size: clamp(0.75em, 3vw, 1.2em);
  color: ${C.beige};
  background-color: ${C.dark};
  font-family: 'Press Start 2P', monospace;
  padding: 16px 16px 8px;
  margin: 0.3em auto;
`;

const H3 = styled.h3`
  font-size: 1.2em;
  color: ${C.dark};
  font-family: 'Press Start 2P', monospace;
  padding-top: 4px;
  padding-bottom: 8px;
  margin: 0.3em auto;
`;

const P = styled.p`
  padding: 16px;
  text-align: left;
  line-height: 1.6;
  width: clamp(0px, 95vw, 680px);
  margin: auto;
  box-sizing: border-box;
  font-family: 'DM Sans', sans-serif;
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
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9em;
  box-shadow: 1px 1px 0px ${C.beige}, 4px 4px 0px rgba(82, 82, 82, 0.25);
  transition: transform 0.2s;
  &:hover { transform: scale(1.05); }
`;

const Link = styled.a`
  display: inline-block;
  color: inherit;
  text-decoration-style: solid;
  text-decoration-thickness: 2px;
  transition: all 0.3s;
  font-family: 'DM Sans', sans-serif;
  &:hover {
    transform: scale(1.05);
    box-shadow: 1px 1px 0px ${C.beige}, 4px 4px 0px rgba(82, 82, 82, 0.25);
  }
`;

const Btn = styled.a`
  display: inline-flex;
  gap: 0.25rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  box-shadow: 6px 6px 0px rgba(82, 82, 82, 0.25);
  background-color: ${C.dark};
  color: ${C.beige};
  cursor: pointer;
  transition: all 0.3s;
  padding: 4px 24px;
  border: ${C.beige} solid 1px;
  text-decoration: none;
  &:hover { transform: scale(1.1); box-shadow: 8px 8px 6px rgba(82, 82, 82, 0.25); }
  &:active { transform: scale(0.95); box-shadow: 4px 4px 0px rgba(82, 82, 82, 0.4); }
`;

const Card = styled.div`
  width: clamp(0px, 95vw, 680px);
  margin: 16px auto;
  padding: 16px;
  text-align: left;
  box-sizing: border-box;
  font-family: 'DM Sans', sans-serif;
  line-height: 1.6;
`;

const CardTitle = styled.div`font-weight: 700; font-size: 1.1em;`;
const CardSub = styled.div`color: ${C.dark}; opacity: 0.8;`;
const CardDate = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55em;
  color: ${C.dark};
  opacity: 0.6;
  margin-top: 4px;
`;

const Highlights = styled.ul`
  margin-top: 8px;
  padding-left: 20px;
  font-size: 0.95em;
`;

const Footer = styled.footer`
  display: flex;
  gap: 16px;
  flex-direction: column;
  font-size: 12px;
  width: clamp(0px, 95vw, 680px);
  margin: auto;
  padding: 32px 0;
  text-align: center;
  color: ${C.dark};
  font-family: 'DM Sans', sans-serif;
`;

function flatSkills(skills) {
  if (!skills) return [];
  const out = [];
  skills.forEach((s) => {
    if (typeof s === 'string') out.push(s);
    else if (s.items) s.items.forEach((i) => out.push(i));
  });
  return out;
}

export default function ContentSection({ cv }) {
  if (!cv) return null;
  const sl = cv.socialLinks || {};
  const allSkills = flatSkills(cv.skills);

  return (
    <>
      <Main>
        {/* About */}
        <Section>
          <H1 id="retro-about">Hi there</H1>
          {cv.about && <P>{cv.about}</P>}

          {allSkills.length > 0 && (
            <>
              <Hr />
              <H2>Skills</H2>
              <Skills>
                {allSkills.map((s, i) => (
                  <Tag key={i}>{s}</Tag>
                ))}
              </Skills>
            </>
          )}
        </Section>

        {/* Experience */}
        {cv.experience?.length > 0 && (
          <Section>
            <H1>Experience</H1>
            {cv.experience.map((e, i) => (
              <Card key={i}>
                <CardTitle>{e.position || e.title}</CardTitle>
                <CardSub>{e.company || e.organization}</CardSub>
                <CardDate>{formatDateRange(e.startDate, e.endDate)}</CardDate>
                {e.summary && <div style={{ marginTop: 8, fontSize: '0.95em' }}>{e.summary}</div>}
                {e.highlights?.length > 0 && (
                  <Highlights>
                    {e.highlights.map((h, j) => <li key={j}>{h}</li>)}
                  </Highlights>
                )}
              </Card>
            ))}
          </Section>
        )}

        {/* Projects */}
        {cv.projects?.length > 0 && (
          <Section>
            <H1 id="retro-projects">Projects</H1>
            {cv.projects.map((p, i) => (
              <div key={i}>
                <Hr />
                <H2>{p.name || p.title}</H2>
                {p.technologies?.length > 0 && (
                  <Skills>
                    {p.technologies.map((t, j) => <Tag key={j}>{t}</Tag>)}
                  </Skills>
                )}
                {p.description && <P>{p.description}</P>}
                {p.url && (
                  <P style={{ textAlign: 'center' }}>
                    <Link href={p.url} target="_blank" rel="noopener">
                      <u><b>{p.url.replace(/^https?:\/\//, '')}</b></u>
                    </Link>
                  </P>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {cv.education?.length > 0 && (
          <Section>
            <H1>Education</H1>
            {cv.education.map((e, i) => (
              <Card key={i}>
                <CardTitle>{e.degree || e.studyType}</CardTitle>
                <CardSub>{e.institution}</CardSub>
                <CardDate>{formatDateRange(e.startDate, e.endDate)}</CardDate>
                {e.area && <div style={{ marginTop: 4, fontSize: '0.95em', opacity: 0.8 }}>{e.area}</div>}
              </Card>
            ))}
          </Section>
        )}

        {/* Contact */}
        <Section>
          <H1 id="retro-contact">Contact</H1>
          {cv.email && (
            <P style={{ textAlign: 'center' }}>
              <Btn href={`mailto:${cv.email}`}>{cv.email}</Btn>
            </P>
          )}
          {sl.linkedin && (
            <P style={{ textAlign: 'center' }}>
              Reach out on{' '}
              <Link href={sl.linkedin} target="_blank" rel="noopener">
                <u><b>LinkedIn</b></u>
              </Link>
            </P>
          )}
          {cv.website && (
            <P style={{ textAlign: 'center' }}>
              <Link href={cv.website} target="_blank" rel="noopener">
                <u>{cv.website.replace(/^https?:\/\//, '')}</u>
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
