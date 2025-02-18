import type { ReactNode } from "react";
import type { PopoverProps } from "react-bootstrap";

function Overlay(props: {
  children: (p: PopoverProps) => ReactNode
}) {
  return (
    <>
      {props.children({})}
    </>
  );
}

export default Overlay;
