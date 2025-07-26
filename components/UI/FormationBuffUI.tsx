import { Fragment, type ReactNode } from "react";
import * as Data from "../Data";
import * as Util from "./Util";

const supplementText = {
  weapon: "専用武器効果",
  sameElement8: "同一属性8体",
} as const satisfies Record<Data.FormationBuffRequireKey, string>;

export default class FormationBuffUI {
  // static getTargetItem(
  //   targets: ReadonlySet<Data.FormationBuffTarget>
  // ): ReactNode {
  //   const arr: ReactNode[] = [];
  //   let i = 0;
  //   for (const tgt of targets) {
  //     const element = Data.Element.parse(tgt);
  //     arr.push(
  //       <Fragment key={tgt}>
  //         {i > 0 && " "}
  //         {element ? <Util.ElementText element={element} /> : tgt}
  //       </Fragment>
  //     );
  //     i++;
  //   }
  //   return arr;
  // }

  static getSupplementText(
    key: Data.FormationBuffRequireKey,
    element: Data.Element | undefined
  ): string {
    const keys = Data.FormationBuffRequire.keys;
    switch (key) {
      case keys.weapon:
        return supplementText.weapon;
      case keys.sameElement8:
        if (element !== undefined) {
          return `${element}属性8体`;
        } else {
          return supplementText.sameElement8;
        }
    }
  }

  static getSupplementItems(
    requests: readonly Data.FormationBuffRequire[],
    element: Data.Element | undefined
  ): ReactNode {
    return requests.map((buff) => {
      const key = Data.FormationBuffRequire.keyOf(buff);
      return <SupplementItem key={key} requireKey={key} element={element} />;
    });
  }
}

function SupplementItem({
  requireKey,
  element,
}: {
  requireKey: Data.FormationBuffRequireKey;
  element: Data.Element | undefined;
}): ReactNode {
  const keys = Data.FormationBuffRequire.keys;
  switch (requireKey) {
    case keys.weapon:
      return FormationBuffUI.getSupplementText(requireKey, element);
    case keys.sameElement8:
      if (element === undefined) {
        return FormationBuffUI.getSupplementText(requireKey, element);
      } else {
        return (
          <span className={Data.TableClass.buffRequire}>{element}属性8体</span>
        );
      }
  }
}
