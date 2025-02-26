"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { useQueryContext, useTableStates } from "@/components/States";
import type StatTableType from "@/components/StatTable";
import Situation from "@/components/Situation";
import SettingPanel from "@/components/SettingPanel";
import Header from "./Header";

const StatTable = dynamic(() => import("@/components/StatTable"), {
  ssr: false,
  loading: () => <>Loading...</>,
}) as typeof StatTableType;

export default function App() {
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
        isSituation={true}
      />
      <Header showSettingPanel={handleShowPanel} />
      <StatTable
        states={newStates}
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
