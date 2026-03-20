import React from 'react';
import styled from 'styled-components';
import { FONT } from '../utils/tokens';

export default function Hero({ cv, theme }) {
  const name = cv?.name || '';
  const title = cv?.currentJobTitle || '';
  const summary = cv?.summary || '';
  const email = cv?.email || '';
  const socialLinks = cv?.socialLinks || {};

  return (
    <Section>
      <ListContainer>
        <ListTitle $theme={theme}>
          <Name $theme={theme}>{name.toLowerCase()}</Name>
          <AsciiBlock $theme={theme}>
            <pre>{'▐▓█▀▀▀▀▀▀▀▀▀█▓▌░▄▄▄▄▄\n▐▓█░░░░░░░░░█▓▌░█████\n▐▓█░░▀░░▀▄░░█▓▌░█▄▄▄█\n▐▓█░░▄░░▄▀░░█▓▌░█▄▄▄█\n▐▓█░░░░░░░░░█▓▌░█████\n▐▓█▄▄▄▄▄▄▄▄▄█▓▌░█████\n░░░░▄▄███▄▄░░░░░█████'}</pre>
          </AsciiBlock>
        </ListTitle>
        <ListContent $theme={theme}>
          <Greeting>Hi!</Greeting>
          {summary && <Bio>{summary}</Bio>}
          {!summary && title && (
            <Bio>
              I'm {name.split(' ')[0]}, {title.toLowerCase().startsWith('a') || title.toLowerCase().startsWith('e') || title.toLowerCase().startsWith('i') || title.toLowerCase().startsWith('o') || title.toLowerCase().startsWith('u') ? 'an' : 'a'} {title}.
            </Bio>
          )}
          <SocialLine>
            Find me on{' '}
            {socialLinks.github && (
              <><BlueLink href={socialLinks.github} $theme={theme} target="_blank">Github</BlueLink>, </>
            )}
            {socialLinks.linkedin && (
              <><BlueLink href={socialLinks.linkedin} $theme={theme} target="_blank">LinkedIn</BlueLink>, </>
            )}
            {socialLinks.twitter && (
              <><BlueLink href={socialLinks.twitter} $theme={theme} target="_blank">Twitter</BlueLink>, </>
            )}
            {email && (
              <>or email me at <BlueLink href={`mailto:${email}`} $theme={theme}>{email}</BlueLink>.</>
            )}
          </SocialLine>
        </ListContent>
      </ListContainer>
    </Section>
  );
}

const Section = styled.section`
  padding-top: 120px;
`;

const ListContainer = styled.dl`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
  row-gap: 0.5rem;
  margin-bottom: 3rem;
  @media (min-width: 768px) {
    margin-bottom: 4rem;
    row-gap: 1rem;
  }
`;

const ListTitle = styled.dt`
  grid-column: span 12;
  padding: 8px;
  @media (min-width: 768px) { grid-column: span 4; }
`;

const ListContent = styled.dd`
  grid-column: span 12;
  border-top: 1px solid rgba(115, 115, 115, 0.1);
  padding: 16px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 15px;
  @media (min-width: 768px) {
    grid-column: span 8;
  }
`;

const Name = styled.h1`
  font-weight: 700;
  font-size: 1rem;
  color: ${p => p.$theme.primary};
  margin: 0;
  line-height: 1.625;
`;

const AsciiBlock = styled.div`
  margin-top: 16px;
  font-size: 15px;
  color: ${p => p.$theme.silverDark};
  line-height: 1.15;
  pre {
    margin: 0;
    font-family: ${FONT.mono};
    font-size: 12px;
  }
`;

const Greeting = styled.p`
  margin: 0;
`;

const Bio = styled.p`
  margin: 0;
  line-height: 1.6;
`;

const SocialLine = styled.p`
  margin: 0;
  line-height: 1.6;
`;

const BlueLink = styled.a`
  color: ${p => p.$theme.blue};
  text-decoration: none;
  position: relative;
  font-weight: 400;
  transition: color 0.3s linear;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: currentColor;
    transform: scaleX(0);
    transform-origin: 100% 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &:hover::after {
    transform: scaleX(1);
    transform-origin: 0 100%;
  }
`;
