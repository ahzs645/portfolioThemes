import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import hackRegular from './assets/hack-regular-subset.woff2';
import hackItalic from './assets/hack-italic-subset.woff2';

const C = {
  bg: '#212529',
  punct: '#2b8a3e',
  key: '#51cf66',
  value: '#51cf66',
  hover: '#5c940d',
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "hack";
    font-display: swap;
    font-style: normal;
    font-weight: 400;
    src: url(${hackRegular}) format("woff2");
  }
  @font-face {
    font-family: "hack";
    font-display: swap;
    font-style: italic;
    font-weight: 400;
    src: url(${hackItalic}) format("woff2");
  }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const Wrapper = styled.div`
  flex: 1;
  background: ${C.bg};
  font-family: "hack", monospace;
  font-size: 16px;
  font-weight: 400;
  color: ${C.punct};
  display: flex;
  align-items: center;
  justify-content: center;
  @media (min-width: 576px) { font-size: 18px; }
  @media (min-width: 768px) { font-size: 20px; }
  *, *::before, *::after { box-sizing: border-box; }
  h1, p { margin: 0; }
`;

const Main = styled.main`
  width: 98%;
  @media (min-width: 576px) { width: 90%; }
  @media (min-width: 768px) { width: 80%; }
`;

const JsonBlock = styled.div`
  &::before { content: "{"; }
  &::after  { content: "}"; }
`;

const Row = styled.div`
  margin: 1rem 0;
  margin-left: 1.5rem;
`;

const Indent = styled.p`
  margin: 0;
  margin-left: 1.5rem;
`;

const Key = styled.span`
  color: ${C.key};
  text-transform: lowercase;
`;

const Value = styled.span`
  color: ${C.value};
  text-transform: lowercase;
`;

const Link = styled.a`
  color: ${C.value};
  text-transform: lowercase;
  font-style: italic;
  text-decoration: none;
  transition: color 0.2s;
  &:hover, &:active { color: ${C.hover}; }
`;

const Cursor = styled.span`
  animation: ${blink} 0.7s step-end infinite;
  color: ${C.value};
`;

const Q = '"';

function useTyped(strings, { typeSpeed = 30, backSpeed = 10, backDelay = 1000 } = {}) {
  const [text, setText] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    if (!strings || strings.length === 0) return;
    let charPos = 0;
    let deleting = false;
    let timer;

    function tick() {
      const current = strings[idx.current];
      if (!deleting) {
        charPos++;
        setText(current.slice(0, charPos));
        if (charPos >= current.length) {
          deleting = true;
          timer = setTimeout(tick, backDelay);
          return;
        }
        timer = setTimeout(tick, typeSpeed);
      } else {
        charPos--;
        setText(current.slice(0, charPos));
        if (charPos <= 0) {
          deleting = false;
          idx.current = (idx.current + 1) % strings.length;
          timer = setTimeout(tick, typeSpeed);
          return;
        }
        timer = setTimeout(tick, backSpeed);
      }
    }

    timer = setTimeout(tick, typeSpeed);
    return () => clearTimeout(timer);
  }, [strings, typeSpeed, backSpeed, backDelay]);

  return text;
}

function StringPair({ k, v, url, comma }) {
  return (
    <Row>
      {Q}<Key>{k}</Key>{Q}:{' '}
      {url
        ? <>{Q}<Link href={url} target="_blank" rel="noopener noreferrer">{v}</Link>{Q}</>
        : <>{Q}<Value>{v}</Value>{Q}</>}
      {comma && ','}
    </Row>
  );
}

const TypedRow = styled(Row)`
  position: relative;
`;

const TypedPlaceholder = styled.span`
  visibility: hidden;
  display: block;
  height: 0;
  overflow: hidden;
`;

function TypedPair({ k, strings, comma }) {
  const text = useTyped(strings);
  const longest = useMemo(
    () => (strings || []).reduce((a, b) => (a.length >= b.length ? a : b), ''),
    [strings]
  );
  const prefix = `${Q}${k}${Q}: ${Q}`;
  return (
    <TypedRow>
      <TypedPlaceholder aria-hidden="true">{prefix}{longest}{Q}</TypedPlaceholder>
      {Q}<Key>{k}</Key>{Q}:{' '}
      {Q}<Value>{text}</Value><Cursor>|</Cursor>{Q}
      {comma && ','}
    </TypedRow>
  );
}

function ArrayBlock({ k, items, comma }) {
  return (
    <Row>
      {Q}<Key>{k}</Key>{Q}: [
      {items.map((item, i) => (
        <Indent key={i}>
          {item.url
            ? <>{Q}<Link href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</Link>{Q}</>
            : <>{Q}<Value>{item.label}</Value>{Q}</>}
          {i < items.length - 1 && ','}
        </Indent>
      ))}
      ]{comma && ','}
    </Row>
  );
}

function HashBlock({ k, entries, comma }) {
  return (
    <Row>
      {Q}<Key>{k}</Key>{Q}: {'{'}{' '}
      {entries.map((e, i) => (
        <Indent key={i}>
          {Q}<Key>{e.key}</Key>{Q}:{' '}
          {e.url
            ? <>{Q}<Link href={e.url} target="_blank" rel="noopener noreferrer">{e.value}</Link>{Q}</>
            : <>{Q}<Value>{e.value}</Value>{Q}</>}
          {i < entries.length - 1 && ','}
        </Indent>
      ))}
      {'}'}{comma && ','}
    </Row>
  );
}

export function HackedJekyllTheme() {
  const { cvData } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const sections = cv.sections || {};
  const social = cv.social || [];
  const experience = sections.experience || [];
  const education = sections.education || [];

  const typedStrings = useMemo(() => {
    const lines = [];
    for (const e of experience) {
      const title = e.positions?.[0]?.title || e.position;
      if (title && !lines.includes(title)) lines.push(title);
      if (lines.length >= 3) break;
    }
    if (education[0]?.degree && education[0]?.area) {
      lines.push(`${education[0].degree} – ${education[0].area}`);
    }
    if (lines.length === 0) lines.push('hello!');
    return lines;
  }, [experience, education]);

  const contact = useMemo(() => {
    const entries = [];
    if (cv.email) entries.push({ key: 'email', value: cv.email, url: `mailto:${cv.email}` });
    if (cv.phone) entries.push({ key: 'phone', value: cv.phone });
    if (cv.website) entries.push({ key: 'website', value: cv.website.replace(/^https?:\/\//, ''), url: cv.website });
    return entries;
  }, [cv]);

  const profiles = useMemo(() =>
    social.map(s => ({ label: s.network || s.username, url: s.url })),
    [social]
  );

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Main>
          <JsonBlock>
            <StringPair k="name" v={cv.name || 'Your Name'} comma />
            <TypedPair k="description" strings={typedStrings} comma />
            <StringPair k="location" v={cv.location || ''} comma />
            {contact.length > 0 && <HashBlock k="contact" entries={contact} comma={profiles.length > 0} />}
            {profiles.length > 0 && <ArrayBlock k="profiles" items={profiles} comma={false} />}
          </JsonBlock>
        </Main>
      </Wrapper>
    </>
  );
}
