import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { BaseStat } from "./BaseStat";
import { Tooltip as T } from "../UI/Tooltip";

type Factors = Required<Data.RangeFactor> | undefined;
const sign = T.sign;

export class StatRange extends BaseStat<number | undefined, Factors> {
  protected override getDefaultItem(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    if (value === undefined) return;

    const Item = super.NumberItem;
    return <Item value={value} length={3} />;
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
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
