import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatProps } from "./StatRoot";
import { Positive, Result } from "../Util";

type Factors = Data.DpsFactors | undefined

export class StatDps<T extends number | undefined = number | undefined> extends StatTooltip<T, Factors> {
  override readonly isEnabled: StatHandler<boolean>;

  constructor(props: StatProps<T, Factors>) {
    super(props);
    this.isEnabled = s => this.getFactors(s) !== undefined;
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    const frequency = Math.round(f.frequency * 100);
    const isTrueDamage = !(f.penetration < 100 && !!f.defres);
    const isHeal = Data.DamageType.isHeal(f.damageType);
    const damageOrHeal = isHeal ? "回復量" : "ダメージ";
    const isAmountShowed = f.penetration > 0 && !isTrueDamage || f.round > 1 || f.hits > 1;
    const isNormalShowed = f.criticalChance < 100;
    const isCriticalShowed = f.criticalChance > 0;
    const isBothShowed = isNormalShowed && isCriticalShowed;

    const damageFn = ((isCritical: boolean = false) => {
      const damage = <>{isCritical && "CRI"}{damageOrHeal}</>;
      const d = isCritical ? f.critical : f.normal;

      const attackCriDamageDt = <>
        攻撃力
        {isCritical && <>{this.multiply}<Positive>CRIダメージ倍率</Positive></>}
      </>;
      const attackCriDamageDd = <>
        {f.attack}
        {isCritical && <>
          {this.multiply}<Positive>{f.criticalDamage}{this.percent}</Positive>
        </>}
      </>;

      return (
        <>
          {!isTrueDamage &&
            <>
              <dt>
                <Result>{damage}</Result>{this.equal}
                <small>
                  {d.isMinDamage && <>下限{damageOrHeal}{this.bStart}</>}
                  {attackCriDamageDt}
                  {d.isMinDamage
                    ? <>
                      {this.multiply}10{this.percent}{this.bEnd}
                    </>
                    : <>
                      {this.minus}
                      {f.isMinDefres ?
                        <Positive>下限防御力</Positive>
                        : <>
                          {!!f.defresDebuff && this.bStart}
                          防御力
                          {!!f.defresDebuff && <>
                            {this.minus}
                            <Positive>防御デバフ</Positive>
                            {this.bEnd}
                          </>}
                        </>}
                    </>}
                </small>
              </dt>
              <dd>
                <Result b>{d.damage}</Result>{this.equal}
                {attackCriDamageDd}
                {d.isMinDamage
                  ? <>
                    {this.multiply}10{this.percent}
                  </>
                  : <>
                    {this.minus}
                    {f.isMinDefres ?
                      <Positive>{f.minDefres}</Positive>
                      : <>
                        {!!f.defresDebuff && this.bStart}
                        {f.baseDefres}
                        {!!f.defresDebuff && <>
                          {this.minus}
                          <Positive>{f.defresDebuff}</Positive>
                          {this.bEnd}
                        </>}
                      </>}
                  </>}
              </dd>
            </>
          }

          {(f.penetration > 0 || !f.defres) &&
            <>
              <dt>
                <Result>{!isTrueDamage && "貫通"}{damage}</Result>{this.equal}
                <small>
                  {attackCriDamageDt}
                </small>
              </dt>
              <dd>
                <Result b>{d.attack}</Result>{this.equal}
                {attackCriDamageDd}
              </dd>
            </>
          }

          {isAmountShowed &&
            <>
              <dt>
                <Result>平均{damage}</Result>{this.equal}
                <small>
                  {(() => {
                    if (isTrueDamage || f.penetration <= 0)
                      return damage;
                    const a = <>{damage}{this.multiply}非貫通率</>;
                    const b = <>
                      <Positive>貫通{damage}</Positive>
                      {this.multiply}
                      <Positive>貫通率</Positive>
                    </>;
                    const c = <>{a}{this.plus}{b}</>;
                    if (f.round > 1 || f.hits > 1)
                      return <>{this.bStart}{c}{this.bEnd}</>;
                    return c;
                  })()}
                  {f.round > 1 && <>{this.multiply}<Positive>平均連射数</Positive></>}
                  {f.hits > 1 && <>{this.multiply}<Positive>命中数</Positive></>}
                </small>
              </dt>
              <dd>
                <Result b>{d.damageAmount}</Result>{this.equal}
                {(() => {
                  if (isTrueDamage)
                    return d.attack;
                  if (f.penetration <= 0)
                    return d.damage;
                  const a = <>
                    {d.damage + this.multiply}
                    {Math.round(f.nonPenetration) + this.percent}
                  </>;
                  const b = <>
                    <Positive>{d.attack}</Positive>
                    {this.multiply}
                    <Positive>{Math.round(f.penetration) + this.percent}</Positive>
                  </>;
                  const c = <>{a}{this.plus}{b}</>;
                  if (f.round > 1 || f.hits > 1)
                    return <>{this.bStart}{c}{this.bEnd}</>;
                  return c;
                })()}
                {f.round > 1 && <>{this.multiply}<Positive>{f.round.toFixed(1)}</Positive></>}
                {f.hits > 1 && <>{this.multiply}<Positive>{f.hits.toFixed(0)}hits</Positive></>}
              </dd>
            </>
          }
        </>
      );
    });

    return (
      <>
        {isNormalShowed && damageFn()}
        {isCriticalShowed && damageFn(true)}
        <dt>
          <Result>{(isHeal ? "HPS" : "DPS")}</Result>{this.equal}
          <small>
            {isNormalShowed &&
              <>
                {isBothShowed && this.bStart}
                {isAmountShowed && "平均"}{damageOrHeal}
                {isBothShowed && <>{this.multiply}非CRI率</>}
              </>
            }
            {isCriticalShowed &&
              <>
                {isBothShowed && this.plus}
                <Positive>{isAmountShowed && "平均"}CRI{damageOrHeal}</Positive>
                {isBothShowed && <>{this.multiply}<Positive>CRI率</Positive>{this.bEnd}</>}
              </>
            }
            {this.multiply}攻撃速度
          </small>
        </dt>
        <dd>
          <Result b>{f.result}</Result>{this.equal}
          {isNormalShowed &&
            <>
              {isBothShowed && this.bStart}
              {f.normal.damageAmount}
              {isBothShowed &&
                <>
                  {this.multiply}{Math.round(f.nonCriticalChance)}{this.percent}
                </>
              }
            </>
          }
          {isCriticalShowed &&
            <>
              {isBothShowed && this.plus}
              <Positive>{f.critical.damageAmount}</Positive>
              {isBothShowed &&
                <>
                  {this.multiply}
                  <Positive>{Math.round(f.criticalChance)}{this.percent}</Positive>
                  {this.bEnd}
                </>
              }
            </>
          }
          {this.multiply}{frequency}{this.percent}
        </dd>
      </>
    );
  }
}
