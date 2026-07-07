import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDate, formatRange, pickSocialUrl } from '../../utils/cvHelpers';

/**
 * PranavRameshTheme — a CV-driven remake of www.pranavramesh.com's design.
 *
 * The source is a quiet, minimal interactive terminal on a near-black ground:
 * a name in a warm accent, a "role @ affiliation" subtitle, a dim hint line,
 * then a live "~ $" prompt with a blinking block cursor. We rebuild the
 * experience as a real mini-shell (help / ls / cat / whoami / open / clear …)
 * that prints output derived entirely from useCV(). The original's green-tinted
 * CRT scanlines are dropped in favour of clean, generously-spaced typography.
 */

const MONO = `'JetBrains Mono', 'Fira Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace`;

// Match the source's DOS-terminal palette: bright cyan name, white subtitle,
// grey output, and a bright-yellow prompt on near-black.
const darkTheme = {
  bg: '#0c0c0c',
  fg: '#aaaaaa',
  dim: '#555555',
  name: '#34d6e6',
  prompt: '#f2c94c',
  title: '#dddddd',
  head: '#e8e8e8',
  link: '#e0e0e0',
  cmd: '#e8e8e8',
  error: '#d98a72',
  border: 'rgba(255, 255, 255, 0.14)',
  sel: 'rgba(52, 214, 230, 0.22)',
};

const lightTheme = {
  bg: '#f7f4ec',
  fg: '#4b463d',
  dim: '#928c7f',
  name: '#8a5a12',
  prompt: '#a06a17',
  title: '#2c2820',
  head: '#8a5a12',
  link: '#8a5a12',
  cmd: '#2c2820',
  error: '#b23a26',
  border: 'rgba(138, 90, 18, 0.20)',
  sel: 'rgba(160, 106, 23, 0.16)',
};

// "University of Northern British Columbia" -> "UNBC"
function abbreviate(value = '') {
  const stop = new Set(['of', 'the', 'and', 'for', 'in', 'at', 'de', 'a']);
  const initials = String(value)
    .split(/\s+/)
    .filter((w) => w && !stop.has(w.toLowerCase()) && /^[A-Za-z]/.test(w))
    .map((w) => w[0].toUpperCase())
    .join('');
  return initials.length >= 2 ? initials : value;
}

const yearOf = (d) => formatDate(d, { month: 'none', year: 'full', fallback: String(d || '') });
const rangeOf = (s, e) =>
  formatRange(s, e, { month: 'short', year: 'full', ongoingWhenNoEnd: true, presentLabel: 'Present' });

export function PranavRameshTheme({ darkMode = false, onDarkModeChange }) {
  const cv = useCV() || {};
  const theme = darkMode ? darkTheme : lightTheme;

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const [value, setValue] = useState('');
  const [entries, setEntries] = useState([]); // [{ input, output }]
  const [cmdLog, setCmdLog] = useState([]); // raw command strings for recall
  const [logIndex, setLogIndex] = useState(null);
  const [focused, setFocused] = useState(true);
  const [cursorOn, setCursorOn] = useState(true);

  // ---- Derived, CV-driven values --------------------------------------
  const derived = useMemo(() => {
    const name = cv.name || 'Your Name';
    const topEdu = cv.education?.[0] || null;
    const institution = topEdu?.institution || cv.experience?.[0]?.company || '';
    const instAbbr = institution ? abbreviate(institution) : '';
    const isDoctoral = /ph\.?\s*d/i.test(topEdu?.degree || '');
    const role = isDoctoral
      ? 'PhD Researcher'
      : cv.currentJobTitle || (topEdu?.area ? `${topEdu.area} Researcher` : 'Researcher');
    const subtitle = [role, instAbbr || institution].filter(Boolean).join(' · ');

    const socialList = cv.social || [];
    const links = {
      github: cv.socialLinks?.github || pickSocialUrl(socialList, ['github']),
      linkedin: cv.socialLinks?.linkedin || pickSocialUrl(socialList, ['linkedin']),
      facebook: pickSocialUrl(socialList, ['facebook']),
      instagram: pickSocialUrl(socialList, ['instagram']),
      website: cv.website || cv.socialLinks?.website || null,
      email: cv.email || null,
    };

    const handle = (() => {
      if (links.github) {
        const seg = links.github.replace(/\/+$/, '').split('/').pop();
        if (seg) return seg;
      }
      return String(name).split(/\s+/)[0].toLowerCase();
    })();

    const focus = (() => {
      for (const e of cv.education || []) {
        for (const h of e.highlights || []) {
          const m = String(h).match(/focus(?:ed)?\s+on\s+(.+)/i);
          if (m) return m[1].replace(/[.\s]+$/, '').trim();
        }
      }
      return null;
    })();

    const currents = (cv.experience || []).filter((e) => e.isCurrent);

    return { name, topEdu, institution, instAbbr, role, subtitle, links, handle, focus, currents, socialList };
  }, [cv]);

  const { name, subtitle, links, handle } = derived;

  // ---- Output builders (return JSX nodes) -----------------------------
  const line = (text) => <Row>{text}</Row>;
  const err = (text) => <ErrRow>{text}</ErrRow>;

  const buildAbout = () => {
    const { role, institution, focus, currents, topEdu } = derived;
    // Lowercase the role for prose, but keep acronyms like "PhD"/"GIS" intact.
    const roleLower = role
      .split(' ')
      .map((w) => (w === w.toUpperCase() || /[A-Z]/.test(w.slice(1)) ? w : w.toLowerCase()))
      .join(' ');
    const s1 = `I'm ${name}, a ${roleLower}${cv.location ? ` based in ${cv.location}` : ''}.`;
    const s2 = focus
      ? `My work centers on ${focus}${institution ? `, where I'm completing my ${topEdu?.degree || 'graduate'} at ${institution}` : ''}.`
      : institution
        ? `I'm currently at ${institution}.`
        : '';
    const s3 = currents.length
      ? `Alongside my studies I work as ${currents[0].title} at ${currents[0].company}` +
        (currents[1] ? `, and as ${currents[1].title} at ${currents[1].company}.` : '.')
      : '';
    return (
      <Block>
        {[s1, s2, s3].filter(Boolean).map((s, i) => (
          <Para key={i}>{s}</Para>
        ))}
        <Para $dim>Type <Kbd>projects</Kbd> to see what I've built, or <Kbd>open github</Kbd> to say hello.</Para>
      </Block>
    );
  };

  const buildWhoami = () => (
    <Block>
      <Row>{name}</Row>
      <Meta>{derived.role}{derived.institution ? ` @ ${derived.institution}` : ''}</Meta>
      {cv.location && <Meta>{cv.location}</Meta>}
      {cv.email && <Meta>{cv.email}</Meta>}
    </Block>
  );

  const buildExperience = () => {
    const items = cv.experience || [];
    if (!items.length) return err('experience: nothing on record');
    return (
      <Block>
        {items.map((job, i) => (
          <Item key={i}>
            <Row>
              <Title>{job.title}</Title>
              {job.company ? <Dim> @ {job.company}</Dim> : null}
              {job.isCurrent ? <Now> ● current</Now> : null}
            </Row>
            <Meta>{rangeOf(job.startDate, job.endDate)}</Meta>
            {(job.highlights || []).slice(0, 2).map((h, j) => (
              <Bullet key={j}>{h}</Bullet>
            ))}
          </Item>
        ))}
      </Block>
    );
  };

  const buildProjects = () => {
    const items = cv.projects || [];
    if (!items.length) return err('projects: nothing on record');
    return (
      <Block>
        {items.map((p, i) => (
          <Item key={i}>
            <Row>
              {p.url ? (
                <A href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.name}
                </A>
              ) : (
                <Title>{p.name}</Title>
              )}
              {p.date ? <Dim> · {yearOf(p.date)}</Dim> : null}
            </Row>
            {p.summary && <Bullet>{p.summary}</Bullet>}
            {(p.highlights || []).map((h, j) => (
              <Meta key={j}>{h}</Meta>
            ))}
          </Item>
        ))}
      </Block>
    );
  };

  const buildEducation = () => {
    const items = cv.education || [];
    if (!items.length) return err('education: nothing on record');
    return (
      <Block>
        {items.map((e, i) => (
          <Item key={i}>
            <Row>
              <Title>{[e.degree, e.area].filter(Boolean).join(', ')}</Title>
            </Row>
            <Meta>
              {e.institution}
              {e.institution ? ' · ' : ''}
              {rangeOf(e.start_date, e.end_date)}
            </Meta>
            {(e.highlights || []).slice(0, 1).map((h, j) => (
              <Bullet key={j}>{h}</Bullet>
            ))}
          </Item>
        ))}
      </Block>
    );
  };

  const buildAwards = () => {
    const items = cv.awards || [];
    if (!items.length) return err('awards: nothing on record');
    return (
      <Block>
        {items.map((a, i) => (
          <Item key={i}>
            <Row>
              <Title>{a.name}</Title>
              {a.date ? <Dim> · {yearOf(a.date)}</Dim> : null}
            </Row>
            {a.summary && <Meta>{a.summary}</Meta>}
          </Item>
        ))}
      </Block>
    );
  };

  const buildSkills = () => {
    const items = cv.certificationsSkills || [];
    if (!items.length) return err('skills: nothing on record');
    return (
      <Block>
        {items.map((s, i) => {
          const chips = String(s.details || '')
            .split(/;\s*/)
            .map((c) => c.trim())
            .filter(Boolean);
          return (
            <Item key={i}>
              <Head>{s.label}</Head>
              <Chips>
                {chips.map((c, j) => (
                  <Chip key={j}>{c}</Chip>
                ))}
              </Chips>
            </Item>
          );
        })}
      </Block>
    );
  };

  const buildPublications = () => {
    const items = cv.publications || [];
    if (!items.length) return err('publications: nothing on record');
    return (
      <Block>
        {items.map((p, i) => (
          <Item key={i}>
            <Row>
              {p.doi ? (
                <A href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer">
                  {p.title}
                </A>
              ) : (
                <Title>{p.title}</Title>
              )}
            </Row>
            <Meta>
              {[p.journal, p.date ? yearOf(p.date) : null].filter(Boolean).join(' · ')}
            </Meta>
          </Item>
        ))}
      </Block>
    );
  };

  const buildPresentations = () => {
    const items = cv.presentations || [];
    if (!items.length) return err('presentations: nothing on record');
    return (
      <Block>
        {items.map((p, i) => (
          <Item key={i}>
            <Row><Title>{p.name}</Title></Row>
            <Meta>
              {[p.summary, p.location, p.date ? yearOf(p.date) : null].filter(Boolean).join(' · ')}
            </Meta>
          </Item>
        ))}
      </Block>
    );
  };

  const buildContact = () => (
    <Block>
      {cv.email && (
        <Row>
          <Dim>email  </Dim>
          <A href={`mailto:${cv.email}`}>{cv.email}</A>
        </Row>
      )}
      {links.website && (
        <Row>
          <Dim>web    </Dim>
          <A href={links.website} target="_blank" rel="noopener noreferrer">
            {links.website.replace(/^https?:\/\//, '')}
          </A>
        </Row>
      )}
      {(derived.socialList || []).map((s, i) =>
        s.url ? (
          <Row key={i}>
            <Dim>{String(s.network || 'link').toLowerCase().padEnd(7, ' ')}</Dim>
            <A href={s.url} target="_blank" rel="noopener noreferrer">
              {s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </A>
          </Row>
        ) : null,
      )}
    </Block>
  );

  const openTarget = (target, raw) => {
    if (!target) return err("open: what should I open? Try: github, linkedin, website, email");
    if (target === 'email' || target === 'mail') {
      if (!cv.email) return err('open: no email address on file');
      if (typeof window !== 'undefined') window.open(`mailto:${cv.email}`);
      return line(`Opening your mail client to ${cv.email}…`);
    }
    const url = links[target];
    if (url) {
      if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
      return (
        <Row>
          Opening {target} →{' '}
          <A href={url} target="_blank" rel="noopener noreferrer">
            {url.replace(/^https?:\/\//, '')}
          </A>
        </Row>
      );
    }
    return err(`open: unknown target '${raw}'. Try: github, linkedin, website, email`);
  };

  const buildHelp = () => {
    const rows = [
      ['help', 'show this list of commands'],
      ['ls', 'list everything you can read'],
      ['cat about.txt', 'who I am'],
      ['whoami', 'name, role & contact in one line'],
      ['experience', 'work history'],
      ['projects', "things I've built"],
      ['education', 'academic background'],
      ['skills', 'tools & certifications'],
      ['awards', 'honours & scholarships'],
      ['publications', 'published research'],
      ['presentations', 'conference talks'],
      ['contact', 'email & social links'],
      ['open <target>', 'open github · linkedin · website · email'],
      ['clear', 'clear the screen'],
    ];
    return (
      <HelpGrid>
        {rows.map(([c, d]) => (
          <React.Fragment key={c}>
            <Kbd>{c}</Kbd>
            <Dim>{d}</Dim>
          </React.Fragment>
        ))}
      </HelpGrid>
    );
  };

  const buildLs = () => {
    const files = [
      'about.txt',
      'experience',
      'projects',
      'education',
      'skills',
      'awards',
      'publications',
      'presentations',
      'contact',
    ];
    return (
      <Files>
        {files.map((f) => (
          <File key={f}>{f}</File>
        ))}
      </Files>
    );
  };

  // ---- Command dispatch ------------------------------------------------
  const process = (raw) => {
    const parts = raw.split(/\s+/);
    const cmd = (parts[0] || '').toLowerCase();
    const arg = (parts[1] || '').toLowerCase();

    switch (cmd) {
      case 'help':
      case 'man':
      case 'commands':
      case '?':
        return buildHelp();
      case 'ls':
      case 'dir':
        return buildLs();
      case 'cat': {
        const file = arg.replace(/\.txt$/, '');
        if (['about', 'readme', 'me', 'bio'].includes(file)) return buildAbout();
        if (['experience', 'work', 'exp'].includes(file)) return buildExperience();
        if (['projects', 'project'].includes(file)) return buildProjects();
        if (['education', 'edu'].includes(file)) return buildEducation();
        if (['skills', 'skill'].includes(file)) return buildSkills();
        if (['awards', 'award'].includes(file)) return buildAwards();
        if (['publications', 'papers', 'pubs'].includes(file)) return buildPublications();
        if (['presentations', 'talks'].includes(file)) return buildPresentations();
        if (['contact'].includes(file)) return buildContact();
        if (!arg) return err('cat: missing operand. Try: cat about.txt');
        return err(`cat: ${parts[1]}: No such file or directory`);
      }
      case 'about':
      case 'bio':
        return buildAbout();
      case 'whoami':
        return buildWhoami();
      case 'experience':
      case 'exp':
      case 'work':
        return buildExperience();
      case 'projects':
      case 'project':
        return buildProjects();
      case 'education':
      case 'edu':
        return buildEducation();
      case 'skills':
      case 'skill':
        return buildSkills();
      case 'awards':
      case 'award':
        return buildAwards();
      case 'publications':
      case 'papers':
      case 'pubs':
        return buildPublications();
      case 'presentations':
      case 'talks':
        return buildPresentations();
      case 'contact':
        return buildContact();
      case 'social':
      case 'socials':
      case 'links':
        return buildContact();
      case 'open':
      case 'goto':
        return openTarget(arg, parts[1] || '');
      case 'email':
      case 'mail':
        return openTarget('email', 'email');
      case 'clear':
      case 'cls':
        return 'CLEAR';
      case 'echo':
        return line(parts.slice(1).join(' '));
      case 'pwd':
        return line(`/home/${handle}`);
      case 'date':
        return line(new Date().toString());
      case 'sudo':
        return err('sudo: permission denied — nice try :)');
      case 'exit':
      case 'quit':
        return line("There's no escape from the terminal. Type 'help' to keep exploring.");
      case '':
        return null;
      default:
        return err(`command not found: ${cmd}. Type 'help' for a list of commands.`);
    }
  };

  // ---- Submit & history recall ----------------------------------------
  const submit = () => {
    const raw = value;
    const trimmed = raw.trim();
    setLogIndex(null);
    setValue('');

    if (trimmed) setCmdLog((prev) => [...prev, trimmed]);

    if (!trimmed) {
      setEntries((prev) => [...prev, { input: '', output: null }]);
      return;
    }

    const output = process(trimmed);
    if (output === 'CLEAR') {
      setEntries([]);
      return;
    }
    setEntries((prev) => [...prev, { input: raw, output }]);
  };

  const recall = (dir) => {
    if (cmdLog.length === 0) return;
    if (dir < 0) {
      const idx = logIndex === null ? cmdLog.length - 1 : Math.max(0, logIndex - 1);
      setLogIndex(idx);
      setValue(cmdLog[idx]);
    } else {
      if (logIndex === null) return;
      const idx = logIndex + 1;
      if (idx > cmdLog.length - 1) {
        setLogIndex(null);
        setValue('');
      } else {
        setLogIndex(idx);
        setValue(cmdLog[idx]);
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      recall(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      recall(1);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  const focusInput = useCallback((opts) => {
    inputRef.current?.focus(opts);
  }, []);

  const handleAreaClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    const sel = typeof window !== 'undefined' ? window.getSelection?.() : null;
    if (sel && String(sel).length > 0) return; // don't steal an active text selection
    focusInput({ preventScroll: true });
  };

  // ---- Effects ---------------------------------------------------------
  // Autofocus on mount (preventScroll so mobile keyboard doesn't jump the page).
  useEffect(() => {
    focusInput({ preventScroll: true });
  }, [focusInput]);

  // Blinking block cursor — interval cleared on unmount.
  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Start typing anywhere → focus the prompt. Global keydown listener,
  // removed on unmount. Guarded so it never steals focus from other inputs.
  useEffect(() => {
    const onDocKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return; // only printable characters
      const active = document.activeElement;
      if (active === inputRef.current) return;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active?.isContentEditable) return;
      const root = scrollRef.current;
      if (active === document.body || (root && root.contains(active))) {
        focusInput({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onDocKeyDown);
    return () => document.removeEventListener('keydown', onDocKeyDown);
  }, [focusInput]);

  // Keep the newest output in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Root>
        <Toggle
          type="button"
          onClick={() => onDarkModeChange?.(!darkMode)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          [{darkMode ? 'light' : 'dark'}]
        </Toggle>

        <Scroll ref={scrollRef} onClick={handleAreaClick}>
          <Screen>
            <Header>
              <NameLine>{name}</NameLine>
              <SubLine>{subtitle}</SubLine>
              <Gap />
              <HintLine>
                Type <Kbd>help</Kbd> for available commands. Try: <Kbd>ls</Kbd>, <Kbd>cat about.txt</Kbd>,{' '}
                <Kbd>open github</Kbd>
              </HintLine>
            </Header>

            {entries.map((entry, i) => (
              <Block key={i}>
                <PromptLine>
                  <Prompt>~&nbsp;$</Prompt>
                  <Echo>{entry.input}</Echo>
                </PromptLine>
                {entry.output}
              </Block>
            ))}

            <PromptLine>
              <Prompt>~&nbsp;$</Prompt>
              <Field>
                <Mirror>
                  <Typed>{value}</Typed>
                  <Cursor $on={cursorOn} $focused={focused} aria-hidden="true" />
                </Mirror>
                <HiddenInput
                  ref={inputRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setCursorOn(true);
                  }}
                  onKeyDown={onKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  type="text"
                  aria-label="Terminal command input"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </Field>
            </PromptLine>
          </Screen>
        </Scroll>
      </Root>
    </ThemeProvider>
  );
}

// ---- Styled components -------------------------------------------------
const GlobalStyle = createGlobalStyle`
  body { background-color: ${(p) => p.theme.bg}; }
`;

const Root = styled.div`
  position: relative;
  height: 100%;
  min-height: 100%;
  width: 100%;
  background: ${(p) => p.theme.bg};
  color: ${(p) => p.theme.fg};
  font-family: ${MONO};
  font-size: 15px;
  line-height: 1.75;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.2s ease, color 0.2s ease;

  ::selection {
    background: ${(p) => p.theme.sel};
  }
`;

const Toggle = styled.button`
  position: absolute;
  top: 0.85rem;
  right: 1rem;
  z-index: 3;
  background: none;
  border: none;
  padding: 0.15rem 0.35rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  color: ${(p) => p.theme.dim};
  transition: color 0.15s ease;

  &:hover {
    color: ${(p) => p.theme.prompt};
  }
`;

const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: clamp(1.1rem, 3vw, 2rem) clamp(1.1rem, 3.5vw, 2.25rem) 3rem;
  cursor: text;
`;

const Screen = styled.div`
  width: 100%;
  max-width: 52rem;
`;

const Header = styled.div`
  margin-bottom: 0.75rem;
`;

const NameLine = styled.div`
  color: ${(p) => p.theme.name};
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const SubLine = styled.div`
  color: ${(p) => p.theme.fg};
`;

const Gap = styled.div`
  height: 0.9rem;
`;

const HintLine = styled.div`
  color: ${(p) => p.theme.dim};
`;

const Kbd = styled.span`
  color: ${(p) => p.theme.link};
`;

const Block = styled.div`
  margin-top: 0.35rem;
`;

const PromptLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-top: 0.55rem;
`;

const Prompt = styled.span`
  color: ${(p) => p.theme.prompt};
  white-space: nowrap;
  flex-shrink: 0;
`;

const Echo = styled.span`
  color: ${(p) => p.theme.cmd};
  white-space: pre-wrap;
  word-break: break-word;
`;

const Field = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const Mirror = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1.2em;
`;

const Typed = styled.span`
  color: ${(p) => p.theme.cmd};
`;

const Cursor = styled.span`
  display: inline-block;
  width: 0.55em;
  height: 1.05em;
  margin-left: 0.06em;
  vertical-align: -0.16em;
  background: ${(p) => (p.$focused ? p.theme.prompt : 'transparent')};
  box-shadow: ${(p) => (p.$focused ? 'none' : `inset 0 0 0 1px ${p.theme.prompt}`)};
  opacity: ${(p) => (p.$focused ? (p.$on ? 1 : 0) : 0.55)};
  transition: opacity 0.05s linear;
`;

const HiddenInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  font-family: inherit;
  font-size: 16px; /* >=16px avoids iOS focus-zoom; text is invisible anyway */
  line-height: inherit;
`;

// ---- Output primitives ----
const Row = styled.div`
  color: ${(p) => p.theme.fg};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ErrRow = styled(Row)`
  color: ${(p) => p.theme.error};
`;

const Para = styled.div`
  color: ${(p) => (p.$dim ? p.theme.dim : p.theme.fg)};
  margin-top: 0.25rem;
  max-width: 44rem;
`;

const Item = styled.div`
  margin-top: 0.6rem;

  &:first-child {
    margin-top: 0.2rem;
  }
`;

const Title = styled.span`
  color: ${(p) => p.theme.title};
  font-weight: 500;
`;

const Dim = styled.span`
  color: ${(p) => p.theme.dim};
`;

const Now = styled.span`
  color: ${(p) => p.theme.prompt};
`;

const Meta = styled.div`
  color: ${(p) => p.theme.dim};
  font-size: 0.86em;
`;

const Bullet = styled.div`
  color: ${(p) => p.theme.fg};
  padding-left: 1.1rem;
  position: relative;
  max-width: 44rem;

  &::before {
    content: '›';
    position: absolute;
    left: 0;
    color: ${(p) => p.theme.prompt};
  }
`;

const A = styled.a`
  color: ${(p) => p.theme.link};
  text-decoration: none;
  border-bottom: 1px solid transparent;
  word-break: break-word;
  cursor: pointer;

  &:hover {
    border-bottom-color: ${(p) => p.theme.link};
  }
`;

const Head = styled.div`
  color: ${(p) => p.theme.head};
  font-weight: 500;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  margin-top: 0.2rem;
`;

const Chip = styled.span`
  color: ${(p) => p.theme.fg};
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 3px;
  padding: 0.05rem 0.45rem;
  font-size: 0.84em;
`;

const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(8.5rem, max-content) 1fr;
  gap: 0.1rem 1.25rem;
  margin-top: 0.25rem;

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
    gap: 0.1rem;

    & > *:nth-child(even) {
      margin-bottom: 0.35rem;
      padding-left: 1rem;
    }
  }
`;

const Files = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.5rem;
  margin-top: 0.25rem;
`;

const File = styled.span`
  color: ${(p) => p.theme.link};
`;
