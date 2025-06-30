import type { ReactNode } from "react";
import type { Setting } from "../States";
import { StatRange } from "./StatRange";
import type { StatHandler } from "./StatRoot";
import { Tooltip as T } from "../UI/Tooltip";

export class StatBuffRange extends StatRange {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getValue(s) !== undefined && this.getFactors(s) !== undefined;
  override isNotDescList: boolean = true;

  protected override getDefaultText(setting: Setting): string | undefined {
    const value = this.getValue(setting);
    if (value === Infinity) {
      return "全体";
    } else {
      return super.getDefaultText(setting);
    }
  }

  public override getTooltipBody(setting: Setting): ReactNode {
    const value = this.getValue(setting);
    if (value !== Infinity) {
      return <dl>{super.getTooltipBody(setting)}</dl>;
    } else {
      return (
        <T.List>
          <T.ListItem label="対象">全体効果</T.ListItem>
        </T.List>
      );
    }
  }
}
