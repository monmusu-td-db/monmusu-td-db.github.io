import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";
import type { StatProps } from "./StatRoot";

export type Factors = Data.ActualDefResFactors | undefined

export class StatDefRes extends SituationBaseStat<Factors> {
  constructor(props: StatProps<number | undefined, Factors>) {
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
