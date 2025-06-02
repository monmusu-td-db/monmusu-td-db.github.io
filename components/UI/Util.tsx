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

export function getDpsColor(
  value: number | undefined,
  damageType: Data.DamageType | undefined
): Data.TableColor | undefined {
  if (value === undefined) return;
  switch (damageType) {
    case Data.damageType.physical:
      if (value < 1000) return;
      if (value < 2000) return Data.tableColor.blue100;
      if (value < 3000) return Data.tableColor.blue;
      if (value < 5000) return Data.tableColor.blue300;
      if (value < 7000) return Data.tableColor.blue500;
      if (value < 10000) return Data.tableColor.blue700;
      else return Data.tableColor.blue900;

    case Data.damageType.magic:
      if (value < 1000) return;
      if (value < 2000) return Data.tableColor.green100;
      if (value < 3000) return Data.tableColor.green;
      if (value < 5000) return Data.tableColor.green300;
      if (value < 7000) return Data.tableColor.green500;
      if (value < 10000) return Data.tableColor.green700;
      else return Data.tableColor.green900;

    case Data.damageType.true:
      if (value < 1000) return;
      if (value < 2000) return Data.tableColor.red100;
      if (value < 3000) return Data.tableColor.red;
      if (value < 5000) return Data.tableColor.red300;
      if (value < 7000) return Data.tableColor.red500;
      if (value < 10000) return Data.tableColor.red700;
      else return Data.tableColor.red900;
  }

  if (Data.DamageType.isHeal(damageType)) {
    if (value < 300) return;
    if (value < 400) return Data.tableColor.yellow100;
    if (value < 600) return Data.tableColor.yellow300;
    if (value < 800) return Data.tableColor.yellow500;
    if (value < 1000) return Data.tableColor.yellow600;
    else return Data.tableColor.yellow800;
  }
}
