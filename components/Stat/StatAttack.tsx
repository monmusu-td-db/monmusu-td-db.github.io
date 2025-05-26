import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { SituationBaseStat } from "./SituationBaseStat";
import { Level, Positive, Result } from "../UI/Util";

export type Factors = Data.ActualAttackFactors | undefined;

export class StatAttack extends SituationBaseStat<Factors> {
  protected override getDefaultItem(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    if (value === undefined) return;

    const Item = super.NumberItem;
    const factors = this.getFactors(setting);
    const ret = <Item value={value} />;

    if (factors?.isSupport && value >= 0) {
      return <Item value={value} plus />;
    }

    if ((factors?.criticalChance ?? 0) >= 100) {
      return <b>{ret}</b>;
    }

    return ret;
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
