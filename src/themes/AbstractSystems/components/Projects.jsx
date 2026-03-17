import React from 'react';
import styled from 'styled-components';
import { FONT, BREAKPOINT } from '../utils/tokens';
import { trimText } from '../utils/helpers';
import { filterActive } from '../../../utils/cvHelpers';

export default function Projects({ cv, theme }) {
  const projects = filterActive(cv.projects || []).slice(0, 6);

  if (projects.length === 0) return null;

  return (
    <Section id="as-projects">
      <Header>
        <Label $theme={theme}>Projects</Label>
      </Header>

      <List>
        {projects.map((project, i) => {
          const num = String(i + 1).padStart(2, '0');
          const tech = (project.highlights || [])
            .map(h => String(h).replace(/^technologies\s*-\s*/i, '').trim())
            .filter(Boolean)[0];

          return (
            <Entry key={i} $theme={theme}>
              <EntryNum $theme={theme}>{num}</EntryNum>
              <EntryContent>
                <EntryHeader>
                  <EntryTitle
                    $theme={theme}
                    as={project.url ? 'a' : 'span'}
                    href={project.url || undefined}
                    target={project.url ? '_blank' : undefined}
                    rel={project.url ? 'noopener noreferrer' : undefined}
                  >
                    {project.name || 'Project'}
                    {project.url && <Arrow $theme={theme}> ↗</Arrow>}
                  </EntryTitle>
                  {project.date && (
                    <Badge $theme={theme}>
                      {project.date}
                    </Badge>
                  )}
                </EntryHeader>
                {project.summary && (
                  <EntryBody $theme={theme}>
                    {trimText(project.summary, 140)}
                  </EntryBody>
                )}
                {tech && (
                  <TechLine $theme={theme}>{tech}</TechLine>
                )}
              </EntryContent>
            </Entry>
          );
        })}
      </List>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px;
`;

const Label = styled.h2`
  font-family: ${FONT.sans};
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
  color: ${p => p.$theme.muted};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Entry = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px dotted ${p => p.$theme.border};
`;

const EntryNum = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  line-height: 20px;
  letter-spacing: 0.02em;
  color: ${p => p.$theme.muted};
  flex-shrink: 0;
  padding-top: 1px;
`;

const EntryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const EntryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const EntryTitle = styled.span`
  font-family: ${FONT.sans};
  font-size: 15px;
  line-height: 20px;
  font-weight: 500;
  color: ${p => p.$theme.heading};
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${p => p.$theme.body};
  }
`;

const Arrow = styled.span`
  font-size: 12px;
  color: ${p => p.$theme.muted};
`;

const Badge = styled.span`
  font-family: ${FONT.mono};
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${p => p.$theme.green}1a;
  color: ${p => p.$theme.green};
  border: 1px solid ${p => p.$theme.green}4d;
`;

const EntryBody = styled.p`
  font-family: ${FONT.sans};
  font-size: 14px;
  line-height: 22px;
  color: ${p => p.$theme.body};
  margin: 0;
`;

const TechLine = styled.span`
  font-family: ${FONT.mono};
  font-size: 11px;
  line-height: 16px;
  color: ${p => p.$theme.muted};
  letter-spacing: 0.02em;
`;
