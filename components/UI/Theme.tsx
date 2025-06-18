const STORAGE_KEY = "theme";
const SETTER_NAME = "__setTheme";

const Theme = {
  LIGHT: "light",
  DARK: "dark",
} as const;
type Theme = (typeof Theme)[keyof typeof Theme];

declare global {
  interface Window {
    [SETTER_NAME]: (theme: Theme) => void;
  }
}

function toggle(theme: Theme) {
  const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
  return window[SETTER_NAME](newTheme);
}

function Initialize() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        (() => {
          function setTheme(newTheme) {
            switch (newTheme) {
              case "${Theme.LIGHT}":
              case "${Theme.DARK}":
                document.documentElement.setAttribute("data-bs-theme", newTheme);
            }
          }

          let selectedTheme;
          try {
            selectedTheme = localStorage.getItem("${STORAGE_KEY}");
          } catch {}

          window.${SETTER_NAME} = (newTheme) => {
            selectedTheme = newTheme;
            setTheme(newTheme);
            try {
              localStorage.setItem("${STORAGE_KEY}", newTheme);
            } catch {}
          };

          const colorQuery = window.matchMedia("prefers-color-scheme: dark");
          setTheme(selectedTheme ?? (colorQuery.matches ? "dark" : "light"));

          colorQuery.addEventListener("change", (e) => {
            if (!selectedTheme) {
              setTheme(e.matches ? "dark" : "light");
            }
          });
        })();
      `,
      }}
    />
  );
}

export default Object.assign(Theme, { toggle, Initialize });
