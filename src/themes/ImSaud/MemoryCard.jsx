import {
  MemCard,
  MemCardArt,
  MemCardScrew,
  MemCardStamp,
  MemFaceBack,
  MemFaceCap,
  MemFaceFront,
  MemFaceSide,
} from './styles';

/**
 * A PS2 memory card as six transformed divs.
 *
 * The source uses a photograph of a third-party card for the front and back
 * faces; drawing it instead keeps the theme asset-free and lets the capacity
 * stamp come from the data the card is standing in for.
 */
export function MemoryCard({ active, spin, rainbow, covered, bare, capacity = '8', label = 'MEMORY CARD' }) {
  const faceProps = { $active: active, $rainbow: rainbow };

  const art = (
    <MemCardArt $rainbow={rainbow}>
      <MemCardScrew />
      <MemCardScrew $right />
      <MemCardStamp>
        <strong>
          {capacity}
          <span style={{ fontSize: '0.5em', marginLeft: 6 }}>MB</span>
        </strong>
        <em>{label}</em>
      </MemCardStamp>
    </MemCardArt>
  );

  return (
    <MemCard $spin={spin} $covered={covered} $bare={bare} aria-hidden="true">
      <MemFaceFront {...faceProps}>{art}</MemFaceFront>
      <MemFaceBack {...faceProps}>{art}</MemFaceBack>
      <MemFaceSide {...faceProps} $left />
      <MemFaceSide {...faceProps} />
      <MemFaceCap {...faceProps} $top />
      <MemFaceCap {...faceProps} />
    </MemCard>
  );
}
