import "./PanelControl.css";
import type { ReactNode } from "react";

const OPEN_NAME = "__openPanel";
const CLOSE_NAME = "__closePanel";

declare global {
  interface Window {
    [OPEN_NAME]: () => void;
    [CLOSE_NAME]: () => void;
  }
}

function PanelControl(): ReactNode {
  return (
    <script
      id="panel-control"
      dangerouslySetInnerHTML={{
        __html: `
(() => {
  function toggle(isOpen) {
    document.documentElement.setAttribute(
      "data-md-panel",
      isOpen ? "open" : "close"
    );
  }

  window.${OPEN_NAME} = () => {
    toggle(true);
  };

  window.${CLOSE_NAME} = () => {
    toggle(false);
  };
})();
    `,
      }}
    />
  );
}

export default PanelControl;
