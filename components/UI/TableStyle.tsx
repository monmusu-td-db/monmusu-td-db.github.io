import * as Data from "@/components/Data";
import { memo } from "react";
import type { TableHeader } from "./StatTableUtil";

const stat = Data.stat;

const TableStyle = memo(function TableStyle({
  headers,
  id,
}: {
  headers: readonly TableHeader<string>[];
  id: string;
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
      case stat.buffCost:
      case stat.buffHp:
      case stat.buffAttack:
      case stat.buffDefense:
      case stat.buffResist:
      case stat.buffHpMul:
      case stat.buffAttackMul:
      case stat.buffDefenseMul:
      case stat.buffResistMul:
      case stat.buffPhysicalDamageCut:
      case stat.buffMagicalDamageCut:
      case stat.buffCriChanceAdd:
      case stat.buffCriDamageAdd:
      case stat.buffDamageFactor:
      case stat.buffDamageDebuff:
      case stat.buffPhysicalDamageDebuff:
      case stat.buffMagicalDamageDebuff:
      case stat.buffAttackSpeed:
      case stat.buffDelayMul:
      case stat.buffPhysicalEvasion:
      case stat.buffMagicalEvasion:
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
      case stat.buffRange:
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
      case stat.buffCost:
      case stat.buffHp:
      case stat.buffAttack:
      case stat.buffDefense:
      case stat.buffResist:
      case stat.buffCriChance:
      case stat.buffCriChanceLimit:
      case stat.buffSupplements:
      case stat.inBattleBuffSupplements:
      case stat.buffHpMul:
      case stat.buffAttackMul:
      case stat.buffDefenseMul:
      case stat.buffResistMul:
      case stat.buffPhysicalDamageCut:
      case stat.buffMagicalDamageCut:
      case stat.buffCriChanceAdd:
      case stat.buffCriDamageAdd:
      case stat.buffDamageFactor:
      case stat.buffDamageDebuff:
      case stat.buffPhysicalDamageDebuff:
      case stat.buffMagicalDamageDebuff:
      case stat.buffAttackSpeed:
      case stat.buffDelayMul:
      case stat.buffPhysicalEvasion:
      case stat.buffMagicalEvasion:
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
      `#${id}.stat-table>tbody>tr>td:nth-child(${index + 1})`;
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
      href={"stat-table-" + id}
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

function isBorderEnabled(column: unknown): boolean {
  switch (column) {
    case stat.unitId:
    case stat.situationId:
    case stat.unitName:
    case stat.unitShortName:
    case stat.skillName:
    case stat.exSkill1:
    case stat.exSkill2:
      return true;
  }
  return false;
}

function isSortable(column: unknown): boolean {
  switch (column) {
    case stat.conditions:
    case stat.supplements:
    case stat.buffSupplements:
    case stat.inBattleBuffSupplements:
      return false;
  }
  return true;
}

export default Object.assign(TableStyle, {
  isBorderEnabled,
  isSortable,
});
