import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatMonthYear } from '../../utils/cvHelpers';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body.benissen-theme-locked { overflow: hidden; }
  .benissen-theme ::selection { background: #3a3a3a; color: #fff; }
`;

const COLORS = {
  bg: '#1c1c1c',
  panel: '#202020',
  panelAlt: '#262626',
  border: '#2f2f2f',
  borderSoft: '#262626',
  text: '#ECECEC',
  textMid: '#bdbdbd',
  textMuted: '#7a7a7a',
  accent: '#ffffff',
  bubbleUser: '#2f2f2f',
  bubbleAi: 'transparent',
  link: '#cfcfcf',
  pill: '#272727',
  pillHover: '#303030',
};

const blink = keyframes`
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Shell = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: ${COLORS.bg};
  color: ${COLORS.text};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.55;
  overflow: hidden;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: ${COLORS.panel};
  border-right: 1px solid ${COLORS.border};
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 820px) {
    position: fixed;
    inset: 0 auto 0 0;
    width: 280px;
    z-index: 50;
    transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
    transition: transform 220ms ease;
    box-shadow: ${(p) => (p.$open ? '0 0 60px rgba(0,0,0,0.6)' : 'none')};
  }
`;

const SidebarTop = styled.div`
  padding: 14px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
`;

const Logo = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff, #b8b8b8);
  color: #1c1c1c;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: -0.02em;
`;

const BrandName = styled.div`
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid ${COLORS.border};
  border-radius: 10px;
  color: ${COLORS.text};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;

  &:hover {
    background: ${COLORS.pillHover};
    border-color: #3a3a3a;
  }

  span.icon {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    color: ${COLORS.textMid};
  }
`;

const SidebarSection = styled.div`
  padding: 6px 12px 0;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
`;

const SidebarLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${COLORS.textMuted};
  padding: 16px 8px 6px;
`;

const ConvoItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 9px 10px;
  background: ${(p) => (p.$active ? COLORS.pillHover : 'transparent')};
  border: none;
  border-radius: 8px;
  color: ${(p) => (p.$active ? COLORS.text : COLORS.textMid)};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  margin-bottom: 2px;

  &:hover {
    background: ${COLORS.pillHover};
    color: ${COLORS.text};
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => (p.$active ? '#fff' : '#555')};
    flex-shrink: 0;
  }

  .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SidebarFoot = styled.div`
  border-top: 1px solid ${COLORS.border};
  padding: 12px;
`;

const UserPill = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: ${COLORS.text};
  transition: background 120ms ease;

  &:hover { background: ${COLORS.pillHover}; }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #444, #2a2a2a);
    display: grid;
    place-items: center;
    font-weight: 600;
    font-size: 13px;
    color: #fff;
    overflow: hidden;
  }

  .meta {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
  }

  .name { font-weight: 600; font-size: 13px; }
  .sub  { font-size: 11px; color: ${COLORS.textMuted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const Main = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid ${COLORS.borderSoft};
  background: ${COLORS.bg};
`;

const TopTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;

  .badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${COLORS.textMuted};
    border: 1px solid ${COLORS.border};
    padding: 3px 7px;
    border-radius: 999px;
  }
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconBtn = styled.button`
  background: transparent;
  border: 1px solid ${COLORS.border};
  color: ${COLORS.textMid};
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover { background: ${COLORS.pillHover}; color: ${COLORS.text}; }
`;

const MenuBtn = styled(IconBtn)`
  display: none;
  @media (max-width: 820px) { display: grid; }
`;

const ChatScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #2e2e2e transparent;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 4px; }
`;

const ChatInner = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 140px;

  @media (max-width: 820px) {
    padding: 24px 16px 160px;
  }
`;

const Greeting = styled.div`
  text-align: center;
  padding: 60px 0 36px;
  animation: ${fadeUp} 500ms ease both;

  .hi {
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 600;
    letter-spacing: -0.02em;
    background: linear-gradient(180deg, #ffffff, #9c9c9c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 8px;
  }

  .sub {
    color: ${COLORS.textMuted};
    font-size: 14px;
  }
`;

const ChipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Chip = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  padding: 14px 14px;
  background: ${COLORS.panel};
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  color: ${COLORS.text};
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
  animation: ${fadeUp} 400ms ease both;
  animation-delay: ${(p) => (p.$i || 0) * 50}ms;

  &:hover {
    background: ${COLORS.pillHover};
    border-color: #3a3a3a;
    transform: translateY(-1px);
  }

  .icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: ${COLORS.textMid};
    margin-top: 1px;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .q { font-weight: 600; }
  .h { color: ${COLORS.textMuted}; font-size: 12px; }
`;

const Message = styled.div`
  display: flex;
  gap: 14px;
  padding: 22px 0;
  border-bottom: 1px solid ${COLORS.borderSoft};
  animation: ${fadeUp} 320ms ease both;

  &:last-child { border-bottom: none; }

  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 600;
    overflow: hidden;
    background: ${(p) => (p.$role === 'user' ? '#444' : 'linear-gradient(135deg,#fff,#bdbdbd)')};
    color: ${(p) => (p.$role === 'user' ? '#fff' : '#1c1c1c')};
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .role {
    font-size: 12px;
    font-weight: 600;
    color: ${COLORS.textMid};
    margin-bottom: 4px;
  }

  .content {
    color: ${COLORS.text};
    font-size: 14px;
    line-height: 1.7;
  }

  p { margin: 0 0 10px; }
  p:last-child { margin-bottom: 0; }
`;

const Typing = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 6px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.textMid};
    animation: ${blink} 1.2s infinite ease-in-out;
  }
  span:nth-child(2) { animation-delay: 0.15s; }
  span:nth-child(3) { animation-delay: 0.3s; }
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ItemRow = styled.li`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: ${COLORS.panel};
  border: 1px solid ${COLORS.border};
  border-radius: 10px;

  .head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .title { font-weight: 600; font-size: 13.5px; color: ${COLORS.text}; }
  .meta  { font-size: 11.5px; color: ${COLORS.textMuted}; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .sub   { font-size: 12.5px; color: ${COLORS.textMid}; }
  .desc  { font-size: 13px; color: ${COLORS.textMid}; margin-top: 4px; line-height: 1.55; }

  ul.bul {
    list-style: none;
    padding: 0;
    margin: 6px 0 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  ul.bul li {
    font-size: 12.5px;
    color: ${COLORS.textMid};
    padding-left: 14px;
    position: relative;
    line-height: 1.5;
  }
  ul.bul li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 9px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #555;
  }
`;

const TagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

const Tag = styled.span`
  background: ${COLORS.panel};
  border: 1px solid ${COLORS.border};
  color: ${COLORS.textMid};
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 4px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ContactCard = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: ${COLORS.panel};
  border: 1px solid ${COLORS.border};
  border-radius: 10px;
  color: ${COLORS.text};
  text-decoration: none;
  transition: background 140ms ease, border-color 140ms ease;

  &:hover {
    background: ${COLORS.pillHover};
    border-color: #3a3a3a;
  }

  .ico {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${COLORS.panelAlt};
    display: grid;
    place-items: center;
    color: ${COLORS.text};
    flex-shrink: 0;
  }

  .col { display: flex; flex-direction: column; min-width: 0; }
  .lbl { font-size: 12.5px; font-weight: 600; }
  .sub { font-size: 11.5px; color: ${COLORS.textMuted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const Composer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 24px 22px;
  background: linear-gradient(180deg, transparent 0%, ${COLORS.bg} 35%);
  pointer-events: none;
`;

const ComposerInner = styled.div`
  max-width: 760px;
  margin: 0 auto;
  pointer-events: auto;
  background: ${COLORS.panel};
  border: 1px solid ${COLORS.border};
  border-radius: 16px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 14px;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.4);

  textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    color: ${COLORS.text};
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    min-height: 22px;
    max-height: 140px;
    padding: 4px 0;

    &::placeholder { color: ${COLORS.textMuted}; }
  }

  .send {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: ${COLORS.text};
    color: ${COLORS.bg};
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 140ms ease;

    &:disabled { opacity: 0.35; cursor: not-allowed; }
  }
`;

const Hint = styled.div`
  text-align: center;
  font-size: 11px;
  color: ${COLORS.textMuted};
  margin-top: 8px;
`;

const Backdrop = styled.div`
  display: none;
  @media (max-width: 820px) {
    display: ${(p) => (p.$open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 40;
  }
`;

function Icon({ name, size = 16 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'plus':
      return <svg {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case 'edit':
      return <svg {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>;
    case 'send':
      return <svg {...props}><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>;
    case 'menu':
      return <svg {...props}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
    case 'close':
      return <svg {...props}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>;
    case 'user':
      return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'briefcase':
      return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
    case 'sparkles':
      return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>;
    case 'cap':
      return <svg {...props}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>;
    case 'tag':
      return <svg {...props}><path d="M20.59 13.41 12 22l-9-9 8.59-8.59A2 2 0 0 1 13 4h7v7a2 2 0 0 1-.41 1.41Z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
    case 'mail':
      return <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>;
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /></svg>;
    case 'github':
      return <svg {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
    case 'linkedin':
      return <svg {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
    case 'pin':
      return <svg {...props}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
    default:
      return null;
  }
}

function fmtRange(item) {
  const start = formatMonthYear(item?.startDate);
  const end = formatMonthYear(item?.endDate);
  if (!start && !end) return '';
  if (!end) return start;
  return `${start} — ${end}`;
}

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'AI';
}

function networkIcon(network = '') {
  const n = network.toLowerCase();
  if (n.includes('github')) return 'github';
  if (n.includes('linked')) return 'linkedin';
  if (n.includes('mail') || n.includes('email')) return 'mail';
  return 'globe';
}

export function BenIssenTheme() {
  const cv = useCV();
  const [activeId, setActiveId] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);
  const thinkTimer = useRef(null);

  const initials = useMemo(() => getInitials(cv?.name || 'AI'), [cv?.name]);
  const firstName = (cv?.name || '').split(/\s+/)[0] || 'me';
  const cloneName = `${firstName}GPT`;

  const conversations = useMemo(() => {
    if (!cv) return [];
    const list = [];

    if (cv.about) {
      list.push({
        id: 'about',
        icon: 'sparkles',
        question: `Who is ${firstName}?`,
        sidebar: 'About me',
        hint: 'A quick intro',
        render: () => (
          <div className="content">
            <p>{cv.about}</p>
            {cv.location && (
              <p style={{ color: COLORS.textMid, fontSize: 13 }}>
                <Icon name="pin" size={13} /> Based in {cv.location}.
              </p>
            )}
          </div>
        ),
      });
    }

    if (cv.experience?.length) {
      list.push({
        id: 'experience',
        icon: 'briefcase',
        question: 'What have you been working on?',
        sidebar: 'Experience',
        hint: 'Roles & companies',
        render: () => (
          <div className="content">
            <p>Here are the roles I've been doing recently:</p>
            <ItemList>
              {cv.experience.slice(0, 8).map((e, i) => (
                <ItemRow key={i}>
                  <div className="head">
                    <div className="title">{e.title}{e.company ? ` · ${e.company}` : ''}</div>
                    <div className="meta">{fmtRange(e)}</div>
                  </div>
                  {e.location && <div className="sub">{e.location}</div>}
                  {e.highlights?.length > 0 && (
                    <ul className="bul">
                      {e.highlights.slice(0, 3).map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  )}
                </ItemRow>
              ))}
            </ItemList>
          </div>
        ),
      });
    }

    if (cv.projects?.length) {
      list.push({
        id: 'projects',
        icon: 'sparkles',
        question: 'What have you built?',
        sidebar: 'Projects',
        hint: 'Things I made',
        render: () => (
          <div className="content">
            <p>A few projects I've shipped:</p>
            <ItemList>
              {cv.projects.slice(0, 10).map((p, i) => (
                <ItemRow key={i}>
                  <div className="head">
                    <div className="title">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ color: COLORS.text, textDecoration: 'none', borderBottom: `1px dashed ${COLORS.textMuted}` }}>
                          {p.name}
                        </a>
                      ) : p.name}
                    </div>
                    <div className="meta">{fmtRange(p)}</div>
                  </div>
                  {p.description && <div className="desc">{p.description}</div>}
                </ItemRow>
              ))}
            </ItemList>
          </div>
        ),
      });
    }

    if (cv.education?.length) {
      list.push({
        id: 'education',
        icon: 'cap',
        question: 'Where did you study?',
        sidebar: 'Education',
        hint: 'School & degrees',
        render: () => (
          <div className="content">
            <ItemList>
              {cv.education.map((e, i) => (
                <ItemRow key={i}>
                  <div className="head">
                    <div className="title">{e.school || e.institution}</div>
                    <div className="meta">{fmtRange({ startDate: e.start_date, endDate: e.end_date })}</div>
                  </div>
                  {(e.degree || e.area) && <div className="sub">{[e.degree, e.area].filter(Boolean).join(' · ')}</div>}
                </ItemRow>
              ))}
            </ItemList>
          </div>
        ),
      });
    }

    if (cv.skills?.length) {
      const flatSkills = [];
      cv.skills.forEach((s) => {
        if (typeof s === 'string') flatSkills.push(s);
        else if (s?.label) flatSkills.push(s.label);
        else if (s?.name) flatSkills.push(s.name);
        if (Array.isArray(s?.details)) s.details.forEach((d) => flatSkills.push(d));
      });
      if (flatSkills.length) {
        list.push({
          id: 'skills',
          icon: 'tag',
          question: 'What are you skilled at?',
          sidebar: 'Skills',
          hint: 'Tools & abilities',
          render: () => (
            <div className="content">
              <p>Here's what I bring to the table:</p>
              <TagWrap>
                {flatSkills.slice(0, 40).map((s, i) => (
                  <Tag key={i}>{s}</Tag>
                ))}
              </TagWrap>
            </div>
          ),
        });
      }
    }

    const contactItems = [];
    if (cv.email) contactItems.push({ network: 'Email', label: cv.email, url: `mailto:${cv.email}` });
    (cv.socialRaw || []).forEach((s) => {
      if (s?.url) contactItems.push({ network: s.network, label: s.username || s.network, url: s.url });
    });
    if (cv.website) contactItems.push({ network: 'Website', label: cv.website.replace(/^https?:\/\//, ''), url: cv.website });

    if (contactItems.length) {
      list.push({
        id: 'contact',
        icon: 'mail',
        question: 'How can I reach you?',
        sidebar: 'Contact',
        hint: 'Get in touch',
        render: () => (
          <div className="content">
            <p>The fastest ways to find me:</p>
            <ContactGrid>
              {contactItems.map((c, i) => (
                <ContactCard key={i} href={c.url} target="_blank" rel="noreferrer">
                  <div className="ico"><Icon name={networkIcon(c.network)} size={15} /></div>
                  <div className="col">
                    <div className="lbl">{c.network}</div>
                    <div className="sub">{c.label}</div>
                  </div>
                </ContactCard>
              ))}
            </ContactGrid>
          </div>
        ),
      });
    }

    return list;
  }, [cv, firstName]);

  useEffect(() => {
    document.body.classList.add('benissen-theme-locked');
    return () => document.body.classList.remove('benissen-theme-locked');
  }, []);

  useEffect(() => {
    return () => {
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, thinking]);

  const handleAsk = (id) => {
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    setActiveId(id);
    setThinking(true);
    setSidebarOpen(false);
    thinkTimer.current = setTimeout(() => setThinking(false), 700);
  };

  const handleNew = () => {
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    setActiveId(null);
    setThinking(false);
  };

  if (!cv) {
    return (
      <Shell className="benissen-theme">
        <GlobalStyle />
        <div style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', color: COLORS.textMid }}>
          Loading…
        </div>
      </Shell>
    );
  }

  const active = conversations.find((c) => c.id === activeId);

  return (
    <>
      <GlobalStyle />
      <Shell className="benissen-theme">
        <Backdrop $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />

        <Sidebar $open={sidebarOpen}>
          <SidebarTop>
            <Brand>
              <Logo>{initials}</Logo>
              <BrandName>{cloneName}</BrandName>
            </Brand>
            <NewChatButton onClick={handleNew}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="icon"><Icon name="edit" size={15} /></span>
                New chat
              </span>
              <span className="icon"><Icon name="plus" size={14} /></span>
            </NewChatButton>
          </SidebarTop>

          <SidebarSection>
            <SidebarLabel>Conversations</SidebarLabel>
            {conversations.map((c) => (
              <ConvoItem
                key={c.id}
                $active={activeId === c.id}
                onClick={() => handleAsk(c.id)}
              >
                <span className="dot" />
                <span className="label">{c.sidebar}</span>
              </ConvoItem>
            ))}
          </SidebarSection>

          <SidebarFoot>
            <UserPill href={cv.email ? `mailto:${cv.email}` : '#'}>
              <div className="avatar">
                {cv.avatar ? (
                  <img src={cv.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div className="meta">
                <div className="name">{cv.name}</div>
                {cv.currentJobTitle && <div className="sub">{cv.currentJobTitle}</div>}
              </div>
            </UserPill>
          </SidebarFoot>
        </Sidebar>

        <Main>
          <TopBar>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MenuBtn onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <Icon name="menu" size={16} />
              </MenuBtn>
              <TopTitle>
                {cloneName}
                <span className="badge">Beta</span>
              </TopTitle>
            </div>
            <TopActions>
              <IconBtn onClick={handleNew} aria-label="New chat">
                <Icon name="edit" size={15} />
              </IconBtn>
            </TopActions>
          </TopBar>

          <ChatScroll ref={scrollRef}>
            <ChatInner>
              {!active ? (
                <>
                  <Greeting>
                    <div className="hi">Hi, I'm {firstName}'s AI clone.</div>
                    <div className="sub">
                      Ask me anything about {firstName}'s work, projects, or background.
                    </div>
                  </Greeting>
                  <ChipGrid>
                    {conversations.map((c, i) => (
                      <Chip key={c.id} $i={i} onClick={() => handleAsk(c.id)}>
                        <div className="icon"><Icon name={c.icon} size={18} /></div>
                        <div className="text">
                          <div className="q">{c.question}</div>
                          <div className="h">{c.hint}</div>
                        </div>
                      </Chip>
                    ))}
                  </ChipGrid>
                </>
              ) : (
                <>
                  <Message $role="user">
                    <div className="avatar"><Icon name="user" size={15} /></div>
                    <div className="body">
                      <div className="role">You</div>
                      <div className="content"><p>{active.question}</p></div>
                    </div>
                  </Message>
                  <Message $role="assistant">
                    <div className="avatar">{initials}</div>
                    <div className="body">
                      <div className="role">{cloneName}</div>
                      {thinking ? (
                        <Typing><span /><span /><span /></Typing>
                      ) : (
                        active.render()
                      )}
                    </div>
                  </Message>
                </>
              )}
            </ChatInner>
          </ChatScroll>

          <Composer>
            <ComposerInner>
              <textarea
                rows={1}
                placeholder={`Message ${cloneName}…`}
                readOnly
                onFocus={(e) => e.target.blur()}
              />
              <button className="send" disabled aria-label="Send">
                <Icon name="send" size={15} />
              </button>
            </ComposerInner>
            <Hint>Pick a suggestion above — this is a static demo of {cloneName}.</Hint>
          </Composer>
        </Main>
      </Shell>
    </>
  );
}
