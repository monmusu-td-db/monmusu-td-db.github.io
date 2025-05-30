import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import type { StatHandler, StatStyles } from "./StatRoot";
import { DelayTooltip } from "./StatDelay";
import { AttackSpeedTooltip } from "./StatAttackSpeed";
import { Tooltip as T } from "../UI/Tooltip";

type Factors = Data.IntervalFactors | undefined;
const sign = T.sign;

export class StatInterval extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s)?.result !== undefined;

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const style = super.getDefaultStyles(setting);
    return this.getSmallFontStyles(setting, style, 999);
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f?.result === undefined) return;
    const b = f.base;

    return (
      <>
        {!f.staticValue && !f.staticCooldown && b !== undefined && (
          <>
            <AttackSpeedTooltip factors={b} />
            <DelayTooltip
              factors={{
                ...b,
                result: b.delayResult,
              }}
            />
          </>
        )}

        {!f.staticCooldown && (
          <T.Equation>
            {(d) => (
              <>
                <T.Result>
                  {d ? "攻撃間隔" : f.actualResult + sign.FRAME}
                </T.Result>
                <T.Expression>
                  {!!f.staticValue || b === undefined ? (
                    <>{d ? "固有値" : f.staticValue + sign.FRAME}</>
                  ) : (
                    <>
                      {d ? "攻撃動作速度" : b.attackSpeedResult + sign.FRAME}
                      <T.Plus>
                        {d ? "攻撃待機時間" : b.delayResult + sign.FRAME}
                      </T.Plus>
                    </>
                  )}
                </T.Expression>
              </>
            )}
          </T.Equation>
        )}

        {f.cooldown !== undefined && (
          <T.Equation>
            {(d) => (
              <>
                <T.Result>
                  {d ? "単発スキル発動間隔" : f.result + sign.FRAME}
                </T.Result>
                <T.Expression>
                  {f.staticCooldown ? (
                    <T.Negative>
                      {d ? "最低間隔" : f.minInterval + sign.FRAME}
                    </T.Negative>
                  ) : (
                    <>
                      {d ? "攻撃間隔" : f.actualResult + sign.FRAME}
                      {f.cooldownFrame === 1 ? (
                        <T.Plus>{d ? "再動(下限)" : 1 + sign.FRAME}</T.Plus>
                      ) : (
                        <>
                          <T.Plus>
                            {d ? "再動" : f.cooldown + sign.SECOND}
                          </T.Plus>
                          <T.Multiply>
                            {d
                              ? "フレームレート"
                              : Data.fps + sign.FRAME + "/" + sign.SECOND}
                          </T.Multiply>
                        </>
                      )}
                    </>
                  )}
                </T.Expression>
              </>
            )}
          </T.Equation>
        )}
      </>
    );
  }
}
