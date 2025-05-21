import "./StatTable.css";
import thStyle from "./TableStyles/th.module.css";
import {
  createContext,
  memo,
  useContext,
  useDeferredValue,
  useMemo,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { Table } from "react-bootstrap";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting, type States } from "../States";
import TooltipControl from "./TooltipControl";
import { stat } from "../Data";

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

function StatTable<T extends string>({ src }: { src: TableSourceX<T> }) {
  return (
    <div className="d-flex justify-content-center">
      <TooltipControl>
        <TableControl src={src} />
      </TooltipControl>
    </div>
  );
}

function getPendingStyle(isPending: boolean): CSSProperties {
  return {
    opacity: isPending ? 0.5 : 1,
    transition: "opacity 0.2s 0.2s linear",
  };
}

function TableControl<T extends string>({ src }: { src: TableSourceX<T> }) {
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

  return <TableRoot src={src} states={states} />;
}

const TableRoot = memo(function TableRoot<T extends string>({
  src,
  states,
}: {
  src: TableSourceX<T>;
  states: States;
}) {
  const deferredStates = useDeferredValue(states);
  const isPending = states !== deferredStates;

  const data: TableData<T> = useMemo(
    () => ({
      headers: src.headers,
      rows: src.filter(states),
    }),
    [src, states]
  );
  const deferredData = useDeferredValue(data);

  return (
    <>
      <Style headers={deferredData.headers} />
      <Table
        striped
        size="sm"
        className="stat-table"
        style={getPendingStyle(isPending)}
      >
        <Header headers={deferredData.headers} />
        <tbody>
          <Row tableData={deferredData} setting={deferredStates.setting} />
        </tbody>
      </Table>
    </>
  );
});

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

const Header = memo(function Header({
  headers,
}: {
  headers: readonly TableHeader<string>[];
}) {
  return (
    <thead>
      <tr>
        {headers.map((col) => (
          <th key={col.id} className={thStyle[col.id]}>
            {col.name}
          </th>
        ))}
      </tr>
    </thead>
  );
});

const Row = memo(function Row({
  tableData,
  setting,
}: {
  tableData: TableData<string>;
  setting: Setting;
}) {
  return tableData.rows.map((row) => (
    <tr key={row.id}>
      {tableData.headers.map((col) => (
        <Cell key={col.id} stat={row[col.id]} setting={setting}></Cell>
      ))}
    </tr>
  ));
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
