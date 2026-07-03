# Portfolio Themes

A portfolio theme catalog built with React and Vite. Each theme is accessible via its own URL path and renders content from a single `CV.yaml` data file.

**Live Demo:** [portfolio.ahmadjalil.com](https://portfolio.ahmadjalil.com)

## Available Themes

The active theme list lives in `src/themes/index.js`. Open the running app and use **Browse Themes** to search by name, slug, description, or source.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Styled Components
- **3D Graphics:** Three.js, React Three Fiber, Drei
- **Animation:** GSAP
- **Data:** YAML (js-yaml)
- **Deployment:** GitHub Pages

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with a random theme on each fresh visit to /
npm run dev:random

# Build for production
npm run build

# Build a production bundle that randomizes the theme on each fresh visit to /
npm run build:random

# Preview production build
npm run preview

# Run route-level smoke checks for registered themes
npm run qa:themes
```

`npm run build` refreshes `public/github-activity.json` before bundling so the activity visualizations can be served as static data. Run `npm run prefetch` when you want to update that file without creating a production build.

## Theme Selection Modes

Theme selection is configurable with Vite env vars:

```bash
VITE_THEME_SELECTION_MODE=fixed
VITE_DEFAULT_THEME_ID=ansub-minimal
VITE_ENABLE_GITHUB_LIVE=false
VITE_ENABLE_GITHUB_CONTRIBUTIONS=true
VITE_ENABLE_REACT_GRAB=false
```

- `fixed`: uses the theme from the URL, or falls back to `VITE_DEFAULT_THEME_ID` on `/`
- `random`: keeps explicit theme URLs working, but picks a random theme for `/` and holds it in IndexedDB for `VITE_RANDOM_THEME_REFRESH_HOLD` refreshes (default `10`)
- `VITE_ENABLE_GITHUB_LIVE=true`: enables unauthenticated live GitHub API reads. The default uses the static `github-activity.json` file to avoid rate-limit console noise.
- `VITE_ENABLE_GITHUB_CONTRIBUTIONS=false`: disables the GitHub contribution graph and skips the build-time contribution fetch. Individual resumes can override this with `cv.features.git_contribution_graph`.
- `VITE_ENABLE_REACT_GRAB=true`: enables the Aiden Bai visual-edit helper. It is disabled by default because it loads an external script.

Use `.env.example` as the default setup, or build with the included random mode:

```bash
npm run build:random
```

## Default Bio Text

Themes use `cv.sections.about` when it is present. If a CV does not include about text, the shared fallback copy can be overridden with Vite env vars:

```bash
VITE_PORTFOLIO_DEFAULT_BIO="Here is my portfolio."
VITE_PORTFOLIO_DEFAULT_BIO_INTRO="Here is my portfolio."
VITE_PORTFOLIO_DEFAULT_BIO_PROFILE="Here is my portfolio."
VITE_PORTFOLIO_DEFAULT_BIO_CREATIVE="Here is my portfolio."
```

Type-specific keys take priority over the global default.

## Project Structure

```
├── public/
│   └── CV.yaml          # Portfolio data (edit this for your content)
├── src/
│   ├── themes/          # All theme components
│   │   ├── AnsubMinimal/
│   │   ├── Brutalist/
│   │   ├── Terminal/
│   │   └── ...
│   ├── App.jsx          # Theme routing and switching
│   └── main.jsx         # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Pages deployment
└── vite.config.js
```

## Customization

### Adding Your Content

Edit `public/CV.yaml` with your information:

```yaml
cv:
  name: Your Name
  location: City, Country
  email: you@example.com
  website: https://yoursite.com
  features:
    git_contribution_graph: true
  social:
    - network: GitHub
      username: yourusername
      url: https://github.com/yourusername
  sections:
    experience:
      - company: Company Name
        position: Your Role
        # ...
```

### Theme Contract

Every theme is rendered by the app shell inside a scrollable flex container
below the theme-switcher TopBar, and again inside a sandboxed iframe for
catalog previews. To work everywhere (including phones), a theme must:

1. **Fill the parent, never the viewport.** Size the root with `height: 100%`
   (or `min-height: 100%` for scrolling layouts) — not `100vh`. Raw `100vh`
   is TopBar-height taller than the actual area and clips the bottom. If a
   layout genuinely needs viewport units (e.g. centering a hero), use
   `calc(100dvh - var(--app-top-offset, 0px))`.
2. **Offset fixed/sticky elements.** The shell publishes the measured TopBar
   height as `--app-top-offset`. Anything `position: fixed`/`sticky` must use
   `top: var(--app-top-offset, 0px)` (and size with
   `calc(100dvh - var(--app-top-offset, 0px))`) or it will sit under the bar.
3. **Honor dark mode.** Read the `darkMode` prop directly (don't copy it into
   `useState` — that snapshots it at mount and ignores the TopBar toggle). If
   the theme has its own toggle, call `onDarkModeChange?.(next)` so the shell
   stays in sync. Guard with `?.` — catalog previews don't pass the setter.
4. **Work at 390px and on touch.** Add `@media` breakpoints for fixed paddings
   and multi-column layouts, prefer `clamp()` for display type, use pointer
   events (not mouse-only) for canvas interactions, and never hide critical
   links behind hover-only reveals.
5. **Load data via `useCV()`** (and `useGitHub()` for activity) — never fetch
   CV data directly, and never hardcode personal content.
6. **Resolve public assets with `withBase()`** from `src/utils/assetPath.js` —
   raw `/...` URLs break under a non-root deploy base path.
7. **Prefer shared helpers** (`utils/cvHelpers` for date ranges and social
   links, `utils/parseMarkdown` for markdown) over local re-implementations,
   and clean up every `window`/`document` listener in the effect cleanup.

`npm run qa:themes` smoke-tests every registered theme at desktop and 390px
mobile viewports (blank screens, horizontal overflow, console errors).

### Adding a New Theme

1. Create a new folder in `src/themes/YourTheme/`
2. Create `YourTheme.jsx` component that reads portfolio data with `useCV()`
3. Register it in `src/themes/index.js`:

```javascript
export const PORTFOLIO_THEMES = [
  // ... existing themes
  {
    id: 'your-theme',
    slug: 'your-slug',
    name: 'Your Theme',
    description: 'Description of your theme',
    Component: lazyTheme(() => import('./YourTheme/YourTheme'), 'YourTheme'),
  },
];
```

## Deployment

The project auto-deploys to GitHub Pages on push to `main`. The workflow:

1. Runs `npm ci` to install dependencies
2. Runs `npm run build` to create production build
3. Deploys `dist/` folder to GitHub Pages

For custom domains, add a `CNAME` file in the `public/` folder.

## License

MIT
