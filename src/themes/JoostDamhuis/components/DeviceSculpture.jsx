import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { ACCENT, ASSETS } from '../constants';
import { MusicPlayer } from './MusicPlayer';

const drift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-18deg); }
  50% { transform: translate3d(0, -10px, 0) rotate(-22deg); }
`;

const shimmer = keyframes`
  0%, 100% { opacity: 0.03; transform: translate3d(0, 0, 0) rotate(90deg); }
  50% { opacity: 0.07; transform: translate3d(0, -6px, 0) rotate(90deg); }
`;

const shellFloat = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -6px, 0); }
`;

const shellEnter = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 1, y: 260 },
  transition: { bounce: 0, delay: 0.05, duration: 2.3, type: 'spring' },
};

const plugEnter = {
  animate: { opacity: [0, 1, 1, 1], y: [230, 42, -10, 0] },
  initial: { opacity: 0, y: 230 },
  transition: {
    delay: 0.72,
    duration: 1.15,
    ease: [0.16, 1, 0.3, 1],
    times: [0, 0.58, 0.86, 1],
  },
};

export function DeviceSculpture({ timeLabel }) {
  return (
    <Stage
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <WireGlowWrap {...plugEnter}>
        <SideGlow src={ASSETS.sideGlow} alt="" />
        <WireLine viewBox="0 0 1 28.5" aria-hidden="true">
          <path d="M0 0L0 28.5" />
        </WireLine>
        <CableWrap>
          <CableSvg viewBox="0 0 133.152 921.128" aria-hidden="true">
            <path d="M74.611 0C74.611 0 74.223 17.707 74.611 34.667C74.999 51.627 76.165 70.173 78.193 79.613C82.248 98.493 90.744 113.792 84.985 123.113C79.227 132.434 65.017 137.508 50.638 138.113C36.259 138.718 21.71 134.854 15.273 127.113C8.836 119.371 9.024 107.393 13.004 95.113C16.984 82.833 24.756 70.184 33.488 61.113C50.95 42.971 91.644 26.113 113.193 46.113C123.967 56.113 137.451 73.418 131.833 110.112C126.216 146.806 47.717 259.335 26.278 326.668C4.838 394.002 13.518 381.175 4.965 462.224C-12.142 624.321 21.397 935.488 9.693 920.613" />
          </CableSvg>

          <CableCap>
            <CableCapShade />
            <CableCapBloom />
          </CableCap>
        </CableWrap>

        <BlobField>
          <BlobOne />
          <BlobTwo />
          <BlobThree />
        </BlobField>
      </WireGlowWrap>

      <Shell {...shellEnter}>
        <ShellInset>
          <MintCard>
            <TimeBadge>
              <BadgeText>{timeLabel}</BadgeText>
            </TimeBadge>

            <WeatherBadge>
              <WeatherValue>24</WeatherValue>
              <DegreeMark>o</DegreeMark>
              <WeatherValue>C</WeatherValue>
            </WeatherBadge>
          </MintCard>
        </ShellInset>

        <StampIcon src={ASSETS.deviceIcon} alt="" />

        <MusicDock>
          <MusicPlayer />
        </MusicDock>

        <AccentRing />
        <RightShine />
        <CenterBeam />
      </Shell>
    </Stage>
  );
}

const Stage = styled(motion.div)`
  position: relative;
  width: 166px;
  height: 246px;
  user-select: none;
  animation: ${shellFloat} 8s ease-in-out infinite;
`;

const WireGlowWrap = styled(motion.div)`
  position: absolute;
  bottom: -42px;
  left: 73.49%;
  width: 10px;
  height: 42px;
  filter: blur(0.3px);
`;

const SideGlow = styled.img`
  position: absolute;
  top: -202px;
  left: 50%;
  width: 54px;
  height: 202px;
  transform: translateX(-50%);
  mask: linear-gradient(0deg, rgba(0, 0, 0, 0) 3%, rgba(0, 0, 0, 1) 18%);
`;

const WireLine = styled.svg`
  position: absolute;
  top: 166px;
  left: 26px;
  width: 1px;
  height: 29px;

  path {
    fill: transparent;
    stroke: rgb(247, 247, 247);
    stroke-width: 4;
  }
`;

const CableWrap = styled.div`
  position: absolute;
  top: calc(435.71428571428567% - 485px / 2);
  left: calc(310.00000000000006% - 178px / 2);
  width: 178px;
  height: 485px;
  transform: scale(0.9);
  transform-origin: top left;
  z-index: 1;
`;

const CableSvg = styled.svg`
  position: absolute;
  top: -3px;
  left: -9px;
  width: 133px;
  height: 921px;

  path {
    fill: transparent;
    stroke: rgb(226, 226, 228);
    stroke-width: 6;
  }
`;

const BlobField = styled.div`
  position: absolute;
  top: -80px;
  right: -160px;
  bottom: -112px;
  left: -113px;
  overflow: hidden;
  z-index: 10;
`;

const CableCap = styled.div`
  position: absolute;
  top: 7.22%;
  left: 35.96%;
  width: 29px;
  height: 29px;
  opacity: 0.72;
`;

const CableCapShade = styled.div`
  position: absolute;
  top: -11px;
  left: 2px;
  width: 11px;
  height: 36px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.45) 94%,
    rgba(0, 0, 0, 0) 100%
  );
  transform: rotate(-2deg);
`;

const CableCapBloom = styled.div`
  position: absolute;
  bottom: 0;
  left: 18px;
  width: 13px;
  height: 37px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.34) 88%,
    rgba(0, 0, 0, 0) 92%
  );
  transform: rotate(180deg);
  filter: blur(1px);
  opacity: 0.83;
`;

const sharedBlob = `
  position: absolute;
  border-radius: 1000px;
  background-color: #000;
`;

const BlobOne = styled.div`
  ${sharedBlob}
  top: 37px;
  left: 189px;
  width: 75px;
  height: 118px;
  filter: blur(28px);
  opacity: 0.38;
  transform: rotate(-21deg);
  animation: ${drift} 7.5s ease-in-out infinite;
  z-index: 1;
`;

const BlobTwo = styled.div`
  ${sharedBlob}
  bottom: 10px;
  left: 20px;
  width: 75px;
  height: 118px;
  filter: blur(28px);
  opacity: 0.38;
  transform: rotate(-21deg);
  animation: ${drift} 9s ease-in-out infinite reverse;
  z-index: 1;
`;

const BlobThree = styled.div`
  ${sharedBlob}
  top: 1px;
  left: 113px;
  width: 20px;
  height: 87px;
  filter: blur(4px);
  opacity: 0.2;
  transform: rotate(-7deg);
  z-index: 10;
`;

const Shell = styled(motion.div)`
  position: absolute;
  top: 1px;
  left: 50%;
  z-index: 10;
  width: 165px;
  height: 165px;
  transform: translateX(-50%);
  overflow: hidden;
  border: solid rgba(255, 255, 255, 0.1);
  border-width: 1px 0.5px 0 0.5px;
  border-radius: 36px;
  background: linear-gradient(0deg, #0a0a0a 0%, rgb(28, 28, 28) 100%);
`;

const ShellInset = styled.div`
  position: absolute;
  top: 4px;
  left: 50%;
  display: flex;
  min-width: 155px;
  min-height: 86px;
  justify-content: center;
  transform: translateX(-50%);
  overflow: visible;
  border-radius: 30px;
  background: radial-gradient(50% 50% at 50% 50%, #000 0%, rgb(33, 33, 33) 100%);
`;

const MintCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 80px;
  transform: translate(-50%, -50%);
  overflow: visible;
  border-radius: 27px;
  background: linear-gradient(0deg, #78ffdf 0%, rgb(86, 191, 167) 100%);
  box-shadow: inset 0 1px 10px 1px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const TimeBadge = styled.div`
  position: absolute;
  top: 7px;
  left: 11px;
  display: flex;
  min-width: 40px;
  height: 16px;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 1.2px solid #222;
  border-radius: 9px;
`;

const BadgeText = styled.span`
  color: #000;
  font-family: 'Alpha Lyrae', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  font-feature-settings: 'ss02' on;
`;

const WeatherBadge = styled.div`
  position: absolute;
  top: 7px;
  right: 10px;
  display: flex;
  min-width: 36px;
  height: 16px;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 2px 6px 2px 5px;
  border-radius: 9px;
  background: #000;
`;

const WeatherValue = styled.span`
  color: rgb(101, 218, 190);
  font-family: 'Alpha Lyrae', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  font-feature-settings: 'ss02' on;
`;

const DegreeMark = styled.span`
  color: rgb(101, 218, 190);
  font-family: 'Alpha Lyrae', sans-serif;
  font-size: 7px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  align-self: flex-start;
  margin-top: 1px;
  font-feature-settings: 'ss02' on;
`;

const StampIcon = styled.img`
  position: absolute;
  top: 76%;
  left: 75%;
  width: 46px;
  height: 46px;
  transform: translate(-50%, -50%);
  opacity: 0.15;
  filter: invert(1) drop-shadow(0.46px 0.46px 0px ${ACCENT});
  z-index: 1;
`;

const MusicDock = styled.div`
  position: absolute;
  bottom: 13px;
  left: 19px;
  width: 129px;
  z-index: 12;
`;

const AccentRing = styled.div`
  position: absolute;
  top: 76.97%;
  left: 26.67%;
  z-index: 10;
  width: 35px;
  height: 35px;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(120, 255, 223, 0.2);
  border-radius: 20px;
`;

const RightShine = styled.div`
  position: absolute;
  top: -4px;
  right: 0;
  bottom: -6px;
  width: 13px;
  background: linear-gradient(270deg, #fff 0%, rgba(171, 171, 171, 0) 100%);
  filter: blur(7px);
  opacity: 0.05;
`;

const CenterBeam = styled.div`
  position: absolute;
  bottom: -82px;
  left: calc(50.303% - 6.5px);
  width: 13px;
  height: 176px;
  background: linear-gradient(270deg, #fff 0%, rgba(171, 171, 171, 0) 100%);
  opacity: 0.04;
  transform: rotate(90deg);
  animation: ${shimmer} 7s ease-in-out infinite;
`;
