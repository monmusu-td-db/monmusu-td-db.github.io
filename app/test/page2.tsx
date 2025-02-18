"use client";

import { memo, useDeferredValue, useEffect, useState } from "react";
import { Button, OverlayTrigger, Popover, Tooltip, type PopoverProps } from "react-bootstrap";
import Overlay from "./Overlay";
import type { OverlayInjectedProps } from "react-bootstrap/esm/OverlayTrigger";
export default function App() {

  return (
    <div style={{ width: 800, marginLeft: "auto", marginRight: "auto" }}>
      <OverlayTrigger
        overlay={<Tooltip id="1">Content</Tooltip>}
        placement="auto"
        trigger="click"
      >
        <Button>Toggle</Button>
      </OverlayTrigger>

      <Test />
      {/* <Comp1 value={[id1, id2]} /> */}
    </div >
  );
}


function Test() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button id="button" onClick={() => setShow(p => !p)}>Test Module</Button>

      {show && (
        <div
          className={"tooltip show fade bs-tooltip-end"}
          role="tooltip"
          style={{
            position: "absolute",
            inset: "0px auto auto 0px",
            translate: "(362px 55px)"
          }}
        >
          <div className="tooltip-inner">
            Content2
          </div>
        </div>
      )}
    </>
  );
}

function Comp1({ value }: { value: number[] }) {
  const dValue = useDeferredValue(value);
  const isPending = dValue !== value;
  return (
    <span style={{ opacity: (isPending ? 0.5 : 1) }}>
      <SlowComponent value={dValue} />
    </span>
  );
}

const SlowComponent = memo(function SlowComponent({ value }: { value: number[] }) {
  const startTime = performance.now();
  while (performance.now() - startTime < 500) {
    // Do nothing for 500 ms to emulate extremely slow code
  }
  return <>Slow {value[0]} {value[1]}!!</>;
});
