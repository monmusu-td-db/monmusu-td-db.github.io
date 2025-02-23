"use client";

import {
  QueryContext,
  SetQueryContext,
  useQueryState,
} from "@/components/States";
import { type ReactNode } from "react";

export function ClientRoot({ children }: { children: ReactNode }) {
  const [query, setQuery] = useQueryState();

  return (
    <QueryContext.Provider value={query}>
      <SetQueryContext.Provider value={setQuery}>
        {children}
      </SetQueryContext.Provider>
    </QueryContext.Provider>
  );
}
