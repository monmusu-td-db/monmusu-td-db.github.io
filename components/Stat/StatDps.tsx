import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatProps, StatStyles } from "./StatRoot";
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
    if (factors === undefined) {
      return;
    }
    const { result: value, damageType } = factors;

    const getColor = () => {
      if (value === undefined) {
        return;
      }
      switch (damageType) {
        case Data.damageType.physic:
          if (value < 1000) {
            return;
          }
          if (value < 2000) {
            return Data.tableColor.blue100;
          }
          if (value < 3000) {
            return Data.tableColor.blue;
          }
          if (value < 5000) {
            return Data.tableColor.blue300;
          }
          if (value < 7000) {
            return Data.tableColor.blue500;
          }
          if (value < 10000) {
            return Data.tableColor.blue700;
          } else {
            return Data.tableColor.blue900;
          }

        case Data.damageType.magic:
          if (value < 1000) {
            return;
          }
          if (value < 2000) {
            return Data.tableColor.green100;
          }
          if (value < 3000) {
            return Data.tableColor.green;
          }
          if (value < 5000) {
            return Data.tableColor.green300;
          }
          if (value < 7000) {
            return Data.tableColor.green500;
          }
          if (value < 10000) {
            return Data.tableColor.green700;
          } else {
            return Data.tableColor.green900;
          }

        case Data.damageType.true:
          if (value < 1000) {
            return;
          }
          if (value < 2000) {
            return Data.tableColor.red100;
          }
          if (value < 3000) {
            return Data.tableColor.red;
          }
          if (value < 5000) {
            return Data.tableColor.red300;
          }
          if (value < 7000) {
            return Data.tableColor.red500;
          }
          if (value < 10000) {
            return Data.tableColor.red700;
          } else {
            return Data.tableColor.red900;
          }
      }

      if (Data.DamageType.isHeal(damageType)) {
        if (value < 300) {
          return;
        }
        if (value < 400) {
          return Data.tableColor.yellow100;
        }
        if (value < 600) {
          return Data.tableColor.yellow300;
        }
        if (value < 800) {
          return Data.tableColor.yellow500;
        }
        if (value < 1000) {
          return Data.tableColor.yellow600;
        } else {
          return Data.tableColor.yellow800;
        }
      }
    };
    return Data.TableColor.getSelector(getColor());
  }

  override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (!f) {
      return;
    }

    const isHeal = Data.DamageType.isHeal(f.damageType);
    const damageOrHeal = isHeal ? "回復量" : "ダメージ";

    const typeDamageCutResult = Data.Percent.multiply(
      f.damageCut,
      f.typeDamageCut
    );

    const test_damageDebuff: number = f.damageDebuff;
    const test_typeDamageDebuff: number = 100;
    const typeDamageDebuffResult = Data.Percent.multiply(
      test_damageDebuff,
      test_typeDamageDebuff
    );

    const isDefresValid = f.defres > 0;
    const isTypeDamageValid = f.penetration < 100;
    const isTrueDamageValid =
      f.penetration > 0 && (isDefresValid || f.typeDamageCut > 0);
    const isAmountEnabled =
      (isTypeDamageValid && isTrueDamageValid) || f.round > 1 || f.hits > 1;

    const isNormalShowed = f.criticalChance < 100;
    const isCriticalShowed = f.criticalChance > 0;
    const isBothShowed = isNormalShowed && isCriticalShowed;
    const frequency = Math.round(f.frequency * 100);

    const getDamage = (isCritical: boolean) => {
      const damage = isCritical ? "CRI" + damageOrHeal : damageOrHeal;
      const trueDamage = "貫通" + damage;
      const detail = isCritical ? f.critical : f.normal;

      const getAttackCriDamage = (d: boolean) => {
        return (
          <>
            {d ? "攻撃力" : f.attack}
            <Tt.Multiply enabled={isCritical}>
              <Tt.Positive>
                {d ? "CRIダメージ倍率" : f.criticalDamage + sign.PERCENT}
              </Tt.Positive>
            </Tt.Multiply>
          </>
        );
      };

      const getDamageCut = (d: boolean, value: number) => (
        <Tt.Multiply enabled={value !== 100}>
          <Tt.Info>{d ? "ダメージ軽減率" : value + sign.PERCENT}</Tt.Info>
        </Tt.Multiply>
      );

      const getDamageDebuff = (d: boolean, value: number) => (
        <Tt.Multiply enabled={value !== 100}>
          <Tt.Value isPositive={value >= 100}>
            {d ? "被ダメージ増加率" : value + sign.PERCENT}
          </Tt.Value>
        </Tt.Multiply>
      );

      return (
        <>
          {isTypeDamageValid && (
            <Tt.Equation>
              {(d) => (
                <>
                  <Tt.Result>{d ? damage : detail.damage}</Tt.Result>
                  <Tt.Expression>
                    <Tt.Brackets
                      enabled={
                        (typeDamageCutResult !== 100 ||
                          typeDamageDebuffResult !== 100) &&
                        !detail.isMinDamage &&
                        isDefresValid
                      }
                    >
                      {detail.isMinDamage ? (
                        <>
                          {d && "下限" + damageOrHeal}
                          <Tt.Brackets enabled={d}>
                            {getAttackCriDamage(d)}
                            <Tt.Multiply>{10 + sign.PERCENT}</Tt.Multiply>
                          </Tt.Brackets>
                        </>
                      ) : (
                        <>
                          {getAttackCriDamage(d)}
                          <Tt.Minus enabled={isDefresValid}>
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
                        </>
                      )}
                    </Tt.Brackets>
                    {getDamageCut(d, typeDamageCutResult)}
                    {getDamageDebuff(d, typeDamageDebuffResult)}
                  </Tt.Expression>
                </>
              )}
            </Tt.Equation>
          )}
          {isTrueDamageValid && (
            <Tt.Equation>
              {(d) => (
                <>
                  <Tt.Result>{d ? trueDamage : detail.trueDamage}</Tt.Result>
                  <Tt.Expression>
                    {getAttackCriDamage(d)}
                    {getDamageCut(d, f.damageCut)}
                    {getDamageDebuff(d, test_damageDebuff)}
                  </Tt.Expression>
                </>
              )}
            </Tt.Equation>
          )}
          {isAmountEnabled && (
            <Tt.Equation>
              {(d) => (
                <>
                  <Tt.Result>
                    {d ? AMOUNT + damage : detail.damageAmount}
                  </Tt.Result>
                  <Tt.Expression>
                    {!isTypeDamageValid || !isTrueDamageValid ? (
                      <>
                        {isTypeDamageValid
                          ? d
                            ? damage
                            : detail.damage
                          : d
                          ? trueDamage
                          : detail.trueDamage}
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
                            {d ? trueDamage : detail.trueDamage}
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
        {isNormalShowed && getDamage(false)}
        {isCriticalShowed && getDamage(true)}
        <Tt.Equation>
          {(d) => (
            <>
              <Tt.Result>{d ? (isHeal ? "HPS" : "DPS") : f.result}</Tt.Result>
              <Tt.Expression>
                <Tt.Brackets enabled={isBothShowed}>
                  {isNormalShowed && (
                    <>
                      {d
                        ? isAmountEnabled
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
                          ? (isAmountEnabled ? AMOUNT : "") +
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
                  {d ? "攻撃間隔" : frequency + sign.PERCENT}
                </Tt.Multiply>
              </Tt.Expression>
            </>
          )}
        </Tt.Equation>
      </>
    );
  }
}
