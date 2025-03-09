import jsonWord from "@/assets/word.json";
import { type Setting, type States } from "./States";

/* 
TODOリスト
  移動攻撃
  Condition 検索
  HP回復不可 Tooltip
  potential 太字
  配置数に含まれるかどうか
  フィルター状況を見やすく(例：飛行特効)
  situationをunitにまとめてリジェネや吸収を自動表示できるようにする
  condition 特効の内容を表示
  8体以上同一属性編成
  Buffページに潜在覚醒ボーナスを適用
*/

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
    if (values.length > 2) return this.multiply(ret, ...values.slice(2));
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
}

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

// Stat

const statTypeList = [
  "unitId",
  "unitName",
  "unitShortName",
  "rarity",
  "className",
  "element",
  "species",
  "skillName",
  "cost",
  "hp",
  "attack",
  "defense",
  "resist",
  "interval",
  "attackSpeed",
  "delay",
  "block",
  "target",
  "round",
  "hits",
  "splash",
  "range",
  "moveSpeed",
  "moveType",
  "criticalChance",
  "criticalDamage",
  "criticalChanceLimit",
  "criticalDamageLimit",
  "penetration",
  "damageType",
  "placement",
  "exSkill1",
  "exSkill2",
  "potentials",
  "situationId",
  "physicalLimit",
  "magicalLimit",
  "supplements",
  "initialTime",
  "duration",
  "cooldown",
  "dps0",
  "dps1",
  "dps2",
  "dps3",
  "dps4",
  "dps5",
  "conditions",
  "fieldBuffFactor",
] as const satisfies (keyof typeof jsonWord)[];
export type StatType = (typeof statTypeList)[number];
export const stat = Enum(statTypeList);
export const StatType = {
  isKey: (key: string | number | symbol): key is StatType => key in stat,
  nameOf: (value: StatType): string => jsonWord[value],
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

const jsonConditionTexts = {
  hp: "HP",
  block: "BL",
  team: "t",
  beat: "倒",
  melee: "近",
  ranged: "遠",
  heal: "癒",
  absorb: "吸",
  proper: "特",
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
const conditionTexts = {
  ...jsonConditionTexts,
  multiply: "×",
} as const;
type ConditionKey = keyof typeof conditionTexts;
export const condition = Enum(Object.keys(conditionTexts) as ConditionKey[]);
export type Condition = KeyValuePair<ConditionKey, number | undefined>;
export type JsonCondition = string | KeyValuePair<string, number>;
export const JsonCondition = {
  parse(list: readonly JsonCondition[] | undefined): Condition[] | undefined {
    if (list === undefined) return;
    const fn = (obj: JsonCondition): Condition | undefined => {
      for (const kvp of Object.entries(jsonConditionTexts)) {
        const key = kvp[0] as ConditionKey;
        const value = kvp[1];
        if (value === obj) {
          return {
            key,
            value: undefined,
          };
        }
        if (typeof obj === "object" && value === obj.key) {
          return {
            key,
            value: obj.value,
          };
        }
      }
    };
    return list.map((v) => fn(v)).filter((v) => v !== undefined);
  },
};
export const Condition = {
  ...condition,

  of(...lists: (readonly Condition[] | undefined)[]): Condition[] {
    const ret: Condition[] = [];
    lists.forEach((list) =>
      list?.forEach((kvp) => {
        if (!ret.find((r) => r.key === kvp.key)) ret.push(kvp);
      })
    );
    return ret;
  },

  toSorted(list: readonly Condition[]): Condition[] {
    const fn = (c: Condition) => {
      return Object.keys(conditionTexts).findIndex((v) => v === c.key);
    };
    return list.toSorted((a, b) => fn(a) - fn(b));
  },

  textOf(list: readonly Condition[]): string {
    return list
      .map((v) => {
        const a = conditionTexts[v.key];
        const b = v.value !== undefined ? `${v.value}` : "";
        switch (v.key) {
          case condition.hit:
            const s = (v.value ?? 0) > 1 ? a + "s" : a;
            return b + s + " ";
          case condition.second:
            return b + a + " ";
          default:
            return a + b + (v.value !== undefined ? " " : "");
        }
      })
      .join("");
  },
} as const;

const staticDamage = {
  HP_BASE: "hp-base",
  ATTACK_BASE: "attack-base",
  DEFENSE_BASE: "defense-base",
  RESIST_BASE: "resist-base",
  STATIC: "static",
  TIME: "time",
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
] as const;
type StaticDamageKey = (typeof staticDamageKeyList)[number];

export type StaticDamage =
  | {
      key: Exclude<StaticDamageKey, typeof staticDamage.TIME>;
      value: number;
    }
  | {
      key: typeof staticDamage.TIME;
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
    if (src === undefined) return;
    if (staticDamageKeyList.findIndex((k) => k === src.key) !== -1) {
      if (src.key !== staticDamage.TIME || src.time !== undefined) {
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
        return "累積数";
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
      case staticDamage.ATTACK_BASE:
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
    | typeof staticDamage.ATTACK_BASE
    | typeof AttackDebuff.enemyAttack;
  readonly value: number;
};
export const AttackDebuff = {
  enemyAttack: "enemy-attack",
} as const;

type DefresDebuff = DebuffAdd | DebuffMul;
interface DebuffAdd {
  readonly time: number;
  readonly valueAdd: number;
}
interface DebuffMul {
  readonly valueMul: number;
}
export const Debuff = {
  calculate(
    obj: DefresDebuff | number | undefined,
    interval: number,
    attackSpeed: number | undefined,
    defres: number
  ): number | undefined {
    if (obj === undefined || typeof obj === "number") return obj;
    if ("valueMul" in obj) {
      return (defres * obj.valueMul) / 100;
    } else {
      return (
        obj.valueAdd *
        Accumulation.calculate({ time: obj.time, attackSpeed, interval })
      );
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
    if (rounds === undefined) return undefined as Extract<T, undefined>;
    if (typeof rounds === "number") return rounds;

    return this.getAverageAndRatios(rounds)[0];
  },

  getAverageAndRatios(rounds: Rounds): [number, number] {
    if (typeof rounds === "number") return [rounds, 1];

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
    if (typeof value === "number") return value;
    return value as Rounds | Extract<T, undefined>;
  },
} as const;

interface SkillBase {
  skillName: string;
  isOverCharge?: boolean;
  conditions?: readonly Condition[];
  hpMul?: number;
  attackMul?: number;
  defenseMul?: number;
  resistMul?: number;
  damageFactor?: number;
  criChanceAdd?: number;
  criDamageAdd?: number;
  criChanceLimitAdd?: number;
  criDamageLimitAdd?: number;
  hpAddFlag?: boolean;
  attackAddFlag?: boolean;
  defenseAddFlag?: boolean;
  resistAddFlag?: boolean;
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
  const c = JsonCondition.parse(jsonSkill.conditions);
  if (c !== undefined) skill.conditions = c;

  const t = JsonTarget.parse(jsonSkill.target);
  if (t !== undefined) skill.target = t;

  if (jsonSkill.rounds !== undefined)
    skill.rounds = JsonRound.parse(jsonSkill.rounds);

  const d = JsonDamageType.parse(jsonSkill.damageType);
  if (d !== undefined) skill.damageType = d;
  {
    const v = jsonSkill.supplements;
    if (v !== undefined) skill.supplements = new Set(v);
  }
  const f = JsonSkillFeature.parse(jsonSkill.skillFeatures);
  if (f !== undefined) skill.skillFeatures = f;
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
    if (value === undefined) return;
    return value.map((v) => {
      const raw: Partial<Omit<JsonSkill, keyof JsonSkillDiff>> = v;
      const ret: Partial<SkillBase> = { ...raw };
      parseSkill(ret, v);
      return {
        featureName: v.featureName,
        ...ret,
      };
    });
  },
};

export type JsonDuration = number | string;
export const JsonDuration = {
  parse(value: number | string): number {
    if (typeof value === "number") return value;
    if (value === Duration.infinity) return Infinity;
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

export interface FormationBuff {
  readonly targets: ReadonlySet<
    typeof FormationBuff.all | Element | BaseClassName | Species
  >;
  readonly require: readonly FormationBuffRequire[];
  readonly hp?: number;
  readonly attack?: number;
  readonly defense?: number;
  readonly resist?: number;
  readonly delay?: number;
  readonly moveSpeed?: number;
  readonly potentialBonus?: Omit<
    FormationBuff,
    "targets" | "require" | "potentialBonus"
  >;
}
export const FormationBuff = {
  all: "全て",
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
              if (t === FormationBuff.all) return t;

              const ele = Element.parse(t);
              if (ele !== undefined) return ele;

              const cls = BaseClassName.parse(t);
              if (cls !== undefined) return cls;

              const spe = Species.parse(t);
              if (spe !== undefined) return spe;
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
} as const;
export type FormationBuffRequire =
  (typeof formationBuffRequire)[keyof typeof formationBuffRequire];
export const FormationBuffRequire = {
  ...formationBuffRequire,
  parse(value: string): FormationBuffRequire | undefined {
    for (const v of Object.values(formationBuffRequire)) {
      if (v === value) return v;
    }
  },
} as const;

// Unit

export type TableData<TData, TColumn extends keyof TData> = Readonly<{
  list: readonly TData[];
  columns: readonly TColumn[];
  comparer: (
    setting: Setting,
    key: TColumn,
    target: TData
  ) => string | number | undefined;
  filter: (states: States, list: readonly TData[]) => readonly TData[];
}>;

export const tableColor = {
  red: "c-red",
  blue: "c-blue",
  orange: "c-orange",
  green: "c-green",
  yellow: "c-yellow",
  indigo: "c-indigo",
  red100: "c-red-100",
  red300: "c-red-300",
  red500: "c-red-500",
  red700: "c-red-700",
  red900: "c-red-900",
  blue100: "c-blue-100",
  blue300: "c-blue-300",
  blue500: "c-blue-500",
  blue700: "c-blue-700",
  blue900: "c-blue-900",
  green100: "c-green-100",
  green300: "c-green-300",
  green500: "c-green-500",
  green700: "c-green-700",
  green900: "c-green-900",
  yellow100: "c-yellow-100",
  yellow300: "c-yellow-300",
  yellow500: "c-yellow-500",
  yellow600: "c-yellow-600",
  yellow800: "c-yellow-800",
} as const;
export type TableColor = (typeof tableColor)[keyof typeof tableColor];
export const tableColorAlias = {
  positive: tableColor.red,
  negative: tableColor.blue,
  positiveStrong: tableColor.red300,
  negativeStrong: tableColor.blue300,
  positiveWeak: tableColor.red100,
  negativeWeak: tableColor.blue100,
  warning: tableColor.yellow,
} as const;

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
    if (value === undefined) return;
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
} as const;

export const className = {
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
  shaman: "シャーマン",
  bard: "バード",
} as const;
export const classEquipmentName = {
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
  shaman: "霊枝",
  bard: "楽器",
} as const;
const baseClassName = {
  warrior: "ウォリアー",
  guardian: "ガーディアン",
  sniper: "スナイパー",
  sorcerer: "ソーサラー",
  healer: "ヒーラー",
  scout: "スカウト",
  supporter: "サポーター",
} as const;
type ClassEquipmentName =
  (typeof classEquipmentName)[keyof typeof classEquipmentName];
type BaseClassNameKey = keyof typeof baseClassName;
export type BaseClassName = (typeof baseClassName)[BaseClassNameKey];
export const BaseClassName = {
  parse(value: string | undefined): BaseClassName | undefined {
    return Object.values(baseClassName).find((v) => v === value);
  },
} as const;
export type ClassNameKey = keyof typeof className;
const classNameKeyList = Object.keys(className) as readonly ClassNameKey[];
const classNameKeys = Enum(classNameKeyList);
export type ClassName = (typeof className)[ClassNameKey];
export const ClassName = {
  keys: classNameKeys,
  names: className,
  baseNames: baseClassName,

  parse(value: string | undefined): ClassName | undefined {
    return Object.values(className).find((v) => v === value);
  },

  isKey(key: string): key is ClassNameKey {
    return Object.keys(className).includes(key);
  },

  indexOf(value: ClassName | undefined): number | undefined {
    if (value === undefined) return;
    return Object.values(className).indexOf(value);
  },

  keyOf(value: ClassName | undefined): ClassNameKey | undefined {
    if (value === undefined) return;
    return Object.entries(className).find((kvp) => kvp[1] === value)?.[0] as
      | ClassNameKey
      | undefined;
  },

  equipmentNameOf(
    value: ClassName | undefined
  ): ClassEquipmentName | undefined {
    const k = this.keyOf(value);
    if (k === undefined) return;
    return classEquipmentName[k];
  },

  baseNameOf(value: ClassName | undefined): BaseClassName | undefined {
    const n = this.names;
    switch (value) {
      case n.blader:
      case n.lancer:
      case n.barbarian:
      case n.monk:
        return baseClassName.warrior;
      case n.shieldKnight:
      case n.destroyer:
      case n.samurai:
        return baseClassName.guardian;
      case n.archer:
      case n.gunner:
        return baseClassName.sniper;
      case n.warlock:
      case n.conjurer:
      case n.puppeteer:
        return baseClassName.sorcerer;
      case n.priest:
      case n.hermit:
        return baseClassName.healer;
      case n.assassin:
      case n.airScout:
      case n.ninja:
        return baseClassName.scout;
      case n.shaman:
      case n.bard:
        return baseClassName.supporter;
    }
  },

  equipmentKeysOf(value: BaseClassNameKey): ClassNameKey[] {
    return classNameKeyList.filter((k) => {
      return baseClassName[value] === this.baseNameOf(className[k]);
    });
  },

  getBaseKeys(): BaseClassNameKey[] {
    return Object.keys(baseClassName) as BaseClassNameKey[];
  },
} as const;

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
const elementTextColor = {
  fire: "text-dark-red",
  water: "text-info",
  wind: "text-dark-teal",
  earth: "text-dark-earth",
  light: "text-warning",
  dark: "text-dark-indigo",
} as const satisfies Record<ElementKey, string>;
type ElementTextColor =
  (typeof elementTextColor)[keyof typeof elementTextColor];

const elementList = Object.keys(element) as readonly ElementKey[];
type ElementKey = keyof typeof element;
const elementKey = Enum(elementList);

export type Element = (typeof element)[ElementKey];
export const Element = {
  ...elementKey,
  list: elementList,
  name: element,
  fieldFactor: elementFieldFactor,
  fieldRangeFactor: elementFieldRangeFactor,

  parse(value: string | undefined): Element | undefined {
    return Object.values(element).find((v) => v === value);
  },

  parseElements(
    arr: readonly string[] | undefined
  ): ReadonlySet<Element> | undefined {
    if (arr === undefined) return;
    const ret = new Set<Element>();
    arr.forEach((str) => {
      const v = this.parse(str);
      if (v !== undefined) ret.add(v);
    });
    return ret;
  },

  keyOf(value: Element): ElementKey {
    return Object.entries(element).find(
      (v) => v[1] === value
    )?.[0] as ElementKey;
  },

  indexOf(value: Element | undefined): number | undefined {
    if (value === undefined) return;
    return Object.values(element).indexOf(value);
  },

  colorOf(value: Element | undefined): TableColor | undefined {
    if (value === undefined) return;
    return elementColorList[Element.keyOf(value)];
  },

  textColorOf(value: Element): ElementTextColor {
    return elementTextColor[Element.keyOf(value)];
  },
} as const;

const species = {
  dragon: "竜",
  goblin: "ゴブリン",
  kobold: "コボルト",
  yokai: "妖怪",
  fairy: "妖精",
  alien: "エイリアン",
  demon: "悪魔",
} as const;
type SpeciesKey = keyof typeof species;
export type Species = (typeof species)[SpeciesKey];
export const Species = {
  name: species,
  list: Object.keys(species) as SpeciesKey[],

  parse(value: string | undefined): Species | undefined {
    return Object.values(species).find((v) => v === value);
  },

  keyOf(value: unknown): SpeciesKey | undefined {
    return Object.entries(species).find((v) => v[1] === value)?.[0] as
      | SpeciesKey
      | undefined;
  },
} as const;

export type JsonTarget = number | string | number[];
export const JsonTarget = {
  parse(value: JsonTarget | undefined): TargetBase | undefined {
    if (Array.isArray(value) && value.every((v) => typeof v === "number"))
      return value;
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
    if (typeof target === "number")
      return (target += values.reduce((a, c) => a + c, 0));
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
        if (typeof value === "number") return getStr(value);
        if (Array.isArray(value))
          return value.map((n) => getStr(n)).join(" or ");
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
export type MoveType = (typeof moveType)[MoveTypeKey];
export const MoveType = {
  ...moveType,

  parse(value: string | undefined): MoveType | undefined {
    return Object.values(moveType).find((v) => v === value);
  },

  keyOf(value: MoveType): MoveTypeKey {
    return Object.entries(moveType).find(
      (v) => v[1] === value
    )?.[0] as MoveTypeKey;
  },

  indexOf(value: MoveType): number {
    return Object.values(moveType).findIndex((v) => v === value);
  },

  colorOf(value: MoveType) {
    return moveTypeColor[this.keyOf(value)];
  },
} as const;

export const damageType = {
  physical: "物理",
  magic: "魔法",
  true: "貫通",
  heal: "回復",
  regenerate: "再生",
  absorb: "吸収",
} as const;
export const damageTypeColor: Record<keyof typeof damageType, TableColor> = {
  physical: tableColor.blue,
  magic: tableColor.green,
  true: tableColor.red,
  heal: tableColor.yellow,
  regenerate: tableColor.yellow300,
  absorb: tableColor.yellow500,
} as const;
type DamageTypeKey = keyof typeof damageType;
export type DamageType = (typeof damageType)[DamageTypeKey];
export const DamageType = {
  ...damageType,
  indexOf(value: DamageType | undefined): number | undefined {
    if (value === undefined) return;
    return Object.values(damageType).indexOf(value);
  },

  keyOf(value: DamageType): DamageTypeKey {
    return Object.entries(damageType).find(
      (v) => v[1] === value
    )?.[0] as DamageTypeKey;
  },

  colorOf(value: DamageType | undefined): TableColor | undefined {
    if (value === undefined) return;
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
    if (value === null) return null;
    return Object.values(damageType).find((v) => v === value);
  },
} as const;

export type JsonPlacement = string;
export const JsonPlacement = {
  parse(value: JsonPlacement | undefined): Placement | undefined {
    if (value === undefined) return;
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
const placementEntries = Object.entries(placement) as [
  PlacementKey,
  (typeof placement)[PlacementKey]
][];
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
const placementKeys = Object.keys(placement) as PlacementKey[];
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
    if (value === undefined) return -1;
    return this.index[value];
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
  { name: "攻撃速度+15", stat: stat.attackSpeed, value: 15 },
  { name: "射程+10", stat: stat.range, value: 10 },
  { name: "射程+15", stat: stat.range, value: 15 },
  { name: "移動消費コスト-2", stat: null, value: -2 },
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
  { name: "物理ダメージ20%軽減", stat: stat.physicalLimit, value: 20 },
  { name: "魔法ダメージ20%軽減", stat: stat.magicalLimit, value: 20 },
  { name: "物理攻撃回避40%", stat: null, value: 40 },
  { name: "魔法攻撃回避40%", stat: null, value: 40 },
  { name: "HPが毎秒3%回復", stat: null, value: 3 },
  { name: "攻撃時最大HPの1%回復", stat: null, value: 1 },
  { name: "CRI率/CRI率上限+20%", stat: stat.criticalChance, value: 20 },
  { name: "CRI率/CRI率上限+20%", stat: stat.criticalChanceLimit, value: 20 },
  { name: "CRI率/CRI率上限+30%", stat: stat.criticalChance, value: 30 },
  { name: "CRI率/CRI率上限+30%", stat: stat.criticalChanceLimit, value: 30 },
  { name: "配置時バリア1500", stat: null, value: 1 },
  { name: "HP+600、攻撃力+75", stat: stat.hp, value: 600 },
  { name: "HP+600、攻撃力+75", stat: stat.attack, value: 75 },
  { name: "攻撃時スタン蓄積+10", stat: null, value: 10 },
  { name: "攻撃時毒確率+20%", stat: null, value: 1 },
  { name: "地属性マスボーナス3倍", stat: null, value: 3 },
  { name: "スタン耐性+50", stat: null, value: 50 },
  { name: "移動時スキル継続", stat: null, value: 1 },
  { name: "火傷の敵へ与ダメ1.2倍", stat: null, value: 1 },
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
      )
        ret.add(p);
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
      stat.block,
      stat.range,
    ];
    return list.findIndex((v) => v === key) !== -1;
  },

  isApplied({ weapon }: Setting): boolean {
    return weapon === "all" || weapon === "partial";
  },
} as const;

export const attackSpeedList = {
  80: 50,
  85: 47,
  90: 45,
  95: 43,
  100: 40,
  102: 40,
  105: 39,
  110: 37,
  113: 36,
  115: 35,
  116: 35,
  118: 35,
  119: 34,
  120: 34,
  121: 34,
  122: 33,
  123: 33,
  125: 33,
  126: 32,
  128: 32,
  129: 32,
  130: 32,
  131: 31,
  132: 31,
  134: 31,
  135: 30,
  136: 30,
  137: 30,
  138: 30,
  139: 30,
  140: 29,
  141: 29,
  142: 29,
  143: 29,
  144: 29,
  146: 28,
  149: 28,
  152: 27,
  153: 27,
  154: 27,
  157: 26,
} as const;
export function getAttackSpeed<T extends number | undefined>(value: T): T {
  if (value === undefined) return undefined as T;
  if (value in attackSpeedList) {
    return attackSpeedList[value as keyof typeof attackSpeedList] as T;
  }
  return NaN as T;
}

export interface StaticDamageFactor {
  readonly key: StaticDamageKey;
  readonly value: number;
  readonly reference: number;
  readonly result: number;
}

// Factors

export interface ColorFactor<T = number> {
  readonly result: T;
  readonly conditionPoint: number;
  readonly skillPoint: number;
  readonly buffPoint?: number;
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
  readonly currentFactor: number;
  readonly inBattleResult: number;
}
export interface ActualAttackFactorsBase extends InBattleFactors {
  readonly damageFactor: number;
  readonly criticalChance: number;
  readonly criticalDamage: number;
  readonly staticDamage: StaticDamageFactor | undefined;
}
export interface ActualAttackFactors extends ActualAttackFactorsBase {
  readonly actualResult: number;
  readonly criticalAttack: number;
}

export interface CriticalFactors {
  readonly skillColor: TableColor | undefined;
  readonly result: number;
}

export interface ActualDefResFactors extends InBattleFactors {
  readonly staticDamage: StaticDamageFactor | undefined;
  readonly actualResult: number;
}

export interface AttackSpeedFactors {
  readonly attackSpeedBase: number | undefined;
  readonly attackSpeedPotential: number;
  readonly fixedAttackSpeed: number | undefined;
  readonly attackSpeedResult: number;
}

export interface AttackSpeedInBattleFactors extends AttackSpeedFactors {
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
  readonly lancerTarget: boolean;
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
  readonly damageDebuff: number;
  readonly trueDamageDebuff: number;
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
    if (statType !== stat.hp || value < 0 || value > 10) return 0;
    return value * 100;
  },

  getPossLevelFactor(setting: Setting, statType: MainStatType): number {
    const value = setting.possBuffLevel;
    return (
      (() => {
        if (setting.possBuffAmount === -1) return 0;
        if (value < 0 || value > MAX_POSS_BUFF_LEVEL) return 0;
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
        return true;
    }
    return false;
  },
} as const;
