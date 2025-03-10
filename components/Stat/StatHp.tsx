import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";

type Factors = Data.ActualHpFactors | undefined;

export class StatHp extends SituationBaseStat<Factors> {
  public override getTooltipBody(setting: Setting): ReactNode {
    return <>{super.getTooltipBody(setting)}</>;
  }

  protected override getDefaultItem(setting: Setting): ReactNode {}
}
