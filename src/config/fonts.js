// Single consolidated Google Fonts stylesheet for every theme in the catalog.
//
// Themes must NOT @import fonts.googleapis.com inside styled-components (it
// blocks that theme's first paint) or inject <link> tags at runtime. Instead:
// 1. Add the family (with the weights/styles you need) to this URL.
// 2. Mirror the change in the <link> tag in index.html — the static tag is
//    what the main app loads; this constant is injected into the sandboxed
//    catalog-preview iframes, which don't inherit index.html styles.
// Font binaries are only downloaded when a page actually uses the family, so
// unused families in this list cost one shared CSS request, not font traffic.
export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,200;1,9..40,300;1,9..40,400&family=EB+Garamond&family=Figtree:wght@300;400;500;600;700;800;900&family=Fira+Mono:wght@400;700&family=Fraunces:opsz,wght@9..144,200;9..144,300;9..144,400;9..144,500;9..144,600&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif&family=Inter+Tight:wght@400;500;600&family=Inter:wght@300;400;450;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@600;700&family=Noto+Serif+KR:wght@200;300&family=Rammetto+One&family=Roboto+Mono:wght@400;500;700&family=Space+Mono:wght@400;700&family=Ubuntu+Mono:wght@400;700&family=Ubuntu:wght@300;400;500;700&family=Unica+One&family=Yeseva+One&display=swap';
