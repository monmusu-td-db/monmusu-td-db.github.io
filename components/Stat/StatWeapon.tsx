import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { Tooltip as T } from "../UI/Tooltip";
import type { StatHandler } from "./StatRoot";
import { StatTooltip } from "./StatTooltip";

export class StatWeapon extends StatTooltip<boolean, Data.WeaponFactors> {
  override isEnabled: StatHandler<boolean> = (s) => this.getValue(s);

  override getTooltipBody(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    return (
      <T.List>
        <T.ListItem label="名前">{f.name}</T.ListItem>
        {getListItem("HP", f.hp)}
        {getListItem("攻撃力", f.attack)}
        {getListItem("物理防御", f.defense)}
        {getListItem("魔法防御", f.resist)}
        {getListItem("攻撃速度", f.attackSpeed)}
        {getListItem("射程", f.range)}
      </T.List>
    );
  }
}

function getListItem(label: string, value?: number) {
  if (value == null) return;
  return (
    <T.ListItem label={label}>
      <T.Value isPositive={value > 0}>
        {value > 0 && "+"}
        {value}
      </T.Value>
    </T.ListItem>
  );
}
