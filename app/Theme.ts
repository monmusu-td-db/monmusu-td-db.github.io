const Theme = {
  LIGHT: "light",
  DARK: "dark",
} as const;
type Theme = (typeof Theme)[keyof typeof Theme];

declare global {
  interface Window {
    __setPreferredTheme: (theme: Theme) => void;
  }
}

function toggle(theme: Theme) {
  const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
  return window.__setPreferredTheme(newTheme);
}

export default Object.assign(Theme, { toggle });
