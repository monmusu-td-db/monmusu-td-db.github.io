"use client";

import "./Tooltip.css";
import * as Data from "../Data";
import { createContext, useContext, type ReactNode } from "react";
import { Popover } from "react-bootstrap";
import { StatTooltip } from "../Stat/StatTooltip";
import { type Setting } from "../States";

const textColor = {
  RESULT: "text-warning",
  POSITIVE: "text-dark-teal",
  NEGATIVE: "text-dark-red",
  INFO: "text-info",
} as const;

const sign = {
  EQUAL: " = ",
  PLUS: " + ",
  MINUS: " - ",
  MULTIPLY: " × ",
  DIVIDE: " / ",
  PERCENT: "%",
  BSTART: "(",
  BEND: ")",
  FRAME: "f",
  SECOND: "秒",
} as const;

interface TextBaseProps {
  children: ReactNode;
  b?: boolean | undefined;
}

interface TextProps extends TextBaseProps {
  className: string | undefined;
}

function Body({
  stat,
  setting,
}: {
  stat: StatTooltip<unknown, unknown>;
  setting: Setting;
}) {
  const body = stat.getTooltipBody(setting);
  return (
    <>
      <Popover.Header as="h3">
        {Data.StatType.getHeaderName(
          stat.statType,
          setting,
          Data.StatType.nameOf(stat.statType)
        )}
      </Popover.Header>
      <Popover.Body>{stat.isNotDescList ? body : <dl>{body}</dl>}</Popover.Body>
    </>
  );
}

function Text({ className, children, b }: TextProps) {
  return <span className={className}>{b ? <b>{children}</b> : children}</span>;
}

function Positive({ children, b }: TextBaseProps) {
  return (
    <Text className={textColor.POSITIVE} b={b}>
      {children}
    </Text>
  );
}

function Negative({ children, b }: TextBaseProps) {
  return (
    <Text className={textColor.NEGATIVE} b={b}>
      {children}
    </Text>
  );
}

interface ValueProps extends TextBaseProps {
  isPositive: boolean;
}

function Value({ children, b, isPositive }: ValueProps) {
  if (isPositive) return <Positive b={b}>{children}</Positive>;
  else return <Negative b={b}>{children}</Negative>;
}

function Info({ children, b }: TextBaseProps) {
  return (
    <Text className={textColor.INFO} b={b}>
      {children}
    </Text>
  );
}

const IsDescContext = createContext(false);

function Equation({
  children,
  disabled,
}: {
  children: (isDesc: boolean) => ReactNode;
  disabled?: boolean;
}) {
  if (disabled) return;
  return (
    <>
      <dt>
        <IsDescContext.Provider value={true}>
          {children(true)}
        </IsDescContext.Provider>
      </dt>
      <dd>
        <IsDescContext.Provider value={false}>
          {children(false)}
        </IsDescContext.Provider>
      </dd>
    </>
  );
}

function Result({ children }: { children: ReactNode }) {
  const isDesc = useContext(IsDescContext);
  return (
    <>
      <Text className={textColor.RESULT} b={!isDesc}>
        {children}
      </Text>
      {sign.EQUAL}
    </>
  );
}

function Expression({ children }: { children: ReactNode }) {
  const isDesc = useContext(IsDescContext);
  if (isDesc) {
    return <small>{children}</small>;
  } else {
    return children;
  }
}

interface ExpressionItemProps {
  enabled?: boolean;
  children: ReactNode;
}

function Brackets({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false) {
    return (
      <>
        {sign.BSTART}
        {children}
        {sign.BEND}
      </>
    );
  } else {
    return children;
  }
}

function Plus({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false) {
    return (
      <>
        {sign.PLUS}
        {children}
      </>
    );
  }
}

function Minus({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false) {
    return (
      <>
        {sign.MINUS}
        {children}
      </>
    );
  }
}

function Multiply({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false) {
    return (
      <>
        {sign.MULTIPLY}
        {children}
      </>
    );
  }
}

function Divide({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false) {
    return (
      <>
        {sign.DIVIDE}
        {children}
      </>
    );
  }
}

function List({ children }: { children: ReactNode }) {
  return (
    <table className="stat-tooltip-table">
      <tbody>{children}</tbody>
    </table>
  );
}

function ListItem({
  children,
  label,
}: {
  children: ReactNode;
  label: ReactNode;
}) {
  return (
    <tr>
      <th>{label}</th>
      <td>{children}</td>
    </tr>
  );
}

export const Tooltip = Object.assign(Body, {
  sign,
  Positive,
  Negative,
  Value,
  Info,
  Equation,
  Result,
  Expression,
  Brackets,
  Plus,
  Minus,
  Multiply,
  Divide,
  List,
  ListItem,
});
