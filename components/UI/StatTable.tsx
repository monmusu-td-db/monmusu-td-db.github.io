"use client";

import "./StatTable.css";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Alert, Table } from "react-bootstrap";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting, type States } from "../States";
import TooltipControl, { type TooltipEventHandlers } from "./TooltipControl";
import cn from "classnames";
import Panel from "./Panel";
import * as Data from "../Data";
import TableStyle from "./TableStyle";
import Situation from "../Situation";
import type {
  StatTableProps,
  TableData,
  TableHeader,
  TableRow,
  TableSource,
} from "./StatTableUtil";

//
// Types

type Stat = StatRoot<unknown, unknown> | undefined;
const stat = Data.stat;

export type CellData = {
  ref: RefObject<HTMLElement | null>;
  stat: Stat;
};

type Sort<T extends string> = {
  column: T | undefined;
  isReversed: boolean;
};

interface StatTableSourceProps<T extends string> extends StatTableProps {
  src: TableSource<T>;
}

//
// Components

function StatTable<T extends string>({
  src,
  className,
  id,
}: StatTableSourceProps<T>) {
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
  const [sort, toggleSort] = useSort(src);

  const values = useMemo(
    () => ({
      src,
      states,
      sort,
      toggleSort,
    }),
    [src, states, sort, toggleSort]
  );
  const dValues = useDeferredValue(values);
  const {
    src: dSrc,
    states: dStates,
    sort: dSort,
    toggleSort: dToggleSort,
  } = dValues;
  const isPending = dValues !== values;

  useEffect(() => {
    if (isPending) {
      window.__setLoadingId(id);
    } else {
      window.__removeLoadingId(id);
    }
  }, [isPending, id]);

  return (
    <div
      className={cn(
        "stat-table-wrapper d-flex justify-content-center",
        className,
        {
          pending: isPending,
        }
      )}
    >
      <TableControl
        src={dSrc}
        states={dStates}
        id={id}
        sort={dSort}
        toggleSort={dToggleSort}
      />
    </div>
  );
}

const TableControl = memo(TableControl_) as typeof TableControl_;
function TableControl_<T extends string>({
  src,
  states,
  id,
  sort,
  toggleSort,
}: {
  src: TableSource<T>;
  states: States;
  id: string;
  sort: Sort<T>;
  toggleSort: HandleSort<T>;
}) {
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
      <TableStyle headers={dData.headers} id={id} />
      <Table
        striped
        size="sm"
        id={id}
        className={cn("stat-table", { pending: isPending })}
      >
        <EmptyAlert tableData={dData} />
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
          if (TableStyle.isSortable(col.id)) {
            role = "button";
            handleClick = onClick;
          }

          return (
            <th
              key={col.id}
              className={cn(col.id, sortCn)}
              role={role}
              onClick={() => handleClick?.(col.id)}
            >
              <HeaderName statType={col.id} setting={setting} name={col.name} />
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function HeaderName({
  statType,
  setting,
  name,
}: {
  statType: string;
  setting: Setting;
  name: string;
}): ReactNode {
  const base = Data.StatType.getHeaderName(statType, setting, name);

  function getName(alias: string) {
    return (
      <>
        <span className="header-alias">{alias}</span>
        <span className="header-name">{base}</span>
      </>
    );
  }

  switch (statType) {
    case stat.defense:
      return getName("物防");
    case stat.resist:
      return getName("魔防");
    case stat.duration:
      return getName("効果(秒)");
    case stat.damageType:
      return getName("属性");
    default:
      return base;
  }
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

  return (
    <tbody>
      {tableData.rows.map((row) => {
        let separator;
        if (
          row instanceof Situation &&
          TableStyle.isBorderEnabled(sortColumn)
        ) {
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

function EmptyAlert<T extends string>({
  tableData,
}: {
  tableData: TableData<T>;
}) {
  if (tableData.rows.length > 0) {
    return;
  } else {
    return (
      <caption>
        <Alert variant="info">
          表示結果がありませんでした。フィルターや検索ワードを確認してください。
        </Alert>
      </caption>
    );
  }
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
  return headers.map((col) => (
    <Cell
      key={col.id}
      stat={row[col.id]}
      setting={setting}
      handlers={handlers}
    />
  ));
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
