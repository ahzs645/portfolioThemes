import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

const FontLoader = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const isPresent = (value) => String(value || '').trim().toLowerCase() === 'present';

const yearLabel = (value) => {
  if (!value) return 'UNKNOWN';
  if (isPresent(value)) return 'PRESENT';
  return String(value).split('-')[0];
};

const listText = (items) => {
  if (!items?.length) return 'NOT AVAILABLE';
  return items.join('\n');
};

const formatExperience = (entries = []) =>
  entries.slice(0, 6).map((entry) => {
    const headline = `${entry.position || 'ROLE'} @ ${entry.company || 'COMPANY'}`;
    const meta = `${yearLabel(entry.start_date)} - ${yearLabel(entry.end_date)}${entry.location ? ` | ${String(entry.location).toUpperCase()}` : ''}`;
    const highlight = entry.highlights?.[0] ? `  ${entry.highlights[0]}` : null;
    return [headline.toUpperCase(), meta.toUpperCase(), highlight].filter(Boolean).join('\n');
  });

const formatEducation = (entries = []) =>
  entries.slice(0, 5).map((entry) => {
    const headline = `${entry.degree || 'DEGREE'} ${entry.area ? `IN ${entry.area}` : ''}`;
    const meta = `${entry.institution || 'INSTITUTION'} | ${yearLabel(entry.start_date)} - ${yearLabel(entry.end_date)}`;
    return `${headline.toUpperCase()}\n${meta.toUpperCase()}`;
  });

function OutputBlock({ children }) {
  return <Output>{children}</Output>;
}

export function TerminalMasterTheme() {
  const cv = useCV();
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const [input, setInput] = useState('');

  const commandMap = useMemo(() => {
    if (!cv) return {};

    const socialEntries = Object.entries(cv.socialLinks || {}).filter(([, value]) => Boolean(value));
    const socialLines = socialEntries.map(([network, value]) => `${network.toUpperCase()}: ${value}`);

    const banner = `${(cv.name || 'PORTFOLIO').toUpperCase()}
========================================
TYPE "HELP" TO SEE AVAILABLE COMMANDS.
THIS THEME IS ADAPTED FROM /terminal-master.`;

    return {
      help: {
        render: () => (
          <OutputBlock>
            {[
              'ABOUT      PROFILE SUMMARY',
              'EXPERIENCE RECENT WORK HISTORY',
              'EDUCATION  ACADEMIC BACKGROUND',
              'PROJECTS   FEATURED PROJECTS',
              'SOCIALS    LINKS',
              'CONTACT    EMAIL / PHONE / LOCATION',
              'BANNER     REPRINT INTRO BANNER',
              'CLEAR      RESET TERMINAL',
            ].join('\n')}
          </OutputBlock>
        ),
      },
      banner: {
        render: () => <OutputBlock>{banner}</OutputBlock>,
      },
      about: {
        render: () => (
          <OutputBlock>
            {listText([
              cv.currentJobTitle ? `${cv.currentJobTitle.toUpperCase()}` : null,
              cv.location ? `LOCATION: ${cv.location}` : null,
              cv.about || null,
            ].filter(Boolean))}
          </OutputBlock>
        ),
      },
      experience: {
        render: () => <OutputBlock>{listText(formatExperience(cv.experience))}</OutputBlock>,
      },
      education: {
        render: () => <OutputBlock>{listText(formatEducation(cv.education))}</OutputBlock>,
      },
      projects: {
        render: () => (
          <OutputBlock>
            {cv.projects?.length ? (
              <>
                {cv.projects.slice(0, 6).map((project) => (
                  <LinkBlock key={project.name}>
                    <strong>{(project.name || 'PROJECT').toUpperCase()}</strong>
                    {project.date ? <span>{` (${project.date})`}</span> : null}
                    <ProjectSummary>{project.summary || project.highlights?.[0] || 'NO SUMMARY PROVIDED.'}</ProjectSummary>
                    {project.url ? (
                      <ExternalLink href={project.url} target="_blank" rel="noreferrer">
                        OPEN PROJECT
                      </ExternalLink>
                    ) : null}
                  </LinkBlock>
                ))}
              </>
            ) : (
              'NOT AVAILABLE'
            )}
          </OutputBlock>
        ),
      },
      socials: {
        render: () => (
          <OutputBlock>
            {socialEntries.length ? (
              <>
                {socialEntries.map(([network, value]) => (
                  <LinkBlock key={network}>
                    <strong>{network.toUpperCase()}</strong>
                    <ExternalLink href={value} target="_blank" rel="noreferrer">
                      {value}
                    </ExternalLink>
                  </LinkBlock>
                ))}
              </>
            ) : (
              socialLines.join('\n') || 'NOT AVAILABLE'
            )}
          </OutputBlock>
        ),
      },
      contact: {
        render: () => (
          <OutputBlock>
            {listText([
              cv.email ? `EMAIL: ${cv.email}` : null,
              cv.phone ? `PHONE: ${cv.phone}` : null,
              cv.location ? `LOCATION: ${cv.location}` : null,
              cv.website ? `WEBSITE: ${cv.website}` : null,
            ].filter(Boolean))}
          </OutputBlock>
        ),
      },
    };
  }, [cv]);

  const initialEntries = useMemo(() => {
    if (!cv) return [];
    return [
      {
        id: 0,
        type: 'output',
        content: commandMap.banner?.render() ?? null,
      },
    ];
  }, [commandMap.banner, cv]);

  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (!cv) return null;

  const executeCommand = (rawValue) => {
    const value = rawValue.trim();
    if (!value) return;

    const normalized = value.toLowerCase();
    if (normalized === 'clear') {
      setEntries(initialEntries);
      setInput('');
      return;
    }

    const command = commandMap[normalized];
    const commandEntry = {
      id: Date.now(),
      type: 'command',
      content: value,
    };

    const outputEntry = {
      id: Date.now() + 1,
      type: 'output',
      content: command
        ? command.render()
        : <OutputBlock>{`COMMAND NOT FOUND: ${value.toUpperCase()}\nTYPE "HELP" TO LIST AVAILABLE COMMANDS.`}</OutputBlock>,
    };

    setEntries((current) => [...current, commandEntry, outputEntry]);
    setInput('');
  };

  return (
    <Shell onClick={() => inputRef.current?.focus()}>
      <FontLoader />
      <Viewport>
        <TopBar>
          <WindowDot $color="#ff5f56" />
          <WindowDot $color="#ffbd2e" />
          <WindowDot $color="#27c93f" />
          <BarLabel>{`guest@${(cv.name || 'portfolio').toLowerCase().replace(/\s+/g, '')}: ~/portfolio`}</BarLabel>
        </TopBar>
        <TerminalBody ref={scrollRef}>
          {entries.map((entry) => (
            <Entry key={entry.id}>
              {entry.type === 'command' ? (
                <PromptLine>
                  <PromptLabel>guest</PromptLabel>
                  <PromptDivider>@</PromptDivider>
                  <PromptUser>{(cv.name || 'portfolio').toLowerCase().replace(/\s+/g, '')}</PromptUser>
                  <PromptDivider>$</PromptDivider>
                  <span>{entry.content}</span>
                </PromptLine>
              ) : (
                entry.content
              )}
            </Entry>
          ))}
          <PromptLine>
            <PromptLabel>guest</PromptLabel>
            <PromptDivider>@</PromptDivider>
            <PromptUser>{(cv.name || 'portfolio').toLowerCase().replace(/\s+/g, '')}</PromptUser>
            <PromptDivider>$</PromptDivider>
            <Input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  executeCommand(input);
                }
              }}
              aria-label="Terminal command input"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <Cursor />
          </PromptLine>
        </TerminalBody>
      </Viewport>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at top, rgba(33, 76, 42, 0.24), transparent 40%),
    linear-gradient(180deg, #081009 0%, #020402 100%);
  color: #9df6a5;
  font-family: 'IBM Plex Mono', monospace;
`;

const Viewport = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  border: 1px solid rgba(146, 243, 155, 0.28);
  border-radius: 18px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(11, 20, 12, 0.96) 0%, rgba(4, 8, 5, 0.98) 100%);
  box-shadow:
    0 0 0 1px rgba(46, 102, 53, 0.25),
    0 30px 90px rgba(0, 0, 0, 0.55),
    inset 0 0 50px rgba(71, 145, 78, 0.08);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(146, 243, 155, 0.16);
  background: rgba(14, 25, 15, 0.95);
`;

const WindowDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const BarLabel = styled.div`
  margin-left: 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(157, 246, 165, 0.78);
`;

const TerminalBody = styled.div`
  min-height: calc(100vh - 150px);
  max-height: calc(100vh - 90px);
  padding: 24px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
  text-shadow: 0 0 10px rgba(98, 217, 110, 0.2);
`;

const Entry = styled.div`
  margin-bottom: 18px;
`;

const PromptLine = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.98rem;
`;

const PromptLabel = styled.span`
  color: #a8da8d;
  font-weight: 600;
`;

const PromptUser = styled.span`
  color: #f7fbb4;
  font-weight: 600;
`;

const PromptDivider = styled.span`
  color: #f52891;
  font-weight: 600;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
`;

const Cursor = styled.span`
  width: 10px;
  height: 1.1em;
  background: #9df6a5;
  animation: ${blink} 1.15s steps(1) infinite;
`;

const Output = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  font: inherit;
`;

const LinkBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProjectSummary = styled.span`
  color: rgba(221, 255, 225, 0.84);
`;

const ExternalLink = styled.a`
  color: #f52891;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
