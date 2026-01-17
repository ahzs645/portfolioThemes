import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 2rem;
  padding-top: 4rem;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    padding-top: 4rem;
  }
`;

const Greeting = styled.h2`
  font-size: 1.25rem;
  color: #a1a1aa;
  font-weight: 400;
  margin-bottom: 0.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Name = styled.h1`
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #06b6d4 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.6s ease-out 0.1s backwards;
`;

const Title = styled.p`
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: #71717a;
  animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #52525b;
  font-size: 0.75rem;
  animation: ${fadeIn} 0.6s ease-out 0.4s backwards;
`;

const Arrow = styled.div`
  width: 20px;
  height: 20px;
  border-right: 2px solid #52525b;
  border-bottom: 2px solid #52525b;
  transform: rotate(45deg);
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) rotate(45deg);
    }
    40% {
      transform: translateY(5px) rotate(45deg);
    }
    60% {
      transform: translateY(3px) rotate(45deg);
    }
  }
`;

export default function Welcome({ name, title }) {
  return (
    <Section id="welcome">
      <Greeting>Hello world, I&apos;m</Greeting>
      <Name>{name || 'Your Name'}</Name>
      <Title>{title || 'Software Developer'}</Title>
      <ScrollIndicator>
        <span>Scroll down</span>
        <Arrow />
      </ScrollIndicator>
    </Section>
  );
}
