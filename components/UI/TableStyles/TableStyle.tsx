import { stat } from "@/components/Data";
import { memo } from "react";
import type { TableHeader } from "../StatTable";

export const TableStyle = memo(function TableStyle({
  headers,
}: {
  headers: readonly TableHeader<string>[];
}) {
  const end: number[] = [];
  const center: number[] = [];
  headers.forEach((col, index) => {
    switch (col.id) {
      case stat.cost:
      case stat.hp:
      case stat.attack:
      case stat.defense:
      case stat.resist:
      case stat.physicalLimit:
      case stat.magicalLimit:
      case stat.initialTime:
      case stat.duration:
      case stat.cooldown:
      case stat.dps0:
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        end.push(index);
        break;
      case stat.rarity:
      case stat.element:
      case stat.species:
      case stat.attackSpeed:
      case stat.delay:
      case stat.interval:
      case stat.block:
      case stat.target:
      case stat.range:
      case stat.moveSpeed:
      case stat.moveType:
      case stat.damageType:
      case stat.placement:
        center.push(index);
        break;
    }
  });

  const empty: number[] = [];
  headers.forEach((col, index) => {
    switch (col.id) {
      case stat.skillName:
      case stat.conditions:
      case stat.supplements:
      case stat.damageType:
      case stat.dps0:
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        break;
      default:
        empty.push(index);
        break;
    }
  });

  const getSelector = (index: number) =>
    `.stat-table>tbody>tr>td:nth-child(${index + 1})`;

  return (
    <style
      precedence="medium"
      href="stat-table"
      dangerouslySetInnerHTML={{
        __html:
          `${end.map(getSelector).join()}{text-align:end;}` +
          `${center.map(getSelector).join()}{text-align:center;}` +
          `${empty
            .map((i) => getSelector(i) + ":empty::before")
            .join()}{content:"-";}`,
      }}
    />
  );
});
