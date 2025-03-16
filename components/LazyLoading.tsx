"use client";

import type StatTableType from "@/components/StatTable";
import dynamic from "next/dynamic";

function Loading() {
  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export const StatTable = dynamic(() => import("@/components/StatTable"), {
  ssr: true,
  loading: () => <Loading />,
}) as typeof StatTableType;
