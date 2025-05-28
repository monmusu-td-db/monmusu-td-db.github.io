import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import type { StatHandler, StatStyles } from "./StatRoot";
import { Level, Neutral, Result } from "../UI/Util";

type Factors = Data.DelayFactors | undefined;

export class StatDelay extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const origin = super.getDefaultStyles(setting);
    const value = this.getValue(setting);
    if (value === undefined || value < 100) {
      return origin;
    } else {
      return StatDelay.mergeStyles(origin, Data.TableClass.small);
    }
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    return <DelayTooltip parent={this} factors={this.getFactors(setting)} />;
  }
}

export function DelayTooltip({
  parent,
  factors,
}: {
  parent: StatTooltip<unknown, unknown>;
  factors: Factors;
}): ReactNode {
  const f = factors;
  if (f === undefined) return;
  let fdCol;
  if (f.fixedDelay !== undefined && f.delaySubtotal !== undefined)
    fdCol = f.fixedDelay < f.delaySubtotal;
  else fdCol = true;
  const dmCol = (f.delayMul ?? 100) < 100;
  const delayMul = f.delayMul ?? 100;
  const subskillBuff = f.subskillBuff ?? 100;
  const formationBuff = f.formationBuff ?? 100;
  const beastFormationBuff = f.beastFormationBuff ?? 100;

  return (
    <>
      <dt>
        <Result>攻撃待機時間</Result>
        {parent.equal}
        <small>
          {f.fixedDelay ? (
            <>
              <Level level={fdCol}>固定値</Level>
            </>
          ) : (
            <>
              基礎値
              {delayMul !== 100 && (
                <>
                  {parent.multiply}
                  <Level level={dmCol}>攻撃待機時間倍率</Level>
                </>
              )}
              {subskillBuff !== 100 && (
                <>
                  {parent.multiply}
                  <Neutral>サブスキル倍率</Neutral>
                </>
              )}
              {formationBuff !== 100 && (
                <>
                  {parent.multiply}
                  <Level level={formationBuff < 100}>編成バフ</Level>
                </>
              )}
              {beastFormationBuff !== 100 && (
                <>
                  {parent.multiply}
                  <Neutral>獣神編成バフ</Neutral>
                </>
              )}
            </>
          )}
        </small>
      </dt>
      <dd>
        <Result b>
          {f.result}
          {parent.frame}
        </Result>
        {parent.equal}
        {f.fixedDelay ? (
          <>
            <Level level={fdCol}>
              {f.fixedDelay}
              {parent.frame}
            </Level>
          </>
        ) : (
          <>
            {f.delay}
            {parent.frame}
            {delayMul !== 100 && (
              <>
                {parent.multiply}
                <Level level={dmCol}>{delayMul + parent.percent}</Level>
              </>
            )}
            {subskillBuff !== 100 && (
              <>
                {parent.multiply}
                <Neutral>{subskillBuff + parent.percent}</Neutral>
              </>
            )}
            {formationBuff !== 100 && (
              <>
                {parent.multiply}
                <Level level={formationBuff < 100}>
                  {formationBuff + parent.percent}
                </Level>
              </>
            )}
            {beastFormationBuff !== 100 && (
              <>
                {parent.multiply}
                <Neutral>{beastFormationBuff + parent.percent}</Neutral>
              </>
            )}
          </>
        )}
      </dd>
    </>
  );
}
