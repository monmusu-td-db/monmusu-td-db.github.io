import { type ReactNode } from "react";
import { Popover, PopoverBody, PopoverHeader } from "react-bootstrap";
import type { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";
import type { Placement } from "react-bootstrap/esm/types";

import * as Data from "../Data";
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

  getTooltip(
    props: OverlayInjectedProps,
    setting: Setting,
    id: number
  ): ReactNode {
    return (
      <Popover
        id={`${id}_${this.statType}_tooltip`}
        {...props}
        placement={this.placement}
      >
        <PopoverHeader as="h3">
          {Data.StatType.nameOf(this.statType)}
        </PopoverHeader>
        <PopoverBody>
          <dl>{this.getTooltipBody(setting)}</dl>
        </PopoverBody>
      </Popover>
    );
  }

  public abstract getTooltipBody(setting: Setting): ReactNode;
}
