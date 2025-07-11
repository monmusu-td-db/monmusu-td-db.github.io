import { type ReactNode } from "react";

import "./Util.css";
import * as Data from "../Data";
import cn from "classnames";

const text = {
  positive: "text-dark-teal",
  negative: "text-dark-red",
  neutral: "text-info",
  header: "text-warning",
  legend: "text-warning",
  epic: "text-dark-indigo",
  rare: "text-dark-cyan",
  common: undefined,
} as const;

// Items

export function getRarityText(value: Data.Rarity | undefined): ReactNode {
  const name = Data.Rarity.nameOf(value);
  if (value === undefined) return;

  let className;
  switch (name) {
    case Data.Rarity.name.L:
      className = text.legend;
      break;
    case Data.Rarity.name.E:
      className = text.epic;
      break;
    case Data.Rarity.name.R:
      className = text.rare;
      break;
    case Data.Rarity.name.C:
      className = text.common;
      break;
  }
  return <span className={className}>{name}</span>;
}

export function ElementText({
  element,
}: {
  element: Data.Element | undefined;
}) {
  if (element === undefined) return;
  const key = Data.Element.keyOf(element);
  return (
    <span className={cn("text", Data.Element.selectorOf(key))}>{element}</span>
  );
}
