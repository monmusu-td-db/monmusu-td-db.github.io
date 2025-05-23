import "./StatTable.css";
import thStyle from "./TableStyles/th.module.css";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Table } from "react-bootstrap";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting, type States } from "../States";
import TooltipControl from "./TooltipControl";
import { stat } from "../Data";
import cn from "classnames";
import Panel from "./Panel";
import * as Data from "../Data";

//
// Types

type Stat = StatRoot<unknown, unknown> | undefined;

export type CellData = {
  ref: RefObject<HTMLElement>;
  str: string;
};

export type CellEventHandler = (cell: CellData) => void;
export type CellEventHandlers = {
  onClick: CellEventHandler;
  onMouseOver: CellEventHandler;
  onMouseOut: CellEventHandler;
};
export const CellEventHandlersContext = createContext<CellEventHandlers>({
  onClick: () => {},
  onMouseOver: () => {},
  onMouseOut: () => {},
});

export interface TableData<T extends string> {
  headers: readonly TableHeader<T>[];
  rows: readonly TableRow<T>[];
}

export interface TableSourceX<T extends string> extends TableData<T> {
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

function StatTable<T extends string>({ src }: { src: TableSourceX<T> }) {
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
      <TableRoot src={src} states={states} />
    </div>
  );
}

const TableRoot = memo(TableRoot_) as typeof TableRoot_;
function TableRoot_<T extends string>({
  src,
  states,
}: {
  src: TableSourceX<T>;
  states: States;
}) {
  const [sort, toggleSort] = useSort(src);
  const panelOpen = Panel.Contexts.useOpen();
  const deferredStates = useDeferredValue(states);
  const isPending = states !== deferredStates;

  const filteredList = useMemo(
    () => src.filter(deferredStates),
    [src, deferredStates]
  );

  const data: TableData<T> = useMemo(() => {
    let sortedList;
    if (sort.column === undefined) {
      sortedList = filteredList;
    } else {
      sortedList = src.sort(
        deferredStates.setting,
        filteredList,
        sort.column,
        sort.isReversed
      );
    }
    return {
      headers: src.headers,
      rows: sortedList,
    };
  }, [filteredList, src, deferredStates, sort]);
  const deferredData = useDeferredValue(data);

  return (
    <TooltipControl hide={isPending || panelOpen}>
      <Style headers={deferredData.headers} />
      <Table
        striped
        size="sm"
        className={cn("stat-table", { pending: isPending })}
      >
        <Header
          headers={deferredData.headers}
          sort={sort}
          onClick={toggleSort}
        />
        <Body tableData={deferredData} setting={deferredStates.setting} />
      </Table>
    </TooltipControl>
  );
}

type HandleSort<T extends string> = (column: T) => void;
function useSort<T extends string>(
  src: TableSourceX<T>
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

const Style = memo(function Style({
  headers,
}: {
  headers: readonly TableHeader<string>[];
}) {
  const endIndexes: number[] = [];
  const centerIndexes: number[] = [];
  headers.forEach((col, index) => {
    switch (col.id) {
      case stat.cost:
      case stat.hp:
      case stat.attack:
      case stat.defense:
      case stat.resist:
      case stat.physicalLimit:
      case stat.magicalLimit:
      case stat.initialTime:
      case stat.duration:
      case stat.cooldown:
      case stat.dps0:
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        endIndexes.push(index);
        break;
      case stat.rarity:
      case stat.element:
      case stat.species:
      case stat.attackSpeed:
      case stat.delay:
      case stat.interval:
      case stat.block:
      case stat.target:
      case stat.range:
      case stat.moveSpeed:
      case stat.moveType:
      case stat.damageType:
      case stat.placement:
        centerIndexes.push(index);
        break;
    }
  });

  const emptyIndexes: number[] = [];
  headers.forEach((col, index) => {
    switch (col.id) {
      case stat.skillName:
      case stat.conditions:
      case stat.supplements:
      case stat.damageType:
      case stat.dps0:
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        break;
      default:
        emptyIndexes.push(index);
        break;
    }
  });

  const getSelector = (index: number) =>
    `.stat-table>tbody>tr>td:nth-child(${index + 1})`;

  return (
    <style
      precedence="medium"
      href="stat-table"
      dangerouslySetInnerHTML={{
        __html:
          `${endIndexes.map(getSelector).join()}{text-align:end;}` +
          `${centerIndexes.map(getSelector).join()}{text-align:center;}` +
          `${emptyIndexes
            .map((i) => getSelector(i) + ":empty::before")
            .join()}{content:"-"}`,
      }}
    />
  );
});

const Header = memo(Header_) as typeof Header_;
function Header_<T extends string>({
  headers,
  sort,
  onClick,
}: {
  headers: readonly TableHeader<T>[];
  sort: Sort<T>;
  onClick: HandleSort<T>;
}) {
  const sortColor = Data.CSSSelector.getTableColor(
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
              {col.name}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

const Body = memo(function Body({
  tableData,
  setting,
}: {
  tableData: TableData<string>;
  setting: Setting;
}) {
  return (
    <tbody>
      {tableData.rows.map((row) => (
        <tr key={row.id}>
          <Row headers={tableData.headers} row={row} setting={setting} />
        </tr>
      ))}
    </tbody>
  );
});

const Row = memo(function Row({
  headers,
  row,
  setting,
}: {
  headers: readonly TableHeader<string>[];
  row: TableRow<string>;
  setting: Setting;
}) {
  return (
    <>
      {headers.map((col) => (
        <Cell key={col.id} stat={row[col.id]} setting={setting}></Cell>
      ))}
    </>
  );
});

const Cell = memo(function Cell({
  stat,
  setting,
}: {
  stat: Stat;
  setting: Setting;
}) {
  const ref = useRef(null);
  const { onClick, onMouseOver, onMouseOut } = useContext(
    CellEventHandlersContext
  );

  const str = stat?.statType ?? "undefined";

  const arg = { ref, str };
  return (
    <>
      <td
        ref={ref}
        onClick={() => onClick(arg)}
        onMouseOver={() => onMouseOver(arg)}
        onMouseOut={() => onMouseOut(arg)}
        className={stat?.getStyles(setting)}
      >
        {stat?.getItem(setting)}
      </td>
    </>
  );
});

export default StatTable;
