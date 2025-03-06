"use client";

import StatTable from "@/components/StatTable";
import Unit from "@/components/Unit";
import { useMemo, useState } from "react";
import Header from "../Header";
import SettingPanel from "@/components/SettingPanel";

export default function Page() {
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
        isSituation={false}
      />
      <Header showSettingPanel={handleShowPanel} />
      <StatTable
        src={useMemo(
          () => ({
            list: Unit.list,
            columns: Unit.keys,
            comparer: Unit.comparer,
            filter: Unit.filter,
          }),
          []
        )}
      />
    </>
  );
}
