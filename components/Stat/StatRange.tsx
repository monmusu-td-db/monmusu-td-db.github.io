import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { BaseStat } from "./BaseStat";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatStyles } from "./StatRoot";

type Factors = Required<Data.RangeFactor> | undefined;
const sign = T.sign;

export class StatRange extends BaseStat<number | undefined, Factors> {
  protected override getDefaultStyles(setting: Setting): StatStyles {
    const text = this.getText(setting);
    const style = super.getDefaultStyles(setting);
    return this.getSmallFontStyles(text, style, 3);
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f: Data.RangeFactor | undefined = this.getFactors(setting);
    if (f === undefined) return;

    return (
      <>
        {f.deploymentResult !== undefined && super.getTooltipBody(setting)}
        <T.Equation>
          {(d) => (
            <>
              <T.Result>{d ? "実能力値" : f.result}</T.Result>
              <T.Expression>
                {f.fixedRange !== undefined ? (
                  <T.Value isPositive={f.fixedRange > f.subtotal}>
                    {d ? "固定値" : f.fixedRange}
                  </T.Value>
                ) : (
                  <>
                    {d ? "配置前能力" : f.deploymentResult}
                    <T.Multiply enabled={f.multiply !== 100}>
                      <T.Value isPositive={f.multiply > 100}>
                        {d ? "乗算倍率" : f.multiply + sign.PERCENT}
                      </T.Value>
                    </T.Multiply>
                    <T.Plus enabled={f.addition !== 0}>
                      <T.Value isPositive={f.addition > 0}>
                        {d ? "加算値" : f.addition}
                      </T.Value>
                    </T.Plus>
                  </>
                )}
              </T.Expression>
            </>
          )}
        </T.Equation>
      </>
    );
  }
}
