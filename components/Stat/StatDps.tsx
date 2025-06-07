import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatProps, StatStyles } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

type Factors = Data.DpsFactors | undefined;

const sign = T.sign;
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
    if (value === undefined || value === Infinity) {
      return super.getDefaultItem(setting);
    } else {
      return StatDps.getNumber({ value });
    }
  }

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const text = this.getText(setting);
    const defaultStyles = super.getDefaultStyles(setting);
    const colorStyle = this.getColorStyle(setting);
    const styles = StatDps.mergeStyles(defaultStyles, colorStyle);
    return this.getSmallFontStyles(text, styles, 5);
  }

  private getColorStyle(setting: Setting): StatStyles {
    const factors = this.getFactors(setting);
    if (factors === undefined) return;
    const { result: value, damageType } = factors;

    const getColor = () => {
      if (value === undefined) return;
      switch (damageType) {
        case Data.damageType.physical:
          if (value < 1000) return;
          if (value < 2000) return Data.tableColor.blue100;
          if (value < 3000) return Data.tableColor.blue;
          if (value < 5000) return Data.tableColor.blue300;
          if (value < 7000) return Data.tableColor.blue500;
          if (value < 10000) return Data.tableColor.blue700;
          else return Data.tableColor.blue900;

        case Data.damageType.magic:
          if (value < 1000) return;
          if (value < 2000) return Data.tableColor.green100;
          if (value < 3000) return Data.tableColor.green;
          if (value < 5000) return Data.tableColor.green300;
          if (value < 7000) return Data.tableColor.green500;
          if (value < 10000) return Data.tableColor.green700;
          else return Data.tableColor.green900;

        case Data.damageType.true:
          if (value < 1000) return;
          if (value < 2000) return Data.tableColor.red100;
          if (value < 3000) return Data.tableColor.red;
          if (value < 5000) return Data.tableColor.red300;
          if (value < 7000) return Data.tableColor.red500;
          if (value < 10000) return Data.tableColor.red700;
          else return Data.tableColor.red900;
      }

      if (Data.DamageType.isHeal(damageType)) {
        if (value < 300) return;
        if (value < 400) return Data.tableColor.yellow100;
        if (value < 600) return Data.tableColor.yellow300;
        if (value < 800) return Data.tableColor.yellow500;
        if (value < 1000) return Data.tableColor.yellow600;
        else return Data.tableColor.yellow800;
      }
    };
    return Data.TableColor.getSelector(getColor());
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
          <T.Multiply enabled={isCritical}>
            <T.Positive>
              {d ? "CRIダメージ倍率" : f.criticalDamage + sign.PERCENT}
            </T.Positive>
          </T.Multiply>
        </>
      );

      const getDamageDebuff = (d: boolean) => (
        <T.Multiply enabled={f.damageDebuff !== 100}>
          <T.Value isPositive={f.damageDebuff >= 100}>
            {d ? "被ダメージ増加" : f.damageDebuff + sign.PERCENT}
          </T.Value>
        </T.Multiply>
      );

      return (
        <>
          {!isTrueDamage && (
            <T.Equation>
              {(d) => (
                <>
                  <T.Result>{d ? damage : detail.damage}</T.Result>
                  <T.Expression>
                    <T.Brackets
                      enabled={f.damageDebuff !== 100 && !detail.isMinDamage}
                    >
                      {detail.isMinDamage && d && "下限" + damageOrHeal}
                      <T.Brackets enabled={detail.isMinDamage && d}>
                        {getAttackCriDamage(d)}
                        {detail.isMinDamage ? (
                          <T.Multiply>{10 + sign.PERCENT}</T.Multiply>
                        ) : (
                          <T.Minus>
                            {f.isMinDefres ? (
                              <T.Positive>
                                {d ? "下限防御力" : f.minDefres}
                              </T.Positive>
                            ) : (
                              <T.Brackets enabled={!!f.defresDebuff}>
                                {d ? "防御力" : f.baseDefres}
                                <T.Minus enabled={!!f.defresDebuff}>
                                  <T.Positive>
                                    {d ? "防御デバフ" : f.defresDebuff}
                                  </T.Positive>
                                </T.Minus>
                              </T.Brackets>
                            )}
                          </T.Minus>
                        )}
                      </T.Brackets>
                    </T.Brackets>
                    {getDamageDebuff(d)}
                  </T.Expression>
                </>
              )}
            </T.Equation>
          )}

          {(f.penetration > 0 || !f.defres) && (
            <T.Equation>
              {(d) => (
                <>
                  <T.Result>
                    {d
                      ? !isTrueDamage
                        ? "貫通" + damage
                        : damage
                      : detail.trueDamage}
                  </T.Result>
                  <T.Expression>
                    {getAttackCriDamage(d)}
                    {getDamageDebuff(d)}
                  </T.Expression>
                </>
              )}
            </T.Equation>
          )}

          {isAmountShowed && (
            <T.Equation>
              {(d) => (
                <>
                  <T.Result>
                    {d ? AMOUNT + damage : detail.damageAmount}
                  </T.Result>
                  <T.Expression>
                    {isTrueDamage || f.penetration <= 0 ? (
                      <>
                        {d
                          ? damage
                          : isTrueDamage
                          ? detail.trueDamage
                          : detail.damage}
                      </>
                    ) : (
                      <T.Brackets
                        enabled={
                          f.damageDebuff !== 100 || f.round > 1 || f.hits > 1
                        }
                      >
                        {d ? damage : detail.damage}
                        <T.Multiply>
                          {d
                            ? "非貫通率"
                            : Math.round(f.nonPenetration) + sign.PERCENT}
                        </T.Multiply>
                        <T.Plus>
                          <T.Positive>
                            {d ? "貫通" + damage : detail.trueDamage}
                          </T.Positive>
                          <T.Multiply>
                            <T.Positive>
                              {d
                                ? "貫通率"
                                : Math.round(f.penetration) + sign.PERCENT}
                            </T.Positive>
                          </T.Multiply>
                        </T.Plus>
                      </T.Brackets>
                    )}
                    <T.Multiply enabled={f.round > 1}>
                      <T.Positive>
                        {d ? "平均連射数" : f.round.toFixed(1)}
                      </T.Positive>
                    </T.Multiply>
                    <T.Multiply enabled={f.hits > 1}>
                      <T.Positive>
                        {d ? "命中数" : f.hits.toFixed(0) + "hits"}
                      </T.Positive>
                    </T.Multiply>
                  </T.Expression>
                </>
              )}
            </T.Equation>
          )}
        </>
      );
    };

    return (
      <>
        {isNormalShowed && damageFn()}
        {isCriticalShowed && damageFn(true)}

        <T.Equation>
          {(d) => (
            <>
              <T.Result>{d ? (isHeal ? "HPS" : "DPS") : f.result}</T.Result>
              <T.Expression>
                <T.Brackets enabled={isBothShowed}>
                  {isNormalShowed && (
                    <>
                      {d
                        ? isAmountShowed
                          ? AMOUNT + damageOrHeal
                          : damageOrHeal
                        : f.normal.damageAmount}
                      <T.Multiply enabled={isBothShowed}>
                        {d
                          ? "非CRI率"
                          : Math.round(f.nonCriticalChance) + sign.PERCENT}
                      </T.Multiply>
                    </>
                  )}
                  {isBothShowed && sign.PLUS}
                  {isCriticalShowed && (
                    <>
                      <T.Positive>
                        {d
                          ? (isAmountShowed ? AMOUNT : "") +
                            "CRI" +
                            damageOrHeal
                          : f.critical.damageAmount}
                      </T.Positive>
                      <T.Multiply enabled={isBothShowed}>
                        <T.Positive>
                          {d
                            ? "CRI率"
                            : Math.round(f.criticalChance) + sign.PERCENT}
                        </T.Positive>
                      </T.Multiply>
                    </>
                  )}
                </T.Brackets>
                <T.Multiply>
                  {d ? "攻撃間隔" : frequency + sign.PERCENT}
                </T.Multiply>
              </T.Expression>
            </>
          )}
        </T.Equation>
      </>
    );
  }
}
