import { createContext, useContext, type ReactNode } from "react";
import { Popover, PopoverBody, PopoverHeader } from "react-bootstrap";
import type { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";
import type { Placement } from "react-bootstrap/esm/types";

import * as Data from "../Data";
import { Setting } from "../States";
import { StatRoot, type StatHandler } from "./StatRoot";

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
} as const;

export abstract class StatTooltip<TStat, TFactors = undefined> extends StatRoot<TStat, TFactors> {
  readonly isEnabled: StatHandler<boolean> = () => true;
  readonly placement: Placement = "auto";
  readonly equal = " = ";
  readonly plus = " + ";
  readonly minus = " - ";
  readonly multiply = " × ";
  readonly divide = " / ";
  readonly percent = "%";
  readonly bStart = "(";
  readonly bEnd = ")";
  readonly frame = "f";

  getTooltip(props: OverlayInjectedProps, setting: Setting, id: number): ReactNode {
    return (
      <Popover id={`${id}_${this.statType}_tooltip`} {...props} placement={this.placement}>
        <PopoverHeader as="h3">{Data.StatType.nameOf(this.statType)}</PopoverHeader>
        <PopoverBody>
          <dl>{this.getTooltipBody(setting)}</dl>
        </PopoverBody>
      </Popover>
    );
  }

  protected abstract getTooltipBody(setting: Setting): ReactNode
}


// Util

interface TextBaseProps {
  children: ReactNode
  b?: boolean | undefined
}

interface TextProps extends TextBaseProps {
  className: string | undefined
}

function Text({ className, children, b }: TextProps) {
  return (
    <span className={className}>
      {b ? (
        <b>{children}</b>
      ) : (
        children
      )}
    </span>
  );
}

function Positive({ children, b }: TextBaseProps) {
  return <Text className={textColor.POSITIVE} b={b}>{children}</Text>;
}

function Negative({ children, b }: TextBaseProps) {
  return <Text className={textColor.NEGATIVE} b={b}>{children}</Text>;
}

interface ValueProps extends TextBaseProps {
  isPositive: boolean
}

function Value({ children, b, isPositive }: ValueProps) {
  if (isPositive)
    return <Positive b={b}>{children}</Positive>;
  else
    return <Negative b={b}>{children}</Negative>;
}

function Info({ children, b }: TextBaseProps) {
  return <Text className={textColor.INFO} b={b}>{children}</Text>;
}


const IsDescContext = createContext(false);

function Equation({ children }: { children: (isDesc: boolean) => ReactNode }) {
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
    return (
      <small>
        {children}
      </small>
    );
  } else {
    return children;
  }
}

interface ExpressionItemProps {
  enabled?: boolean
  children: ReactNode
}

function Brackets({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false)
    return <>{sign.BSTART}{children}{sign.BEND}</>;
  else
    return children;
}

function Plus({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false)
    return <>{sign.PLUS}{children}</>;
}

function Multiply({ enabled, children }: ExpressionItemProps) {
  if (enabled !== false)
    return <>{sign.MULTIPLY}{children}</>;
}

export const Tooltip = {
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
  Multiply,
};
