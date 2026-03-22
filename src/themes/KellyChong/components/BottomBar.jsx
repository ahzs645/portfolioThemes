import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

export default function BottomBar({ location }) {
  const [time, setTime] = useState('');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration) setProgress((currentTime / duration) * 100);
  }, []);

  const handleTrackClick = useCallback((e) => {
    if (!audioRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  }, []);

  const locationLabel = location
    ? String(location).split(',')[0].trim().toUpperCase()
    : 'ONLINE';

  return (
    <Bar>
      <audio
        ref={audioRef}
        loop
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />
      <BarContent>
        <TimeRow>
          <Mono>{time}</Mono>
          <Mono>| {locationLabel}</Mono>
        </TimeRow>

        <AudioPlayer>
          <PlayBtn onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <rect x="0" y="0" width="4" height="14" rx="1" fill="rgb(41, 73, 111)" />
                <rect x="8" y="0" width="4" height="14" rx="1" fill="rgb(41, 73, 111)" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M0 0L12 7L0 14V0Z" fill="rgb(41, 73, 111)" />
              </svg>
            )}
          </PlayBtn>
          <Track ref={trackRef} onClick={handleTrackClick}>
            <TrackBg />
            <TrackFill style={{ width: `${progress}%` }} />
          </Track>
        </AudioPlayer>

        <Mono>&copy; {new Date().getFullYear()}</Mono>
      </BarContent>
    </Bar>
  );
}

const Bar = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 87px;
  background: linear-gradient(
    180deg,
    rgba(249, 248, 247, 0) 0%,
    rgb(229, 235, 243) 64%,
    rgb(236, 240, 246) 100%
  );
  pointer-events: none;
`;

const BarContent = styled.div`
  position: absolute;
  bottom: 16px;
  left: 64px;
  right: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;

  @media (max-width: 809px) {
    left: 20px;
    right: 20px;
    bottom: 12px;
  }
`;

const TimeRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  z-index: 1;
`;

const Mono = styled.span`
  font-family: 'Server Mono', 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.03em;
  color: rgb(41, 73, 111);
`;

const AudioPlayer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  width: 209px;

  @media (max-width: 809px) {
    width: 140px;
  }
`;

const PlayBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Track = styled.div`
  position: relative;
  flex: 1;
  height: 3px;
  cursor: pointer;
`;

const TrackBg = styled.div`
  position: absolute;
  inset: 0;
  background: rgb(211, 216, 224);
  border-radius: 2px;
`;

const TrackFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: rgb(41, 73, 111);
  border-radius: 2px;
  transition: width 0.1s linear;
`;
