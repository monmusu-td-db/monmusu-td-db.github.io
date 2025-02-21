"use client";

import { QueryContext, SetQueryContext } from "@/components/States";
import Header from "../Header";
import { useState } from "react";

export default function Page() {
  const [query, setQuery] = useState("");

  return (
    <QueryContext.Provider value={query}>
      <SetQueryContext.Provider value={setQuery}>
        <Header />
      </SetQueryContext.Provider>
    </QueryContext.Provider>
  );
}