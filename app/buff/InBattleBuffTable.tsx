"use client";

import {
  BuffTable,
  type BuffTableItem,
  type BuffTableSource,
} from "@/components/BuffTable";
import Unit from "@/components/Unit";
import type { ReactNode } from "react";

const columnKeys = [
  "id",
  "name",
  "skillName",
  "target",
  "condition",
  "redeployTimeCut",
] as const;
type ColumnKey = (typeof columnKeys)[number];

const columnName = {
  id: "#",
  name: "名前",
  skillName: "スキル",
  target: "対象",
  condition: "状態",
  redeployTimeCut: "再出撃短縮",
} as const satisfies Record<ColumnKey, string>;

const items = getItems();
type Item = BuffTableItem<ColumnKey>;
type ItemValue = Record<ColumnKey, ReactNode>;

export function InBattleBuffTable() {
  const src: BuffTableSource<ColumnKey> = {
    columnKeys,
    columnName,
    items,
  };
  return <BuffTable src={src} />;
}

function getItems(): readonly Item[] {
  const ret: Item[] = [];

  Unit.list.forEach((unit) => {
    const buffs = unit.src.buffs;
    if (buffs === undefined || buffs.length === 0) return;

    buffs.forEach((buff) => {
      const id = unit.src.parentId ?? unit.src.id;
      const target = buff.target;
      const condition = buff.condition;
      const redeployTimeCut = getPercent(
        buff.type === "redeploy-time-cut" && buff.value
      );

      const itemValue: ItemValue = {
        id,
        name: unit.src.unitShortName,
        skillName: "",
        target,
        condition,
        redeployTimeCut,
      };

      ret.push({
        key: unit.src.id,
        value: itemValue,
      });
    });
  });

  return ret;
}

function getPercent(value: number | undefined | false): string {
  if (value === undefined || value === false) return "";
  return `${value}%`;
}
