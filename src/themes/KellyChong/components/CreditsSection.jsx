import React from 'react';
import styled from 'styled-components';

export default function CreditsSection({ cv }) {
  const credits = [
    cv.website && { label: 'website', href: cv.website, meta: 'main link' },
    cv.email && { label: cv.email, href: `mailto:${cv.email}`, meta: 'email' },
    ...(cv.socialRaw || []).slice(0, 6).map((entry) => ({
      label: entry.network || entry.url,
      href: entry.url || null,
      meta: entry.username || 'social',
    })),
  ].filter(Boolean);

  return (
    <Section id="credits">
      <SectionLabel>CREDITS</SectionLabel>

      <CreditText>
        Built from CV.yaml data and restyled after kellychong.ca&apos;s
        paper-texture Framer portfolio.
      </CreditText>

      <CreditList>
        {credits.map((item) => (
          <CreditItem key={`${item.label}-${item.meta}`}>
            {item.href ? (
              <CreditLink
                href={item.href}
                target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
              >
                {item.label}
              </CreditLink>
            ) : (
              <span>{item.label}</span>
            )}
            <CreditMeta>{item.meta}</CreditMeta>
          </CreditItem>
        ))}
      </CreditList>
    </Section>
  );
}

const Section = styled.section`
  padding: 60px 64px 160px;

  @media (max-width: 809px) {
    padding: 40px 24px 140px;
  }
`;

const SectionLabel = styled.h2`
  margin: 0 0 24px;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgb(119, 111, 100);
  text-transform: uppercase;
`;

const CreditText = styled.p`
  margin: 0 0 24px;
  max-width: 540px;
  font-family: 'HAL Timezone', 'Cormorant Garamond', Georgia, serif;
  font-size: 17px;
  line-height: 1.7;
  color: rgb(115, 131, 153);
`;

const CreditList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CreditItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: baseline;
  font-family: 'HAL Timezone', 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  color: rgb(41, 72, 110);
`;

const CreditLink = styled.a`
  color: rgb(41, 72, 110);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;

  &:hover {
    color: rgb(74, 88, 189);
  }
`;

const CreditMeta = styled.small`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: rgb(175, 184, 196);
`;
