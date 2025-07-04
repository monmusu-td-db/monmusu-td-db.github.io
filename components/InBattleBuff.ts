import * as Data from "./Data";
import Situation from "./Situation";
import * as Stat from "./Stat";
import type { Setting, States } from "./States";
import type { TableRow, TableSource } from "./UI/StatTable";
import type { JsonBuff } from "./Unit";
import Unit from "./Unit";

const stat = Data.stat;

const keys = [
  stat.unitId,
  stat.unitShortName,
  stat.skillName,
  stat.buffTarget,
  stat.buffRange,
  stat.initialTime,
  stat.duration,
  stat.cooldown,
  stat.buffHpMul,
  stat.buffAttackMul,
  stat.buffDefenseMul,
  stat.buffResistMul,
] as const;
type Key = (typeof keys)[number];

interface Source {
  readonly id: number;
  readonly unit: Unit;
  readonly buff: JsonBuff;
}

class BuffType {
  public static list = {
    hpMul: "hp-mul",
    attackMul: "attack-mul",
    defenseMul: "defense-mul",
    resistMul: "resist-mul",
    physicalDamageCut: "physical-damage-cut",
    magicalDamageCut: "magical-damage-cut",
    damageFactor: "damage-factor",
    damageDebuff: "damage-debuff",
    physicalDamageDebuff: "physical-damage-debuff",
    magicalDamageDebuff: "magical-damage-debuff",
    criChanceAdd: "critical-chance-add",
    criDamageAdd: "critical-damage-add",
    attackSpeedBuff: "attack-speed-buff",
    delayMul: "delay-mul",
    physicalEvasion: "physical-evasion",
    magicalEvasion: "magical-evasion",
    moveSpeedAdd: "move-speed-add",
    moveSpeedMul: "move-speed-mul",
    redeployTimeCut: "redeploy-time-cut",
    withdrawCostReturn: "withdraw-cost-return",
    poisonNullify: "poison-nullify",
    blindNullify: "blind-nullify",
    stanNullify: "stan-nullify",
    petrifyNullify: "petrify-nullify",
    freezeNullify: "freeze-nullify",
    poisonResist: "poison-resist",
    blindResist: "blind-resist",
    stanResist: "stan-resist",
    petrifyResist: "petrify-resist",
    freezeResist: "freeze-resist",
    fieldBuffFactor: "field-buff-factor",
    fieldChangeFire: "field-change-fire",
    fieldChangeWater: "field-change-water",
    fieldChangeWind: "field-change-wind",
    fieldChangeEarth: "field-change-earth",
    fieldChangeLight: "field-change-light",
    fieldChangeDark: "field-change-dark",
    fieldBuffAddFire: "field-buff-add-fire",
    fieldBuffAddWater: "field-buff-add-water",
    fieldBuffAddWind: "field-buff-add-wind",
    fieldBuffAddEarth: "field-buff-add-earth",
    fieldBuffAddLight: "field-buff-add-light",
    fieldBuffAddDark: "field-buff-add-dark",
  } as const;

  private static entries = Data.getEntries(this.list);
  public static key = Data.Enum(Data.getKeys(this.list));

  public static getKey(value: string): BuffTypeKey | undefined {
    return this.entries.find((kvp) => kvp[1] === value)?.[0];
  }
}
type BuffTypeKey = keyof typeof BuffType.list;

const target = {
  all: "全体",
  inRange: "射程内",
  block: "ブロック敵",
  self: "自分",
  master: "付与対象",
} as const;

type EffectList = Partial<Record<BuffTypeKey, JsonEffect>>;
interface Effect {
  value?: number;
}
interface JsonEffect extends Effect {
  potentialBonus?: Omit<JsonEffect, "potentialBonus">;
}

export default class InBattleBuff implements TableRow<Key> {
  readonly id: number;
  private readonly unit: Unit;
  private readonly rawBuff: JsonBuff;
  private readonly situation: Situation;
  private readonly effectList: Readonly<EffectList>;

  readonly unitId: Stat.Root<number | undefined>;
  readonly unitShortName: Stat.UnitName;
  readonly skillName: Stat.Root<string | undefined>;
  readonly buffTarget: Stat.Root<string | undefined>;
  readonly buffRange: Stat.BuffRange;
  readonly initialTime: Stat.Root;
  readonly duration: Stat.Root<number | undefined, Data.DurationFactorsResult>;
  readonly cooldown: Stat.Root<number | undefined, Data.CooldownFactors>;
  readonly buffHpMul: Stat.Root;
  readonly buffAttackMul: Stat.Root;
  readonly buffDefenseMul: Stat.Root;
  readonly buffResistMul: Stat.Root;

  constructor(src: Source) {
    const { id, unit, buff } = src;
    this.id = id;
    this.unit = unit;
    this.rawBuff = buff;
    {
      let src;
      if (!buff.skill) {
        src = { unitId: unit.id };
      } else {
        src = { unitId: unit.id, skill: buff.skill };
      }
      this.situation = new Situation(src, id);
    }

    {
      const list: EffectList = {};
      if ("type" in buff) {
        const key = BuffType.getKey(buff.type);
        if (key) {
          list[key] = buff;
        }
      } else {
        buff.effects.forEach((effect) => {
          const key = BuffType.getKey(effect.type);
          if (key) {
            list[key] = effect;
          }
        });
      }
      this.effectList = list;
    }

    this.unitId = unit.unitId;
    this.unitShortName = unit.unitShortName;

    this.skillName = new Stat.Root({
      statType: stat.skillName,
      calculater: (s) => {
        switch (buff.skill) {
          case 1:
            return unit.exSkill1.getValue(s)?.skillName;
          case 2:
            return unit.exSkill2.getValue(s)?.skillName;
        }
        return;
      },
    });

    this.buffTarget = new Stat.Root({
      statType: stat.buffTarget,
      calculater: () => buff.target,
      comparer: (s) => this.getTargetComparer(s),
    });

    this.buffRange = new Stat.BuffRange({
      statType: stat.buffRange,
      calculater: (s) => this.getRangeValue(s),
      factors: (s) => this.situation.range.getFactors(s),
      isReversed: true,
    });

    this.initialTime = this.situation.initialTime;

    this.duration = new Stat.Root({
      statType: stat.duration,
      calculater: (s) => this.duration.getFactors(s).result,
      isReversed: true,
      text: (s) => Situation.getDurationText(this.duration.getFactors(s)),
      color: (s) => Situation.getDurationColor(this.duration.getFactors(s)),
      factors: (s) => {
        function parse(
          value: unknown
        ): number | typeof Data.Duration.always | undefined {
          if (typeof value === "number" || value === Data.Duration.always) {
            return value;
          }
        }
        const inBattleBuff = parse(buff.duration);
        const factors: Data.DurationFactors = {
          ...this.situation.duration.getFactors(s),
          inBattleBuff,
        };
        return Situation.calculateDurationResult(factors);
      },
    });

    this.cooldown = this.situation.cooldown;

    const getBuffMul = (
      statType:
        | typeof stat.buffHpMul
        | typeof stat.buffAttackMul
        | typeof stat.buffDefenseMul
        | typeof stat.buffResistMul
    ) => {
      let effectKey;
      switch (statType) {
        case stat.buffHpMul:
          effectKey = BuffType.key.hpMul;
          break;
        case stat.buffAttackMul:
          effectKey = BuffType.key.attackMul;
          break;
        case stat.buffDefenseMul:
          effectKey = BuffType.key.defenseMul;
          break;
        case stat.buffResistMul:
          effectKey = BuffType.key.resistMul;
          break;
      }

      const ret: Stat.Root = new Stat.Root({
        statType,
        calculater: (s) => {
          const effect = this.getEffect(s, this.effectList[effectKey]);
          return effect?.value;
        },
        isReversed: true,
        text: (s) => this.getPercentText(ret.getValue(s)),
      });

      return ret;
    };

    this.buffHpMul = getBuffMul(stat.buffHpMul);
    this.buffAttackMul = getBuffMul(stat.buffAttackMul);
    this.buffDefenseMul = getBuffMul(stat.buffDefenseMul);
    this.buffResistMul = getBuffMul(stat.buffResistMul);
  }

  private getEffect(
    setting: Setting,
    rawEffect: JsonEffect | undefined
  ): Effect | undefined {
    if (!rawEffect) {
      return;
    }
    if (this.unit.isPotentialApplied(setting)) {
      return {
        ...rawEffect,
        ...rawEffect.potentialBonus,
      };
    } else {
      return rawEffect;
    }
  }

  private getPercentText(value: number | undefined): string | undefined {
    if (value === undefined) {
      return;
    }
    return value - 100 + "%";
  }

  private getTargetComparer(setting: Setting): number | undefined {
    const str = this.buffTarget.getValue(setting);
    switch (str) {
      case target.all:
        return -1000;
      case target.inRange:
        return -900;
      case target.block:
        return -800;
      case target.master:
        return -700;
      case target.self:
        return -600;
    }
  }

  private getRangeValue(setting: Setting): number | undefined {
    const rawValue = this.rawBuff.range;
    const targetValue = this.buffTarget.getValue(setting);

    if (rawValue === null && targetValue === undefined) {
      return;
    }
    if (typeof rawValue === "number") {
      return rawValue;
    }
    switch (targetValue) {
      case target.self:
      case target.master:
        return;
      case target.all:
        return Infinity;
    }

    return this.situation.range.getValue(setting);
  }

  private static filter(states: States, list: readonly InBattleBuff[]) {
    return list.filter((buff) => buff.unit.filterFn(states));
  }

  public static get tableData(): TableSource<Key> {
    return {
      headers: Data.StatType.getHeaders(keys),
      filter: (states) => this.filter(states, buffs),
      sort: (setting, rows, column, isReversed) => {
        return Data.mapSort(
          rows,
          (target) => target[column].getSortOrder(setting),
          isReversed
        );
      },
    } as const;
  }
}

const buffs: readonly InBattleBuff[] = (() => {
  const ret: InBattleBuff[] = [];
  let index = 0;

  Unit.list.forEach((unit) => {
    unit.buffs?.forEach((buff) => {
      ret.push(
        new InBattleBuff({
          id: index++,
          unit,
          buff,
        })
      );
    });
  });

  return ret;
})();
