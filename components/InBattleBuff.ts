import * as Data from "./Data";
import Situation from "./Situation";
import * as Stat from "./Stat";
import type { Setting, States } from "./States";
import { InBattleBuffUI } from "./UI/InBattleBuffUI";
import {
  TableSourceUtil,
  type TableRow,
  type TableSource,
} from "./UI/StatTableUtil";
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
  stat.buffPhysicalDamageCut,
  stat.buffMagicalDamageCut,
  stat.buffCriChanceAdd,
  stat.buffCriDamageAdd,
  stat.buffDamageFactor,
  stat.buffDamageDebuff,
  stat.buffPhysicalDamageDebuff,
  stat.buffMagicalDamageDebuff,
  stat.buffAttackSpeed,
  stat.buffDelayMul,
  stat.buffPhysicalEvasion,
  stat.buffMagicalEvasion,
  stat.buffMoveSpeedAdd,
  stat.buffMoveSpeedMul,
  stat.buffRedeployTimeCut,
  stat.buffWithdrawCostReturn,
  stat.inBattleBuffSupplements,
] as const;
type Key = (typeof keys)[number];
export type InBattleBuffKey = Key;

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
    criChanceLimitAdd: "critical-chance-limit-add",
    criDamageLimitAdd: "critical-damage-limit-add",
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
const typeKey = BuffType.key;

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
  readonly inBattleBuffSupplements: Stat.Root<undefined>;
  readonly buffHpMul: Stat.Root;
  readonly buffAttackMul: Stat.Root;
  readonly buffDefenseMul: Stat.Root;
  readonly buffResistMul: Stat.Root;
  readonly buffPhysicalDamageCut: Stat.Root;
  readonly buffMagicalDamageCut: Stat.Root;
  readonly buffCriChanceAdd: Stat.Root;
  readonly buffCriDamageAdd: Stat.Root;
  readonly buffDamageFactor: Stat.Root;
  readonly buffDamageDebuff: Stat.Root;
  readonly buffPhysicalDamageDebuff: Stat.Root;
  readonly buffMagicalDamageDebuff: Stat.Root;
  readonly buffAttackSpeed: Stat.Root;
  readonly buffDelayMul: Stat.Root;
  readonly buffPhysicalEvasion: Stat.Root;
  readonly buffMagicalEvasion: Stat.Root;
  readonly buffMoveSpeedAdd: Stat.Root;
  readonly buffMoveSpeedMul: Stat.Root;
  readonly buffRedeployTimeCut: Stat.Root;
  readonly buffWithdrawCostReturn: Stat.Root;

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

    this.inBattleBuffSupplements = new Stat.Root({
      statType: stat.inBattleBuffSupplements,
      calculater: () => undefined,
      item: () => InBattleBuffUI.getSupplement(buff),
    });

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
          effectKey = typeKey.hpMul;
          break;
        case stat.buffAttackMul:
          effectKey = typeKey.attackMul;
          break;
        case stat.buffDefenseMul:
          effectKey = typeKey.defenseMul;
          break;
        case stat.buffResistMul:
          effectKey = typeKey.resistMul;
          break;
      }

      const ret: Stat.Root = new Stat.Root({
        statType,
        calculater: this.getEffectCalculaterFn(effectKey),
        isReversed: true,
        text: (s) => this.getMulPercentText(ret.getValue(s)),
      });

      return ret;
    };
    this.buffHpMul = getBuffMul(stat.buffHpMul);
    this.buffAttackMul = getBuffMul(stat.buffAttackMul);
    this.buffDefenseMul = getBuffMul(stat.buffDefenseMul);
    this.buffResistMul = getBuffMul(stat.buffResistMul);

    const getDamageCut = (isPhysical: boolean) => {
      const key = isPhysical
        ? typeKey.physicalDamageCut
        : typeKey.magicalDamageCut;

      const ret: Stat.Root = new Stat.Root({
        statType: isPhysical
          ? stat.buffPhysicalDamageCut
          : stat.buffMagicalDamageCut,
        calculater: this.getEffectCalculaterFn(key),
        isReversed: true,
        text: (s) => this.getPercentText(ret.getValue(s)),
      });
      return ret;
    };
    this.buffPhysicalDamageCut = getDamageCut(true);
    this.buffMagicalDamageCut = getDamageCut(false);

    const getCriticalAdd = (isChance: boolean) => {
      const key = isChance ? typeKey.criChanceAdd : typeKey.criDamageAdd;
      const limitKey = isChance
        ? typeKey.criChanceLimitAdd
        : typeKey.criDamageLimitAdd;

      const ret: Stat.Root = new Stat.Root({
        statType: isChance ? stat.buffCriChanceAdd : stat.buffCriDamageAdd,
        calculater: this.getEffectCalculaterFn(key),
        isReversed: true,
        text: (s) => this.getPercentText(ret.getValue(s)),
        item: (s) => {
          const limitEffect = this.getEffect(s, this.effectList[limitKey]);
          const limitText = this.getPercentText(limitEffect?.value);
          return InBattleBuffUI.getCritical(ret.getText(s), limitText);
        },
      });
      return ret;
    };
    this.buffCriChanceAdd = getCriticalAdd(true);
    this.buffCriDamageAdd = getCriticalAdd(false);

    this.buffDamageFactor = new Stat.Root({
      statType: stat.buffDamageFactor,
      calculater: this.getEffectCalculaterFn(typeKey.damageFactor),
      isReversed: true,
      text: (s) => this.getMulPercentText(this.buffDamageFactor.getValue(s)),
    });

    const getDamageDebuff = (
      statType:
        | typeof stat.buffDamageDebuff
        | typeof stat.buffPhysicalDamageDebuff
        | typeof stat.buffMagicalDamageDebuff
    ) => {
      let key;
      switch (statType) {
        case stat.buffDamageDebuff:
          key = typeKey.damageDebuff;
          break;
        case stat.buffPhysicalDamageDebuff:
          key = typeKey.physicalDamageDebuff;
          break;
        case stat.buffMagicalDamageDebuff:
          key = typeKey.magicalDamageDebuff;
          break;
      }

      const ret: Stat.Root = new Stat.Root({
        statType,
        calculater: this.getEffectCalculaterFn(key),
        isReversed: true,
        text: (s) => this.getMulPercentText(ret.getValue(s)),
      });
      return ret;
    };
    this.buffDamageDebuff = getDamageDebuff(stat.buffDamageDebuff);
    this.buffPhysicalDamageDebuff = getDamageDebuff(
      stat.buffPhysicalDamageDebuff
    );
    this.buffMagicalDamageDebuff = getDamageDebuff(
      stat.buffMagicalDamageDebuff
    );

    this.buffAttackSpeed = new Stat.Root({
      statType: stat.buffAttackSpeed,
      calculater: this.getEffectCalculaterFn(typeKey.attackSpeedBuff),
      isReversed: true,
      text: (s) => this.getMulPercentText(this.buffAttackSpeed.getValue(s)),
    });

    this.buffDelayMul = new Stat.Root({
      statType: stat.buffDelayMul,
      calculater: this.getEffectCalculaterFn(typeKey.delayMul),
      text: (s) => this.getMulPercentText(this.buffDelayMul.getValue(s)),
    });

    const getEvasion = (isPhysical: boolean) => {
      const key = isPhysical ? typeKey.physicalEvasion : typeKey.magicalEvasion;

      const ret: Stat.Root = new Stat.Root({
        statType: isPhysical
          ? stat.buffPhysicalEvasion
          : stat.buffMagicalEvasion,
        calculater: this.getEffectCalculaterFn(key),
        isReversed: true,
        text: (s) => this.getPercentText(ret.getValue(s)),
      });
      return ret;
    };
    this.buffPhysicalEvasion = getEvasion(true);
    this.buffMagicalEvasion = getEvasion(false);

    this.buffMoveSpeedAdd = new Stat.Root({
      statType: stat.buffMoveSpeedAdd,
      calculater: this.getEffectCalculaterFn(typeKey.moveSpeedAdd),
      isReversed: true,
    });

    this.buffMoveSpeedMul = new Stat.Root({
      statType: stat.buffMoveSpeedMul,
      calculater: this.getEffectCalculaterFn(typeKey.moveSpeedMul),
      isReversed: true,
      text: (s) => this.getMulPercentText(this.buffMoveSpeedMul.getValue(s)),
    });

    this.buffRedeployTimeCut = new Stat.Root({
      statType: stat.buffRedeployTimeCut,
      calculater: this.getEffectCalculaterFn(typeKey.redeployTimeCut),
      isReversed: true,
      text: (s) => this.getPercentText(this.buffRedeployTimeCut.getValue(s)),
    });

    this.buffWithdrawCostReturn = new Stat.Root({
      statType: stat.buffWithdrawCostReturn,
      calculater: this.getEffectCalculaterFn(typeKey.withdrawCostReturn),
      isReversed: true,
      text: (s) => this.getPercentText(this.buffWithdrawCostReturn.getValue(s)),
    });
  }

  private getEffectCalculaterFn(effectKey: keyof EffectList) {
    return (setting: Setting) => {
      const effect = this.getEffect(setting, this.effectList[effectKey]);
      return effect?.value;
    };
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
    return value + "%";
  }

  private getMulPercentText(value: number | undefined): string | undefined {
    if (value === undefined) {
      return;
    }
    return this.getPercentText(value - 100);
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

  protected static filter(
    states: States,
    list: readonly InBattleBuff[]
  ): readonly InBattleBuff[] {
    return list.filter((buff) => buff.unit.filterFn(states));
  }

  protected static get list(): readonly InBattleBuff[] {
    return buffs;
  }

  public static get tableData(): TableSource<Key> {
    return {
      headers: Data.StatType.getHeaders(keys),
      filter: (states) => this.filter(states, buffs),
      sort: TableSourceUtil.getSortFn(),
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
