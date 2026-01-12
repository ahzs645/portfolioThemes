import WinXP from '../WinXP';
import { AnsubMinimalTheme } from './themes/AnsubMinimal/AnsubMinimalTheme';

export const PORTFOLIO_THEMES = [
  {
    id: 'xp',
    name: 'Windows XP',
    description: 'Desktop-style portfolio experience.',
    Component: WinXP,
  },
  {
    id: 'ansub-minimal',
    name: 'Minimal',
    description: 'Clean single-page layout powered by CV.yaml.',
    Component: AnsubMinimalTheme,
  },
];

export function getPortfolioTheme(themeId) {
  return PORTFOLIO_THEMES.find((t) => t.id === themeId) || PORTFOLIO_THEMES[0];
}

