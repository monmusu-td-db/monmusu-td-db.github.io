import type { ReactNode } from "react";
import type { Setting } from "../States";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatHandler } from "./StatRoot";
import { StatTooltip } from "./StatTooltip";

export class StatWeapon extends StatTooltip<boolean, string> {
  override isEnabled: StatHandler<boolean> = (s) => this.getValue(s);

  override getTooltipBody(setting: Setting): ReactNode {
    return (
      <T.List>
        <T.ListItem label="名前">{this.getFactors(setting)}</T.ListItem>
      </T.List>
    );
  }
}
