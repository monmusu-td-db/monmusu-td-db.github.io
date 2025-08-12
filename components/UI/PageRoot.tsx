"use client";

import { useEffect, useState, type ReactNode } from "react";
import Panel from "./Panel";
import Header from "./Navbar";
import LoadingIndicator from "./LoadingIndicator";
import PanelControl from "./PanelControl";

type PageType =
  | (typeof Panel.pageType)[keyof typeof Panel.pageType]
  | undefined;

export default function PageRoot({
  children,
  pageType,
}: {
  children: ReactNode;
  pageType?: PageType;
}) {
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (panelOpen) {
      window.__openPanel();
    } else {
      window.__closePanel();
    }
    return () => {
      window.__closePanel();
    };
  }, [panelOpen]);

  return (
    <Panel.Contexts.Open.Provider value={panelOpen}>
      <Panel.Contexts.SetOpen.Provider value={setPanelOpen}>
        <PanelControl />
        <LoadingIndicator />
        <Header pageType={pageType} />
        <main>{children}</main>
      </Panel.Contexts.SetOpen.Provider>
    </Panel.Contexts.Open.Provider>
  );
}
