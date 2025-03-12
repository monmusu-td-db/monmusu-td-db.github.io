import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler } from "./StatRoot";
import { Level, Positive, Result } from "../Util";

type Factors = Data.AttackSpeedFactors | undefined;
export class StatAttackSpeed extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;
  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    return <AttackSpeedTooltip parent={this} factors={f} />;
  }
}

export function AttackSpeedTooltip({
  parent,
  factors,
}: {
  parent: StatTooltip<unknown, unknown>;
  factors: Data.AttackSpeedFactors & Partial<Data.AttackSpeedInBattleFactors>;
}) {
  const f = factors;
  const attackSpeedBuff = f.attackSpeedBuff ?? 100;
  const p = f.attackSpeedPotential > 0;
  const b = p && (!!f.attackMotionMul || attackSpeedBuff !== 100);
  const ammCol = (f.attackMotionMul ?? 100) < 100;
  const asbCol = attackSpeedBuff > 100;
  return (
    <>
      <dt>
        <Result>攻撃動作速度</Result>
        {parent.equal}
        <small>
          {f.fixedAttackSpeed !== undefined ? (
            <>基礎値</>
          ) : (
            <>
              {b && parent.bStart}
              基礎値
              {p && (
                <>
                  {parent.minus}
                  <Positive>潜在覚醒</Positive>
                </>
              )}
              {b && parent.bEnd}
            </>
          )}
          {!!f.attackMotionMul && (
            <>
              {parent.multiply}
              <Level level={ammCol}>攻撃モーション倍率</Level>
            </>
          )}
          {attackSpeedBuff !== 100 && (
            <>
              {parent.divide}
              <Level level={asbCol}>攻撃速度倍率</Level>
            </>
          )}
        </small>
      </dt>
      <dd>
        <Result b>
          {f.attackSpeedResult}
          {parent.frame}
        </Result>
        {parent.equal}
        {f.fixedAttackSpeed !== undefined ? (
          <>
            {f.fixedAttackSpeed}
            {parent.frame}
          </>
        ) : (
          <>
            {b && parent.bStart}
            {f.attackSpeedBase}
            {parent.frame}
            {p && (
              <>
                {parent.minus}
                <Positive>
                  {f.attackSpeedPotential}
                  {parent.frame}
                </Positive>
              </>
            )}
            {b && parent.bEnd}
          </>
        )}
        {!!f.attackMotionMul && (
          <>
            {parent.multiply}
            <Level level={ammCol}>{f.attackMotionMul + parent.percent}</Level>
          </>
        )}
        {attackSpeedBuff !== 100 && (
          <>
            {parent.divide}
            <Level level={asbCol}>{attackSpeedBuff + parent.percent}</Level>
          </>
        )}
      </dd>
    </>
  );
}
