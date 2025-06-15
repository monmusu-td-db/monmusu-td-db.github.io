"use client";

import {
  Contexts,
  useFilterState,
  useQueryState,
  useSettingState,
  useUISettingState,
} from "@/components/States";
import { type ReactNode } from "react";

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <SettingRoot>
      <FilterRoot>
        <QueryRoot>
          <UISettingRoot>{children}</UISettingRoot>
        </QueryRoot>
      </FilterRoot>
    </SettingRoot>
  );
}

function FilterRoot({ children }: { children: ReactNode }) {
  const [filter, dispatch] = useFilterState();
  return (
    <Contexts.Filter.Provider value={filter}>
      <Contexts.DispatchFilter.Provider value={dispatch}>
        {children}
      </Contexts.DispatchFilter.Provider>
    </Contexts.Filter.Provider>
  );
}

function SettingRoot({ children }: { children: ReactNode }) {
  const [setting, dispatch] = useSettingState();
  return (
    <Contexts.Setting.Provider value={setting}>
      <Contexts.DispatchSetting.Provider value={dispatch}>
        {children}
      </Contexts.DispatchSetting.Provider>
    </Contexts.Setting.Provider>
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

function UISettingRoot({ children }: { children: ReactNode }) {
  const [uISetting, dispatch] = useUISettingState();
  return (
    <Contexts.UISetting.Provider value={uISetting}>
      <Contexts.DispatchUISetting.Provider value={dispatch}>
        {children}
      </Contexts.DispatchUISetting.Provider>
    </Contexts.UISetting.Provider>
  );
}
