import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { BaseStat, type BaseStatProps } from "./BaseStat";
import { Tooltip as T } from "./StatTooltip";

const sign = T.sign;

export type StatFactors = Data.InBattleFactors | undefined

export class SituationBaseStat<TFactors extends StatFactors = StatFactors>
  extends BaseStat<number | undefined, TFactors> {
  constructor(props: BaseStatProps<number | undefined, TFactors>) {
    super(props);
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
    return this.getTooltipBodyBase(setting);
  }

  private getTooltipBodyBase(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    return (
      <>
        {super.getTooltipBody(setting)}
        <T.Equation>
          {d => (
            <>
              <T.Result>
                {d ? "表示能力値" : f.inBattleResult}
              </T.Result>
              <T.Expression>
                {f.isMaxDamage || f.isMinDamage ? (
                  <>
                    {d && `能力${f.isMaxDamage ? "上限" : "下限"}`}
                    <T.Brackets enabled={d}>
                      {d ? "配置前能力" : f.deploymentResult}
                      <T.Multiply>
                        <T.Value isPositive={f.isMaxDamage}>
                          {f.isMaxDamage ? 1000 : 50}{sign.PERCENT}
                        </T.Value>
                      </T.Multiply>
                    </T.Brackets>
                  </>
                ) : (
                  <>
                    <T.Brackets enabled={f.currentFactor !== 100 && !!f.additionFactor}>
                      {d ? "配置前能力" : f.deploymentResult}
                      <T.Multiply enabled={f.multiFactor !== 100}>
                        <T.Value isPositive={f.multiFactor > 100}>
                          {d ? "乗算倍率" : f.multiFactor + sign.PERCENT}
                        </T.Value>
                      </T.Multiply>
                      <T.Plus enabled={!!f.additionFactor}>
                        <T.Value isPositive={f.additionFactor > 0}>
                          {d ? "加算値" : f.additionFactor}
                        </T.Value>
                      </T.Plus>
                    </T.Brackets>
                    <T.Multiply enabled={f.currentFactor !== 100}>
                      <T.Value isPositive={f.currentFactor > 100}>
                        {d ? "現在値割合" : Math.round(f.currentFactor) + sign.PERCENT}
                      </T.Value>
                    </T.Multiply>
                  </>
                )}
              </T.Expression>
            </>
          )}
        </T.Equation>
      </>
    );
  }

  protected getStaticDamageTooltip(
    setting: Setting,
    factors: Data.ActualAttackFactors | Data.ActualDefResFactors
  ) {
    const f = factors;
    if (f?.staticDamage === undefined) return;
    const staticDamage = f.staticDamage;
    let v;
    switch (this.statType) {
      case Data.stat.attack:
        v = Data.StaticDamage.ATTACK_BASE;
        break;
      case Data.stat.defense:
        v = Data.StaticDamage.DEFENSE_BASE;
        break;
      case Data.stat.resist:
        v = Data.StaticDamage.RESIST_BASE;
        break;
    }
    const keyText = Data.StaticDamage.textOf(staticDamage.key);
    return (
      <>
        {staticDamage.key === v && this.getFormationTooltip(setting)}
        {staticDamage.key === this.statType && this.getTooltipBodyBase(setting)}
        <T.Equation>
          {d => (
            <>
              <T.Result>
                {d ? "固有値" : Math.abs(f.actualResult)}
              </T.Result>
              <T.Expression>
                {staticDamage.key === Data.StaticDamage.TIME ? (
                  <>
                    {d ? "基礎値" : Math.abs(staticDamage.value)}
                    <T.Multiply>
                      {d ? keyText : Math.abs(staticDamage.reference)}
                    </T.Multiply>
                  </>
                ) : (
                  <>
                    {d ? keyText : Math.abs(staticDamage.reference)}
                    <T.Multiply enabled={staticDamage.key !== Data.StaticDamage.STATIC}>
                      {d ? "倍率" : Math.abs(staticDamage.value) + sign.PERCENT}
                    </T.Multiply>
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
