import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import type { StatHandler, StatStyles } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

const sign = T.sign;
type Factors = Data.DelayFactors | undefined;

export class StatDelay extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const text = this.getText(setting);
    const style = super.getDefaultStyles(setting);
    return this.getSmallFontStyles(text, style, 2);
  }

  override getTooltipBody(setting: Setting): ReactNode {
    return <DelayTooltip factors={this.getFactors(setting)} />;
  }
}

export function DelayTooltip({ factors }: { factors: Factors }): ReactNode {
  const f = factors;
  if (f === undefined) {
    return;
  }
  let fdCol;
  if (f.fixedDelay !== undefined && f.delaySubtotal !== undefined) {
    fdCol = f.fixedDelay < f.delaySubtotal;
  } else {
    fdCol = true;
  }
  const dmCol = (f.delayMul ?? 100) < 100;
  const delayMul = f.delayMul ?? 100;
  const subskillBuff = f.subskillBuff ?? 100;
  const formationBuff = f.formationBuff ?? 100;
  const beastFormationBuff = f.beastFormationBuff ?? 100;

  return (
    <T.Equation>
      {(d) => (
        <>
          <T.Result>{d ? "攻撃待機時間" : f.result + sign.FRAME}</T.Result>
          <T.Expression>
            {f.fixedDelay ? (
              <T.Value isPositive={fdCol}>
                {d ? "固定値" : f.fixedDelay + sign.FRAME}
              </T.Value>
            ) : (
              <>
                {d ? "基礎値" : f.delay + sign.FRAME}
                <T.Multiply enabled={delayMul !== 100}>
                  <T.Value isPositive={dmCol}>
                    {d ? "攻撃待機時間倍率" : delayMul + sign.PERCENT}
                  </T.Value>
                </T.Multiply>
                <T.Multiply enabled={subskillBuff !== 100}>
                  <T.Info>
                    {d ? "サブスキル倍率" : subskillBuff + sign.PERCENT}
                  </T.Info>
                </T.Multiply>
                <T.Multiply enabled={formationBuff !== 100}>
                  <T.Value isPositive={formationBuff < 100}>
                    {d ? "編成バフ" : formationBuff + sign.PERCENT}
                  </T.Value>
                </T.Multiply>
                <T.Multiply enabled={beastFormationBuff !== 100}>
                  <T.Info>
                    {d ? "獣神編成バフ" : beastFormationBuff + sign.PERCENT}
                  </T.Info>
                </T.Multiply>
              </>
            )}
          </T.Expression>
        </>
      )}
    </T.Equation>
  );
}
