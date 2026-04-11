import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import { withBase } from '../../utils/assetPath';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'present';
  const match = String(dateStr).match(/\d{4}/);
  return match ? match[0] : String(dateStr);
}

function formatRange(start, end) {
  const s = formatYear(start);
  const e = formatYear(end);
  if (s && e && s !== e) return `${s}–${e}`;
  return s || e || '';
}

function pickSocial(socials, names) {
  const lowered = names.map((n) => n.toLowerCase());
  return socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()))?.url || null;
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!item) continue;
    const key = String(item).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function joinList(rawItems, sep = ', ', lastSep = ' and ') {
  const items = dedupe(rawItems);
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(lastSep);
  return items.slice(0, -1).join(sep) + ',' + lastSep + items[items.length - 1];
}

const lightTheme = {
  bg: '#ffffff',
  fg: '#2c2c2c',
  fgStrong: '#0b0b0b',
  muted: '#6b7280',
  mutedSoft: '#9ca3af',
  rule: 'rgba(11, 11, 11, 0.1)',
  ruleSoft: 'rgba(11, 11, 11, 0.06)',
  hover: 'rgba(11, 11, 11, 0.04)',
  pillBorder: 'rgba(11, 11, 11, 0.15)',
  pillBg: 'transparent',
  pillHoverBg: '#0b0b0b',
  pillHoverFg: '#ffffff',
  linkUnderline: 'rgba(11, 11, 11, 0.45)',
};

const darkTheme = {
  bg: '#0f1216',
  fg: '#e5e7eb',
  fgStrong: '#ffffff',
  muted: '#9ca3af',
  mutedSoft: '#6b7280',
  rule: 'rgba(255, 255, 255, 0.1)',
  ruleSoft: 'rgba(255, 255, 255, 0.06)',
  hover: 'rgba(255, 255, 255, 0.05)',
  pillBorder: 'rgba(255, 255, 255, 0.2)',
  pillBg: 'transparent',
  pillHoverBg: '#ffffff',
  pillHoverFg: '#0b0b0b',
  linkUnderline: 'rgba(255, 255, 255, 0.45)',
};

function Pill({ children, href }) {
  const content = (
    <>
      <PillDot aria-hidden />
      <span>{children}</span>
    </>
  );
  if (href) {
    return (
      <EmploymentPill as="a" href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </EmploymentPill>
    );
  }
  return <EmploymentPill>{content}</EmploymentPill>;
}

export function MattRothenbergTheme({ darkMode }) {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isDark, setIsDark] = useState(darkMode ?? false);

  useEffect(() => {
    if (typeof darkMode === 'boolean') setIsDark(darkMode);
  }, [darkMode]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const location = cv?.location || null;
  const website = cv?.website || null;
  const socials = Array.isArray(cv?.social) ? cv.social : [];
  const aboutText = getAboutContent()?.markdown || '';

  const githubUrl = pickSocial(socials, ['github']);
  const linkedinUrl = pickSocial(socials, ['linkedin']);
  const xUrl = pickSocial(socials, ['twitter', 'x']);
  const instagramUrl = pickSocial(socials, ['instagram']);

  const currentExperiences = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter((e) => !isArchived(e));
    const currents = [];
    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        if (exp.positions.some((p) => isPresent(p.end_date) || !p.end_date)) {
          currents.push({ company: exp.company, url: exp.url });
        }
      } else if (isPresent(exp.end_date) || !exp.end_date) {
        currents.push({ company: exp.company, url: exp.url });
      }
    }
    return currents.slice(0, 4);
  }, [cv]);

  const pastExperiences = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter((e) => !isArchived(e));
    const past = [];
    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        if (exp.positions.every((p) => !isPresent(p.end_date) && p.end_date)) {
          past.push({ company: exp.company, url: exp.url });
        }
      } else if (!isPresent(exp.end_date) && exp.end_date) {
        past.push({ company: exp.company, url: exp.url });
      }
    }
    return past.slice(0, 6);
  }, [cv]);

  const projectItems = useMemo(
    () => (cv?.sections?.projects || []).filter((e) => !isArchived(e)).slice(0, 10),
    [cv],
  );

  const educationItems = useMemo(
    () => (cv?.sections?.education || []).filter((e) => !isArchived(e)).slice(0, 4),
    [cv],
  );

  const uniqueInstitutions = useMemo(
    () => dedupe(educationItems.map((e) => e.institution).filter(Boolean)),
    [educationItems],
  );

  const uniqueAreas = useMemo(() => {
    const raw = educationItems
      .map((e) => e.area || e.degree)
      .filter(Boolean)
      .map((a) => String(a).toLowerCase());
    return dedupe(raw).slice(0, 3);
  }, [educationItems]);

  const publicationItems = useMemo(
    () => (cv?.sections?.publications || []).filter((e) => !isArchived(e)).slice(0, 10),
    [cv],
  );

  const volunteerItems = useMemo(
    () => (cv?.sections?.volunteer || []).filter((e) => !isArchived(e)).slice(0, 4),
    [cv],
  );

  const theme = isDark ? darkTheme : lightTheme;

  const firstName = (fullName.split(' ')[0] || fullName).toLowerCase();

  const pageRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    const loop = loopRef.current;
    if (!page || !loop) return undefined;

    let cycleHeight = 0;
    let ticking = false;

    const measure = () => {
      const next = loop.offsetHeight;
      if (!next) return;
      cycleHeight = next;
      if (page.scrollTop < 1) page.scrollTop = cycleHeight;
    };

    const onScroll = () => {
      if (ticking || !cycleHeight) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (page.scrollTop >= cycleHeight * 2) {
          page.scrollTop -= cycleHeight;
        } else if (page.scrollTop < cycleHeight) {
          page.scrollTop += cycleHeight;
        }
        ticking = false;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(loop);
    page.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      page.removeEventListener('scroll', onScroll);
    };
  }, []);

  const renderContent = (keyPrefix) => (
    <Container>
          <Nav>
            <NavBrand>{fullName.toLowerCase()}</NavBrand>
            <NavSep>/</NavSep>
            <NavLink $active>home</NavLink>
            {projectItems.length > 0 && (
              <>
                <NavSep>/</NavSep>
                <NavLink as="a" href="#projects">projects</NavLink>
              </>
            )}
            {publicationItems.length > 0 && (
              <>
                <NavSep>/</NavSep>
                <NavLink as="a" href="#writing">writing</NavLink>
              </>
            )}
          </Nav>

          <Section>
            <Prose>
              Hi, I'm <Em>{fullName}</Em>
              {location ? <>, based in <Em>{location}</Em></> : null}
              {currentExperiences.length > 0 ? (
                <>
                  . I currently work at{' '}
                  {currentExperiences.map((e, i) => (
                    <React.Fragment key={`cur-${i}`}>
                      <Pill href={e.url}>{e.company}</Pill>
                      {i < currentExperiences.length - 1 ? ' and ' : ''}
                    </React.Fragment>
                  ))}
                </>
              ) : null}
              .
            </Prose>
            {aboutText && <Prose>{aboutText}</Prose>}
          </Section>

          {(currentExperiences.length > 0 || pastExperiences.length > 0) && (
            <Section>
              <Eyebrow>I'm employable</Eyebrow>
              <Prose>
                I've had the privilege of working with{' '}
                {[...currentExperiences, ...pastExperiences].map((e, i, arr) => (
                  <React.Fragment key={`emp-${i}`}>
                    <Pill href={e.url}>{e.company}</Pill>
                    {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ', and ' : ''}
                  </React.Fragment>
                ))}
                . Each chapter sharpened a different edge, from labs and
                lecture halls to the hospital floor and the newsroom.
              </Prose>
            </Section>
          )}

          {educationItems.length > 0 && (
            <Section>
              <Eyebrow>I study</Eyebrow>
              <Prose>
                I'm a perpetual student.
                {uniqueInstitutions.length === 1 ? (
                  <>
                    {' '}All of it at the same place: <Em>{uniqueInstitutions[0]}</Em>
                  </>
                ) : uniqueInstitutions.length > 1 ? (
                  <>
                    {' '}Most recently at{' '}
                    {uniqueInstitutions.map((inst, i, arr) => (
                      <React.Fragment key={`edu-${i}`}>
                        <Em>{inst}</Em>
                        {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' and ' : ''}
                      </React.Fragment>
                    ))}
                  </>
                ) : null}
                {uniqueAreas.length > 0 && (
                  <>
                    {uniqueAreas.length === 1
                      ? ', where I focus on '
                      : ", where I've worked on "}
                    {joinList(uniqueAreas)}
                  </>
                )}
                .
              </Prose>
            </Section>
          )}

          {projectItems.length > 0 && (
            <Section id="projects">
              <Eyebrow>I code for fun</Eyebrow>
              <Prose>
                A rotating slate of side projects: experiments, research
                tools, and the occasional desktop app.
              </Prose>
              <List>
                {projectItems.map((project, idx) => {
                  const title = project.name;
                  const year = formatYear(project.date);
                  const href = project.url;
                  const Row = href ? (
                    <ListRow as="a" href={href} target="_blank" rel="noopener noreferrer">
                      <RowTitle>{title}</RowTitle>
                      {year && <RowMeta>{year}</RowMeta>}
                    </ListRow>
                  ) : (
                    <ListRow as="div">
                      <RowTitle>{title}</RowTitle>
                      {year && <RowMeta>{year}</RowMeta>}
                    </ListRow>
                  );
                  return <li key={`proj-${idx}`}>{Row}</li>;
                })}
              </List>
            </Section>
          )}

          {volunteerItems.length > 0 && (
            <Section>
              <Eyebrow>I show up</Eyebrow>
              <Prose>
                When I'm not in the lab or shipping code, I volunteer with{' '}
                {volunteerItems.map((v, i, arr) => (
                  <React.Fragment key={`vol-${i}`}>
                    <Pill>{v.company || v.organization}</Pill>
                    {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' and ' : ''}
                  </React.Fragment>
                ))}
                .
              </Prose>
            </Section>
          )}

          {publicationItems.length > 0 && (
            <Section id="writing">
              <Eyebrow>I write words</Eyebrow>
              <Prose>
                Occasionally I co-author something worth reading.
              </Prose>
              <List>
                {publicationItems.map((pub, idx) => {
                  const title = pub.name || pub.title;
                  const year = formatYear(pub.date || pub.releaseDate);
                  const href = pub.doi ? `https://doi.org/${pub.doi}` : pub.url;
                  const Row = href ? (
                    <ListRow as="a" href={href} target="_blank" rel="noopener noreferrer">
                      <RowTitle>{title}</RowTitle>
                      {year && <RowMeta>{year}</RowMeta>}
                    </ListRow>
                  ) : (
                    <ListRow as="div">
                      <RowTitle>{title}</RowTitle>
                      {year && <RowMeta>{year}</RowMeta>}
                    </ListRow>
                  );
                  return <li key={`pub-${idx}`}>{Row}</li>;
                })}
              </List>
            </Section>
          )}

          <Section>
            <Eyebrow>I am on the internet</Eyebrow>
            <Prose>
              The best way to reach me is over{' '}
              {email ? (
                <EditorialLink href={`mailto:${email}`}>email</EditorialLink>
              ) : (
                'email'
              )}
              {githubUrl || linkedinUrl || xUrl ? ', but I also keep ' : ''}
              {githubUrl && (
                <>
                  <EditorialLink href={githubUrl} target="_blank" rel="noopener noreferrer">
                    a GitHub
                  </EditorialLink>
                </>
              )}
              {githubUrl && (linkedinUrl || xUrl) ? ', ' : ''}
              {linkedinUrl && (
                <EditorialLink href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  a LinkedIn
                </EditorialLink>
              )}
              {linkedinUrl && xUrl ? ', and ' : ''}
              {xUrl && (
                <EditorialLink href={xUrl} target="_blank" rel="noopener noreferrer">
                  an X account
                </EditorialLink>
              )}
              {instagramUrl && !xUrl && !linkedinUrl && !githubUrl ? (
                <EditorialLink href={instagramUrl} target="_blank" rel="noopener noreferrer">
                  an Instagram
                </EditorialLink>
              ) : null}
              {website ? (
                <>
                  {'. '}
                  You're already reading my{' '}
                  <EditorialLink href={website} target="_blank" rel="noopener noreferrer">
                    website
                  </EditorialLink>
                </>
              ) : null}
              . Let's talk, <Em>{firstName}</Em>.
            </Prose>
          </Section>

          <Footer aria-hidden={keyPrefix !== 'a'}>
            <EndMark viewBox="0 0 521 434" xmlns="http://www.w3.org/2000/svg">
              <path d="M483.022 58.3877H477.818V1H467.41V63.5918H472.614V68.7959H477.818V74H509.114V68.7959H514.318V63.5918H519.522V1H509.114V58.3877H503.91V63.5918H483.022V58.3877ZM520.522 64.5918H515.318V69.7959H510.114V75H476.818V69.7959H471.614V64.5918H466.41V0H478.818V57.3877H484.022V62.5918H502.91V57.3877H508.114V0H520.522V64.5918Z" />
              <path d="M410.022 1V6.24023H404.818V11.4443H399.614V16.6484H394.41V58.3877H399.614V63.5918H404.818V68.7959H410.022V74H441.318V68.7959H446.522V63.5918H451.763V58.3877H456.967V16.6484H451.763V11.4443H446.522V6.24023H441.318V1H410.022ZM440.318 52.1484H445.522V22.8877H440.318V17.6484H435.114V12.4443H416.263V17.6484H411.022V22.8877H405.818V52.1484H411.022V57.3877H416.263V62.5918H435.114V57.3877H440.318V52.1484ZM441.318 58.3877H436.114V63.5918H415.263V58.3877H410.022V53.1484H404.818V21.8877H410.022V16.6484H415.263V11.4443H436.114V16.6484H441.318V21.8877H446.522V53.1484H441.318V58.3877ZM442.318 5.24023H447.522V10.4443H452.763V15.6484H457.967V59.3877H452.763V64.5918H447.522V69.7959H442.318V75H409.022V69.7959H403.818V64.5918H398.614V59.3877H393.41V15.6484H398.614V10.4443H403.818V5.24023H409.022V0H442.318V5.24023Z" />
              <path d="M357.91 21.8877H352.671V11.4443H347.467V1H337.059V11.4443H342.263V21.8877H347.467V32.2959H352.671V42.7402H357.91V74H368.318V42.7402H373.559V32.2959H378.763V21.8877H383.967V11.4443H389.171V1H378.763V11.4443H373.559V21.8877H368.318V32.2959H357.91V21.8877ZM390.171 12.4443H384.967V22.8877H379.763V33.2959H374.559V43.7402H369.318V75H356.91V43.7402H351.671V33.2959H346.467V22.8877H341.263V12.4443H336.059V0H348.467V10.4443H353.671V20.8877H358.91V31.2959H367.318V20.8877H372.559V10.4443H377.763V0H390.171V12.4443Z" />
              <path d="M269.369 1H258.961V74H269.369V47.9443H274.573V53.1484H279.813V58.3877H285.018V63.5918H290.222V68.7959H295.461V74H308.472V68.7959H303.268V63.5918H298.063V58.3877H292.823V53.1484H287.619V47.9443H282.415V42.7402H277.211V32.2959H282.415V27.0918H287.619V21.8877H292.823V16.6484H298.063V11.4443H303.268V6.24023H308.472V1H295.461V6.24023H290.222V11.4443H285.018V16.6484H279.813V21.8877H274.573V27.0918H269.369V1ZM309.472 7.24023H304.268V12.4443H299.063V17.6484H293.823V22.8877H288.619V28.0918H283.415V33.2959H278.211V41.7402H283.415V46.9443H288.619V52.1484H293.823V57.3877H299.063V62.5918H304.268V67.7959H309.472V75H294.461V69.7959H289.222V64.5918H284.018V59.3877H278.813V54.1484H273.573V48.9443H270.369V75H257.961V0H270.369V26.0918H273.573V20.8877H278.813V15.6484H284.018V10.4443H289.222V5.24023H294.461V0H309.472V7.24023Z" />
              <path d="M238.071 1V53.1484H232.867V42.7402H227.628V32.2959H222.424V21.8877H217.22V11.4443H211.979V1H196.367V74H206.775V21.8877H211.979V32.2959H217.22V42.7402H222.424V53.1484H227.628V63.5918H232.867V74H248.479V1H238.071ZM249.479 75H231.867V64.5918H226.628V54.1484H221.424V43.7402H216.22V33.2959H210.979V22.8877H207.775V75H195.367V0H212.979V10.4443H218.22V20.8877H223.424V31.2959H228.628V41.7402H233.867V52.1484H237.071V0H249.479V75Z" />
              <path d="M149.497 1V11.4443H144.257V27.0918H139.053V42.7402H133.849V58.3877H128.645V74H139.053V58.3877H175.553V74H185.997V58.3877H180.757V42.7402H175.553V27.0918H170.349V11.4443H165.145V1H149.497ZM159.905 16.6484V27.0918H165.145V42.7402H170.349V47.9443H144.257V42.7402H149.497V27.0918H154.701V16.6484H159.905ZM155.701 28.0918H150.497V43.7402H145.257V46.9443H169.349V43.7402H164.145V28.0918H158.905V17.6484H155.701V28.0918ZM166.145 10.4443H171.349V26.0918H176.553V41.7402H181.757V57.3877H186.997V75H174.553V59.3877H140.053V75H127.645V57.3877H132.849V41.7402H138.053V26.0918H143.257V10.4443H148.497V0H166.145V10.4443Z" />
              <path d="M71.3262 1H60.918V74H71.3262V40.1377H107.826V74H118.271V1H107.826V29.6943H71.3262V1ZM119.271 75H106.826V41.1377H72.3262V75H59.918V0H72.3262V28.6943H106.826V0H119.271V75Z" />
              <path d="M1 1V11.4443H21.8516V74H32.2598V11.4443H53.1123V1H1ZM54.1123 12.4443H33.2598V75H20.8516V12.4443H0V0H54.1123V12.4443Z" />
              <path d="M483.022 137.388H477.818V80H467.41V142.592H472.614V147.796H477.818V153H509.114V147.796H514.318V142.592H519.522V80H509.114V137.388H503.91V142.592H483.022V137.388ZM520.522 143.592H515.318V148.796H510.114V154H476.818V148.796H471.614V143.592H466.41V79H478.818V136.388H484.022V141.592H502.91V136.388H508.114V79H520.522V143.592Z" />
              <path d="M410.022 80V85.2402H404.818V90.4443H399.614V95.6484H394.41V137.388H399.614V142.592H404.818V147.796H410.022V153H441.318V147.796H446.522V142.592H451.763V137.388H456.967V95.6484H451.763V90.4443H446.522V85.2402H441.318V80H410.022ZM440.318 131.148H445.522V101.888H440.318V96.6484H435.114V91.4443H416.263V96.6484H411.022V101.888H405.818V131.148H411.022V136.388H416.263V141.592H435.114V136.388H440.318V131.148ZM441.318 137.388H436.114V142.592H415.263V137.388H410.022V132.148H404.818V100.888H410.022V95.6484H415.263V90.4443H436.114V95.6484H441.318V100.888H446.522V132.148H441.318V137.388ZM442.318 84.2402H447.522V89.4443H452.763V94.6484H457.967V138.388H452.763V143.592H447.522V148.796H442.318V154H409.022V148.796H403.818V143.592H398.614V138.388H393.41V94.6484H398.614V89.4443H403.818V84.2402H409.022V79H442.318V84.2402Z" />
              <path d="M357.91 100.888H352.671V90.4443H347.467V80H337.059V90.4443H342.263V100.888H347.467V111.296H352.671V121.74H357.91V153H368.318V121.74H373.559V111.296H378.763V100.888H383.967V90.4443H389.171V80H378.763V90.4443H373.559V100.888H368.318V111.296H357.91V100.888ZM390.171 91.4443H384.967V101.888H379.763V112.296H374.559V122.74H369.318V154H356.91V122.74H351.671V112.296H346.467V101.888H341.263V91.4443H336.059V79H348.467V89.4443H353.671V99.8877H358.91V110.296H367.318V99.8877H372.559V89.4443H377.763V79H390.171V91.4443Z" />
              <path d="M269.369 80H258.961V153H269.369V126.944H274.573V132.148H279.813V137.388H285.018V142.592H290.222V147.796H295.461V153H308.472V147.796H303.268V142.592H298.063V137.388H292.823V132.148H287.619V126.944H282.415V121.74H277.211V111.296H282.415V106.092H287.619V100.888H292.823V95.6484H298.063V90.4443H303.268V85.2402H308.472V80H295.461V85.2402H290.222V90.4443H285.018V95.6484H279.813V100.888H274.573V106.092H269.369V80ZM309.472 86.2402H304.268V91.4443H299.063V96.6484H293.823V101.888H288.619V107.092H283.415V112.296H278.211V120.74H283.415V125.944H288.619V131.148H293.823V136.388H299.063V141.592H304.268V146.796H309.472V154H294.461V148.796H289.222V143.592H284.018V138.388H278.813V133.148H273.573V127.944H270.369V154H257.961V79H270.369V105.092H273.573V99.8877H278.813V94.6484H284.018V89.4443H289.222V84.2402H294.461V79H309.472V86.2402Z" />
              <path d="M238.071 80V132.148H232.867V121.74H227.628V111.296H222.424V100.888H217.22V90.4443H211.979V80H196.367V153H206.775V100.888H211.979V111.296H217.22V121.74H222.424V132.148H227.628V142.592H232.867V153H248.479V80H238.071ZM249.479 154H231.867V143.592H226.628V133.148H221.424V122.74H216.22V112.296H210.979V101.888H207.775V154H195.367V79H212.979V89.4443H218.22V99.8877H223.424V110.296H228.628V120.74H233.867V131.148H237.071V79H249.479V154Z" />
              <path d="M149.497 80V90.4443H144.257V106.092H139.053V121.74H133.849V137.388H128.645V153H139.053V137.388H175.553V153H185.997V137.388H180.757V121.74H175.553V106.092H170.349V90.4443H165.145V80H149.497ZM159.905 95.6484V106.092H165.145V121.74H170.349V126.944H144.257V121.74H149.497V106.092H154.701V95.6484H159.905ZM155.701 107.092H150.497V122.74H145.257V125.944H169.349V122.74H164.145V107.092H158.905V96.6484H155.701V107.092ZM166.145 89.4443H171.349V105.092H176.553V120.74H181.757V136.388H186.997V154H174.553V138.388H140.053V154H127.645V136.388H132.849V120.74H138.053V105.092H143.257V89.4443H148.497V79H166.145V89.4443Z" />
              <path d="M71.3262 80H60.918V153H71.3262V119.138H107.826V153H118.271V80H107.826V108.694H71.3262V80ZM119.271 154H106.826V120.138H72.3262V154H59.918V79H72.3262V107.694H106.826V79H119.271V154Z" />
              <path d="M1 80V90.4443H21.8516V153H32.2598V90.4443H53.1123V80H1ZM54.1123 91.4443H33.2598V154H20.8516V91.4443H0V79H54.1123V91.4443Z" />
              <path d="M509.114 232H477.818V226.796H472.614V221.592H467.41V159H477.818V216.388H483.022V221.592H503.91V216.388H509.114V159H519.522V221.592H514.318V226.796H509.114V232Z" />
              <path d="M441.318 232H410.022V226.796H404.818V221.592H399.614V216.388H394.41V174.648H399.614V169.444H404.818V164.24H410.022V159H441.318V164.24H446.522V169.444H451.762V174.648H456.966V216.388H451.762V221.592H446.522V226.796H441.318V232ZM415.262 221.592H436.114V216.388H441.318V211.148H446.522V179.888H441.318V174.648H436.114V169.444H415.262V174.648H410.022V179.888H404.818V211.148H410.022V216.388H415.262V221.592Z" />
              <path d="M368.317 232H357.909V200.74H352.669V190.296H347.465V179.888H342.261V169.444H337.057V159H347.465V169.444H352.669V179.888H357.909V190.296H368.317V179.888H373.557V169.444H378.761V159H389.169V169.444H383.965V179.888H378.761V190.296H373.557V200.74H368.317V232Z" />
              <path d="M269.369 232H258.961V159H269.369V185.092H274.573V179.888H279.813V174.648H285.017V169.444H290.221V164.24H295.461V159H308.471V164.24H303.267V169.444H298.063V174.648H292.823V179.888H287.619V185.092H282.415V190.296H277.211V200.74H282.415V205.944H287.619V211.148H292.823V216.388H298.063V221.592H303.267V226.796H308.471V232H295.461V226.796H290.221V221.592H285.017V216.388H279.813V211.148H274.573V205.944H269.369V232Z" />
              <path d="M206.775 232H196.367V159H211.979V169.444H217.219V179.888H222.423V190.296H227.627V200.74H232.867V211.148H238.071V159H248.479V232H232.867V221.592H227.627V211.148H222.423V200.74H217.219V190.296H211.979V179.888H206.775V232Z" />
              <path d="M139.053 232H128.645V216.388H133.849V200.74H139.053V185.092H144.257V169.444H149.497V159H165.145V169.444H170.349V185.092H175.553V200.74H180.757V216.388H185.997V232H175.553V216.388H139.053V232ZM144.257 205.944H170.349V200.74H165.145V185.092H159.905V174.648H154.701V185.092H149.497V200.74H144.257V205.944Z" />
              <path d="M71.3262 232H60.918V159H71.3262V187.694H107.826V159H118.27V232H107.826V198.138H71.3262V232Z" />
              <path d="M32.2603 232H21.8521V169.444H1V159H53.1123V169.444H32.2603V232Z" />
              <path d="M483.022 295.388H477.818V238H467.41V300.592H472.614V305.796H477.818V311H509.114V305.796H514.318V300.592H519.522V238H509.114V295.388H503.91V300.592H483.022V295.388ZM520.522 301.592H515.318V306.796H510.114V312H476.818V306.796H471.614V301.592H466.41V237H478.818V294.388H484.022V299.592H502.91V294.388H508.114V237H520.522V301.592Z" />
              <path d="M410.022 238V243.24H404.818V248.444H399.614V253.648H394.41V295.388H399.614V300.592H404.818V305.796H410.022V311H441.318V305.796H446.522V300.592H451.763V295.388H456.967V253.648H451.763V248.444H446.522V243.24H441.318V238H410.022ZM440.318 289.148H445.522V259.888H440.318V254.648H435.114V249.444H416.263V254.648H411.022V259.888H405.818V289.148H411.022V294.388H416.263V299.592H435.114V294.388H440.318V289.148ZM441.318 295.388H436.114V300.592H415.263V295.388H410.022V290.148H404.818V258.888H410.022V253.648H415.263V248.444H436.114V253.648H441.318V258.888H446.522V290.148H441.318V295.388ZM442.318 242.24H447.522V247.444H452.763V252.648H457.967V296.388H452.763V301.592H447.522V306.796H442.318V312H409.022V306.796H403.818V301.592H398.614V296.388H393.41V252.648H398.614V247.444H403.818V242.24H409.022V237H442.318V242.24Z" />
              <path d="M357.91 258.888H352.671V248.444H347.467V238H337.059V248.444H342.263V258.888H347.467V269.296H352.671V279.74H357.91V311H368.318V279.74H373.559V269.296H378.763V258.888H383.967V248.444H389.171V238H378.763V248.444H373.559V258.888H368.318V269.296H357.91V258.888ZM390.171 249.444H384.967V259.888H379.763V270.296H374.559V280.74H369.318V312H356.91V280.74H351.671V270.296H346.467V259.888H341.263V249.444H336.059V237H348.467V247.444H353.671V257.888H358.91V268.296H367.318V257.888H372.559V247.444H377.763V237H390.171V249.444Z" />
              <path d="M269.369 238H258.961V311H269.369V284.944H274.573V290.148H279.813V295.388H285.018V300.592H290.222V305.796H295.461V311H308.472V305.796H303.268V300.592H298.063V295.388H292.823V290.148H287.619V284.944H282.415V279.74H277.211V269.296H282.415V264.092H287.619V258.888H292.823V253.648H298.063V248.444H303.268V243.24H308.472V238H295.461V243.24H290.222V248.444H285.018V253.648H279.813V258.888H274.573V264.092H269.369V238ZM309.472 244.24H304.268V249.444H299.063V254.648H293.823V259.888H288.619V265.092H283.415V270.296H278.211V278.74H283.415V283.944H288.619V289.148H293.823V294.388H299.063V299.592H304.268V304.796H309.472V312H294.461V306.796H289.222V301.592H284.018V296.388H278.813V291.148H273.573V285.944H270.369V312H257.961V237H270.369V263.092H273.573V257.888H278.813V252.648H284.018V247.444H289.222V242.24H294.461V237H309.472V244.24Z" />
              <path d="M238.071 238V290.148H232.867V279.74H227.628V269.296H222.424V258.888H217.22V248.444H211.979V238H196.367V311H206.775V258.888H211.979V269.296H217.22V279.74H222.424V290.148H227.628V300.592H232.867V311H248.479V238H238.071ZM249.479 312H231.867V301.592H226.628V291.148H221.424V280.74H216.22V270.296H210.979V259.888H207.775V312H195.367V237H212.979V247.444H218.22V257.888H223.424V268.296H228.628V278.74H233.867V289.148H237.071V237H249.479V312Z" />
              <path d="M149.497 238V248.444H144.257V264.092H139.053V279.74H133.849V295.388H128.645V311H139.053V295.388H175.553V311H185.997V295.388H180.757V279.74H175.553V264.092H170.349V248.444H165.145V238H149.497ZM159.905 253.648V264.092H165.145V279.74H170.349V284.944H144.257V279.74H149.497V264.092H154.701V253.648H159.905ZM155.701 265.092H150.497V280.74H145.257V283.944H169.349V280.74H164.145V265.092H158.905V254.648H155.701V265.092ZM166.145 247.444H171.349V263.092H176.553V278.74H181.757V294.388H186.997V312H174.553V296.388H140.053V312H127.645V294.388H132.849V278.74H138.053V263.092H143.257V247.444H148.497V237H166.145V247.444Z" />
              <path d="M71.3262 238H60.918V311H71.3262V277.138H107.826V311H118.271V238H107.826V266.694H71.3262V238ZM119.271 312H106.826V278.138H72.3262V312H59.918V237H72.3262V265.694H106.826V237H119.271V312Z" />
              <path d="M1 238V248.444H21.8516V311H32.2598V248.444H53.1123V238H1ZM54.1123 249.444H33.2598V312H20.8516V249.444H0V237H54.1123V249.444Z" />
              <path d="M483.022 374.388H477.818V317H467.41V379.592H472.614V384.796H477.818V390H509.114V384.796H514.318V379.592H519.522V317H509.114V374.388H503.91V379.592H483.022V374.388ZM520.522 380.592H515.318V385.796H510.114V391H476.818V385.796H471.614V380.592H466.41V316H478.818V373.388H484.022V378.592H502.91V373.388H508.114V316H520.522V380.592Z" />
              <path d="M410.022 317V322.24H404.818V327.444H399.614V332.648H394.41V374.388H399.614V379.592H404.818V384.796H410.022V390H441.318V384.796H446.522V379.592H451.763V374.388H456.967V332.648H451.763V327.444H446.522V322.24H441.318V317H410.022ZM440.318 368.148H445.522V338.888H440.318V333.648H435.114V328.444H416.263V333.648H411.022V338.888H405.818V368.148H411.022V373.388H416.263V378.592H435.114V373.388H440.318V368.148ZM441.318 374.388H436.114V379.592H415.263V374.388H410.022V369.148H404.818V337.888H410.022V332.648H415.263V327.444H436.114V332.648H441.318V337.888H446.522V369.148H441.318V374.388ZM442.318 321.24H447.522V326.444H452.763V331.648H457.967V375.388H452.763V380.592H447.522V385.796H442.318V391H409.022V385.796H403.818V380.592H398.614V375.388H393.41V331.648H398.614V326.444H403.818V321.24H409.022V316H442.318V321.24Z" />
              <path d="M357.91 337.888H352.671V327.444H347.467V317H337.059V327.444H342.263V337.888H347.467V348.296H352.671V358.74H357.91V390H368.318V358.74H373.559V348.296H378.763V337.888H383.967V327.444H389.171V317H378.763V327.444H373.559V337.888H368.318V348.296H357.91V337.888ZM390.171 328.444H384.967V338.888H379.763V349.296H374.559V359.74H369.318V391H356.91V359.74H351.671V349.296H346.467V338.888H341.263V328.444H336.059V316H348.467V326.444H353.671V336.888H358.91V347.296H367.318V336.888H372.559V326.444H377.763V316H390.171V328.444Z" />
              <path d="M269.369 317H258.961V390H269.369V363.944H274.573V369.148H279.813V374.388H285.018V379.592H290.222V384.796H295.461V390H308.472V384.796H303.268V379.592H298.063V374.388H292.823V369.148H287.619V363.944H282.415V358.74H277.211V348.296H282.415V343.092H287.619V337.888H292.823V332.648H298.063V327.444H303.268V322.24H308.472V317H295.461V322.24H290.222V327.444H285.018V332.648H279.813V337.888H274.573V343.092H269.369V317ZM309.472 323.24H304.268V328.444H299.063V333.648H293.823V338.888H288.619V344.092H283.415V349.296H278.211V357.74H283.415V362.944H288.619V368.148H293.823V373.388H299.063V378.592H304.268V383.796H309.472V391H294.461V385.796H289.222V380.592H284.018V375.388H278.813V370.148H273.573V364.944H270.369V391H257.961V316H270.369V342.092H273.573V336.888H278.813V331.648H284.018V326.444H289.222V321.24H294.461V316H309.472V323.24Z" />
              <path d="M238.071 317V369.148H232.867V358.74H227.628V348.296H222.424V337.888H217.22V327.444H211.979V317H196.367V390H206.775V337.888H211.979V348.296H217.22V358.74H222.424V369.148H227.628V379.592H232.867V390H248.479V317H238.071ZM249.479 391H231.867V380.592H226.628V370.148H221.424V359.74H216.22V349.296H210.979V338.888H207.775V391H195.367V316H212.979V326.444H218.22V336.888H223.424V347.296H228.628V357.74H233.867V368.148H237.071V316H249.479V391Z" />
              <path d="M149.497 317V327.444H144.257V343.092H139.053V358.74H133.849V374.388H128.645V390H139.053V374.388H175.553V390H185.997V374.388H180.757V358.74H175.553V343.092H170.349V327.444H165.145V317H149.497ZM159.905 332.648V343.092H165.145V358.74H170.349V363.944H144.257V358.74H149.497V343.092H154.701V332.648H159.905ZM155.701 344.092H150.497V359.74H145.257V362.944H169.349V359.74H164.145V344.092H158.905V333.648H155.701V344.092ZM166.145 326.444H171.349V342.092H176.553V357.74H181.757V373.388H186.997V391H174.553V375.388H140.053V391H127.645V373.388H132.849V357.74H138.053V342.092H143.257V326.444H148.497V316H166.145V326.444Z" />
              <path d="M71.3262 317H60.918V390H71.3262V356.138H107.826V390H118.271V317H107.826V345.694H71.3262V317ZM119.271 391H106.826V357.138H72.3262V391H59.918V316H72.3262V344.694H106.826V316H119.271V391Z" />
              <path d="M1 317V327.444H21.8516V390H32.2598V327.444H53.1123V317H1ZM54.1123 328.444H33.2598V391H20.8516V328.444H0V316H54.1123V328.444Z" />
              <path d="M511.585 433.986H507.762V431.428H511.585V428.879H512.869V426.33H511.585V423.772H510.311V421.223H509.036V418.665H507.762V416.116H510.311V418.665H511.585V421.223H512.869V423.772H515.418V421.223H516.701V418.665H517.976V416.116H520.525V418.665H519.25V421.223H517.976V423.772H516.701V426.33H515.418V428.879H514.143V431.428H512.869V432.703H511.585V433.986Z" />
              <path d="M502.646 428.879H497.539V427.604H496.265V426.33H494.99V423.772H496.265V422.497H498.814V421.223H503.93V419.939H502.646V418.665H498.814V419.939H494.99V418.665H496.265V417.39H497.539V416.116H503.93V417.39H505.204V418.665H506.479V428.879H503.93V427.604H502.646V428.879ZM498.177 426.33H502.646V425.055H503.93V422.497H502.646V423.772H498.177V426.33Z" />
              <path d="M488.607 428.879H483.5V427.604H482.226V426.33H480.951V418.665H482.226V417.39H483.5V416.116H488.607V417.39H489.891V411H492.44V428.879H489.891V427.604H488.607V428.879ZM484.775 426.33H488.607V425.055H489.891V419.939H488.607V418.665H484.775V419.939H483.5V425.055H484.775V426.33Z" />
              <path d="M470.756 428.879H464.366V427.604H463.091V426.33H461.816V418.665H463.091V417.39H464.366V416.116H470.756V417.39H472.03V418.665H473.305V423.135H464.366V425.055H465.64V426.33H469.473V425.055H473.305V426.33H472.03V427.604H470.756V428.879ZM464.366 421.223H470.756V419.939H469.473V418.665H465.64V419.939H464.366V421.223Z" />
              <path d="M456.717 428.879H450.326V427.604H449.052V426.33H447.777V418.665H449.052V417.39H450.326V416.116H456.717V417.39H457.991V418.665H459.266V421.223H456.717V419.939H455.433V418.665H451.601V419.939H450.326V425.055H451.601V426.33H455.433V425.055H456.717V423.772H459.266V426.33H457.991V427.604H456.717V428.879Z" />
              <path d="M445.229 414.195H442.68V411.646H445.229V414.195ZM445.229 428.879H442.68V416.116H445.229V428.879Z" />
              <path d="M431.821 428.879H429.271V416.116H431.821V417.39H433.095V416.116H437.565V417.39H438.848V418.665H440.123V428.879H437.565V419.939H436.29V418.665H433.095V419.939H431.821V428.879Z" />
              <path d="M417.791 428.879H412.684V427.604H411.409V426.33H410.135V423.772H411.409V422.497H413.958V421.223H419.074V419.939H417.791V418.665H413.958V419.939H410.135V418.665H411.409V417.39H412.684V416.116H419.074V417.39H420.349V418.665H421.623V428.879H419.074V427.604H417.791V428.879ZM413.321 426.33H417.791V425.055H419.074V422.497H417.791V423.772H413.321V426.33Z" />
              <path d="M399.937 428.879H393.547V427.604H392.273V426.33H390.998V418.665H392.273V417.39H393.547V416.116H399.937V417.39H401.212V418.665H402.487V423.135H393.547V425.055H394.822V426.33H398.654V425.055H402.487V426.33H401.212V427.604H399.937V428.879ZM393.547 421.223H399.937V419.939H398.654V418.665H394.822V419.939H393.547V421.223Z" />
              <path d="M384.609 428.879H382.06V426.33H380.777V423.772H379.502V421.223H378.228V418.665H376.953V416.116H379.502V418.665H380.777V421.223H382.06V423.772H384.609V421.223H385.893V418.665H387.167V416.116H389.716V418.665H388.442V421.223H387.167V423.772H385.893V426.33H384.609V428.879Z" />
              <path d="M371.836 428.879H366.729V427.604H365.454V426.33H364.18V423.772H365.454V422.497H368.003V421.223H373.119V419.939H371.836V418.665H368.003V419.939H364.18V418.665H365.454V417.39H366.729V416.116H373.119V417.39H374.394V418.665H375.668V428.879H373.119V427.604H371.836V428.879ZM367.366 426.33H371.836V425.055H373.119V422.497H371.836V423.772H367.366V426.33Z" />
              <path d="M350.143 428.879H347.594V411H350.143V418.028H359.082V411H361.64V428.879H350.143V420.585Z" />
            </EndMark>
          </Footer>
        </Container>
  );

  return (
    <ThemeProvider theme={theme}>
      <FontImport />
      <Page ref={pageRef}>
        {renderContent('a')}
        <div ref={loopRef}>{renderContent('b')}</div>
        {renderContent('c')}
      </Page>
    </ThemeProvider>
  );
}

const FontImport = createGlobalStyle`
  @font-face {
    font-family: 'PP Editorial New';
    src: url('${withBase('fonts/mattrothenberg/PPEditorialNew-Regular.woff2')}') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'PP Editorial Sans';
    src: url('${withBase('fonts/mattrothenberg/PPEditorialSans-Medium.woff2')}') format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'PP Editorial Sans';
    src: url('${withBase('fonts/mattrothenberg/PPEditorialSans-MediumItalic.woff2')}') format('woff2');
    font-weight: 500;
    font-style: italic;
    font-display: swap;
  }
  @font-face {
    font-family: 'PP Fraktion Mono';
    src: url('${withBase('fonts/mattrothenberg/PPFraktionMono-Regular.woff2')}') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'PP Fraktion Mono';
    src: url('${withBase('fonts/mattrothenberg/PPFraktionMono-Bold.woff2')}') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'PP Supply Mono';
    src: url('${withBase('fonts/mattrothenberg/PPSupplyMono-Regular.woff2')}') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;

const Page = styled.div`
  background: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.fg};
  font-family: 'PP Editorial New', 'Fraunces', 'Iowan Old Style', Georgia, serif;
  flex: 1;
  min-height: 100%;
  width: 100%;
  overflow: auto;
  transition: background 0.25s ease, color 0.25s ease;
  box-sizing: border-box;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 64px 24px 96px 24px;

  @media (min-width: 768px) {
    padding: 96px 24px 128px 24px;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-family: 'PP Fraktion Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 64px;
`;

const NavBrand = styled.span`
  color: ${(p) => p.theme.fgStrong};
  font-weight: 500;
`;

const NavSep = styled.span`
  color: ${(p) => p.theme.mutedSoft};
`;

const NavLink = styled.span`
  color: ${(p) => (p.$active ? p.theme.fgStrong : p.theme.muted)};
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${(p) => p.theme.fgStrong};
  }
`;

const Section = styled.section`
  margin-bottom: 56px;

  @media (min-width: 768px) {
    margin-bottom: 72px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Eyebrow = styled.div`
  font-family: 'PP Fraktion Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${(p) => p.theme.muted};
  margin-bottom: 20px;
`;

const Prose = styled.p`
  font-family: 'PP Editorial New', 'Fraunces', 'Iowan Old Style', Georgia, serif;
  font-weight: 300;
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: ${(p) => p.theme.fgStrong};
  margin: 0 0 24px 0;
  text-wrap: pretty;

  @media (min-width: 768px) {
    font-size: 36px;
    line-height: 1.2;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Em = styled.em`
  font-family: 'PP Editorial Sans', 'Inter', system-ui, sans-serif;
  font-style: italic;
  font-weight: 500;
  font-size: 0.86em;
  letter-spacing: -0.005em;
`;

const EmploymentPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.04em 0.55em 0.08em;
  margin: 0 0.05em;
  border: 1px solid ${(p) => p.theme.pillBorder};
  border-radius: 9999px;
  background: ${(p) => p.theme.pillBg};
  font-family: 'PP Editorial Sans', 'Inter', system-ui, sans-serif;
  font-size: 0.62em;
  font-weight: 500;
  font-style: normal;
  letter-spacing: 0;
  color: ${(p) => p.theme.fgStrong};
  text-decoration: none;
  vertical-align: 0.18em;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  cursor: ${(p) => (p.as === 'a' ? 'pointer' : 'default')};

  &:hover {
    background: ${(p) => p.theme.pillHoverBg};
    color: ${(p) => p.theme.pillHoverFg};
    border-color: ${(p) => p.theme.pillHoverBg};
  }
`;

const PillDot = styled.span`
  width: 0.7em;
  height: 0.7em;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.75;
  flex-shrink: 0;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px -16px 0 -16px;

  li {
    border-top: 1px solid ${(p) => p.theme.rule};
  }

  li:last-child {
    border-bottom: 1px solid ${(p) => p.theme.rule};
  }
`;

const ListRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  color: ${(p) => p.theme.fgStrong};
  text-decoration: none;
  transition: background 0.15s ease;

  &[href]:hover {
    background: ${(p) => p.theme.hover};
  }
`;

const RowTitle = styled.span`
  font-family: 'PP Editorial Sans', 'Inter', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: ${(p) => p.theme.fgStrong};
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${ListRow}[href]:hover & {
    opacity: 1;
  }

  @media (min-width: 768px) {
    font-size: 19px;
  }
`;

const RowMeta = styled.span`
  font-family: 'PP Supply Mono', 'PP Fraktion Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  color: ${(p) => p.theme.muted};
  opacity: 0.5;
  flex-shrink: 0;
`;

const EditorialLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-decoration-color: ${(p) => p.theme.linkUnderline};
  text-decoration-thickness: 2px;
  text-underline-offset: 0.15em;
  border-radius: 2px;
  transition: text-decoration-color 0.15s ease;

  &:hover {
    text-decoration-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 48px 0 0 0;
  margin-top: 96px;

  @media (min-width: 768px) {
    padding: 96px 0 0 0;
  }
`;

const EndMark = styled.svg`
  width: 100%;
  max-width: 520px;
  height: auto;
  color: ${(p) => p.theme.fgStrong};
  fill: currentColor;
`;
