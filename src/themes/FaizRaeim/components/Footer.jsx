import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Terminal, Globe, Code2, Coffee, Sparkles,
  Mail, ArrowUpRight,
} from 'lucide-react';
import { GithubIcon as Github, LinkedinIcon as Linkedin } from './Icons';
import { Block, SectionGrid } from './Block';

export default function Footer({ cv }) {
  const { name, email, socialLinks } = cv;
  const containerRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 50, 0]);

  return (
    <FooterWrap ref={containerRef}>
      <SectionGrid>
        {/* Brand */}
        <Block style={{ gridColumn: 'span 12' }} className="brand-block">
          <Terminal size={28} color="#a1a1aa" style={{ marginBottom: 16 }} />
          <BrandName>{name}</BrandName>
          <BrandSub>Developer passionate about creating beautiful, functional web experiences.</BrandSub>
        </Block>

        {/* Socials */}
        <SocialsBlock whileHover={{ rotate: '2.5deg', scale: 1.05 }}>
          <Globe size={24} color="#a1a1aa" style={{ marginBottom: 12 }} />
          <SocialLabel>Let's Connect</SocialLabel>
          <SocialGrid>
            {socialLinks?.github && (
              <SocialLink href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={20} />
              </SocialLink>
            )}
            {socialLinks?.linkedin && (
              <SocialLink href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </SocialLink>
            )}
            {email && (
              <SocialLink href={`mailto:${email}`} aria-label="Email">
                <Mail size={20} />
              </SocialLink>
            )}
          </SocialGrid>
        </SocialsBlock>

        {/* Quick Links */}
        <QuickLinksBlock whileHover={{ rotate: '-1.5deg', scale: 1.02 }}>
          <Code2 size={24} color="#a1a1aa" style={{ marginBottom: 12 }} />
          <SocialLabel>Quick Links</SocialLabel>
          <LinkList>
            {['Home', 'About', 'Projects', 'Contact'].map((item) => (
              <li key={item}>
                <QuickLink href={`#fr-${item.toLowerCase()}`}>
                  <LinkDot />
                  {item}
                </QuickLink>
              </li>
            ))}
          </LinkList>
        </QuickLinksBlock>

        {/* Fun Fact */}
        <FunFactBlock whileHover={{ rotate: '2deg', scale: 1.02 }}>
          <Coffee size={24} color="#fbbf24" style={{ marginBottom: 12 }} />
          <SocialLabel>Fun Fact</SocialLabel>
          <FunFactText>Coded while fueled by coffee and curiosity. Always learning, always building.</FunFactText>
        </FunFactBlock>

        {/* CTA */}
        <Block whileHover={{ rotate: '-2deg', scale: 1.03 }} style={{ gridColumn: 'span 12', background: 'linear-gradient(135deg, #27272a, #18181b)', borderColor: 'rgba(82,82,91,0.3)' }}>
          <CTACenter>
            <Sparkles size={28} color="#fbbf24" style={{ marginBottom: 12 }} />
            <CTATitle>Have a Project in Mind?</CTATitle>
            {email && (
              <CTAButton href={`mailto:${email}`}>
                Let's Talk <ArrowUpRight size={16} />
              </CTAButton>
            )}
          </CTACenter>
        </Block>

        {/* Copyright */}
        <CopyrightRow>
          <span>&copy; {currentYear} All rights reserved.</span>
        </CopyrightRow>
      </SectionGrid>

      {/* Large name text */}
      <LargeNameWrap>
        <LargeNameMotion style={{ opacity, y }}>
          <LargeName>{name}</LargeName>
          <NameFade />
        </LargeNameMotion>
      </LargeNameWrap>
    </FooterWrap>
  );
}

const FooterWrap = styled.footer`
  background: #18181b;
  padding: 80px 16px;
  color: #fafafa;
  border-top: 1px solid #27272a;
  position: relative;
  overflow: hidden;

  .brand-block {
    @media (min-width: 768px) { grid-column: span 6; }
  }
`;

const BrandName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
`;

const BrandSub = styled.p`
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.6;
  margin: 0;
`;

const SocialsBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const SocialLabel = styled.h3`
  font-size: 14px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
`;

const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const SocialLink = styled.a`
  display: grid;
  place-content: center;
  padding: 12px;
  background: #3f3f46;
  border-radius: 8px;
  color: #d4d4d8;
  transition: all 0.2s;
  text-decoration: none;
  &:hover { background: #52525b; color: #fff; }
`;

const QuickLinksBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const QuickLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #d4d4d8;
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: #fff; }
  &:hover span { background: #fff; }
`;

const LinkDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #52525b;
  transition: background 0.2s;
`;

const FunFactBlock = styled(Block)`
  grid-column: span 12;
  @media (min-width: 768px) { grid-column: span 6; }
`;

const FunFactText = styled.p`
  font-size: 14px;
  color: #d4d4d8;
  margin: 0;
`;

const CTACenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
`;

const CTATitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f59e0b;
  color: #18181b;
  font-weight: 500;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.2s;
  &:hover { background: #fbbf24; }
`;

const CopyrightRow = styled.div`
  grid-column: span 12;
  padding-top: 32px;
  display: flex;
  justify-content: center;
  font-size: 14px;
  color: #71717a;
`;

const LargeNameWrap = styled.div`
  position: relative;
  margin-top: 80px;
`;

const LargeNameMotion = styled(motion.div)`
  text-align: center;
  position: relative;
  padding: 0 16px;
`;

const LargeName = styled.h2`
  font-size: 12vw;
  font-weight: 700;
  color: #27272a;
  letter-spacing: -0.05em;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  margin: 0;
  @media (min-width: 640px) { font-size: 10vw; }
  @media (min-width: 768px) { font-size: 8vw; }
`;

const NameFade = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 128px;
  background: linear-gradient(to top, #18181b, rgba(24, 24, 27, 0.8), transparent);
  pointer-events: none;
`;
