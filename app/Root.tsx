"use client";

import { type ReactNode } from "react";

export function Root({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <InitializeTheme />
      {children}
    </>
  );
}


function InitializeTheme() {
  // 参考 https://github.com/reactjs/react.dev/blob/main/src/pages/_document.tsx
  return (
    <script dangerouslySetInnerHTML={{
      "__html": `
        (function (){
          function setTheme(newTheme){
            switch(newTheme){
              case "light":
              case "dark":
              case "auto":
                document.documentElement.setAttribute("data-bs-theme", newTheme);
            }
          }
        
          var preferredTheme;
          try {
            preferredTheme = localStorage.getItem("theme");
          } catch(e) {}
        
          window.__setPreferredTheme = function(newTheme){
            preferredTheme = newTheme;
            setTheme(newTheme);
            try {
              localStorage.setItem("theme", newTheme);
            } catch(e) {}
          };
        
          var initialTheme = preferredTheme;
          if(!initialTheme){
            initialTheme = "auto";
          }
          setTheme(initialTheme);
        })();
      `}} />
  );
}