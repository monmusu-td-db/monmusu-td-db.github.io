import type { ReactNode } from "react";

import * as Data from "../Data";
import * as Util from "../UI/Util";
import { StatTooltip } from "./StatTooltip";
import { StatRoot, type StatHandler, type StatProps } from "./StatRoot";
import Unit from "../Unit";
import { Setting } from "../States";
import type Situation from "../Situation";
import { Tooltip as T } from "../UI/Tooltip";

const stat = Data.stat;

type Props = {
  unit: Unit | undefined;
  situation?: Situation;
} & StatProps<string>;

export class StatUnitName extends StatTooltip<string> {
  override isEnabled: StatHandler<boolean> = () => this.unit !== undefined;

  private readonly unit: Unit | undefined;
  private readonly situation: Situation | undefined;

  constructor(props: Props) {
    super(props);

    this.unit = props.unit;
    this.situation = props.situation;
  }

  override getTooltipBody(setting: Setting): ReactNode {
    if (this.unit === undefined) {
      return;
    }

    const unit = this.unit;
    const situation = this.situation ?? unit;
    const nameOf = (statType: Data.StatType) =>
      Data.StatType.headerNameOf(statType, setting);
    const textOf = (stat: StatRoot<unknown>) => stat.getText(setting);
    const valueOf = <T,>(stat: StatRoot<T>) => stat.getValue(setting);

    const parent = unit.getTokenParent();

    let className: string | undefined = unit.className.getValue(setting);
    switch (setting.classNameType) {
      case Setting.TYPE_CC4:
        className = Data.UnitClass.cc4NameOf(
          className as Data.UnitClassTag | undefined
        );
        break;
      case Setting.TYPE_EQUIPMENT:
        className = Data.UnitClass.equipmentNameOf(
          className as Data.UnitClassTag | undefined
        );
    }

    const element = unit.element.getValue(setting);
    const species = unit.species.getValue(setting).join(" / ");
    const moveType = textOf(unit.moveType);
    const moveSpeed = situation.moveSpeed.getValue(setting);
    const moveCost = situation.moveCost.getValue(setting);
    const placement = valueOf(unit.placement);
    const deployCount = valueOf(unit.deployCount);

    return (
      <T.List>
        <T.ListItem label={nameOf(stat.unitName)}>
          {textOf(unit.unitName)}
        </T.ListItem>
        {!!parent && unit.isToken && (
          <T.ListItem label="トークン所有者">
            {textOf(parent.unitName)}
          </T.ListItem>
        )}
        <T.ListItem label={nameOf(stat.rarity)}>
          {Util.getRarityText(valueOf(unit.rarity))}
        </T.ListItem>
        {!!className && (
          <T.ListItem label={nameOf(stat.className)}>{className}</T.ListItem>
        )}
        {!!element && (
          <T.ListItem label={nameOf(stat.element)}>
            <Util.ElementText element={element} />
          </T.ListItem>
        )}
        {!!species && (
          <T.ListItem label={nameOf(stat.species)}>{species}</T.ListItem>
        )}
        {!!moveType && (
          <T.ListItem label={nameOf(stat.moveType)}>{moveType}</T.ListItem>
        )}
        <T.ListItem label={nameOf(stat.moveSpeed)}>{moveSpeed}</T.ListItem>
        {moveCost !== undefined && (
          <T.ListItem label={nameOf(stat.moveCost)}>{moveCost}</T.ListItem>
        )}
        {placement && (
          <T.ListItem label={nameOf(stat.placement)}>
            {Data.Placement.desc[placement]}
          </T.ListItem>
        )}
        {deployCount !== undefined && (
          <T.ListItem label={nameOf(stat.deployCount)}>
            {deployCount === 0
              ? "含まれない"
              : `${deployCount}体まで含まれない`}
          </T.ListItem>
        )}
      </T.List>
    );
  }
}
