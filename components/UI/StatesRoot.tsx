"use client";

import { Contexts, useAllStates } from "@/components/States";
import { type ReactNode } from "react";

export function StatesRoot({ children }: { children: ReactNode }) {
  const obj = useAllStates();
  return (
    <Contexts.SaveOption.Provider value={obj.saveOption}>
      <Contexts.SetSaveOption.Provider value={obj.setSaveOption}>
        <Contexts.Setting.Provider value={obj.setting}>
          <Contexts.DispatchSetting.Provider value={obj.dispatchSetting}>
            <Contexts.Filter.Provider value={obj.filter}>
              <Contexts.DispatchFilter.Provider value={obj.dispatchFilter}>
                <Contexts.Query.Provider value={obj.query}>
                  <Contexts.SetQuery.Provider value={obj.setQuery}>
                    <Contexts.UISetting.Provider value={obj.uISetting}>
                      <Contexts.DispatchUISetting.Provider
                        value={obj.dispatchUISetting}
                      >
                        {children}
                      </Contexts.DispatchUISetting.Provider>
                    </Contexts.UISetting.Provider>
                  </Contexts.SetQuery.Provider>
                </Contexts.Query.Provider>
              </Contexts.DispatchFilter.Provider>
            </Contexts.Filter.Provider>
          </Contexts.DispatchSetting.Provider>
        </Contexts.Setting.Provider>
      </Contexts.SetSaveOption.Provider>
    </Contexts.SaveOption.Provider>
  );
}
