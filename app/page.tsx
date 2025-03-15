"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import * as Util from "@/components/Util";
import type StatTableType from "@/components/StatTable";
import Situation from "@/components/Situation";
import SettingPanel from "@/components/SettingPanel";
import Header from "./Header";

const StatTable = dynamic(() => import("@/components/StatTable"), {
  ssr: false,
  loading: () => <Util.Loading />,
}) as typeof StatTableType;

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
