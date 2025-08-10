import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatStyles } from "./StatRoot";

const sign = T.sign;
export type Factors = Data.ActualAttackFactors | undefined;

export class StatAttack extends SituationBaseStat<Factors> {
  protected override getNumberText(setting: Setting): string | undefined {
    const value = this.getValue(setting);
    if (value === undefined) {
      return;
    }

    const factors = this.getFactors(setting);
    const plus = factors?.isSupport;
    return StatAttack.getNumber({ value, plus });
  }

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const defaultStyle = super.getDefaultStyles(setting);
    const criticalStyle = this.getCriticalStyle(setting);
    return StatAttack.mergeStyles(defaultStyle, criticalStyle);
  }

  private getCriticalStyle(setting: Setting): StatStyles {
    const factor = this.getFactors(setting);
    const cond =
      factor?.staticDamage === undefined &&
      (factor?.criticalChance ?? 0) >= 100;
    return cond ? Data.TableClass.critical : undefined;
  }

  override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) {
      return;
    }
    const damageFactor = f.damageFactor ?? 100;
    const getDamageFactor = (d: boolean) => (
      <T.Multiply enabled={damageFactor !== 100}>
        <T.Value isPositive={damageFactor > 100}>
          {d ? "ダメージ倍率" : damageFactor + sign.PERCENT}
        </T.Value>
      </T.Multiply>
    );

    return (
      <>
        {f.staticDamage === undefined ? (
          <>
            {super.getTooltipBody(setting)}
            {f.criticalChance < 100 && (
              <T.Equation>
                {(d) => (
                  <>
                    <T.Result>{d ? "実攻撃力" : f.actualResult}</T.Result>
                    <T.Expression>
                      {d ? "戦闘中能力" : f.inBattleResult}
                      {getDamageFactor(d)}
                    </T.Expression>
                  </>
                )}
              </T.Equation>
            )}
            {f.criticalChance > 0 && (
              <T.Equation>
                {(d) => {
                  const criChance = (
                    <>
                      {sign.BSTART}
                      {d ? "CRI率" : f.criticalChance + sign.PERCENT}
                      {sign.BEND}
                    </>
                  );
                  return (
                    <>
                      <T.Result>
                        {d ? <small>{criChance}</small> : criChance}{" "}
                        {d ? "CRI攻撃力" : f.criticalAttack}
                      </T.Result>
                      <T.Expression>
                        {d ? "戦闘中能力" : f.inBattleResult}
                        <T.Multiply>
                          <T.Positive>
                            {d
                              ? "CRIダメージ倍率"
                              : f.criticalDamage + sign.PERCENT}
                          </T.Positive>
                        </T.Multiply>
                        {getDamageFactor(d)}
                      </T.Expression>
                    </>
                  );
                }}
              </T.Equation>
            )}
          </>
        ) : (
          <>{this.getStaticDamageTooltip(setting, f)}</>
        )}
      </>
    );
  }
}
