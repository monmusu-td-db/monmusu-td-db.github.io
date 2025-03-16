"use client";

import { useMemo, useState } from "react";

import Situation from "@/components/Situation";
import SettingPanel from "@/components/SettingPanel";
import Header from "./Header";
import { StatTable } from "@/components/LazyLoading";

export default function App() {
  const [showPanel, setShowPanel] = useState(false);

  function handleShowPanel() {
    setShowPanel(true);
  }

  function handleClosePanel() {
    setShowPanel(false);
  }

  return (
    <>
      <SettingPanel
        show={showPanel}
        handleClose={handleClosePanel}
        isSituation={true}
      />
      <Header showSettingPanel={handleShowPanel} />
      <StatTable
        src={useMemo(
          () => ({
            list: Situation.list,
            columns: Situation.keys,
            comparer: Situation.comparer,
            filter: Situation.filter,
          }),
          []
        )}
      />
    </>
  );
}
