import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

export default function HeroSection({ name, title, company, summary, email, location, website, $dark = false }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const els = sectionRef.current.querySelectorAll('[data-animate]');
    gsap.fromTo(
      els,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  return (
    <Section ref={sectionRef}>
      <HeroContent>
        <TaglineCol data-animate>
          <Tagline>
            <TaglineName $dark={$dark}>{name} </TaglineName>
            <TaglineRegular $dark={$dark}>is crafting{'\n'}experiences for </TaglineRegular>
            <TaglineName $dark={$dark}>play </TaglineName>
            <TaglineRegular $dark={$dark}>and</TaglineRegular>
            {'\n'}
            <TaglineName $dark={$dark}>possibilities.</TaglineName>
          </Tagline>
        </TaglineCol>

        <InfoCol data-animate>
          <InfoBlock>
            <InfoLine>
              <InfoMuted $dark={$dark}>{summary || 'A brief note about the work can go here'}{company ? ' @' : '.'}</InfoMuted>
            </InfoLine>
            {company && (
              <InfoLine>
                <InfoLink $dark={$dark} href={website || '#'} target="_blank" rel="noreferrer" data-cursor-hover>
                  {company}.
                </InfoLink>
              </InfoLine>
            )}
            {location && (
              <InfoLine>
                <InfoMuted $dark={$dark}>Living, laughing, loving in {location}.</InfoMuted>
              </InfoLine>
            )}
            {!company && summary && (
              <InfoLine>
                <InfoMuted $dark={$dark}>{summary}</InfoMuted>
              </InfoLine>
            )}
          </InfoBlock>

          <ActionBlock>
            <ActionLink $dark={$dark} href="#" data-cursor-hover>Reach out</ActionLink>
            <InfoMuted $dark={$dark}> for questions or collaborations.</InfoMuted>
          </ActionBlock>
        </InfoCol>
      </HeroContent>
    </Section>
  );
}

const Section = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
`;

const HeroContent = styled.div`
  display: flex;
  gap: 100px;
  align-items: flex-start;
  width: 100%;
  padding: 0 64px 90px;

  @media (max-width: 1109px) {
    gap: 48px;
  }

  @media (max-width: 809px) {
    flex-direction: column;
    gap: 20px;
    padding: 0 24px 100px;
  }
`;

const TaglineCol = styled.div`
  flex: 1;
  max-width: 45%;

  @media (max-width: 1109px) {
    max-width: 55%;
  }

  @media (max-width: 809px) {
    max-width: 100%;
  }
`;

const Tagline = styled.h1`
  margin: 0;
  font-size: 40px;
  line-height: 1.2;
  letter-spacing: -0.03em;
  white-space: pre-wrap;

  @media (max-width: 809px) {
    font-size: 28px;
  }
`;

const TaglineName = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
`;

const TaglineRegular = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: normal;
  font-weight: 400;
  color: ${p => p.$dark ? 'rgb(120, 135, 155)' : 'rgb(146, 159, 176)'};
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  max-width: 542px;
`;

const InfoLine = styled.div``;

const InfoMuted = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  letter-spacing: -0.01em;
  line-height: 1.4;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(115, 131, 153)'};
`;

const InfoLink = styled.a`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  letter-spacing: -0.01em;
  line-height: 1.4;
  color: ${p => p.$dark ? 'rgb(110, 125, 148)' : 'rgb(115, 131, 153)'};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;

  &:hover {
    color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  }
`;

const ActionBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionLink = styled.a`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  letter-spacing: -0.01em;
  line-height: 1.4;
  color: ${p => p.$dark ? 'rgb(140, 130, 115)' : 'rgb(119, 111, 100)'};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;

  &:hover {
    color: ${p => p.$dark ? 'rgb(140, 175, 220)' : 'rgb(41, 72, 110)'};
  }
`;
