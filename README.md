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
VITE_ENABLE_REACT_GRAB=false
```

- `fixed`: uses the theme from the URL, or falls back to `VITE_DEFAULT_THEME_ID` on `/`
- `random`: keeps explicit theme URLs working, but picks a random theme on each fresh visit or refresh of `/`
- `VITE_ENABLE_GITHUB_LIVE=true`: enables unauthenticated live GitHub API reads. The default uses the static `github-activity.json` file to avoid rate-limit console noise.
- `VITE_ENABLE_REACT_GRAB=true`: enables the Aiden Bai visual-edit helper. It is disabled by default because it loads an external script.

Use `.env.example` as the default setup, or build with the included random mode:

```bash
npm run build:random
```

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
