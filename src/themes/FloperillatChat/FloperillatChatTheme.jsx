import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowUp } from 'lucide-react';
import { useCV } from '../../contexts/ConfigContext';

const TOPICS = [
  { id: 'current', label: 'Current work', prompt: 'What are you working on now?' },
  { id: 'education', label: 'Education', prompt: 'Where did you go to university?' },
  { id: 'projects', label: 'Projects', prompt: 'Show me a project' },
  { id: 'skills', label: 'Skills', prompt: 'What skills do you have?' },
  { id: 'contact', label: 'Contact', prompt: 'How can I contact you?' },
];

function formatDate(value) {
  if (!value) return '';
  if (String(value).toLowerCase() === 'present') return 'present';
  const [year, month] = String(value).split('-');
  if (!month) return year;
  const date = new Date(Number(year), Number(month) - 1);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
}

function formatRange(start, end) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (from && to) return `${from} to ${to}`;
  return from || to || '';
}

function listSentence(items, fallback = 'a few different things') {
  const clean = items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (clean.length === 0) return fallback;
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}, and ${clean.at(-1)}`;
}

function itemTitle(item) {
  return item?.name || item?.title || item?.company || item?.institution || item?.label || '';
}

function makeProfile(cv) {
  const experience = cv?.experience || [];
  const education = cv?.education || [];
  const projects = cv?.projects || [];
  const currentRoles = experience
    .filter((item) => item.isCurrent)
    .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
  const primaryCurrent = currentRoles[0] || experience[0];
  const latestEducation = education[0];
  const skills = [
    ...(cv?.skills || []).flatMap((group) => {
      if (typeof group === 'string') return [group];
      return [group?.label, group?.details, ...(group?.keywords || [])];
    }),
    ...(cv?.certificationsSkills || []).flatMap((group) => [group?.label, group?.details]),
  ].filter(Boolean);
  const socials = cv?.socialLinks || {};

  return {
    name: cv?.name || 'This person',
    firstName: (cv?.name || 'there').split(' ')[0],
    title: primaryCurrent?.title || cv?.currentJobTitle || cv?.headline || 'builder',
    location: cv?.location,
    email: cv?.email,
    website: cv?.website,
    about: cv?.about,
    socials,
    experience,
    education,
    projects,
    volunteer: cv?.volunteer || [],
    awards: cv?.awards || [],
    publications: cv?.publications || [],
    presentations: cv?.presentations || [],
    skills,
    currentRoles,
    primaryCurrent,
    latestEducation,
  };
}

function answerForPrompt(rawPrompt, profile) {
  const prompt = rawPrompt.toLowerCase();
  const includes = (...words) => words.some((word) => prompt.includes(word));
  const hesitant = (answer) => `hmm, i dont get it exactly, but what I can tell you is that ${answer}`;

  if (includes('education', 'university', 'school', 'degree', 'study', 'studied', 'phd', 'msc', 'bachelor')) {
    const school = profile.latestEducation;
    if (!school) return hesitant(`${profile.firstName} has an unconventional path, and the resume does not list formal education.`);
    const degree = [school.degree, school.area].filter(Boolean).join(' in ');
    const range = formatRange(school.start_date, school.end_date);
    return `I went to university at ${school.institution}${school.location ? ` in ${school.location}` : ''}${degree ? ` for ${degree}` : ''}${range ? `, ${range}` : ''}. ${school.highlights?.[0] || 'That academic thread shows up a lot in my work.'}`;
  }

  if (includes('current', 'now', 'job', 'work', 'role', 'experience', 'career', 'employer')) {
    const roles = profile.currentRoles.length ? profile.currentRoles : [profile.primaryCurrent].filter(Boolean);
    if (!roles.length) return hesitant(`${profile.firstName}'s resume has projects and background, but no current role is marked.`);
    return `Right now I am ${listSentence(roles.slice(0, 2).map((role) => `${role.title} at ${role.company}`))}. ${roles[0].highlights?.[0] || 'Most of the work sits around research, systems, operations, and applied technical problem solving.'}`;
  }

  if (includes('project', 'built', 'github', 'portfolio', 'app', 'code')) {
    if (!profile.projects.length) return hesitant(`${profile.firstName} has not listed public projects in this CV yet.`);
    const project = profile.projects.find((item) => prompt.includes(String(item.name || '').toLowerCase())) || profile.projects[0];
    return `${project.name} is a good example: ${project.summary || project.highlights?.[0] || 'it is one of the listed projects.'}${project.url ? ` You can open it here: ${project.url}` : ''}`;
  }

  if (includes('skill', 'tools', 'tech', 'technology', 'stack', 'good at')) {
    const skillText = profile.skills.length ? listSentence(profile.skills.slice(0, 6)) : 'research, data analysis, GIS, design tools, and process improvement';
    return `The resume points to ${skillText}. A lot of that is applied through research workflows, health information systems, environmental analysis, and practical software projects.`;
  }

  if (includes('contact', 'email', 'reach', 'hire', 'linkedin', 'social')) {
    const links = [
      profile.email && `email: ${profile.email}`,
      profile.socials.linkedin && `LinkedIn: ${profile.socials.linkedin}`,
      profile.socials.github && `GitHub: ${profile.socials.github}`,
      profile.website && `website: ${profile.website}`,
    ].filter(Boolean);
    return links.length ? `You can reach me through ${listSentence(links)}.` : hesitant('the CV does not list contact links yet.');
  }

  if (includes('where', 'location', 'live', 'based')) {
    return profile.location
      ? `I am based in ${profile.location}.`
      : hesitant('the resume does not include a current location.');
  }

  if (includes('award', 'scholarship', 'honor', 'achievement')) {
    if (!profile.awards.length) return hesitant('the CV does not list awards in this version.');
    return `A few awards on the resume include ${listSentence(profile.awards.slice(0, 3).map(itemTitle))}.`;
  }

  if (includes('volunteer', 'community', 'service')) {
    if (!profile.volunteer.length) return hesitant('the resume does not list volunteer roles in this version.');
    const role = profile.volunteer[0];
    return `On the community side, I have been ${role.title} with ${role.company}. ${role.highlights?.[0] || 'There are several service and mentorship roles listed.'}`;
  }

  if (includes('publication', 'paper', 'research', 'presentation', 'conference')) {
    const researchItems = [...profile.publications, ...profile.presentations];
    if (!researchItems.length) return hesitant('the resume does not list publications or presentations here.');
    return `For research output, one listed item is "${itemTitle(researchItems[0])}"${researchItems[0].summary ? ` for ${researchItems[0].summary}` : ''}.`;
  }

  if (includes('about', 'summary', 'who are you', 'tell me')) {
    return profile.about
      ? profile.about
      : `${profile.name} is a ${profile.title}${profile.location ? ` based in ${profile.location}` : ''}, with experience across ${listSentence(profile.experience.slice(0, 3).map((item) => item.company))}.`;
  }

  const fallbackFacts = [
    profile.latestEducation && `I went to university at ${profile.latestEducation.institution}${profile.latestEducation.area ? ` studying ${profile.latestEducation.area}` : ''}`,
    profile.primaryCurrent && `I have worked as ${profile.primaryCurrent.title} at ${profile.primaryCurrent.company}`,
    profile.projects[0] && `one project on my resume is ${profile.projects[0].name}`,
    profile.location && `I am based in ${profile.location}`,
  ].filter(Boolean);

  return hesitant(`${fallbackFacts[0] || `${profile.name}'s resume has experience, education, and project details`}. Try one of the buttons below if you want a cleaner answer.`);
}

function makeIntro(profile) {
  const work = profile.primaryCurrent
    ? `${profile.primaryCurrent.title} at ${profile.primaryCurrent.company}`
    : profile.title;
  const school = profile.latestEducation?.institution;

  return `Hey, it's ${profile.firstName}. I'm ${work}${profile.location ? ` based in ${profile.location}` : ''}. ${school ? `I went to ${school}, and ` : ''}this chat can answer resume questions with simple heuristics.`;
}

function getTypingDelay(character, speed) {
  if (speed !== 'hero') return speed;
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  if (character === ' ') return randomBetween(70, 100);
  if (character === ',' || character === '.') return randomBetween(120, 160);
  return randomBetween(45, 70);
}

function useTypedText(text, active = true, delay = 0, speed = 72) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setTyped('');
    if (!active) return undefined;
    let index = 0;
    let timer;
    const start = window.setTimeout(() => {
      const typeNext = () => {
        if (index >= text.length) return;
        const character = text[index];
        index += 1;
        setTyped(text.slice(0, index));
        if (index < text.length) {
          timer = window.setTimeout(typeNext, getTypingDelay(character, speed));
        }
      };
      typeNext();
    }, delay);
    return () => {
      window.clearTimeout(start);
      if (timer) window.clearTimeout(timer);
    };
  }, [active, delay, speed, text]);

  return typed;
}

export function FloperillatChatTheme({ darkMode = false }) {
  const cv = useCV();
  const profile = useMemo(() => makeProfile(cv), [cv]);
  const heroText = 'Hello, world.';
  const typedHero = useTypedText(heroText, true, 350, 'hero');
  const introText = useMemo(() => makeIntro(profile), [profile]);
  const introActive = typedHero === heroText;
  const typedIntro = useTypedText(introText, introActive, 420, 22);
  const introDone = typedIntro === introText;
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const transcriptRef = useRef(null);
  const topics = useMemo(() => TOPICS.filter((topic) => {
    if (topic.id === 'current') return Boolean(profile.primaryCurrent || profile.currentRoles.length);
    if (topic.id === 'education') return profile.education.length > 0;
    if (topic.id === 'projects') return profile.projects.length > 0;
    if (topic.id === 'skills') return profile.skills.length > 0;
    if (topic.id === 'contact') {
      return Boolean(profile.email || profile.website || profile.socials.linkedin || profile.socials.github);
    }
    return true;
  }), [profile]);

  useEffect(() => {
    setMessages([]);
  }, [profile]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  const sendPrompt = useCallback((prompt) => {
    const text = prompt.trim();
    if (!text || isTyping || !introDone) return;

    setInput('');
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, from: 'user', text },
    ]);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `bot-${Date.now()}`, from: 'bot', text: answerForPrompt(text, profile) },
      ]);
      setIsTyping(false);
    }, Math.min(1200, 420 + text.length * 14));
  }, [introDone, isTyping, profile]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendPrompt(input);
  };

  if (!cv) return null;

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Page $dark={darkMode}>
      <TopNav aria-label="Profile links" $show={introDone} $dark={darkMode}>
        <MutedNavItem $dark={darkMode}>{profile.location || 'About'}</MutedNavItem>
        {profile.email && <TextLink href={`mailto:${profile.email}`} $dark={darkMode}>Contact</TextLink>}
        {profile.socials.github && <TextLink href={profile.socials.github} $dark={darkMode}>GitHub</TextLink>}
        {profile.socials.linkedin && <TextLink href={profile.socials.linkedin} $dark={darkMode}>LinkedIn</TextLink>}
      </TopNav>

      <Hero $settled={introDone}>
        <NameLine aria-label={heroText}>
          {typedHero}
          <Caret
            key={typedHero.length}
            $flash={typedHero.length > 0}
            $typing={typedHero.length < heroText.length}
          />
        </NameLine>

        <Transcript ref={transcriptRef} aria-live="polite">
          {introActive && (
            <MessageRow $from="bot" $visible={Boolean(typedIntro)}>
              <Avatar $dark={darkMode}>{initials}</Avatar>
              <Bubble $from="bot" $dark={darkMode}>{typedIntro || ' '}</Bubble>
            </MessageRow>
          )}
          {messages.map((message) => (
            <MessageRow key={message.id} $from={message.from}>
              {message.from === 'bot' && <Avatar $dark={darkMode}>{initials}</Avatar>}
              <Bubble $from={message.from} $dark={darkMode}>{message.text}</Bubble>
            </MessageRow>
          ))}
          {isTyping && (
            <MessageRow $from="bot">
              <Avatar $dark={darkMode}>{initials}</Avatar>
              <TypingBubble aria-label={`${profile.firstName} is typing`} $dark={darkMode}>
                <span />
                <span />
                <span />
              </TypingBubble>
            </MessageRow>
          )}
        </Transcript>
      </Hero>

      <BottomStack $show={introDone}>
        <Suggestions aria-label="Suggested questions">
          {topics.map((topic) => (
            <SuggestionButton
              key={topic.id}
              type="button"
              onClick={() => sendPrompt(topic.prompt)}
              disabled={isTyping}
              $dark={darkMode}
            >
              {topic.label}
            </SuggestionButton>
          ))}
        </Suggestions>

        <Composer onSubmit={handleSubmit} $dark={darkMode}>
          <ComposerInput
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about the resume"
            aria-label="Ask about the resume"
            $dark={darkMode}
          />
          <SendButton type="submit" disabled={!input.trim() || isTyping} aria-label="Send message">
            <ArrowUp size={18} strokeWidth={3} />
          </SendButton>
        </Composer>
      </BottomStack>
    </Page>
  );
}

const blink = keyframes`
  50% { opacity: 0; }
`;

const caretFlash = keyframes`
  0% { opacity: 0; transform: translateX(-4px) scaleX(0.6); }
  12% { opacity: 1; transform: translateX(2px) scaleX(1); }
  100% { opacity: 0; transform: translateX(4px) scaleX(1); }
`;

const typingDot = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.42; }
  40% { transform: translateY(-4px); opacity: 1; }
`;

const Page = styled.main`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 18px 210px;
  background: ${({ $dark }) => ($dark ? '#0f1115' : '#fff')};
  color: ${({ $dark }) => ($dark ? '#e6e6e6' : '#0b0b0c')};
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Helvetica, Arial, sans-serif;
  transition: background 0.25s ease, color 0.25s ease;

  @media (max-width: 680px) {
    padding: 82px 14px 188px;
  }
`;

const TopNav = styled.nav`
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: translateY(${({ $show }) => ($show ? '0' : '-6px')});
  pointer-events: ${({ $show }) => ($show ? 'auto' : 'none')};
  transition: opacity 520ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
`;

const MutedNavItem = styled.span`
  color: ${({ $dark }) => ($dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)')};
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;

  @media (max-width: 560px) {
    display: none;
  }
`;

const TextLink = styled.a`
  color: ${({ $dark }) => ($dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.72)')};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 999px;
  transition: background-color 180ms ease, color 180ms ease;

  &:hover {
    background: ${({ $dark }) => ($dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
    color: ${({ $dark }) => ($dark ? '#fff' : '#000')};
  }
`;

const Hero = styled.header`
  width: min(720px, 92vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  text-align: left;
  transform: translateY(-5vh);
`;

const NameLine = styled.h1`
  min-height: 1.05em;
  margin: 0;
  text-align: center;
  font-size: clamp(2.75rem, 9vw, 5rem);
  line-height: 0.98;
  font-weight: 520;
  letter-spacing: 0;
`;

const Caret = styled.span`
  position: relative;
  display: inline-block;
  width: 4px;
  height: 0.86em;
  margin-left: 4px;
  transform: translateY(0.12em);
  background: #1a89ff;
  animation: ${({ $typing }) => ($typing ? 'none' : blink)} 1s steps(1) infinite;

  &::before {
    content: "";
    position: absolute;
    right: 100%;
    top: 0;
    width: 0.8em;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transform: translateX(2px);
    background: linear-gradient(
      to right,
      rgba(26, 137, 255, 0) 0%,
      rgba(26, 137, 255, 0.28) 85%,
      rgba(26, 137, 255, 0.5) 100%
    );
    animation: ${({ $flash }) => ($flash ? caretFlash : 'none')} 700ms ease-out;
  }
`;

const Transcript = styled.div`
  width: 100%;
  max-width: 620px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 6px 4px;
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  align-self: ${({ $from }) => ($from === 'user' ? 'flex-end' : 'flex-start')};
  max-width: min(600px, 92%);
  opacity: ${({ $visible = true }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible = true }) => ($visible ? '0' : '12px')});
  transition: opacity 340ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ $dark }) => ($dark ? 'linear-gradient(145deg, #2a2d35, #4a4f5a)' : 'linear-gradient(145deg, #111, #565656)')};
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
`;

const Bubble = styled.div`
  position: relative;
  max-width: 100%;
  padding: 10px 15px;
  border-radius: 22px;
  background: ${({ $from, $dark }) =>
    $from === 'user' ? '#1a89ff' : ($dark ? '#252830' : '#efefef')};
  color: ${({ $from, $dark }) =>
    $from === 'user' ? '#fff' : ($dark ? '#e6e6e6' : '#0b0b0c')};
  font-size: 15px;
  line-height: 1.38;
  word-break: break-word;
  white-space: pre-wrap;

  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    ${({ $from }) => ($from === 'user' ? 'right: 7px;' : 'left: 7px;')}
    width: 15px;
    height: 15px;
    background: inherit;
    border-bottom-left-radius: ${({ $from }) => ($from === 'user' ? '16px' : '2px')};
    border-bottom-right-radius: ${({ $from }) => ($from === 'user' ? '2px' : '16px')};
    transform: rotate(42deg);
  }
`;

const BottomStack = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 4;
  width: min(620px, calc(100vw - 28px));
  transform: translate(-50%, ${({ $show }) => ($show ? '0' : '12px')});
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  pointer-events: ${({ $show }) => ($show ? 'auto' : 'none')};
  transition: opacity 520ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
`;

const TypingBubble = styled(Bubble)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 58px;
  min-height: 40px;

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $dark }) => ($dark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)')};
    animation: ${typingDot} 1.1s ease-in-out infinite;
  }

  span:nth-child(2) {
    animation-delay: 120ms;
  }

  span:nth-child(3) {
    animation-delay: 240ms;
  }
`;

const Suggestions = styled.div`
  max-width: 100%;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 3px;
`;

const SuggestionButton = styled.button`
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: ${({ $dark }) => ($dark ? '#1e2129' : '#efefef')};
  color: ${({ $dark }) => ($dark ? '#5ba7f5' : '#1a73d9')};
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease;

  &:hover:not(:disabled) {
    background: ${({ $dark }) => ($dark ? '#262b36' : '#e7e7e7')};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.48;
    cursor: default;
  }
`;

const Composer = styled.form`
  width: min(390px, 100%);
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 5px 5px 5px 18px;
  border-radius: 999px;
  background: ${({ $dark }) => ($dark ? 'rgba(30,33,41,0.92)' : 'rgba(239,239,239,0.92)')};
  box-shadow: inset 0 0 0 1px ${({ $dark }) => ($dark ? '#2e3240' : '#f8f8f8')};
  backdrop-filter: blur(20px) saturate(160%);
`;

const ComposerInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${({ $dark }) => ($dark ? '#e6e6e6' : '#111')};
  font: inherit;
  font-size: 15px;

  &::placeholder {
    color: ${({ $dark }) => ($dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.44)')};
  }
`;

const SendButton = styled.button`
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: #1a89ff;
  color: #fff;
  cursor: pointer;
  transition: transform 160ms ease, opacity 160ms ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.42;
    cursor: default;
  }
`;
