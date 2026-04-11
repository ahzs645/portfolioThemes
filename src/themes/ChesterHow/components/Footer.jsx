import React from 'react';
import styled from 'styled-components';
import mapleGif from '../assets/maple.gif';
import leavesImg from '../assets/leaves.webp';
import { colors } from '../styles';

const FooterWrap = styled.footer`
  display: flex;
  justify-content: center;
  padding: 9rem 0 5rem;
`;

const Group = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const ImageStack = styled.div`
  position: relative;
  width: 131px;
  height: 70px;
`;

const Maple = styled.img`
  width: 131px;
  height: 70px;
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  ${Group}:hover & { opacity: 1; }
`;

const Leaves = styled.img`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  ${Group}:hover & { opacity: 0; }
`;

const Caption = styled.span`
  font-size: 0.875rem;
  letter-spacing: -0.025em;
  color: ${colors.text400};
`;

export function Footer({ name }) {
  const firstName = (name || 'Chester').split(' ')[0];
  return (
    <FooterWrap>
      <Group>
        <ImageStack>
          <Maple src={mapleGif} alt="maple" width="131" height="70" loading="lazy" />
          <Leaves src={leavesImg} alt="leaves" width="40" height="40" loading="lazy" />
        </ImageStack>
        <Caption>Planted by {firstName}</Caption>
      </Group>
    </FooterWrap>
  );
}
