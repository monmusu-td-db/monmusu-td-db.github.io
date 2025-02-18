import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import type { BaseStatProps } from "./BaseStat";
import { SituationBaseStat } from "./SituationBaseStat";

export type Factors = Data.ActualDefResFactors | undefined

export class StatDefRes extends SituationBaseStat<Factors> {
  constructor(props: BaseStatProps<number | undefined, Factors>) {
    super(props);
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    return (
      <>
        {f.staticDamage === undefined ? <>
          {super.getTooltipBody(setting)}
        </> : <>
          {this.getStaticDamageTooltip(setting, f)}
        </>}
      </>
    );
  }
}
