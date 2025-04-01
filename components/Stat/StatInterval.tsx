import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip, Tooltip as Tt } from "./StatTooltip";
import { Setting } from "../States";
import type { StatHandler } from "./StatRoot";
import { DelayTooltip } from "./StatDelay";
import { AttackSpeedTooltip } from "./StatAttackSpeed";

type Factors = Data.IntervalFactors | undefined;
const sign = Tt.sign;

export class StatInterval extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s)?.result !== undefined;
  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f?.result === undefined || f.base === undefined) return;
    const b = f.base;

    return (
      <>
        {!f.staticValue && !f.staticCooldown && (
          <>
            <AttackSpeedTooltip parent={this} factors={b} />
            <DelayTooltip
              parent={this}
              factors={{
                ...b,
                result: b.delayResult,
              }}
            />
          </>
        )}

        {!f.staticCooldown && (
          <Tt.Equation>
            {(d) => (
              <>
                <Tt.Result>
                  {d ? "攻撃間隔" : f.actualResult + sign.FRAME}
                </Tt.Result>
                <Tt.Expression>
                  {!!f.staticValue ? (
                    <>{d ? "固有値" : f.staticValue + sign.FRAME}</>
                  ) : (
                    <>
                      {d ? "攻撃動作速度" : b.attackSpeedResult + sign.FRAME}
                      <Tt.Plus>
                        {d ? "攻撃待機時間" : b.delayResult + sign.FRAME}
                      </Tt.Plus>
                    </>
                  )}
                </Tt.Expression>
              </>
            )}
          </Tt.Equation>
        )}

        {!!f.cooldown && (
          <Tt.Equation>
            {(d) => (
              <>
                <Tt.Result>
                  {d ? "単発スキル発動間隔" : f.result + sign.FRAME}
                </Tt.Result>
                <Tt.Expression>
                  {f.staticCooldown ? (
                    <Tt.Negative>
                      {d ? "最低間隔" : f.minInterval + sign.FRAME}
                    </Tt.Negative>
                  ) : (
                    <>
                      {d ? "攻撃間隔" : f.actualResult + sign.FRAME}
                      <Tt.Plus>{d ? "再動" : f.cooldown + sign.SECOND}</Tt.Plus>
                      <Tt.Multiply>
                        {d
                          ? "フレームレート"
                          : Data.fps + sign.FRAME + "/" + sign.SECOND}
                      </Tt.Multiply>
                    </>
                  )}
                </Tt.Expression>
              </>
            )}
          </Tt.Equation>
        )}
      </>
    );
  }
}
