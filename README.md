# Portfolio Themes

A collection of 25+ portfolio themes built with React and Vite. Each theme is accessible via its own URL path and renders content from a single `CV.yaml` data file.

**Live Demo:** [portfolio.ahmadjalil.com](https://portfolio.ahmadjalil.com)

## Available Themes

| Theme | URL | Description |
|-------|-----|-------------|
| Minimal | `/minimal` | Clean single-page layout with timeline and projects |
| Brutalist | `/brutalist` | No-frills design with system fonts |
| Developer Dark | `/developer-dark` | Dark navy with green accents |
| Spotlight | `/spotlight` | Two-column layout with scroll-aware navigation |
| Creative Dark | `/creative-dark` | Bold dark theme with Rammetto One font |
| Designer | `/designer` | Centered content with monospace dates |
| Editorial | `/editorial` | Two-column with serif accents |
| Hendo | `/hendo` | Scramble text animation on hover |
| Research Lab | `/research-lab` | Monospace timeline with featured cards |
| Modern Blue | `/modern-blue` | Live clock and project cards grid |
| Plain Text | `/plain-text` | Ultra-minimal with auto dark/light mode |
| Notes | `/notes` | Notes-style with emoji icons |
| Builder | `/builder` | Card-based projects with live footer clock |
| Timeline | `/timeline` | Professional design with monospace dates |
| Terminal | `/terminal` | Hacker-style black terminal |
| Stammy | `/stammy` | Dark olive with left icon sidebar |
| Developer | `/developer` | Clean white with pride gradient bar |
| Two Column | `/two-column` | Sticky photo card with accordion sections |
| Splash | `/splash` | Full-screen hero with colorful project cards |
| Notebook | `/notebook` | Monospace terminal with glitch header |
| Paco | `/paco` | Minimalist grayscale with staggered animations |
| Framed | `/framed` | Artistic with border frame and mix-blend-mode |
| Dashed | `/dashed` | Dashed borders with dot grid header |
| Mainframe | `/mainframe` | Brutalist dashboard with zinc surfaces |
| IMML | `/imml` | Minimal page-based with hash navigation |
| 3D Duck | `/3d-duck` | Scroll-synchronized 3D duck animation |

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

# Build for production
npm run build

# Preview production build
npm run preview
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
2. Create `YourTheme.jsx` component that accepts `cvData` prop
3. Register it in `src/themes/index.js`:

```javascript
import { YourTheme } from './YourTheme/YourTheme';

export const PORTFOLIO_THEMES = [
  // ... existing themes
  {
    id: 'your-theme',
    slug: 'your-slug',
    name: 'Your Theme',
    description: 'Description of your theme',
    Component: YourTheme,
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
