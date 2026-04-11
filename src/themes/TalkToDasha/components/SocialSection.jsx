import React from 'react';
import styled from 'styled-components';
import { SectionCard } from './SectionCard';
import { palette } from '../styles';

export function SocialSection({ socials }) {
  if (!socials || socials.length === 0) return null;

  return (
    <SectionCard tone="sky" heading="Social Media">
      <PillRow>
        {socials.map((s) => (
          <Pill key={s.label} href={s.url} target="_blank" rel="noreferrer">
            {s.label} ↗
          </Pill>
        ))}
      </PillRow>
    </SectionCard>
  );
}

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
`;

const Pill = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  background: ${palette.white};
  color: ${palette.textDark};
  font-size: 14px;
  font-weight: 500;
  border-radius: 1000px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: transform 160ms ease;

  &:hover {
    transform: translateY(-2px);
  }
`;
