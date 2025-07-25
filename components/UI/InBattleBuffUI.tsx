import "./InBattleBuffUI.css";
import type { ReactNode } from "react";
import type { JsonBuff } from "../Unit";
import { FeatureRequire } from "../Feature";

export class InBattleBuffUI {
  static getSupplement(buff: JsonBuff): ReactNode {
    return <Supplement buff={buff} />;
  }

  static getCritical(
    base: string | undefined,
    limit: string | undefined
  ): ReactNode {
    return <Critical base={base} limit={limit} />;
  }
}

function Supplement({ buff }: { buff: JsonBuff }): ReactNode {
  const requirements: string[] = [];
  buff.require?.forEach((str) => {
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

  return (
    <>
      <span className="buff-require">{requirements.join(" ")} </span>
      {buff.supplements?.join(" ")}
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
