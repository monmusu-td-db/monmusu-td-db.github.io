import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";

export type Factors = Data.ActualDefResFactors | undefined;

export class StatDefRes extends SituationBaseStat<Factors> {
  protected override getNumberText(setting: Setting): string | undefined {
    const value = this.getValue(setting);
    if (value === undefined) {
      return;
    }

    const factors = this.getFactors(setting);
    const staticDamage = factors?.staticDamage;
    if (staticDamage !== undefined) {
      return StatDefRes.getNumber({ value: staticDamage.result, plus: true });
    } else {
      return StatDefRes.getNumber({ value });
    }
  }

  override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) {
      return;
    }

    return (
      <>
        {f.staticDamage === undefined
          ? super.getTooltipBody(setting)
          : this.getStaticDamageTooltip(setting, f)}
      </>
    );
  }
}
