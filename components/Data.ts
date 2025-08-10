import jsonWord from "@/assets/word.json";
import { Setting } from "./States";

// Const

export const fps = 30;
const elementFieldFactor = 30;
const elementFieldRangeFactor = 10;
export const defaultCriChance = 0;
export const defaultCriDamage = 150;
export const defaultCriChanceLimit = 50;
export const defaultCriDamageLimit = 300;

export const MAX_POSS_BUFF_LEVEL = 45;

// Util

export function getKeys<T extends Record<string, unknown>>(
  obj: T
): readonly (keyof T)[] {
  return Object.keys(obj);
}

export function getEntries<T extends Record<string, unknown>>(
  obj: T
): readonly [keyof T, T[keyof T]][] {
  return Object.entries(obj) as readonly [keyof T, T[keyof T]][];
}

export class Cache<T> {
  setting?: Setting;
  value?: T;
  getCache(fn: (setting: Setting) => T, setting: Setting): T {
    if (this.value === undefined || this.setting !== setting) {
      this.setting = setting;
      this.value = fn(setting);
    }
    return this.value;
  }
}

export interface KeyValuePair<TKey, TValue> {
  readonly key: TKey;
  readonly value: TValue;
}

export function Enum<T extends number | string | symbol>(list: readonly T[]) {
  type Key = number | string | symbol;
  const ret: Record<Key, Key> = {};
  list.forEach((v) => (ret[v] = v));
  return ret as { readonly [K in (typeof list)[number]]: K };
}

export function Cond<T extends number | string | symbol>(list: readonly T[]) {
  const ret: Record<number | string | symbol, number> = {};
  list.forEach((v, i) => (ret[v] = 2 ** i));
  return ret as { readonly [K in (typeof list)[number]]: number };
}

export class Percent {
  static multiply(...values: (number | undefined)[]): number {
    const v1 = values[0] ?? 100;
    const v2 = values[1] ?? 100;
    const ret = Math.trunc((v1 * v2) / 100);
    if (values.length > 2) {
      return this.multiply(ret, ...values.slice(2));
    }
    return ret;
  }

  static divide(v1: number = 100, v2: number = 100) {
    return Math.trunc((v1 * 100) / v2);
  }

  static sum(...values: (number | undefined)[]) {
    return values
      .map((v) => (v === undefined ? 100 : v))
      .reduce((a, c) => a + c - 100, 100);
  }

  static max(...values: (number | undefined)[]): number {
    return Math.max(...values.map((v) => v ?? 100));
  }

  static accumulate(...values: (number | undefined)[]) {
    return 100 - this.multiply(...values.map((v) => 100 - (v ?? 0)));
  }
}

export function mapSort<T>(
  data: readonly T[],
  comparer: (value: T) => string | number | undefined,
  isReversed?: boolean
): readonly T[] {
  const mapped = data.map((v, i) => {
    return { i, value: comparer(v) };
  });
  mapped.sort((a, b) => {
    if (isReversed) {
      return compare(b.value, a.value);
    } else {
      return compare(a.value, b.value);
    }
  });
  return mapped.map((v) => data[v.i] as T);
}

function compare(a: unknown, b: unknown): number {
  if (a === b) {
    return 0;
  }
  if (a === undefined || a === null) {
    return 1;
  }
  if (b === undefined || b === null) {
    return -1;
  }
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b);
  }
  return a < b ? -1 : 1;
}

export const tableColor = {
  red: "red",
  blue: "blue",
  orange: "orange",
  green: "green",
  yellow: "yellow",
  indigo: "indigo",
  red100: "red-100",
  red300: "red-300",
  red500: "red-500",
  red700: "red-700",
  red900: "red-900",
  blue100: "blue-100",
  blue300: "blue-300",
  blue500: "blue-500",
  blue700: "blue-700",
  blue900: "blue-900",
  green100: "green-100",
  green300: "green-300",
  green500: "green-500",
  green700: "green-700",
  green900: "green-900",
  yellow100: "yellow-100",
  yellow300: "yellow-300",
  yellow500: "yellow-500",
  yellow600: "yellow-600",
  yellow800: "yellow-800",
} as const;
const dpsPhysicalLines = [
  [1000, undefined],
  [2000, tableColor.blue100],
  [3000, tableColor.blue],
  [5000, tableColor.blue300],
  [7000, tableColor.blue500],
  [10000, tableColor.blue700],
  [0, tableColor.blue900],
] as const satisfies TableColorLines;
const dpsMagicalLines = [
  [1000, undefined],
  [2000, tableColor.green100],
  [3000, tableColor.green],
  [5000, tableColor.green300],
  [7000, tableColor.green500],
  [10000, tableColor.green700],
  [0, tableColor.green900],
] as const satisfies TableColorLines;
const dpsTrueDamageLines = [
  [1000, undefined],
  [2000, tableColor.red100],
  [3000, tableColor.red],
  [5000, tableColor.red300],
  [7000, tableColor.red500],
  [10000, tableColor.red700],
  [0, tableColor.red900],
] as const satisfies TableColorLines;
const dpsHealLines = [
  [300, undefined],
  [400, tableColor.yellow100],
  [600, tableColor.yellow300],
  [800, tableColor.yellow500],
  [1000, tableColor.yellow600],
  [0, tableColor.yellow800],
] as const satisfies TableColorLines;
const limitPhysicalLines = [
  [1500, undefined],
  [3000, tableColor.blue100],
  [4500, tableColor.blue],
  [6000, tableColor.blue300],
  [10000, tableColor.blue500],
  [15000, tableColor.blue700],
  [0, tableColor.blue900],
] as const satisfies TableColorLines;
const limitMagicalLines = [
  [1500, undefined],
  [3000, tableColor.green100],
  [4500, tableColor.green],
  [6000, tableColor.green300],
  [10000, tableColor.green500],
  [15000, tableColor.green700],
  [0, tableColor.green900],
] as const satisfies TableColorLines;
export type TableColorLines = [number, TableColor | undefined][];
export type TableColor = (typeof tableColor)[keyof typeof tableColor];
export const TableColor = {
  dpsPhysicalLines,
  dpsMagicalLines,
  dpsTrueDamageLines,
  dpsHealLines,
  limitPhysicalLines,
  limitMagicalLines,
  getSelector(color: TableColor | undefined): string | undefined {
    if (color === undefined) {
      return;
    } else {
      return `table-c-${color}`;
    }
  },

  valueCompare(
    v1: number | undefined,
    v2: number | undefined = 0
  ): TableColor | undefined {
    if (v1 !== undefined) {
      if (v1 > v2) {
        return tableColorAlias.positive;
      } else if (v1 < v2) {
        return tableColorAlias.negative;
      }
    }
  },

  valueCompareStrong(
    v1: number | undefined,
    v2: number | undefined = 0
  ): TableColor | undefined {
    if (v1 !== undefined) {
      if (v1 > v2) {
        return tableColorAlias.positiveStrong;
      } else if (v1 < v2) {
        return tableColorAlias.negativeStrong;
      }
    }
  },

  valueCompareWeak(
    v1: number | undefined,
    v2: number | undefined = 0
  ): TableColor | undefined {
    if (v1 !== undefined) {
      if (v1 > v2) {
        return tableColorAlias.positiveWeak;
      } else if (v1 < v2) {
        return tableColorAlias.negativeWeak;
      }
    }
  },

  getColorFromLines(
    lines: TableColorLines,
    value: number
  ): TableColor | undefined {
    for (let i = 0; i < lines.length - 1; i++) {
      if (value < lines[i]![0]) {
        return lines[i]![1];
      }
    }
    return lines[lines.length - 1]![1];
  },
} as const;
export const tableColorAlias = {
  positive: tableColor.red300,
  negative: tableColor.blue300,
  positiveStrong: tableColor.red700,
  negativeStrong: tableColor.blue700,
  positiveWeak: tableColor.red100,
  negativeWeak: tableColor.blue100,
  warning: tableColor.yellow,
} as const;

export const TableClass = {
  small: "fsm",
  skillNormal: "skill-normal",
  annotations: "annotations",
  unhealable: "unhealable",
  critical: "critical",
  species: "species",
  buffRequire: "buff-require",
} as const;

// Stat

const statTypeList = getKeys(jsonWord);
export type StatType = (typeof statTypeList)[number];
export const stat = Enum(statTypeList);
export const StatType = {
  isKey: (key: string | number | symbol): key is StatType => key in stat,
  nameOf: (value: StatType): string => jsonWord[value],
  getHeaderName: (statType: string, setting: Setting, name: string): string => {
    switch (statType) {
      case stat.className:
        switch (setting.classNameType) {
          case Setting.TYPE_EQUIPMENT:
            return "武器";
          default:
            return name;
        }
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        return `DPS ${setting[statType]}`;
      default:
        return name;
    }
  },

  headerNameOf(statType: StatType, setting: Setting): string {
    const name = this.nameOf(statType);
    return this.getHeaderName(statType, setting, name);
  },

  getHeaders<T extends StatType>(statTypes: readonly T[]) {
    return statTypes.map((key) => ({
      id: key,
      name: StatType.nameOf(key),
    }));
  },
} as const;

export const baseStatList = [
  stat.hp,
  stat.attack,
  stat.defense,
  stat.resist,
] as const;
const baseStatName = {
  hp: "HP",
  attack: "攻撃力",
  defense: "物理防御",
  resist: "魔法防御",
} as const satisfies Record<BaseStatType, string>;
const baseStatMul = {
  hp: "hpMul",
  attack: "attackMul",
  defense: "defenseMul",
  resist: "resistMul",
} as const satisfies Record<BaseStatType, string>;
const baseStatAdd = {
  hp: "hpAdd",
  attack: "attackAdd",
  defense: "defenseAdd",
  resist: "resistAdd",
} as const satisfies Record<BaseStatType, string>;
const baseStatFactor = {
  hp: "hpFactor",
  attack: "attackFactor",
  defense: "defenseFactor",
  resist: "resistFactor",
} as const satisfies Record<BaseStatType, string>;
export type BaseStatType = (typeof baseStatList)[number];
export const BaseStatType = {
  list: baseStatList,
  name: baseStatName,
  mulKey: baseStatMul,
  addKey: baseStatAdd,
  factorKey: baseStatFactor,

  isKey(key: string): key is BaseStatType {
    return baseStatList.findIndex((k) => k === key) !== -1;
  },
} as const;

const mainStatTypeList = [
  stat.cost,
  stat.hp,
  stat.attack,
  stat.defense,
  stat.resist,
  stat.block,
  stat.range,
] as const;
export type MainStatType = (typeof mainStatTypeList)[number];
export const MainStatType = {
  isKey(key: string): key is MainStatType {
    return mainStatTypeList.findIndex((k) => k === key) !== -1;
  },
} as const;

// Json

interface JsonConditionObjType {
  readonly key: string;
  readonly type: string;
  readonly value?: number;
}
interface JsonConditionObjKvp {
  readonly key: string;
  readonly type?: string;
  readonly value: number;
}
export type JsonCondition = string | JsonConditionObjType | JsonConditionObjKvp;
export type ConditionBaseObj = {
  readonly key: ConditionKey;
  readonly type: string | undefined;
  readonly value: number | undefined;
};
export type ConditionObj = {
  readonly key: ConditionKey;
  readonly type: string | readonly string[] | undefined;
  readonly value: number | undefined;
};
type ConditionKey = keyof typeof Condition.tag;
export type ConditionTag = (typeof Condition.tag)[ConditionKey];
type ConditionDefiniteDescKey = keyof typeof Condition.definiteDesc;
export class Condition {
  static readonly tag = {
    hp: "HP",
    block: "BL",
    team: "t",
    beat: "倒",
    melee: "近",
    ranged: "遠",
    heal: "癒",
    absorb: "吸",
    definite: "特",
    enemy: "敵",
    regenerate: "再",
    regenerateAll: "再all",
    regenetateArea: "再area",
    support: "援",
    charge: "突",
    extra: "追",
    multiply: "*",
    plus: "+",
    second: "s",
    hit: "hit",
  } as const;

  static readonly text = {
    ...this.tag,
    multiply: "×",
  } as const satisfies Record<ConditionKey, string>;

  static readonly desc = {
    hp: "現在HP",
    block: "ブロック数",
    team: "味方配置数",
    beat: "撃破数",
    melee: "近接攻撃時",
    ranged: "遠距離攻撃時",
    heal: "回復行動",
    absorb: "命中時回復",
    definite: "特効",
    enemy: "攻撃対象数",
    regenerate: "継続回復",
    regenerateAll: "全体継続回復",
    regenetateArea: "射程内継続回復",
    support: "バフ効果",
    charge: "移動攻撃",
    extra: "追加ダメージ",
    multiply: "乗算補整",
    plus: "加算補整",
    second: "経過時間",
    hit: "命中回数",
  } as const satisfies Record<ConditionKey, string>;

  static readonly definiteDesc = {
    none: "不明",
    air: "対空",
    stan: "スタン",
    poison: "毒",
    petrify: "石化",
    freeze: "凍結",
    burn: "火傷",
    "back-attack": "背面攻撃",
    "same-element": "同属性",
    female: "女性",
    male: "男性",
    fire: "火属性",
    water: "水属性",
    earth: "地属性",
    wind: "風属性",
    light: "光属性",
    dark: "闇属性",
  } as const;

  private static readonly keys = getKeys(this.tag);
  private static readonly entries = getEntries(this.tag);
  static readonly key = Enum(this.keys);
  private static definiteKeys = getKeys(this.definiteDesc);

  static parseList(
    list: readonly JsonCondition[] | undefined
  ): readonly ConditionBaseObj[] | undefined {
    if (list === undefined) {
      return;
    }
    return list
      .map((item) => this.parse(item))
      .filter((item) => item !== undefined);
  }

  private static parse(src: JsonCondition): ConditionBaseObj | undefined {
    for (const [key, value] of this.entries) {
      if (value === src) {
        return {
          key,
          type: undefined,
          value: undefined,
        };
      }
      if (typeof src === "object" && value === src.key) {
        return {
          key,
          type: src.type,
          value: src.value,
        };
      }
    }
  }

  static getObj(key: ConditionKey): ConditionBaseObj {
    return {
      key,
      type: undefined,
      value: undefined,
    };
  }

  static concat(
    ...lists: readonly (readonly ConditionBaseObj[] | undefined)[]
  ): readonly ConditionObj[] {
    type ConditionMapValue = {
      type: Set<string>;
      value: number | undefined;
    };

    const map = new Map<ConditionKey, ConditionMapValue>();
    const filteredList = lists.flat().filter((item) => item !== undefined);
    filteredList.forEach((obj) => {
      const item = map.get(obj.key);
      if (!item) {
        const type = new Set<string>();
        if (obj.type) {
          type.add(obj.type);
        }
        map.set(obj.key, { type, value: obj.value });
      } else {
        if (obj.type) {
          item.type.add(obj.type);
        }
        item.value = obj.value;
      }
    });

    const ret: ConditionObj[] = [];
    map.forEach((obj, key) => {
      const type: string[] = [];
      for (const str of obj.type) {
        type.push(str);
      }
      ret.push({
        key,
        type,
        value: obj.value,
      });
    });

    return ret;
  }

  static toSorted(list: readonly ConditionObj[]): readonly ConditionObj[] {
    return list.toSorted((a, b) => this.getIndex(a) - this.getIndex(b));
  }

  private static getIndex(obj: ConditionObj): number {
    return this.keys.findIndex((k) => k === obj.key);
  }

  private static isDefiniteDescKey(
    key: unknown
  ): key is ConditionDefiniteDescKey {
    return this.definiteKeys.findIndex((k) => k === key) !== -1;
  }

  static getDefiniteDesc(key: string | readonly string[] | undefined): string {
    if (Array.isArray(key)) {
      const descs = [];
      for (const k of key) {
        if (this.isDefiniteDescKey(k)) {
          descs.push(this.definiteDesc[k]);
        }
      }
      return descs.join("/");
    } else if (this.isDefiniteDescKey(key)) {
      return this.definiteDesc[key];
    }
    return this.definiteDesc.none;
  }
}

const staticDamage = {
  HP_BASE: "hp-base",
  ATTACK_BASE: "attack-base",
  DEFENSE_BASE: "defense-base",
  RESIST_BASE: "resist-base",
  STATIC: "static",
  TIME: "time",
  TIME_ATTACK_BASE: "time-attack-base",
} as const;

const staticDamageKeyList = [
  stat.hp,
  stat.attack,
  stat.defense,
  stat.resist,
  staticDamage.HP_BASE,
  staticDamage.ATTACK_BASE,
  staticDamage.DEFENSE_BASE,
  staticDamage.RESIST_BASE,
  staticDamage.STATIC,
  staticDamage.TIME,
  staticDamage.TIME_ATTACK_BASE,
] as const;
type StaticDamageKey = (typeof staticDamageKeyList)[number];

export type StaticDamage =
  | {
      key: Exclude<
        StaticDamageKey,
        typeof staticDamage.TIME | typeof staticDamage.TIME_ATTACK_BASE
      >;
      value: number;
    }
  | {
      key: typeof staticDamage.TIME | typeof staticDamage.TIME_ATTACK_BASE;
      value: number;
      time: number;
    };

export type JsonStaticDamage = {
  key: string;
  value: number;
  time?: number;
};

export const JsonStaticDamage = {
  parse(src: JsonStaticDamage | undefined): StaticDamage | undefined {
    if (src === undefined) {
      return;
    }
    if (staticDamageKeyList.findIndex((k) => k === src.key) !== -1) {
      if (
        (src.key !== staticDamage.TIME &&
          src.key !== staticDamage.TIME_ATTACK_BASE) ||
        src.time !== undefined
      ) {
        return src as StaticDamage;
      }
    }
  },
} as const;

export const StaticDamage = {
  ...staticDamage,

  baseStatTypeOf(key: StaticDamageKey): BaseStatType | undefined {
    switch (key) {
      case staticDamage.HP_BASE:
        return stat.hp;
      case staticDamage.ATTACK_BASE:
        return stat.attack;
      case staticDamage.DEFENSE_BASE:
        return stat.defense;
      case staticDamage.RESIST_BASE:
        return stat.resist;
    }
  },

  textOf(key: StaticDamageKey): string {
    switch (key) {
      case stat.hp:
      case stat.attack:
      case stat.defense:
      case stat.resist:
        return StatType.nameOf(key);
      case staticDamage.HP_BASE:
      case staticDamage.ATTACK_BASE:
      case staticDamage.DEFENSE_BASE:
      case staticDamage.RESIST_BASE:
        return (
          "配置前" +
          StatType.nameOf(StaticDamage.baseStatTypeOf(key) as BaseStatType)
        );
      case staticDamage.STATIC:
        return "固定値";
      case staticDamage.TIME:
      case staticDamage.TIME_ATTACK_BASE:
        return "累積数";
    }
  },
} as const;

export type Round = {
  readonly ratio: number;
  readonly value: number;
};
export const Round = {
  average<T extends Rounds | undefined>(
    rounds: T
  ): number | Extract<T, undefined> {
    if (rounds === undefined) {
      return undefined as Extract<T, undefined>;
    }
    if (typeof rounds === "number") {
      return rounds;
    }

    return this.getAverageAndRatios(rounds)[0];
  },

  getAverageAndRatios(rounds: Rounds): [number, number] {
    if (typeof rounds === "number") {
      return [rounds, 1];
    }

    let ratios = 0;
    let sum = 0;
    rounds.forEach((v) => {
      ratios += v.ratio;
      sum += v.value * v.ratio;
    });
    return [sum / ratios, ratios];
  },
} as const;
export type Rounds = number | readonly Round[];
export type JsonRound = number | readonly Round[];
export const JsonRound = {
  parse<T extends JsonRound | undefined>(
    value: T
  ): Rounds | Extract<T, undefined> {
    if (typeof value === "number") {
      return value;
    }
    return value as Rounds | Extract<T, undefined>;
  },
} as const;

interface SkillBase {
  skillName: string;
  isOverCharge?: boolean;
  conditions?: readonly ConditionBaseObj[];
  hpMul?: number;
  attackMul?: number;
  defenseMul?: number;
  resistMul?: number;
  damageFactor?: number;
  criChanceAdd?: number;
  criDamageAdd?: number;
  criChanceLimitAdd?: number;
  criDamageLimitAdd?: number;
  attackMotionMul?: number;
  attackSpeedBuff?: number;
  delayMul?: number;
  fixedDelay?: number;
  block?: number;
  blockAdd?: number;
  target?: TargetBase;
  targetAdd?: number;
  rounds?: Rounds;
  splash?: boolean;
  laser?: boolean;
  range?: number;
  rangeMul?: number;
  physicalEvasion?: number;
  magicalEvasion?: number;
  duration: number | typeof Duration.single;
  cooldown: number;
  damageType?: DamageType | null | undefined;
  supplements?: ReadonlySet<string>;
  skillFeatures?: readonly SkillFeature[];
  toString: () => string;
}
export type Skill = Readonly<SkillBase>;
export type SkillOutput = Omit<Skill, "features">;
type JsonSkillDiff = Readonly<{
  conditions?: readonly JsonCondition[];
  target?: JsonTarget;
  rounds?: JsonRound;
  duration: number | string;
  damageType?: string | null | undefined;
  supplements?: readonly string[];
  skillFeatures?: readonly JsonSkillFeature[];
}>;
export type JsonSkill = JsonSkillDiff & Omit<Skill, keyof JsonSkillDiff>;
export const JsonSkill = {
  parse(value: JsonSkill): Skill {
    const v: Omit<JsonSkill, keyof JsonSkillDiff> = value;
    const duration =
      value.duration === Duration.single
        ? Duration.single
        : JsonDuration.parse(value.duration);
    const ret: SkillBase = {
      ...v,
      duration,
      toString: () => value.skillName,
    };
    parseSkill(ret, value);
    return ret;
  },
} as const;
function parseSkill(
  skill: Partial<SkillBase>,
  jsonSkill: Partial<JsonSkill>
): void {
  const c = Condition.parseList(jsonSkill.conditions);
  if (c !== undefined) {
    skill.conditions = c;
  }

  const t = JsonTarget.parse(jsonSkill.target);
  if (t !== undefined) {
    skill.target = t;
  }

  if (jsonSkill.rounds !== undefined) {
    skill.rounds = JsonRound.parse(jsonSkill.rounds);
  }

  const d = JsonDamageType.parse(jsonSkill.damageType);
  if (d !== undefined) {
    skill.damageType = d;
  }
  {
    const v = jsonSkill.supplements;
    if (v !== undefined) {
      skill.supplements = new Set(v);
    }
  }
  const f = JsonSkillFeature.parse(jsonSkill.skillFeatures);
  if (f !== undefined) {
    skill.skillFeatures = f;
  }
}
interface SkillFeatureDiff {
  readonly featureName: string;
}
type SkillFeature = SkillFeatureDiff & Partial<Omit<Skill, "features">>;
type JsonSkillFeature = SkillFeatureDiff & Partial<Omit<JsonSkill, "features">>;
const JsonSkillFeature = {
  parse(
    value: readonly JsonSkillFeature[] | undefined
  ): readonly SkillFeature[] | undefined {
    if (value === undefined) {
      return;
    }
    return value.map((v) => {
      const raw: Partial<Omit<JsonSkill, keyof JsonSkillDiff>> = v;
      const duration =
        v.duration === Duration.single
          ? Duration.single
          : v.duration === undefined
            ? undefined
            : JsonDuration.parse(v.duration);
      let ret: Partial<SkillBase>;
      if (duration !== undefined) {
        ret = { ...raw, duration };
      } else {
        ret = { ...raw };
      }
      parseSkill(ret, v);
      return {
        featureName: v.featureName,
        ...ret,
      };
    });
  },
};

export type RawDuration =
  | number
  | typeof Duration.infinity
  | typeof Duration.single;
export type RawDurationFeature = RawDuration | typeof Duration.always;
export type JsonDuration = number | string;
export const JsonDuration = {
  parse(value: number | string): number {
    if (typeof value === "number") {
      return value;
    }
    if (value === Duration.infinity) {
      return Infinity;
    }
    return 0;
  },
} as const;
export type Duration = number;
export const Duration = {
  infinity: "永続",
  always: "常時",
  single: "単発",
  textOf(value: number): string {
    return value === Infinity ? this.infinity : value.toFixed(1);
  },
} as const;

export type FormationBuffTarget =
  | typeof FormationBuff.all
  | Element
  | UnitBaseClassTag
  | Species;
export interface FormationBuff {
  readonly targets: ReadonlySet<FormationBuffTarget>;
  readonly require: readonly FormationBuffRequire[];
  readonly cost?: number;
  readonly hp?: number;
  readonly attack?: number;
  readonly defense?: number;
  readonly resist?: number;
  readonly criChanceAdd?: number;
  readonly criChanceLimitAdd?: number;
  readonly delay?: number;
  readonly moveSpeed?: number;
  readonly potentialBonus?: Omit<
    FormationBuff,
    "targets" | "require" | "potentialBonus"
  >;
}
export const FormationBuff = {
  all: "全て",
  valueOf(target: FormationBuffValue, statType: StatType): number | undefined {
    switch (statType) {
      case stat.cost:
      case stat.hp:
      case stat.attack:
      case stat.defense:
      case stat.resist:
      case stat.delay:
      case stat.moveSpeed:
        return target[statType];
      case stat.criticalChance:
        return target.criChanceAdd;
      case stat.criticalChanceLimit:
        return target.criChanceLimitAdd;
    }
  },
} as const;
export type FormationBuffValue = Omit<FormationBuff, "potentialBonus">;
interface JsonFormationBuffDiff {
  readonly targets: readonly string[];
  readonly require?: readonly string[];
}
export type JsonFormationBuff = JsonFormationBuffDiff &
  Omit<FormationBuff, keyof JsonFormationBuffDiff>;
export const JsonFormationBuff = {
  parse(value: readonly JsonFormationBuff[]): FormationBuff[] {
    return value.map((v) => {
      const req = v.require?.map((r) => FormationBuffRequire.parse(r));
      const require = req?.filter((r) => r !== undefined) ?? [];
      return {
        ...v,
        targets: new Set(
          v.targets
            .map((t) => {
              if (t === FormationBuff.all) {
                return t;
              }

              const ele = Element.parse(t);
              if (ele !== undefined) {
                return ele;
              }

              const cls = UnitBaseClass.parse(t);
              if (cls !== undefined) {
                return cls;
              }

              const spe = Species.find(t);
              if (spe !== undefined) {
                return spe;
              }
            })
            .filter((f) => f !== undefined)
        ),
        require,
      };
    });
  },
} as const;
const formationBuffRequire = {
  weapon: "武器",
  sameElement8: "同一属性8体",
} as const;
const formationBuffRequireEntries = getEntries(formationBuffRequire);
const formationBuffRequireKeys = Enum(getKeys(formationBuffRequire));
export type FormationBuffRequireKey = keyof typeof formationBuffRequire;
export type FormationBuffRequire =
  (typeof formationBuffRequire)[keyof typeof formationBuffRequire];
export const FormationBuffRequire = {
  ...formationBuffRequire,
  keys: formationBuffRequireKeys,
  parse(value: string): FormationBuffRequire | undefined {
    for (const v of Object.values(formationBuffRequire)) {
      if (v === value) {
        return v;
      }
    }
  },

  keyOf(value: FormationBuffRequire): FormationBuffRequireKey {
    return formationBuffRequireEntries.find(
      (kvp) => kvp[1] === value
    )?.[0] as FormationBuffRequireKey;
  },
} as const;

// Unit

const rarityList = ["L", "E", "R", "C"] as const;
const rarity = Enum(rarityList);
const rarityName = {
  L: "Legend",
  E: "Epic",
  R: "Rare",
  C: "Common",
} as const;
type RarityName = (typeof rarityName)[keyof typeof rarityName];
const rarityAlias = {
  L: "レジェンド",
  E: "エピック",
  R: "レア",
  C: "コモン",
} as const;
const rarityColorList: TableColor[] = [
  tableColor.yellow,
  tableColor.indigo,
  tableColor.blue,
  tableColor.orange,
] as const;
const raritySelector = {
  L: "legend",
  E: "epic",
  R: "rare",
  C: "common",
} as const;
export type Rarity = (typeof rarityList)[number];
export const Rarity = {
  ...rarity,
  list: rarityList,
  name: rarityName,
  alias: rarityAlias,

  parse(value: string): Rarity | undefined {
    return rarityList.find((v) => v === value);
  },

  colorOf(value: Rarity | undefined): TableColor | undefined {
    return rarityColorList[rarityList.findIndex((v) => v === value)];
  },

  indexOf(value: Rarity | undefined): number | undefined {
    const ret = rarityList.findIndex((v) => v === value);
    return ret === -1 ? undefined : ret;
  },

  nameOf(value: Rarity | undefined): RarityName | undefined {
    if (value === undefined) {
      return;
    }
    return rarityName[value];
  },

  getInitialTimeFactor(rarity: Rarity | undefined): number {
    switch (rarity) {
      case Rarity.L:
        return 3;
      case Rarity.E:
        return 5;
      case Rarity.R:
        return 6;
      default:
        return 7;
    }
  },

  selectorOf(value: Rarity) {
    return raritySelector[value];
  },
} as const;

type UnitClassKey = keyof typeof UnitClass.tag;
export type UnitClassTag = (typeof UnitClass.tag)[UnitClassKey];
export type UnitEquipmentName = (typeof UnitClass.equipment)[UnitClassKey];
type UnitCC4Name = (typeof UnitClass.cc4Name)[UnitClassKey];
export class UnitClass {
  static readonly tag = {
    blader: "ブレイダー",
    lancer: "ランサー",
    barbarian: "バーバリアン",
    monk: "モンク",
    shieldKnight: "シールドナイト",
    destroyer: "デストロイヤー",
    samurai: "サムライ",
    archer: "アーチャー",
    gunner: "ガンナー",
    warlock: "ウォーロック",
    conjurer: "コンジャラー",
    puppeteer: "パペッティア",
    priest: "プリースト",
    hermit: "ハーミット",
    airScout: "エアスカウト",
    assassin: "チーフアサシン",
    ninja: "ニンジャ",
    whipper: "ウィッパー",
    shaman: "シャーマン",
    bard: "バード",
  } as const;

  static readonly equipment = {
    blader: "曲刀",
    lancer: "槍",
    barbarian: "斧",
    monk: "拳",
    shieldKnight: "剣盾",
    destroyer: "こん棒",
    samurai: "大太刀",
    archer: "弓",
    gunner: "銃",
    warlock: "杖",
    conjurer: "本",
    puppeteer: "人形",
    priest: "錫杖",
    hermit: "オーブ",
    assassin: "短剣",
    airScout: "扇",
    ninja: "手裏剣",
    whipper: "鞭",
    shaman: "霊枝",
    bard: "楽器",
  } as const satisfies Record<UnitClassKey, string>;

  static readonly cc4Name = {
    blader: "グラディエーター",
    lancer: "ヴァルキリー",
    barbarian: "ベルセルク",
    monk: "ゴッドハンド",
    shieldKnight: "バスティオン",
    destroyer: "デモリッシュ",
    samurai: "ショウグン",
    archer: "サジタリウス",
    gunner: "デュエリスト",
    warlock: "アーケインメイジ",
    conjurer: "ディザスター",
    puppeteer: "ルサンチマン",
    priest: "ビショップ",
    hermit: "ハイエロファント",
    assassin: "ファントム",
    airScout: "エアリアル",
    ninja: "シノビ",
    whipper: "エンプレス",
    shaman: "シャーマンロード",
    bard: "ミンストレル",
  } as const satisfies Record<UnitClassKey, string>;

  static readonly list = Object.values(this.tag);
  static readonly keys = getKeys(this.tag);
  static readonly entries = getEntries(this.tag);

  static readonly key = Enum(this.keys);

  static parse(value: string | undefined): UnitClassTag | undefined {
    return this.list.find((v) => v === value);
  }

  static isKey(key: unknown): key is UnitClassKey {
    return this.keys.findIndex((k) => k === key) !== -1;
  }

  static indexOf(value: UnitClassTag | undefined): number | undefined {
    if (value === undefined) {
      return;
    }
    return this.list.indexOf(value);
  }

  static keyOf(value: UnitClassTag | undefined): UnitClassKey | undefined {
    if (value === undefined) {
      return;
    }
    return this.entries.find((kvp) => kvp[1] === value)?.[0];
  }

  static equipmentNameOf(
    value: UnitClassTag | undefined
  ): UnitEquipmentName | undefined {
    const key = this.keyOf(value);
    if (key === undefined) {
      return;
    }
    return this.equipment[key];
  }

  static cc4NameOf(value: UnitClassTag | undefined): UnitCC4Name | undefined {
    const key = this.keyOf(value);
    if (key === undefined) {
      return;
    }
    return this.cc4Name[key];
  }

  static baseTagOf(
    value: UnitClassTag | undefined
  ): UnitBaseClassTag | undefined {
    const n = this.tag;
    switch (value) {
      case n.blader:
      case n.lancer:
      case n.barbarian:
      case n.monk:
        return UnitBaseClass.tag.warrior;
      case n.shieldKnight:
      case n.destroyer:
      case n.samurai:
        return UnitBaseClass.tag.guardian;
      case n.archer:
      case n.gunner:
        return UnitBaseClass.tag.sniper;
      case n.warlock:
      case n.conjurer:
      case n.puppeteer:
        return UnitBaseClass.tag.sorcerer;
      case n.priest:
      case n.hermit:
        return UnitBaseClass.tag.healer;
      case n.assassin:
      case n.airScout:
      case n.ninja:
      case n.whipper:
        return UnitBaseClass.tag.scout;
      case n.shaman:
      case n.bard:
        return UnitBaseClass.tag.supporter;
    }
  }
}

type UnitBaseClassKey = keyof typeof UnitBaseClass.tag;
type UnitBaseClassTag = (typeof UnitBaseClass.tag)[UnitBaseClassKey];
export class UnitBaseClass {
  static readonly tag = {
    warrior: "ウォリアー",
    guardian: "ガーディアン",
    sniper: "スナイパー",
    sorcerer: "ソーサラー",
    healer: "ヒーラー",
    scout: "スカウト",
    supporter: "サポーター",
  } as const;

  static readonly list = Object.values(this.tag);
  static readonly keys = getKeys(this.tag);

  static parse(value: string | undefined): UnitBaseClassTag | undefined {
    return this.list.find((v) => v === value);
  }

  static isName(value: unknown): value is UnitBaseClassTag {
    return this.list.findIndex((v) => v === value) !== -1;
  }

  static getEquipmentKeys(value: UnitBaseClassKey): readonly UnitClassKey[] {
    return UnitClass.keys.filter((k) => {
      return this.tag[value] === UnitClass.baseTagOf(UnitClass.tag[k]);
    });
  }
}

// Element
const element = {
  fire: "火",
  water: "水",
  earth: "地",
  wind: "風",
  light: "光",
  dark: "闇",
} as const;
const elementColorList = {
  fire: tableColor.red,
  water: tableColor.blue,
  earth: tableColor.orange,
  wind: tableColor.green,
  light: tableColor.yellow,
  dark: tableColor.indigo,
} as const satisfies Record<keyof typeof element, TableColor>;
const elementList = getKeys(element);
type ElementKey = keyof typeof element;
const elementKey = Enum(elementList);
const elementValues = Object.values(element);
const elementEntries = getEntries(element);

export type Element = (typeof element)[ElementKey];
export const Element = {
  ...elementKey,
  list: elementList,
  name: element,
  nameList: elementValues,
  fieldFactor: elementFieldFactor,
  fieldRangeFactor: elementFieldRangeFactor,

  parse(value: string | undefined): Element | undefined {
    return elementValues.find((v) => v === value);
  },

  parseElements(
    arr: readonly string[] | undefined
  ): ReadonlySet<Element> | undefined {
    if (arr === undefined) {
      return;
    }
    const ret = new Set<Element>();
    arr.forEach((str) => {
      const v = this.parse(str);
      if (v !== undefined) {
        ret.add(v);
      }
    });
    return ret;
  },

  keyOf(value: Element): ElementKey {
    return elementEntries.find((v) => v[1] === value)?.[0] as ElementKey;
  },

  indexOf(value: Element | undefined): number | undefined {
    if (value === undefined) {
      return;
    }
    return elementValues.indexOf(value);
  },

  colorOf(value: Element | undefined): TableColor | undefined {
    if (value === undefined) {
      return;
    }
    return elementColorList[Element.keyOf(value)];
  },

  selectorOf(value: ElementKey) {
    return value;
  },

  isElement(value: unknown): value is Element {
    return elementValues.findIndex((v) => v === value) !== -1;
  },
} as const;

const species = {
  speciesNone: "なし",
  dragon: "ドラゴン",
  yokai: "妖怪",
  goblin: "ゴブリン",
  kobold: "コボルト",
  alien: "エイリアン",
  fairy: "妖精",
  demon: "悪魔",
  undead: "アンデッド",
} as const;
type SpeciesKey = keyof typeof species;
const SpeciesKey = Enum(getKeys(species));
const speciesValues = Object.values(species);
const speciesEntries = getEntries(species);
export type RawSpecies = Exclude<Species, typeof species.speciesNone>;
export type Species = (typeof species)[SpeciesKey];
export const Species = {
  name: species,
  nameList: speciesValues.filter((v) => v !== species.speciesNone),
  list: getKeys(species),
  key: SpeciesKey,

  find(value: string | undefined): Species | undefined {
    return speciesValues.find((v) => v === value);
  },

  parse(value: string | readonly string[] | undefined): readonly Species[] {
    if (Array.isArray(value)) {
      return value.map((v) => Species.find(v)).filter((v) => v !== undefined);
    } else {
      return [Species.find(value as string | undefined)].filter(
        (v) => v !== undefined
      );
    }
  },

  getKeys(list: readonly Species[]): readonly SpeciesKey[] {
    const ret = list
      .map((v) => Species.keyOf(v))
      .filter((v) => v !== undefined);
    if (ret.length > 0) {
      return ret;
    } else {
      return [SpeciesKey.speciesNone];
    }
  },

  keyOf(value: unknown): SpeciesKey | undefined {
    return speciesEntries.find((v) => v[1] === value)?.[0];
  },

  isSpecies(
    value: unknown
  ): value is Exclude<Species, typeof species.speciesNone> {
    return (
      speciesValues.findIndex(
        (v) => v === value && v !== species.speciesNone
      ) !== -1
    );
  },

  indexOf(value: readonly Species[]): number | undefined {
    const indexes = value.map((v) => speciesValues.indexOf(v));
    return Math.min(...indexes);
  },
} as const;

export class TokenType {
  static readonly list = ["isNotToken", "isToken"] as const;
  static readonly key = Enum(this.list);
  static readonly desc = {
    isNotToken: "非トークン",
    isToken: "トークン",
  } as const satisfies Record<TokenTypeKey, string>;
}
export type TokenTypeKey = (typeof TokenType.list)[number];

type RawTargetTag =
  | typeof target.self
  | typeof target.inRange
  | typeof target.block
  | typeof target.all
  | typeof target.hit;
export type RawTarget = number | RawTargetTag | readonly number[];
export type JsonTarget = number | string | number[];
export const JsonTarget = {
  parse(value: JsonTarget | undefined): TargetBase | undefined {
    if (Array.isArray(value) && value.every((v) => typeof v === "number")) {
      return value;
    }
    switch (typeof value) {
      case "number":
        return value;
      case "string":
        switch (value) {
          case Target.inRange:
            return Infinity;
          case Target.self:
          case Target.all:
          case Target.other:
          case Target.block:
          case Target.hit:
            return value;
        }
    }
  },
} as const;
const target = {
  self: "自分",
  all: "全体",
  other: "他者",
  inRange: "射程内",
  block: "ブロック",
  hit: "命中",
} as const;
export type Target =
  | number
  | typeof target.self
  | typeof target.all
  | typeof target.other
  | typeof target.hit
  | number[];
export type TargetBase = Target | typeof target.block;
export const Target = {
  ...target,

  sum(target: Target, ...values: number[]): Target {
    if (typeof target === "number") {
      return (target += values.reduce((a, c) => a + c, 0));
    }
    return target;
  },

  isNumber(value: Target | undefined): value is number {
    return typeof value === "number";
  },

  getBlockTarget(
    value: TargetBase | undefined,
    block: number | undefined
  ): Target | undefined {
    return value === Target.block ? block : value;
  },

  getString(value: Target): string {
    const getStr = (value: number) => `${value}体`;
    switch (value) {
      case Infinity:
        return target.inRange;
      default:
        if (typeof value === "number") {
          return getStr(value);
        }
        if (Array.isArray(value)) {
          return value.map((n) => getStr(n)).join(" or ");
        }
        return value;
    }
  },
} as const;

const moveType = {
  normal: "地上",
  charging: "突進",
  flying: "飛行",
  warping: "ワープ",
  stealth: "隠密",
} as const;
type MoveTypeKey = keyof typeof moveType;
const moveTypeColor: Record<MoveTypeKey, TableColor | undefined> = {
  normal: undefined,
  charging: tableColor.yellow,
  flying: tableColor.green,
  warping: tableColor.red,
  stealth: tableColor.blue,
} as const;

type MoveTypeFilterKey = `movetype-${MoveTypeKey}`;
const getMoveTypeFilterKey = (key: MoveTypeKey): MoveTypeFilterKey =>
  `movetype-${key}`;
const moveTypeFilterKeys = getKeys(moveType).map((key) =>
  getMoveTypeFilterKey(key)
);
export type MoveType = (typeof moveType)[MoveTypeKey];
export const MoveType = {
  ...moveType,
  filterKeys: moveTypeFilterKeys,

  parse(value: string | undefined): MoveType | undefined {
    return Object.values(moveType).find((v) => v === value);
  },

  keyOf(value: MoveType): MoveTypeKey {
    return getEntries(moveType).find((v) => v[1] === value)?.[0] as MoveTypeKey;
  },

  indexOf(value: MoveType | undefined): number {
    return Object.values(moveType).findIndex((v) => v === value);
  },

  colorOf(value: MoveType | undefined): TableColor | undefined {
    if (value === undefined) {
      return;
    }
    return moveTypeColor[this.keyOf(value)];
  },

  getFilterKey: getMoveTypeFilterKey,

  parseFilterKey(key: MoveTypeFilterKey): MoveTypeKey {
    return key.replace("movetype-", "") as MoveTypeKey;
  },
} as const;

export type RawDamageType = Exclude<DamageType, typeof damageType.none> | null;
export const damageType = {
  physic: "物理",
  magic: "魔法",
  true: "貫通",
  heal: "回復",
  regenerate: "再生",
  absorb: "吸収",
  none: "なし",
} as const;
export const damageTypeColor: Record<
  keyof typeof damageType,
  TableColor | undefined
> = {
  physic: tableColor.blue,
  magic: tableColor.green,
  true: tableColor.red,
  heal: tableColor.yellow,
  regenerate: tableColor.yellow300,
  absorb: tableColor.yellow500,
  none: undefined,
} as const;
type DamageTypeKey = keyof typeof damageType;
const damageTypeList = getKeys(damageType);
const damageTypeKeys = Enum(damageTypeList);
export type DamageType = (typeof damageType)[DamageTypeKey];
export const DamageType = {
  ...damageType,
  list: damageTypeList,
  keys: damageTypeKeys,
  indexOf(value: DamageType | undefined): number | undefined {
    if (value === undefined) {
      return;
    }
    return Object.values(damageType).indexOf(value);
  },

  keyOf(value: DamageType | undefined): DamageTypeKey {
    if (value === undefined) {
      return this.keys.none;
    }
    return getEntries(damageType).find(
      (v) => v[1] === value
    )?.[0] as DamageTypeKey;
  },

  colorOf(value: DamageType | undefined): TableColor | undefined {
    if (value === undefined) {
      return;
    }
    return damageTypeColor[this.keyOf(value)];
  },

  isHeal(value: DamageType | undefined): boolean {
    switch (value) {
      case damageType.heal:
      case damageType.regenerate:
      case damageType.absorb:
        return true;
      default:
        return false;
    }
  },
} as const;
export type JsonDamageType = string | null;
export const JsonDamageType = {
  parse(value: JsonDamageType | undefined): DamageType | null | undefined {
    if (value === null) {
      return null;
    }
    return Object.values(damageType).find((v) => v === value);
  },
} as const;

export type RawPlacement = (typeof placement)[PlacementKey];
export type JsonPlacement = string;
export const JsonPlacement = {
  parse(value: JsonPlacement | undefined): Placement | undefined {
    if (value === undefined) {
      return;
    }
    return placementEntries.find((kvp) => kvp[1] === value)?.[0];
  },
} as const;
const placement = {
  vanguard: "近",
  rearguard: "遠",
  omniguard: "両",
  servant: "付",
  target: "的",
} as const;
const placementEntries = getEntries(placement);
const placementColor = {
  vanguard: tableColor.red,
  rearguard: tableColor.green,
  omniguard: tableColor.yellow,
  servant: tableColor.orange,
  target: tableColor.indigo,
} as const satisfies Record<PlacementKey, TableColor>;
const placementDesc = {
  vanguard: "近接",
  rearguard: "遠距離",
  omniguard: "遠近両用",
  servant: "付与トークン",
  target: "照準トークン",
} as const satisfies Record<PlacementKey, string>;
const placementKeys = getKeys(placement);
type PlacementKey = keyof typeof placement;
export type Placement = PlacementKey | undefined;
export const Placement = {
  ...Enum(placementKeys),
  name: placement,
  list: placementKeys,
  desc: placementDesc,
  color: placementColor,
  index: (() => {
    type Index = Record<PlacementKey, number>;
    const ret: Partial<Index> = {};
    placementEntries.forEach((kvp, i) => {
      ret[kvp[0]] = i;
    });
    return ret as Index;
  })(),

  indexOf(value: Placement): number {
    if (value === undefined) {
      return -1;
    }
    return this.index[value];
  },

  hasMoveType(value: Placement): boolean {
    switch (value) {
      case undefined:
      case Placement.servant:
      case Placement.target:
        return false;
      default:
        return true;
    }
  },
} as const;

export type JsonPotentials = string[];
export const JsonPotentials = {
  parse(value: readonly string[] = []): readonly (Potential | undefined)[] {
    return value
      .slice(0, 5)
      .map((p) => potentialList.find((v) => v.name === p)?.name);
  },

  toSet(src: Readonly<JsonPotentials> = []): Set<Potential> {
    const ret = src.filter(
      (str) => Potential.list.find((v) => v.name === str) !== undefined
    );
    return new Set(ret as Potential[]);
  },
} as const;
interface PotentialEffect {
  name: string;
  stat: StatType | null;
  value: number;
}
const potentialList = [
  { name: "出撃コスト-1", stat: stat.cost, value: -1 },
  { name: "出撃コスト-2", stat: stat.cost, value: -2 },
  { name: "最大HP+400", stat: stat.hp, value: 400 },
  { name: "最大HP+600", stat: stat.hp, value: 600 },
  { name: "攻撃力+50", stat: stat.attack, value: 50 },
  { name: "攻撃力+75", stat: stat.attack, value: 75 },
  { name: "攻撃力+120", stat: stat.attack, value: 120 },
  { name: "物理防御力+60", stat: stat.defense, value: 60 },
  { name: "物理防御力+90", stat: stat.defense, value: 90 },
  { name: "魔法防御力+60", stat: stat.resist, value: 60 },
  { name: "魔法防御力+90", stat: stat.resist, value: 90 },
  { name: "攻撃速度+10", stat: stat.attackSpeed, value: 10 },
  { name: "攻撃速度+15", stat: stat.attackSpeed, value: 15 },
  { name: "射程+10", stat: stat.range, value: 10 },
  { name: "射程+15", stat: stat.range, value: 15 },
  { name: "移動消費コスト-2", stat: stat.moveCost, value: -2 },
  { name: "移動速度1.5倍", stat: stat.moveSpeed, value: 50 },
  { name: "再出撃時間50%短縮", stat: null, value: 50 },
  { name: "トークン所持数+1", stat: null, value: 1 },
  { name: "トークン所持数+2", stat: null, value: 2 },
  { name: "攻撃対象数+1", stat: stat.target, value: 1 },
  { name: "近接マスに配置可能", stat: stat.placement, value: 1 },
  { name: "スキル再使用時間-4秒", stat: stat.cooldown, value: -4 },
  { name: "スキル再使用時間-6秒", stat: stat.cooldown, value: -6 },
  { name: "スキル初回待ち時間-6秒", stat: stat.initialTime, value: -6 },
  { name: "スキル初回待ち時間-12", stat: stat.initialTime, value: -12 },
  { name: "物理ダメージ20%軽減", stat: stat.physicalDamageCut, value: 20 },
  { name: "魔法ダメージ20%軽減", stat: stat.magicalDamageCut, value: 20 },
  { name: "物理攻撃回避40%", stat: stat.physicalEvasion, value: 40 },
  { name: "魔法攻撃回避40%", stat: stat.magicalEvasion, value: 40 },
  { name: "HPが毎秒3%回復", stat: null, value: 3 },
  { name: "攻撃時最大HPの1%回復", stat: null, value: 1 },
  { name: "CRI率/CRI率上限+20%", stat: stat.criticalChance, value: 20 },
  { name: "CRI率/CRI率上限+20%", stat: stat.criticalChanceLimit, value: 20 },
  { name: "CRI率/CRI率上限+30%", stat: stat.criticalChance, value: 30 },
  { name: "CRI率/CRI率上限+30%", stat: stat.criticalChanceLimit, value: 30 },
  { name: "CRIダメージ+50%", stat: stat.criticalDamage, value: 50 },
  { name: "配置時バリア1500", stat: null, value: 1 },
  { name: "スキル時バリア1000", stat: null, value: 1 },
  { name: "HP+600、攻撃力+75", stat: stat.hp, value: 600 },
  { name: "HP+600、攻撃力+75", stat: stat.attack, value: 75 },
  { name: "攻撃時スタン蓄積+10", stat: null, value: 10 },
  { name: "攻撃時毒確率+20%", stat: null, value: 1 },
  { name: "地属性マスボーナス3倍", stat: null, value: 3 },
  { name: "スタン耐性+50", stat: stat.supplements, value: 50 },
  { name: "移動時スキル継続", stat: null, value: 1 },
  { name: "火傷の敵へ与ダメ1.2倍", stat: null, value: 1 },
  { name: "スキル時ACT+30%", stat: null, value: 1 },
  { name: "凍結無効", stat: null, value: 1 },
  { name: "30%で貫通攻撃", stat: stat.penetration, value: 30 },
  { name: "スタン無効", stat: null, value: 1 },
  { name: "回復量20%上昇", stat: null, value: 1 },
] as const satisfies PotentialEffect[];
export type Potential = (typeof potentialList)[number]["name"];
export const Potential = {
  list: potentialList,

  getEffectValue(
    statType: StatType,
    potentials: readonly (Potential | undefined)[]
  ): number {
    return potentials
      .map((p) => {
        return (
          potentialList.find((src) => src.stat === statType && src.name === p)
            ?.value ?? 0
        );
      })
      .reduce((a: number, c) => a + c, 0);
  },

  filter(
    statType: StatType,
    potentials: readonly (Potential | undefined)[]
  ): ReadonlySet<Potential> {
    const ret = new Set<Potential>();
    potentials.forEach((p) => {
      if (
        p !== undefined &&
        potentialList.findIndex(
          (src) => src.stat === statType && src.name === p
        ) !== -1
      ) {
        ret.add(p);
      }
    });
    return ret;
  },
};

export type JsonWeapon = Weapon;
export type Weapon = Readonly<{
  weaponName: string;
  hp?: number;
  attack?: number;
  defense?: number;
  resist?: number;
  attackSpeed?: number;
  block?: number;
  range?: number;
  hpMul?: number;
  attackMul?: number;
  moveSpeedMul?: number;
}>;
export const Weapon = {
  isKey(key: string): key is keyof Weapon {
    const list: (keyof Weapon)[] = [
      stat.hp,
      stat.attack,
      stat.defense,
      stat.resist,
      stat.attackSpeed,
      stat.block,
      stat.range,
    ];
    return list.findIndex((v) => v === key) !== -1;
  },

  isApplied({ weapon }: Setting): boolean {
    return weapon === "all" || weapon === "partial";
  },
} as const;

// 出典：Wiki
// export const attackSpeedList = {
//   80: 50,
//   85: 47,
//   90: 45,
//   95: 43,
//   100: 40,
//   102: 40,
//   105: 39,
//   110: 37,
//   112: 36,
//   113: 36,
//   115: 35,
//   116: 35,
//   118: 35,
//   119: 34,
//   120: 34,
//   121: 34,
//   122: 33,
//   123: 33,
//   125: 33,
//   126: 32,
//   127: 32,
//   128: 32,
//   129: 32,
//   130: 32,
//   131: 31,
//   132: 31,
//   134: 31,
//   135: 30,
//   136: 30,
//   137: 30,
//   138: 30,
//   139: 30,
//   140: 29,
//   141: 29,
//   142: 29,
//   143: 29,
//   144: 29,
//   146: 28,
//   147: 28,
//   149: 28,
//   152: 27,
//   153: 27,
//   154: 27,
//   157: 26,
// } as const;
// export function getAttackSpeed<T extends number | undefined>(value: T): T {
//   if (value === undefined) return undefined as T;
//   if (value in attackSpeedList) {
//     return attackSpeedList[value as keyof typeof attackSpeedList] as T;
//   }
//   return NaN as T;
// }

export function getAttackSpeed<T extends number | undefined>(
  value: T
): number | Exclude<T, number> {
  // Wikiの表からの推測値
  if (value === undefined) {
    return value as Exclude<T, number>;
  }
  const V1 = 0.0595;
  const V2 = 4.7155;
  return Math.round(4000 / (value - (value * V1 - V2)));
}

export function getAttackSpeedFactors(
  agilityBuff: AttackSpeedAgility
): AttackSpeedFactors {
  const ability = agilityBuff.base + agilityBuff.ability;
  const weapon = ability + agilityBuff.weapon;
  const result = weapon + agilityBuff.potential;

  const attackSpeedBase = getAttackSpeed(agilityBuff.base);
  const subtotalAbility = getAttackSpeed(ability);
  const subtotalWeapon = getAttackSpeed(weapon);
  const attackSpeedResult = getAttackSpeed(result);

  const attackSpeedAbility = attackSpeedBase - subtotalAbility;
  const attackSpeedWeapon = subtotalAbility - subtotalWeapon;
  const attackSpeedPotential = subtotalWeapon - attackSpeedResult;
  return {
    attackSpeedAgility: agilityBuff,
    attackSpeedBase,
    attackSpeedAbility,
    attackSpeedWeapon,
    attackSpeedPotential,
    attackSpeedResult,
  };
}

export function getAttackSpeedFactorsSituation(
  factors: AttackSpeedFactors,
  agilityBuff: number
): AttackSpeedFactorsSituation {
  const { base, ability, weapon, potential } = factors.attackSpeedAgility;
  const result = getAttackSpeed(
    base + ability + weapon + potential + agilityBuff
  );
  const attackSpeedAgilityBuff = factors.attackSpeedResult - result;
  return {
    ...factors,
    attackSpeedAgilityBuff,
    attackSpeedResult: result,
  };
}

export interface StaticDamageFactor {
  readonly key: StaticDamageKey;
  readonly value: number;
  readonly reference: number;
  readonly result: number;
}

export class Penetration {
  static getValue(base: number, multiply: number): number {
    return 100 - ((100 - base) * (100 - multiply)) / 100;
  }
}

const statusName = {
  poison: "毒",
  blind: "暗闇",
  stan: "スタン",
  petrify: "石化",
  freeze: "凍結",
} as const;
type StatusKey = keyof typeof statusName;
type StatusValue = (typeof statusName)[StatusKey];
export class Status {
  static names = statusName;
  private static list = getKeys(statusName);
  private static key = Enum(this.list);

  static getValueFromStatType(statType: StatType): StatusValue | undefined {
    switch (statType) {
      case stat.buffPoisonImmune:
        return statusName[this.key.poison];
      case stat.buffBlindImmune:
        return statusName[this.key.blind];
      case stat.buffStanImmune:
        return statusName[this.key.stan];
      case stat.buffPetrifyImmune:
        return statusName[this.key.petrify];
      case stat.buffFreezeImmune:
        return statusName[this.key.freeze];
    }
  }
}

const weatherName = {
  rain: "雨",
  blizzard: "吹雪",
} as const;
type WeatherKey = keyof typeof weatherName;
const weatherColor = {
  rain: tableColor.blue,
  blizzard: tableColor.blue900,
} as const satisfies Record<WeatherKey, TableColor>;
export type Weather = (typeof weatherName)[WeatherKey];
export const Weather = {
  values: Object.values(weatherName),
  entries: getEntries(weatherName),

  parse(rawValue: unknown): Weather | undefined {
    return this.values.find((v) => v === rawValue);
  },

  indexOf(weather: Weather | undefined): number | undefined {
    if (!weather) {
      return;
    }
    return Weather.values.indexOf(weather);
  },

  keyOf(weather: Weather | undefined): WeatherKey | undefined {
    return this.entries.find((kvp) => kvp[1] === weather)?.[0];
  },

  colorOf(weather: Weather | undefined): TableColor | undefined {
    const key = this.keyOf(weather);
    if (!key) {
      return;
    }
    return weatherColor[key];
  },
};

// Factors

export interface ColorFactor<T = number> {
  readonly result: T;
  readonly conditionPoint: number;
  readonly skillPoint: number;
  readonly buffPoint?: number;
}

export interface SkillNameFactors {
  readonly skillName: string | null | undefined;
  readonly annotations: readonly string[] | undefined;
  readonly phase: number | undefined;
  readonly phaseName: string | undefined;
  readonly isOverCharge: boolean | undefined;
}

export interface BarrackFactorsBase {
  readonly base: number;
  readonly potential: number;
  readonly weaponBase: number;
  readonly weaponUpgrade: number;
  readonly weaponBaseBuff: number | undefined;
  readonly baseBuff: number | undefined;
  readonly baseAdd: number;
  readonly subskillMul: number;
  readonly subskillAdd: number;
}
export interface BarrackFactors extends BarrackFactorsBase {
  readonly barrackResult: number;
}
export interface DeploymentFactorsBase extends BarrackFactors {
  readonly formationBuff: number;
  readonly beastFormationBuff: number;
  readonly beastPossLevel: number;
  readonly beastPossAmount: number;
  readonly typeBonusBuff: number;
}
export interface DeploymentFactors extends DeploymentFactorsBase {
  readonly deploymentResult: number;
}

export interface InBattleFactorsBase extends DeploymentFactors {
  readonly multiFactor: number;
  readonly additionFactor: number;
}
export interface InBattleFactors extends InBattleFactorsBase {
  readonly isMaxDamage: boolean;
  readonly isMinDamage: boolean;
  readonly inBattleResult: number;
}

export interface ActualHpFactors extends InBattleFactors {
  readonly isUnhealable: boolean;
  readonly currentFactor: number;
  readonly panelAdd: number;
  readonly actualResult: number;
}

export interface ActualAttackFactorsBase extends InBattleFactors {
  readonly damageFactor: number;
  readonly criticalChance: number;
  readonly criticalDamage: number;
  readonly staticDamage: StaticDamageFactor | undefined;
  readonly isSupport: boolean;
}
export interface ActualAttackFactors extends ActualAttackFactorsBase {
  readonly actualResult: number;
  readonly criticalAttack: number;
}

export interface CriticalFactors {
  readonly skillColor: boolean | undefined;
  readonly buffColor: boolean | undefined;
  readonly result: number;
}

export interface ActualDefResFactors extends InBattleFactors {
  readonly staticDamage: StaticDamageFactor | undefined;
  readonly actualResult: number;
}

export interface PenetrationFactors {
  readonly base: number;
  readonly multiply: number;
}

export interface AttackSpeedAgility {
  readonly base: number;
  readonly ability: number;
  readonly weapon: number;
  readonly potential: number;
}

export interface AttackSpeedFactors {
  readonly attackSpeedAgility: AttackSpeedAgility;
  readonly attackSpeedBase: number;
  readonly attackSpeedAbility: number;
  readonly attackSpeedWeapon: number;
  readonly attackSpeedPotential: number;
  readonly attackSpeedResult: number;
}

export interface AttackSpeedFactorsSituation extends AttackSpeedFactors {
  readonly attackSpeedAgilityBuff: number;
}

export interface AttackSpeedInBattleFactors
  extends AttackSpeedFactorsSituation {
  readonly attackMotionMul: number | undefined;
  readonly attackSpeedBuff: number;
}

export interface DelayFactors {
  readonly delay: number | undefined;
  readonly delayMul: number | undefined;
  readonly delaySubtotal: number | undefined;
  readonly fixedDelay: number | undefined;
  readonly subskillBuff: number | undefined;
  readonly formationBuff: number | undefined;
  readonly beastFormationBuff: number | undefined;
  readonly result: number | undefined;
}

export interface ActualIntervalFactors {
  readonly staticValue?: number;
  readonly base: IntervalBaseFactors | undefined;
  readonly actualResult: number | undefined;
}
export interface IntervalBaseFactors
  extends AttackSpeedInBattleFactors,
    DelayFactors {
  readonly delayResult: number;
  readonly skillColor: TableColor | undefined;
  readonly buffColor: TableColor | undefined;
  readonly conditionalColor: TableColor | undefined;
  readonly result: number;
}
export interface IntervalFactors extends ActualIntervalFactors {
  readonly cooldown?: number;
  readonly cooldownFrame?: number;
  readonly minInterval?: number | undefined;
  readonly staticCooldown?: boolean;
  readonly result?: number;
}

export interface BlockFactors {
  readonly base: number;
  readonly skill: number;
  readonly feature: number;
  readonly condFeature: number;
  readonly result: number;
}

export interface TargetFactors {
  readonly target: Target;
  readonly isBlock: boolean;
  readonly splash: boolean;
  readonly rounds: Rounds;
  readonly wideTarget: boolean;
  readonly laser: boolean;
  readonly color?: TableColor | undefined;
}

export interface RangeFactor extends Partial<DeploymentFactors> {
  readonly fixedRange: number | undefined;
  readonly multiply: number;
  readonly addition: number;
  readonly subtotal: number;
  readonly result: number;
  readonly color: TableColor | undefined;
}

export interface LimitFactors {
  readonly result: number;
  readonly hp: number;
  readonly defres: number;
  readonly isMaxDefres: boolean;
  readonly attackDebuff: number;
  readonly isMaxAttackDebuff: boolean;
  readonly damageCut: number;
  readonly evasion: number;
  readonly isUnhealable: boolean;
}

export interface DamageCutFactors {
  readonly supplement: number;
  readonly generalSupplement: number;
  readonly condColor: boolean | undefined;
  readonly skillCondColor: boolean | undefined;
  readonly result: number;
}

export interface EvasionFactors {
  readonly condColor: boolean | undefined;
  readonly skillColor: boolean;
  readonly result: number;
}

export interface DurationFactors {
  readonly skill: number | typeof Duration.single | undefined;
  readonly feature: number | typeof Duration.always | null | undefined;
  readonly isExtraDamage: boolean;
  readonly isAction: boolean;
  readonly interval: number;
  readonly parentText: string | undefined;
  readonly inBattleBuff?: number | typeof Duration.always | undefined;
}
export interface DurationFactorsResult extends DurationFactors {
  readonly result: number | undefined;
}

export interface CooldownFactors {
  readonly base: number | undefined;
  readonly feature: number;
  readonly potential: number;
  readonly subskill: number;
  readonly isOverCharge: boolean | undefined;
  readonly isExtraDamage: boolean | undefined;
  readonly baseResult: number | undefined;
  readonly result: number | undefined;
}

export interface DpsFactorsBase {
  readonly attack: number;
  readonly baseDefres: number;
  readonly defres: number;
  readonly defresDebuff: number | undefined;
  readonly minDefres: number;
  readonly isMinDefres: boolean;
  readonly criticalChance: number;
  readonly criticalDamage: number;
  readonly penetration: number;
  readonly damageCut: number;
  readonly typeDamageCut: number;
  readonly damageDebuff: number;
  readonly typeDamageDebuff: number;
  readonly round: number;
  readonly hits: number;
  readonly interval: number;
  readonly damageType: DamageType | undefined;
}

export interface DpsFactors extends DpsFactorsBase {
  readonly normal: DpsFactorsDetail;
  readonly critical: DpsFactorsDetail;
  readonly nonPenetration: number;
  readonly nonCriticalChance: number;
  readonly frequency: number;
  readonly result: number;
}

interface DpsFactorsDetail {
  readonly attack: number;
  readonly minDamage: number;
  readonly isMinDamage: boolean;
  readonly damage: number;
  readonly trueDamage: number;
  readonly damageAmount: number;
}

export interface MoveSpeedFactors {
  readonly base: number;
  readonly formation: number;
  readonly beastFormation: number;
  readonly multiply: number;
  readonly addition: number;
  readonly subskillAdd: number;
  readonly result: number;
}

// Setting

const beastList = [
  "ヴィヴィヴァーチェ",
  "ニーズホッグ",
  "ファロルーチェ",
  "パズズ",
  "ソラス",
  "ベヒモス",
  "ビッキーヌ",
  "ヴィヴィヴァーチェ：メイド服",
  "セーラ",
  "リーファー",
  "天逆毎姫",
  "パニエ",
  "四神",
] as const;
export type Beast = (typeof beastList)[number];
export const Beast = {
  list: beastList,

  getPossAmountFactor(setting: Setting, statType: MainStatType): number {
    const value = setting.possBuffAmount;
    if (statType !== stat.hp || value < 0 || value > 10) {
      return 0;
    }
    return value * 100;
  },

  getPossLevelFactor(setting: Setting, statType: MainStatType): number {
    const value = setting.possBuffLevel;
    return (
      (() => {
        if (setting.possBuffAmount === -1) {
          return 0;
        }
        if (value < 0 || value > MAX_POSS_BUFF_LEVEL) {
          return 0;
        }
        switch (statType) {
          case stat.attack:
            return Math.trunc((value + 2) / 3);
          case stat.defense:
            return Math.trunc((value + 1) / 3);
          case stat.resist:
            return Math.trunc(value / 3);
          default:
            return 0;
        }
      })() + 100
    );
  },

  isFormationFactorAdd(statType: StatType): boolean {
    switch (statType) {
      case stat.cost:
      case stat.range:
      case stat.moveSpeed:
      case stat.buffRange:
        return true;
    }
    return false;
  },
} as const;
