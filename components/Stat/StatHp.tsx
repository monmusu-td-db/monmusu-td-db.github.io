import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";
import { Tooltip as Tt } from "./StatTooltip";

const sign = Tt.sign;
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
    const f = this.getFactors(setting);
    if (f === undefined) return;

    return (
      <>
        {super.getTooltipBody(setting)}
        <Tt.Equation disabled={f.currentFactor === 100}>
          {(d) => (
            <>
              <Tt.Result>{d ? "現在HP" : f.actualResult}</Tt.Result>
              <Tt.Expression>
                {d ? "最大HP" : f.inBattleResult}
                <Tt.Multiply>
                  <Tt.Value isPositive={f.currentFactor > 100}>
                    {d
                      ? "現在値割合"
                      : Math.round(f.currentFactor) + sign.PERCENT}
                  </Tt.Value>
                </Tt.Multiply>
              </Tt.Expression>
            </>
          )}
        </Tt.Equation>
      </>
    );
  }
}
