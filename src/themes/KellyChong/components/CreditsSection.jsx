import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

export default function CreditsSection({ cv }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('[data-fade]');
    gsap.fromTo(
      els,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

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
    <TabPage ref={ref}>
      <Inner>
        <SectionLabel data-fade>CREDITS</SectionLabel>

        <CreditText data-fade>
          Built from CV.yaml data and restyled after kellychong.ca&apos;s
          paper-texture Framer portfolio.
        </CreditText>

        <CreditList>
          {credits.map((item) => (
            <CreditItem key={`${item.label}-${item.meta}`} data-fade>
              {item.href ? (
                <CreditLink
                  href={item.href}
                  target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  data-cursor-hover
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
      </Inner>
    </TabPage>
  );
}

const TabPage = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const Inner = styled.div`
  padding: 80px 64px 120px;
  min-height: 100%;

  @media (max-width: 809px) {
    padding: 70px 24px 120px;
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
  font-family: 'Cormorant Garamond', Georgia, serif;
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
  font-family: 'Cormorant Garamond', Georgia, serif;
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
