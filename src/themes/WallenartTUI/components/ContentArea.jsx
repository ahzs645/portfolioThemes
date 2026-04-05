import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { colors, randomAccent } from '../utils/tokens';
import { formatMonthYear } from '../../../utils/cvHelpers';

export function ContentArea({ cv, sectionIndex, itemIndex }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [sectionIndex, itemIndex]);

  return (
    <ContentWrap>
      <ContentBox>
        <ScrollableContent ref={scrollRef} data-scroll-content>
          {sectionIndex === 0 && <HomeView cv={cv} />}
          {sectionIndex === 1 && (
            <ExperienceView item={cv.experience[itemIndex]} />
          )}
          {sectionIndex === 2 && (
            <ProjectView item={cv.projects[itemIndex]} />
          )}
          {sectionIndex === 3 && <SkillView item={cv.skills[itemIndex]} />}
        </ScrollableContent>
      </ContentBox>
    </ContentWrap>
  );
}

function HomeView({ cv }) {
  const nameColor = useMemo(() => randomAccent(), []);
  const titleColor = useMemo(() => randomAccent(), []);

  const aboutParagraphs = cv.about
    ? cv.about.split(/\n\n+/).filter(Boolean)
    : [];

  return (
    <ContentPadding>
      <ContentInner>
        <div>
          <p>
            Hi, I'm <AccentSpan $color={nameColor}>{cv.name}</AccentSpan>
          </p>
          {cv.currentJobTitle && (
            <p>
              A <AccentSpan $color={titleColor}>{cv.currentJobTitle}</AccentSpan>
              {cv.location ? ` based in ${cv.location}.` : '.'}
            </p>
          )}
        </div>

        {aboutParagraphs.map((para, i) => (
          <div key={i}>
            <p>{para}</p>
          </div>
        ))}

        <SocialBlock cv={cv} />

        <DesktopHelp>
          <p>
            <AccentSpan $color={colors.pink}>Click</AccentSpan> on a section on
            the left to learn more about my{' '}
            <AccentSpan $color={colors.blue}>work</AccentSpan> and past{' '}
            <AccentSpan $color={colors.orange}>experiences</AccentSpan>.
          </p>
          <p>
            You can also <AccentSpan $color={colors.orange}>navigate</AccentSpan>{' '}
            through the sections using the{' '}
            <AccentSpan $color={colors.blue}>arrow keys</AccentSpan> or{' '}
            <AccentSpan $color={colors.orange}>Vim motions</AccentSpan>.
          </p>
        </DesktopHelp>
      </ContentInner>
    </ContentPadding>
  );
}

function SocialBlock({ cv }) {
  const links = cv.socialLinks;
  const items = [
    { url: links.github, label: 'GitHub', color: colors.pink },
    { url: links.twitter, label: 'X (Twitter)', color: colors.orange },
    { url: links.linkedin, label: 'LinkedIn', color: colors.blue },
    { url: links.website, label: 'Website', color: colors.lightBlue },
  ].filter((l) => l.url);

  if (items.length === 0) return null;

  return (
    <div>
      {items.map((item, i) => (
        <p key={i}>
          Find me on{' '}
          <SocialLink href={item.url} target="_blank" $color={item.color}>
            {item.label}
          </SocialLink>
          .
        </p>
      ))}
    </div>
  );
}

function ExperienceView({ item }) {
  const titleColor = useMemo(() => randomAccent(), [item]);
  const dateColor = useMemo(() => randomAccent(), [item]);

  if (!item) return null;

  const dateRange = [
    formatMonthYear(item.startDate),
    item.isCurrent ? 'Present' : formatMonthYear(item.endDate),
  ]
    .filter(Boolean)
    .join(' – ');

  return (
    <ContentPadding>
      <ContentInner>
        <div>
          <ContentTitle>
            <AccentSpan $color={titleColor}>
              {item.title} @ {item.company}
            </AccentSpan>
          </ContentTitle>
          {dateRange && (
            <ContentSubtitle>
              <AccentSpan $color={dateColor}>{dateRange}</AccentSpan>
            </ContentSubtitle>
          )}
        </div>

        {item.highlights?.length > 0 && (
          <HighlightsList>
            {item.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </HighlightsList>
        )}
      </ContentInner>
    </ContentPadding>
  );
}

function ProjectView({ item }) {
  const nameColor = useMemo(() => randomAccent(), [item]);

  if (!item) return null;

  return (
    <ContentPadding>
      <ContentInner>
        <div>
          <ContentTitle>
            <AccentSpan $color={nameColor}>{item.name}</AccentSpan>
          </ContentTitle>
          {item.date && (
            <ContentSubtitle>
              [Built in{' '}
              <AccentSpan $color={randomAccent()}>{item.date}</AccentSpan>]
            </ContentSubtitle>
          )}
        </div>

        {item.summary && <p>{item.summary}</p>}

        {item.highlights?.length > 0 && (
          <HighlightsList>
            {item.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </HighlightsList>
        )}

        <ButtonRow>
          {item.url && (
            <ProjectButton href={item.url} target="_blank">
              View Project
            </ProjectButton>
          )}
          {item.repo && (
            <ProjectButton href={item.repo} target="_blank">
              GitHub
            </ProjectButton>
          )}
        </ButtonRow>
      </ContentInner>
    </ContentPadding>
  );
}

function SkillView({ item }) {
  if (!item) return null;
  const name = typeof item === 'string' ? item : item.name;
  const details = typeof item === 'string' ? null : item.details;
  const color = useMemo(() => randomAccent(), [item]);

  return (
    <ContentPadding>
      <ContentInner>
        <ContentTitle>
          <AccentSpan $color={color}>{name}</AccentSpan>
        </ContentTitle>
        {details && <p>{details}</p>}
      </ContentInner>
    </ContentPadding>
  );
}

/* --- Styled Components --- */

const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 75%;
  min-height: 0;

  @media (max-width: 768px) {
    width: 100%;
    padding-top: 1rem;
  }
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.1px solid ${colors.primaryText};
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  line-height: 1.5rem;
  padding: 2rem;
  height: 100%;

  scrollbar-width: thin;
  scrollbar-color: ${colors.primaryText} ${colors.primaryBg};

  &::-webkit-scrollbar {
    width: 0.4em;
    background-color: ${colors.primaryBg};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${colors.primaryText};
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 1rem;
  }
`;

const ContentPadding = styled.div`
  width: 100%;
  max-width: 800px;
`;

const ContentInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AccentSpan = styled.span`
  color: ${(p) => p.$color};
`;

const SocialLink = styled.a`
  color: ${(p) => p.$color};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ContentTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: bold;
`;

const ContentSubtitle = styled.h2`
  font-size: 1rem;
  font-weight: bold;
`;

const HighlightsList = styled.ul`
  list-style: disc;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    line-height: 1.5;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin: 0.5rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProjectButton = styled.a`
  all: unset;
  padding: 0.5rem 1rem;
  border: 0.1px solid ${colors.primaryText};
  color: ${colors.primaryText};
  cursor: pointer;
  min-width: 120px;
  text-align: center;
  font-size: 1rem;

  &:hover {
    background-color: ${colors.secondaryBg};
  }

  &:active {
    opacity: 0.5;
  }
`;

const DesktopHelp = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  @media (max-width: 768px) {
    display: none;
  }
`;
