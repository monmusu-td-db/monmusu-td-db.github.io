"use client";

import { type ReactNode, useRef, useState, useCallback, useMemo } from "react";
import { Overlay, Popover } from "react-bootstrap";
import type { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";
import {
  CellEventHandlersContext,
  type CellData,
  type CellEventHandlers,
} from "./StatTable";

type TooltipCond = {
  show: boolean;
  cell: CellData | null;
};

export default function TooltipControl({ children }: { children: ReactNode }) {
  const timerIds = useRef<Set<number>>(new Set<number>());
  const [cond, setCond] = useState<TooltipCond>({ show: false, cell: null });

  function clearTimers() {
    const ids = timerIds.current;
    ids.forEach((id) => {
      window.clearTimeout(id);
    });
    ids.clear();
  }

  const handleClick = useCallback((target: CellData) => {
    clearTimers();
    setCond((p) => {
      return {
        show: p.cell?.ref === target.ref ? !p.show : true,
        cell: target,
      };
    });
  }, []);

  const handleMouseOver = useCallback((target: CellData) => {
    clearTimers();
    setCond({
      show: true,
      cell: target,
    });
  }, []);

  const handleMouseOut = useCallback((target: CellData) => {
    const timerId = window.setTimeout(() => {
      // ちらつきを抑えるために遅延させる
      timerIds.current.delete(timerId);
      setCond((p) => {
        if (p.cell?.ref !== target.ref) {
          return p;
        } else {
          return {
            show: false,
            cell: p.cell,
          };
        }
      });
    }, 50);
    timerIds.current.add(timerId);
  }, []);

  const handlers: CellEventHandlers = useMemo(
    () => ({
      onClick: handleClick,
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
    }),
    [handleClick, handleMouseOver, handleMouseOut]
  );

  const cellRef = cond.cell?.ref ?? null;
  const placement = "auto";
  const flip = placement && placement.indexOf("auto") !== -1;

  return (
    <CellEventHandlersContext.Provider value={handlers}>
      {children}
      <Overlay
        target={cellRef}
        show={cond.show}
        placement={placement}
        flip={flip}
      >
        {(p) => {
          return tooltip(p);
        }}
      </Overlay>
    </CellEventHandlersContext.Provider>
  );
}

function tooltip(props: OverlayInjectedProps) {
  return (
    <Popover {...props} placement="auto">
      <Popover.Header as="h3">Header</Popover.Header>
      <Popover.Body>test</Popover.Body>
    </Popover>
  );
}
