"use client";

import jsonUnits from "@/assets/unit.json";
import * as Data from "./Data";
import * as Util from "./Util";
import * as Stat from "./Stat";
import {
  FilterEquipment,
  Setting,
  type FilterKeys,
  type States,
} from "./States";
import Class from "./Class";
import Subskill, { type SubskillFactorKey } from "./Subskill";
import Beast, { type BeastFactorKeys } from "./Beast";
import type { TableSource } from "./StatTable";
import { Feature, type FeatureOutput, type JsonFeature } from "./Feature";

export interface JsonUnit {
  DISABLED?: boolean;
  id: number;
  parentId?: number;
  unitName: string;
  unitShortName: string;
  rarity: string;
  class?: string;
  element?: string;
  species?: string;
  cost?: number;
  hp: number;
  attack: number;
  defense: number;
  resist: number;
  attackSpeed?: number;
  attackSpeedFrame?: number;
  delay?: number;
  block?: number | null;
  target?: Data.JsonTarget;
  rounds?: Data.JsonRound;
  splash?: boolean;
  range?: number;
  moveSpeed?: number;
  moveType?: string | null;
  damageType?: Data.JsonDamageType;
  placement?: Data.JsonPlacement;
  supplements?: readonly string[];
  exSkill1?: Data.JsonSkill;
  exSkill2?: Data.JsonSkill;

  potentials?: Data.JsonPotentials;
  weapon?: Data.JsonWeapon;
  formationBuffs?: readonly Data.JsonFormationBuff[];
  features?: readonly JsonFeature[];
  isEventUnit?: boolean;
  isUnhealable?: boolean;
  costAdd?: number;
  hpMul?: number;
  attackMul?: number;
  defenseMul?: number;
  resistMul?: number;
  criChanceAdd?: number;
  criDamageAdd?: number;
  penetrationAdd?: number;
  delayMul?: number;
  fixedDelay?: number;
  blockAdd?: number;
  targetAdd?: number;
  rangeAdd?: number;
  physicalEvasion?: number;
  magicalEvasion?: number;
  moveSpeedAdd?: number;
  moveSpeedMul?: number;
  potentialBonus?: JsonPotentialBonus;
  situations?: JsonUnitSituations;
  buffs?: JsonBuffs;
}
type JsonPotentialBonus = Readonly<
  Partial<{
    costAdd: number;
    hpMul: number;
    attackMul: number;
    defenseMul: number;
    resistMul: number;
    criDamageAdd: number;
    rounds: Data.JsonRound;
    rangeAdd: number;
    physicalEvasion: number;
    magicalEvasion: number;
    moveSpeedAdd: number;
    moveSpeedMul: number;
  }>
>;

interface UnitSituation {
  skill: number;
  isGeneral: boolean;
  isGeneralProper: boolean;
  isGeneralAction: boolean;
  isGeneralProperAction: boolean;
  hasPotentials: Readonly<Data.JsonPotentials>;
  features: readonly string[];
}
type UnitSituations = readonly Readonly<Partial<UnitSituation>>[];

interface JsonUnitSituation extends UnitSituation {
  depend: readonly string[];
  exclude: readonly string[];
  require: readonly string[];
  proper: boolean;
  bottom: boolean;
}
type JsonUnitSituations = readonly Readonly<Partial<JsonUnitSituation>>[];

export type JsonBuff = Readonly<{
  type: string;
  require?: readonly string[];
  skill?: number;
  target?: string;
  duration?: string | number;
  value?: number;
  supplements?: readonly string[];
  potentialBonus?: Omit<
    JsonBuff,
    "type" | "require" | "skill" | "potentialBonus"
  >;
}>;
type JsonBuffs = readonly JsonBuff[];

const keys = [
  "unitId",
  "unitName",
  "unitShortName",
  "rarity",
  "className",
  "element",
  "species",
  "cost",
  "hp",
  "attack",
  "defense",
  "resist",
  "attackSpeed",
  "delay",
  "block",
  "target",
  "range",
  "damageType",
  "moveSpeed",
  "moveType",
  "placement",
  "exSkill1",
  "exSkill2",
] as const satisfies Data.StatType[];
type Keys = (typeof keys)[number];

const stat = Data.stat;
const ssKeys = Subskill.keys;
const Percent = Data.Percent;

export default class Unit implements TableSource<Keys> {
  readonly id: number;
  readonly src: Readonly<JsonUnit>;

  readonly unitId: Stat.Root;
  readonly parentId: number | undefined;
  readonly isToken: boolean;
  readonly unitName: Stat.Root<string>;
  readonly unitShortName: Stat.UnitName;
  readonly rarity: Stat.Root<Data.Rarity | undefined>;
  readonly className: Stat.Root<Data.ClassName | undefined>;
  readonly element: Stat.Root<Data.Element | undefined>;
  readonly species: Stat.Root<Data.Species | undefined>;
  readonly cost: Stat.Root;
  readonly hp: Stat.Base<number>;
  readonly attack: Stat.Base<number>;
  readonly defense: Stat.Base<number>;
  readonly resist: Stat.Base<number>;
  readonly criticalChance: Stat.Root;
  readonly criticalDamage: Stat.Root;
  readonly penetration: Stat.Root;
  readonly physicalEvasion: Stat.Root;
  readonly magicalEvasion: Stat.Root;
  readonly attackSpeed: Stat.AttackSpeed;
  readonly delay: Stat.Delay;
  readonly block: Stat.Root;
  readonly target: Stat.Target;
  readonly rounds: Stat.Root<Data.Rounds>;
  readonly splash: Stat.Root<boolean>;
  readonly range: Stat.Base;
  readonly damageType: Stat.Root<Data.DamageType | undefined>;
  readonly moveSpeed: Stat.Root<number | undefined, Data.MoveSpeedFactors>;
  readonly moveType: Stat.Root<Data.MoveType | undefined>;
  readonly placement: Stat.Root<Data.Placement>;
  readonly exSkill1: Stat.Root<Readonly<Data.Skill> | undefined>;
  readonly exSkill2: Stat.Root<Readonly<Data.Skill> | undefined>;

  readonly wideTarget: boolean;
  readonly potentials: readonly (Data.Potential | undefined)[];
  readonly weapon: Readonly<Data.Weapon> | undefined;
  readonly supplements: ReadonlySet<string>;
  readonly features: readonly FeatureOutput[];
  readonly formationBuffs: Data.FormationBuff[];
  readonly isEventUnit: boolean;
  readonly isUnhealable: boolean;
  readonly hpMul: number | undefined;
  readonly attackMul: number | undefined;
  readonly defenseMul: number | undefined;
  readonly resistMul: number | undefined;
  readonly fixedDelay: number | undefined;
  readonly rangeAdd: number | undefined;
  readonly potentialBonus: JsonPotentialBonus | undefined;
  readonly situations: UnitSituations;

  readonly rangeBase: number | undefined;

  private tokenParent: Unit | undefined;
  private cacheSubskill = new Data.Cache<
    [Subskill | undefined, Subskill | undefined]
  >();
  private cachePotentialValues = new Map<Data.StatType, number>();

  constructor(src: Readonly<JsonUnit>) {
    this.id = src.id;
    this.src = src;

    const unitId = src.parentId ?? src.id;
    this.unitId = new Stat.Root({
      statType: stat.unitId,
      calculater: () => unitId,
    });

    this.parentId = src.parentId;
    this.isToken = this.parentId !== undefined;

    this.unitName = new Stat.Root({
      statType: stat.unitName,
      calculater: () => src.unitName,
      comparer: (s) => this.unitShortName.getSortOrder(s),
    });

    this.unitShortName = new Stat.UnitName({
      statType: stat.unitShortName,
      calculater: () => src.unitShortName,
      unit: this,
    });

    const rarity = Data.Rarity.parse(src.rarity);
    {
      const comparer = Data.Rarity.indexOf(rarity);
      const color = Data.Rarity.colorOf(rarity);
      this.rarity = new Stat.Root({
        statType: stat.rarity,
        calculater: () => rarity,
        comparer: () => comparer,
        color: () => color,
      });
    }

    const className = Data.ClassName.parse(src.class);
    {
      const comparer = Data.ClassName.indexOf(className);
      this.className = new Stat.Root({
        statType: stat.className,
        calculater: () => className,
        comparer: () => comparer,
      });
    }
    const classData =
      className === undefined ? undefined : Class.getItem(className);

    const element = Data.Element.parse(src.element);
    {
      const comparer = Data.Element.indexOf(element);
      const color = Data.Element.colorOf(element);
      this.element = new Stat.Root({
        statType: stat.element,
        calculater: () => element,
        comparer: () => comparer,
        color: () => color,
      });
    }

    const species = Data.Species.parse(src.species);
    this.species = new Stat.Root({
      statType: stat.species,
      calculater: () => species,
    });

    const getCost = (setting: Setting) => {
      const base = src.cost ?? classData?.cost;
      if (base === undefined) return;
      const pCostAdd = this.isPotentialApplied(setting)
        ? src.potentialBonus?.costAdd
        : undefined;
      const value = base + (pCostAdd ?? src.costAdd ?? 0);

      if (className === Data.className.shaman || this.isToken) return value;
      switch (rarity) {
        case Data.Rarity.L:
          return value + 1;
        case Data.Rarity.C:
          return value - 1;
        default:
          return value;
      }
    };
    this.cost = new Stat.Root({
      statType: stat.cost,
      calculater: (s) => {
        const cost = getCost(s);
        if (cost !== undefined) {
          const ss = this.getSubskillFactor(s, ssKeys.cost);
          return this.calculateStat(s, stat.cost, cost + ss);
        }
      },
    });

    this.hp = this.getBaseStat(src, stat.hp);
    this.attack = this.getBaseStat(src, stat.attack);
    this.defense = this.getBaseStat(src, stat.defense);
    this.resist = this.getBaseStat(src, stat.resist);

    const criticalChance = Data.defaultCriChance + (src.criChanceAdd ?? 0);
    this.criticalChance = new Stat.Root({
      statType: stat.criticalChance,
      calculater: () => criticalChance,
    });

    this.criticalDamage = new Stat.Root({
      statType: stat.criticalDamage,
      calculater: (s) => {
        let a;
        if (this.isPotentialApplied(s)) a = this.potentialBonus?.criDamageAdd;
        a ??= src.criDamageAdd ?? 0;
        return Data.defaultCriDamage + a;
      },
    });

    const penetration =
      (classData?.penetration ?? 0) + (src.penetrationAdd ?? 0);
    this.penetration = new Stat.Root({
      statType: stat.penetration,
      calculater: () => penetration,
    });

    this.physicalEvasion = new Stat.Root({
      statType: stat.physicalEvasion,
      calculater: (s) => {
        const potential = this.isPotentialApplied(s)
          ? src.potentialBonus?.physicalEvasion
          : undefined;
        return potential ?? src.physicalEvasion;
      },
    });

    this.magicalEvasion = new Stat.Root({
      statType: stat.magicalEvasion,
      calculater: (s) => {
        const potential = this.isPotentialApplied(s)
          ? src.potentialBonus?.magicalEvasion
          : undefined;
        return potential ?? src.magicalEvasion;
      },
    });

    const attackSpeed = src.attackSpeed ?? classData?.attackSpeed;
    this.attackSpeed = new Stat.AttackSpeed({
      statType: stat.attackSpeed,
      calculater: (s) => this.attackSpeed.getFactors(s)?.attackSpeedResult,
      factors: (s) => {
        if (attackSpeed === undefined && src.attackSpeedFrame === undefined)
          return;
        const attackSpeedBase = Data.getAttackSpeed(attackSpeed);
        const fixedAttackSpeed = src.attackSpeedFrame;
        const p = this.getPotentialFactor(s, stat.attackSpeed);
        const attackSpeedResult =
          fixedAttackSpeed ?? Data.getAttackSpeed((attackSpeed ?? 0) + p);
        const attackSpeedPotential =
          attackSpeedBase === undefined
            ? 0
            : attackSpeedBase - attackSpeedResult;
        return {
          attackSpeedBase,
          attackSpeedPotential,
          fixedAttackSpeed,
          attackSpeedResult,
        };
      },
    });

    this.delay = new Stat.Delay({
      statType: stat.delay,
      calculater: (s) => this.delay.getFactors(s)?.result,
      factors: (s) => {
        const delay = src.delay ?? classData?.delay;
        const delayMul = src.delayMul;
        const fixedDelay = this.fixedDelay;
        const subskillBuff = this.getSubskillFactor(s, ssKeys.delayMul);
        const formationBuff = this.getFormationBuffFactor(s, stat.delay);
        const beastFormationBuff = this.getBeastFormationBuffFactor(
          s,
          stat.delay
        );
        let delaySubtotal;
        if (delay !== undefined)
          delaySubtotal = Percent.multiply(
            delay,
            delayMul,
            subskillBuff,
            formationBuff,
            beastFormationBuff
          );
        const result = fixedDelay ?? delaySubtotal;
        if (result === undefined) return;
        return {
          delay,
          delayMul,
          delaySubtotal,
          fixedDelay,
          subskillBuff,
          formationBuff,
          beastFormationBuff,
          result,
        };
      },
    });

    this.block = new Stat.Root({
      statType: stat.block,
      calculater: (s) => {
        if (src.block === null) return;
        const b = src.block ?? classData?.block ?? 1;
        return this.calculateStat(s, stat.block, b + (src.blockAdd ?? 0));
      },
      isReversed: true,
    });

    this.target = new Stat.Target({
      statType: stat.target,
      calculater: (s) => this.target.getFactors(s)?.target,
      factors: (s) => {
        const tbase = Data.JsonTarget.parse(src.target) ?? classData?.target;
        if (tbase === undefined) return;

        const p = this.getPotentialFactor(s, stat.target);
        const isBlock = tbase === Data.Target.block;
        const target = isBlock
          ? this.block.getValue(s)
          : Data.Target.sum(tbase, src.targetAdd ?? 0, p);
        if (target === undefined) return;

        const splash = this.splash.getValue(s);
        const rounds = this.rounds.getValue(s);
        const wideTarget = this.wideTarget;
        return {
          target,
          isBlock,
          splash,
          rounds,
          wideTarget,
          laser: false,
        };
      },
    });

    const rounds = Data.JsonRound.parse(src.rounds ?? classData?.rounds ?? 1);
    {
      const potential = Data.JsonRound.parse(src.potentialBonus?.rounds);
      this.rounds = new Stat.Root({
        statType: stat.round,
        calculater: (s) => {
          if (this.isPotentialApplied(s)) return potential ?? rounds;
          return rounds;
        },
      });
    }

    const splash = src.splash ?? classData?.splash ?? false;
    this.splash = new Stat.Root({
      statType: stat.splash,
      calculater: () => splash,
    });

    this.rangeBase = src.range ?? classData?.range;
    this.range = new Stat.Base({
      statType: stat.range,
      calculater: (s) => this.range.getFactors(s)?.deploymentResult,
      isReversed: true,
      factors: (s) => {
        if (this.rangeBase === undefined) return;
        return this.getDeploymentFactors(s, stat.range, this.rangeBase);
      },
    });

    this.damageType = new Stat.Root({
      statType: stat.damageType,
      calculater: () =>
        Data.JsonDamageType.parse(src.damageType) ?? classData?.damageType,
      comparer: (s) => Data.DamageType.indexOf(this.damageType.getValue(s)),
      color: (s) => Data.DamageType.colorOf(this.damageType.getValue(s)),
    });

    this.moveSpeed = new Stat.Root({
      statType: stat.moveSpeed,
      calculater: (s) => this.moveSpeed.getFactors(s).result,
      isReversed: true,
      factors: (s) => {
        const base = src.moveSpeed ?? classData?.moveSpeed ?? 160;
        const formation = this.getFormationBuffFactor(s, stat.moveSpeed);
        const beastFormation = this.getBeastFormationBuffFactor(
          s,
          stat.moveSpeed
        );
        const w = this.getWeaponBaseBuff(s, stat.moveSpeed) ?? 100;

        let addition, mul;
        if (this.isPotentialApplied(s)) {
          addition = src.potentialBonus?.moveSpeedAdd;
          mul = src.potentialBonus?.moveSpeedMul;
        }
        addition ??= src.moveSpeedAdd ?? 0;
        mul ??= src.moveSpeedMul ?? 100;
        const potential = 100 + this.getPotentialFactor(s, stat.moveSpeed);

        const ssMul = this.getSubskillFactor(s, ssKeys.moveSpeed);
        const subskillAdd = this.getSubskillFactor(s, ssKeys.moveSpeedAdd);

        const multiply = Math.max(w, mul, ssMul, potential);

        const result =
          Percent.multiply(base + formation + beastFormation, multiply) +
          subskillAdd +
          addition;
        return {
          base,
          formation,
          beastFormation,
          multiply,
          addition,
          subskillAdd,
          result,
        };
      },
    });

    this.moveType = new Stat.Root({
      statType: stat.moveType,
      calculater: (s) => {
        if (src.moveType === null) return;
        const placement = this.placement.getValue(s);
        if (Data.Placement.hasMoveType(placement)) {
          return (
            Data.MoveType.parse(src.moveType) ??
            classData?.moveType ??
            Data.MoveType.normal
          );
        }
      },
      comparer: (s) => -Data.MoveType.indexOf(this.moveType.getValue(s)),
      color: (s) => Data.MoveType.colorOf(this.moveType.getValue(s)),
    });

    const placement = Data.JsonPlacement.parse(src.placement);
    this.placement = new Stat.Root({
      statType: stat.placement,
      calculater: (s) => {
        const potential =
          this.getPotentialFactor(s, stat.placement) === 1
            ? Data.Placement.omniguard
            : undefined;
        return potential ?? placement ?? classData?.placement;
      },
      text: (s) => {
        const v = this.placement.getValue(s);
        if (v === undefined) return;
        return Data.Placement.name[v];
      },
      comparer: (s) => {
        const v = this.placement.getValue(s);
        if (v === undefined) return;
        return Data.Placement.index[v];
      },
      color: (s) => {
        const v = this.placement.getValue(s);
        if (v === undefined) return;
        return Data.Placement.color[v];
      },
    });

    this.exSkill1 = new Stat.Root({
      statType: stat.exSkill1,
      calculater: () => Unit.toSkill(src.exSkill1),
      comparer: (s) => this.exSkill1.getValue(s)?.skillName,
      text: (s) => this.exSkill1.getValue(s)?.skillName,
    });

    this.exSkill2 = new Stat.Root({
      statType: stat.exSkill2,
      calculater: () => Unit.toSkill(src.exSkill2),
      comparer: (s) => this.exSkill2.getValue(s)?.skillName,
      text: (s) => this.exSkill2.getValue(s)?.skillName,
    });

    this.wideTarget = classData?.wideTarget ?? false;
    this.potentials = Data.JsonPotentials.parse(src.potentials);
    this.weapon = src.weapon;
    {
      const s = new Set(classData?.supplements);
      src.supplements?.forEach((v) => s.add(v));
      this.supplements = s;
    }
    this.features = [
      ...(classData?.features ?? []),
      ...Feature.getCommonFeatures(),
      ...Feature.parseList(src.features ?? []),
    ];
    this.formationBuffs = Data.JsonFormationBuff.parse(
      src.formationBuffs ?? []
    );
    this.isEventUnit = src.isEventUnit ?? false;
    this.isUnhealable = src.isUnhealable ?? false;
    this.hpMul = src.hpMul;
    this.attackMul = src.attackMul;
    this.defenseMul = src.defenseMul;
    this.resistMul = src.resistMul;
    this.fixedDelay = src.fixedDelay;
    this.rangeAdd = src.rangeAdd;
    this.potentialBonus = src.potentialBonus;
    this.situations = this.getSituations(classData, src.situations);
  }

  private getSituations(
    classData: Class | undefined,
    src: JsonUnitSituations | undefined
  ): UnitSituations {
    const ret: Partial<UnitSituation>[] = [];
    const classProper: Partial<UnitSituation>[] = [];

    classData?.situations?.forEach((classSituation) => {
      const classFeatures = classSituation.features ?? [];

      if (classSituation.proper) {
        classProper.push({
          ...classSituation,
          skill: -1,
        });
        return;
      }

      src?.forEach((unitSituation) => {
        if (
          unitSituation.exclude?.some((v) => classFeatures.includes(v)) ||
          unitSituation.depend?.some((v) => !classFeatures.includes(v)) ||
          unitSituation.proper ||
          unitSituation.bottom
        )
          return;

        const features: string[] = [
          ...(unitSituation.features ?? []),
          ...classFeatures,
        ];
        ret.push({
          ...unitSituation,
          features,
        });
      });
    });

    src?.forEach((unitSituation) => {
      if (unitSituation.proper) {
        const isGeneral = unitSituation.isGeneral ?? true;
        ret.push({
          ...unitSituation,
          isGeneral,
        });
        return;
      }
      if (classData?.situations === undefined) {
        ret.push({ ...unitSituation });
      }
    });

    ret.push(...classProper);

    src?.forEach((unitSituation) => {
      if (unitSituation.bottom) {
        const isGeneral = unitSituation.isGeneral ?? true;
        ret.push({
          ...unitSituation,
          isGeneral,
        });
        return;
      }
    });

    return ret;
  }

  getTokenParent(): Unit | undefined {
    if (this.parentId === undefined) return;
    this.tokenParent ??= Unit.list.find((u) => u.id === this.parentId);
    return this.tokenParent;
  }

  private calculateStat<T extends number | undefined>(
    setting: Setting,
    statType: Data.MainStatType,
    value: T
  ): T {
    if (value === undefined) return value;
    return this.getDeploymentFactors(setting, statType, value)
      .deploymentResult as T;
  }

  private getBaseStat(data: Readonly<JsonUnit>, key: Data.BaseStatType) {
    const ret: Stat.Base<number> = new Stat.Base({
      statType: key,
      calculater: (s) => ret.getFactors(s)?.deploymentResult ?? 0,
      item: (s) => {
        const c = ret.getText(s);
        if (key === stat.hp && this.isUnhealable)
          return Util.getUnhealableText(c);
        return c;
      },
      isReversed: true,
      factors: (s) => this.getDeploymentFactors(s, key, data[key]),
    });
    return ret;
  }

  private getBarrackFactors(
    setting: Setting,
    statType: Data.MainStatType,
    value: number
  ): Data.BarrackFactors {
    const ret: Data.BarrackFactorsBase = {
      base: value,
      potential: this.getPotentialFactor(setting, statType),
      weaponBase: this.getWeaponBaseFactor(setting, statType),
      weaponUpgrade: this.getWeaponUpgradeFactor(setting, statType),
      weaponBaseBuff: this.getWeaponBaseBuff(setting, statType),
      baseBuff: this.getBaseBuff(setting, statType),
      baseAdd: this.getBaseAdd(setting, statType),
      subskillMul: this.getSubskillMultiFactor(setting, statType),
      subskillAdd: this.getSubskillAddFactor(setting, statType),
    };
    return {
      ...ret,
      barrackResult: this.calculateBarrackResult(ret),
    };
  }

  private calculateBarrackResult(factors: Data.BarrackFactorsBase): number {
    const a = factors.base + factors.potential;
    const b = Percent.multiply(a, factors.baseBuff);
    const c = b + factors.baseAdd;
    const d = Percent.sum(factors.subskillMul, factors.weaponBaseBuff);
    const e = Percent.multiply(c, d);
    return e + factors.subskillAdd + factors.weaponBase + factors.weaponUpgrade;
  }

  private getDeploymentFactors(
    setting: Setting,
    statType: Data.MainStatType,
    value: number
  ): Data.DeploymentFactors {
    const ret = {
      ...this.getBarrackFactors(setting, statType, value),
      formationBuff: this.getFormationBuffFactor(setting, statType),
      beastFormationBuff: this.getBeastFormationBuffFactor(setting, statType),
      beastPossLevel: this.isToken
        ? 100
        : Data.Beast.getPossLevelFactor(setting, statType),
      beastPossAmount: this.isToken
        ? 0
        : Data.Beast.getPossAmountFactor(setting, statType),
    };
    return {
      ...ret,
      deploymentResult: this.calculateDeploymentResult(statType, ret),
    };
  }

  private calculateDeploymentResult(
    statType: Data.MainStatType,
    factors: Data.DeploymentFactorsBase
  ): number {
    const res = factors.barrackResult;
    if (this.isToken) return res;
    const a = Percent.multiply(res, factors.formationBuff);
    let b;
    if (Data.Beast.isFormationFactorAdd(statType))
      b = Math.max(0, a + factors.beastFormationBuff);
    else b = Percent.multiply(a, factors.beastFormationBuff);
    const c = Percent.multiply(b, factors.beastPossLevel);
    return c + factors.beastPossAmount;
  }

  public isPotentialApplied(setting: Setting): boolean {
    switch (setting.potential) {
      case Setting.ALL:
        return true;
      case Setting.PARTIAL: {
        const u = this.isToken ? this.getTokenParent() : this;
        return u?.rarity.getValue(setting) !== Data.Rarity.L || u.isEventUnit;
      }
      default:
        return false;
    }
  }

  getPotentialFactor(setting: Setting, statType: Data.StatType): number {
    if (!this.isPotentialApplied(setting)) return 0;

    const cache = this.cachePotentialValues.get(statType);
    if (cache !== undefined) return cache;
    else {
      const ret = Data.Potential.getEffectValue(statType, this.potentials);
      this.cachePotentialValues.set(statType, ret);
      return ret;
    }
  }

  private getWeaponBaseFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    if (!Data.Weapon.isApplied(setting)) return 0;
    const w = this.weapon;
    if (w === undefined) return 0;
    if (Data.Weapon.isKey(statType)) {
      return w[statType] ?? 0;
    } else {
      return 0;
    }
  }

  private getWeaponUpgradeFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    if (setting.weapon !== Setting.ALL) return 0;
    let n = 0;
    let k;
    Data.baseStatList.forEach((v) => {
      if (this.weapon !== undefined && this.weapon[v] !== undefined) {
        n++;
        if (v === statType) k = true;
      }
    });
    if (n === 0 || !k) return 0;
    return (statType === stat.hp ? 2400 : 240) / n;
  }

  private getWeaponBaseBuff(
    setting: Setting,
    statType: Data.StatType
  ): number | undefined {
    if (!Data.Weapon.isApplied(setting)) return;
    switch (statType) {
      case stat.hp:
        return this.weapon?.hpMul;
      case stat.attack:
        return this.weapon?.attackMul;
      case stat.moveSpeed:
        return this.weapon?.moveSpeedMul;
    }
  }

  private getBaseBuff(
    setting: Setting,
    statType: Data.MainStatType
  ): number | undefined {
    if (Data.BaseStatType.isKey(statType)) {
      const p = this.potentialBonus;
      if (p !== undefined && this.isPotentialApplied(setting)) {
        const m = p[Data.BaseStatType.mulKey[statType]];
        if (m !== undefined) return m;
      }
      return this[Data.BaseStatType.mulKey[statType]];
    }
  }

  private getBaseAdd(setting: Setting, statType: Data.MainStatType): number {
    const p = this.isPotentialApplied(setting);
    switch (statType) {
      case stat.range:
        return (
          (p ? this.potentialBonus?.rangeAdd : undefined) ?? this.rangeAdd ?? 0
        );
      default:
        return 0;
    }
  }

  private getFormationBuffValue(
    setting: Setting,
    statType: Data.StatType
  ): Data.FormationBuffValue[] {
    if (
      !(
        Data.BaseStatType.isKey(statType) ||
        statType === stat.delay ||
        statType === stat.moveSpeed
      ) ||
      !this.isPotentialApplied(setting)
    )
      return this.formationBuffs;

    return this.formationBuffs.map((b) => {
      const p = b.potentialBonus;
      if (p !== undefined && p[statType] !== undefined) {
        return {
          ...b,
          [statType]: p[statType],
        };
      }
      return b;
    });
  }

  private getFormationBuffFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    let defaultValue;
    switch (statType) {
      case stat.moveSpeed:
        defaultValue = 0;
        break;
      default:
        defaultValue = 100;
        break;
    }
    if (this.isToken) return defaultValue;

    const k = (() => {
      switch (statType) {
        case stat.hp:
          return ssKeys.formationHp;
        case stat.attack:
          return ssKeys.formationAttack;
        case stat.defense:
          return ssKeys.formationDefense;
        case stat.resist:
          return ssKeys.formationResist;
      }
    })();
    const subskill =
      k !== undefined ? this.getSubskillFactor(setting, k) : defaultValue;
    const panel =
      (() => {
        switch (statType) {
          case stat.hp:
            return setting.formationHp;
          case stat.attack:
            return setting.formationAttack;
          case stat.defense:
            return setting.formationDefense;
          case stat.resist:
            return setting.formationResist;
          default:
            return 0;
        }
      })() + defaultValue;

    return [
      ...this.getFormationBuffValue(setting, statType).map((buff) => {
        const req = buff.require.every((r) => {
          switch (r) {
            case Data.FormationBuffRequire.weapon:
              return Data.Weapon.isApplied(setting);
          }
        });
        if (!req) return defaultValue;

        const isTarget = [
          Data.FormationBuff.all,
          this.element.getValue(setting),
          Data.ClassName.baseNameOf(this.className.getValue(setting)),
          this.species.getValue(setting),
        ].some((s) => {
          if (s === undefined) return false;
          return buff.targets.has(s);
        });

        if (
          isTarget &&
          (Data.BaseStatType.isKey(statType) ||
            statType === stat.delay ||
            statType === stat.moveSpeed)
        )
          return buff[statType] ?? defaultValue;

        return defaultValue;
      }),
      subskill,
      panel,
    ].reduce((a, c) => a + c - defaultValue, defaultValue);
  }

  private getBeastFactor(setting: Setting, key: BeastFactorKeys): number {
    const keys = Beast.keys;
    const isAdd = (() => {
      switch (key) {
        case keys.cost:
        case keys.rangeAdd:
        case keys.moveSpeedAdd:
          return true;
        default:
          return false;
      }
    })();

    if (this.isToken) {
      if (isAdd) return 0;
      return 100;
    }

    const mb = Beast.getItem(setting.mainBeast);
    const sb = Beast.getItem(setting.subBeast);
    const className = this.className.getValue(setting);
    const types = [
      Data.ClassName.baseNameOf(className),
      this.element.getValue(setting),
      this.species.getValue(setting),
    ];
    const fn = (ss: Beast | undefined) => {
      if (ss === undefined) return;
      return ss.getFactor(key, types);
    };
    const v1 = fn(mb);
    const v2 = fn(sb);

    switch (key) {
      case keys.delayMul:
      case keys.initialTimeMul:
        return Math.min(v1 ?? 100, v2 ?? 100);
      default:
        if (isAdd) {
          const r1 = v1 ?? 0;
          const r2 = v2 ?? 0;
          if (r1 < 0 && r2 < 0) return Math.min(r1, r2);
          else if (r1 > 0 && r2 > 0) return Math.max(r1, r2);
          else return r1 + r2;
        }
        return 100 + Math.max(v1 ?? 0, v2 ?? 0);
    }
  }

  getBeastFormationBuffFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    const keys = Beast.keys;
    const key = (() => {
      switch (statType) {
        case stat.cost:
        case stat.hp:
        case stat.attack:
        case stat.defense:
        case stat.resist:
          return statType;
        case stat.delay:
          return keys.delayMul;
        case stat.range:
          return keys.rangeAdd;
        case stat.initialTime:
          return keys.initialTimeMul;
        case stat.moveSpeed:
          return keys.moveSpeedAdd;
      }
    })();
    if (key === undefined) return 100;
    return this.getBeastFactor(setting, key);
  }

  getSubskills(setting: Setting): [Subskill | undefined, Subskill | undefined] {
    return this.cacheSubskill.getCache(() => {
      return [
        Subskill.getItem(setting.subskill1),
        Subskill.getItem(setting.subskill2),
      ];
    }, setting);
  }

  private getSubskillFactor(setting: Setting, key: SubskillFactorKey): number {
    const isMul = (() => {
      switch (key) {
        case ssKeys.hp:
        case ssKeys.attack:
        case ssKeys.defense:
        case ssKeys.resist:
        case ssKeys.formationHp:
        case ssKeys.formationAttack:
        case ssKeys.formationDefense:
        case ssKeys.formationResist:
        case ssKeys.delayMul:
        case ssKeys.moveSpeed:
          return true;
        default:
          return false;
      }
    })();
    if (this.isToken) return isMul ? 100 : 0;

    const [ss1, ss2] = this.getSubskills(setting);
    const className = this.className.getValue(setting);
    const types = [
      className,
      Data.ClassName.baseNameOf(className),
      this.element.getValue(setting),
      this.species.getValue(setting),
    ];
    const fn = (ss: Subskill | undefined) => {
      if (ss === undefined) return;
      const ret = ss.getFactor(key, types);
      if (typeof ret === "boolean") return ret ? 1 : 0;
      return ret;
    };
    const v1 = fn(ss1);
    const v2 = fn(ss2);
    const isStackable = Subskill.isStackable(ss1, ss2);

    switch (key) {
      case ssKeys.cost:
        return isStackable ? (v1 ?? 0) + (v2 ?? 0) : Math.min(v1 ?? 0, v2 ?? 0);
      case ssKeys.delayMul:
        return isStackable
          ? Percent.multiply(v1, v2)
          : Math.min(v1 ?? 100, v2 ?? 100);
      default:
        if (isMul)
          return (
            100 +
            (isStackable ? (v1 ?? 0) + (v2 ?? 0) : Math.max(v1 ?? 0, v2 ?? 0))
          );
        else
          return isStackable
            ? (v1 ?? 0) + (v2 ?? 0)
            : Math.max(v1 ?? 0, v2 ?? 0);
    }
  }

  private getSubskillMultiFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    switch (statType) {
      case stat.hp:
      case stat.attack:
      case stat.defense:
      case stat.resist:
        return this.getSubskillFactor(setting, statType);
      default:
        return 100;
    }
  }

  private getSubskillAddFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    const keys = ssKeys;
    const fn = (k: SubskillFactorKey) => {
      return this.getSubskillFactor(setting, k);
    };

    switch (statType) {
      case stat.hp:
        return fn(keys.hpAdd);
      case stat.attack:
        return fn(keys.attackAdd);
      case stat.defense:
        return fn(keys.defenseAdd);
      case stat.resist:
        return fn(keys.resistAdd);
      case stat.range:
        return fn(keys.rangeAdd);
      default:
        return 0;
    }
  }

  private static toSkill(
    value: Data.JsonSkill | undefined
  ): Data.Skill | undefined {
    if (value === undefined) return;
    return Data.JsonSkill.parse(value);
  }

  static comparer(
    setting: Setting,
    key: Keys,
    target: Unit
  ): string | number | undefined {
    return target[key].getSortOrder(setting);
  }

  static filter(states: States, list: readonly Unit[]): readonly Unit[] {
    return list.filter((item) => {
      const parent = item.getTokenParent();
      const target = parent !== undefined ? parent : item;
      const className = target.className.getValue(states.setting);
      const filterKeys = FilterEquipment.getKeys(states.filter);
      const classNameKey = Data.ClassName.keyOf(className);
      if (
        filterKeys.size > 0 &&
        classNameKey !== undefined &&
        !filterKeys.has(classNameKey)
      )
        return false;

      if (target.filterRarity(states)) return false;
      if (target.filterElement(states)) return false;
      if (target.filterSpecies(states)) return false;
      if (item.filterPlacement(states)) return false;

      if (!states.query) {
        return true;
      } else {
        const sb =
          parent === undefined
            ? [item.rarity]
            : [
                parent.unitName,
                parent.unitShortName,
                parent.rarity,
                parent.element,
                parent.className,
              ];

        const s = [
          ...sb,
          item.unitName,
          item.unitShortName,
          item.element,
          item.damageType,
          item.className,
          item.exSkill1,
          item.exSkill2,
        ].map((v) => v.getText(states.setting)?.toString());
        try {
          return s.some((str) => str?.match(states.query));
        } catch {
          return false;
        }
      }
    });
  }

  private filterItem<T extends FilterKeys>(
    states: States,
    list: readonly T[],
    value: T | undefined | null
  ): boolean {
    const filters = list.filter((v) => states.filter.get(v));
    if (filters.length > 0) {
      if (value === null || (value !== undefined && !filters.includes(value)))
        return true;
    }
    return false;
  }

  filterRarity(states: States): boolean {
    return this.filterItem(
      states,
      Data.Rarity.list,
      this.rarity.getValue(states.setting)
    );
  }

  filterElement(states: States): boolean {
    const element = this.element.getValue(states.setting);
    const value =
      element === undefined ? undefined : Data.Element.keyOf(element);
    return this.filterItem(states, Data.Element.list, value);
  }

  filterSpecies(states: States): boolean {
    const species = this.species.getValue(states.setting);
    const value = Data.Species.keyOf(species) ?? null;
    return this.filterItem(states, Data.Species.list, value);
  }

  filterPlacement(states: States): boolean {
    return this.filterItem(
      states,
      Data.Placement.list,
      this.placement.getValue(states.setting)
    );
  }

  static get list(): readonly Unit[] {
    return units;
  }

  static get keys(): readonly Keys[] {
    return keys;
  }
}

const units = (() => {
  const ret: Unit[] = [];
  jsonUnits.forEach((item: JsonUnit) => {
    if (!item.DISABLED) ret.push(new Unit(item));
  });

  if (process.env.NODE_ENV !== "production") {
    const ids = new Set<number>();
    let lastId = -1;
    ret.forEach((unit) => {
      const id = unit.src.parentId ?? unit.src.id;
      ids.add(id);
      if (lastId < id) lastId = id;
    });
    console.log(
      "必要実装数:" +
        (lastId - ids.size) +
        "　実装済み:" +
        ids.size +
        "　最新ユニットID:" +
        lastId
    );
  }

  return ret;
})();
