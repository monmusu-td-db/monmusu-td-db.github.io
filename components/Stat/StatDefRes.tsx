import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";

export type Factors = Data.ActualDefResFactors | undefined;

export class StatDefRes extends SituationBaseStat<Factors> {
  protected override getDefaultItem(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    if (value === undefined) return;

    const Item = super.NumberItem;
    const factors = this.getFactors(setting);

    if (factors?.staticDamage !== undefined) {
      return <Item value={factors.staticDamage.result} plus />;
    }

    return <Item value={value} />;
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    return (
      <>
        {f.staticDamage === undefined ? (
          <>{super.getTooltipBody(setting)}</>
        ) : (
          <>{this.getStaticDamageTooltip(setting, f)}</>
        )}
      </>
    );
  }
}
