# portfolioThemes - AI Instruction Set

## What This Project Is

A React + Vite portfolio engine with 49+ interchangeable themes. Every theme renders the same CV data (`public/CV.yaml`) with a completely different visual design. Users pick a theme via URL slug (e.g., `/minimal`, `/terminal`, `/retro-computer`).

- **Live site**: https://portfolio.ahmadjalil.com
- **Stack**: React 18, Vite 6, Styled Components, GSAP, Framer Motion, Three.js
- **Deploy**: GitHub Pages via GitHub Actions

---

## The Core Workflow: Adapting Reference Sites Into Themes

The primary task an AI will be asked to do is: **take a reference portfolio website and adapt it into a new theme component for this system.**

### Step-by-Step Process

#### 1. Analyze the Reference

You will be given one or more of:
- A **live URL** to an existing portfolio site
- **Downloaded source code** (may be minified/bundled)
- A **GitHub repo** link
- A **screenshot or description** of the desired design

**If the code is minified or bundled**, use `https://github.com/ahzs645/jsmap` (a React+Vite project tool) to help map and deobfuscate the JavaScript. This is especially useful for sites built with Next.js, Vite, or Webpack where the production code is heavily transformed.

**Key things to extract from the reference:**
- Color palette (backgrounds, text, accents)
- Typography (font families, sizes, weights)
- Layout structure (single column, two column, grid, sidebar, etc.)
- Section ordering and visual treatment
- Animations and interactions
- Special visual effects (gradients, borders, shadows, textures)
- Dark/light mode behavior
- Any distinctive UI elements (nav bars, cards, timelines, etc.)

#### 2. Create the Theme Files

Every theme lives in `src/themes/<ThemeName>/` and needs at minimum:

```
src/themes/YourTheme/
  YourThemeTheme.jsx     # Main React component
  yourTheme.css          # (optional) raw CSS if using ShadowRoot
  assets/                # (optional) fonts, images, etc.
```

#### 3. Implement the Component

There are two patterns depending on whether the theme needs style isolation:

**Pattern A: Styled Components / Inline Styles (simpler, most common)**

```jsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { useGitHub } from '../../contexts/GitHubContext'; // optional
import { isPresent, isArchived, flattenExperience } from '../../utils/cvHelpers';

export function YourThemeTheme() {
  const cv = useCV();
  const github = useGitHub(); // optional - for GitHub activity data

  if (!cv) return null;

  const name = cv.name || 'Your Name';
  const email = cv.email;
  const location = cv.location;
  const website = cv.website;
  const about = cv.about;
  const socialLinks = cv.socialLinks; // { github, linkedin, twitter, ... }

  // CV sections (all optional, always check existence)
  const experience = cv.experience || [];       // already flattened by ConfigContext
  const projects = cv.projects || [];
  const education = cv.education || [];
  const skills = cv.skills || [];
  const awards = cv.awards || [];
  const publications = cv.publications || [];
  const certifications = cv.certifications || [];

  return (
    <Container>
      {/* Render your theme layout using cv data */}
    </Container>
  );
}
```

**Pattern B: ShadowRoot + Raw CSS (for full CSS isolation)**

```jsx
import React from 'react';
import { useCV, useConfig } from '../../contexts/ConfigContext';
import { ShadowRoot } from '../../ui/ShadowRoot';
import rawStyles from './yourTheme.css?raw';
import customFontUrl from './assets/custom-font.woff2?url';

const STYLE_TEXT = rawStyles.replaceAll('__CUSTOM_FONT__', customFontUrl);

export function YourThemeTheme() {
  const cv = useCV();
  if (!cv) return null;

  return (
    <ShadowRoot styleText={STYLE_TEXT}>
      {/* Render theme inside shadow DOM */}
    </ShadowRoot>
  );
}
```

#### 4. Register the Theme

In `src/themes/index.js`:

1. Add the import at the top:
```js
import { YourThemeTheme } from './YourTheme/YourThemeTheme';
```

2. Add the entry to the `PORTFOLIO_THEMES` array:
```js
{
  id: 'your-theme',           // unique kebab-case ID
  slug: 'your-slug',          // URL path (e.g., /your-slug)
  name: 'Your Theme Name',    // display name in theme catalog
  description: 'Short description of the visual style and key features.',
  source: 'https://original-site.com',  // reference site URL (or null)
  Component: YourThemeTheme,
},
```

#### 5. Test It

```bash
npm run dev
# Visit http://localhost:5173/your-slug
```

---

## CV Data Shape Reference

When using `useCV()`, the returned object has this shape (all fields may be null/undefined):

```
cv.name             - string
cv.email            - string
cv.phone            - string
cv.location         - string
cv.website          - string
cv.avatar           - string (URL)
cv.avatarAspect     - number
cv.about            - string (bio/summary, markdown stripped)
cv.currentTitle     - string (derived from most recent current position)

cv.socialLinks      - object { github, linkedin, twitter, facebook, instagram, youtube, website, ... }
                      each value is a URL string or undefined

cv.experience       - array (flattened - nested positions already expanded)
  [].company        - string
  [].title          - string (position title)
  [].location       - string
  [].startDate      - string (YYYY-MM)
  [].endDate        - string (YYYY-MM or "present")
  [].isCurrent      - boolean
  [].highlights     - string[]
  [].url            - string

cv.projects         - array
  [].name           - string
  [].description    - string
  [].url            - string
  [].startDate      - string
  [].endDate        - string
  [].highlights     - string[]

cv.education        - array
  [].school         - string
  [].degree         - string
  [].startDate      - string
  [].endDate        - string
  [].gpa            - string
  [].highlights     - string[]

cv.skills           - string[] (flat list)
cv.languages        - string[]

cv.awards           - array
  [].title          - string
  [].issuer         - string
  [].date           - string
  [].description    - string

cv.publications     - array
cv.presentations    - array
cv.certifications   - array
cv.volunteer        - array
cv.professionalDevelopment - array
```

When using `useConfig()` directly, you get `{ cvData, loading, error }` where `cvData` is the raw parsed YAML. Most themes should use `useCV()` which returns the normalized data above.

### GitHub Data (Optional)

```jsx
import { useGitHub } from '../../contexts/GitHubContext';

const github = useGitHub();
// github.profile   - GitHub user profile object
// github.repos     - array of repositories
// github.events    - recent activity events
// github.activity  - contribution calendar data (from github-activity.json)
// github.languages - aggregated language stats
// github.loading   - boolean
// github.error     - string or null
```

---

## Working With Minified / Bundled Source Code

Reference sites are often deployed as minified production builds. Here's how to work with them:

### Using jsmap (https://github.com/ahzs645/jsmap)

This is a companion tool for mapping and understanding minified JavaScript from reference sites. Use it when:
- The reference site's code is webpack/vite/next.js bundled and minified
- Class names are hashed (e.g., `.a3f2b1` instead of `.header`)
- Variable names are single letters
- You need to understand the original component structure

### Manual Deobfuscation Strategy

When working with minified code without source maps:

1. **Identify the framework** - Look for React markers (`__NEXT_DATA__`, `_reactRootContainer`), Vue markers, etc.
2. **Extract the CSS first** - CSS is often the most useful part. Even minified CSS preserves:
   - Color values (`#hex`, `rgb()`, `hsl()`)
   - Font declarations (`font-family`, `@font-face`)
   - Layout properties (`display: grid`, `flex`, widths)
   - Media queries (breakpoints)
   - Animations (`@keyframes`)
3. **Use browser DevTools** - Inspect computed styles on the live site to extract exact values
4. **Screenshot + rebuild** - Sometimes it's faster to screenshot sections and rebuild from visual reference than to reverse-engineer minified code

### Creative Liberty

You do NOT need to create a 1:1 pixel-perfect copy. The goal is to **capture the essence and visual identity** of the reference site while adapting it to work with our CV data structure. This means:

- **Adapt sections** to match CV.yaml fields (the reference might have "Work" but we use `experience`)
- **Simplify interactions** that don't translate (e.g., CMS-driven content becomes static CV data)
- **Add or remove sections** based on what CV.yaml provides
- **Adjust responsive behavior** as needed
- **Keep the visual DNA** - colors, typography, spacing, mood, distinctive elements
- **Skip non-portfolio features** - blogs, contact forms with backends, analytics, etc.

---

## Utility Functions Available

### From `../../utils/cvHelpers`
```js
isPresent(dateValue)              // returns true if date is "present"
isArchived(entry)                 // returns true if entry has 'archived' tag
flattenExperience(experience, options)  // flatten nested positions
normalizeSocialLinks(social)      // normalize social array to { github, linkedin, ... }
filterActive(items)               // remove archived items
getCurrentJobTitle(experience)    // get most recent current position title
```

### From `../../utils/assetPath`
```js
withBase(path)   // resolve asset path with base prefix for GitHub Pages
stripBase(path)  // strip base prefix from pathname for routing
```

### From `../../ui/ShadowRoot`
```jsx
<ShadowRoot styleText={cssString}>
  {/* children rendered in isolated shadow DOM */}
</ShadowRoot>
```
Use ShadowRoot when your theme has CSS that could conflict with other themes or the app shell. Especially useful when adapting raw CSS from reference sites.

**Note on @font-face in ShadowRoot**: Most browsers don't support `@font-face` inside Shadow DOM. If your theme uses custom fonts, inject the `@font-face` declarations into the document `<head>` separately (see `AnsubMinimalTheme` for an example pattern).

---

## Project Commands

```bash
npm run dev              # Dev server (fixed theme, shows theme bar)
npm run dev:random       # Dev server (random theme on /)
npm run build            # Production build
npm run build:random     # Production build (random mode)
npm run prefetch         # Fetch GitHub contribution data
```

---

## File Locations Quick Reference

| What | Where |
|------|-------|
| Theme components | `src/themes/<Name>/<Name>Theme.jsx` |
| Theme registry | `src/themes/index.js` |
| CV data source | `public/CV.yaml` |
| Config context | `src/contexts/ConfigContext.jsx` |
| GitHub context | `src/contexts/GitHubContext.jsx` |
| CV helper utils | `src/utils/cvHelpers.js` |
| Asset path utils | `src/utils/assetPath.js` |
| ShadowRoot component | `src/ui/ShadowRoot.jsx` |
| App shell / routing | `src/App.jsx` |
| Entry point | `src/main.jsx` |
| Vite config | `vite.config.js` |
| Deploy workflow | `.github/workflows/deploy.yml` |

---

## Checklist for New Theme PRs

- [ ] Theme component created in `src/themes/<Name>/`
- [ ] Uses `useCV()` or `useConfig()` to access CV data
- [ ] Handles missing/optional CV fields gracefully (null checks)
- [ ] Registered in `src/themes/index.js` with unique `id` and `slug`
- [ ] `source` field set to reference site URL (or `null` if original)
- [ ] Works at `http://localhost:5173/<slug>`
- [ ] No hardcoded personal data - everything from CV.yaml
- [ ] Responsive (works on mobile and desktop)
- [ ] No console errors
