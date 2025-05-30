import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatStyles } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

const sign = T.sign;

type Factors = Data.AttackSpeedFactors | undefined;
export class StatAttackSpeed extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const style = super.getDefaultStyles(setting);
    return this.getSmallFontStyles(setting, style, 99);
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    return <AttackSpeedTooltip factors={f} />;
  }
}

export function AttackSpeedTooltip({
  factors,
}: {
  factors: Data.AttackSpeedFactors & Partial<Data.AttackSpeedInBattleFactors>;
}) {
  const f = factors;
  const attackSpeedBuff = f.attackSpeedBuff ?? 100;
  const p = f.attackSpeedPotential > 0;
  const b = p && (!!f.attackMotionMul || attackSpeedBuff !== 100);
  const ammCol = (f.attackMotionMul ?? 100) < 100;
  const asbCol = attackSpeedBuff > 100;
  const indicatorBuff = f.attackSpeedIndicatorBuff ?? 0;
  return (
    <T.Equation>
      {(d) => (
        <>
          <T.Result>
            {d ? "攻撃動作速度" : f.attackSpeedResult + sign.FRAME}
          </T.Result>
          <T.Expression>
            <T.Brackets enabled={b}>
              {d ? "基礎値" : f.attackSpeedBase + sign.FRAME}
              <T.Minus enabled={p}>
                <T.Positive>
                  {d ? "潜在覚醒" : f.attackSpeedPotential + sign.FRAME}
                </T.Positive>
              </T.Minus>
              <T.Minus enabled={f.attackSpeedWeapon > 0}>
                <T.Positive>
                  {d ? "専用武器" : f.attackSpeedWeapon + sign.FRAME}
                </T.Positive>
              </T.Minus>
              <T.Minus enabled={indicatorBuff > 0}>
                <T.Positive>
                  {d ? "基礎攻撃速度バフ" : indicatorBuff + sign.FRAME}
                </T.Positive>
              </T.Minus>
            </T.Brackets>
            <T.Multiply enabled={!!f.attackMotionMul}>
              <T.Value isPositive={ammCol}>
                {d ? "攻撃モーション倍率" : f.attackMotionMul + sign.PERCENT}
              </T.Value>
            </T.Multiply>
            <T.Divide enabled={attackSpeedBuff !== 100}>
              <T.Value isPositive={asbCol}>
                {d ? "攻撃速度倍率" : attackSpeedBuff + sign.PERCENT}
              </T.Value>
            </T.Divide>
          </T.Expression>
        </>
      )}
    </T.Equation>
  );
}
