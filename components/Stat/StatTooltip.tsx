import { type ReactNode } from "react";
import type { Placement } from "react-bootstrap/esm/types";

import { Setting } from "../States";
import { StatRoot, type StatHandler } from "./StatRoot";

export abstract class StatTooltip<TStat, TFactors = undefined> extends StatRoot<
  TStat,
  TFactors
> {
  readonly isEnabled: StatHandler<boolean> = () => true;
  readonly isNotDescList: boolean = false;
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

  public abstract getTooltipBody(setting: Setting): ReactNode;
}
