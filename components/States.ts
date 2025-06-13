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

  static isStatus1(value: unknown): value is Status1 {
    return value === ALL || value === PARTIAL || value === NONE;
  }

  static isStatus2(value: unknown): value is Status1 {
    return value === NONE || value === SAME;
  }

  static isDps(value: unknown): boolean {
    return Valid.isNumber(value) && value >= 0 && value < 100000;
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

const filterEquipmentKeys = Object.keys(
  Data.className
) as readonly Data.ClassNameKey[];
export type FilterEquipment = (typeof filterEquipmentKeys)[number];
export const FilterEquipment = {
  names: Data.classEquipmentName,
  keys: filterEquipmentKeys,

  getKeys(filter: Filter): ReadonlySet<FilterEquipment> {
    const ret = new Set<FilterEquipment>();
    for (const [k, v] of filter.entries()) {
      if (v && this.isKey(k)) ret.add(k);
    }
    return ret;
  },

  isKey(key: unknown): key is FilterEquipment {
    return filterEquipmentKeys.findIndex((k) => k === key) !== -1;
  },
} as const;

const filterConditionKeys = [
  "normal",
  "proper",
  "action",
  "properAction",
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
  "shamanBuff",
  "bardBuff",
  "bardBuffProper",
  "bardDebuff",
] as const;

export type FilterConditionKey = (typeof FilterCondition.list)[number];
type FilterConditionKeyExcludeNormal = Exclude<FilterConditionKey, "normal">;
type FilterConditionGroup = (typeof FilterCondition.groups)[number];

export class FilterCondition {
  private static readonly equipment = Data.ClassName.keys;

  static readonly groups = [
    "proper",
    "action",
    "properAction",
    "blader",
    "barbarian",
    "shieldKnight",
    "destroyer",
    "warlock",
    "conjurer",
    "assassin",
    "ninja",
    "shaman",
    "bard",
  ] as const;
  static readonly groupKeys = Data.Enum(this.groups);

  static readonly list = [
    "normal",
    "proper",
    "action",
    "properAction",
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
    "shamanBuff",
    "bardBuff",
    "bardBuffProper",
    "bardDebuff",
  ] as const;
  static readonly keys = Data.Enum(this.list);

  static readonly names = {
    normal: "通常",
    proper: "クラス特効",
    action: "クラスACT",
    properAction: "特効&ACT",
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
    shamanBuff: "霊枝 加算バフ",
    bardBuff: "楽器 加算バフ",
    bardBuffProper: "楽器 特効加算バフ",
    bardDebuff: "楽器 攻撃デバフ",
  } as const satisfies Record<FilterConditionKey, string>;

  static group = {
    proper: this.groupKeys.proper,
    action: this.groupKeys.action,
    properAction: this.groupKeys.properAction,
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
    shamanBuff: this.groupKeys.shaman,
    bardBuff: this.groupKeys.bard,
    bardBuffProper: this.groupKeys.bard,
    bardDebuff: this.groupKeys.bard,
  } as const satisfies Record<
    FilterConditionKeyExcludeNormal,
    FilterConditionGroup
  >;

  private static readonly properList = [
    this.equipment.monk,
    this.equipment.archer,
    this.equipment.priest,
  ] as const satisfies FilterEquipment[];

  private static readonly actionList = [
    this.equipment.barbarian,
    this.equipment.shieldKnight,
    this.equipment.archer,
    this.equipment.conjurer,
    this.equipment.whipper,
  ] as const satisfies FilterEquipment[];

  static requiredFeature = {
    proper: "class-proper",
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
    shamanBuff: "class-buff",
    bardBuff: "class-buff",
    bardBuffProper: "class-buff-proper",
    bardDebuff: "class-debuff",
  } as const satisfies Partial<
    Record<FilterConditionKeyExcludeNormal, string | string[]>
  >;

  static getVisibleItems(filter: Filter): FilterConditionKey[] {
    const e = this.equipment;
    const fn = (arg: FilterEquipment): boolean => filter.get(arg) ?? false;

    const proper = this.properList.some(fn);
    const action = this.actionList.some(fn);
    const blader = fn(e.blader);
    const barbarian = fn(e.barbarian);
    const shieldKnight = fn(e.shieldKnight);
    const destroyer = fn(e.destroyer);
    const warlock = fn(e.warlock);
    const conjurer = fn(e.conjurer);
    const assassin = fn(e.assassin);
    const ninja = fn(e.ninja);
    const shaman = fn(e.shaman);
    const bard = fn(e.bard);

    const cond = this.keys;

    return this.list.filter((k): boolean => {
      switch (k) {
        case cond.normal:
          return (
            proper ||
            action ||
            blader ||
            barbarian ||
            shieldKnight ||
            destroyer ||
            warlock ||
            conjurer ||
            assassin ||
            ninja ||
            shaman ||
            bard
          );
        case cond.proper:
          return proper;
        case cond.action:
          return action;
        case cond.properAction:
          return proper && action;
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
        case cond.shamanBuff:
          return shaman;
        case cond.bardBuff:
        case cond.bardBuffProper:
        case cond.bardDebuff:
          return bard;
      }
    });
  }

  static getAppliedGroup(
    className: Data.ClassName | undefined
  ): Record<FilterConditionGroup, boolean> {
    const classNameKey = Data.ClassName.keyOf(className);
    const k = this.groupKeys;

    const proper = this.properList.some((v) => v === classNameKey);
    const action = this.actionList.some((v) => v === classNameKey);

    const fn = (arg: FilterConditionGroup): boolean => {
      switch (arg) {
        case k.proper:
          return proper;
        case k.action:
          return action;
        case k.properAction:
          return proper && action;
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
      isGeneralProper,
      isGeneralAction,
      isGeneralProperAction,
    }: {
      isGeneral: boolean;
      isGeneralProper: boolean;
      isGeneralAction: boolean;
      isGeneralProperAction: boolean;
    }
  ) {
    const k = this.groupKeys;

    const fn1 = (arg: FilterConditionGroup): boolean => {
      switch (arg) {
        case k.proper:
          return isGeneralProper;
        case k.action:
          return isGeneralAction;
        case k.properAction:
          return isGeneralProperAction;
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
}

const filterDamageTypeKeys = Data.DamageType.list;
type FilterDamageType = (typeof filterDamageTypeKeys)[number];

const filterMoveTypeKeys = Data.MoveType.filterKeys;
type FilterMoveType = (typeof filterMoveTypeKeys)[number];

const filterPlacementKeys = Data.Placement.list;
type FilterPlacement = (typeof filterPlacementKeys)[number];

const defaultFilter = new Map<FilterKeys, boolean>();
export type FilterKeys =
  | FilterRarity
  | FilterElement
  | FilterSpecies
  | FilterEquipment
  | FilterConditionKey
  | FilterDamageType
  | FilterMoveType
  | FilterPlacement;
const filterKeys: FilterKeys[] = [
  ...filterRarityKeys,
  ...filterElementKeys,
  ...filterSpeciesKeys,
  ...filterConditionKeys,
  ...filterEquipmentKeys,
  ...filterDamageTypeKeys,
  ...filterMoveTypeKeys,
  ...filterPlacementKeys,
];

export type FilterObject = Partial<Record<FilterKeys, boolean>>;
export type Filter = ReadonlyMap<FilterKeys, boolean>;
export const Filter = {
  baseKeys: [
    ...filterRarityKeys,
    ...filterElementKeys,
    ...filterSpeciesKeys,
    ...filterEquipmentKeys,
    ...filterDamageTypeKeys,
    ...filterMoveTypeKeys,
    ...filterPlacementKeys,
  ],
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
} as const;

type SettingFormation = {
  readonly mainBeast: number;
  readonly subBeast: number;
  readonly possBuffAmount: number;
  readonly possBuffLevel: number;
  readonly formationHp: number;
  readonly formationAttack: number;
  readonly formationDefense: number;
  readonly formationResist: number;
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
} as const;

type SettingOther = {
  readonly potential: Status1;
  readonly weapon: Status1;
  readonly dps1: number;
  readonly dps2: number;
  readonly dps3: number;
  readonly dps4: number;
  readonly dps5: number;
  readonly fieldElement: Status2;
};
const defaultSettingOther = {
  potential: PARTIAL,
  weapon: ALL,
  dps1: 300,
  dps2: 600,
  dps3: 1000,
  dps4: 2000,
  dps5: 3000,
  fieldElement: NONE,
} as const satisfies SettingOther;
const settingOtherValidation: Record<keyof SettingOther, ValidationFunc> = {
  potential: Valid.isStatus1,
  weapon: Valid.isStatus1,
  dps1: Valid.isDps,
  dps2: Valid.isDps,
  dps3: Valid.isDps,
  dps4: Valid.isDps,
  dps5: Valid.isDps,
  fieldElement: Valid.isStatus2,
} as const;

export type Setting = SettingUnit & SettingFormation & SettingOther;

const defaultSetting = {
  ...defaultSettingUnit,
  ...defaultSettingFormation,
  ...defaultSettingOther,
} as const satisfies Setting;

export const Setting = {
  ALL,
  PARTIAL,
  NONE,
  SAME,
  list: Object.keys(defaultSetting) as (keyof Setting)[],
  isValidMul: Valid.isMul,
  isValidAdd: Valid.isAdd,
  isValidCut: Valid.isCut,
  isValidDamageCut: Valid.isDamageCut,
  isValidAttackSpeed: Valid.isAttackSpeed,
  isValidCooldownCut: Valid.isCooldownCut,
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

export function useFilterState(): [Filter, Dispatch<FilterAction>] {
  const [filter, dispatch] = useReducer(filterReducer, defaultFilter);
  const [init, setInit] = useState(false);

  useEffect(() => {
    dispatch({
      type: FilterAction.initialize,
      initialValue: Storage.getFilter(),
    });
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setFilter(filter);
    }
  }, [filter, init]);

  return [filter, dispatch];
}

const SettingAction = {
  change: "change",
  resetUnit: "reset-unit",
  resetFormation: "reset-formation",
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
    case SettingAction.resetOther: {
      return fn(defaultSettingOther);
    }
  }
}

export function useSettingState(): [Setting, Dispatch<SettingAction>] {
  const [setting, dispatch] = useReducer(settingReducer, defaultSetting);
  const [init, setInit] = useState(false);

  useEffect(() => {
    dispatch({ type: SettingAction.change, nextValue: Storage.getSetting() });
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setSetting(setting);
    }
  }, [setting, init]);

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

  useEffect(() => {
    dispatch({
      type: UISettingAction.change,
      nextValue: Storage.getUISetting(),
    });
    setInit(true);
  }, []);

  useEffect(() => {
    if (init) {
      Storage.setUISetting(uISetting);
    }
  }, [uISetting, init]);

  return [uISetting, dispatch];
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
};

// Storage
const storageKeys = {
  FILTER: "database-filter",
  SETTING: "database-setting",
  QUERY: "database-query",
  UI_SETTING: "database-UI-setting",
} as const;
type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

class Storage {
  private static getStorage() {
    try {
      return sessionStorage;
    } catch {
      return;
    }
  }

  private static getItem(key: StorageKey): string | undefined {
    const storage = this.getStorage();
    if (storage !== undefined) {
      try {
        const item = storage.getItem(key);
        if (item !== null) return item;
      } catch {}
    }
  }

  private static setItem(key: StorageKey, value: string): void {
    const storage = this.getStorage();
    if (storage !== undefined) storage.setItem(key, value);
  }

  private static getObject(key: StorageKey): object | undefined {
    const item = this.getItem(key);
    if (item === undefined) return;
    const ret: unknown = JSON.parse(item);
    if (typeof ret !== "object" || ret === null) return;
    return ret;
  }

  private static setObject(
    key: StorageKey,
    obj: Record<string, unknown>
  ): void {
    this.setItem(key, JSON.stringify(obj));
  }

  static getSetting(): Setting {
    const item = this.getObject(storageKeys.SETTING);
    if (item === undefined) return defaultSetting;
    const obj = item as Record<keyof Setting, unknown>;
    const ret: Partial<Record<keyof Setting, unknown>> = {};
    Setting.list.forEach((key) => {
      const v = obj[key];
      const valid = settingValidation[key](v);
      ret[key] = valid ? v : defaultSetting[key];
    });

    if (ret.mainBeast === ret.subBeast && ret.subBeast !== -1)
      ret.subBeast = defaultSetting.subBeast;

    return ret as Setting;
  }
  static setSetting(obj: Setting): void {
    this.setObject(storageKeys.SETTING, obj);
  }

  static getFilter(): Map<FilterKeys, boolean> {
    const obj = this.getObject(storageKeys.FILTER);
    const ret = new Map<FilterKeys, boolean>();

    if (!this.isFilter(obj)) {
      return ret;
    }
    for (const key of filterKeys) {
      if (obj[key] === undefined) continue;
      ret.set(key, obj[key]);
    }
    return ret;
  }
  static setFilter(item: Filter): void {
    const obj: FilterObject = {};
    for (const [key, value] of item.entries()) obj[key] = value;
    Storage.setObject(storageKeys.FILTER, obj);
  }
  private static isFilter(obj: unknown): obj is FilterObject {
    if (typeof obj !== "object" || obj === null) return false;
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
  static setUISetting(obj: UISetting) {
    this.setObject(storageKeys.UI_SETTING, obj);
  }
  private static isUISetting(obj: unknown): obj is UISetting {
    if (typeof obj !== "object" || obj === null) return false;
    const v = obj as Record<keyof UISetting, unknown>;
    if (typeof v.subskillGroup !== "number") return false;
    return true;
  }
}
