import React, { useState, useEffect, useRef, memo } from 'react';
import styled from 'styled-components';

/* ── Drag hook ─────────────────────────────────────────── */
function useDrag() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const onPointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    origin.current = { x: pos.x, y: pos.y, startX: e.clientX, startY: e.clientY };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setPos({
        x: origin.current.x + (e.clientX - origin.current.startX),
        y: origin.current.y + (e.clientY - origin.current.startY),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging]);

  const reset = () => setPos({ x: 0, y: 0 });
  return { pos, dragging, onPointerDown, reset };
}

/* ── Clock Widget ──────────────────────────────────────── */
function ClockWidgetInner({ theme }) {
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const ref = useRef(null);
  const drag = useDrag();
  const wasDragged = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!expanded) {
      drag.reset();
      setShowContent(false);
      return;
    }
    const t = setTimeout(() => setShowContent(true), 80);
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setExpanded(false);
    };
    document.addEventListener('mousedown', handler);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [expanded]);

  useEffect(() => {
    if (drag.dragging) wasDragged.current = true;
  }, [drag.dragging]);

  const handleClick = () => {
    if (wasDragged.current) { wasDragged.current = false; return; }
    setExpanded(false);
  };

  const hours = (now.getHours() % 12) * 30 + (now.getMinutes() / 60) * 30;
  const minutes = now.getMinutes() * 6 + (now.getSeconds() / 60) * 6;
  const seconds = now.getSeconds() * 6;
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeParts = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).split(' ');
  const timeStr = timeParts[0];
  const ampm = timeParts[1];

  return (
    <Container ref={ref}>
      {expanded && <Overlay onClick={() => setExpanded(false)} />}
      <Shell
        $expanded={expanded}
        $theme={theme}
        $dragging={drag.dragging}
        $width={expanded ? 180 : 80}
        $height={expanded ? 260 : 32}
        $radius={expanded ? 24 : 16}
        onClick={expanded ? handleClick : () => setExpanded(true)}
        onPointerDown={expanded ? drag.onPointerDown : undefined}
        style={expanded ? {
          transform: `translate(${drag.pos.x}px, ${drag.pos.y}px)`,
          cursor: drag.dragging ? 'grabbing' : 'grab',
        } : { cursor: 'pointer' }}
      >
        {/* Collapsed */}
        <ContentLayer $visible={!expanded}>
          <CollapsedInner>
            <DateSmall $theme={theme}>{dateStr}</DateSmall>
            <FaceSmall>
              <HandSmall $angle={hours - 90} $length="7px" $width="1.2px" $color={theme.muted} />
              <HandSmall $angle={minutes - 90} $length="9px" $width="1px" $color={theme.muted} />
              <SecondHandSmall $angle={seconds - 90} $color={theme.underline} />
              <CenterSmall $theme={theme} />
            </FaceSmall>
          </CollapsedInner>
        </ContentLayer>

        {/* Expanded */}
        <ContentLayer $visible={expanded && showContent}>
          <ExpandedInner>
            <DateLabel $theme={theme}>{dateStr}</DateLabel>
            <Face>
              <Ring $theme={theme} />
              {Array.from({ length: 60 }).map((_, i) => (
                <Tick key={i} $angle={i * 6} $theme={theme} $isMajor={i % 5 === 0} $isQuarter={i % 15 === 0} />
              ))}
              <Hand $angle={hours - 90} $length="30px" $width="2px" $color={theme.text} />
              <Hand $angle={minutes - 90} $length="42px" $width="2px" $color={theme.text} />
              <SecondHand $angle={seconds - 90} $theme={theme} />
              <Center $theme={theme} />
            </Face>
            <TimeLabel $theme={theme}>{timeStr}</TimeLabel>
            <AmPmLabel $theme={theme}>{ampm}</AmPmLabel>
          </ExpandedInner>
        </ContentLayer>
      </Shell>
    </Container>
  );
}

export const ClockWidget = memo(ClockWidgetInner);

/* ── Styled Components ─────────────────────────────────── */

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
`;

const Shell = styled.div`
  position: ${({ $expanded }) => $expanded ? 'absolute' : 'relative'};
  top: ${({ $expanded }) => $expanded ? '-8px' : 'auto'};
  z-index: ${({ $expanded }) => $expanded ? 9999 : 50};
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border-radius: ${({ $radius }) => $radius}px;
  background: ${({ $expanded, $theme }) => $expanded ? $theme.surface : 'transparent'};
  overflow: hidden;
  user-select: none;
  touch-action: ${({ $expanded }) => $expanded ? 'none' : 'auto'};
  transition:
    width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-radius 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
    background 0.25s ease,
    box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: ${({ $expanded, $dragging }) => {
    if (!$expanded) return 'none';
    return $dragging
      ? '0 0 0 1px rgba(0,0,0,0.1), 0px 4px 4px -1.5px rgba(0,0,0,0.07), 0px 8px 8px -3px rgba(0,0,0,0.05), 0px 16px 16px -6px rgba(0,0,0,0.07), 0px 32px 32px -12px rgba(0,0,0,0.08)'
      : '0 0 0 1px rgba(0,0,0,0.08), 0px 3px 3px -1.5px rgba(0,0,0,0.05), 0px 6px 6px -3px rgba(0,0,0,0.03), 0px 12px 12px -6px rgba(0,0,0,0.05), 0px 24px 24px -12px rgba(0,0,0,0.05)';
  }};
  &:hover {
    background: ${({ $expanded, $theme }) => $expanded ? $theme.surface : 'rgba(20, 27, 20, 0.08)'};
  }
`;

const ContentLayer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  filter: ${({ $visible }) => $visible ? 'blur(0)' : 'blur(8px)'};
  transform: ${({ $visible }) => $visible ? 'scale(1)' : 'scale(1.04)'};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
  transition:
    opacity 0.2s cubic-bezier(0.165, 0.84, 0.44, 1),
    filter 0.2s cubic-bezier(0.165, 0.84, 0.44, 1),
    transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const CollapsedInner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
`;

const ExpandedInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
`;

const DateSmall = styled.span`
  display: none;
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 13px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
  color: ${({ $theme }) => $theme.muted};
  text-decoration-color: ${({ $theme }) => $theme.underline};
  @media (min-width: 640px) { display: inline; }
`;

const DateLabel = styled.span`
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $theme }) => $theme.text};
  font-variant-numeric: tabular-nums;
`;

const Face = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const Ring = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px ${({ $theme }) => `${$theme.text}26`};
`;

const Tick = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center bottom;
  transform: translate(-50%, -50%) rotate(${({ $angle }) => $angle}deg) translateY(-54px);
  &::after {
    content: '';
    display: block;
    border-radius: 999px;
    background: ${({ $theme, $isMajor }) => $isMajor ? `${$theme.text}99` : `${$theme.text}40`};
    width: ${({ $isQuarter, $isMajor }) => $isQuarter ? '2px' : $isMajor ? '1.5px' : '1px'};
    height: ${({ $isQuarter, $isMajor }) => $isQuarter ? '8px' : $isMajor ? '6px' : '4px'};
  }
`;

const Hand = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform-origin: center center;
  transform: rotate(${({ $angle }) => $angle}deg);
  &::after {
    content: '';
    position: absolute;
    width: ${({ $length }) => $length};
    height: ${({ $width }) => $width};
    left: calc(50% + 2px);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 2px;
    background: ${({ $color }) => $color};
  }
`;

const SecondHand = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform-origin: center center;
  transform: rotate(${({ $angle }) => $angle}deg);
  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 1px;
    right: calc(50% + 2px);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 0.5px;
    background: ${({ $theme }) => $theme.underline};
  }
  &::after {
    content: '';
    position: absolute;
    width: 48px;
    height: 1px;
    left: calc(50% + 2px);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 0.5px;
    background: ${({ $theme }) => $theme.underline};
  }
`;

const Center = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 10;
  background: ${({ $theme }) => $theme.underline};
  box-shadow: 0 0 0 1.5px ${({ $theme }) => $theme.surface};
`;

const TimeLabel = styled.span`
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 24px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ $theme }) => $theme.text};
`;

const AmPmLabel = styled.span`
  font-family: 'JetBrains Mono', 'Instrument Sans', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  color: ${({ $theme }) => $theme.muted};
  margin-top: -4px;
`;

const FaceSmall = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
`;

const HandSmall = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0% 50%;
  transform: rotate(${({ $angle }) => $angle}deg);
  &::after {
    content: '';
    display: block;
    width: ${({ $length }) => $length};
    height: ${({ $width }) => $width};
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }
`;

const SecondHandSmall = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0% 50%;
  transform: rotate(${({ $angle }) => $angle}deg);
  &::after {
    content: '';
    display: block;
    width: 10px;
    height: 0.75px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }
`;

const CenterSmall = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  z-index: 10;
  background: ${({ $theme }) => $theme.underline};
`;
