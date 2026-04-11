import React from 'react';
import styled from 'styled-components';
import { SectionCard } from './SectionCard';
import { palette } from '../styles';

export function ContactSection({ email }) {
  return (
    <SectionCard tone="terracotta" heading="Contact">
      <Tagline>Looking for mentorship, collab or a friendly chat?</Tagline>
      {email && <Button href={`mailto:${email}`}>{email} ↗</Button>}
    </SectionCard>
  );
}

const Tagline = styled.p`
  font-size: 18px;
  color: ${palette.textDark};
  margin: 16px 0 24px;
`;

const Button = styled.a`
  display: inline-block;
  padding: 14px 28px;
  background: ${palette.white};
  color: ${palette.textDark};
  font-size: 15px;
  font-weight: 500;
  border-radius: 1000px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transition: transform 160ms ease;

  &:hover {
    transform: translateY(-2px);
  }
`;
