import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 32px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  min-width: 300px;
`;

const Group = styled.div``;

const Label = styled.div`
  font-family: 'Unica One', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1px;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const LinksRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const DotIcon = () => (
  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="2" height="2" fill="var(--th-text)" />
    <rect x="4" width="2" height="2" fill="var(--th-text)" />
    <rect y="4" width="2" height="2" fill="var(--th-text)" />
    <rect x="4" y="4" width="2" height="2" fill="var(--th-text)" />
  </svg>
);

const Link = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--th-text);
  font-family: 'EB Garamond', serif;
  font-size: 13px;
  line-height: 17px;
  transition: color 0.3s;

  &:hover {
    opacity: 0.6;
  }
`;

export default function SocialLinks({ cv }) {
  const socials = cv.socialLinks || [];
  const email = cv.email;

  return (
    <Container>
      {socials.length > 0 && (
        <Group>
          <Label>Follow my journey</Label>
          <LinksRow>
            {socials.map((s, i) => (
              <Link key={i} href={s.url} target="_blank" rel="noopener noreferrer">
                <DotIcon />
                <span>{s.platform}</span>
              </Link>
            ))}
          </LinksRow>
        </Group>
      )}
      {email && (
        <Group>
          <Label>Get in touch</Label>
          <LinksRow>
            <Link href={`mailto:${email}`}>
              <DotIcon />
              <span>{email}</span>
            </Link>
          </LinksRow>
        </Group>
      )}
    </Container>
  );
}
