import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";

type Factors = Data.ActualHpFactors | undefined;

export class StatHp extends SituationBaseStat<Factors> {
  protected override getDefaultItem(setting: Setting): ReactNode {
    const Item = super.NumberItem;
    const factors = this.getFactors(setting);
    const value = this.getValue(setting) ?? 0;
    const ret = <Item value={value} />;

    if (factors?.isUnhealable) {
      return <u>{ret}</u>;
    }

    return ret;
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    return <>{super.getTooltipBody(setting)}</>;
  }
}
