import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { StatTooltip } from "./StatTooltip";
import type { StatHandler } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

const sign = T.sign;

export class StatCondition extends StatTooltip<readonly Data.ConditionObj[]> {
  override isEnabled: StatHandler<boolean> = (s) => this.getValue(s).length > 0;
  override isNotDescList: boolean = true;

  protected override getDefaultText(setting: Setting): string {
    const list = this.getValue(setting);
    return list.map((obj) => this.getTextFromObj(obj)).join("");
  }

  private getTextFromObj(obj: Data.ConditionObj): string {
    const keyText = Data.Condition.text[obj.key];
    const value = (obj.value ?? "").toString();
    switch (obj.key) {
      case Data.Condition.key.hit:
        const s = (obj.value ?? 0) > 1 ? keyText + "s" : keyText;
        return value + s + " ";
      case Data.Condition.key.second:
        return value + keyText + " ";
      default:
        return keyText + value + (obj.value !== undefined ? " " : "");
    }
  }

  protected override getDefaultItem(setting: Setting): ReactNode {
    return this.getText(setting);
  }

  override getTooltipBody(setting: Setting): ReactNode {
    const list = this.getValue(setting);

    return (
      <T.DescList>
        {list.map(({ key, type, value }) => {
          const keyText = Data.Condition.desc[key];
          const cond = Data.Condition.key;
          return (
            <T.DescListItem key={key} label={keyText}>
              {(() => {
                switch (key) {
                  case cond.hp:
                  case cond.multiply:
                    return value + sign.PERCENT;
                  case cond.definite:
                    return Data.Condition.getDefiniteDesc(type);
                  case cond.second:
                    return value + sign.SECOND;
                  default:
                    return value;
                }
              })()}
            </T.DescListItem>
          );
        })}
      </T.DescList>
    );
  }
}
