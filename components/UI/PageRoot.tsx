"use client";

import { useEffect, useState, type ReactNode } from "react";
import Panel from "./Panel";
import { Button } from "react-bootstrap";
import Icon from "./Icon";
import SearchInput from "./SearchInput";
import Header from "./Header";
import cn from "classnames";

const SEARCH_ICON_SIZE = 18;

type PageType =
  | (typeof Panel.pageType)[keyof typeof Panel.pageType]
  | undefined;

function PageRoot({
  children,
  pageType,
}: {
  children: ReactNode;
  pageType?: PageType;
}) {
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (panelOpen) {
      window.__openPanel();
    } else {
      window.__closePanel();
    }
    return () => {
      window.__closePanel();
    };
  }, [panelOpen]);

  return (
    <Panel.Contexts.Open.Provider value={panelOpen}>
      <Panel.Contexts.SetOpen.Provider value={setPanelOpen}>
        <HeaderControl pageType={pageType} />
        <main>{children}</main>
      </Panel.Contexts.SetOpen.Provider>
    </Panel.Contexts.Open.Provider>
  );
}

function HeaderControl({ pageType }: { pageType?: PageType }) {
  const open = Panel.Contexts.useOpen();
  const setOpen = Panel.Contexts.useSetOpen();

  return (
    <Header
      panel={
        <Panel open={open} onClose={() => setOpen(false)} pageType={pageType} />
      }
      searchInput={
        <SearchInput className="header-search-input d-none d-md-block" />
      }
      panelToggler={<PanelToggler />}
    />
  );
}

function PanelToggler() {
  const open = Panel.Contexts.useOpen();
  const setOpen = Panel.Contexts.useSetOpen();

  return (
    <div className="mx-sm-1">
      <Button
        variant="outline-secondary"
        className={cn("header-btn", { "header-btn-checked": open })}
        onClick={() => setOpen((p) => !p)}
        aria-controls={Panel.ID}
        aria-expanded={open}
      >
        <Icon.GearFill width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} />
      </Button>
    </div>
  );
}

export default PageRoot;
