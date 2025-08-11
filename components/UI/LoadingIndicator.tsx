import "./LoadingIndicator.css";
import Image from "next/image";
import { type ReactNode } from "react";

const SETTER_NAME = "__setLoadingId";
const REMOVER_NAME = "__removeLoadingId";

declare global {
  interface Window {
    [SETTER_NAME]: (id: string) => void;
    [REMOVER_NAME]: (id: string) => void;
  }
}

function LoadingIndicator(): ReactNode {
  return (
    <>
      <script
        id="loading-indicator"
        dangerouslySetInnerHTML={{
          __html: `
        (() => {
          const ids = new Set();

          function checkIds() {
            if (ids.size > 0) {
              document.documentElement.setAttribute("data-md-loading", "show");
            } else {
              document.documentElement.setAttribute("data-md-loading", "hide");
            }
          }

          window.${SETTER_NAME} = (id) => {
            ids.add(id);
            checkIds();
          };

          window.${REMOVER_NAME} = (id) => {
            ids.delete(id);
            checkIds();
          };
        })();
        `,
        }}
      ></script>
      <div className="loading-indicator">
        <div>
          <Image
            src="/loading.png"
            width={200}
            height={200}
            alt="Loading..."
            priority
            quality={100}
          />
          <div className="spinner-border">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadingIndicator;
