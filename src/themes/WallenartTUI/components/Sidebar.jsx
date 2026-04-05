import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../utils/tokens';

const SECTIONS = [
  { key: 'home', label: 'Home' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
];

export function Sidebar({
  cv,
  sectionIndex,
  itemIndex,
  onSelectSection,
  onSelectItem,
  menuOpen,
}) {
  const experienceItems = cv.experience.map(
    (e) => `${e.title} @ ${e.company}`
  );
  const projectItems = cv.projects.map((p) => p.name);
  const skillItems = cv.skills.map((s) =>
    typeof s === 'string' ? s : s.name || s
  );

  const sectionData = [
    { items: [] },
    { items: experienceItems },
    { items: projectItems },
    { items: skillItems },
  ];

  return (
    <SidebarWrap $menuOpen={menuOpen}>
      {SECTIONS.map((section, si) => {
        const isActive = sectionIndex === si;
        const data = sectionData[si];

        return (
          <SectionBox
            key={section.key}
            $active={isActive}
            $isHome={section.key === 'home'}
            onClick={() => onSelectSection(si)}
          >
            <SectionTitle $active={isActive}>
              <TitleText>{section.label}</TitleText>
              <TitleBg />
            </SectionTitle>

            {section.key === 'home' ? (
              <HomeContent>
                <HomeParagraph>
                  Hello! I'm{' '}
                  <AccentText $color={colors.blue}>{cv.name}</AccentText>,{' '}
                  {cv.currentJobTitle ? (
                    <>a {cv.currentJobTitle}.</>
                  ) : (
                    <>welcome to my portfolio.</>
                  )}
                </HomeParagraph>
              </HomeContent>
            ) : (
              <>
                {data.items.length > 0 && (
                  <ListIndex $active={isActive}>
                    <TitleText>
                      {isActive ? itemIndex + 1 : 1} of {data.items.length}
                    </TitleText>
                    <TitleBg />
                  </ListIndex>
                )}
                <ItemList $active={isActive}>
                  {data.items.map((item, ii) => (
                    <Item
                      key={ii}
                      $selected={isActive && itemIndex === ii}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(si, ii);
                      }}
                    >
                      {item}
                    </Item>
                  ))}
                </ItemList>
              </>
            )}
          </SectionBox>
        );
      })}
    </SidebarWrap>
  );
}

const SidebarWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 25%;
  min-width: 0;
  min-height: 0;
  padding-bottom: 14px;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    top: calc(var(--app-top-offset, 0px) + 65px);
    left: 1.5vw;
    width: 97vw;
    z-index: 99;
    background-color: ${colors.primaryBg};
    transform: ${(p) => (p.$menuOpen ? 'translateX(0)' : 'translateX(150%)')};
    transition: transform 0.5s ease-in-out;
    max-height: calc(100vh - var(--app-top-offset, 0px) - 75px);
    overflow-y: auto;
    padding-top: 14px;
  }
`;

const SectionBox = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.1px solid
    ${(p) => (p.$active ? colors.lightBlue : colors.primaryText)};
  position: relative;
  padding-top: 0.2rem;
  cursor: pointer;
  flex: ${(p) => (p.$isHome ? '0 0 auto' : '1 1 0')};
  min-height: 0;
  overflow: visible;

  &:hover {
    border-color: ${(p) => (p.$active ? colors.lightBlue : colors.border)};
  }

  @media (max-width: 768px) {
    flex: 0 0 auto;
  }
`;

const SectionTitle = styled.div`
  position: absolute;
  top: -12px;
  padding: 0 0.1rem;
  width: fit-content;
  color: ${(p) => (p.$active ? colors.lightBlue : colors.primaryText)};
`;

const ListIndex = styled.div`
  position: absolute;
  bottom: -12px;
  right: 0;
  padding: 0 0.1rem;
  width: fit-content;
  align-self: flex-end;
  color: ${(p) => (p.$active ? colors.lightBlue : colors.primaryText)};
`;

const TitleText = styled.p`
  position: relative;
  z-index: 2;
  font-size: 0.9rem;
`;

const TitleBg = styled.div`
  position: relative;
  z-index: 1;
  background-color: ${colors.primaryBg};
  height: 0.5ch;
  top: -1ch;
  left: -2px;
  width: 104%;
`;

const HomeContent = styled.div`
  padding: 0.5rem 0.2rem;
`;

const HomeParagraph = styled.p`
  font-size: 0.85rem;
  line-height: 1.4;
`;

const AccentText = styled.span`
  color: ${(p) => p.$color};
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 99%;
  padding: 0.2rem;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;

  scrollbar-width: thin;
  scrollbar-color: ${(p) =>
      p.$active ? colors.lightBlue : colors.primaryText}
    ${colors.primaryBg};

  &::-webkit-scrollbar {
    width: 0.4em;
    background-color: ${colors.primaryBg};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${(p) =>
      p.$active ? colors.lightBlue : colors.primaryText};
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 0;
  }
`;

const Item = styled.div`
  padding: 0.15rem 0.3rem;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${(p) =>
    p.$selected ? colors.secondaryBg : 'transparent'};
  cursor: pointer;

  &:hover {
    background-color: ${(p) =>
      p.$selected ? colors.secondaryBg : colors.tertiaryBg};
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 1rem;
    white-space: normal;
  }
`;
