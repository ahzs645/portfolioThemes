import React, { useMemo } from 'react';
import { useConfig } from '../../contexts/ConfigContext';

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function flattenExperience(experience = []) {
  const items = [];
  for (const entry of experience) {
    if (!entry) continue;
    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      for (const position of entry.positions) {
        items.push({
          company: entry.company,
          location: entry.location,
          title: position?.title || entry.position,
          startDate: position?.start_date ?? entry.start_date,
          endDate: position?.end_date ?? entry.end_date ?? null,
          highlights: position?.highlights || [],
        });
      }
      continue;
    }
    items.push({
      company: entry.company,
      location: entry.location,
      title: entry.position,
      startDate: entry.start_date,
      endDate: entry.end_date ?? null,
      highlights: entry.highlights || [],
    });
  }
  return items;
}

function formatDate(date) {
  if (!date) return '';
  if (isPresent(date)) return 'Present';
  return date;
}

export function BrutalistTheme() {
  const { cvData } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const website = cv?.website || null;
  const location = cv?.location || null;
  const phone = cv?.phone || null;

  const experienceItems = useMemo(() => {
    return flattenExperience(cv?.sections?.experience || []);
  }, [cv]);

  const projectItems = useMemo(() => {
    return cv?.sections?.projects || [];
  }, [cv]);

  const educationItems = useMemo(() => {
    return cv?.sections?.education || [];
  }, [cv]);

  const skills = useMemo(() => {
    return cv?.sections?.certifications_skills || [];
  }, [cv]);

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <body>
        <h1>{fullName}</h1>
        <p>
          {location && <>{location}<br /></>}
          {email && <><a href={`mailto:${email}`}>{email}</a><br /></>}
          {phone && <>{phone}<br /></>}
          {website && <><a href={website}>{website}</a></>}
        </p>

        {experienceItems.length > 0 && (
          <>
            <h2>Experience</h2>
            {experienceItems.map((item, idx) => (
              <div key={`${item.company}-${item.title}-${idx}`}>
                <h3>
                  {item.title}
                  {isPresent(item.endDate) && <> (Current)</>}
                </h3>
                <p>
                  <em>{item.company}</em> — {formatDate(item.startDate)} to {formatDate(item.endDate)}
                </p>
                {item.highlights.length > 0 && (
                  <ul>
                    {item.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {educationItems.length > 0 && (
          <>
            <h2>Education</h2>
            {educationItems.map((edu, idx) => (
              <div key={`${edu.institution}-${idx}`}>
                <h3>{edu.degree} in {edu.area}</h3>
                <p>
                  <em>{edu.institution}</em> — {formatDate(edu.start_date)} to {formatDate(edu.end_date)}
                </p>
              </div>
            ))}
          </>
        )}

        {projectItems.length > 0 && (
          <>
            <h2>Projects</h2>
            {projectItems.map((project, idx) => (
              <div key={`${project.name}-${idx}`}>
                <h3>
                  {project.name}
                  {project.url && <> — <a href={project.url}>link</a></>}
                </h3>
                {project.summary && <p>{project.summary}</p>}
              </div>
            ))}
          </>
        )}

        {skills.length > 0 && (
          <>
            <h2>Skills</h2>
            <ul>
              {skills.map((skill, idx) => (
                <li key={idx}>
                  <strong>{skill.label}:</strong> {skill.details}
                </li>
              ))}
            </ul>
          </>
        )}

        <hr />
        <p><small>This is a resume. It's lightweight and loads fast.</small></p>
      </body>
    </div>
  );
}
