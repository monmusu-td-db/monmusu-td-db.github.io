import type { ReactNode } from "react";

import * as Data from "../Data";
import { StatTooltip } from "./StatTooltip";
import { Setting } from "../States";
import type { StatHandler } from "./StatRoot";
import { DelayTooltip } from "./StatDelay";
import { Result } from "../Util";
import { AttackSpeedTooltip } from "./StatAttackSpeed";

type Factors = Data.IntervalFactors | undefined

export class StatInterval extends StatTooltip<number | undefined, Factors> {
  override isEnabled: StatHandler<boolean> = s => this.getFactors(s)?.result !== undefined;
  protected override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f?.result === undefined || f.base === undefined)
      return;
    const b = f.base;

    return (
      <>
        {!f.staticValue &&
          <>
            <AttackSpeedTooltip parent={this} factors={b} />
            <DelayTooltip parent={this} factors={{
              ...b,
              result: b.delayResult
            }} />
          </>
        }

        <dt>
          <Result>攻撃間隔</Result>{this.equal}
          <small>
            {!!f.staticValue ? <>
              固有値
            </> : <>
              攻撃動作速度
              {this.plus}攻撃待機時間
            </>
            }
          </small>
        </dt>
        <dd>
          <Result b>{f.actualResult}{this.frame}</Result>{this.equal}
          {!!f.staticValue ? <>
            {f.staticValue}{this.frame}
          </> : <>
            {b.attackSpeedResult}{this.frame}
            {this.plus}{b.delayResult}{this.frame}
          </>
          }
        </dd>

        {!!f.cooldown && <>
          <dt>
            <Result>単発スキル発動間隔</Result>{this.equal}
            <small>
              攻撃間隔
              {this.plus}再動
              {this.multiply}{this.frame}/秒
            </small>
          </dt>
          <dd>
            <Result b>{f.result}{this.frame}</Result>{this.equal}
            {f.actualResult}{this.frame}
            {this.plus}{f.cooldown}秒
            {this.multiply}{Data.fps}{this.frame}/秒
          </dd>
        </>
        }
      </>
    );
  }
}
