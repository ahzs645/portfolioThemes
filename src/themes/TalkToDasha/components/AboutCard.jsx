import React from 'react';
import styled from 'styled-components';
import { palette } from '../styles';

export function AboutCard({ text }) {
  if (!text) return null;
  return (
    <Card>
      <Text>{text}</Text>
    </Card>
  );
}

const Card = styled.div`
  background: ${palette.white};
  border-radius: 24px;
  padding: 36px 40px;
  box-shadow: 0 -4px 20px rgba(121, 121, 121, 0.1),
    0 8px 24px rgba(121, 121, 121, 0.08);
  max-width: 720px;
  margin: 0 auto;
`;

const Text = styled.p`
  font-size: 17px;
  line-height: 1.6;
  color: ${palette.textDark};
  margin: 0;
`;
