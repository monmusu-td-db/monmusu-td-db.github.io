import type { ReactNode } from "react";
import type { JsonBuff } from "../Unit";
import { FeatureRequire } from "../Feature";
import { TableClass } from "../Data";

export class InBattleBuffUI {
  static getSupplement(buff: JsonBuff, isPotentialApplied: boolean): ReactNode {
    return <Supplement buff={buff} isPotentialApplied={isPotentialApplied} />;
  }

  static getCritical(
    base: string | undefined,
    limit: string | undefined
  ): ReactNode {
    return <Critical base={base} limit={limit} />;
  }
}

function Supplement({
  buff,
  isPotentialApplied,
}: {
  buff: JsonBuff;
  isPotentialApplied: boolean;
}): ReactNode {
  const requirements: string[] = [];
  const potentialRequire = isPotentialApplied
    ? buff.potentialBonus?.require
    : undefined;
  const require = potentialRequire ?? buff.require;
  require?.forEach((str) => {
    let text;
    switch (str) {
      case FeatureRequire.weapon:
        text = "武器効果";
        break;
      case FeatureRequire.fire:
      case FeatureRequire.water:
      case FeatureRequire.earth:
      case FeatureRequire.wind:
      case FeatureRequire.light:
      case FeatureRequire.dark:
        text = str + "配置ユニット";
        break;
      default:
        text = str;
        break;
    }
    requirements.push(text);
  });

  const potential = isPotentialApplied
    ? buff.potentialBonus?.supplements
    : undefined;
  const supplements = potential ?? buff.supplements;

  return (
    <>
      <span className={TableClass.buffRequire}>{requirements.join(" ")} </span>
      {supplements?.join(" ")}
    </>
  );
}

function Critical({
  base,
  limit,
}: {
  base: string | undefined;
  limit: string | undefined;
}): ReactNode {
  if (!base && !limit) {
    return;
  }
  return (
    <>
      {!!base && base + " "}
      {!!limit && <b>{"(" + limit + ")"}</b>}
    </>
  );
}
