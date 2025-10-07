import * as Data from "./Data";
import Situation, { type JsonSituation } from "./Situation";
import * as Stat from "./Stat";
import { Filter, type Setting, type States } from "./States";
import { InBattleBuffUI } from "./UI/InBattleBuffUI";
import {
  TableSourceUtil,
  type TableRow,
  type TableSource,
} from "./UI/StatTableUtil";
import type { JsonBuff, JsonBuffValue } from "./Unit";
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
  stat.buffDamageCut,
  stat.buffCriChanceAdd,
  stat.buffCriDamageAdd,
  stat.buffDamageFactor,
  stat.buffDamageDebuff,
  stat.buffPhysicalDamageDebuff,
  stat.buffMagicalDamageDebuff,
  stat.buffAttackSpeed,
  stat.buffDelayMul,
  stat.buffAttackSpeedAgility,
  stat.buffPhysicalEvasion,
  stat.buffMagicalEvasion,
  stat.buffMoveSpeedAdd,
  stat.buffMoveSpeedMul,
  stat.buffRedeployTimeCut,
  stat.buffWithdrawCostReturn,
  stat.buffFieldChange,
  stat.buffFieldAdd,
  stat.buffFieldFactor,
  stat.buffPoisonImmune,
  stat.buffBlindImmune,
  stat.buffStanImmune,
  stat.buffPetrifyImmune,
  stat.buffFreezeImmune,
  stat.buffBurnImmune,
  stat.buffWeatherChange,
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
  static list = {
    hpMul: "hp-mul",
    attackMul: "attack-mul",
    defenseMul: "defense-mul",
    resistMul: "resist-mul",
    physicalDamageCut: "physical-damage-cut",
    magicalDamageCut: "magical-damage-cut",
    damageCut: "damage-cut",
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
    attackSpeedAgility: "attack-speed-agility-buff",
    physicalEvasion: "physical-evasion",
    magicalEvasion: "magical-evasion",
    moveSpeedAdd: "move-speed-add",
    moveSpeedMul: "move-speed-mul",
    redeployTimeCut: "redeploy-time-cut",
    withdrawCostReturn: "withdraw-cost-return",
    poisonInvalid: "poison-invalid",
    blindInvalid: "blind-invalid",
    stanInvalid: "stan-invalid",
    petrifyInvalid: "petrify-invalid",
    freezeInvalid: "freeze-invalid",
    burnInvalid: "burn-invalid",
    poisonResist: "poison-resist",
    blindResist: "blind-resist",
    stanResist: "stan-resist",
    petrifyResist: "petrify-resist",
    freezeResist: "freeze-resist",
    burnResist: "burn-resist",
    fieldBuffFactor: "field-buff-factor",
    fieldChange: "field-change",
    fieldBuffAdd: "field-buff-add",
    weatherChange: "weather-change",
  } as const;

  private static entries = Data.getEntries(this.list);
  static key = Data.Enum(Data.getKeys(this.list));

  static getKey(value: string): BuffTypeKey | undefined {
    return this.entries.find((kvp) => kvp[1] === value)?.[0];
  }

  static getKeyFromStatus(
    isInvalid: boolean,
    status: unknown
  ): BuffTypeKey | undefined {
    const name = Data.Status.names;
    if (isInvalid) {
      switch (status) {
        case name.poison:
          return this.key.poisonInvalid;
        case name.blind:
          return this.key.blindInvalid;
        case name.stan:
          return this.key.stanInvalid;
        case name.petrify:
          return this.key.petrifyInvalid;
        case name.freeze:
          return this.key.freezeInvalid;
        case name.burn:
          return this.key.burnInvalid;
      }
    } else {
      switch (status) {
        case name.poison:
          return this.key.poisonResist;
        case name.blind:
          return this.key.blindResist;
        case name.stan:
          return this.key.stanResist;
        case name.petrify:
          return this.key.petrifyResist;
        case name.freeze:
          return this.key.freezeResist;
        case name.burn:
          return this.key.burnResist;
      }
    }
  }

  static getKeyFromStatType(
    isInvalid: boolean,
    statType: Data.StatType
  ): BuffTypeKey | undefined {
    const status = Data.Status.getValueFromStatType(statType);
    return this.getKeyFromStatus(isInvalid, status);
  }
}
export type BuffTypeTag = (typeof BuffType.list)[BuffTypeKey];
type BuffTypeKey = keyof typeof BuffType.list;
const typeKey = BuffType.key;

const target = {
  all: "全体",
  inRange: "射程内",
  block: "ブロック敵",
  self: "自分",
  master: "付与対象",
  hit: "命中",
} as const;
export type BuffTargetTag = (typeof target)[keyof typeof target];

type EffectList = Partial<Record<BuffTypeKey, JsonEffect>>;
type Effect = JsonBuffValue;
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
  readonly skillName: Stat.SkillName;
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
  readonly buffDamageCut: Stat.Root;
  readonly buffCriChanceAdd: Stat.Root;
  readonly buffCriDamageAdd: Stat.Root;
  readonly buffDamageFactor: Stat.Root;
  readonly buffDamageDebuff: Stat.Root;
  readonly buffPhysicalDamageDebuff: Stat.Root;
  readonly buffMagicalDamageDebuff: Stat.Root;
  readonly buffAttackSpeed: Stat.Root;
  readonly buffDelayMul: Stat.Root;
  readonly buffAttackSpeedAgility: Stat.Root;
  readonly buffPhysicalEvasion: Stat.Root;
  readonly buffMagicalEvasion: Stat.Root;
  readonly buffMoveSpeedAdd: Stat.Root;
  readonly buffMoveSpeedMul: Stat.Root;
  readonly buffRedeployTimeCut: Stat.Root;
  readonly buffWithdrawCostReturn: Stat.Root;
  readonly buffFieldChange: Stat.Root<Data.Element | undefined>;
  readonly buffFieldAdd: Stat.Root<Data.Element | undefined>;
  readonly buffFieldFactor: Stat.Root;
  readonly buffPoisonImmune: Stat.Root;
  readonly buffBlindImmune: Stat.Root;
  readonly buffStanImmune: Stat.Root;
  readonly buffPetrifyImmune: Stat.Root;
  readonly buffFreezeImmune: Stat.Root;
  readonly buffBurnImmune: Stat.Root;
  readonly buffWeatherChange: Stat.Root<Data.Weather | undefined>;

  constructor(src: Source) {
    const { id, unit, buff } = src;
    this.id = id;
    this.unit = unit;
    this.rawBuff = buff;
    {
      let src: JsonSituation = { unitId: unit.id };
      if (buff.skill) {
        src = { ...src, skill: buff.skill };
      }
      if (buff.features) {
        src = { ...src, features: buff.features };
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

    this.skillName = this.situation.skillName;

    this.buffTarget = new Stat.Root({
      statType: stat.buffTarget,
      calculater: (s) => {
        return unit.isPotentialApplied(s)
          ? buff.potentialBonus?.target ?? buff.target
          : buff.target;
      },
      comparer: (s) => this.getTargetComparer(s),
    });

    this.buffRange = new Stat.BuffRange({
      statType: stat.buffRange,
      calculater: (s) => this.getRangeValue(s),
      factors: (s) => this.situation.range.getFactors(s),
      color: (s) => {
        const value = this.buffRange.getValue(s);
        const situationValue = this.situation.range.getValue(s);
        if (value === situationValue) {
          return this.situation.range.getColor(s);
        }
      },
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
        const rawValue = unit.isPotentialApplied(s)
          ? buff.potentialBonus?.duration ?? buff.duration
          : buff.duration;
        const inBattleBuff = parse(rawValue);
        const inBattleBuffAlways =
          !buff.skill || buff.skill === -1 ? Data.Duration.always : undefined;
        const factors: Data.DurationFactors = {
          ...this.situation.duration.getFactors(s),
          inBattleBuff: inBattleBuff ?? inBattleBuffAlways,
        };
        return Situation.calculateDurationResult(factors);
      },
    });

    this.cooldown = this.situation.cooldown;

    this.inBattleBuffSupplements = new Stat.Root({
      statType: stat.inBattleBuffSupplements,
      calculater: () => undefined,
      item: (s) =>
        InBattleBuffUI.getSupplement(buff, unit.isPotentialApplied(s)),
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

    const getDamageCut = (
      statType:
        | typeof stat.buffPhysicalDamageCut
        | typeof stat.buffMagicalDamageCut
        | typeof stat.buffDamageCut
    ) => {
      let key;
      switch (statType) {
        case stat.buffPhysicalDamageCut:
          key = typeKey.physicalDamageCut;
          break;
        case stat.buffMagicalDamageCut:
          key = typeKey.magicalDamageCut;
          break;
        case stat.buffDamageCut:
          key = typeKey.damageCut;
          break;
      }

      const ret: Stat.Root = new Stat.Root({
        statType,
        calculater: this.getEffectCalculaterFn(key),
        isReversed: true,
        text: (s) => this.getPercentText(ret.getValue(s)),
      });
      return ret;
    };
    this.buffPhysicalDamageCut = getDamageCut(stat.buffPhysicalDamageCut);
    this.buffMagicalDamageCut = getDamageCut(stat.buffMagicalDamageCut);
    this.buffDamageCut = getDamageCut(stat.buffDamageCut);

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
      text: (s) => this.getDelayPercentText(this.buffDelayMul.getValue(s)),
    });

    this.buffAttackSpeedAgility = new Stat.Root({
      statType: stat.buffAttackSpeedAgility,
      calculater: this.getEffectCalculaterFn(typeKey.attackSpeedAgility),
      isReversed: true,
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

    const getField = (isChange: boolean) => {
      const key = isChange ? typeKey.fieldChange : typeKey.fieldBuffAdd;
      const ret: Stat.Root<Data.Element | undefined> = new Stat.Root({
        statType: isChange ? stat.buffFieldChange : stat.buffFieldAdd,
        calculater: (s) => {
          const effect = this.getEffect(s, this.effectList[key]);
          return Data.Element.parse(effect?.element);
        },
        comparer: (s) => Data.Element.indexOf(ret.getValue(s)),
        color: (s) => Data.Element.colorOf(ret.getValue(s)),
      });
      return ret;
    };
    this.buffFieldChange = getField(true);
    this.buffFieldAdd = getField(false);

    this.buffFieldFactor = new Stat.Root({
      statType: stat.buffFieldFactor,
      calculater: this.getEffectCalculaterFn(typeKey.fieldBuffFactor),
      isReversed: true,
      text: (s) => this.getPercentText(this.buffFieldFactor.getValue(s)),
    });

    const getImmune = (
      statType:
        | typeof stat.buffPoisonImmune
        | typeof stat.buffBlindImmune
        | typeof stat.buffStanImmune
        | typeof stat.buffPetrifyImmune
        | typeof stat.buffFreezeImmune
        | typeof stat.buffBurnImmune
    ) => {
      const ret: Stat.Root = new Stat.Root({
        statType,
        calculater: (s) => {
          const invalidKey = BuffType.getKeyFromStatType(true, statType);
          if (invalidKey) {
            const effect = this.getEffect(s, this.effectList[invalidKey]);
            const status = effect !== undefined && effect.status !== false;
            if (status) {
              return Infinity;
            }
          }

          const resistKey = BuffType.getKeyFromStatType(false, statType);
          if (resistKey) {
            const effect = this.getEffect(s, this.effectList[resistKey]);
            const status = effect !== undefined && effect.status !== false;
            if (status) {
              return effect?.value;
            }
          }
        },
        isReversed: true,
        text: (s) => {
          const value = ret.getValue(s);
          if (value === Infinity) {
            return "無効";
          } else {
            return this.getPercentText(value);
          }
        },
      });
      return ret;
    };
    this.buffPoisonImmune = getImmune(stat.buffPoisonImmune);
    this.buffBlindImmune = getImmune(stat.buffBlindImmune);
    this.buffStanImmune = getImmune(stat.buffStanImmune);
    this.buffPetrifyImmune = getImmune(stat.buffPetrifyImmune);
    this.buffFreezeImmune = getImmune(stat.buffFreezeImmune);
    this.buffBurnImmune = getImmune(stat.buffBurnImmune);

    this.buffWeatherChange = new Stat.Root({
      statType: stat.buffWeatherChange,
      calculater: (s) => {
        const effect = this.getEffect(
          s,
          this.effectList[typeKey.weatherChange]
        );
        return Data.Weather.parse(effect?.weather);
      },
      comparer: (s) => Data.Weather.indexOf(this.buffWeatherChange.getValue(s)),
      color: (s) => Data.Weather.colorOf(this.buffWeatherChange.getValue(s)),
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

  private getDelayPercentText(value: number | undefined): string | undefined {
    if (value === undefined) {
      return;
    }
    return this.getPercentText(-value + 100);
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
      case target.hit:
        return -700;
      case target.master:
        return -600;
      case target.self:
        return -500;
    }
  }

  private getRangeValue(setting: Setting): number | undefined {
    const targetValue = this.buffTarget.getValue(setting);

    if (targetValue === undefined) {
      return;
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
    if (states.filter.get(Filter.filterBuffPageKey.filterDisabled)) {
      return list;
    } else {
      return list.filter((buff) => buff.unit.filterFn(states));
    }
  }

  protected static get list(): readonly InBattleBuff[] {
    return buffs;
  }

  static get tableData(): TableSource<Key> {
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
