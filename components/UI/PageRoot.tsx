"use client";

import { useState, type ReactNode } from "react";
import Panel from "./Panel";
import Header from "./Navbar";

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

  return (
    <Panel.Contexts.PageType.Provider value={pageType}>
      <Panel.Contexts.Open.Provider value={panelOpen}>
        <Panel.Contexts.SetOpen.Provider value={setPanelOpen}>
          <Header />
          <main>{children}</main>
        </Panel.Contexts.SetOpen.Provider>
      </Panel.Contexts.Open.Provider>
    </Panel.Contexts.PageType.Provider>
  );
}
