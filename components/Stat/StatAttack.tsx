import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";
import { Level, Positive, Result } from "../UI/Util";
import type { StatStyles } from "./StatRoot";

export type Factors = Data.ActualAttackFactors | undefined;

export class StatAttack extends SituationBaseStat<Factors> {
  private getNumberText(setting: Setting): string | undefined {
    const value = this.getValue(setting);
    if (value === undefined) return;

    const factors = this.getFactors(setting);
    const plus = factors?.isSupport;
    const text = StatAttack.getNumber({ value, plus });
    return text;
  }

  protected override getDefaultItem(setting: Setting): ReactNode {
    return this.getNumberText(setting);
  }
  protected override getDefaultStyles(setting: Setting): StatStyles {
    const base = super.getDefaultStyles(setting);
    const text = this.getNumberText(setting);
    const length = text?.length ?? 0;
    if (length <= StatAttack.NUMBER_LENGTH_LIMIT) {
      return base;
    } else {
      return StatAttack.mergeStyles(base, Data.TableClass.small);
    }
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    const damageFactor = f.damageFactor ?? 100;
    const damageFactorDesc = (
      <>
        {damageFactor !== 100 && (
          <>
            {this.multiply}
            <Level level={damageFactor > 100}>ダメージ倍率</Level>
          </>
        )}
      </>
    );
    const damageFactorValue = (
      <>
        {damageFactor !== 100 && (
          <>
            {this.multiply}
            <Level level={damageFactor > 100}>
              {damageFactor + this.percent}
            </Level>
          </>
        )}
      </>
    );

    return (
      <>
        {f.staticDamage === undefined ? (
          <>
            {super.getTooltipBody(setting)}
            {f.criticalChance < 100 && (
              <>
                <dt>
                  <Result>実攻撃力</Result>
                  {this.equal}
                  <small>
                    表示能力値
                    {damageFactorDesc}
                  </small>
                </dt>
                <dd>
                  <Result b>{f.actualResult}</Result>
                  {this.equal}
                  {f.inBattleResult}
                  {damageFactorValue}
                </dd>
              </>
            )}

            {f.criticalChance > 0 && (
              <>
                <dt>
                  <Result>
                    <small>
                      {this.bStart}CRI率{this.bEnd}{" "}
                    </small>
                    CRI攻撃力
                  </Result>
                  {this.equal}
                  <small>
                    表示能力値
                    {this.multiply}
                    <Positive>CRIダメージ倍率</Positive>
                    {damageFactorDesc}
                  </small>
                </dt>
                <dd>
                  <Result b>
                    {this.bStart}
                    {f.criticalChance}
                    {this.percent}
                    {this.bEnd}
                    <> </>
                    {f.criticalAttack}
                  </Result>
                  {this.equal}
                  {f.inBattleResult}
                  {this.multiply}
                  <Positive>{f.criticalDamage + this.percent}</Positive>
                  {damageFactorValue}
                </dd>
              </>
            )}
          </>
        ) : (
          <>{this.getStaticDamageTooltip(setting, f)}</>
        )}
      </>
    );
  }
}
