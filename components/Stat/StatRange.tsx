import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { BaseStat } from "./BaseStat";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatStyles } from "./StatRoot";

type Factors = Required<Data.RangeFactor> | undefined;
const sign = T.sign;

export class StatRange extends BaseStat<number | undefined, Factors> {
  override isNotDescList: boolean = true;

  protected override getDefaultText(setting: Setting): string | undefined {
    const value = this.getValue(setting);
    if (value === Infinity) {
      return "全体";
    } else {
      return super.getDefaultText(setting);
    }
  }

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const value = this.getValue(setting);
    const text = this.getText(setting);
    const style = super.getDefaultStyles(setting);
    if (value === Infinity) {
      return StatRange.mergeStyles(style, Data.TableClass.small);
    } else {
      return this.getSmallFontStyles(text, style, 3);
    }
  }

  override getTooltipBody(setting: Setting): ReactNode {
    const f: Data.RangeFactor | undefined = this.getFactors(setting);
    const value = this.getValue(setting);

    if (value === Infinity) {
      return (
        <T.List>
          <T.ListItem label="対象">全体効果</T.ListItem>
        </T.List>
      );
    }

    if (f === undefined) {
      return;
    }

    return (
      <dl>
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
      </dl>
    );
  }
}
