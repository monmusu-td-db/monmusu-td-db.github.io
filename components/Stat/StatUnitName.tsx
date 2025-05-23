import type { ReactNode } from "react";

import * as Data from "../Data";
import * as Util from "../Util";
import { StatTooltip } from "./StatTooltip";
import { StatRoot, type StatHandler, type StatProps } from "./StatRoot";
import Unit from "../Unit";
import { Setting } from "../States";
import type Situation from "../Situation";

const COLON = "：";
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

  public override getTooltipBody(setting: Setting): ReactNode {
    if (this.unit === undefined) return;

    const unit = this.unit;
    const situation = this.situation ?? unit;
    const nameOf = (statType: Data.StatType) => Data.StatType.nameOf(statType);
    const textOf = (stat: StatRoot<unknown>) => stat.getText(setting);
    const valueOf = <T,>(stat: StatRoot<T>) => stat.getValue(setting);

    const parent = unit.getTokenParent();
    const className = unit.className.getValue(setting);
    const element = unit.element.getValue(setting);
    const species = unit.species.getValue(setting);
    const moveType = textOf(unit.moveType);
    const moveSpeed = situation.moveSpeed.getValue(setting);
    const placement = valueOf(unit.placement);

    return (
      <table className="mb-3">
        <tbody>
          <Tr>
            <Th>{nameOf(stat.unitName)}</Th>
            <Td>{textOf(unit.unitName)}</Td>
          </Tr>
          {!!parent && (
            <Tr>
              <Th>トークン所有者</Th>
              <Td>{textOf(parent.unitName)}</Td>
            </Tr>
          )}
          <Tr>
            <Th>{nameOf(stat.rarity)}</Th>
            <Td>{Util.getRarityText(valueOf(unit.rarity))}</Td>
          </Tr>
          <Tr enabled={!!className}>
            <Th>{nameOf(stat.className)}</Th>
            <Td>{className}</Td>
          </Tr>
          <Tr enabled={!!element}>
            <Th>{nameOf(stat.element)}</Th>
            <Td>
              <Util.ElementText element={element} />
            </Td>
          </Tr>
          <Tr enabled={!!species}>
            <Th>{nameOf(stat.species)}</Th>
            <Td>{species}</Td>
          </Tr>
          <Tr enabled={!!moveType}>
            <Th>{nameOf(stat.moveType)}</Th>
            <Td>{moveType}</Td>
          </Tr>
          <Tr>
            <Th>{nameOf(stat.moveSpeed)}</Th>
            <Td>{moveSpeed}</Td>
          </Tr>
          {placement && (
            <Tr>
              <Th>{nameOf(stat.placement)}</Th>
              <Td>{Data.Placement.desc[placement]}</Td>
            </Tr>
          )}
        </tbody>
      </table>
    );
  }
}

function Tr({ children, enabled }: { children: ReactNode; enabled?: boolean }) {
  if (enabled === false) return;
  else return <tr>{children}</tr>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="text-warning">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return (
    <td>
      {COLON}
      {children}
    </td>
  );
}
