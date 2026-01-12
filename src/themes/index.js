import { AnsubMinimalTheme } from './AnsubMinimal/AnsubMinimalTheme';
import { BrutalistTheme } from './Brutalist/BrutalistTheme';
import { ChiangV4Theme } from './ChiangV4/ChiangV4Theme';
import { ChiangCurrentTheme } from './ChiangCurrent/ChiangCurrentTheme';
import { NickComputerTheme } from './NickComputer/NickComputerTheme';
import { BrianLovinTheme } from './BrianLovin/BrianLovinTheme';
import { JoshBradleyTheme } from './JoshBradley/JoshBradleyTheme';
import { HendoTheme } from './Hendo/HendoTheme';
import { PiTheme } from './Pi/PiTheme';
import { ChiziTheme } from './Chizi/ChiziTheme';
import { GerhardTheme } from './Gerhard/GerhardTheme';

export const PORTFOLIO_THEMES = [
  {
    id: 'ansub-minimal',
    name: 'Minimal',
    description: 'Clean single-page layout powered by CV.yaml. Features a timeline experience view, projects section, and contact info.',
    Component: AnsubMinimalTheme,
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: 'No-frills, lightweight design. Just content, system fonts, and zero bullshit.',
    Component: BrutalistTheme,
  },
  {
    id: 'chiang-v4',
    name: 'Developer Dark',
    description: 'Dark navy portfolio with green accents. Inspired by brittanychiang.com v4. Full-page sections with numbered headings.',
    Component: ChiangV4Theme,
  },
  {
    id: 'chiang-current',
    name: 'Spotlight',
    description: 'Modern two-column layout with slate colors and teal accents. Sticky navigation with scroll-aware highlighting.',
    Component: ChiangCurrentTheme,
  },
  {
    id: 'nick-computer',
    name: 'Creative Dark',
    description: 'Bold dark theme with Rammetto One display font. Horizontal project cards and clean experience list.',
    Component: NickComputerTheme,
  },
  {
    id: 'brian-lovin',
    name: 'Designer',
    description: 'Clean minimal portfolio with centered content, monospace dates, and elegant project listings. Inspired by brianlovin.com.',
    Component: BrianLovinTheme,
  },
  {
    id: 'josh-bradley',
    name: 'Editorial',
    description: 'Two-column layout with italic navigation, justified text, and leader-dot lists. Warm cream background with serif accents.',
    Component: JoshBradleyTheme,
  },
  {
    id: 'hendo',
    name: 'Hendo',
    description: 'Clean minimal design with scramble text animation on hover. Light/dark mode toggle, centered content, and simple navigation.',
    Component: HendoTheme,
  },
  {
    id: 'pi',
    name: 'Research Lab',
    description: 'Monospace timeline layout with featured cards and box shadows. Cream background, serif logo, and vertical timeline with square dots.',
    Component: PiTheme,
  },
  {
    id: 'chizi',
    name: 'Modern Blue',
    description: 'Clean minimalist design with blue accents. Features a live clock, project cards grid, and smooth hover animations.',
    Component: ChiziTheme,
  },
  {
    id: 'gerhard',
    name: 'Plain Text',
    description: 'Ultra-minimal design with system fonts, 60ch width, and automatic dark/light mode. Subtle gray underlines and muted section labels.',
    Component: GerhardTheme,
  },
];

export function getPortfolioTheme(themeId) {
  return PORTFOLIO_THEMES.find((t) => t.id === themeId) || PORTFOLIO_THEMES[0];
}
