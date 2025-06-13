"use client";

import "./StatTable.css";
import thStyle from "./TableStyles/th.module.css";
import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Table } from "react-bootstrap";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting, type States } from "../States";
import TooltipControl, { type TooltipEventHandlers } from "./TooltipControl";
import { stat } from "../Data";
import cn from "classnames";
import Panel from "./Panel";
import * as Data from "../Data";
import { TableStyle } from "./TableStyles/TableStyle";
import Situation from "../Situation";

//
// Types

type Stat = StatRoot<unknown, unknown> | undefined;

export type CellData = {
  ref: RefObject<HTMLElement>;
  stat: Stat;
};

export interface TableData<T extends string> {
  headers: readonly TableHeader<T>[];
  rows: readonly TableRow<T>[];
}

export interface TableSource<T extends string> extends TableData<T> {
  filter: (states: States) => readonly TableRow<T>[];
  sort: (
    setting: Setting,
    rows: readonly TableRow<T>[],
    column: T,
    isReversed: boolean
  ) => readonly TableRow<T>[];
}

export type TableHeader<T extends string> = {
  id: T;
  name: string;
};

export type TableRow<T extends string> = {
  readonly [key in T]: StatRoot<unknown, unknown>;
} & {
  readonly id: number;
};

type Sort<T extends string> = {
  column: T | undefined;
  isReversed: boolean;
};

//
// Components

function StatTable<T extends string>({ src }: { src: TableSource<T> }) {
  const filter = Contexts.useFilter();
  const setting = Contexts.useSetting();
  const query = Contexts.useQuery();
  const uISetting = Contexts.useUISetting();
  const states = useMemo((): States => {
    return {
      filter,
      setting,
      query,
      uISetting,
    };
  }, [filter, query, setting, uISetting]);

  return (
    <div className="d-flex justify-content-center">
      <TableControl src={src} states={states} />
    </div>
  );
}

const TableControl = memo(TableControl_) as typeof TableControl_;
function TableControl_<T extends string>({
  src,
  states,
}: {
  src: TableSource<T>;
  states: States;
}) {
  const [sort, toggleSort] = useSort(src);
  const panelOpen = Panel.Contexts.useOpen();

  const data: TableData<T> = useMemo(() => {
    const filteredList = src.filter(states);
    let sortedList;
    if (sort.column === undefined) {
      sortedList = filteredList;
    } else {
      sortedList = src.sort(
        states.setting,
        filteredList,
        sort.column,
        sort.isReversed
      );
    }
    return {
      headers: src.headers,
      rows: sortedList,
    };
  }, [src, states, sort]);

  const [tooltipCond, handlers] = TooltipControl.useTooltip();

  const cond = useMemo(
    () => ({
      sort,
      states,
      data,
      handlers,
    }),
    [sort, states, data, handlers]
  );
  const deferredCond = useDeferredValue(cond);
  const isPending = cond !== deferredCond;
  const {
    sort: dSort,
    states: dStates,
    data: dData,
    handlers: dHandlers,
  } = deferredCond;

  if ((isPending || panelOpen) && tooltipCond.show) {
    handlers.hide();
  }

  return (
    <TooltipControl cond={tooltipCond} setting={dStates.setting}>
      <TableStyle headers={dData.headers} />
      <Table
        striped
        size="sm"
        className={cn("stat-table", { pending: isPending })}
      >
        <Header
          headers={dData.headers}
          setting={dStates.setting}
          sort={sort}
          onClick={toggleSort}
        />
        <Body
          tableData={dData}
          setting={dStates.setting}
          sortColumn={dSort.column}
          handlers={dHandlers}
        />
      </Table>
    </TooltipControl>
  );
}

type HandleSort<T extends string> = (column: T) => void;
function useSort<T extends string>(
  src: TableSource<T>
): [Sort<T>, HandleSort<T>] {
  const [sort, setSort] = useState<Sort<T>>({
    column: src.headers[0]?.id,
    isReversed: false,
  });

  const handleToggle = useCallback((column: T) => {
    setSort((p) => ({
      column,
      isReversed: p.column === column ? !p.isReversed : p.isReversed,
    }));
  }, []);

  return [sort, handleToggle];
}

const Header = memo(Header_) as typeof Header_;
function Header_<T extends string>({
  headers,
  setting,
  sort,
  onClick,
}: {
  headers: readonly TableHeader<T>[];
  setting: Setting;
  sort: Sort<T>;
  onClick: HandleSort<T>;
}) {
  const sortColor = Data.TableColor.getSelector(
    sort.isReversed ? Data.tableColor.blue : Data.tableColor.red
  );

  return (
    <thead>
      <tr>
        {headers.map((col) => {
          const sortCn = col.id === sort.column ? sortColor : undefined;
          let role, handleClick: HandleSort<T> | undefined;
          switch (col.id) {
            case stat.conditions:
            case stat.supplements:
              break;
            default:
              role = "button";
              handleClick = onClick;
          }

          return (
            <th
              key={col.id}
              className={cn(thStyle[col.id], sortCn)}
              role={role}
              onClick={() => handleClick?.(col.id)}
            >
              {Data.StatType.getHeaderName(col.id, setting, col.name)}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

const Body = memo(Body_) as typeof Body_;
function Body_<T extends string>({
  tableData,
  setting,
  sortColumn,
  handlers,
}: {
  tableData: TableData<T>;
  setting: Setting;
  sortColumn: T | undefined;
  handlers: TooltipEventHandlers;
}) {
  let previousId: number | undefined;

  function isBorderEnabled(column: T | undefined): boolean {
    switch (column as Data.StatType) {
      case stat.unitId:
      case stat.situationId:
      case stat.unitName:
      case stat.unitShortName:
      case stat.skillName:
      case stat.exSkill1:
      case stat.exSkill2:
        return true;
    }
    return false;
  }

  return (
    <tbody>
      {tableData.rows.map((row) => {
        let separator;
        if (row instanceof Situation && isBorderEnabled(sortColumn)) {
          const id = row.unitId.getValue(setting);
          if (id !== previousId && previousId !== undefined) {
            separator = true;
          }
          previousId = id;
        }
        return (
          <tr key={row.id} className={separator ? "separator" : undefined}>
            <Row
              headers={tableData.headers}
              row={row}
              setting={setting}
              handlers={handlers}
            />
          </tr>
        );
      })}
    </tbody>
  );
}

const Row = memo(function Row({
  headers,
  row,
  setting,
  handlers,
}: {
  headers: readonly TableHeader<string>[];
  row: TableRow<string>;
  setting: Setting;
  handlers: TooltipEventHandlers;
}) {
  return (
    <>
      {headers.map((col) => (
        <Cell
          key={col.id}
          stat={row[col.id]}
          setting={setting}
          handlers={handlers}
        />
      ))}
    </>
  );
});

const Cell = memo(function Cell({
  stat,
  setting,
  handlers,
}: {
  stat: Stat;
  setting: Setting;
  handlers: TooltipEventHandlers;
}) {
  const ref = useRef(null);
  const { onClick, onMouseOver, onMouseOut } = handlers;
  const cellData = { ref, stat };

  return (
    <td
      ref={ref}
      onClick={() => onClick(cellData)}
      onMouseOver={() => onMouseOver(cellData)}
      onMouseOut={() => onMouseOut(cellData)}
      className={stat?.getStyles(setting)}
    >
      {stat?.getItem(setting)}
    </td>
  );
});

export default StatTable;
