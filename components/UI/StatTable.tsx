import {
  createContext,
  useContext,
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

const HandleClickContext = createContext<CellEventHandler>(() => {});

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
  const onClick = useContext(HandleClickContext);

  return (
    <>
      <td ref={ref} onClick={() => onClick({ ref, str })}>
        {str}
      </td>
    </>
  );
}

function Tooltip({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [cell, setCell] = useState<CellData | null>(null);

  function handleClick(newCell: CellData) {
    if (newCell.ref === cell?.ref) {
      setShow((p) => !p);
    } else {
      setCell(newCell);
      setShow(true);
    }
  }

  const ref = cell?.ref ?? null;
  const placement = "auto";
  const flip = placement && placement.indexOf("auto") !== -1;

  return (
    <HandleClickContext.Provider value={handleClick}>
      {children}
      <Overlay target={ref} show={show} placement={placement} flip={flip}>
        {(p) => {
          return tooltip(p);
        }}
      </Overlay>
    </HandleClickContext.Provider>
  );
}

function tooltip(props: OverlayInjectedProps) {
  console.log(props);
  return (
    <Popover {...props} placement="auto">
      <Popover.Header as="h3">Header</Popover.Header>
      <Popover.Body>test</Popover.Body>
    </Popover>
  );
}

export default StatTable;
