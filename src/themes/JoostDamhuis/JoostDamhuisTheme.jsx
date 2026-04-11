import React from 'react';
import { HeroIntro } from './components/HeroIntro';
import { DeviceSculpture } from './components/DeviceSculpture';
import { formatTime, useClock } from './hooks';
import {
  AmbientGlowOne,
  AmbientGlowTwo,
  BottomFade,
  CenterColumn,
  GlobalStyle,
  Page,
} from './styles';
import { useCV } from '../../contexts/ConfigContext';

export function JoostDamhuisTheme() {
  const cv = useCV();
  const now = useClock();

  if (!cv) return null;

  return (
    <>
      <GlobalStyle />
      <Page>
        <AmbientGlowOne />
        <AmbientGlowTwo />
        <BottomFade />

        <CenterColumn>
          <HeroIntro cv={cv} />
          <DeviceSculpture timeLabel={formatTime(now)} />
        </CenterColumn>
      </Page>
    </>
  );
}
