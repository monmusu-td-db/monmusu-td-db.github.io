"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const Theme = {
  AUTO: "auto",
  LIGHT: "light",
  DARK: "dark",
} as const;
type Theme = typeof Theme[keyof typeof Theme]

export const ThemeContext = createContext<Theme>(Theme.AUTO);
export const SetThemeContext = createContext<(theme: Theme) => void>(() => { });
export const useThemeContext = () => useContext(ThemeContext);
export const useSetThemeContext = () => useContext(SetThemeContext);

export function Root({
  children
}: {
  children: ReactNode
}) {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  return (
    <html lang="ja" data-bs-theme={theme}>
      <body>
        <ThemeContext.Provider value={theme}>
          <SetThemeContext.Provider value={setTheme}>
            {children}
          </SetThemeContext.Provider>
        </ThemeContext.Provider>
      </body>
    </html>
  );
}