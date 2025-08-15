import jsonUnits from "@/assets/unit.json";
import * as Data from "./Data";
import * as Stat from "./Stat";
import {
  FilterUnitClass,
  Setting,
  type FilterKeys,
  type States,
} from "./States";
import Class from "./Class";
import Subskill, { type SubskillFactorKey } from "./Subskill";
import Beast, { type BeastFactorKeys } from "./Beast";
import { Feature, type FeatureOutput, type JsonFeature } from "./Feature";
import {
  type TableSource,
  type TableRow,
  TableSourceUtil,
} from "./UI/StatTableUtil";

export interface JsonUnit {
  DISABLED?: boolean;
  id: number;
  parentId?: number;
  unitName: string;
  unitShortName: string;
  rarity: string;
  class?: string;
  element?: string;
  species?: string | readonly string[];
  cost?: number;
  hp: number;
  attack: number;
  defense: number;
  resist: number;
  attackSpeed?: number;
  delay?: number;
  block?: number | null;
  target?: Data.JsonTarget;
  rounds?: Data.JsonRound;
  splash?: boolean;
  range?: number;
  moveSpeed?: number;
  moveType?: string | null;
  moveCostAdd?: number;
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
  isNotToken?: boolean;
  costAdd?: number;
  hpMul?: number;
  attackMul?: number;
  defenseMul?: number;
  resistMul?: number;
  envHpMul?: number;
  envAttackMul?: number;
  envDefenseMul?: number;
  envResistMul?: number;
  criChanceAdd?: number;
  criDamageAdd?: number;
  penetrationAdd?: number;
  attackSpeedAdd?: number;
  delayMul?: number;
  fixedDelay?: number;
  blockAdd?: number;
  targetAdd?: number;
  rangeAdd?: number;
  physicalEvasion?: number;
  magicalEvasion?: number;
  moveSpeedAdd?: number;
  moveSpeedMul?: number;
  deployCount?: number;
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
    envHpMul: number;
    envAttackMul: number;
    envDefenseMul: number;
    envResistMul: number;
    criDamageAdd: number;
    attackSpeedAdd: number;
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
  isGeneralDefinite: boolean;
  isGeneralAction: boolean;
  isGeneralDefiniteAction: boolean;
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

export interface JsonBuffValue {
  readonly status?: boolean;
  readonly value?: number;
  readonly element?: string;
  readonly weather?: string;
}

interface JsonBuffBase extends JsonBuffValue {
  readonly require?: readonly string[];
  readonly skill?: number;
  readonly features?: readonly string[];
  readonly target?: string;
  readonly range?: number | null;
  readonly duration?: string | number;
  readonly supplements?: readonly string[];
}
interface JsonBuffSingle extends JsonBuffBase {
  readonly type: string;
  readonly potentialBonus?: Omit<
    JsonBuffSingle,
    "type" | "require" | "skill" | "potentialBonus"
  >;
}
interface JsonBuffMultiple extends JsonBuffBase {
  readonly potentialBonus?: Omit<
    JsonBuffMultiple,
    "require" | "skill" | "potentialBonus" | "effects"
  >;
  readonly effects: readonly JsonBuffEffect[];
}
interface JsonBuffEffect extends JsonBuffValue {
  readonly type: string;
  readonly potentialBonus?: Omit<JsonBuffEffect, "type" | "potentialBonus">;
}
export type JsonBuff = JsonBuffSingle | JsonBuffMultiple;
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
  "moveType",
  "moveSpeed",
  "moveCost",
  "placement",
  "exSkill1",
  "exSkill2",
] as const satisfies Data.StatType[];
type Keys = (typeof keys)[number];

const stat = Data.stat;
const ssKeys = Subskill.keys;
const Percent = Data.Percent;

export interface IGetText {
  readonly getText: (setting: Setting) => string | undefined;
}

export default class Unit implements TableRow<Keys> {
  readonly id: number;
  readonly src: Readonly<JsonUnit>;

  readonly unitId: Stat.Root;
  readonly parentId: number | undefined;
  readonly isToken: boolean;
  readonly unitName: Stat.Root<string>;
  readonly unitShortName: Stat.UnitName;
  readonly rarity: Stat.Root<Data.Rarity | undefined>;
  readonly className: Stat.Root<Data.UnitClassTag | undefined>;
  readonly equipmentName: IGetText;
  readonly cc4Name: IGetText;
  readonly baseClassName: IGetText;
  readonly element: Stat.Root<Data.Element | undefined>;
  readonly species: Stat.Root<readonly Data.Species[]>;
  readonly cost: Stat.Root;
  readonly hp: Stat.Base<number>;
  readonly attack: Stat.Base<number>;
  readonly defense: Stat.Base<number>;
  readonly resist: Stat.Base<number>;
  readonly criticalChance: Stat.Root;
  readonly criticalDamage: Stat.Root;
  readonly criticalChanceLimit: Stat.Root;
  readonly penetration: Stat.Root<number | undefined, Data.PenetrationFactors>;
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
  readonly moveCost: Stat.Root;
  readonly deployCount: Stat.Root;
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
  readonly envHpMul: number | undefined;
  readonly envAttackMul: number | undefined;
  readonly envDefenseMul: number | undefined;
  readonly envResistMul: number | undefined;
  readonly fixedDelay: number | undefined;
  readonly rangeAdd: number | undefined;
  readonly potentialBonus: JsonPotentialBonus | undefined;
  readonly situations: UnitSituations;
  readonly buffs: JsonBuffs | undefined;

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
    this.isToken = this.parentId !== undefined && !src.isNotToken;

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

    const className = Data.UnitClass.parse(src.class);
    {
      const comparer = Data.UnitClass.indexOf(className);
      this.className = new Stat.Root({
        statType: stat.className,
        calculater: () => className,
        comparer: () => comparer,
        item: (s) => {
          const value = this.className.getValue(s);
          switch (s.classNameType) {
            case Setting.TYPE_CC1:
              return value;
            case Setting.TYPE_CC4:
              return Data.UnitClass.cc4NameOf(value);
            case Setting.TYPE_EQUIPMENT:
              return Data.UnitClass.equipmentNameOf(value);
          }
        },
      });
    }
    const classData =
      className === undefined ? undefined : Class.getItem(className);

    {
      const getText = (s: Setting) => {
        const value = this.className.getValue(s);
        return Data.UnitClass.equipmentNameOf(value);
      };
      this.equipmentName = { getText };
    }

    {
      const getText = (s: Setting) => {
        const value = this.className.getValue(s);
        return Data.UnitClass.cc4NameOf(value);
      };
      this.cc4Name = { getText };
    }

    {
      const getText = (s: Setting) => {
        const value = this.className.getValue(s);
        return Data.UnitClass.baseTagOf(value);
      };
      this.baseClassName = { getText };
    }

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

    {
      const species = Data.Species.parse(src.species);
      const comparer = Data.Species.indexOf(species);
      this.species = new Stat.Root({
        statType: stat.species,
        calculater: () => species,
        comparer: () => comparer,
      });
    }

    const getCost = (setting: Setting) => {
      const base = src.cost ?? classData?.cost;
      if (base === undefined) {
        return;
      }
      const pCostAdd = this.isPotentialApplied(setting)
        ? src.potentialBonus?.costAdd
        : undefined;
      const value = base + (pCostAdd ?? src.costAdd ?? 0);

      if (className === Data.UnitClass.tag.shaman || this.isToken) {
        return value;
      }
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
      calculater: (s) => {
        const formation = this.getFormationBuffFactor(s, stat.criticalChance);
        return criticalChance + formation;
      },
    });

    this.criticalDamage = new Stat.Root({
      statType: stat.criticalDamage,
      calculater: (s) => {
        let a;
        if (this.isPotentialApplied(s)) {
          a = this.potentialBonus?.criDamageAdd;
        }
        a ??= src.criDamageAdd ?? 0;
        return Data.defaultCriDamage + a;
      },
    });

    this.criticalChanceLimit = new Stat.Root({
      statType: stat.criticalChanceLimit,
      calculater: (s) => {
        const formation = this.getFormationBuffFactor(
          s,
          stat.criticalChanceLimit
        );
        return formation;
      },
    });

    this.penetration = new Stat.Root({
      statType: stat.penetration,
      calculater: (s) => {
        const factor = this.penetration.getFactors(s);
        return Data.Penetration.getValue(factor.base, factor.multiply);
      },
      factors: (s) => {
        const base = src.penetrationAdd ?? 0;
        const potential = this.getPotentialFactor(s, stat.penetration);
        return {
          base: base + potential,
          multiply: classData?.penetration ?? 0,
        };
      },
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
        if (attackSpeed === undefined) {
          return;
        }

        const ability =
          (this.isPotentialApplied(s)
            ? src.potentialBonus?.attackSpeedAdd
            : undefined) ??
          src.attackSpeedAdd ??
          0;

        return Data.getAttackSpeedFactors({
          base: attackSpeed,
          ability,
          weapon: this.getWeaponBaseFactor(s, stat.attackSpeed),
          potential: this.getPotentialFactor(s, stat.attackSpeed),
        });
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
        if (delay !== undefined) {
          delaySubtotal = Percent.multiply(
            delay,
            delayMul,
            subskillBuff,
            formationBuff,
            beastFormationBuff
          );
        }
        const result = fixedDelay ?? delaySubtotal;
        if (result === undefined) {
          return;
        }
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
        if (src.block === null) {
          return;
        }
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
        if (tbase === undefined) {
          return;
        }

        const p = this.getPotentialFactor(s, stat.target);
        const isBlock = tbase === Data.Target.block;
        const target = isBlock
          ? this.block.getValue(s)
          : Data.Target.sum(tbase, src.targetAdd ?? 0, p);
        if (target === undefined) {
          return;
        }

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
          if (this.isPotentialApplied(s)) {
            return potential ?? rounds;
          }
          return rounds;
        },
      });
    }

    const splash = src.splash ?? classData?.splash ?? false;
    this.splash = new Stat.Root({
      statType: stat.splash,
      calculater: () => splash,
    });

    const rangeBase = src.range ?? classData?.range;
    this.range = new Stat.Base({
      statType: stat.range,
      calculater: (s) => this.range.getFactors(s)?.deploymentResult,
      isReversed: true,
      factors: (s) => {
        if (rangeBase === undefined) {
          return;
        }
        return this.getDeploymentFactors(s, stat.range, rangeBase);
      },
    });

    const damageType =
      Data.JsonDamageType.parse(src.damageType) ?? classData?.damageType;
    {
      const color = Data.DamageType.colorOf(damageType);
      this.damageType = new Stat.Root({
        statType: stat.damageType,
        calculater: () => damageType,
        comparer: () => Data.DamageType.indexOf(damageType),
        color: () => color,
      });
    }

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
        if (src.moveType === null) {
          return;
        }
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

    this.moveCost = new Stat.Root({
      statType: stat.moveCost,
      calculater: (s) => {
        if (!this.moveType.getValue(s) || !this.moveSpeed.getValue(s)) {
          return;
        }
        const base = 3;
        const add = (classData?.moveCostAdd ?? 0) + (src.moveCostAdd ?? 0);
        const potential = this.getPotentialFactor(s, stat.moveCost);
        const subSkill = -this.getSubskillFactor(s, ssKeys.moveCostCut);
        return Math.max(base + add + potential + subSkill, 0);
      },
    });

    this.deployCount = new Stat.Root({
      statType: stat.deployCount,
      calculater: () => src.deployCount ?? classData?.deployCount,
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
        if (v === undefined) {
          return;
        }
        return Data.Placement.name[v];
      },
      comparer: (s) => {
        const v = this.placement.getValue(s);
        if (v === undefined) {
          return;
        }
        return Data.Placement.index[v];
      },
      color: (s) => {
        const v = this.placement.getValue(s);
        if (v === undefined) {
          return;
        }
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
    this.envHpMul = src.envHpMul;
    this.envAttackMul = src.envAttackMul;
    this.envDefenseMul = src.envDefenseMul;
    this.envResistMul = src.envResistMul;
    this.fixedDelay = src.fixedDelay;
    this.rangeAdd = src.rangeAdd;
    this.potentialBonus = src.potentialBonus;
    this.situations = this.getSituations(classData, src.situations);
    this.buffs = src.buffs;
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
        ) {
          return;
        }

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

    function checkGeneralFlag(obj: Readonly<Partial<JsonUnitSituation>>) {
      let ret = obj.isGeneral;
      if (
        !obj.isGeneralAction &&
        !obj.isGeneralDefinite &&
        !obj.isGeneralDefiniteAction
      ) {
        ret ??= true;
      } else {
        ret ??= false;
      }
      return ret;
    }

    src?.forEach((unitSituation) => {
      if (unitSituation.proper) {
        const isGeneral = checkGeneralFlag(unitSituation);
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
        const isGeneral = checkGeneralFlag(unitSituation);
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
    if (this.parentId === undefined) {
      return;
    }
    this.tokenParent ??= Unit.list.find((u) => u.id === this.parentId);
    return this.tokenParent;
  }

  private calculateStat<T extends number | undefined>(
    setting: Setting,
    statType: Data.MainStatType,
    value: T
  ): T {
    if (value === undefined) {
      return value;
    }
    return this.getDeploymentFactors(setting, statType, value)
      .deploymentResult as T;
  }

  private getBaseStat(data: Readonly<JsonUnit>, statType: Data.BaseStatType) {
    const ret: Stat.Base<number> = new Stat.Base({
      statType: statType,
      calculater: (s) => ret.getFactors(s)?.deploymentResult ?? 0,
      isReversed: true,
      styles: () => {
        if (this.isUnhealable && statType === stat.hp) {
          return Data.TableClass.unhealable;
        }
      },
      factors: (s) => this.getDeploymentFactors(s, statType, data[statType]),
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
      environmentBuff: this.getEnvironmentBuffFactor(setting, statType),
      beastFormationBuff: this.getBeastFormationBuffFactor(setting, statType),
      beastPossLevel: this.isToken
        ? 100
        : Data.Beast.getPossLevelFactor(setting, statType),
      beastPossAmount: this.isToken
        ? 0
        : Data.Beast.getPossAmountFactor(setting, statType),
      typeBonusBuff: this.getTypeBonusBuffFactor(setting, statType),
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
    if (this.isToken) {
      return res;
    }
    const formation =
      statType !== stat.cost
        ? Percent.multiply(res, factors.formationBuff)
        : res + factors.formationBuff;
    const envBuff = Percent.multiply(formation, factors.environmentBuff);
    let beastFormation;
    if (Data.Beast.isFormationFactorAdd(statType)) {
      beastFormation = Math.max(0, envBuff + factors.beastFormationBuff);
    } else {
      beastFormation = Percent.multiply(envBuff, factors.beastFormationBuff);
    }
    const possLevel = Percent.multiply(beastFormation, factors.beastPossLevel);
    const possAmount = possLevel + factors.beastPossAmount;
    return Percent.multiply(possAmount, factors.typeBonusBuff);
  }

  isPotentialApplied(setting: Setting): boolean {
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
    if (!this.isPotentialApplied(setting)) {
      return 0;
    }

    const cache = this.cachePotentialValues.get(statType);
    if (cache !== undefined) {
      return cache;
    } else {
      const ret = Data.Potential.getEffectValue(statType, this.potentials);
      this.cachePotentialValues.set(statType, ret);
      return ret;
    }
  }

  private getWeaponBaseFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    if (!Data.Weapon.isApplied(setting)) {
      return 0;
    }
    const w = this.weapon;
    if (w === undefined) {
      return 0;
    }
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
    if (setting.weapon !== Setting.ALL) {
      return 0;
    }
    let n = 0;
    let k;
    Data.baseStatList.forEach((v) => {
      if (this.weapon !== undefined && this.weapon[v] !== undefined) {
        n++;
        if (v === statType) {
          k = true;
        }
      }
    });
    if (n === 0 || !k) {
      return 0;
    }
    return (statType === stat.hp ? 2400 : 240) / n;
  }

  private getWeaponBaseBuff(
    setting: Setting,
    statType: Data.StatType
  ): number | undefined {
    if (!Data.Weapon.isApplied(setting)) {
      return;
    }
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
        if (m !== undefined) {
          return m;
        }
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

  calculateFormationBuff(
    setting: Setting,
    buff: Data.FormationBuff
  ): Data.FormationBuffValue {
    if (!this.isPotentialApplied(setting)) {
      return buff;
    }
    return { ...buff, ...buff.potentialBonus };
  }

  private getFormationBuffs(setting: Setting): Data.FormationBuffValue[] {
    return this.formationBuffs.map((buff) =>
      this.calculateFormationBuff(setting, buff)
    );
  }

  private getFormationBuffFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    let defaultValue;
    switch (statType) {
      case stat.cost:
      case stat.criticalChance:
      case stat.criticalChanceLimit:
      case stat.moveSpeed:
        defaultValue = 0;
        break;
      default:
        defaultValue = 100;
        break;
    }
    if (this.isToken) {
      return defaultValue;
    }

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
    const buffs = this.getFormationBuffs(setting);

    return [
      ...buffs.map((buff) => {
        const req = buff.require.every((r) => {
          switch (r) {
            case Data.FormationBuffRequire.weapon:
              return Data.Weapon.isApplied(setting);
            case Data.FormationBuffRequire.sameElement8:
              return setting.sameElement === 8;
          }
        });
        if (!req) {
          return defaultValue;
        }

        const isTarget = [
          Data.FormationBuff.all,
          this.element.getValue(setting),
          Data.UnitClass.baseTagOf(this.className.getValue(setting)),
          ...this.species.getValue(setting),
        ].some((s) => {
          if (s === undefined) {
            return false;
          }
          return buff.targets.has(s);
        });

        if (isTarget) {
          return Data.FormationBuff.valueOf(buff, statType) ?? defaultValue;
        }

        return defaultValue;
      }),
      subskill,
      panel,
    ].reduce((a, c) => a + c - defaultValue, defaultValue);
  }

  private getEnvironmentBuffFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    const isPotentialApplied = this.isPotentialApplied(setting);
    let ret;
    if (isPotentialApplied) {
      switch (statType) {
        case stat.hp:
          ret = this.potentialBonus?.envHpMul;
          break;
        case stat.attack:
          ret = this.potentialBonus?.envAttackMul;
          break;
        case stat.defense:
          ret = this.potentialBonus?.envDefenseMul;
          break;
        case stat.resist:
          ret = this.potentialBonus?.envResistMul;
          break;
      }
    }
    switch (statType) {
      case stat.hp:
        ret ??= this.envHpMul;
        break;
      case stat.attack:
        ret ??= this.envAttackMul;
        break;
      case stat.defense:
        ret ??= this.envDefenseMul;
        break;
      case stat.resist:
        ret ??= this.envResistMul;
        break;
    }
    return ret ?? 100;
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
      if (isAdd) {
        return 0;
      }
      return 100;
    }

    const mb = Beast.getItem(setting.mainBeast);
    const sb = Beast.getItem(setting.subBeast);
    const className = this.className.getValue(setting);
    const types = [
      Data.UnitClass.baseTagOf(className),
      this.element.getValue(setting),
      ...this.species.getValue(setting),
      setting.sameElement === 8 ? "同一属性8体" : undefined,
    ];
    const fn = (ss: Beast | undefined) => {
      if (ss === undefined) {
        return;
      }
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
          if (r1 < 0 && r2 < 0) {
            return Math.min(r1, r2);
          } else if (r1 > 0 && r2 > 0) {
            return Math.max(r1, r2);
          } else {
            return r1 + r2;
          }
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
    if (key === undefined) {
      return 100;
    }
    return this.getBeastFactor(setting, key);
  }

  private getTypeBonusBuffFactor(
    setting: Setting,
    statType: Data.StatType
  ): number {
    const isTypeEnabled = (): boolean => {
      const species = this.species.getValue(setting);
      return species.some((v) => {
        switch (v) {
          case Data.Species.name.dragon:
          case Data.Species.name.undead:
            return true;
        }
        return false;
      });
    };

    if (!this.isToken && isTypeEnabled()) {
      switch (setting.typeBonus) {
        case Setting.TYPE_ENABLED:
          switch (statType) {
            case stat.hp:
            case stat.attack:
            case stat.defense:
            case stat.resist:
              return 110;
            case stat.range:
              return 105;
          }
      }
    }
    return 100;
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
    if (this.isToken) {
      return isMul ? 100 : 0;
    }

    const [ss1, ss2] = this.getSubskills(setting);
    const className = this.className.getValue(setting);
    const types = [
      className,
      Data.UnitClass.baseTagOf(className),
      this.element.getValue(setting),
      ...this.species.getValue(setting),
    ];
    const fn = (ss: Subskill | undefined) => {
      if (ss === undefined) {
        return;
      }
      const ret = ss.getFactor(key, types);
      if (typeof ret === "boolean") {
        return ret ? 1 : 0;
      }
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
        if (isMul) {
          return (
            100 +
            (isStackable ? (v1 ?? 0) + (v2 ?? 0) : Math.max(v1 ?? 0, v2 ?? 0))
          );
        } else {
          return isStackable
            ? (v1 ?? 0) + (v2 ?? 0)
            : Math.max(v1 ?? 0, v2 ?? 0);
        }
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
    if (value === undefined) {
      return;
    }
    return Data.JsonSkill.parse(value);
  }

  static filter(states: States, list: readonly Unit[]): readonly Unit[] {
    return list.filter((item) => item.filterFn(states));
  }

  filterFn(states: States): boolean {
    const parent = this.getTokenParent();
    const target = parent !== undefined ? parent : this;
    const className = target.className.getValue(states.setting);
    const filterKeys = FilterUnitClass.getKeys(states.filter);
    const classNameKey = Data.UnitClass.keyOf(className);
    if (
      filterKeys.size > 0 &&
      classNameKey !== undefined &&
      !filterKeys.has(classNameKey)
    ) {
      return false;
    }

    if (
      target.filterRarity(states) ||
      target.filterElement(states) ||
      target.filterSpecies(states) ||
      this.filterDamageType(states) ||
      target.filterMoveType(states) ||
      this.filterPlacement(states) ||
      this.filterToken(states)
    ) {
      return false;
    }

    if (!states.query) {
      return true;
    } else {
      const sb =
        parent === undefined
          ? [
              this.unitId,
              this.rarity,
              this.className,
              this.equipmentName,
              this.cc4Name,
              this.baseClassName,
            ]
          : [
              parent.unitId,
              parent.unitName,
              parent.unitShortName,
              parent.rarity,
              parent.element,
              parent.className,
              parent.equipmentName,
              parent.cc4Name,
              parent.baseClassName,
            ];

      const s = [
        ...sb,
        this.unitName,
        this.unitShortName,
        this.element,
        this.damageType,
        this.exSkill1,
        this.exSkill2,
      ].map((v) => v.getText(states.setting)?.toString());
      try {
        return s.some((str) => str?.match(states.query));
      } catch {
        return false;
      }
    }
  }

  static filterItem<T extends FilterKeys>(
    states: States,
    list: readonly T[],
    value: T | readonly T[] | undefined | null
  ): boolean {
    const filters = list.filter((v) => states.filter.get(v));
    if (filters.length > 0) {
      if (value === null) {
        return true;
      }
      if (value !== undefined) {
        if (Array.isArray(value)) {
          if (value.every((v) => !filters.includes(v))) {
            return true;
          }
        } else {
          if (!filters.includes(value as T)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  filterRarity(states: States): boolean {
    return Unit.filterItem(
      states,
      Data.Rarity.list,
      this.rarity.getValue(states.setting)
    );
  }

  filterElement(states: States): boolean {
    const element = this.element.getValue(states.setting);
    const value =
      element === undefined ? undefined : Data.Element.keyOf(element);
    return Unit.filterItem(states, Data.Element.list, value);
  }

  filterSpecies(states: States): boolean {
    const speciesList = this.species.getValue(states.setting);
    const keys = Data.Species.getKeys(speciesList);
    return Unit.filterItem(states, Data.Species.list, keys);
  }

  filterDamageType(states: States): boolean {
    const value = this.damageType.getValue(states.setting);
    const key = Data.DamageType.keyOf(value);
    return Unit.filterItem(states, Data.DamageType.list, key);
  }

  filterMoveType(states: States): boolean {
    const value = this.moveType.getValue(states.setting);
    if (value === undefined) {
      return false;
    }
    const key = Data.MoveType.getFilterKey(Data.MoveType.keyOf(value));
    return Unit.filterItem(states, Data.MoveType.filterKeys, key);
  }

  filterPlacement(states: States): boolean {
    return Unit.filterItem(
      states,
      Data.Placement.list,
      this.placement.getValue(states.setting)
    );
  }

  filterToken(states: States): boolean {
    return Unit.filterItem(
      states,
      Data.TokenType.list,
      this.isToken ? Data.TokenType.key.isToken : Data.TokenType.key.isNotToken
    );
  }

  static get list(): readonly Unit[] {
    return units;
  }

  static get keys(): readonly Keys[] {
    return keys;
  }

  static get tableData(): TableSource<Keys> {
    return {
      headers: Data.StatType.getHeaders(keys),
      filter: (states) => Unit.filter(states, units),
      sort: TableSourceUtil.getSortFn(),
    };
  }
}

const units = (() => {
  const ret: Unit[] = [];
  jsonUnits.forEach((item: JsonUnit) => {
    if (!item.DISABLED) {
      ret.push(new Unit(item));
    }
  });

  if (process.env.NODE_ENV !== "production") {
    getUnitPendingLog(ret);
    getFatalLog();
  }

  return ret;
})();

function getUnitPendingLog(units: readonly Unit[]) {
  const ids = new Set<number>();
  let lastId = -1;
  units.forEach((unit) => {
    const id = unit.src.parentId ?? unit.src.id;
    ids.add(id);
    if (lastId < id) {
      lastId = id;
    }
  });
  console.log(
    "必要実装数:" +
      (lastId - ids.size) +
      "　実装済み:" +
      ids.size +
      "　最新ユニットID:" +
      lastId
  );

  const pendingIds = (() => {
    const ret = [];
    for (let id = 1; id <= lastId; id++) {
      if (!ids.has(id)) {
        ret.push(id);
      }
    }
    return ret;
  })();
  console.log("未実装ユニットID:[" + pendingIds.join(", ") + "]");
}

function getFatalLog() {
  const names: (string | undefined)[] = [];
  jsonUnits.forEach((unit) => {
    if (unit.TODO_FATAL) {
      names.push(unit.id + ":" + unit.unitShortName);
    }
  });

  console.log("要修正ユニット名:[" + names.join(", ") + "]");
}
