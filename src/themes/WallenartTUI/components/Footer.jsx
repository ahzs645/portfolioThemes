import React from 'react';
import styled from 'styled-components';
import { colors } from '../utils/tokens';

export function Footer({ cv }) {
  const links = cv.socialLinks;

  const socialItems = [
    { url: links.github, label: 'GitHub', color: colors.blue },
    { url: links.twitter, label: 'X (Twitter)', color: colors.orange },
    { url: links.linkedin, label: 'LinkedIn', color: colors.pink },
  ].filter((l) => l.url);

  return (
    <FooterWrap>
      <HelpText>
        &lt;pgup&gt;/&lt;pgdown&gt;: Scroll, &lt;left&gt;/&lt;right&gt;:
        Switch section, &lt;1-4&gt;: Jump to section,
        &lt;up&gt;/&lt;down&gt;: Switch item{' '}
        <Hint>(or just use the mouse)</Hint>
      </HelpText>
      <SocialRow>
        {socialItems.map((item, i) => (
          <SocialLink key={i} href={item.url} target="_blank" $color={item.color}>
            {item.label}
          </SocialLink>
        ))}
      </SocialRow>
    </FooterWrap>
  );
}

const FooterWrap = styled.footer`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: none;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  overflow: hidden;
  min-height: 4ch;
  color: ${colors.blue};

  @media (max-width: 768px) {
    margin: 1rem 0;
    justify-content: center;
    font-size: 1rem;
  }
`;

const HelpText = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const Hint = styled.span`
  color: ${colors.pink};
`;

const SocialRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const SocialLink = styled.a`
  color: ${(p) => p.$color};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
