import { type ReactNode } from "react";

import "./Util.css";
import * as Data from "../Data";
import cn from "classnames";

const SELECTOR = {
  TEXT: "text",
} as const;

// Items

export function getRarityText(value: Data.Rarity | undefined): ReactNode {
  if (value === undefined) {
    return;
  }

  const selector = Data.Rarity.selectorOf(value);
  const name = Data.Rarity.nameOf(value);
  return <span className={cn(SELECTOR.TEXT, selector)}>{name}</span>;
}

export function ElementText({
  element,
}: {
  element: Data.Element | undefined;
}) {
  if (element === undefined) {
    return;
  }
  const key = Data.Element.keyOf(element);
  return (
    <span className={cn(SELECTOR.TEXT, Data.Element.selectorOf(key))}>
      {element}
    </span>
  );
}

export function SpinnerBorder() {
  return (
    <div className="spinner-border">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
