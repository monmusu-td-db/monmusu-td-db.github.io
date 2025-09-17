import "./LoadingIndicator.css";
import { type ReactNode } from "react";
import Images from "./Images";
import cn from "classnames";
import { SpinnerBorder } from "./Util";

const SETTER_NAME = "__setLoadingId";
const REMOVER_NAME = "__removeLoadingId";

declare global {
  interface Window {
    [SETTER_NAME]: (id: string) => void;
    [REMOVER_NAME]: (id: string) => void;
  }
}

function Page(): ReactNode {
  return (
    <>
      <script
        id="loading-indicator"
        dangerouslySetInnerHTML={{
          __html: `
(() => {
  const ids = new Set();

  function checkIds() {
    document.documentElement.setAttribute(
      "data-md-loading",
      ids.size > 0 ? "show" : "hide"
    );
  }

  window.${SETTER_NAME} = (id) => {
    ids.add(id);

    window.setTimeout(() => {
      checkIds();
    }, 750);
  };

  window.${REMOVER_NAME} = (id) => {
    ids.delete(id);
    checkIds();
  };
})();
        `,
        }}
      ></script>
      <Icon className="page" />
    </>
  );
}

function Icon({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("loading-indicator", className)}>
      <div>
        <Images.Loading />
        <SpinnerBorder />
      </div>
    </div>
  );
}

const LoadingIndicator = Object.assign(Page, {
  Icon,
});

export default LoadingIndicator;
