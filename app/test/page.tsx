"use client";

import { useState } from "react";
import Header from "./Navbar";
import Panel from "./Panel";

function Page() {
  const [panelOpen, setPanelOpen] = useState(true);
  return (
    <Panel.Contexts.Open.Provider value={panelOpen}>
      <Panel.Contexts.Toggle.Provider value={() => setPanelOpen((p) => !p)}>
        <header>
          <Header />
          <Panel open={panelOpen} />
        </header>
      </Panel.Contexts.Toggle.Provider>
    </Panel.Contexts.Open.Provider>
  );
}

export default Page;
