"use client";

import * as Data from "@/components/Data";
import * as Util from "@/components/Util";
import {
  BuffTable,
  type BuffTableItem,
  type BuffTableSource,
} from "@/components/BuffTable";
import Unit, { JsonBuff, type JsonUnit } from "@/components/Unit";
import type { ReactNode } from "react";
import styles from "./InBattleBuffTable.module.css";

const columnKeys = [
  "id",
  "name",
  "skillName",
  "target",
  "range",
  "initialTime",
  "duration",
  "cooldown",
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
  initialTime: "初動",
  duration: "効果時間",
  cooldown: "再動",
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
  return <BuffTable src={src} styles={styles} />;
}

function getItems(): readonly Item[] {
  const ret: Item[] = [];

  Unit.list.forEach((unit) => {
    const src = unit.src;
    const buffs = src.buffs;
    if (buffs === undefined || buffs.length === 0) return;

    buffs.forEach((buff, index) => {
      const getBuffValue = (type: BuffType) => buff.type === type && buff.value;
      const skill = getSkill(src, buff.skill);

      const id = src.parentId ?? src.id;
      const skillName = skill?.skillName;
      const target = buff.target;
      const range = target === Target.all ? target : getRange(unit, buff.skill);
      const initialTime = getDuration(
        skill?.cooldown !== undefined &&
          (skill.cooldown *
            Data.Rarity.getInitialTimeFactor(Data.Rarity.parse(src.rarity))) /
            10
      );
      const duration = getDuration(buff.duration ?? skill?.duration);
      const cooldown = getDuration(skill?.cooldown);
      const damageFactor = getDamageFactor(getBuffValue(BuffType.damageFactor));
      const redeployTimeCut = getPercent(
        getBuffValue(BuffType.redeployTimeCut)
      );
      const supplement = getSupplement(buff);

      const itemValue: ItemValue = {
        id,
        name: src.unitShortName,
        skillName,
        target,
        range,
        initialTime,
        duration,
        cooldown,
        damageFactor,
        redeployTimeCut,
        supplement,
      };

      ret.push({
        key: `${src.id}-${index}`,
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

function getDuration(
  value: number | string | undefined | false
): string | undefined {
  if (value === false) return;
  if (typeof value !== "number") return value;
  return value.toFixed(1);
}

function getSupplement(buff: JsonBuff): ReactNode {
  // TODO
  const texts: ReactNode[] = [];
  const add = (arg: ReactNode) => texts.push(arg);

  if (buff.require?.includes(JsonBuff.require.weapon)) {
    add(<span className="text-danger">武器効果</span>); // TODO
  }

  switch (buff.type) {
    case BuffType.freezeNullify:
      add("凍結無効化");
      break;
  }

  return <Util.JoinTexts texts={texts} />;
}
