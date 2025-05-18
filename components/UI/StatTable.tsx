import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import "./StatTable.css";
import { Overlay, Popover, Table } from "react-bootstrap";
import type { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";

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

const DATA_X = 20;
const data = (() => {
  const x = DATA_X;
  const y = 100;

  const arr: string[][] = [];
  for (let iy = 0; iy < y; iy++) {
    const row: string[] = [];
    arr[iy] = row;
    for (let ix = 0; ix < x; ix++) {
      row[ix] = `${iy}-${ix}`;
    }
  }
  return arr;
})();

function StatTable() {
  return (
    <div className="d-flex justify-content-center">
      <Tooltip>
        <Table striped size="sm" className="stat-table">
          <Header />
          <tbody>
            <Row />
          </tbody>
        </Table>
      </Tooltip>
    </div>
  );
}

function Header() {
  return (
    <thead>
      <tr>
        {(() => {
          const arr = [];
          for (let i = 0; i < DATA_X; i++) {
            arr[i] = <th key={i}>{`h${i}`}</th>;
          }
          return arr;
        })()}
      </tr>
    </thead>
  );
}

function Row() {
  return data.map((row, i) => (
    <tr key={i}>
      {row.map((item, i) => (
        <Cell key={i} str={item} />
      ))}
    </tr>
  ));
}

function Cell({ str }: { str: string }) {
  const ref = useRef(null);
  const { onClick, onMouseOver, onMouseOut } = useContext(
    CellEventHandlersContext
  );
  const arg = { ref, str };
  return (
    <>
      <td
        ref={ref}
        onClick={() => onClick(arg)}
        onMouseOver={() => onMouseOver(arg)}
        onMouseOut={() => onMouseOut(arg)}
      >
        {str}
      </td>
    </>
  );
}

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
