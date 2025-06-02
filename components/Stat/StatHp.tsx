import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatStyles } from "./StatRoot";

const sign = T.sign;
type Factors = Data.ActualHpFactors | undefined;

export class StatHp extends SituationBaseStat<Factors> {
  protected override getDefaultStyles(setting: Setting): StatStyles {
    const defaultStyle = super.getDefaultStyles(setting);
    const unhealableStyle = this.getUnhealableStyle(setting);
    return StatHp.mergeStyles(defaultStyle, unhealableStyle);
  }

  private getUnhealableStyle(setting: Setting): StatStyles {
    const isUnhealable = this.getFactors(setting)?.isUnhealable;
    return isUnhealable ? Data.TableClass.unhealable : undefined;
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    return (
      <>
        {super.getTooltipBody(setting)}
        <T.Equation disabled={f.currentFactor === 100}>
          {(d) => (
            <>
              <T.Result>{d ? "現在HP" : f.actualResult}</T.Result>
              <T.Expression>
                {d ? "最大HP" : f.inBattleResult}
                <T.Multiply>
                  <T.Value isPositive={f.currentFactor > 100}>
                    {d
                      ? "現在値割合"
                      : Math.round(f.currentFactor) + sign.PERCENT}
                  </T.Value>
                </T.Multiply>
              </T.Expression>
            </>
          )}
        </T.Equation>
      </>
    );
  }
}
