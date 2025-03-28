import type { ReactNode } from "react";
import * as Data from "../Data";
import * as Util from "../Util";
import type { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler } from "./StatRoot";
import { Level, Positive } from "../Util";

const PLUS = "+";
const MULTIPLY = <>&#8203;×</>;

export class StatTarget extends StatTooltip<
  Data.Target | undefined,
  Data.TargetFactors | undefined
> {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getFactors(s) !== undefined;

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

    const contents: ReactNode[] = (() => {
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
          let base, noOmit;

          if (laser) {
            base = "直線上";
            noOmit = true;
          } else {
            if (target < 1) return 0;
            base = target === Infinity ? Data.Target.inRange : target;
            noOmit = target > 1;
          }

          const targetText = noOmit || (target === 1 && wideTarget);

          return (
            <>
              <Brackets
                enabled={targetText && wideTarget && (splash || round > 1)}
              >
                {targetText && base}
                {targetText && wideTarget && PLUS}
                {wideTarget && "​周囲"}
              </Brackets>
              {(noOmit || wideTarget) && splash && MULTIPLY}
              {splash && "範囲"}
              {!(noOmit || splash || wideTarget) && 1}
              {round > 1 && (
                <>
                  {MULTIPLY}
                  {round}
                </>
              )}
            </>
          );
        }

        if (typeof rounds === "number") return fn(rounds);
        return rounds.map((r) => fn(r.value));
      });
    })();

    const ret = (
      <Util.JoinTexts texts={contents} separator={<>&#8203;or&#8203;</>} />
    );
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
    )
      return <small>{ret}</small>;
    return ret;
  }

  protected override getTooltipBody(setting: Setting): ReactNode {
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
      <table>
        <tbody>
          <Row label="対象">
            {Data.Target.getString(f.target)}
            {f.wideTarget && (
              <>
                {this.plus}
                周囲
              </>
            )}
            {(f.splash || f.isBlock || f.laser) && (
              <>
                {this.bStart}
                {f.isBlock && <Positive>ブロック全敵</Positive>}
                {f.isBlock && f.splash && " / "}
                {f.splash && <Positive>範囲攻撃</Positive>}
                {f.laser && (f.splash || f.isBlock) && " / "}
                {f.laser && <Positive>直線上対象攻撃</Positive>}
                {this.bEnd}
              </>
            )}
          </Row>
          {round !== undefined && round !== 1 ? (
            <Row label="連射数">
              <Level level={round > 1}>
                {multiply}
                {round.toFixed(0)}
              </Level>
            </Row>
          ) : (
            <>
              {average !== 1 && (
                <Row label="平均連射数">
                  <Level level={average > 1}>
                    {multiply}
                    {average.toFixed(1)}
                  </Level>
                </Row>
              )}
              {roundDetails !== undefined && roundDetails.length > 0 && (
                <Row label="連射内訳">{roundDetails.join(" / ")}</Row>
              )}
            </>
          )}
        </tbody>
      </table>
    );
  }
}

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <tr>
      <Th>{label}</Th>
      <Td>{children}</Td>
    </tr>
  );
}

function Th({ children }: { children?: ReactNode }) {
  return <th className="text-warning">{children}</th>;
}

function Td({ children }: { children?: ReactNode }) {
  return <td>：{children}</td>;
}

function Brackets({
  enabled,
  children,
}: {
  enabled?: boolean;
  children: ReactNode;
}) {
  if (enabled !== false) {
    return (
      <>
        {"("}
        {children}
        {")"}
      </>
    );
  } else {
    return children;
  }
}
