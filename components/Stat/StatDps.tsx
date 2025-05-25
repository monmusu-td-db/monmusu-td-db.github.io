import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatProps } from "./StatRoot";
import { Tooltip as Tt } from "../UI/Tooltip";

type Factors = Data.DpsFactors | undefined;

const sign = Tt.sign;
const AMOUNT = "合計";

export class StatDps<
  T extends number | undefined = number | undefined
> extends StatTooltip<T, Factors> {
  override readonly isEnabled: StatHandler<boolean>;

  constructor(props: StatProps<T, Factors>) {
    super(props);
    this.isEnabled = (s) => this.getFactors(s) !== undefined;
  }

  protected override getDefaultItem(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    if (value === undefined) return;

    const Item = super.NumberItem;
    const ret = <Item value={value} />;
    return ret;
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    const frequency = Math.round(f.frequency * 100);
    const isTrueDamage = !(f.penetration < 100 && !!f.defres);
    const isHeal = Data.DamageType.isHeal(f.damageType);
    const damageOrHeal = isHeal ? "回復量" : "ダメージ";
    const isAmountShowed =
      (f.penetration > 0 && !isTrueDamage) || f.round > 1 || f.hits > 1;
    const isNormalShowed = f.criticalChance < 100;
    const isCriticalShowed = f.criticalChance > 0;
    const isBothShowed = isNormalShowed && isCriticalShowed;

    const damageFn = (isCritical: boolean = false) => {
      const damage = isCritical ? "CRI" + damageOrHeal : damageOrHeal;
      const detail = isCritical ? f.critical : f.normal;

      const getAttackCriDamage = (d: boolean) => (
        <>
          {d ? "攻撃力" : f.attack}
          <Tt.Multiply enabled={isCritical}>
            <Tt.Positive>
              {d ? "CRIダメージ倍率" : f.criticalDamage + sign.PERCENT}
            </Tt.Positive>
          </Tt.Multiply>
        </>
      );

      const getDamageDebuff = (d: boolean) => (
        <Tt.Multiply enabled={f.damageDebuff !== 100}>
          <Tt.Value isPositive={f.damageDebuff >= 100}>
            {d ? "被ダメージ増加" : f.damageDebuff + sign.PERCENT}
          </Tt.Value>
        </Tt.Multiply>
      );

      return (
        <>
          {!isTrueDamage && (
            <Tt.Equation>
              {(d) => (
                <>
                  <Tt.Result>{d ? damage : detail.damage}</Tt.Result>
                  <Tt.Expression>
                    <Tt.Brackets
                      enabled={f.damageDebuff !== 100 && !detail.isMinDamage}
                    >
                      {detail.isMinDamage && d && "下限" + damageOrHeal}
                      <Tt.Brackets enabled={detail.isMinDamage && d}>
                        {getAttackCriDamage(d)}
                        {detail.isMinDamage ? (
                          <Tt.Multiply>{10 + sign.PERCENT}</Tt.Multiply>
                        ) : (
                          <Tt.Minus>
                            {f.isMinDefres ? (
                              <Tt.Positive>
                                {d ? "下限防御力" : f.minDefres}
                              </Tt.Positive>
                            ) : (
                              <Tt.Brackets enabled={!!f.defresDebuff}>
                                {d ? "防御力" : f.baseDefres}
                                <Tt.Minus enabled={!!f.defresDebuff}>
                                  <Tt.Positive>
                                    {d ? "防御デバフ" : f.defresDebuff}
                                  </Tt.Positive>
                                </Tt.Minus>
                              </Tt.Brackets>
                            )}
                          </Tt.Minus>
                        )}
                      </Tt.Brackets>
                    </Tt.Brackets>
                    {getDamageDebuff(d)}
                  </Tt.Expression>
                </>
              )}
            </Tt.Equation>
          )}

          {(f.penetration > 0 || !f.defres) && (
            <Tt.Equation>
              {(d) => (
                <>
                  <Tt.Result>
                    {d
                      ? !isTrueDamage
                        ? "貫通" + damage
                        : damage
                      : detail.trueDamage}
                  </Tt.Result>
                  <Tt.Expression>
                    {getAttackCriDamage(d)}
                    {getDamageDebuff(d)}
                  </Tt.Expression>
                </>
              )}
            </Tt.Equation>
          )}

          {isAmountShowed && (
            <Tt.Equation>
              {(d) => (
                <>
                  <Tt.Result>
                    {d ? AMOUNT + damage : detail.damageAmount}
                  </Tt.Result>
                  <Tt.Expression>
                    {isTrueDamage || f.penetration <= 0 ? (
                      <>
                        {d
                          ? damage
                          : isTrueDamage
                          ? detail.trueDamage
                          : detail.damage}
                      </>
                    ) : (
                      <Tt.Brackets
                        enabled={
                          f.damageDebuff !== 100 || f.round > 1 || f.hits > 1
                        }
                      >
                        {d ? damage : detail.damage}
                        <Tt.Multiply>
                          {d
                            ? "非貫通率"
                            : Math.round(f.nonPenetration) + sign.PERCENT}
                        </Tt.Multiply>
                        <Tt.Plus>
                          <Tt.Positive>
                            {d ? "貫通" + damage : detail.trueDamage}
                          </Tt.Positive>
                          <Tt.Multiply>
                            <Tt.Positive>
                              {d
                                ? "貫通率"
                                : Math.round(f.penetration) + sign.PERCENT}
                            </Tt.Positive>
                          </Tt.Multiply>
                        </Tt.Plus>
                      </Tt.Brackets>
                    )}
                    <Tt.Multiply enabled={f.round > 1}>
                      <Tt.Positive>
                        {d ? "平均連射数" : f.round.toFixed(1)}
                      </Tt.Positive>
                    </Tt.Multiply>
                    <Tt.Multiply enabled={f.hits > 1}>
                      <Tt.Positive>
                        {d ? "命中数" : f.hits.toFixed(0) + "hits"}
                      </Tt.Positive>
                    </Tt.Multiply>
                  </Tt.Expression>
                </>
              )}
            </Tt.Equation>
          )}
        </>
      );
    };

    return (
      <>
        {isNormalShowed && damageFn()}
        {isCriticalShowed && damageFn(true)}

        <Tt.Equation>
          {(d) => (
            <>
              <Tt.Result>{d ? (isHeal ? "HPS" : "DPS") : f.result}</Tt.Result>
              <Tt.Expression>
                <Tt.Brackets enabled={isBothShowed}>
                  {isNormalShowed && (
                    <>
                      {d
                        ? isAmountShowed
                          ? AMOUNT + damageOrHeal
                          : damageOrHeal
                        : f.normal.damageAmount}
                      <Tt.Multiply enabled={isBothShowed}>
                        {d
                          ? "非CRI率"
                          : Math.round(f.nonCriticalChance) + sign.PERCENT}
                      </Tt.Multiply>
                    </>
                  )}
                  {isBothShowed && sign.PLUS}
                  {isCriticalShowed && (
                    <>
                      <Tt.Positive>
                        {d
                          ? (isAmountShowed ? AMOUNT : "") +
                            "CRI" +
                            damageOrHeal
                          : f.critical.damageAmount}
                      </Tt.Positive>
                      <Tt.Multiply enabled={isBothShowed}>
                        <Tt.Positive>
                          {d
                            ? "CRI率"
                            : Math.round(f.criticalChance) + sign.PERCENT}
                        </Tt.Positive>
                      </Tt.Multiply>
                    </>
                  )}
                </Tt.Brackets>
                <Tt.Multiply>
                  {d ? "攻撃速度" : frequency + sign.PERCENT}
                </Tt.Multiply>
              </Tt.Expression>
            </>
          )}
        </Tt.Equation>
      </>
    );
  }
}
