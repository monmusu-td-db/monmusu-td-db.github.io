import { Fragment, type ReactNode } from "react";
import type { Setting } from "../States";
import { StatRoot } from "./StatRoot";
import * as Data from "../Data";

export class StatSupplement extends StatRoot<ReadonlySet<string>> {
  // override isNotDescList: boolean = true;
  // override isEnabled: StatHandler<boolean> = (s) => {
  //   const value = this.getValue(s);
  //   return value.size > 0;
  // };

  protected override getDefaultItem(setting: Setting): ReactNode {
    const list = this.getValue(setting);
    const ret: ReactNode[] = [];
    let i = 0;
    for (const item of list) {
      ret.push(
        <Fragment key={item}>
          {i > 0 && " "}
          <span>{item}</span>
        </Fragment>
      );
      i++;
    }
    return ret;
  }

  // public override getTooltipBody(setting: Setting): ReactNode {
  //   const value = this.getValue(setting);
  //   const list = (() => {
  //     const ret = [];
  //     for (const str of value) {
  //       ret.push(<li key={str}>{str}</li>);
  //     }
  //     return ret;
  //   })();
  //   return <ul className="ps-3">{list}</ul>;
  // }

  public static merge(
    ...values: (ReadonlySet<string> | undefined)[]
  ): ReadonlySet<string> {
    const ret = new Set<string>();
    for (const v of values) {
      if (v !== undefined) {
        for (const str of v) ret.add(str);
      }
    }
    return ret;
  }

  public static filter(
    target: ReadonlySet<string>,
    filter: ReadonlySet<string> | undefined
  ): ReadonlySet<string> {
    if (filter === undefined) return target;

    const ret = new Set<string>();
    target.forEach((str) => {
      if (!filter.has(str)) ret.add(str);
    });
    return ret;
  }

  public static parse(
    value: ReadonlySet<string>,
    atkFactor: Data.ActualAttackFactors | undefined,
    hpFactor: Data.ActualHpFactors | undefined
  ): ReadonlySet<string> {
    const ret = new Set<string>();
    for (const str of value) {
      ret.add(
        str.replaceAll(/\{([^\{\}])*\}/g, (match) => {
          match = match.slice(1, match.length - 1);
          const [key, value] = match.split("*");
          return (
            (() => {
              const v =
                value !== undefined ? Number.parseInt(value) : undefined;
              const fn = (a: number | undefined) =>
                Data.Percent.multiply(a ?? 0, v);
              switch (key) {
                case "attack-base":
                  return fn(atkFactor?.deploymentResult);
                case "attack":
                  return fn(atkFactor?.inBattleResult);
                case "max-hp":
                  return fn(hpFactor?.inBattleResult);
              }
            })()?.toString() ?? ""
          );
        })
      );
    }
    return ret;
  }

  public static getDamageCut(
    phyFactor: Data.DamageCutFactors,
    magFactor: Data.DamageCutFactors
  ): ReadonlySet<string> | undefined {
    const phy = phyFactor.supplement;
    const mag = magFactor.supplement;
    const gen = phyFactor.generalSupplement;
    if (phy === 0 && mag === 0 && gen === 0) return;

    const ret = new Set<string>();
    const fn = (type: string, damage: number) => {
      const sign = damage > 0 ? "-" : "+";
      ret.add(type + "被Dmg" + sign + Math.abs(damage) + "%");
    };

    if (gen !== 0) fn("", gen);

    if (gen < 100) {
      if (phy !== 0 && phy === mag) {
        fn("物理魔法", phy);
        return ret;
      }

      if (phy !== 0) fn("物理", phy);
      if (mag !== 0) fn("魔法", mag);
    }
    return ret;
  }

  public static getEvasion(
    phyValue: number,
    magValue: number
  ): ReadonlySet<string> | undefined {
    if (phyValue <= 0 && magValue <= 0) return;

    const ret = new Set<string>();
    if (phyValue === magValue) {
      ret.add("物理魔法回避" + phyValue + "%");
      return ret;
    }

    if (phyValue > 0) ret.add("物理回避" + phyValue + "%");
    if (magValue > 0) ret.add("魔法回避" + magValue + "%");
    return ret;
  }

  // protected getDefaultItemOld(setting: Setting): ReactNode {
  //   const value = this.getValue(setting);
  //   const ret: ReactNode[] = [];
  //   for (const str of value) {
  //     if (str.startsWith("limit")) {
  //       ret.push(
  //         <>
  //           <span className="text-danger">limit</span>
  //           {str.slice(5)}
  //         </>
  //       );
  //     } else {
  //       ret.push(str);
  //     }
  //   }

  //   return <JoinTexts texts={ret} nowrap />;
  // }
}
