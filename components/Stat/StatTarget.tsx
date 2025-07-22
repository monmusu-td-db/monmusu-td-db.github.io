import { Fragment, type ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler, StatStyles } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

const PLUS = "+";
const MULTIPLY = "×";

export class StatTarget extends StatTooltip<
  Data.Target | undefined,
  Data.TargetFactors | undefined
> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;
  override isNotDescList: boolean = true;

  protected override getDefaultComparer(setting: Setting): number | undefined {
    const value = this.getValue(setting);
    if (value === Infinity) return -1000;
    if (typeof value === "number") return -value;
    switch (value) {
      case Data.Target.self:
        return -1;
      case Data.Target.all:
        return -Infinity;
      case Data.Target.other:
        return -10000;
      case Data.Target.hit:
        return 1;
    }
  }

  protected override getDefaultItem(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;
    const { target, splash, rounds, wideTarget, laser } = f;

    const contents: string[] = (() => {
      switch (target) {
        case Data.Target.self:
        case Data.Target.all:
        case Data.Target.other:
          return [target];
        case Data.Target.hit:
          if (splash) return [`${target}→範囲`];
          return [target];
      }
      const targets = Array.isArray(target) ? target : [target];

      return targets.flatMap((target) => {
        function fn(round: number) {
          if (target < 1) return "0";
          const base = target === Infinity ? Data.Target.inRange : target;
          const noOmit = target > 1;

          const targetText = noOmit || (target === 1 && wideTarget);
          const brac = targetText && wideTarget && (splash || round > 1);

          return [
            brac && "(",
            targetText && base,
            targetText && wideTarget && PLUS,
            wideTarget && "​周囲",
            brac && ")",
            (noOmit || wideTarget) && (splash || laser) && MULTIPLY,
            splash && !laser && "範囲",
            laser && "直線上",
            !(noOmit || splash || laser || wideTarget) && 1,
            round > 1 && MULTIPLY + round,
          ]
            .filter((str) => str !== false)
            .join("");
        }

        if (typeof rounds === "number") return fn(rounds);
        return rounds.map((r) => fn(r.value));
      });
    })();

    return contents.map((str, i) => {
      return (
        <Fragment key={str}>
          {i > 0 && <>&#8203;or&#8203;</>}
          {str}
        </Fragment>
      );
    });
  }

  protected override getDefaultStyles(setting: Setting): StatStyles {
    const f = this.getFactors(setting);
    const origin = super.getDefaultStyles(setting);
    if (f === undefined) {
      return origin;
    }

    const { target, splash, rounds, wideTarget, laser } = f;
    if (
      target === Infinity ||
      target === Data.Target.self ||
      target === Data.Target.all ||
      target === Data.Target.other ||
      target === Data.Target.hit ||
      splash ||
      wideTarget ||
      laser ||
      (Array.isArray(rounds) && rounds.length > 1)
    ) {
      return StatTarget.mergeStyles(origin, Data.TableClass.small);
    } else {
      return origin;
    }
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    if (f === undefined) return;

    const multiply = "×";
    const round = typeof f.rounds === "number" ? f.rounds : undefined;
    const [average, ratios] = Data.Round.getAverageAndRatios(f.rounds);
    const roundDetails =
      typeof f.rounds === "number"
        ? undefined
        : f.rounds.map((r) => {
            const ratio = ((r.ratio / ratios) * 100).toFixed(0) + this.percent;
            return (
              multiply + r.value.toFixed(0) + this.bStart + ratio + this.bEnd
            );
          });

    return (
      <T.List>
        <T.ListItem label="対象">
          {Data.Target.getString(f.target)}
          <T.Plus enabled={f.wideTarget}>周囲</T.Plus>
          <T.Brackets enabled={f.splash || f.isBlock || f.laser}>
            {f.isBlock && <T.Positive>ブロック全敵</T.Positive>}
            {f.isBlock && f.splash && " / "}
            {f.splash && <T.Positive>範囲攻撃</T.Positive>}
            {f.laser && (f.splash || f.isBlock) && " / "}
            {f.laser && <T.Positive>直線上対象攻撃</T.Positive>}
          </T.Brackets>
        </T.ListItem>
        {round !== undefined && round !== 1 ? (
          <T.ListItem label="連射数">
            <T.Value isPositive={round > 1}>
              {multiply}
              {round.toFixed(0)}
            </T.Value>
          </T.ListItem>
        ) : (
          <>
            {average !== 1 && (
              <T.ListItem label="平均連射数">
                <T.Value isPositive={average > 1}>
                  {multiply}
                  {average.toFixed(1)}
                </T.Value>
              </T.ListItem>
            )}
            {roundDetails !== undefined && roundDetails.length > 0 && (
              <T.ListItem label="連射内訳">
                {roundDetails.join(" / ")}
              </T.ListItem>
            )}
          </>
        )}
      </T.List>
    );
  }
}
