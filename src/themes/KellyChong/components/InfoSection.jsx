import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { getBioText } from '../../../utils/bioText';

export default function InfoSection({ cv, $dark = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('[data-fade]');
    gsap.fromTo(
      els,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  const about = getBioText(cv, { type: 'profile' });

  const elsewhere = [
    ...(cv.socialRaw || []).slice(0, 8).map((s) => ({
      label: (s.network || s.url || '').toLowerCase(),
      href: s.url,
      detail: s.username || '',
    })),
    cv.email && { label: 'email', href: `mailto:${cv.email}`, detail: cv.email },
  ].filter(Boolean);

  const info = [
    cv.currentJobTitle && `Working as ${cv.currentJobTitle}`,
    cv.location && `Based in ${cv.location}`,
    cv.education?.[0] && `${cv.education[0].degree} in ${cv.education[0].area}`,
    cv.volunteer?.[0] && `Also involved with ${cv.volunteer[0].company}`,
  ].filter(Boolean);

  return (
    <TabPage ref={ref}>
      <Inner>
        <SectionLabel $dark={$dark} data-fade>INFO</SectionLabel>

        <Grid>
          <Column data-fade>
            <AboutText $dark={$dark}>{about}</AboutText>
            {info.length > 0 && (
              <Block>
                <BlockLabel $dark={$dark}>Outside the main thread</BlockLabel>
                <BulletList $dark={$dark}>
                  {info.map((item) => <li key={item}>{item}</li>)}
                </BulletList>
              </Block>
            )}
          </Column>

          <Column data-fade>
            {elsewhere.length > 0 && (
              <Block>
                <BlockLabel $dark={$dark}>Elsewhere on the web...</BlockLabel>
                <LinkList>
                  {elsewhere.map((item) => (
                    <LinkRow key={`${item.label}-${item.href}`}>
                      <ExtLink $dark={$dark} href={item.href} target={item.href?.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" data-cursor-hover>
                        {item.label}
                      </ExtLink>
                      {item.detail && <LinkDetail $dark={$dark}>{item.detail}</LinkDetail>}
                    </LinkRow>
                  ))}
                </LinkList>
              </Block>
            )}
          </Column>
        </Grid>
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
    padding: 60px 24px 120px;
  }
`;

const SectionLabel = styled.h2`
  margin: 0 0 32px;
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: ${p => p.$dark ? 'rgb(140, 130, 115)' : 'rgb(119, 111, 100)'};
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;

  @media (max-width: 809px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const AboutText = styled.p`
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  line-height: 1.7;
  color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  letter-spacing: -0.01em;
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BlockLabel = styled.div`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  letter-spacing: -0.01em;
  color: ${p => p.$dark ? 'rgb(140, 130, 115)' : 'rgb(119, 111, 100)'};
`;

const BulletList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  line-height: 1.8;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(115, 131, 153)'};
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const ExtLink = styled.a`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;

  &:hover {
    color: ${p => p.$dark ? 'rgb(180, 210, 250)' : 'rgb(74, 88, 189)'};
  }
`;

const LinkDetail = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${p => p.$dark ? 'rgb(100, 115, 135)' : 'rgb(175, 184, 196)'};
`;
