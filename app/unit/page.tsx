"use client";

import { useQueryContext, useTableStates } from "@/components/States";
import StatTable from "@/components/StatTable";
import Unit from "@/components/Unit";
import { useMemo, useState } from "react";
import Header from "../Header";
import SettingPanel from "@/components/SettingPanel";

export default function Page() {
  const [states, handleChange] = useTableStates();
  const query = useQueryContext();
  const [showPanel, setShowPanel] = useState(false);

  const newStates = useMemo(
    () => ({
      // TODO
      ...states,
      query,
    }),
    [states, query]
  );

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
        filter={states.filter}
        setting={states.setting}
        uISetting={states.uISetting}
        onChange={handleChange}
        isSituation={false}
      />
      <Header showSettingPanel={handleShowPanel} />
      <StatTable
        states={newStates}
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
