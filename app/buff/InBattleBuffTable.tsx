"use client";

import * as Data from "@/components/Data";
import * as Util from "@/components/Util";
import {
  BuffTable,
  type BuffTableItem,
  type BuffTableSource,
} from "@/components/BuffTable";
import Unit, { type JsonBuff, type JsonUnit } from "@/components/Unit";
import type { ReactNode } from "react";
import styles from "./InBattleBuffTable.module.css";
import { FeatureRequire } from "@/components/Feature";

const columnKeys = [
  "id",
  "name",
  "skillName",
  "target",
  "range",
  "initialTime",
  "duration",
  "cooldown",
  "hpMul",
  "attackMul",
  "defenseMul",
  "resistMul",
  "criChanceAdd",
  "criDamageAdd",
  "damageFactor",
  "damageDebuff",
  "physicalDamageDebuff",
  "magicalDamageDebuff",
  "physicalEvasion",
  "magicalEvasion",
  "moveSpeedAdd",
  "redeployTimeCut",
  "withdrawCostReturn",
  "fieldChange",
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
  hpMul: "HP乗算",
  attackMul: "攻撃乗算",
  defenseMul: "物防乗算",
  resistMul: "魔防乗算",
  damageFactor: "ダメージ倍率",
  damageDebuff: "敵被ダメージ増加",
  criChanceAdd: "クリティカル率増加",
  criDamageAdd: "クリティカルダメージ増加",
  physicalDamageDebuff: "敵物理被ダメージ増加",
  magicalDamageDebuff: "敵魔法被ダメージ増加",
  physicalEvasion: "物理回避付与",
  magicalEvasion: "魔法回避付与",
  moveSpeedAdd: "移動速度加算",
  redeployTimeCut: "再出撃短縮",
  withdrawCostReturn: "撤退時コスト回復量",
  fieldChange: "マス属性変化",
  supplement: "補足",
} as const satisfies Record<ColumnKey, string>;

const BuffType = {
  hpMul: "hp-mul",
  attackMul: "attack-mul",
  defenseMul: "defense-mul",
  resistMul: "resist-mul",
  damageFactor: "damage-factor",
  damageDebuff: "damage-debuff",
  physicalDamageDebuff: "physical-damage-debuff",
  magicalDamageDebuff: "magical-damage-debuff",
  criChanceAdd: "critical-chance-add",
  criDamageAdd: "critical-damage-add",
  physicalEvasion: "physical-evasion",
  magicalEvasion: "magical-evasion",
  moveSpeedAdd: "move-speed-add",
  redeployTimeCut: "redeploy-time-cut",
  withdrawCostReturn: "withdraw-cost-return",
  freezeNullify: "freeze-nullify",
  blindResist: "blind-resist",
  stanResist: "stan-resist",
  petrifyResist: "petrify-resist",
  freezeResist: "freeze-resist",
  fieldChangeFire: "field-change-fire",
  fieldChangeWater: "field-change-water",
  fieldChangeWind: "field-change-wind",
  fieldChangeEarth: "field-change-earth",
  fieldChangeLight: "field-change-light",
  fieldChangeDark: "field-change-dark",
} as const;
type BuffType = (typeof BuffType)[keyof typeof BuffType];

const Target = {
  all: "全体",
  inRange: "射程内",
  block: "ブロック",
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
      const fn = (type: BuffType) =>
        buff.type === type ? buff.value : undefined;
      const skill = getSkill(src, buff.skill);

      const id = src.parentId ?? src.id;
      const skillName = skill?.skillName;
      const target = buff.target;
      const range = getRange(target, unit, buff.skill);
      const initialTime = getDuration(
        skill?.cooldown !== undefined &&
          (skill.cooldown *
            Data.Rarity.getInitialTimeFactor(Data.Rarity.parse(src.rarity))) /
            10
      );
      const duration = getDuration(buff.duration ?? skill?.duration);
      const cooldown = getDuration(skill?.cooldown);
      const hpMul = getMulFactor(fn(BuffType.hpMul));
      const attackMul = getMulFactor(fn(BuffType.attackMul));
      const defenseMul = getMulFactor(fn(BuffType.defenseMul));
      const resistMul = getMulFactor(fn(BuffType.resistMul));
      const damageFactor = getDamageFactor(fn(BuffType.damageFactor));
      const damageDebuff = getMulFactor(fn(BuffType.damageDebuff));
      const criChanceAdd = getPercent(fn(BuffType.criChanceAdd));
      const criDamageAdd = getPercent(fn(BuffType.criDamageAdd));
      const physicalDamageDebuff = getMulFactor(
        fn(BuffType.physicalDamageDebuff)
      );
      const magicalDamageDebuff = getMulFactor(
        fn(BuffType.magicalDamageDebuff)
      );
      const physicalEvasion = getPercent(fn(BuffType.physicalEvasion));
      const magicalEvasion = getPercent(fn(BuffType.magicalEvasion));
      const moveSpeedAdd = fn(BuffType.moveSpeedAdd);
      const redeployTimeCut = getPercent(fn(BuffType.redeployTimeCut));
      const withdrawCostReturn = getPercent(fn(BuffType.withdrawCostReturn));
      const fieldChange = getFieldChange(buff);
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
        hpMul,
        attackMul,
        defenseMul,
        resistMul,
        damageFactor,
        damageDebuff,
        criChanceAdd,
        criDamageAdd,
        physicalDamageDebuff,
        magicalDamageDebuff,
        physicalEvasion,
        magicalEvasion,
        moveSpeedAdd,
        redeployTimeCut,
        withdrawCostReturn,
        fieldChange,
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

function getRange(
  target: string | undefined,
  unit: Unit,
  skillId: number | undefined
): string | number | undefined {
  const regex = new RegExp(`${Target.inRange}|${Target.block}`);
  if (target === undefined) return;

  if (!regex.test(target)) {
    return Target.all;
  }

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

function getMulFactor(value: number | undefined): ReactNode {
  if (value === undefined) return;
  return getPercent(value - 100);
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

function getFieldChange(buff: JsonBuff): ReactNode {
  const name = (() => {
    const n = Data.Element.name;
    switch (buff.type) {
      case BuffType.fieldChangeFire:
        return n.fire;
      case BuffType.fieldChangeWater:
        return n.water;
      case BuffType.fieldChangeWind:
        return n.wind;
      case BuffType.fieldChangeEarth:
        return n.earth;
      case BuffType.fieldChangeLight:
        return n.light;
      case BuffType.fieldChangeDark:
        return n.dark;
      default:
        return;
    }
  })();
  if (name === undefined) {
    return;
  } else {
    return <span className={Data.Element.textColorOf(name)}>{name}</span>;
  }
}

function getSupplement(buff: JsonBuff): ReactNode {
  // TODO
  const texts: ReactNode[] = [];
  const add = (arg: ReactNode) => texts.push(arg);

  buff.require?.forEach((str) => {
    let text;
    switch (str) {
      case FeatureRequire.weapon:
        text = "武器効果";
        break;
      case FeatureRequire.fire:
      case FeatureRequire.water:
      case FeatureRequire.earth:
      case FeatureRequire.wind:
      case FeatureRequire.light:
      case FeatureRequire.dark:
        text = str + "配置時";
        break;
      default:
        text = str;
        break;
    }
    add(<span className="text-danger">{text}</span>); // TODO
  });

  buff.supplements?.forEach((text) => add(text));

  switch (buff.type) {
    case BuffType.freezeNullify:
      add("凍結無効化");
      break;
    case BuffType.blindResist:
      add("暗闇耐性+" + buff.value);
      break;
    case BuffType.stanResist:
      add("スタン耐性+" + buff.value);
      break;
    case BuffType.petrifyResist:
      add("石化耐性+" + buff.value);
      break;
    case BuffType.freezeResist:
      add("凍結耐性+" + buff.value);
      break;
  }

  return <Util.JoinTexts texts={texts} />;
}
