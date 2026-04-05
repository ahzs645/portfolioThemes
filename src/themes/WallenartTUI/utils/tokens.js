export const colors = {
  primaryText: '#c9d1d9',
  primaryBg: '#0d1117',
  tertiaryBg: '#141a24',
  secondaryBg: '#1e4273',
  border: '#8090a8',
  orange: '#ec8e2c',
  blue: '#58a6ff',
  pink: '#bc8cff',
  lightBlue: '#79c0ff',
};

export const accentColors = [colors.blue, colors.orange, colors.pink];

export function randomAccent() {
  return accentColors[Math.floor(Math.random() * accentColors.length)];
}

export const fonts = {
  mono: "'Fira Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
};

export const breakpoints = {
  mobile: '768px',
};
