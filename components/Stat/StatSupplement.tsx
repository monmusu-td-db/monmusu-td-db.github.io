import { StatRoot } from "./StatRoot";
import { Fragment, type ReactNode } from "react";
import type { Setting } from "../States";

export class StatSupplement extends StatRoot<ReadonlySet<string>> {
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
