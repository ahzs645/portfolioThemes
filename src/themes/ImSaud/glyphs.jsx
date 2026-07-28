import {
  ArrowKeys,
  ArrowRow,
  CircleGlyph,
  CrossGlyph,
  DPad,
  DPadDir,
  KeyCap,
  KeySurface,
  PadButton,
  SquareKey,
  SquareSurface,
} from './styles';

/**
 * The prompt strip glyphs. The source swaps keyboard caps for controller
 * buttons the moment a gamepad reports input, so both sets live here.
 */

export function Key({ label }) {
  return (
    <KeyCap>
      <KeySurface>{label}</KeySurface>
    </KeyCap>
  );
}

export function Cross() {
  return (
    <PadButton>
      <CrossGlyph />
    </PadButton>
  );
}

export function Circle() {
  return (
    <PadButton>
      <CircleGlyph />
    </PadButton>
  );
}

export function Arrows({ dirs = ['up', 'down'], row = false }) {
  const has = (dir) => dirs.includes(dir);

  if (row && has('left') && has('right') && has('up')) {
    return (
      <ArrowKeys>
        <SquareKey>
          <SquareSurface>▲</SquareSurface>
        </SquareKey>
        <ArrowRow>
          <SquareKey>
            <SquareSurface>◀</SquareSurface>
          </SquareKey>
          <SquareKey>
            <SquareSurface>▼</SquareSurface>
          </SquareKey>
          <SquareKey>
            <SquareSurface>▶</SquareSurface>
          </SquareKey>
        </ArrowRow>
      </ArrowKeys>
    );
  }

  return (
    <ArrowKeys $row={row}>
      {has('up') && (
        <SquareKey>
          <SquareSurface>▲</SquareSurface>
        </SquareKey>
      )}
      {has('left') && (
        <SquareKey>
          <SquareSurface>◀</SquareSurface>
        </SquareKey>
      )}
      {has('right') && (
        <SquareKey>
          <SquareSurface>▶</SquareSurface>
        </SquareKey>
      )}
      {has('down') && (
        <SquareKey>
          <SquareSurface>▼</SquareSurface>
        </SquareKey>
      )}
    </ArrowKeys>
  );
}

export function Pad({ dirs = ['up', 'down'] }) {
  return (
    <DPad>
      <DPadDir $dir="up" $active={dirs.includes('up')} />
      <DPadDir $dir="down" $active={dirs.includes('down')} />
      <DPadDir $dir="left" $active={dirs.includes('left')} />
      <DPadDir $dir="right" $active={dirs.includes('right')} />
    </DPad>
  );
}

/** Select / confirm hint: ENTER on a keyboard, cross on a pad. */
export function ConfirmGlyph({ gamepad }) {
  return gamepad ? <Cross /> : <Key label="ENTER" />;
}

/** Back hint: BACKSPACE on a keyboard, circle on a pad. */
export function BackGlyph({ gamepad }) {
  return gamepad ? <Circle /> : <Key label="BACKSPACE" />;
}

/** Navigation hint: arrow caps on a keyboard, the D-pad on a controller. */
export function NavGlyph({ gamepad, dirs, row }) {
  return gamepad ? <Pad dirs={dirs} /> : <Arrows dirs={dirs} row={row} />;
}
