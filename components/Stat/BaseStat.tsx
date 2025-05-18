import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatProps } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

const sign = T.sign;

type StatFactors = Data.DeploymentFactors | undefined;

export class BaseStat<
  TStat extends number | undefined = number | undefined,
  TFactors extends StatFactors = StatFactors
> extends StatTooltip<TStat, TFactors> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;

  constructor(props: StatProps<TStat, TFactors>) {
    super(props);
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
    return this.getFormationTooltip(setting);
  }

  public getFormationTooltip(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    const ssMulEnabled = f.subskillMul !== 100;
    const weaponBaseBuffAdd =
      ssMulEnabled && !!f.weaponBaseBuff
        ? Math.abs(f.weaponBaseBuff - 100)
        : f.weaponBaseBuff;

    return (
      <>
        <T.Equation>
          {(d) => (
            <>
              <T.Result>{d ? "出撃前能力" : f.barrackResult}</T.Result>
              <T.Expression>
                <T.Brackets
                  enabled={
                    (!!f.baseBuff || ssMulEnabled || !!f.weaponBaseBuff) &&
                    !!f.potential
                  }
                >
                  {d ? "基礎値" : f.base}
                  <T.Plus enabled={!!f.potential}>
                    <T.Positive>{d ? "潜在覚醒" : f.potential}</T.Positive>
                  </T.Plus>
                </T.Brackets>
                {!!f.baseBuff && (
                  <T.Multiply>
                    <T.Value isPositive={f.baseBuff > 100}>
                      {d ? "能力倍率" : f.baseBuff + sign.PERCENT}
                    </T.Value>
                  </T.Multiply>
                )}
                <T.Plus enabled={f.baseAdd !== 0}>
                  <T.Value isPositive={f.baseAdd >= 0}>
                    {d ? "加算値" : f.baseAdd}
                  </T.Value>
                </T.Plus>
                <T.Multiply enabled={ssMulEnabled || !!f.weaponBaseBuff}>
                  <T.Brackets enabled={ssMulEnabled && !!f.weaponBaseBuff}>
                    {ssMulEnabled && (
                      <T.Info>
                        {d
                          ? "サブスキル乗算倍率"
                          : f.subskillMul + sign.PERCENT}
                      </T.Info>
                    )}
                    {ssMulEnabled &&
                      !!f.weaponBaseBuff &&
                      (f.weaponBaseBuff >= 100 ? sign.PLUS : sign.MINUS)}
                    {!!f.weaponBaseBuff && (
                      <T.Value isPositive={f.weaponBaseBuff > 100}>
                        {d ? "武器倍率" : weaponBaseBuffAdd + sign.PERCENT}
                      </T.Value>
                    )}
                  </T.Brackets>
                </T.Multiply>
                <T.Plus enabled={!!f.weaponBase}>
                  <T.Positive>{d ? "専用武器" : f.weaponBase}</T.Positive>
                </T.Plus>
                <T.Plus enabled={!!f.weaponUpgrade}>
                  <T.Positive>{d ? "武器強化" : f.weaponUpgrade}</T.Positive>
                </T.Plus>
                <T.Plus enabled={!!f.subskillAdd}>
                  <T.Info>{d ? "サブスキル加算値" : f.subskillAdd}</T.Info>
                </T.Plus>
              </T.Expression>
            </>
          )}
        </T.Equation>
        <T.Equation>
          {(d) => (
            <>
              <T.Result>{d ? "配置前能力" : f.deploymentResult}</T.Result>
              <T.Expression>
                {d ? "出撃前能力" : f.barrackResult}
                <T.Multiply enabled={f.formationBuff !== 100}>
                  <T.Value isPositive={f.formationBuff > 100}>
                    {d ? "編成バフ" : f.formationBuff + sign.PERCENT}
                  </T.Value>
                </T.Multiply>
                {Data.Beast.isFormationFactorAdd(this.statType) ? (
                  <T.Plus enabled={f.beastFormationBuff !== 0}>
                    <T.Info>{d ? "獣神編成バフ" : f.beastFormationBuff}</T.Info>
                  </T.Plus>
                ) : (
                  <T.Multiply enabled={f.beastFormationBuff !== 100}>
                    <T.Info>
                      {d ? "獣神編成バフ" : f.beastFormationBuff + sign.PERCENT}
                    </T.Info>
                  </T.Multiply>
                )}
                <T.Plus enabled={f.beastPossAmount !== 0}>
                  <T.Info>{d ? "獣神バフ" : f.beastPossAmount}</T.Info>
                </T.Plus>
                <T.Multiply enabled={f.beastPossLevel !== 100}>
                  <T.Info>
                    {d ? "獣神バフ" : f.beastPossLevel + sign.PERCENT}
                  </T.Info>
                </T.Multiply>
              </T.Expression>
            </>
          )}
        </T.Equation>
      </>
    );
  }
}
