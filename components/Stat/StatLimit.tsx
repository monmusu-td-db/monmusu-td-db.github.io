import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import { Level, Positive, Result } from "../Util";

type Factors = Data.LimitFactors | undefined

export class StatLimit extends StatTooltip<number | undefined, Factors> {
  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    const defres = this.statType === Data.stat.physicalLimit ? "物理防御力" : "魔法防御力";
    const level = f.damageCut < 100;
    const isDamageReduction = level ? "ダメージ軽減率" : "ダメージ増加率";
    const reductionDt = f.damageCut !== 100 &&
      <>{this.divide}<Level level={level}>{isDamageReduction}</Level></>;
    const reductionDd = f.damageCut !== 100 &&
      <>{this.divide}<Level level={level}>{f.damageCut + this.percent}</Level></>;
    const result = f.result === Infinity ? "∞" : f.result;

    return (
      <>
        <dt>
          <Result>耐久値</Result>{this.equal}
          <small>
            HP
            {reductionDt}
            {this.plus + defres}
            {f.isMaxDefres && this.bStart + "上限値" + this.bEnd}
            {!!f.attackDebuff && <>
              {this.plus}
              <Positive>
                攻撃デバフ
                {f.isMaxAttackDebuff && this.bStart + "上限値" + this.bEnd}
              </Positive></>}
          </small>
        </dt>
        <dd>
          <Result b>{result}</Result>{this.equal}
          {f.hp}
          {reductionDd}
          {this.plus + f.defres}
          {!!f.attackDebuff && <>{this.plus}<Positive>{f.attackDebuff}</Positive></>}
        </dd>
      </>
    );
  }
}
