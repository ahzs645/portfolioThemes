import { useEffect, useRef } from 'react';
import {
  ClockSystemEl,
  Cube,
  CubeFace,
  CubeField,
  Hex,
  HexCap,
  HexSide,
  Orb,
  ShapeField,
} from './styles';

/**
 * The PlayStation 2 dashboard clock, transcribed from the source's animation
 * loop rather than approximated.
 *
 * Seven orbs ride a ring whose orientation is the product of three rotation
 * matrices built from the wall clock: a Z-rotation at one turn per second, an
 * X-rotation that also carries a minute-indexed tilt, and a final Z-rotation
 * for the hour hand. Twelve hexagonal prisms stand in for the hours; the
 * current one lights cyan and fills from the bottom as the minutes drain.
 */

const PI = Math.PI;
const HALF_PI = PI / 2;
const ORB_SPACING = (6 * PI) / 180;
// Tilt anchors the ring interpolates between, one per minute-modulo-3 step.
const TILT_ANCHORS = [PI / 2, PI + PI / 6, 0];
const ORB_COUNT = 7;
const ORB_RADIUS = 90;

function rotateZ(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function rotateX(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function multiply(a, b) {
  const out = new Array(9);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      out[row * 3 + col] =
        a[row * 3] * b[col] + a[row * 3 + 1] * b[3 + col] + a[row * 3 + 2] * b[6 + col];
    }
  }
  return out;
}

const CUBES = [
  { left: -200, top: -420, dur: 14, delay: -2, tz: 40, rx: 360, ry: 360, rz: 0 },
  { left: -420, top: -240, dur: 11, delay: -7, tz: 30, rx: -360, ry: 360, rz: 360 },
  { left: -200, top: -70, dur: 16, delay: -4, tz: 50, rx: 360, ry: 0, rz: -360 },
  { left: -420, top: 130, dur: 13, delay: -9, tz: 20, rx: 0, ry: -360, rz: 360 },
  { left: -200, top: 280, dur: 10, delay: -1, tz: 45, rx: 360, ry: -360, rz: 360 },
];

const CUBE_FACES = [
  'translateZ(30px)',
  'rotateY(180deg) translateZ(30px)',
  'rotateY(90deg) translateZ(30px)',
  'rotateY(-90deg) translateZ(30px)',
  'rotateX(90deg) translateZ(30px)',
  'rotateX(-90deg) translateZ(30px)',
];

const HOURS = Array.from({ length: 12 }, (_, i) => i);
const HEX_SIDES = [0, 1, 2, 3, 4, 5];

export function ClockSystem({ running, showCrystals, showCubes, activeCube, crystalScale, fieldScale }) {
  const orbsRef = useRef([]);
  const shapesRef = useRef(null);
  const hexRefs = useRef([]);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const lastHourRef = useRef(-1);
  const lastFillRef = useRef(-1);

  useEffect(() => {
    if (!running) return undefined;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const draw = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const hour12 = now.getHours() % 12;
      const seconds = now.getSeconds() + now.getMilliseconds() / 1000;

      const hourAngle =
        (90 + (((3600 * now.getHours() + 60 * minutes + seconds) / 3600) % 12) * -30) * (PI / 180);
      const anchor = TILT_ANCHORS[minutes % 3];
      const tilt = anchor + (seconds / 60) * (TILT_ANCHORS[(minutes + 1) % 3] - anchor);

      const matrix = multiply(
        multiply(rotateZ(-PI * seconds), rotateX(HALF_PI * seconds + tilt)),
        rotateZ(hourAngle),
      );

      for (let i = 0; i < ORB_COUNT; i += 1) {
        const orb = orbsRef.current[i];
        if (!orb) continue;
        const spread = seconds * i * ORB_SPACING;
        const x = ORB_RADIUS * Math.cos(spread);
        const y = ORB_RADIUS * Math.sin(spread);
        const z = 0.2 * i;
        orb.style.transform = `translate3d(${matrix[0] * x + matrix[1] * y + matrix[2] * z}px, ${
          matrix[3] * x + matrix[4] * y + matrix[5] * z
        }px, ${matrix[6] * x + matrix[7] * y + matrix[8] * z}px)`;
      }

      const shapes = shapesRef.current;
      if (shapes) {
        const axis = 30 * hour12 * (PI / 180);
        shapes.style.transform = `translateZ(-200px) scale(${crystalScale}) rotateX(-20deg) rotateY(15deg) rotate3d(${Math.sin(
          axis,
        )}, ${-Math.cos(axis)}, 0, ${(seconds / 60) * 360}deg)`;

        const fill = Math.round(100 - (minutes / 60) * 100);
        if (fill !== lastFillRef.current) {
          shapes.style.setProperty('--fill', `${fill}%`);
          lastFillRef.current = fill;
        }
        if (hour12 !== lastHourRef.current) {
          hexRefs.current.forEach((el, index) => {
            if (el) el.dataset.hour = index === hour12 ? 'true' : 'false';
          });
          lastHourRef.current = hour12;
        }
      }
    };

    if (reduceMotion) {
      draw();
      return undefined;
    }

    const loop = (time) => {
      frameRef.current = requestAnimationFrame(loop);
      if (time - lastRef.current < 16) return;
      lastRef.current = time;
      draw();
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [running, crystalScale]);

  return (
    <>
      <ClockSystemEl aria-hidden="true">
        {Array.from({ length: ORB_COUNT }, (_, i) => (
          <Orb
            key={i}
            ref={(el) => {
              orbsRef.current[i] = el;
            }}
          />
        ))}
      </ClockSystemEl>

      <CubeField $visible={showCubes} $scale={fieldScale} aria-hidden="true">
        {CUBES.map((cube, index) => (
          <Cube
            key={index}
            style={{
              left: `${cube.left}px`,
              top: `${cube.top}px`,
              '--tumble-dur': `${cube.dur}s`,
              '--tumble-delay': `${cube.delay}s`,
              '--tumble-tz': `${cube.tz}px`,
              '--tumble-rx': `${cube.rx}deg`,
              '--tumble-ry': `${cube.ry}deg`,
              '--tumble-rz': `${cube.rz}deg`,
            }}
          >
            {CUBE_FACES.map((transform, faceIndex) => (
              <CubeFace key={faceIndex} $active={index === activeCube} style={{ transform }} />
            ))}
          </Cube>
        ))}
      </CubeField>

      <ShapeField $visible={showCrystals} ref={shapesRef} aria-hidden="true">
        {HOURS.map((hour) => (
          <Hex
            key={hour}
            $angle={hour * 30}
            data-hour="false"
            ref={(el) => {
              hexRefs.current[hour] = el;
            }}
          >
            {HEX_SIDES.map((side) => (
              <HexSide key={side} $index={side} />
            ))}
            <HexCap $top data-cap="top" />
            <HexCap data-cap="bottom" />
          </Hex>
        ))}
      </ShapeField>
    </>
  );
}
