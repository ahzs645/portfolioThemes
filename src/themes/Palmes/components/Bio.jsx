import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6rem 2rem;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #06b6d4;
  margin-bottom: 2rem;
`;

const Content = styled.div`
  font-size: 1.125rem;
  line-height: 1.8;
  color: #d4d4d8;

  p {
    margin-bottom: 1.5rem;
  }

  a {
    color: #06b6d4;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;

    &:hover {
      border-bottom-color: #06b6d4;
    }
  }
`;

const ContactInfo = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;

  &:hover {
    color: #06b6d4;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SocialLinks = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  color: #a1a1aa;
  transition: all 0.2s ease;

  &:hover {
    border-color: #06b6d4;
    color: #06b6d4;
    background: rgba(6, 182, 212, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export default function Bio({ about, email, socials = [] }) {
  return (
    <Section id="bio">
      <SectionTitle>About Me</SectionTitle>
      <Content>
        {about ? (
          <div dangerouslySetInnerHTML={{ __html: about.replace(/\n/g, '<br/>') }} />
        ) : (
          <p>No bio available.</p>
        )}
      </Content>

      <ContactInfo>
        {email && (
          <ContactItem href={`mailto:${email}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {email}
          </ContactItem>
        )}
      </ContactInfo>

      {socials.length > 0 && (
        <SocialLinks>
          {socials.map((social, index) => (
            <SocialLink
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              title={social.network}
            >
              {getSocialIcon(social.network)}
            </SocialLink>
          ))}
        </SocialLinks>
      )}
    </Section>
  );
}

function getSocialIcon(network) {
  const name = (network || '').toLowerCase();

  if (name.includes('github')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    );
  }
  if (name.includes('linkedin')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }
  if (name.includes('twitter') || name.includes('x')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }

  // Default icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}
