import { Fragment, type ReactNode } from "react";

import styles from "./Util.module.css";
import * as Data from "../Data";

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

export function JoinTexts({
  texts = [],
  separator = " ",
  nowrap = false,
}: {
  texts?: readonly ReactNode[] | undefined;
  separator?: ReactNode;
  nowrap?: boolean;
}): ReactNode[] {
  return texts.map((v, i) => (
    <Fragment key={i}>
      {i !== 0 && separator}
      {nowrap ? <TextNoWrap>{v}</TextNoWrap> : v}
    </Fragment>
  ));
}

function TextNoWrap({ children }: { children: ReactNode }) {
  return <span className={styles["text-nowrap"]}>{children}</span>;
}

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
  return (
    <span className={styles[`text-e-${Data.Element.keyOf(element)}`]}>
      {element}
    </span>
  );
}
