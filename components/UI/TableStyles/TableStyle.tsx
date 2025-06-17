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

  const getSelector = (
    index: number | readonly number[],
    end: string = ""
  ): string => {
    const fn = (index: number) =>
      `.stat-table>tbody>tr>td:nth-child(${index + 1})`;
    let ret: string;
    if (typeof index === "number") {
      ret = index === -1 ? "" : fn(index) + end;
    } else {
      ret = index
        .filter((i) => i !== -1)
        .map((i) => fn(i) + end)
        .join();
    }
    return ret;
  };
  const getStyle = (selector: string, props: string) => {
    if (selector.length === 0) {
      return "";
    } else {
      return `${selector}{${props}}`;
    }
  };
  const getIndex = (statType: string) =>
    headers.findIndex((col) => col.id === statType);
  const supSelector = getSelector(getIndex(stat.supplements), ">span");

  return (
    <style
      precedence="medium"
      href="stat-table"
      dangerouslySetInnerHTML={{
        __html:
          getStyle(getSelector(end), "text-align:end;") +
          getStyle(getSelector(center), "text-align:center;") +
          getStyle(getSelector(empty, ":empty::before"), 'content:"-";') +
          getStyle(supSelector, "white-space:nowrap;font-size:0.75rem;"),
        // getStyle(supSelector, "font-size:0.75rem;") +
        // `@media(min-width:992px){${getStyle(
        //   supSelector,
        //   "white-space:nowrap;"
        // )}}`,
      }}
    />
  );
});
