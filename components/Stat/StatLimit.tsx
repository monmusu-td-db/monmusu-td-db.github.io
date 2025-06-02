import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatStyles } from "./StatRoot";

type Factors = Data.LimitFactors | undefined;
const sign = T.sign;

export class StatLimit extends StatTooltip<number | undefined, Factors> {
  override isTable: boolean = true;

  protected override getDefaultText(setting: Setting): string | undefined {
    const value = this.getValue(setting);
    if (value === Infinity) {
      return "∞";
    } else {
      return super.getDefaultText(setting);
    }
  }

  protected override getDefaultItem(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    if (value === undefined || value === Infinity) {
      return super.getDefaultItem(setting);
    } else {
      return StatLimit.getNumber({ value });
    }
  }

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const text = this.getText(setting);
    const defaultStyle = super.getDefaultStyles(setting);
    const fontStyle = this.getSmallFontStyles(text, defaultStyle, 5);
    const colorStyle = this.getColorStyle(setting);
    const unhealableStyle = this.getUnhealableStyle(setting);
    return StatLimit.mergeStyles(fontStyle, colorStyle, unhealableStyle);
  }

  private getColorStyle(setting: Setting): StatStyles {
    const value = this.getValue(setting);
    const type = this.statType === Data.stat.physicalLimit;
    const col = Data.tableColor;
    const getColor = () => {
      if (value === undefined || value < 1500) {
        return;
      } else if (value < 3000) {
        return type ? col.blue100 : col.green100;
      } else if (value < 4500) {
        return type ? col.blue : col.green;
      } else if (value < 6000) {
        return type ? col.blue300 : col.green300;
      } else if (value < 10000) {
        return type ? col.blue500 : col.green500;
      } else if (value < 15000) {
        return type ? col.blue700 : col.green700;
      } else {
        return type ? col.blue900 : col.green900;
      }
    };
    return Data.TableColor.getSelector(getColor());
  }

  private getUnhealableStyle(setting: Setting): StatStyles {
    const isUnhealable = this.getFactors(setting)?.isUnhealable;
    return isUnhealable ? Data.TableClass.unhealable : undefined;
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    const damageType =
      this.statType === Data.stat.physicalLimit ? "物理" : "魔法";
    const isPositive = f.damageCut < 100;
    const result = f.result === Infinity ? "∞" : f.result;

    return (
      <>
        <dl className="mb-2">
          <T.Equation>
            {(d) => (
              <>
                <T.Result>{d ? "耐久値" : result}</T.Result>
                <T.Expression>
                  {d ? "HP" : f.hp}
                  <T.Divide enabled={f.damageCut !== 100}>
                    <T.Value isPositive={isPositive}>
                      {d
                        ? isPositive
                          ? "ダメージ軽減率"
                          : "ダメージ増加率"
                        : f.damageCut + sign.PERCENT}
                    </T.Value>
                  </T.Divide>
                  <T.Plus>{d ? damageType + "防御力" : f.defres}</T.Plus>
                  {d && f.isMaxDefres && <T.Brackets>{"上限値"}</T.Brackets>}
                  <T.Plus enabled={!!f.attackDebuff}>
                    <T.Positive>
                      {d ? "攻撃デバフ" : f.attackDebuff}
                      {d && f.isMaxAttackDebuff && (
                        <T.Brackets>{"上限値"}</T.Brackets>
                      )}
                    </T.Positive>
                  </T.Plus>
                </T.Expression>
              </>
            )}
          </T.Equation>
        </dl>
        {f.evasion > 0 && (
          <T.List>
            <T.ListItem label={damageType + "攻撃回避率"}>
              {f.evasion + sign.PERCENT}
            </T.ListItem>
          </T.List>
        )}
      </>
    );
  }
}
