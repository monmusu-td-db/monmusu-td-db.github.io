import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import { Tooltip as Tt } from "../UI/Tooltip";

type Factors = Data.LimitFactors | undefined;
const sign = Tt.sign;

export class StatLimit extends StatTooltip<number | undefined, Factors> {
  override isTable: boolean = true;
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
          <Tt.Equation>
            {(d) => (
              <>
                <Tt.Result>{d ? "耐久値" : result}</Tt.Result>
                <Tt.Expression>
                  {d ? "HP" : f.hp}
                  <Tt.Divide enabled={f.damageCut !== 100}>
                    <Tt.Value isPositive={isPositive}>
                      {d
                        ? isPositive
                          ? "ダメージ軽減率"
                          : "ダメージ増加率"
                        : f.damageCut + sign.PERCENT}
                    </Tt.Value>
                  </Tt.Divide>
                  <Tt.Plus>{d ? damageType + "防御力" : f.defres}</Tt.Plus>
                  {d && f.isMaxDefres && <Tt.Brackets>{"上限値"}</Tt.Brackets>}
                  <Tt.Plus enabled={!!f.attackDebuff}>
                    <Tt.Positive>
                      {d ? "攻撃デバフ" : f.attackDebuff}
                      {d && f.isMaxAttackDebuff && (
                        <Tt.Brackets>{"上限値"}</Tt.Brackets>
                      )}
                    </Tt.Positive>
                  </Tt.Plus>
                </Tt.Expression>
              </>
            )}
          </Tt.Equation>
        </dl>
        {f.evasion > 0 && (
          <Tt.List>
            <Tt.ListItem label={damageType + "攻撃回避率"}>
              {f.evasion + sign.PERCENT}
            </Tt.ListItem>
          </Tt.List>
        )}
      </>
    );
  }
}
