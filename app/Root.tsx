"use client";

import { Contexts, useFilterState, useQueryState } from "@/components/States";
import { type ReactNode } from "react";

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <FilterRoot>
      <QueryRoot>{children}</QueryRoot>
    </FilterRoot>
  );
}

function FilterRoot({ children }: { children: ReactNode }) {
  const [filter, dispatchFilter] = useFilterState();
  return (
    <Contexts.Filter.Provider value={filter}>
      <Contexts.DispatchFilter.Provider value={dispatchFilter}>
        {children}
      </Contexts.DispatchFilter.Provider>
    </Contexts.Filter.Provider>
  );
}

function QueryRoot({ children }: { children: ReactNode }) {
  const [query, setQuery] = useQueryState();
  return (
    <Contexts.Query.Provider value={query}>
      <Contexts.SetQuery.Provider value={setQuery}>
        {children}
      </Contexts.SetQuery.Provider>
    </Contexts.Query.Provider>
  );
}
