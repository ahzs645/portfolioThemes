import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ACCENT, SONGS } from '../constants';

const pulse = keyframes`
  0%, 100% {
    box-shadow:
      0 5px 5px rgba(0, 0, 0, 0.5),
      inset 0 1px 10px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow:
      -2px -2px 20px rgba(120, 255, 223, 0.08),
      0 5px 5px rgba(0, 0, 0, 0.5),
      inset 0 4px 10px rgba(0, 0, 0, 0.3);
  }
`;

function shuffleSongs() {
  return [...SONGS].sort(() => Math.random() - 0.5);
}

export function MusicPlayer() {
  const audioRef = useRef(null);
  const playlist = useMemo(() => shuffleSongs(), []);
  const [index, setIndex] = useState(() => Math.floor(Math.random() * playlist.length));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentSong = playlist[index] || SONGS[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return undefined;

    audio.src = currentSong.file;
    if (!isPlaying) {
      audio.pause();
      return undefined;
    }

    audio.play().catch(() => {
      setIsPlaying(false);
    });

    return undefined;
  }, [currentSong, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying((value) => !value);
  };

  return (
    <Wrap>
      <Meta>
        <Title>{currentSong.title}</Title>
        <Artist>{currentSong.artist}</Artist>
      </Meta>

      <Orb
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play random song'}
        $isHovered={isHovered}
        $isPlaying={isPlaying}
        onClick={togglePlayback}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isPlaying ? (
          <PauseIcon viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </PauseIcon>
        ) : (
          <PlayIcon viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </PlayIcon>
        )}
      </Orb>

      <audio ref={audioRef} preload="none" onEnded={() => setIsPlaying(false)} />
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Meta = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
`;

const sharedTrack = `
  width: 100%;
  overflow: hidden;
  font-family: 'Alpha Lyrae', sans-serif;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-feature-settings: 'liga' off, 'ss02' on, 'ss01' on, 'calt' off;
`;

const Title = styled.span`
  ${sharedTrack}
  color: #000;
  font-size: 14px;
`;

const Artist = styled.span`
  ${sharedTrack}
  color: rgba(0, 0, 0, 0.72);
  font-size: 14px;
`;

const Orb = styled.button`
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border: 1px solid ${({ $isPlaying }) => ($isPlaying ? '#000' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 999px;
  cursor: pointer;
  background: ${({ $isPlaying }) =>
    $isPlaying
      ? 'linear-gradient(180deg, rgb(10, 10, 10), rgb(18, 18, 18))'
      : 'linear-gradient(180deg, rgb(23, 23, 23), rgb(10, 10, 10))'};
  opacity: ${({ $isHovered }) => ($isHovered ? 0.6 : 1)};
  transform: ${({ $isPlaying }) => ($isPlaying ? 'scale(0.99)' : 'scale(1)')};
  transition: transform 0.3s ease, opacity 0.2s ease;
  will-change: transform, opacity;
  box-shadow:
    ${({ $isPlaying }) =>
      $isPlaying ? '-2px -2px 20px rgba(120, 255, 223, 0)' : '0 5px 5px rgba(0, 0, 0, 0.5)'},
    inset 0 ${({ $isPlaying }) => ($isPlaying ? '4px' : '1px')} 10px
      rgba(0, 0, 0, ${({ $isPlaying }) => ($isPlaying ? '0.3' : '0.2')});
  animation: ${({ $isPlaying }) => ($isPlaying ? pulse : 'none')} 2.6s ease-in-out infinite;
`;

const sharedIcon = `
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  fill: ${ACCENT};
`;

const PlayIcon = styled.svg`
  ${sharedIcon}
`;

const PauseIcon = styled.svg`
  ${sharedIcon}
`;
