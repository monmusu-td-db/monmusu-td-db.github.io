import * as Data from "./Data";
import jsonCommonFeatures from "@/assets/feature.json";

const stat = Data.stat;

// Values

const require = {
  weapon: "武器",
  fire: "火マス",
  water: "水マス",
  earth: "地マス",
  wind: "風マス",
  light: "光マス",
  dark: "闇マス",
  skill: "スキル",
} as const;
type Require = (typeof require)[keyof typeof require];
const Require = {
  ...require,

  list: Object.values(require),

  isElementApplied(
    requirements: ReadonlySet<Require> | undefined,
    fieldElements: ReadonlySet<Data.Element>
  ): boolean {
    if (requirements === undefined) return true;
    const element = Data.Element.name;
    for (const k of Data.Element.list) {
      if (requirements.has(require[k]) && !fieldElements.has(element[k]))
        return false;
    }
    return true;
  },

  isElementExcluded(
    excludeList: ReadonlySet<Require> | undefined,
    fieldElements: ReadonlySet<Data.Element>
  ): boolean {
    if (excludeList === undefined) return false;
    const element = Data.Element.name;
    for (const k of Data.Element.list) {
      if (excludeList.has(require[k]) && fieldElements.has(element[k]))
        return true;
    }
    return false;
  },
} as const;
export type FeatureRequire = Require;
export const FeatureRequire = Require;

const additionFactorKeys = {
  HP: stat.hp,
  ATTACK: stat.attack,
  DEFENSE: stat.defense,
  RESIST: stat.resist,
  MOVE_SPEED: "move-speed",
  CURRENT_HP: "current-hp",
  ACCUMULATION: "accumulation",
} as const;
type AdditionFactorKey =
  (typeof additionFactorKeys)[keyof typeof additionFactorKeys];

type JsonAdditionFactor =
  | {
      key: string;
      value: number;
    }
  | {
      value: number;
      time: number;
    }
  | number;

export type AdditionFactor =
  | {
      key:
        | Exclude<AdditionFactorKey, typeof AdditionFactor.ACCUMULATION>
        | undefined;
      value: number;
    }
  | {
      key: typeof AdditionFactor.ACCUMULATION;
      value: number;
      time: number;
    };
export const AdditionFactor = additionFactorKeys;

const JsonAdditionFactor = {
  parse(obj: JsonAdditionFactor | undefined): AdditionFactor | undefined {
    if (obj === undefined) return;
    if (typeof obj === "number") {
      return {
        key: undefined,
        value: obj,
      };
    }

    if (!("key" in obj)) {
      return {
        key: AdditionFactor.ACCUMULATION,
        value: obj.value,
        time: obj.time,
      };
    }

    const isKey = (key: string): key is AdditionFactorKey =>
      Object.values(additionFactorKeys).findIndex((v) => v === key) !== -1;
    if (isKey(obj.key) && obj.key !== AdditionFactor.ACCUMULATION) {
      return {
        key: obj.key,
        value: obj.value,
      };
    }
  },
} as const;

type JsonAttackDebuff = {
  readonly key: string;
  readonly value: number;
};
const JsonAttackDebuff = {
  isKvp(obj: JsonAttackDebuff): obj is AttackDebuff {
    switch (obj.key) {
      case Data.StaticDamage.ATTACK_BASE:
      case AttackDebuff.enemyAttack:
        break;
      default:
        return false;
    }
    return typeof obj.value === "number";
  },
} as const;
export type AttackDebuff = {
  readonly key:
    | typeof Data.StaticDamage.ATTACK_BASE
    | typeof AttackDebuff.enemyAttack;
  readonly value: number;
};
export const AttackDebuff = {
  enemyAttack: "enemy-attack",
} as const;

type DefresDebuff = DebuffAdd | DebuffMul;
interface DebuffAdd {
  readonly key?: string;
  readonly time?: number;
  readonly valueAdd: number;
}
interface DebuffMul {
  readonly valueMul: number;
}
export const Debuff = {
  calculate(
    obj: DefresDebuff | number | undefined,
    attack: number,
    interval: number,
    attackSpeed: number | undefined,
    defres: number,
    rounds: number
  ): number | undefined {
    if (obj === undefined || typeof obj === "number") return obj;
    if ("valueMul" in obj) {
      return (defres * obj.valueMul) / 100;
    } else {
      let value;
      switch (obj.key) {
        case Data.StaticDamage.ATTACK_BASE:
          value = Data.Percent.multiply(attack, obj.valueAdd);
          break;
        default:
          value = obj.valueAdd;
      }
      if (obj.time === undefined) {
        return value;
      } else {
        return (
          value *
          rounds *
          Accumulation.calculate({ time: obj.time, attackSpeed, interval })
        );
      }
    }
  },
} as const;

export class Accumulation {
  static calculate({
    attackSpeed,
    interval,
    time,
  }: {
    attackSpeed?: number | undefined;
    interval: number;
    time: number;
  }): number {
    if (attackSpeed === undefined) attackSpeed = interval;
    const a = time % interval >= attackSpeed ? 1 : 0;
    return Math.trunc(time / interval) + a;
  }
}

// Feature

const commonFeature = {
  isAbility: false,
  isNotAbility: false,
  noBaseSupplements: false,
  isAction: false,
  isNotSustainable: false,
  isSupport: false,
  isExtraDamage: false,
  isConditionalBuff: false,
  isConditionalDebuff: false,
  isConditionalSkillBuff: false,
  isConditionalSkillDebuff: false,
  isMoving: false,
  isUnhealable: false,
  healFlag: false,
  currentHp: 0,
  phase: 0,
  phaseName: "",
  parentSkill: 0,
  hpMul: 0,
  attackMul: 0,
  defenseMul: 0,
  resistMul: 0,
  damageFactor: 0,
  damageCut: 0,
  physicalDamageCut: 0,
  magicalDamageCut: 0,
  criChanceAdd: 0,
  criDamageAdd: 0,
  criChanceLimitAdd: 0,
  criDamageLimitAdd: 0,
  penetrationAdd: 0,
  defenseDebuff: 0 as number | DefresDebuff,
  resistDebuff: 0 as number | DefresDebuff,
  damageDebuff: 0,
  physicalDamageDebuff: 0,
  magicalDamageDebuff: 0,
  physicalEvasion: 0,
  magicalEvasion: 0,
  attackMotionMul: 0,
  attackSpeedBuff: 0,
  delayMul: 0,
  fixedDelay: 0,
  interval: 0 as number | null,
  minInterval: 0,
  blockAdd: 0,
  targetAdd: 0,
  splash: false,
  wideTarget: false,
  laser: false,
  range: 0 as number | null,
  rangeMul: 0,
  rangeAdd: 0,
  flagRangeIsVisible: false,
  initialTimeCut: 0,
  moveSpeedAdd: 0,
  moveSpeedMul: 0,
  fieldBuffFactor: 0,
  cooldownCut: 0,
  cooldownReductions: [] as readonly number[],
};
interface JsonFeatureDiff {
  fieldElements: readonly string[];
  conditions: readonly Data.JsonCondition[];
  annotations: readonly string[];
  deleteAnnotations: readonly string[];
  hpAdd: JsonAdditionFactor;
  attackAdd: JsonAdditionFactor;
  defenseAdd: JsonAdditionFactor;
  resistAdd: JsonAdditionFactor;
  staticDamage: Data.JsonStaticDamage;
  staticDefense: Data.JsonStaticDamage;
  staticResist: Data.JsonStaticDamage;
  attackDebuff: number | JsonAttackDebuff;
  target: Data.JsonTarget;
  fixedTarget: Data.JsonTarget;
  rounds: Data.JsonRound;
  hits: Data.JsonRound;
  duration: Data.JsonDuration | null;
  damageType: Data.JsonDamageType;
  supplements: readonly string[];
  deleteSupplements: readonly string[];
}
interface FeatureDiff {
  fieldElements: Set<Data.Element>;
  conditions: Data.Condition[];
  annotations: string[];
  deleteAnnotations: string[];
  hpAdds: AdditionFactor[];
  attackAdds: AdditionFactor[];
  defenseAdds: AdditionFactor[];
  resistAdds: AdditionFactor[];
  staticDamage: Data.StaticDamage;
  staticDefense: Data.StaticDamage;
  staticResist: Data.StaticDamage;
  attackDebuff: number | AttackDebuff;
  target: Data.TargetBase;
  fixedTarget: Data.TargetBase;
  rounds: Data.Rounds;
  hits: Data.Rounds;
  duration: number | typeof Data.Duration.always | null;
  damageType: Data.DamageType | null;
  supplements: Set<string>;
  deleteSupplements: Set<string>;
}
interface FeatureOutputDiff {
  fieldElements: ReadonlySet<Data.Element>;
  conditions: readonly Data.Condition[];
  annotations: readonly string[];
  deleteAnnotations: readonly string[];
  hpAdds: readonly AdditionFactor[];
  attackAdds: readonly AdditionFactor[];
  defenseAdds: readonly AdditionFactor[];
  resistAdds: readonly AdditionFactor[];
  supplements: ReadonlySet<string>;
  deleteSupplements: ReadonlySet<string>;
}
type CommonFeature = typeof commonFeature;
const commonFeatureKeys = Object.keys(
  commonFeature
) as readonly (keyof CommonFeature)[];
const keys = Data.Enum(commonFeatureKeys);

type JsonFeatureBase = Readonly<Partial<CommonFeature & JsonFeatureDiff>>;
export interface JsonFeature extends JsonFeatureBase {
  readonly featureName?: string;
  readonly require?: readonly string[];
  readonly exclude?: readonly string[];
  readonly skill?: number;
  readonly isBuffSkill?: boolean;
  readonly hasPotentials?: Data.JsonPotentials;
  readonly potentialBonus?: JsonFeatureBase;
}
type FeatureCore = Partial<CommonFeature & FeatureDiff>;
interface FeatureObject extends FeatureCore {
  featureName?: string;
  require?: Set<Require>;
  exclude?: Set<Require>;
  skill?: number;
  isBuffSkill?: boolean;
  hasPotentials?: Set<Data.Potential>;
  potentialBonus?: FeatureCore;
}

export type FeatureOutputCore = Partial<
  CommonFeature & FeatureOutputDiff & Omit<FeatureDiff, keyof FeatureOutputDiff>
>;
export interface FeatureOutput extends FeatureOutputCore {
  featureName?: string;
  require?: ReadonlySet<Require>;
  exclude?: ReadonlySet<Require>;
  skill?: number;
  isBuffSkill?: boolean;
  hasPotentials?: ReadonlySet<Data.Potential>;
  potentialBonus?: Readonly<FeatureOutputCore>;
}

export class Feature {
  static readonly require = Require;

  static parse(src: JsonFeature): Readonly<FeatureOutput> {
    const ret: FeatureOutput = this.parseBase(src);

    if (src.featureName !== undefined) ret.featureName = src.featureName;
    if (src.require !== undefined) ret.require = this.parseRequire(src.require);
    if (src.exclude !== undefined) ret.exclude = this.parseRequire(src.exclude);
    if (src.skill !== undefined) ret.skill = src.skill;
    if (src.isBuffSkill !== undefined) ret.isBuffSkill = src.isBuffSkill;
    if (src.hasPotentials !== undefined)
      ret.hasPotentials = Data.JsonPotentials.toSet(src.hasPotentials);
    if (src.potentialBonus !== undefined)
      ret.potentialBonus = this.parseBase(src.potentialBonus);

    return ret;
  }

  private static parseBase(src: JsonFeatureBase): FeatureOutputCore {
    const obj: FeatureObject = {};

    commonFeatureKeys.forEach((key) => {
      if (src[key] !== undefined) this.setValue(obj, key, src[key]);
    });

    const ret: FeatureOutputCore = obj;
    {
      const v = Data.Element.parseElements(src.fieldElements);
      if (v !== undefined) ret.fieldElements = v;
    }
    {
      const v = Data.JsonCondition.parse(src.conditions);
      if (v !== undefined) ret.conditions = v;
    }
    if (src.annotations !== undefined) ret.annotations = src.annotations;
    if (src.deleteAnnotations !== undefined)
      ret.deleteAnnotations = src.deleteAnnotations;
    {
      const v = JsonAdditionFactor.parse(src.hpAdd);
      if (v !== undefined) ret.hpAdds = [v];
    }
    {
      const v = JsonAdditionFactor.parse(src.attackAdd);
      if (v !== undefined) ret.attackAdds = [v];
    }
    {
      const v = JsonAdditionFactor.parse(src.defenseAdd);
      if (v !== undefined) ret.defenseAdds = [v];
    }
    {
      const v = JsonAdditionFactor.parse(src.resistAdd);
      if (v !== undefined) ret.resistAdds = [v];
    }
    {
      const v = Data.JsonStaticDamage.parse(src.staticDamage);
      if (v !== undefined) ret.staticDamage = v;
    }
    {
      const v = Data.JsonStaticDamage.parse(src.staticDefense);
      if (v !== undefined) ret.staticDefense = v;
    }
    {
      const v = Data.JsonStaticDamage.parse(src.staticResist);
      if (v !== undefined) ret.staticResist = v;
    }
    {
      const v = src.attackDebuff;
      if (
        typeof v === "number" ||
        (v !== undefined && JsonAttackDebuff.isKvp(v))
      )
        ret.attackDebuff = v;
    }
    {
      const v = Data.JsonTarget.parse(src.target);
      if (v !== undefined) ret.target = v;
    }
    {
      const v = Data.JsonTarget.parse(src.fixedTarget);
      if (v !== undefined) ret.fixedTarget = v;
    }
    {
      const v = Data.JsonRound.parse(src.rounds);
      if (v !== undefined) ret.rounds = v;
    }
    {
      const v = Data.JsonRound.parse(src.hits);
      if (v !== undefined) ret.hits = v;
    }
    if (src.duration === null) ret.duration = null;
    else if (src.duration === Data.Duration.always)
      ret.duration = Data.Duration.always;
    else if (src.duration !== undefined)
      ret.duration = Data.JsonDuration.parse(src.duration);
    {
      const v = Data.JsonDamageType.parse(src.damageType);
      if (v !== undefined) ret.damageType = v;
    }
    if (src.supplements !== undefined)
      ret.supplements = new Set(src.supplements);
    if (src.deleteSupplements !== undefined)
      ret.deleteSupplements = new Set(src.deleteSupplements);

    return ret;
  }

  private static setValue<T extends keyof CommonFeature>(
    obj: FeatureObject,
    key: T,
    value: CommonFeature[T]
  ): void {
    obj[key] = value;
  }

  static parseRequire(src: readonly string[]): Set<Require> {
    return new Set(Require.list.filter((v) => src.includes(v)));
  }

  static parseList(
    src: readonly JsonFeature[]
  ): readonly Readonly<FeatureOutput>[] {
    return src.map((v) => this.parse(v));
  }

  static calculateList(
    src: readonly Readonly<FeatureOutput>[],
    isPotentialApplied: boolean
  ): Readonly<FeatureOutputCore> {
    const ret: FeatureObject = {};
    src.forEach((feature) => {
      if (isPotentialApplied)
        feature = { ...feature, ...feature.potentialBonus };
      commonFeatureKeys.forEach((key) => {
        if (feature[key] === undefined) return;
        if (ret[key] === undefined)
          return this.setValue(ret, key, feature[key]);

        switch (key) {
          case keys.hpMul:
          case keys.attackMul:
          case keys.defenseMul:
          case keys.resistMul:
          case keys.rangeMul:
            return (ret[key] = Data.Percent.sum(ret[key], feature[key]));

          case keys.damageFactor:
          case keys.delayMul:
            return (ret[key] = Data.Percent.multiply(ret[key], feature[key]));

          case keys.damageCut:
          case keys.physicalDamageCut:
          case keys.magicalDamageCut:
          case keys.physicalEvasion:
          case keys.magicalEvasion:
            return (ret[key] = Data.Percent.accumulate(ret[key], feature[key]));

          case keys.criChanceAdd:
          case keys.criDamageAdd:
          case keys.criChanceLimitAdd:
          case keys.criDamageLimitAdd:
          case keys.rangeAdd:
            return (ret[key] += feature[key]);

          default:
            return this.setValue(ret, key, feature[key]);
        }
      });

      if (feature.fieldElements !== undefined)
        ret.fieldElements = this.unionItems(
          ret.fieldElements,
          feature.fieldElements
        );
      if (feature.conditions !== undefined)
        ret.conditions = this.concatItems(ret.conditions, feature.conditions);
      if (feature.annotations !== undefined)
        ret.annotations = this.concatItems(
          ret.annotations,
          feature.annotations
        );
      if (feature.deleteAnnotations !== undefined)
        ret.deleteAnnotations = this.concatItems(
          ret.deleteAnnotations,
          feature.deleteAnnotations
        );
      {
        const v = feature.hpAdds;
        if (v !== undefined) ret.hpAdds = this.concatItems(ret.hpAdds, v);
      }
      {
        const v = feature.attackAdds;
        if (v !== undefined)
          ret.attackAdds = this.concatItems(ret.attackAdds, v);
      }
      {
        const v = feature.defenseAdds;
        if (v !== undefined)
          ret.defenseAdds = this.concatItems(ret.defenseAdds, v);
      }
      {
        const v = feature.resistAdds;
        if (v !== undefined)
          ret.resistAdds = this.concatItems(ret.resistAdds, v);
      }
      if (feature.staticDamage !== undefined)
        ret.staticDamage = feature.staticDamage;
      if (feature.staticDefense !== undefined)
        ret.staticDefense = feature.staticDefense;
      if (feature.staticResist !== undefined)
        ret.staticResist = feature.staticResist;
      if (feature.attackDebuff !== undefined)
        ret.attackDebuff = feature.attackDebuff;
      {
        const v = feature.target;
        if (v !== undefined) ret.target = v;
      }
      {
        const v = feature.fixedTarget;
        if (v !== undefined) ret.fixedTarget = v;
      }
      {
        const v = feature.rounds;
        if (v !== undefined) ret.rounds = v;
      }
      {
        const v = feature.hits;
        if (v !== undefined) ret.hits = v;
      }
      {
        const v = feature.duration;
        if (v !== undefined) ret.duration = v;
      }
      {
        const v = feature.damageType;
        if (v !== undefined) ret.damageType = v;
      }
      if (feature.supplements !== undefined)
        ret.supplements = this.unionItems(ret.supplements, feature.supplements);
      if (feature.deleteSupplements !== undefined)
        ret.deleteSupplements = this.unionItems(
          ret.deleteSupplements,
          feature.deleteSupplements
        );
    });
    if (ret.annotations !== undefined && ret.deleteAnnotations !== undefined)
      ret.annotations = ret.annotations.filter(
        (str) => !ret.deleteAnnotations?.includes(str)
      );
    return ret;
  }

  private static concatItems<T>(
    obj1: T[] | undefined,
    obj2: readonly T[]
  ): T[] {
    obj1 ??= [];
    obj2.forEach((v) => obj1.push(v));
    return obj1;
  }

  private static unionItems<T>(
    obj1: Set<T> | undefined,
    obj2: ReadonlySet<T>
  ): Set<T> {
    obj1 ??= new Set();
    obj2.forEach((v) => obj1.add(v));
    return obj1;
  }

  static getAdditionFactors(
    obj: Readonly<FeatureOutput>,
    statType: Data.BaseStatType
  ): readonly AdditionFactor[] | undefined {
    switch (statType) {
      case stat.hp:
        return obj.hpAdds;
      case stat.attack:
        return obj.attackAdds;
      case stat.defense:
        return obj.defenseAdds;
      case stat.resist:
        return obj.resistAdds;
    }
  }

  static getCommonFeatures(): readonly Readonly<FeatureOutput>[] {
    return commonFeatures;
  }
}

// Templates

const commonFeatures = Feature.parseList(jsonCommonFeatures);
