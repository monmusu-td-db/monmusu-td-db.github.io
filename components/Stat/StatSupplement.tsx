import { StatRoot } from "./StatRoot";
import type { ReactNode } from "react";
import type { Setting } from "../States";
import { JoinTexts } from "../Util";

export class StatSupplement extends StatRoot<ReadonlySet<string>> {
  protected override getDefaultItem(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    const ret: ReactNode[] = [];
    for (const str of value) {
      if (str.startsWith("limit")) {
        ret.push(
          <>
            <span className="text-danger">limit</span>
            {str.slice(5)}
          </>
        );
      } else {
        ret.push(str);
      }
    }

    return (
      <small>
        <JoinTexts texts={ret} nowrap />
      </small>
    );
  }
}
