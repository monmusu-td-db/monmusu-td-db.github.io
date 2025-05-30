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

// Components

interface TextColorComponentsProps {
  children: ReactNode;
  b?: boolean;
}
interface LevelProps extends TextColorComponentsProps {
  level: boolean;
}
function SpanTextColor({
  props,
  className,
}: {
  props: TextColorComponentsProps;
  className: string | undefined;
}) {
  const c = props.b ? <b>{props.children}</b> : props.children;
  return <span className={className}>{c}</span>;
}
export function Positive(props: TextColorComponentsProps) {
  return <SpanTextColor className={text.positive} props={props} />;
}
export function Negative(props: TextColorComponentsProps) {
  return <SpanTextColor className={text.negative} props={props} />;
}
export function Level(props: LevelProps) {
  if (props.level) return Positive(props);
  else return Negative(props);
}
export function Neutral(props: TextColorComponentsProps) {
  return <SpanTextColor className={text.neutral} props={props} />;
}
export function Result(props: TextColorComponentsProps) {
  return <SpanTextColor className={text.header} props={props} />;
}

// Stats

export function getTableColor(
  v1: number | undefined,
  v2: number | undefined = 0,
  isStrong: boolean = false
): Data.TableColor | undefined {
  const c = Data.tableColorAlias;
  if (v1 !== undefined) {
    if (v1 > v2) return isStrong ? c.positiveStrong : c.positive;
    if (v1 < v2) return isStrong ? c.negativeStrong : c.negative;
  }
}

export function getTableColorWeak(
  v1: number | undefined,
  v2: number | undefined = 0
): Data.TableColor | undefined {
  const c = Data.tableColorAlias;
  if (v1 !== undefined) {
    if (v1 > v2) return c.positiveWeak;
    if (v1 < v2) return c.negativeWeak;
  }
}

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

export function getUnhealableText(
  content: string | JSX.Element | undefined,
  isSmall?: boolean
): JSX.Element | undefined {
  if (content === undefined) return;
  return <u>{getBaseStatItem(content, isSmall)}</u>;
}

export function getBaseStatItem(
  content: string | number | JSX.Element | undefined,
  isSmall?: boolean
): ReactNode {
  if (content === undefined || !isSmall) return content;
  return <small>{content}</small>;
}

export function getLimitText(value: number | undefined) {
  if (value === Infinity) return "∞";
  return value?.toFixed(0);
}

export function getLimitItem(
  value: number | undefined,
  isUnhealable: boolean | undefined
) {
  const content = getLimitText(value);
  if (content === undefined) return;
  let ret;
  if (value !== undefined && value !== Infinity && value > 100000)
    ret = <small>{content}</small>;
  else ret = content;
  if (isUnhealable) return getUnhealableText(ret);
  return ret;
}

export function getPhysicalLimitColor(
  value: number | undefined
): Data.TableColor | undefined {
  if (value === undefined) return;
  if (value < 1500) return;
  if (value < 3000) return Data.tableColor.blue100;
  if (value < 4500) return Data.tableColor.blue;
  if (value < 6000) return Data.tableColor.blue300;
  if (value < 10000) return Data.tableColor.blue500;
  if (value < 15000) return Data.tableColor.blue700;
  else return Data.tableColor.blue900;
}

export function getMagicalLimitColor(
  value: number | undefined
): Data.TableColor | undefined {
  if (value === undefined) return;
  if (value < 1500) return;
  if (value < 3000) return Data.tableColor.green100;
  if (value < 4500) return Data.tableColor.green;
  if (value < 6000) return Data.tableColor.green300;
  if (value < 10000) return Data.tableColor.green500;
  if (value < 15000) return Data.tableColor.green700;
  else return Data.tableColor.green900;
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

export function comparer(
  a: unknown,
  b: unknown,
  isDescending?: boolean
): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;

  const x = isDescending ? b : a;
  const y = isDescending ? a : b;

  if (typeof x === "string" && typeof y === "string") {
    return x.localeCompare(y);
  }

  return x < y ? -1 : 1;
}
