import { Fragment, type ReactNode } from "react";
import * as Data from "../Data";
import * as Util from "./Util";

export default class FormationBuffUI {
  static getTargetItem(
    targets: ReadonlySet<Data.FormationBuffTarget>
  ): ReactNode {
    const arr: ReactNode[] = [];
    let i = 0;
    for (const tgt of targets) {
      const element = Data.Element.parse(tgt);
      arr.push(
        <Fragment key={tgt}>
          {i > 0 && " "}
          {element ? <Util.ElementText element={element} /> : tgt}
        </Fragment>
      );
      i++;
    }
    return arr;
  }
}
