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

function InitializeTheme() {
  // 参考 https://github.com/reactjs/react.dev/blob/main/src/pages/_document.tsx
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        (function (){
          function setTheme(newTheme){
            switch(newTheme){
              case 'light':
              case 'dark':
                document.documentElement.setAttribute('data-bs-theme', newTheme);
            }
          }
        
          var preferredTheme;
          try {
            preferredTheme = localStorage.getItem('theme');
          } catch(err) {}
        
          window.__setPreferredTheme = function(newTheme){
            preferredTheme = newTheme;
            setTheme(newTheme);
            try {
              localStorage.setItem('theme', newTheme);
            } catch(err) {}
          };
        
          var initialTheme = preferredTheme;
          var darkQuery = window.matchMedia('prefers-color-scheme: dark');
          if(!initialTheme){
            initialTheme = darkQuery.matches ? 'dark': 'light';
          }
          setTheme(initialTheme);

          darkQuery.addEventListener('change', function (e) {
            if(!preferredTheme){
              setTheme(e.matches ? 'dark' : 'light');
            }
          });
        })();
      `,
      }}
    />
  );
}

export default Object.assign(Theme, { toggle, Initialize: InitializeTheme });
