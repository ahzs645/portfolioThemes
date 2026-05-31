# Noah Finer Custom Marks

Extracted from:

`/Users/ahmadjalil/Downloads/porfolio/noahfiner.com/noahfiner.com/static/js/img/Logo.tsx`

These are the original vector outlines used for the opening Noah mark. The deployed site also ships a flattened PNG at `static/media/logo-black.c4b2c5418d1306095f94.png`, but these SVG paths are cleaner source material for building a font.

Files:

- `noah-mark.svg` - the complete four-letter mark.
- `n.svg` - isolated `N` outline.
- `o.svg` - isolated `o` outline.
- `a.svg` - isolated `a` outline.
- `h.svg` - isolated `h` outline.

Notes for font work:

- All SVGs use the original `viewBox="0 0 213 228"` coordinate system.
- Import each isolated SVG into a glyph editor, then normalize scale, baseline, side bearings, and advance width there.
- The source mark is custom lettering/path art, not a complete font, so new letters will need to be designed from these style references.
