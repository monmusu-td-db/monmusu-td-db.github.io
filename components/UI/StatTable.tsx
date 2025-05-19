import style from "./th.module.css";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import "./StatTable.css";
import { Overlay, Popover, Table } from "react-bootstrap";
import type { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting } from "../States";

type Stat = StatRoot<unknown, unknown> | undefined;

type CellData = {
  ref: RefObject<HTMLElement>;
  str: string;
};

type CellEventHandler = (cell: CellData) => void;
type CellEventHandlers = {
  onClick: CellEventHandler;
  onMouseOver: CellEventHandler;
  onMouseOut: CellEventHandler;
};
const CellEventHandlersContext = createContext<CellEventHandlers>({
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
      <Tooltip>
        <TableRoot src={src} />
      </Tooltip>
    </div>
  );
}

function TableRoot<T extends string>({ src }: { src: TableData<T> }) {
  const setting = Contexts.useSetting();
  const deferredSetting = useDeferredValue(setting);
  return (
    <Table striped size="sm" className="stat-table">
      <Header headers={src.headers} />
      <tbody>
        <Row tableData={src} setting={deferredSetting} />
      </tbody>
    </Table>
  );
}

const Header = memo(function Header({
  headers,
}: {
  headers: readonly TableHeader<string>[];
}) {
  console.log("re");
  return (
    <thead>
      <tr>
        {headers.map((col) => (
          <th key={col.id} className={style[col.id]}>
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

type TooltipCond = {
  show: boolean;
  cell: CellData | null;
};

function Tooltip({ children }: { children: ReactNode }) {
  const [cond, setCond] = useState<TooltipCond>({ show: false, cell: null });

  const handleClick = useCallback((target: CellData) => {
    setCond((p) => {
      return {
        show: p.cell?.ref === target.ref ? !p.show : true,
        cell: target,
      };
    });
  }, []);

  const handleMouseOver = useCallback((target: CellData) => {
    setCond({
      show: true,
      cell: target,
    });
  }, []);

  const handleMouseOut = useCallback((target: CellData) => {
    setTimeout(() => {
      // ちらつきを抑えるために遅延させる
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

export default StatTable;
