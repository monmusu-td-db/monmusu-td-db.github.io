"use client";

import {
  type ReactNode,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Overlay, Popover } from "react-bootstrap";
import { type CellData } from "./StatTable";
import { Tooltip } from "./Tooltip";
import { StatTooltip } from "../Stat/StatTooltip";
import { Contexts, Setting } from "../States";

type TooltipEventHandler = (cell: CellData) => void;
export type TooltipEventHandlers = {
  onClick: TooltipEventHandler;
  onMouseOver: TooltipEventHandler;
  onMouseOut: TooltipEventHandler;
  hide: () => void;
};

type TooltipCond = {
  enabled: boolean;
  show: boolean;
  cell: CellData | null;
};

const TOOLTIP_DELAY = 5;
const defaultCond: TooltipCond = { show: false, enabled: false, cell: null };

const isEnabledStat = (
  stat: unknown,
  setting: Setting
): stat is StatTooltip<unknown, unknown> => {
  return stat instanceof StatTooltip && stat.isEnabled(setting);
};

function useTooltip(): [TooltipCond, TooltipEventHandlers] {
  const timerIds = useRef<Set<number>>(new Set<number>());
  const [cond, setCond] = useState<TooltipCond>(defaultCond);

  const setting = Contexts.useSetting();

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
        enabled: true,
        show: p.cell?.ref === target.ref ? !p.show : true,
        cell: target,
      };
    });
  }, []);

  const handleMouseOver = useCallback(
    (target: CellData) => {
      clearTimers();
      setCond((p) => {
        if (!isEnabledStat(target.stat, setting)) {
          return { enabled: true, show: false, cell: p.cell };
        } else if (p.cell?.ref === target.ref && p.show && p.enabled) {
          return p;
        } else {
          const timerId = window.setTimeout(() => {
            // ちらつきを抑えるために遅延させる
            timerIds.current.delete(timerId);
            setCond({
              enabled: true,
              show: true,
              cell: target,
            });
          }, TOOLTIP_DELAY);
          timerIds.current.add(timerId);

          return {
            enabled: false,
            show: p.show,
            cell: p.cell,
          };
        }
      });
    },
    [setting]
  );

  const handleMouseOut = useCallback((target: CellData) => {
    const timerId = window.setTimeout(() => {
      clearTimers();
      setCond((p) => {
        if (p.cell?.ref !== target.ref) {
          return p;
        } else {
          return {
            enabled: true,
            show: false,
            cell: p.cell,
          };
        }
      });
    }, TOOLTIP_DELAY);
    timerIds.current.add(timerId);
  }, []);

  const hide = useCallback(() => {
    setCond(defaultCond);
  }, []);

  const handlers: TooltipEventHandlers = useMemo(
    () => ({
      onClick: handleClick,
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
      hide,
    }),
    [handleClick, handleMouseOver, handleMouseOut, hide]
  );

  return [cond, handlers];
}

const TooltipControl = memo(function TooltipControl({
  children,
  cond,
  setting,
}: {
  children: ReactNode;
  cond: TooltipCond;
  setting: Setting;
}) {
  const cellRef = cond.cell?.ref ?? null;
  const cellStat = cond.cell?.stat;

  return (
    <>
      {children}
      {cond.enabled && isEnabledStat(cellStat, setting) && (
        <Overlay target={cellRef} show={cond.show} placement={"auto"} flip>
          <Popover id="stat-tooltip" placement="auto">
            <Tooltip stat={cellStat} setting={setting} />
          </Popover>
        </Overlay>
      )}
    </>
  );
});

export default Object.assign(TooltipControl, {
  useTooltip,
});
