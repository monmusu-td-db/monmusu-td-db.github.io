"use client";

import * as Data from "@/components/Data";
import {
  BuffTable,
  type BuffTableItem,
  type BuffTableSource,
} from "@/components/BuffTable";
import Unit, { type JsonUnit } from "@/components/Unit";
import type { ReactNode } from "react";

const columnKeys = [
  "id",
  "name",
  "skillName",
  "target",
  "range",
  "duration",
  "damageFactor",
  "redeployTimeCut",
  "supplement",
] as const;
type ColumnKey = (typeof columnKeys)[number];

const columnName = {
  id: "#",
  name: "名前",
  skillName: "スキル",
  target: "対象",
  range: "射程",
  duration: "持続時間",
  damageFactor: "ダメージ倍率",
  redeployTimeCut: "再出撃短縮",
  supplement: "補足",
} as const satisfies Record<ColumnKey, string>;

const BuffType = {
  damageFactor: "damage-factor",
  redeployTimeCut: "redeploy-time-cut",
  freezeNullify: "freeze-nullify",
} as const;
type BuffType = (typeof BuffType)[keyof typeof BuffType];

const Target = {
  all: "全体",
} as const;
type Target = (typeof Target)[keyof typeof Target];

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
    const src = unit.src;
    const buffs = src.buffs;
    if (buffs === undefined || buffs.length === 0) return;

    buffs.forEach((buff) => {
      const getBuffValue = (type: BuffType) => buff.type === type && buff.value;
      const skill = getSkill(src, buff.skill);

      const id = src.parentId ?? src.id;
      const skillName = skill?.skillName;
      const target = buff.target;
      const range = target === Target.all ? target : getRange(unit, buff.skill);
      const duration = getDuration(buff.duration ?? skill?.duration);
      const damageFactor = getDamageFactor(getBuffValue(BuffType.damageFactor));
      const redeployTimeCut = getPercent(
        getBuffValue(BuffType.redeployTimeCut)
      );
      const supplement = getSupplement(buff.type);

      const itemValue: ItemValue = {
        id,
        name: src.unitShortName,
        skillName,
        target,
        range,
        duration,
        damageFactor,
        redeployTimeCut,
        supplement,
      };

      ret.push({
        key: src.id,
        value: itemValue,
      });
    });
  });

  return ret;
}

function getSkill(
  src: Readonly<JsonUnit>,
  skillId: number | undefined
): Data.JsonSkill | undefined {
  switch (skillId) {
    case 1:
      return src.exSkill1;
    case 2:
      return src.exSkill2;
  }
}

function getRange(unit: Unit, skillId: number | undefined): number | undefined {
  const src = unit.src;
  const skill = getSkill(src, skillId);
  if (skill?.range !== undefined) return skill.range;
  if (unit.rangeBase === undefined) return;
  return Data.Percent.multiply(
    unit.rangeBase + (src.rangeAdd ?? 0),
    skill?.rangeMul
  );
}

function getPercent(value: number | undefined | false): string | undefined {
  if (value === undefined || value === false) return;
  return `${value}%`;
}

function getDamageFactor(value: number | undefined | false): ReactNode {
  if (value === undefined || value === false) return;
  return (value / 100).toFixed(2);
}

function getDuration(value: number | string | undefined): string | undefined {
  if (typeof value !== "number") return value;
  return `${value}秒`;
}

function getSupplement(type: string): string | undefined {
  // TODO
  switch (type) {
    case BuffType.freezeNullify:
      return "凍結無効化";
  }
}
