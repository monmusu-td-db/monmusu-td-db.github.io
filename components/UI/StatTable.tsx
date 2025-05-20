import "./StatTable.css";
import thStyle from "./TableStyles/th.module.css";
import colStyle from "./TableStyles/col.module.css";
import {
  createContext,
  memo,
  useContext,
  useDeferredValue,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { Table } from "react-bootstrap";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting } from "../States";
import TooltipControl from "./TooltipControl";

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

export type TableData<T extends string> = {
  headers: readonly TableHeader<T>[];
  rows: readonly TableRow<T>[];
};

export type TableHeader<T extends string> = {
  id: T;
  name: string;
};

export type TableRow<T extends string> = {
  readonly [key in T]: StatRoot<unknown, unknown>;
} & {
  readonly id: number;
};

function StatTable<T extends string>({ src }: { src: TableData<T> }) {
  return (
    <div className="d-flex justify-content-center">
      <TooltipControl>
        <TableRoot src={src} />
      </TooltipControl>
    </div>
  );
}

function TableRoot<T extends string>({ src }: { src: TableData<T> }) {
  const setting = Contexts.useSetting();
  const deferredSetting = useDeferredValue(setting);
  return (
    <Table striped size="sm" className="stat-table" style={getInlineStyle()}>
      <Header headers={src.headers} />
      <tbody>
        <Row tableData={src} setting={deferredSetting} />
      </tbody>
    </Table>
  );
}

function getInlineStyle(): CSSProperties {
  return { ["--st-col-hp"]: 1 } as CSSProperties;
}

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
      >
        {stat?.getItem(setting)}
      </td>
    </>
  );
});

export default StatTable;
