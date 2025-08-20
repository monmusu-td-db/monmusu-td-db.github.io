"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import * as Data from "./Data";

// Constants

const ALL = "all";
const PARTIAL = "partial";
const NONE = "none";
const SAME = "same";
type Status1 = typeof ALL | typeof PARTIAL | typeof NONE;
type Status2 = typeof NONE | typeof SAME;
const STORAGE_LOCAL = "local";
const STORAGE_SESSION = "session";
type SaveStatus = typeof STORAGE_LOCAL | typeof STORAGE_SESSION;
const DEFAULT_SAVE_OPTION = STORAGE_LOCAL;
const TYPE_ENABLED = "enabled";
const TYPE_DISABLED = "disabled";
type TypeBonusStatus = typeof TYPE_ENABLED | typeof TYPE_DISABLED;
const TYPE_CC1 = "cc1";
const TYPE_CC4 = "cc4";
const TYPE_EQUIPMENT = "equipment";
const DEFAULT_CLASS_NAME_TYPE = TYPE_EQUIPMENT;
type ClassNameTypeStatus =
  | typeof TYPE_CC1
  | typeof TYPE_CC4
  | typeof TYPE_EQUIPMENT;

// Utilities

type ValidationFunc = (value: unknown) => boolean;
class Valid {
  static isNumber(value: unknown): value is number {
    return typeof value === "number";
  }

  static isMul(value: unknown): boolean {
    return typeof value === "number" && value >= 0 && value < 1000;
  }

  static isAdd(value: unknown): boolean {
    return typeof value === "number" && value > -100000 && value < 100000;
  }

  static isCut(value: unknown): boolean {
    return typeof value === "number" && value >= 0 && value <= 100;
  }

  static isDamageCut(value: unknown): boolean {
    return typeof value === "number" && value > -1000 && value <= 100;
  }

  static isDamageCutPos(value: unknown): boolean {
    return typeof value === "number" && value >= 0 && value <= 100;
  }

  static isAttackSpeed(value: unknown): boolean {
    return typeof value === "number" && value >= -50 && value <= 100; // TODO下限値を調べる
  }

  static isCooldownCut(value: unknown): boolean {
    return typeof value === "number" && value >= 0 && value <= 100;
  }

  static isBeast(value: unknown): boolean {
    return (
      Valid.isNumber(value) && value >= -1 && value < Data.Beast.list.length
    );
  }

  static isEnemyDefense(value: unknown): boolean {
    return typeof value === "number" && value >= 0 && value <= 100000;
  }

  static isStatus1(value: unknown): value is Status1 {
    return value === ALL || value === PARTIAL || value === NONE;
  }

  static isStatus2(value: unknown): value is Status1 {
    return value === NONE || value === SAME;
  }

  static isDps(value: unknown): boolean {
    return Valid.isNumber(value) && value >= 0 && value < 100000;
  }

  static isSaveStatus(value: unknown): value is SaveStatus {
    return value === STORAGE_LOCAL || value === STORAGE_SESSION;
  }

  static isSameElement(value: unknown): value is number {
    return typeof value === "number" && (value === 0 || value === 8);
  }

  static isTypeBonus(value: unknown): value is TypeBonusStatus {
    return value === TYPE_ENABLED || value === TYPE_DISABLED;
  }

  static isClassNameTypeStatus(value: unknown): value is ClassNameTypeStatus {
    switch (value) {
      case TYPE_CC1:
      case TYPE_CC4:
      case TYPE_EQUIPMENT:
        return true;
    }
    return false;
  }
}

// Types

export interface States {
  filter: Filter;
  setting: Setting;
  query: string;
  uISetting: UISetting;
}

// Filter

const filterRarityKeys = Data.Rarity.list;
type FilterRarity = (typeof filterRarityKeys)[number];

const filterElementKeys = Data.Element.list;
type FilterElement = (typeof filterElementKeys)[number];

const filterSpeciesKeys = Data.Species.list;
type FilterSpecies = (typeof filterSpeciesKeys)[number];

const filterUnitClassKeys = Data.UnitClass.keys;
export type FilterUnitClass = (typeof filterUnitClassKeys)[number];
export const FilterUnitClass = {
  keys: filterUnitClassKeys,

  getKeys(filter: Filter): ReadonlySet<FilterUnitClass> {
    const ret = new Set<FilterUnitClass>();
    for (const [k, v] of filter.entries()) {
      if (v && this.isKey(k)) {
        ret.add(k);
      }
    }
    return ret;
  },

  isKey(key: unknown): key is FilterUnitClass {
    return filterUnitClassKeys.findIndex((k) => k === key) !== -1;
  },
} as const;

export type FilterConditionKey = (typeof FilterCondition.list)[number];
type FilterConditionKeyExcludeNormal = Exclude<FilterConditionKey, "normal">;
type FilterConditionGroup = (typeof FilterCondition.groups)[number];

export class FilterCondition {
  private static readonly classKey = Data.UnitClass.key;

  static readonly groups = [
    "definite",
    "action",
    "definiteAction",
    "blader",
    "barbarian",
    "shieldKnight",
    "destroyer",
    "warlock",
    "conjurer",
    "assassin",
    "ninja",
    "whipper",
    "shaman",
    "bard",
  ] as const;
  static readonly groupKeys = Data.Enum(this.groups);

  static readonly list = [
    "normal",
    "definite",
    "action",
    "definiteAction",
    "bladerCharge1",
    "bladerCharge2",
    "bladerCharge3",
    "barbarianAttackAdd",
    "barbarianAddAct",
    "shieldKnightRanged",
    "shieldKnightRangedAction",
    "destroyerRanged",
    "warlockAttackMul1",
    "warlockAttackMul2",
    "conjurerEnemy1",
    "conjurerEnemy2",
    "assassinAttackMul1",
    "assassinAttackMul2",
    "ninjaFire",
    "ninjaWater",
    "ninjaWind",
    "ninjaEarth",
    "ninjaStealth",
    "whipperDebuff",
    "whipperDebuffAction",
    "shamanBuff",
    "bardBuff",
    "bardBuffDefinite",
    "bardDebuff",
  ] as const;
  static readonly keys = Data.Enum(this.list);

  private static readonly names = {
    normal: "通常",
    definite: "クラス特効",
    action: "クラスACT",
    definiteAction: "特効&ACT",
    bladerCharge1: "曲刀 チャージ1",
    bladerCharge2: "曲刀 チャージ2",
    bladerCharge3: "曲刀 チャージ最大",
    barbarianAttackAdd: "斧 被ダメ強化",
    barbarianAddAct: "斧 強化&ACT",
    shieldKnightRanged: "剣盾 遠距離",
    shieldKnightRangedAction: "剣盾 遠距離&ACT",
    destroyerRanged: "こん棒 遠距離",
    warlockAttackMul1: "杖 敵撃破5",
    warlockAttackMul2: "杖 敵撃破10",
    conjurerEnemy1: "本 敵1",
    conjurerEnemy2: "本 敵2",
    assassinAttackMul1: "短剣 移動強化1",
    assassinAttackMul2: "短剣 移動強化2",
    ninjaFire: "手裏剣 火マス",
    ninjaWater: "手裏剣 水マス",
    ninjaWind: "手裏剣 風マス",
    ninjaEarth: "手裏剣 地マス",
    ninjaStealth: "手裏剣 光/闇マス",
    whipperDebuff: "鞭 防御デバフ",
    whipperDebuffAction: "鞭 デバフ&ACT",
    shamanBuff: "霊枝 加算バフ",
    bardBuff: "楽器 加算バフ",
    bardBuffDefinite: "楽器 特効加算バフ",
    bardDebuff: "楽器 攻撃デバフ",
  } as const satisfies Record<FilterConditionKey, string>;

  private static specificName: Partial<
    Record<FilterUnitClass, Partial<Record<FilterConditionKey, string>>>
  > = {
    monk: {
      definite: "スタン特効",
    },
    archer: {
      definite: "対空特効",
      definiteAction: "対空特効&ACT",
    },
    priest: {
      definite: "同一属性特効",
    },
  } as const;

  static group = {
    definite: this.groupKeys.definite,
    action: this.groupKeys.action,
    definiteAction: this.groupKeys.definiteAction,
    bladerCharge1: this.groupKeys.blader,
    bladerCharge2: this.groupKeys.blader,
    bladerCharge3: this.groupKeys.blader,
    barbarianAttackAdd: this.groupKeys.barbarian,
    barbarianAddAct: this.groupKeys.barbarian,
    shieldKnightRanged: this.groupKeys.shieldKnight,
    shieldKnightRangedAction: this.groupKeys.shieldKnight,
    destroyerRanged: this.groupKeys.destroyer,
    warlockAttackMul1: this.groupKeys.warlock,
    warlockAttackMul2: this.groupKeys.warlock,
    conjurerEnemy1: this.groupKeys.conjurer,
    conjurerEnemy2: this.groupKeys.conjurer,
    assassinAttackMul1: this.groupKeys.assassin,
    assassinAttackMul2: this.groupKeys.assassin,
    ninjaFire: this.groupKeys.ninja,
    ninjaWater: this.groupKeys.ninja,
    ninjaWind: this.groupKeys.ninja,
    ninjaEarth: this.groupKeys.ninja,
    ninjaStealth: this.groupKeys.ninja,
    whipperDebuff: this.groupKeys.whipper,
    whipperDebuffAction: this.groupKeys.whipper,
    shamanBuff: this.groupKeys.shaman,
    bardBuff: this.groupKeys.bard,
    bardBuffDefinite: this.groupKeys.bard,
    bardDebuff: this.groupKeys.bard,
  } as const satisfies Record<
    FilterConditionKeyExcludeNormal,
    FilterConditionGroup
  >;

  private static readonly definiteList = [
    this.classKey.monk,
    this.classKey.archer,
    this.classKey.priest,
  ] as const satisfies FilterUnitClass[];

  private static readonly actionList = [
    this.classKey.barbarian,
    this.classKey.shieldKnight,
    this.classKey.archer,
    this.classKey.conjurer,
    this.classKey.whipper,
  ] as const satisfies FilterUnitClass[];

  private static readonly definiteActionList = [
    this.classKey.archer,
  ] as const satisfies FilterUnitClass[];

  static requiredFeature = {
    definite: "class-definite",
    action: ["class-action", "class-action-base"],
    bladerCharge1: "class-charge1",
    bladerCharge2: "class-charge2",
    bladerCharge3: "class-charge3",
    barbarianAttackAdd: "class-attack-add",
    shieldKnightRanged: "class-ranged",
    destroyerRanged: "class-ranged",
    warlockAttackMul1: "class-attack-mul1",
    warlockAttackMul2: "class-attack-mul2",
    conjurerEnemy1: "class-enemy1",
    conjurerEnemy2: "class-enemy2",
    assassinAttackMul1: "class-attack-mul1",
    assassinAttackMul2: "class-attack-mul2",
    ninjaFire: "class-fire-field",
    ninjaWater: "class-water-field",
    ninjaWind: "class-wind-field",
    ninjaEarth: "class-earth-field",
    ninjaStealth: "class-field-stealth",
    whipperDebuff: "class-debuff",
    shamanBuff: "class-buff",
    bardBuff: "class-buff",
    bardBuffDefinite: "class-buff-definite",
    bardDebuff: "class-debuff",
  } as const satisfies Partial<
    Record<FilterConditionKeyExcludeNormal, string | string[]>
  >;

  static getVisibleItems(filter: Filter): FilterConditionKey[] {
    const eq = this.classKey;
    const fn = (arg: FilterUnitClass): boolean => filter.get(arg) ?? false;

    const definite = this.definiteList.some(fn);
    const action = this.actionList.some(fn);
    const definiteAction = this.definiteActionList.some(fn);
    const blader = fn(eq.blader);
    const barbarian = fn(eq.barbarian);
    const shieldKnight = fn(eq.shieldKnight);
    const destroyer = fn(eq.destroyer);
    const warlock = fn(eq.warlock);
    const conjurer = fn(eq.conjurer);
    const assassin = fn(eq.assassin);
    const ninja = fn(eq.ninja);
    const whipper = fn(eq.whipper);
    const shaman = fn(eq.shaman);
    const bard = fn(eq.bard);

    const cond = this.keys;

    return this.list.filter((k): boolean => {
      switch (k) {
        case cond.normal:
          return (
            definite ||
            action ||
            blader ||
            barbarian ||
            shieldKnight ||
            destroyer ||
            warlock ||
            conjurer ||
            assassin ||
            ninja ||
            whipper ||
            shaman ||
            bard
          );
        case cond.definite:
          return definite;
        case cond.action:
          return action;
        case cond.definiteAction:
          return definiteAction;
        case cond.bladerCharge1:
        case cond.bladerCharge2:
        case cond.bladerCharge3:
          return blader;
        case cond.barbarianAttackAdd:
        case cond.barbarianAddAct:
          return barbarian;
        case cond.shieldKnightRanged:
        case cond.shieldKnightRangedAction:
          return shieldKnight;
        case cond.destroyerRanged:
          return destroyer;
        case cond.warlockAttackMul1:
        case cond.warlockAttackMul2:
          return warlock;
        case cond.conjurerEnemy1:
        case cond.conjurerEnemy2:
          return conjurer;
        case cond.assassinAttackMul1:
        case cond.assassinAttackMul2:
          return assassin;
        case cond.ninjaFire:
        case cond.ninjaWater:
        case cond.ninjaWind:
        case cond.ninjaEarth:
        case cond.ninjaStealth:
          return ninja;
        case cond.whipperDebuff:
        case cond.whipperDebuffAction:
          return whipper;
        case cond.shamanBuff:
          return shaman;
        case cond.bardBuff:
        case cond.bardBuffDefinite:
        case cond.bardDebuff:
          return bard;
      }
    });
  }

  static getAppliedGroup(
    className: Data.UnitClassTag | undefined
  ): Record<FilterConditionGroup, boolean> {
    const classNameKey = Data.UnitClass.keyOf(className);
    const k = this.groupKeys;

    const definite = this.definiteList.some((v) => v === classNameKey);
    const action = this.actionList.some((v) => v === classNameKey);

    const fn = (arg: FilterConditionGroup): boolean => {
      switch (arg) {
        case k.definite:
          return definite;
        case k.action:
          return action;
        case k.definiteAction:
          return definite && action;
        default:
          return classNameKey === arg;
      }
    };

    return this.getReturnObj(fn);
  }

  private static getReturnObj(
    fn: (arg: FilterConditionGroup) => boolean
  ): Record<FilterConditionGroup, boolean> {
    type Ret = Record<FilterConditionGroup, boolean>;
    const ret: Partial<Ret> = {};
    this.groups.forEach((v) => (ret[v] = fn(v)));

    return ret as Ret;
  }

  static getFilterIgnoreGroup(
    appliedGroup: Record<FilterConditionGroup, boolean>,
    {
      isGeneral,
      isGeneralDefinite,
      isGeneralAction,
      isGeneralDefiniteAction,
    }: {
      isGeneral: boolean;
      isGeneralDefinite: boolean;
      isGeneralAction: boolean;
      isGeneralDefiniteAction: boolean;
    }
  ) {
    const k = this.groupKeys;

    const fn1 = (arg: FilterConditionGroup): boolean => {
      switch (arg) {
        case k.definite:
          return isGeneralDefinite;
        case k.action:
          return isGeneralAction;
        case k.definiteAction:
          return isGeneralDefiniteAction;
        default:
          return false;
      }
    };
    const fn2 = (arg: FilterConditionGroup): boolean => {
      return appliedGroup[arg] || isGeneral || fn1(arg);
    };

    return this.getReturnObj(fn2);
  }

  static isKey(key: unknown): key is FilterConditionKey {
    return this.list.findIndex((k) => k === key) !== -1;
  }

  static getName(key: FilterConditionKey, filter: Filter): string {
    const classList = FilterUnitClass.getKeys(filter);
    let count = 0;
    let spName: string;
    classList.forEach((cls) => {
      const str = this.specificName[cls]?.[key];
      if (str) {
        spName = str;
        count++;
      }
    });
    if (count === 1) {
      return spName!;
    }
    return this.names[key];
  }
}

const filterDamageTypeKeys = Data.DamageType.list;
type FilterDamageType = (typeof filterDamageTypeKeys)[number];

const filterMoveTypeKeys = Data.MoveType.filterKeys;
type FilterMoveType = (typeof filterMoveTypeKeys)[number];

const filterPlacementKeys = Data.Placement.list;
type FilterPlacement = (typeof filterPlacementKeys)[number];

const filterTokenKeys = Data.TokenType.list;
type FilterToken = Data.TokenTypeKey;

const defaultFilter = new Map<FilterKeys, boolean>();
export type FilterKeys =
  | FilterRarity
  | FilterElement
  | FilterSpecies
  | FilterUnitClass
  | FilterConditionKey
  | FilterDamageType
  | FilterMoveType
  | FilterPlacement
  | FilterToken;
const filterKeys: FilterKeys[] = [
  ...filterRarityKeys,
  ...filterElementKeys,
  ...filterSpeciesKeys,
  ...FilterCondition.list,
  ...filterUnitClassKeys,
  ...filterDamageTypeKeys,
  ...filterMoveTypeKeys,
  ...filterPlacementKeys,
  ...filterTokenKeys,
];

export type FilterObject = Partial<Record<FilterKeys, boolean>>;
export type Filter = ReadonlyMap<FilterKeys, boolean>;
export const Filter = {
  baseKeys: filterKeys.filter((k) => !FilterCondition.isKey(k)),
} as const;

// Setting

type SettingUnit = {
  readonly subskill1: number;
  readonly subskill2: number;
  readonly hpMul: number;
  readonly attackMul: number;
  readonly defenseMul: number;
  readonly resistMul: number;
  readonly hpAdd: number;
  readonly attackAdd: number;
  readonly defenseAdd: number;
  readonly resistAdd: number;
  readonly damageFactor: number;
  readonly physicalDamageCut: number;
  readonly magicalDamageCut: number;
  readonly attackSpeedBuff: number;
  readonly delayCut: number;
  readonly cooldownCut: number;
};
const defaultSettingUnit = {
  subskill1: -1,
  subskill2: -1,
  hpMul: 0,
  attackMul: 0,
  defenseMul: 0,
  resistMul: 0,
  hpAdd: 0,
  attackAdd: 0,
  defenseAdd: 0,
  resistAdd: 0,
  attackSpeedBuff: 0,
  delayCut: 0,
  damageFactor: 0,
  physicalDamageCut: 0,
  magicalDamageCut: 0,
  cooldownCut: 0,
} as const satisfies SettingUnit;
const settingUnitValidation: Record<keyof SettingUnit, ValidationFunc> = {
  subskill1: Valid.isNumber,
  subskill2: Valid.isNumber,
  hpMul: Valid.isMul,
  attackMul: Valid.isMul,
  defenseMul: Valid.isMul,
  resistMul: Valid.isMul,
  hpAdd: Valid.isAdd,
  attackAdd: Valid.isAdd,
  defenseAdd: Valid.isAdd,
  resistAdd: Valid.isAdd,
  attackSpeedBuff: Valid.isMul,
  delayCut: Valid.isCut,
  damageFactor: Valid.isMul,
  physicalDamageCut: Valid.isDamageCut,
  magicalDamageCut: Valid.isDamageCut,
  cooldownCut: Valid.isCooldownCut,
} as const satisfies Record<keyof SettingUnit, ValidationFunc>;

type SettingFormation = {
  readonly mainBeast: number;
  readonly subBeast: number;
  readonly possBuffAmount: number;
  readonly possBuffLevel: number;
  readonly formationHp: number;
  readonly formationAttack: number;
  readonly formationDefense: number;
  readonly formationResist: number;
  readonly typeBonus: TypeBonusStatus;
  readonly sameElement: number;
};
const defaultSettingFormation = {
  mainBeast: -1,
  subBeast: -1,
  possBuffAmount: 10,
  possBuffLevel: Data.MAX_POSS_BUFF_LEVEL,
  formationHp: 0,
  formationAttack: 0,
  formationDefense: 0,
  formationResist: 0,
  typeBonus: TYPE_ENABLED,
  sameElement: 8,
} as const satisfies SettingFormation;
const settingFormationValidation: Record<
  keyof SettingFormation,
  ValidationFunc
> = {
  mainBeast: Valid.isBeast,
  subBeast: Valid.isBeast,
  possBuffAmount: (v) => Valid.isNumber(v) && v >= -1 && v <= 10,
  possBuffLevel: (v) => Valid.isNumber(v) && v > 0 && v <= 45,
  formationHp: Valid.isMul,
  formationAttack: Valid.isMul,
  formationDefense: Valid.isMul,
  formationResist: Valid.isMul,
  typeBonus: Valid.isTypeBonus,
  sameElement: Valid.isSameElement,
} as const satisfies Record<keyof SettingFormation, ValidationFunc>;

type SettingEnemy = {
  readonly dps1: number;
  readonly dps2: number;
  readonly dps3: number;
  readonly dps4: number;
  readonly dps5: number;
  readonly enemyDamageCut: number;
  readonly enemyPhysicalDamageCut: number;
  readonly enemyMagicalDamageCut: number;
  readonly damageDebuff: number;
  readonly physicalDamageDebuff: number;
  readonly magicalDamageDebuff: number;
};
const defaultSettingEnemy = {
  dps1: 300,
  dps2: 600,
  dps3: 1000,
  dps4: 2000,
  dps5: 3000,
  enemyDamageCut: 0,
  enemyPhysicalDamageCut: 0,
  enemyMagicalDamageCut: 0,
  damageDebuff: 0,
  physicalDamageDebuff: 0,
  magicalDamageDebuff: 0,
} as const satisfies SettingEnemy;
const settingEnemyValidation = {
  dps1: Valid.isDps,
  dps2: Valid.isDps,
  dps3: Valid.isDps,
  dps4: Valid.isDps,
  dps5: Valid.isDps,
  enemyDamageCut: Valid.isDamageCutPos,
  enemyPhysicalDamageCut: Valid.isDamageCutPos,
  enemyMagicalDamageCut: Valid.isDamageCutPos,
  damageDebuff: Valid.isMul,
  physicalDamageDebuff: Valid.isMul,
  magicalDamageDebuff: Valid.isMul,
} as const satisfies Record<keyof SettingEnemy, ValidationFunc>;

type SettingOther = {
  readonly potential: Status1;
  readonly weapon: Status1;
  readonly fieldElement: Status2;
  readonly classNameType: ClassNameTypeStatus;
};
const defaultSettingOther = {
  potential: PARTIAL,
  weapon: ALL,
  fieldElement: NONE,
  classNameType: DEFAULT_CLASS_NAME_TYPE,
} as const satisfies SettingOther;
const settingOtherValidation: Record<keyof SettingOther, ValidationFunc> = {
  potential: Valid.isStatus1,
  weapon: Valid.isStatus1,
  fieldElement: Valid.isStatus2,
  classNameType: Valid.isClassNameTypeStatus,
} as const satisfies Record<keyof SettingOther, ValidationFunc>;

export type Setting = SettingUnit &
  SettingFormation &
  SettingEnemy &
  SettingOther;

const defaultSetting = {
  ...defaultSettingUnit,
  ...defaultSettingFormation,
  ...defaultSettingEnemy,
  ...defaultSettingOther,
} as const satisfies Setting;

export const Setting = {
  ALL,
  PARTIAL,
  NONE,
  SAME,
  STORAGE_LOCAL,
  STORAGE_SESSION,
  TYPE_ENABLED,
  TYPE_DISABLED,
  TYPE_CC1,
  TYPE_CC4,
  TYPE_EQUIPMENT,
  list: Data.getKeys(defaultSetting),
  isValidMul: Valid.isMul,
  isValidAdd: Valid.isAdd,
  isValidCut: Valid.isCut,
  isValidDamageCut: Valid.isDamageCut,
  isValidDamageCutPos: Valid.isDamageCutPos,
  isValidAttackSpeed: Valid.isAttackSpeed,
  isValidCooldownCut: Valid.isCooldownCut,
  isValidDps: Valid.isDps,
  defaultValue: defaultSetting,

  formation: {
    key: {
      hp: "formationHp",
      attack: "formationAttack",
      defense: "formationDefense",
      resist: "formationResist",
    } as const satisfies Record<Data.BaseStatType, keyof SettingFormation>,
  },

  getDpsKey<T extends 1 | 2 | 3 | 4 | 5>(i: T): `dps${T}` {
    return `dps${i}`;
  },
} as const;

const settingValidation: Record<keyof Setting, ValidationFunc> = {
  ...settingUnitValidation,
  ...settingFormationValidation,
  ...settingEnemyValidation,
  ...settingOtherValidation,
} as const;

// UI Setting

export type UISetting = typeof defaultUISetting;
const defaultUISetting = {
  subskillGroup: 0 as number,
  subskillRarity: 0 as number,
  subskillSortType: 0 as number,
  subskillSortReversed: false as boolean,
  subskillIsGeneral: false as boolean,
  subskillIsEffective: true as boolean,
} as const;

// Hooks

const FilterAction = {
  change: "change",
  initialize: "initialize",
  reset: "reset",
} as const;
type FilterAction =
  | {
      type: typeof FilterAction.change;
      nextValue: FilterObject;
    }
  | {
      type: typeof FilterAction.initialize;
      initialValue: Filter;
    }
  | {
      type: typeof FilterAction.reset;
    };

function filterReducer(state: Filter, action: FilterAction): Filter {
  switch (action.type) {
    case FilterAction.change: {
      const ret = new Map(state);
      for (const [k, v] of Object.entries(action.nextValue)) {
        ret.set(k as FilterKeys, v);
      }
      return ret;
    }
    case FilterAction.initialize: {
      return action.initialValue;
    }
    case FilterAction.reset: {
      return defaultFilter;
    }
  }
}

export function useAllStates() {
  const [filter, dispatchFilter] = useReducer(filterReducer, defaultFilter);
  const [setting, dispatchSetting] = useReducer(settingReducer, defaultSetting);
  const [query, setQuery] = useState("");
  const [uISetting, dispatchUISetting] = useReducer(
    uISettingReducer,
    defaultUISetting
  );
  const [saveOption, setSaveOption] = useState<SaveStatus>(DEFAULT_SAVE_OPTION);

  const [init, setInit] = useState(false);
  const storageOption = Contexts.useSaveOption();

  useEffect(() => {
    dispatchFilter({
      type: FilterAction.initialize,
      initialValue: Storage.getFilter(),
    });
    dispatchSetting({
      type: SettingAction.change,
      nextValue: Storage.getSetting(),
    });
    setQuery(Storage.getQuery());
    dispatchUISetting({
      type: UISettingAction.change,
      nextValue: Storage.getUISetting(),
    });
    setSaveOption(Storage.getSaveOption());

    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      const isLocal = storageOption === STORAGE_LOCAL;
      Storage.setFilter(filter, isLocal);
      Storage.setSetting(setting, isLocal);
      Storage.setQuery(query);
      Storage.setUISetting(uISetting, isLocal);
      Storage.setSaveOption(saveOption);
    }
  }, [filter, setting, query, uISetting, saveOption, init, storageOption]);

  return {
    filter,
    dispatchFilter,
    setting,
    dispatchSetting,
    query,
    setQuery,
    uISetting,
    dispatchUISetting,
    saveOption,
    setSaveOption,
  };
}

export function useFilterState(): [Filter, Dispatch<FilterAction>] {
  const [filter, dispatch] = useReducer(filterReducer, defaultFilter);
  const [init, setInit] = useState(false);
  const storageOption = Contexts.useSaveOption();

  useEffect(() => {
    dispatch({
      type: FilterAction.initialize,
      initialValue: Storage.getFilter(),
    });
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setFilter(filter, storageOption === STORAGE_LOCAL);
    }
  }, [filter, init, storageOption]);

  return [filter, dispatch];
}

const SettingAction = {
  change: "change",
  resetUnit: "reset-unit",
  resetFormation: "reset-formation",
  resetEnemy: "reset-enemy",
  resetOther: "reset-other",
} as const;
type SettingAction =
  | {
      type: typeof SettingAction.change;
      nextValue: Partial<Setting>;
    }
  | {
      type:
        | typeof SettingAction.resetUnit
        | typeof SettingAction.resetFormation
        | typeof SettingAction.resetEnemy
        | typeof SettingAction.resetOther;
    };

function settingReducer(state: Setting, action: SettingAction): Setting {
  const fn = (nextValue: Partial<Setting>) => ({ ...state, ...nextValue });
  switch (action.type) {
    case SettingAction.change: {
      return fn(action.nextValue);
    }
    case SettingAction.resetUnit: {
      return fn(defaultSettingUnit);
    }
    case SettingAction.resetFormation: {
      return fn(defaultSettingFormation);
    }
    case SettingAction.resetEnemy: {
      return fn(defaultSettingEnemy);
    }
    case SettingAction.resetOther: {
      return fn(defaultSettingOther);
    }
  }
}

export function useSettingState(): [Setting, Dispatch<SettingAction>] {
  const [setting, dispatch] = useReducer(settingReducer, defaultSetting);
  const [init, setInit] = useState(false);
  const storageOption = Contexts.useSaveOption();

  useEffect(() => {
    dispatch({ type: SettingAction.change, nextValue: Storage.getSetting() });
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setSetting(setting, storageOption === STORAGE_LOCAL);
    }
  }, [setting, init, storageOption]);

  return [setting, dispatch];
}

export function useQueryState(): [string, Dispatch<SetStateAction<string>>] {
  const [query, setQuery] = useState("");
  const [init, setInit] = useState(false);

  useEffect(() => {
    setQuery(Storage.getQuery());
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setQuery(query);
    }
  }, [query, init]);

  return [query, setQuery];
}

const UISettingAction = {
  change: "change",
  update: "update",
} as const;
type UISettingAction =
  | {
      type: typeof UISettingAction.change;
      nextValue: Partial<UISetting>;
    }
  | {
      type: typeof UISettingAction.update;
      updater: SetStateAction<UISetting>;
    };

function uISettingReducer(
  state: UISetting,
  action: UISettingAction
): UISetting {
  switch (action.type) {
    case UISettingAction.change: {
      return { ...state, ...action.nextValue };
    }
    case UISettingAction.update: {
      if (typeof action.updater === "function") {
        return action.updater(state);
      } else {
        return action.updater;
      }
    }
  }
}

export function useUISettingState(): [UISetting, Dispatch<UISettingAction>] {
  const [uISetting, dispatch] = useReducer(uISettingReducer, defaultUISetting);
  const [init, setInit] = useState(false);
  const storageOption = Contexts.useSaveOption();

  useEffect(() => {
    dispatch({
      type: UISettingAction.change,
      nextValue: Storage.getUISetting(),
    });
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setUISetting(uISetting, storageOption === STORAGE_LOCAL);
    }
  }, [uISetting, init, storageOption]);

  return [uISetting, dispatch];
}

export function useSaveOptionState(): [SaveStatus, Dispatch<SaveStatus>] {
  const [saveOption, setSaveOption] = useState<SaveStatus>(DEFAULT_SAVE_OPTION);
  const [init, setInit] = useState(false);

  useEffect(() => {
    setSaveOption(Storage.getSaveOption());
    setInit(true);
  }, [init]);

  useEffect(() => {
    if (init) {
      Storage.setSaveOption(saveOption);
    }
  }, [saveOption, init]);

  return [saveOption, setSaveOption];
}

// Contexts

export const Contexts = {
  FilterAction,
  Filter: createContext<Filter>(defaultFilter),
  DispatchFilter: createContext<Dispatch<FilterAction>>(() => {}),
  useFilter: () => useContext(Contexts.Filter),
  useDispatchFilter: () => useContext(Contexts.DispatchFilter),

  SettingAction,
  Setting: createContext<Setting>(defaultSetting),
  DispatchSetting: createContext<Dispatch<SettingAction>>(() => {}),
  useSetting: () => useContext(Contexts.Setting),
  useDispatchSetting: () => useContext(Contexts.DispatchSetting),

  Query: createContext(""),
  SetQuery: createContext<Dispatch<string>>(() => {}),
  useQuery: () => useContext(Contexts.Query),
  useSetQuery: () => useContext(Contexts.SetQuery),

  UISettingAction,
  UISetting: createContext<UISetting>(defaultUISetting),
  DispatchUISetting: createContext<Dispatch<UISettingAction>>(() => {}),
  useUISetting: () => useContext(Contexts.UISetting),
  useDispatchUISetting: () => useContext(Contexts.DispatchUISetting),

  SaveOption: createContext<SaveStatus>(DEFAULT_SAVE_OPTION),
  SetSaveOption: createContext<Dispatch<SaveStatus>>(() => {}),
  useSaveOption: () => useContext(Contexts.SaveOption),
  useSetSaveOption: () => useContext(Contexts.SetSaveOption),
};

// Storage
const storageKeys = {
  FILTER: "database-filter",
  SETTING: "database-setting",
  QUERY: "database-query",
  UI_SETTING: "database-UI-setting",
  SAVE_OPTION: "save-option",
} as const;
type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

class Storage {
  private static getStorage(isLocal?: boolean) {
    try {
      return isLocal ? localStorage : sessionStorage;
    } catch {
      return;
    }
  }

  private static getItem(
    key: StorageKey,
    isLocal?: boolean
  ): string | undefined {
    const storage = this.getStorage(isLocal);
    if (storage !== undefined) {
      try {
        const item = storage.getItem(key);
        if (item !== null) {
          return item;
        }
      } catch {}
    }
  }

  private static setItem(
    key: StorageKey,
    value: string,
    isLocal?: boolean
  ): void {
    const storage = this.getStorage(isLocal);
    if (storage !== undefined) {
      try {
        storage.setItem(key, value);
      } catch {}
    }
  }

  private static removeItem(key: StorageKey, isLocal?: boolean) {
    const storage = this.getStorage(isLocal);
    if (storage !== undefined) {
      try {
        storage.removeItem(key);
      } catch {}
    }
  }

  private static getObject(key: StorageKey): object | undefined {
    let item = this.getItem(key);
    if (item === undefined) {
      item = this.getItem(key, true);
      if (item === undefined) {
        return;
      }
    }
    const ret: unknown = JSON.parse(item);
    if (typeof ret !== "object" || ret === null) {
      return;
    }
    return ret;
  }

  private static setObject(
    key: StorageKey,
    obj: Record<string, unknown>,
    isLocal: boolean
  ): void {
    const str = JSON.stringify(obj);
    this.setItem(key, str);

    if (isLocal) {
      this.setItem(key, str, true);
    } else {
      this.removeItem(key, true);
    }
  }

  static getSetting(): Setting {
    const item = this.getObject(storageKeys.SETTING);
    if (item === undefined) {
      return defaultSetting;
    }
    const obj = item as Record<keyof Setting, unknown>;
    const ret: Partial<Record<keyof Setting, unknown>> = {};
    Setting.list.forEach((key) => {
      const v = obj[key];
      const valid = settingValidation[key](v);
      ret[key] = valid ? v : defaultSetting[key];
    });

    if (ret.mainBeast === ret.subBeast && ret.subBeast !== -1) {
      ret.subBeast = defaultSetting.subBeast;
    }

    return ret as Setting;
  }
  static setSetting(obj: Setting, isLocal: boolean): void {
    this.setObject(storageKeys.SETTING, obj, isLocal);
  }

  static getFilter(): Map<FilterKeys, boolean> {
    const obj = this.getObject(storageKeys.FILTER);
    const ret = new Map<FilterKeys, boolean>();

    if (!this.isFilter(obj)) {
      return ret;
    }
    for (const key of filterKeys) {
      if (obj[key] === undefined) {
        continue;
      }
      ret.set(key, obj[key]);
    }
    return ret;
  }
  static setFilter(item: Filter, isLocal: boolean): void {
    const obj: FilterObject = {};
    for (const [key, value] of item.entries()) {
      obj[key] = value;
    }
    Storage.setObject(storageKeys.FILTER, obj, isLocal);
  }
  private static isFilter(obj: unknown): obj is FilterObject {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }
    const v = obj as Record<FilterKeys, unknown>;
    return filterKeys.every(
      (k) => v[k] === undefined || typeof v[k] === "boolean"
    );
  }

  static getQuery(): string {
    return this.getItem(storageKeys.QUERY) ?? "";
  }
  static setQuery(value: string): void {
    this.setItem(storageKeys.QUERY, value);
  }

  static getUISetting(): UISetting {
    const obj = this.getObject(storageKeys.UI_SETTING);
    if (!this.isUISetting(obj)) {
      return defaultUISetting;
    } else {
      return obj;
    }
  }
  static setUISetting(obj: UISetting, isLocal: boolean) {
    this.setObject(storageKeys.UI_SETTING, obj, isLocal);
  }
  private static isUISetting(obj: unknown): obj is UISetting {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }
    const v = obj as Record<keyof UISetting, unknown>;
    if (typeof v.subskillGroup !== "number") {
      return false;
    }
    return true;
  }

  static getSaveOption(): SaveStatus {
    const item = this.getItem(storageKeys.SAVE_OPTION, true);
    if (Valid.isSaveStatus(item)) {
      return item;
    }
    return DEFAULT_SAVE_OPTION;
  }

  static setSaveOption(status: SaveStatus): void {
    this.setItem(storageKeys.SAVE_OPTION, status, true);
  }
}
