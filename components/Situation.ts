import jsonSituations from "@/assets/situation.json";
import * as Data from "./Data";
import * as Util from "./Util";
import * as Stat from "./Stat";
import {
  Filter,
  FilterCondition,
  FilterEquipment,
  Setting,
  type FilterConditionKey,
  type States,
} from "./States";
import Unit from "./Unit";
import Subskill, { type SubskillFactorKey } from "./Subskill";
import type { TableSource } from "./StatTable";
import {
  Accumulation,
  AdditionFactor,
  AttackDebuff,
  Debuff,
  Feature,
  type FeatureOutput,
  type FeatureOutputCore,
} from "./Feature";

const tableColor = Data.tableColorAlias;

interface JsonSituation {
  unitId: number;
  skill?: number;
  isGeneral?: boolean;
  isGeneralProper?: boolean;
  isGeneralAction?: boolean;
  isGeneralProperAction?: boolean;
  require?: readonly string[];
  hasPotentials?: Readonly<Data.JsonPotentials>;
  features?: readonly string[];
  conditions?: readonly string[];
}

interface FeatureOutputDetail extends Readonly<FeatureOutputCore> {
  cond?: FeatureOutputCore;
  skillCond?: FeatureOutputCore;
  skillBuffs?: FeatureOutputCore;
}

const keys = [
  "unitId",
  "unitShortName",
  "skillName",
  "conditions",
  "cost",
  "hp",
  "attack",
  "defense",
  "resist",
  "interval",
  "block",
  "target",
  "range",
  "physicalLimit",
  "magicalLimit",
  "supplements",
  "initialTime",
  "duration",
  "cooldown",
  "damageType",
  "dps0",
  "dps1",
  "dps2",
  "dps3",
  "dps4",
  "dps5",
] as const;
type Keys = (typeof keys)[number];
const stat = Data.stat;
const ssKeys = Subskill.keys;
const Percent = Data.Percent;

const require = {
  DISABLED: "disabled",
  WEAPON: "weapon",
  POTENTIAL: "potential",
  NO_PANEL_FIELD_ELEMENT: "no-panel-field-element",
} as const;
type Require = (typeof require)[keyof typeof require];
const Require = {
  values: Object.values(require),
  isKey(key: unknown): key is Require {
    return this.values.findIndex((v) => v === key) !== -1;
  },
} as const;

export default class Situation implements TableSource<Keys> {
  readonly id: number;
  readonly parentId: number | undefined;
  private readonly unit: Unit | undefined;
  private readonly skill: number | undefined;

  readonly unitId: Stat.Root;
  readonly situationId: Stat.Root;
  readonly unitShortName: Stat.Root<string | undefined>;
  readonly skillName: Stat.Root<string | undefined | null>;
  readonly conditions: Stat.Root<readonly Data.Condition[]>;
  readonly cost: Stat.Root;
  readonly hp: Stat.SituationBase;
  readonly attack: Stat.Attack;
  readonly defense: Stat.DefRes;
  readonly resist: Stat.DefRes;
  readonly interval: Stat.Interval;
  readonly block: Stat.Root<number | undefined, Data.BlockFactors | undefined>;
  readonly target: Stat.Target;
  readonly rounds: Stat.Root<Data.Rounds, Data.ColorFactor<Data.Rounds>>;
  readonly hits: Stat.Root<Data.Rounds>;
  readonly splash: Stat.Root<
    boolean | undefined,
    Data.ColorFactor<boolean | undefined>
  >;
  readonly range: Stat.Range;
  readonly criticalChance: Stat.Root<number, Data.CriticalFactors>;
  readonly criticalDamage: Stat.Root<number, Data.CriticalFactors>;
  readonly criticalChanceLimit: Stat.Root<number>;
  readonly criticalDamageLimit: Stat.Root<number>;
  readonly penetration: Stat.Root<number | undefined, Data.PenetrationFactors>;
  readonly physicalLimit: Stat.Limit;
  readonly magicalLimit: Stat.Limit;
  readonly physicalDamageCut: Stat.Root<number, Data.DamageCutFactors>;
  readonly magicalDamageCut: Stat.Root<number, Data.DamageCutFactors>;
  readonly physicalEvasion: Stat.Root<number, Data.EvasionFactors>;
  readonly magicalEvasion: Stat.Root<number, Data.EvasionFactors>;
  readonly supplements: Stat.Supplement;
  readonly initialTime: Stat.Root;
  readonly duration: Stat.Root;
  readonly cooldown: Stat.Root<number | undefined, Data.CooldownFactors>;
  readonly moveSpeed: Stat.Root<
    number | undefined,
    Data.MoveSpeedFactors | undefined
  >;
  readonly damageType: Stat.Root<Data.DamageType | undefined>;
  readonly dps0: Stat.Dps;
  readonly dps1: Stat.Dps;
  readonly dps2: Stat.Dps;
  readonly dps3: Stat.Dps;
  readonly dps4: Stat.Dps;
  readonly dps5: Stat.Dps;

  readonly isGeneral: boolean;
  readonly isGeneralProper: boolean;
  readonly isGeneralAction: boolean;
  readonly isGeneralProperAction: boolean;
  private readonly features: readonly string[];
  private cacheSkill = new Data.Cache<Data.SkillOutput | undefined>();
  private cacheFeature = new Data.Cache<Readonly<FeatureOutputCore>>();
  private cacheTokenParent = new Data.Cache<Situation | undefined>();
  readonly require: ReadonlySet<Require>;
  readonly hasPotentials: ReadonlySet<Data.Potential>;

  constructor(src: Readonly<JsonSituation>, index: number) {
    this.id = index;
    const unitId = src.unitId;
    this.unit = Unit.list.find((unit) => unit.id === unitId);
    this.skill = src.skill;
    this.parentId = this.unit?.getTokenParent()?.id;

    this.unitId = new Stat.Root({
      statType: stat.unitId,
      calculater: (s) => this.unit?.unitId.getValue(s),
    });

    this.situationId = new Stat.Root({
      statType: stat.situationId,
      calculater: () => index,
    });

    this.unitShortName = new Stat.UnitName({
      statType: stat.unitShortName,
      calculater: (s) => this.unit?.unitShortName.getValue(s) ?? "",
      unit: this.unit,
      situation: this,
    });

    this.skillName = new Stat.Root({
      statType: stat.skillName,
      calculater: (s) => {
        if (this.skill === -1) return null;
        return this.getSkill(s)?.skillName;
      },
      item: (s) => {
        const f = this.getFeature(s);
        const p = this.getTokenParent(s)?.skillName.getValue(s);
        const annotations = !p
          ? f.annotations
          : [`+${p}`].concat(f.annotations ?? []);
        return Util.getSkillItem({
          skillName: this.skillName.getValue(s),
          annotations,
          phase: f.phase,
          phaseName: f.phaseName,
          isOverCharge: this.getSkill(s)?.isOverCharge,
        });
      },
    });

    this.conditions = new Stat.Root({
      statType: stat.conditions,
      calculater: (s) => {
        const base = Data.JsonCondition.parse(src.conditions);
        const skill = this.getSkill(s)?.conditions;
        const heal =
          this.getFeature(s).healFlag &&
          this.damageType.getValue(s) === Data.DamageType.heal
            ? [Data.Condition.get(Data.Condition.heal)]
            : undefined;
        const ret = Data.Condition.of(
          base,
          skill,
          heal,
          this.getFeature(s).conditions
        );
        return Data.Condition.toSorted(ret);
      },
      text: (s) => Data.Condition.textOf(this.conditions.getValue(s)),
      color: (s) => {
        const c = Data.condition;
        const cond = this.conditions.getValue(s);
        if (
          cond.find((v) => {
            switch (v.key) {
              case c.proper:
              case c.enemy:
                return true;
              case c.hit:
                if ((v.value ?? 0) > 1) return true;
            }
          })
        )
          return tableColor.positive;

        const f = this.getFeature(s);
        const skillCond = f.skillCond?.conditions;
        if (skillCond !== undefined && skillCond.length > 0) {
          if (f.isConditionalSkillBuff) return tableColor.positive;
          if (f.isConditionalSkillDebuff) return tableColor.negative;
        }

        const condBuff = f.cond?.conditions;
        if (condBuff !== undefined && condBuff.length > 0) {
          if (f.isConditionalBuff) return tableColor.positiveWeak;
          if (f.isConditionalDebuff) return tableColor.negativeWeak;
        }
      },
    });

    this.cost = this.getStat(stat.cost, this.unit?.cost);
    this.hp = this.getStatHp();
    this.attack = this.getStatAttack();
    this.defense = this.getStatDefRes(stat.defense);
    this.resist = this.getStatDefRes(stat.resist);

    const getColor = (base: number, head: number): boolean | undefined => {
      if (base === head) {
        return;
      } else {
        return base > head;
      }
    };
    this.criticalChance = new Stat.Root({
      statType: stat.criticalChance,
      calculater: (s) => this.criticalChance.getFactors(s).result,
      factors: (s) => {
        const limit = (v: number) =>
          Math.max(0, Math.min(v, this.criticalChanceLimit.getValue(s)));
        const base = this.unit?.criticalChance.getValue(s) ?? 0;
        const skill = this.getSkill(s)?.criChanceAdd ?? 0;
        const fea = this.getFeature(s).criChanceAdd ?? 0;
        const potential = this.unit?.isPotentialApplied(s)
          ? this.unit?.getPotentialFactor(s, stat.criticalChance) ?? 0
          : 0;
        const subskill = this.getSubskillFactor(s, ssKeys.criChanceAdd);
        const result = limit(base + skill + fea + potential + subskill);

        const skillColor = getColor(limit(base + skill), limit(base));

        return {
          skillColor,
          result,
        };
      },
    });

    this.criticalDamage = new Stat.Root({
      statType: stat.criticalDamage,
      calculater: (s) => this.criticalDamage.getFactors(s).result,
      factors: (s) => {
        const limit = (v: number) =>
          Math.max(0, Math.min(v, this.criticalDamageLimit.getValue(s)));
        const base = this.unit?.criticalDamage.getValue(s) ?? 0;
        const skill = this.getSkill(s)?.criDamageAdd ?? 0;
        const fea = this.getFeature(s).criDamageAdd ?? 0;
        const potential = this.unit?.isPotentialApplied(s)
          ? this.unit?.getPotentialFactor(s, stat.criticalDamage) ?? 0
          : 0;
        const subskill = this.getSubskillFactor(s, ssKeys.criDamageAdd);
        const result = limit(base + skill + fea + potential + subskill);
        const skillColor = getColor(limit(base + skill), limit(base));

        return {
          skillColor,
          result,
        };
      },
    });

    this.criticalChanceLimit = new Stat.Root({
      statType: stat.criticalChanceLimit,
      calculater: (s) => {
        const a =
          (this.getSkill(s)?.criChanceLimitAdd ?? 0) +
          (this.getFeature(s).criChanceLimitAdd ?? 0);
        const p = this.unit?.isPotentialApplied(s)
          ? this.unit?.getPotentialFactor(s, stat.criticalChanceLimit) ?? 0
          : 0;
        return Math.min(100, Data.defaultCriChanceLimit + a + p);
      },
    });

    this.criticalDamageLimit = new Stat.Root({
      statType: stat.criticalDamageLimit,
      calculater: (s) => {
        const a =
          (this.getSkill(s)?.criDamageLimitAdd ?? 0) +
          (this.getFeature(s).criDamageLimitAdd ?? 0);
        return Data.defaultCriDamageLimit + a;
      },
    });

    this.penetration = new Stat.Root({
      statType: stat.penetration,
      calculater: (s) => {
        const factor = this.penetration.getFactors(s);
        return Data.Penetration.getValue(factor.base, factor.multiply);
      },
      factors: (s) => {
        const unitFactor = this.unit?.penetration.getFactors(s);
        const ss = this.getSubskillFactor(s, ssKeys.penetration) ?? 0;
        const fea = this.getFeature(s).penetrationAdd ?? 0;

        return {
          base: (unitFactor?.base ?? 0) + ss + fea,
          multiply: unitFactor?.multiply ?? 0,
        };
      },
    });

    this.interval = new Stat.Interval({
      statType: stat.interval,
      calculater: (s) => {
        const factor = this.interval.getFactors(s);
        const ret = factor?.actualResult;
        if (this.getSkill(s)?.duration === Data.Duration.single) {
          if (factor?.staticCooldown) {
            return factor.result;
          }
          const c = factor?.cooldown;
          if (ret === undefined || c === undefined) return;
          return factor?.result;
        }
        return ret;
      },
      item: (s) => Util.getInterval(this.interval.getValue(s)),
      color: (s) => {
        const f = this.interval.getFactors(s);
        if (f?.actualResult === undefined) return;

        if (f?.cooldown !== undefined || f?.staticValue)
          return tableColor.warning;

        const b = f?.base?.buffColor;
        if (b) return b;

        const sk = f?.base?.skillColor;
        if (sk) return sk;

        const c = f?.base?.conditionalColor;
        if (c) return c;
      },
      factors: (s) => this.getIntervalFactors(s),
    });

    this.block = new Stat.Root({
      statType: stat.block,
      calculater: (s) => this.block.getFactors(s)?.result,
      isReversed: true,
      color: (s) => {
        const f = this.block.getFactors(s);
        if (f === undefined) return;

        const skillColor = Util.getTableColor(f.skill, f.base);
        if (skillColor !== undefined) {
          return skillColor;
        }
        return Util.getTableColorWeak(f.condFeature, f.skill);
      },
      factors: (s) => {
        const sk = this.getSkill(s);

        const base = this.unit?.block.getValue(s);
        const skillbase = sk?.block ?? base;
        if (skillbase === undefined) return;

        const fea = this.getFeature(s);
        const skill = skillbase + (sk?.blockAdd ?? 0);
        const feature = skill + (fea.blockAdd ?? 0);
        const condFeature = skill + (fea.cond?.blockAdd ?? 0);
        const result = feature;

        return {
          base: base ?? 0,
          skill,
          feature,
          condFeature,
          result,
        };
      },
    });

    this.target = new Stat.Target({
      statType: stat.target,
      calculater: (s) => this.target.getFactors(s)?.target,
      color: (s) => this.target.getFactors(s)?.color,
      factors: (s) => {
        const u = this.unit?.target.getFactors(s);
        const fea = this.getFeature(s);
        const sk = this.getSkill(s);

        const isFixed = fea.fixedTarget !== undefined;
        const targetBase = isFixed
          ? fea.fixedTarget
          : fea.target ??
            sk?.target ??
            (u?.isBlock ? Data.Target.block : u?.target);
        if (targetBase === undefined) return;
        const isBlock = targetBase === Data.Target.block;

        const block = this.block.getValue(s);
        const target = isBlock
          ? block
          : isFixed
          ? targetBase
          : Data.Target.sum(targetBase, sk?.targetAdd ?? 0, fea.targetAdd ?? 0);
        if (target === undefined) return;

        const splash = this.splash.getValue(s) ?? false;
        const rounds = this.rounds.getValue(s);
        const lancerTarget = fea.wideTarget ?? u?.wideTarget ?? false;
        const laser = fea.laser ?? sk?.laser ?? false;

        const color: Data.TableColor | undefined = (() => {
          if (typeof target !== "number") return;
          if (isFixed) return tableColor.warning;

          const average = (arg: Data.Target) => {
            if (Array.isArray(arg)) {
              if (arg.length === 0) return 0;
              return arg.reduce((a, c) => a + c) / arg.length;
            }
            return arg;
          };
          const base = average(u?.target ?? 1);
          if (typeof base !== "number") return;

          const calcBlock = (arg: Data.TargetBase | undefined) =>
            arg === Data.Target.block ? block : arg;
          const sum = (
            target: Data.Target | undefined,
            ...values: number[]
          ) => {
            if (target === undefined) return;
            return Data.Target.sum(target, ...values);
          };
          const getPoint = (v: Data.Target | undefined) => {
            if (typeof v !== "number") return 0;
            if (v > base) return 1;
            if (v < base) return -1;
            return 0;
          };
          const calcPoints = (...values: number[]) => {
            if (values.some((v) => v > 0)) return 1;
            if (values.some((v) => v < 0)) return -1;
            return 0;
          };
          const splashFactor = this.splash.getFactors(s);
          const roundsFactor = this.rounds.getFactors(s);

          const skillNum = sum(
            calcBlock(sk?.target) ?? base,
            sk?.targetAdd ?? 0
          );
          const skillPointBase = getPoint(skillNum);
          const skillPoint = calcPoints(
            skillPointBase,
            splashFactor.skillPoint,
            roundsFactor.skillPoint,
            sk?.laser ? 1 : 0
          );
          if (skillPoint > 0) return tableColor.positive;
          if (skillPoint < 0) return tableColor.negative;

          const condNum = sum(
            calcBlock(fea.cond?.target) ?? base,
            fea.cond?.targetAdd ?? 0
          );
          const conditionPointBase = getPoint(condNum);
          const conditionPoint = calcPoints(
            conditionPointBase,
            splashFactor.conditionPoint,
            roundsFactor.conditionPoint,
            fea.cond?.laser ? 1 : 0
          );
          if (conditionPoint > 0) return tableColor.positiveWeak;
          if (conditionPoint < 0) return tableColor.negativeWeak;
        })();

        return {
          target,
          isBlock,
          splash,
          rounds,
          wideTarget: lancerTarget,
          laser,
          color,
        };
      },
    });

    this.rounds = new Stat.Root({
      statType: stat.round,
      calculater: (s) => this.rounds.getFactors(s).result,
      factors: (s) => {
        const fea = this.getFeature(s);
        const sk = this.getSkill(s);

        const base = this.unit?.rounds.getValue(s) ?? 1;
        const result = fea.rounds ?? sk?.rounds ?? base;

        const baseNum = Data.Round.average(base);
        const condNum = Data.Round.average(fea.cond?.rounds);
        const skillNum = Data.Round.average(sk?.rounds);
        // const buffNum = Data.Round.average(fea.skillBuffs?.rounds);

        const fn = (v: number | undefined) => {
          if (v === undefined) return 0;
          if (v > baseNum) return 1;
          if (v < baseNum) return -1;
          return 0;
        };
        const conditionPoint = fn(condNum);
        const skillPoint = fn(skillNum);
        // const buffPoint = fn(buffNum ?? 1);

        return {
          result,
          conditionPoint,
          skillPoint,
          // buffPoint,
        };
      },
    });

    this.hits = new Stat.Root({
      statType: stat.hits,
      calculater: (s) => this.getFeature(s).hits ?? Data.JsonRound.parse(1),
    });

    this.splash = new Stat.Root({
      statType: stat.splash,
      calculater: (s) => this.splash.getFactors(s).result,
      factors: (s) => {
        const fea = this.getFeature(s);
        const sk = this.getSkill(s);

        const base = this.unit?.splash.getValue(s);
        const result = fea.splash ?? sk?.splash ?? base;

        const fn = (arg: boolean | undefined) =>
          arg && !base ? 1 : arg === false && base ? -1 : 0;
        const conditionPoint = fn(fea.cond?.splash);
        const skillPoint = fn(sk?.splash);
        // const buffPoint = fn(fea.skillBuffs?.splash);

        return {
          result,
          conditionPoint,
          skillPoint,
          // buffPoint,
        };
      },
    });

    this.range = new Stat.Range({
      statType: stat.range,
      calculater: (s) => this.range.getFactors(s)?.result,
      isReversed: true,
      color: (s) => this.range.getFactors(s)?.color,
      factors: (s) => {
        const unitFactor = this.unit?.range.getFactors(s);
        const fea = this.getFeature(s);
        const sk = this.getSkill(s);
        const target = this.target.getValue(s);

        if (
          typeof target === "string" &&
          target !== Data.Target.hit &&
          !fea.flagRangeIsVisible
        )
          return;
        if (fea.range === null) return;

        const fixedRange = fea.range ?? sk?.range;
        if (fixedRange === undefined && unitFactor === undefined) return;

        const base = unitFactor?.deploymentResult ?? 0;
        const field = this.getFieldElementFactor(s, stat.range);
        const multiply = Percent.sum(sk?.rangeMul, fea.rangeMul) + field;
        const addition = fea.rangeAdd ?? 0;
        const calcSubtotal = (
          base: number,
          multiply: number | undefined,
          addition?: number | undefined
        ) => {
          const a =
            multiply !== undefined ? Math.round((base * multiply) / 100) : base;
          return a + (addition ?? 0);
        };
        const subtotal = calcSubtotal(base, multiply, addition);

        const result = fixedRange ?? subtotal;

        const color = (() => {
          if (fixedRange !== undefined) return tableColor.warning;

          const skillBuffRange =
            fea.skillBuffs?.range ??
            calcSubtotal(
              base,
              fea.skillBuffs?.rangeMul,
              fea.skillBuffs?.rangeAdd
            );
          if (skillBuffRange > base) return tableColor.positiveStrong;
          if (skillBuffRange < base) return tableColor.negativeStrong;

          const skillMul = Percent.multiply(
            sk?.rangeMul,
            fea.skillCond?.rangeMul
          );
          const skillRange =
            fea.skillCond?.range ??
            sk?.range ??
            calcSubtotal(base, skillMul, fea.skillCond?.rangeAdd);
          if (skillRange > base) return tableColor.positive;
          if (skillRange < base) return tableColor.negative;

          const condRange =
            fea.cond?.range ??
            calcSubtotal(base, fea.cond?.rangeMul, fea.cond?.rangeAdd);
          if (condRange > base) return tableColor.positiveWeak;
          if (condRange < base) return tableColor.negativeWeak;
        })();

        return {
          ...unitFactor,
          fixedRange,
          multiply,
          addition,
          subtotal,
          result,
          color,
        } as Required<Data.RangeFactor>;
      },
    });

    const getLimitItem = (
      arg: Stat.Limit,
      setting: Setting
    ): string | JSX.Element | undefined => {
      return Util.getLimitItem(arg.getValue(setting), this.unit?.isUnhealable);
    };

    this.physicalLimit = new Stat.Limit({
      statType: stat.physicalLimit,
      calculater: (s) => this.physicalLimit.getFactors(s)?.result,
      isReversed: true,
      text: (s) => Util.getLimitText(this.physicalLimit.getValue(s)),
      item: (s) => getLimitItem(this.physicalLimit, s),
      color: (s) => Util.getPhysicalLimitColor(this.physicalLimit.getValue(s)),
      factors: (s) => this.getStatLimitFactors(s, stat.physicalLimit),
    });

    this.magicalLimit = new Stat.Limit({
      statType: stat.magicalLimit,
      calculater: (s) => this.magicalLimit.getFactors(s)?.result,
      isReversed: true,
      text: (s) => Util.getLimitText(this.magicalLimit.getValue(s)),
      item: (s) => getLimitItem(this.magicalLimit, s),
      color: (s) => Util.getMagicalLimitColor(this.magicalLimit.getValue(s)),
      factors: (s) => this.getStatLimitFactors(s, stat.magicalLimit),
    });

    const getStatDamageCut = (isPhysical: boolean) => {
      const statType = isPhysical
        ? stat.physicalDamageCut
        : stat.magicalDamageCut;
      const ret = new Stat.Root<number, Data.DamageCutFactors>({
        statType,
        calculater: (s) => this[statType].getFactors(s).result,
        factors: (s) => {
          const fea = this.getFeature(s);
          const base = fea[statType];
          const potential = this.unit?.getPotentialFactor(s, statType);
          const subskill = this.getSubskillFactorFromStatType(s, statType);
          const panel = s[statType];
          const generalDamageCut = fea.damageCut;
          const result = Percent.multiply(
            ...[generalDamageCut, base, potential, subskill, panel].map(
              (v) => 100 - (v ?? 0)
            )
          );

          const supplement = Percent.accumulate(
            base,
            potential,
            subskill,
            panel
          );
          const generalSupplement = generalDamageCut ?? 0;

          const cond = Percent.accumulate(
            fea.cond?.[statType],
            fea.cond?.damageCut
          );
          const condColor =
            cond === undefined || cond === 0 ? undefined : cond > 0;

          const skillCond = Percent.accumulate(
            fea.skillCond?.[statType],
            fea.skillCond?.damageCut
          );
          const skillCondColor =
            skillCond === undefined || skillCond === 0
              ? undefined
              : skillCond > 0;

          return {
            supplement,
            generalSupplement,
            condColor,
            skillCondColor,
            result,
          };
        },
      });
      return ret;
    };
    this.physicalDamageCut = getStatDamageCut(true);
    this.magicalDamageCut = getStatDamageCut(false);

    const getStatEvasion = (isPhysical: boolean) => {
      const statType = isPhysical ? stat.physicalEvasion : stat.magicalEvasion;
      const ret = new Stat.Root<number, Data.EvasionFactors>({
        statType,
        calculater: (s) => this[statType].getFactors(s).result,
        factors: (s) => {
          const base = this.unit?.[statType].getValue(s);
          const skill = this.getSkill(s)?.[statType];
          const fea = this.getFeature(s)[statType];
          const subskill = this.getSubskillFactor(s, ssKeys[statType]);
          const potential = this.unit?.getPotentialFactor(s, ret.statType);

          const skillColor =
            (skill ?? 0) > 0 && Percent.sum(base, skill, fea) < 100;
          const result = Percent.accumulate(
            base,
            skill,
            fea,
            subskill,
            potential
          );
          return {
            skillColor,
            result,
          };
        },
      });
      return ret;
    };
    this.physicalEvasion = getStatEvasion(true);
    this.magicalEvasion = getStatEvasion(false);

    this.supplements = new Stat.Supplement({
      statType: stat.supplements,
      calculater: (s) => {
        const f = this.getFeature(s);
        const supplements = (() => {
          const base = this.unit?.supplements;
          const skill = this.getSkill(s)?.supplements;
          const feature = f.supplements;
          const potential = this.unit?.isPotentialApplied(s)
            ? Data.Potential.filter(stat.supplements, this.unit?.potentials)
            : undefined;
          const damageCut = this.getDamageCutSupplements(s);
          const evasion = this.getEvasionSupplements(s);
          const ret = this.mergeSupplements(
            damageCut,
            evasion,
            potential,
            feature,
            skill
          );

          if (f.isAbility) {
            return this.mergeSupplements(feature);
          } else if (f.noBaseSupplements) {
            return this.mergeSupplements(ret);
          } else {
            return this.mergeSupplements(ret, base);
          }
        })();
        const ret = this.filterSupplements(supplements, f.deleteSupplements);
        return this.parseSupplements(ret, s);
      },
      text: (s) => [...this.supplements.getValue(s)].join(" "),
      color: (s) => {
        const fea = this.getFeature(s);
        const skillBuff = fea.skillBuffs?.supplements;
        if (skillBuff !== undefined && skillBuff.size > 0)
          return tableColor.positiveStrong;
        if (this.getSkill(s)?.supplements && !this.getFeature(s).isAbility)
          return tableColor.positive;

        const skillCond = (fea.skillCond?.supplements?.size ?? 0) > 0;
        const phyDamageCut = this.physicalDamageCut.getFactors(s);
        const magDamageCut = this.magicalDamageCut.getFactors(s);
        const phySkillCond = phyDamageCut.skillCondColor;
        const magSkillCond = magDamageCut.skillCondColor;

        if (
          (skillCond && fea.isConditionalSkillBuff) ||
          phySkillCond ||
          magSkillCond ||
          this.physicalEvasion.getFactors(s).skillColor ||
          this.magicalEvasion.getFactors(s).skillColor
        )
          return tableColor.positive;

        if (
          (skillCond && fea.isConditionalSkillDebuff) ||
          phySkillCond === false ||
          magSkillCond === false
        ) {
          return tableColor.negative;
        }

        const cond = fea.cond?.supplements;
        if (cond !== undefined && cond.size > 0) {
          if (fea.isConditionalDebuff) return tableColor.negativeWeak;
          if (fea.isConditionalBuff) return tableColor.positiveWeak;
        }

        const phyCond = phyDamageCut.condColor;
        const magCond = magDamageCut.condColor;
        if (phyCond || magCond) return tableColor.positiveWeak;

        if (phyCond === false || magCond === false)
          return tableColor.negativeWeak;
      },
    });

    this.initialTime = new Stat.Root({
      statType: stat.initialTime,
      calculater: (s) => this.getInitialTime(s),
      text: (s) => {
        const ret = this.initialTime.getValue(s);
        if (ret === undefined)
          return this.getTokenParent(s)?.initialTime.getText(s);
        return ret?.toFixed(1);
      },
      color: (s) => {
        const f = this.getFeature(s);
        if (f.isExtraDamage) return tableColor.warning;
        if (this.initialTime.getValue(s) === undefined)
          return this.getTokenParent(s)?.initialTime.getColor(s);
        if (this.getSkill(s)?.isOverCharge) return tableColor.negative;
        const c = f.initialTimeCut ?? 0;
        const p = this.unit?.getPotentialFactor(s, stat.initialTime) ?? 0;
        const cp = c - p;
        if (cp > 0) return tableColor.positiveWeak;
        if (cp < 0) return tableColor.negativeWeak;
        if (f.cooldownReductions !== undefined) return tableColor.positiveWeak;
      },
    });

    this.duration = new Stat.Root({
      statType: stat.duration,
      calculater: (s) => {
        const f = this.getFeature(s).duration;
        if (f === null) return;
        if (f === Data.Duration.always) return Infinity;
        const sk = this.getSkill(s)?.duration;
        if (sk === Data.Duration.single)
          return (this.interval.getFactors(s)?.base?.result ?? 0) / Data.fps;
        if (sk === undefined) return;
        return sk;
      },
      isReversed: true,
      text: (s) => {
        const f = this.getFeature(s);
        if (f.duration === Data.Duration.always) return Data.Duration.always;
        let d;
        if (f.isExtraDamage) d = f.duration;
        else d = this.duration.getValue(s) ?? f.duration;
        if (d === undefined || d === null)
          return this.getTokenParent(s)?.duration.getText(s);
        return Data.Duration.textOf(d);
      },
      color: (s) => {
        const f = this.getFeature(s);
        const d = this.duration.getValue(s);
        if (
          (f.isAction && d === undefined) ||
          f.duration === Data.Duration.always ||
          f.isExtraDamage
        )
          return tableColor.warning;
      },
    });

    this.cooldown = new Stat.Root({
      statType: stat.cooldown,
      calculater: (s) => this.cooldown.getFactors(s).result,
      text: (s) => this.cooldown.getValue(s)?.toFixed(1),
      color: (s) => {
        const f = this.cooldown.getFactors(s);
        if (f.isExtraDamage) return tableColor.warning;
        if (f.base === undefined)
          return this.getTokenParent(s)?.cooldown.getColor(s);
        if (f.isOverCharge) return tableColor.negative;

        const ctCut = f.feature + f.potential;

        if (ctCut < 0) return tableColor.positiveWeak;
        if (ctCut > 0) return tableColor.negativeWeak;

        if (this.getFeature(s).cooldownReductions !== undefined)
          return tableColor.positiveWeak;
      },
      factors: (s) => {
        const f = this.getFeature(s);
        const sk = this.getSkill(s);
        let base;
        if (
          f.duration !== null &&
          f.duration !== Data.Duration.always &&
          !f.isExtraDamage
        )
          base = sk?.cooldown;

        const feature = -(f.cooldownCut ?? 0);
        const potential = this.unit?.getPotentialFactor(s, stat.cooldown) ?? 0;
        const subskill = this.getSubskillFactor(s, ssKeys.cooldown);
        let baseResult, result;
        const isOverCharge = sk?.isOverCharge;
        if (base === undefined) {
          baseResult = this.getTokenParent(s)?.cooldown.getValue(s);
          result = baseResult;
        } else {
          baseResult = Math.max(0, base + feature + potential + subskill);
          const oc = isOverCharge ? baseResult / 2 : 0;
          result = baseResult + oc;
        }
        if (result !== undefined)
          result = this.getCooldownReductions(s, result);
        return {
          base,
          feature,
          potential,
          subskill,
          isOverCharge,
          isExtraDamage: f.isExtraDamage,
          baseResult,
          result,
        };
      },
    });

    this.moveSpeed = new Stat.Root({
      statType: stat.moveSpeed,
      calculater: (s) => this.moveSpeed.getFactors(s)?.result,
      isReversed: true,
      factors: (s) => {
        const factor = this.unit?.moveSpeed.getFactors(s);
        if (factor === undefined) return;

        const fea = this.getFeature(s);
        const add = fea.moveSpeedAdd ?? 0;
        const mul = fea.moveSpeedMul ?? 100;

        const { base, formation, beastFormation, subskillAdd } = factor;
        const multiply = Math.max(factor.multiply, mul);
        const addition = factor.addition + add;

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

    this.damageType = new Stat.Root({
      statType: stat.damageType,
      calculater: (s) => {
        const f = this.getFeature(s).damageType;
        const skill = this.getSkill(s)?.damageType;
        if (f === null || skill === null) return;
        return f ?? skill ?? this.unit?.damageType.getValue(s);
      },
      comparer: (s) => Data.DamageType.indexOf(this.damageType.getValue(s)),
      color: (s) => Data.DamageType.colorOf(this.damageType.getValue(s)),
    });

    const dps = (i: 0 | 1 | 2 | 3 | 4 | 5) => {
      const ret: Stat.Dps = new Stat.Dps({
        statType: `dps${i}`,
        calculater: (s) => ret.getFactors(s)?.result,
        isReversed: true,
        color: (s) =>
          Util.getDpsColor(ret.getValue(s), this.damageType.getValue(s)),
        factors: (s) => this.getDpsFactors(s, i),
      });
      return ret;
    };
    this.dps0 = dps(0);
    this.dps1 = dps(1);
    this.dps2 = dps(2);
    this.dps3 = dps(3);
    this.dps4 = dps(4);
    this.dps5 = dps(5);

    this.isGeneral = src.isGeneral ?? false;
    this.isGeneralProper = src.isGeneralProper ?? false;
    this.isGeneralAction = src.isGeneralAction ?? false;
    this.isGeneralProperAction = src.isGeneralProperAction ?? false;
    this.features = src.features ?? [];

    {
      const require = new Set<Require>();
      if (src.require !== undefined) {
        src.require.forEach((v) => {
          if (Require.isKey(v)) require.add(v);
        });
      }
      this.require = require;
    }
    this.hasPotentials = Data.JsonPotentials.toSet(src.hasPotentials);
  }

  private getTokenParent(setting: Setting): Situation | undefined {
    return this.cacheTokenParent.getCache(
      (s) => this._getTokenParent(s),
      setting
    );
  }

  private _getTokenParent(setting: Setting): Situation | undefined {
    const unitId = this.unit?.getTokenParent()?.id;
    if (unitId === undefined) return;
    const skill = this.getFeature(setting).parentSkill;

    const src: JsonSituation = {
      unitId,
      features: this.features,
    };
    if (skill !== undefined) src.skill = skill;

    return new Situation(src, -1);
  }

  private getSkill(setting: Setting): Data.SkillOutput | undefined {
    return this.cacheSkill.getCache((s) => this._getSkill(s), setting);
  }

  private _getSkill(setting: Setting): Data.SkillOutput | undefined {
    let skill;
    switch (this.skill) {
      case 1:
        skill = this.unit?.exSkill1;
        break;
      case 2:
        skill = this.unit?.exSkill2;
        break;
    }
    const v = skill?.getValue(setting);
    if (v === undefined) return;
    const fs = v.skillFeatures?.filter((f) => {
      return (
        f.featureName === undefined || this.features.includes(f.featureName)
      );
    });
    if (fs === undefined) return v;

    let ret = { ...v };
    fs.forEach((f) => {
      ret = {
        ...ret,
        ...f,
      };
    });
    return ret;
  }

  private getFeature(setting: Setting): Readonly<FeatureOutputDetail> {
    return this.cacheFeature.getCache((s) => this._getFeature(s), setting);
  }

  private _getFeature(setting: Setting): Readonly<FeatureOutputDetail> {
    if (this.unit?.features === undefined) return {};

    const isPotentialApplied = this.unit.isPotentialApplied(setting);
    const fieldElements = this.getFieldElementSetting(setting);
    let isAbility: boolean;
    const tempFeatures = this.unit.features.filter((f) => {
      if (f.featureName !== undefined && !this.features.includes(f.featureName))
        return;
      if (
        f.skill !== undefined &&
        !(f.skill === 0 && this.skill === undefined) &&
        f.skill !== this.skill
      )
        return;

      const noWeapon = setting.weapon === Setting.NONE;
      const noSkill = this.getSkill(setting) === undefined;
      if (
        (f.require?.has(Feature.require.weapon) && noWeapon) ||
        (f.require?.has(Feature.require.skill) && noSkill) ||
        (f.exclude?.has(Feature.require.weapon) && !noWeapon) ||
        (f.exclude?.has(Feature.require.skill) && !noSkill)
      )
        return;

      if (f.hasPotentials !== undefined) {
        for (const p of f.hasPotentials) {
          if (!isPotentialApplied || !this.unit?.potentials.includes(p)) return;
        }
      }

      f.fieldElements?.forEach((v) => fieldElements.add(v));
      if (f.isAbility) isAbility = true;

      return true;
    });
    const filteredFeatures = tempFeatures.filter((f) => {
      return (
        Feature.require.isElementApplied(f.require, fieldElements) &&
        !Feature.require.isElementExcluded(f.exclude, fieldElements) &&
        !(isAbility && f.isNotAbility)
      );
    });

    const ret: FeatureOutputDetail = Feature.calculateList(
      filteredFeatures,
      isPotentialApplied
    );

    const condFeatures = filteredFeatures.filter((f) => {
      return (
        f.isAction ||
        f.phase !== undefined ||
        f.isConditionalBuff ||
        f.isConditionalDebuff
      );
    });
    ret.cond = Feature.calculateList(condFeatures, isPotentialApplied);

    const skillFeatures = filteredFeatures.filter(
      (f) => f.isConditionalSkillBuff || f.isConditionalSkillDebuff
    );
    ret.skillCond = Feature.calculateList(skillFeatures, isPotentialApplied);

    const buffSkillFeatures = filteredFeatures.filter((f) => f.isBuffSkill);
    ret.skillBuffs = Feature.calculateList(
      buffSkillFeatures,
      isPotentialApplied
    );

    return ret;
  }

  private mergeSupplements(
    ...values: (ReadonlySet<string> | undefined)[]
  ): ReadonlySet<string> {
    const ret = new Set<string>();
    for (const v of values) {
      if (v !== undefined) {
        for (const str of v) ret.add(str);
      }
    }
    return ret;
  }

  private filterSupplements(
    target: ReadonlySet<string>,
    filter: ReadonlySet<string> | undefined
  ): ReadonlySet<string> {
    if (filter === undefined) return target;

    const ret = new Set<string>();
    target.forEach((str) => {
      if (!filter.has(str)) ret.add(str);
    });
    return ret;
  }

  private parseSupplements(
    value: ReadonlySet<string>,
    setting: Setting
  ): ReadonlySet<string> {
    const ret = new Set<string>();
    for (const str of value) {
      ret.add(
        str.replaceAll(/\{([^\{\}])*\}/g, (match) => {
          match = match.slice(1, match.length - 1);
          const [key, value] = match.split("*");
          return (
            (() => {
              switch (key) {
                case "attack-base":
                  return Data.Percent.multiply(
                    this.attack.getFactors(setting)?.deploymentResult ?? 0,
                    value !== undefined ? Number.parseInt(value) : undefined
                  );
              }
            })()?.toString() ?? ""
          );
        })
      );
    }
    return ret;
  }

  private getDamageCutSupplements(
    setting: Setting
  ): ReadonlySet<string> | undefined {
    const phyFac = this.physicalDamageCut.getFactors(setting);
    const phy = phyFac.supplement;
    const mag = this.magicalDamageCut.getFactors(setting).supplement;
    const gen = phyFac.generalSupplement;
    if (phy === 0 && mag === 0 && gen === 0) return;

    const ret = new Set<string>();
    const fn = (type: string, damage: number) => {
      const sign = damage > 0 ? "-" : "+";
      ret.add(type + "被Dmg" + sign + Math.abs(damage) + "%");
    };

    if (gen !== 0) fn("", gen);

    if (gen < 100) {
      if (phy !== 0 && phy === mag) {
        fn("物理魔法", phy);
        return ret;
      }

      if (phy > 0) fn("物理", phy);
      if (mag > 0) fn("魔法", mag);
    }
    return ret;
  }

  private getEvasionSupplements(
    setting: Setting
  ): ReadonlySet<string> | undefined {
    const phy = this.physicalEvasion.getValue(setting);
    const mag = this.magicalEvasion.getValue(setting);
    if (phy <= 0 && mag <= 0) return;

    const ret = new Set<string>();
    if (phy === mag) {
      ret.add("物理魔法回避" + phy + "%");
      return ret;
    }

    if (phy > 0) ret.add("物理回避" + phy + "%");
    if (mag > 0) ret.add("魔法回避" + mag + "%");
    return ret;
  }

  private getStat<T>(
    statName: Data.StatType,
    stat: Stat.Root<T> | undefined
  ): Stat.Root<T | undefined> {
    if (stat === undefined)
      return new Stat.Root({
        statType: statName,
        calculater: () => undefined,
      });
    return stat;
  }

  private getStatHp(): Stat.Hp {
    const statType = stat.hp;
    const ret: Stat.Hp = new Stat.Hp({
      statType,
      calculater: (s) => ret.getFactors(s)?.actualResult,
      isReversed: true,
      color: (s) => this.getBaseStatColor(s, statType),
      factors: (s) => this.getActualHpFactors(s),
    });
    return ret;
  }

  private getStatAttack(): Stat.Attack {
    const ret: Stat.Attack = new Stat.Attack({
      statType: stat.attack,
      calculater: (s) => {
        const f = ret.getFactors(s);
        if ((f?.criticalChance ?? 0) >= 100) return f?.criticalAttack;
        return ret.getFactors(s)?.actualResult;
      },
      isReversed: true,
      color: (s) => {
        if (ret.getFactors(s)?.staticDamage !== undefined) {
          return tableColor.warning;
        }
        return this.getBaseStatColor(s, stat.attack);
      },
      factors: (s) => this.getActualAttackFactors(s),
    });
    return ret;
  }

  private getStatDefRes(statType: Data.BaseStatType): Stat.DefRes {
    const ret: Stat.DefRes = new Stat.DefRes({
      statType,
      calculater: (s) => ret.getFactors(s)?.inBattleResult,
      isReversed: true,
      color: (s) => {
        if (ret.getFactors(s)?.staticDamage !== undefined)
          return tableColor.warning;
        return this.getBaseStatColor(s, statType);
      },
      factors: (s) => this.getActualDefResFactors(s, statType),
    });
    return ret;
  }

  private getBaseStatColor(
    setting: Setting,
    statType: Data.BaseStatType
  ): Data.TableColor | undefined {
    const fea = this.getFeature(setting);
    let colorFlag: boolean | undefined;
    const setColorFlag = (newColorFlag: boolean) => {
      if (newColorFlag) {
        colorFlag = true;
      } else if (colorFlag === undefined) {
        colorFlag = false;
      }
    };
    const checkPercent = (value: number | undefined) => {
      if (value !== undefined && value !== 100) {
        if (value > 100) {
          setColorFlag(true);
        } else {
          setColorFlag(false);
        }
      }
    };
    const checkAdd = (value: number | undefined) => {
      if (value !== undefined && value !== 0) {
        if (value > 0) {
          setColorFlag(true);
        } else {
          setColorFlag(false);
        }
      }
    };
    const checkBoolean = (value: boolean | undefined) => {
      if (value !== undefined) {
        setColorFlag(value);
      }
    };
    const checkCond = (cond: FeatureOutputCore | undefined) => {
      switch (statType) {
        case stat.attack:
          checkPercent(cond?.damageFactor);
          checkAdd(cond?.criChanceAdd);
          checkAdd(cond?.criDamageAdd);
      }
      checkPercent(cond?.[Data.BaseStatType.mulKey[statType]]);
      checkAdd(this.calculateAddFactor(setting, statType, cond));
    };

    {
      switch (statType) {
        case stat.hp:
          checkPercent(fea.currentHp);
          break;
        case stat.attack:
          checkPercent(this.getBuffDamageFactor(setting));
          break;
      }
      checkPercent(this.getBuffMultiFactor(setting, statType));
      const skillBuffs = this.getFeature(setting).skillBuffs;
      checkAdd(this.calculateAddFactor(setting, statType, skillBuffs));

      if (colorFlag !== undefined) {
        if (colorFlag) {
          return tableColor.positiveStrong;
        } else {
          return tableColor.negativeStrong;
        }
      }
    }
    {
      const skill = this.getSkill(setting);
      switch (statType) {
        case stat.attack:
          checkPercent(skill?.damageFactor);
          checkBoolean(this.criticalChance.getFactors(setting).skillColor);
          checkBoolean(this.criticalDamage.getFactors(setting).skillColor);
      }
      checkPercent(this.getSkillMultiFactor(setting, statType));
      checkCond(fea.skillCond);

      if (colorFlag !== undefined) {
        if (colorFlag) {
          return tableColor.positive;
        } else {
          return tableColor.negative;
        }
      }
    }
    {
      checkCond(fea.cond);

      if (colorFlag !== undefined) {
        if (colorFlag) {
          return tableColor.positiveWeak;
        } else {
          return tableColor.negativeWeak;
        }
      }
    }
  }

  private getInBattleFactors(
    setting: Setting,
    statType: Data.BaseStatType
  ): Data.InBattleFactors | undefined {
    const f = this.unit?.[statType].getFactors(setting);
    if (f === undefined) return;
    let lifeBlock;
    if (
      statType === stat.hp &&
      this.getSubskillFactor(setting, ssKeys.isLifeBlock)
    ) {
      const b = this.block.getValue(setting) ?? 0;
      lifeBlock = 100 + 8 * b;
    }
    const ret: Data.InBattleFactorsBase = {
      ...f,
      multiFactor: Percent.sum(
        this.getSkillMultiFactor(setting, statType),
        lifeBlock,
        this.getFeatureMultiFactor(setting, statType),
        this.getFieldElementFactor(setting, statType) + 100,
        this.getSubskillFactorFromStatType(setting, statType) + 100,
        this.getPanelMulFactor(setting, statType)
      ),
      additionFactor:
        this.getFeatureAddFactor(setting, statType) +
        this.getPanelAddFactor(setting, statType),
    };
    const { isMaxDamage, isMinDamage, inBattleResult } =
      this.calculateInBattleResult(ret);
    return {
      ...ret,
      isMaxDamage,
      isMinDamage,
      inBattleResult,
    };
  }

  private calculateInBattleResult(factors: Data.InBattleFactorsBase) {
    const a = Percent.multiply(factors.deploymentResult, factors.multiFactor);
    const b = a + factors.additionFactor;
    const max = factors.deploymentResult * 10;
    const min = Math.trunc(factors.deploymentResult / 2);
    const isMaxDamage = b >= max && b !== 0;
    const isMinDamage = b <= min && b !== 0;
    return {
      isMaxDamage,
      isMinDamage,
      inBattleResult: isMaxDamage ? max : isMinDamage ? min : b,
    };
  }

  private getActualHpFactors(
    setting: Setting
  ): Data.ActualHpFactors | undefined {
    const base = this.getInBattleFactors(setting, stat.hp);
    if (base === undefined) return;

    const isUnhealable = this.unit?.isUnhealable ?? false;
    const currentFactor = this.getFeature(setting).currentHp ?? 100;

    return {
      ...base,
      isUnhealable,
      currentFactor,
      actualResult: Percent.multiply(base.inBattleResult, currentFactor),
    };
  }

  private getActualAttackFactors(
    setting: Setting
  ): Data.ActualAttackFactors | undefined {
    const f = this.getInBattleFactors(setting, stat.attack);
    if (f === undefined) return;
    const ret: Data.ActualAttackFactorsBase = {
      ...f,
      damageFactor: this.getDamageFactor(setting),
      criticalChance: this.criticalChance.getValue(setting),
      criticalDamage: this.criticalDamage.getValue(setting),
      staticDamage: this.getStaticDamage(setting, stat.attack, f),
      isSupport: this.getFeature(setting).isSupport ?? false,
    };
    return this.calculateActualAttackResult(ret);
  }

  private calculateActualAttackResult(
    factors: Data.ActualAttackFactorsBase
  ): Data.ActualAttackFactors {
    const fn = (attack: number) => {
      if (factors.staticDamage !== undefined)
        return factors.staticDamage.result;
      else return Percent.multiply(attack, factors.damageFactor);
    };
    return {
      ...factors,
      actualResult: fn(factors.inBattleResult),
      criticalAttack: fn(
        Percent.multiply(factors.inBattleResult, factors.criticalDamage)
      ),
    };
  }

  private getActualDefResFactors(
    setting: Setting,
    statType: Data.BaseStatType
  ): Data.ActualDefResFactors | undefined {
    const f = this.getInBattleFactors(setting, statType);
    if (f === undefined) return;
    const staticDamage = this.getStaticDamage(setting, statType, f);
    return {
      ...f,
      staticDamage,
      actualResult: staticDamage?.result ?? f.inBattleResult,
    };
  }

  private getSkillMultiFactor(
    setting: Setting,
    statType: Data.BaseStatType
  ): number | undefined {
    const v = this.getSkill(setting);
    if (v === undefined) return;
    return v[Data.BaseStatType.mulKey[statType]];
  }

  private getBuffMultiFactor(
    setting: Setting,
    statType: Data.BaseStatType
  ): number | undefined {
    const f = this.getFeature(setting).skillBuffs;
    if (f === undefined) return;
    return f[Data.BaseStatType.mulKey[statType]];
  }

  private getBuffDamageFactor(setting: Setting): number | undefined {
    const skillBuffs = this.getFeature(setting).skillBuffs;
    if (skillBuffs === undefined) return;
    return skillBuffs.damageFactor;
  }

  private getFeatureMultiFactor(
    setting: Setting,
    statType: Data.BaseStatType
  ): number | undefined {
    return this.getFeature(setting)[Data.BaseStatType.mulKey[statType]];
  }

  private calculateAddFactor(
    setting: Setting,
    statType: Data.BaseStatType,
    feature: Readonly<FeatureOutput> | undefined
  ): number {
    if (feature === undefined) return 0;
    const factors = Feature.getAdditionFactors(feature, statType);
    if (factors === undefined) return 0;
    return factors
      .map((f) => {
        switch (f.key) {
          case undefined:
            return f.value;
          case stat.hp:
            return Percent.multiply(
              this.unit?.[f.key].getValue(setting),
              f.value
            );
          case stat.attack:
          case stat.defense:
          case stat.resist:
            return Percent.multiply(
              this[f.key].getFactors(setting)?.inBattleResult,
              f.value
            );
          case AdditionFactor.MOVE_SPEED:
            return Percent.multiply(
              this.moveSpeed.getFactors(setting)?.result,
              f.value
            );
          case AdditionFactor.CURRENT_HP:
            return Percent.multiply(
              this.hp.getFactors(setting)?.inBattleResult,
              f.value
            );
          case AdditionFactor.ACCUMULATION: {
            return (
              f.value *
              Accumulation.calculate(this.getAccumulationProps(setting, f.time))
            );
          }
        }
      })
      .reduce((a, c) => a + c, 0);
  }

  private getFeatureAddFactor(
    setting: Setting,
    statType: Data.BaseStatType
  ): number {
    return this.calculateAddFactor(setting, statType, this.getFeature(setting));
  }

  private getPanelMulFactor(
    setting: Setting,
    statType: Data.BaseStatType
  ): number {
    return 100 + setting[Data.BaseStatType.mulKey[statType]];
  }

  private getPanelAddFactor(
    setting: Setting,
    statType: Data.BaseStatType
  ): number {
    return setting[Data.BaseStatType.addKey[statType]];
  }

  private getDamageFactor(setting: Setting): number {
    const a = this.getSkill(setting)?.damageFactor;
    const b = this.getFeature(setting).damageFactor;
    const ss = this.getSubskillFactor(setting, ssKeys.damageFactor);
    const limitBreak =
      this.getSubskillFactor(setting, ssKeys.isLimitBreak) && this.skill
        ? 130
        : 100;
    const panel = 100 + setting.damageFactor;
    return Percent.multiply(a, b, ss, limitBreak, panel);
  }

  private getStaticDamage(
    setting: Setting,
    statType: Data.BaseStatType,
    inBattleFactors: Data.InBattleFactors
  ): Data.StaticDamageFactor | undefined {
    const f = this.getFeature(setting);
    let obj;
    switch (statType) {
      case stat.attack:
        obj = f.staticDamage;
        break;
      case stat.defense:
        obj = f.staticDefense;
        break;
      case stat.resist:
        obj = f.staticResist;
        break;
    }
    if (obj === undefined) return;

    switch (obj.key) {
      case Data.StaticDamage.STATIC:
        return {
          key: obj.key,
          value: 0,
          reference: obj.value,
          result: obj.value,
        };
      case Data.StaticDamage.TIME: {
        const reference = Accumulation.calculate(
          this.getAccumulationProps(setting, obj.time)
        );
        return {
          key: obj.key,
          value: obj.value,
          reference,
          result: obj.value * reference,
        };
      }
    }

    const reference = (() => {
      const unit = this.unit;
      const unitFactor = unit?.[statType].getFactors;
      if (unit === undefined || unitFactor === undefined) return;
      if (Data.BaseStatType.isKey(obj.key)) {
        if (obj.key === statType) return inBattleFactors.inBattleResult;
        return this[obj.key].getValue(setting);
      }

      const k = Data.StaticDamage.baseStatTypeOf(obj.key);
      if (k) return unit[k].getValue(setting);
    })();
    if (reference === undefined) return;
    const result = Percent.multiply(reference, obj.value);

    return {
      key: obj.key,
      value: obj.value,
      reference,
      result,
    };
  }

  private getAccumulationProps(setting: Setting, time: number) {
    const interval = this.interval.getFactors(setting);
    return {
      attackSpeed: interval?.base?.attackSpeedResult,
      interval: interval?.base?.result ?? NaN,
      time,
    };
  }

  private getIntervalFactors(
    setting: Setting
  ): Data.IntervalFactors | undefined {
    const ret = this.getActualIntervalFactors(setting);
    if (ret.actualResult === undefined) return { ...ret };

    if (this.getSkill(setting)?.duration === Data.Duration.single) {
      const cooldown = this.cooldown.getValue(setting);
      if (cooldown === undefined) return;

      const cooldownFrame = Math.max(1, cooldown * Data.fps);
      const minInterval = this.getFeature(setting).minInterval;
      let staticCooldown = false;
      let result = ret.actualResult + cooldownFrame;
      if (minInterval !== undefined) {
        staticCooldown = minInterval > result;
        result = Math.max(minInterval, result);
      }

      return {
        ...ret,
        cooldown,
        cooldownFrame,
        staticCooldown,
        minInterval,
        result,
      };
    }

    return {
      ...ret,
      result: ret.actualResult,
    };
  }

  private getActualIntervalFactors(
    setting: Setting
  ): Data.ActualIntervalFactors {
    const f = this.getFeature(setting);
    const base = this.getIntervalBaseFactors(setting);
    const fi = f.interval;
    if (fi === null) {
      return {
        base,
        actualResult: undefined,
      };
    }
    if (fi !== undefined) {
      return {
        staticValue: fi,
        base,
        actualResult: fi,
      };
    }

    return {
      base,
      actualResult: base?.result,
    };
  }

  private getIntervalBaseFactors(
    setting: Setting
  ): Data.IntervalBaseFactors | undefined {
    const f = this.getFeature(setting);

    const getAtkSpdResult = (motionSpeed: number, speedBuff: number) =>
      Math.round((motionSpeed * 100) / speedBuff);
    const sk = this.getSkill(setting);
    const attackSpeed = this.unit?.attackSpeed.getValue(setting);
    if (attackSpeed === undefined) return;
    const asf = this.unit?.attackSpeed.getFactors(setting);
    const attackMotionMul = f.attackMotionMul ?? sk?.attackMotionMul;
    const attackMotionSpeed = Percent.multiply(attackSpeed, attackMotionMul);
    const attackSpeedBuffPos = Percent.max(
      sk?.attackSpeedBuff,
      f.attackSpeedBuff,
      this.getSubskillFactor(setting, ssKeys.attackSpeedBuff),
      100 + setting.attackSpeedBuff
    );
    const attackSpeedBuffNeg = Math.min(
      // TODO 攻撃速度低下の仕様を調査する
      ...[
        sk?.attackSpeedBuff,
        f.attackSpeedBuff,
        this.getSubskillFactor(setting, ssKeys.attackSpeedBuff),
        100 + setting.attackSpeedBuff,
      ].map((v) => v ?? 100)
    );
    const attackSpeedBuff = Percent.sum(attackSpeedBuffPos, attackSpeedBuffNeg);
    const attackSpeedResult = getAtkSpdResult(
      attackMotionSpeed,
      attackSpeedBuff
    );

    const df = this.unit?.delay.getFactors(setting);
    const delay = df?.delay;
    const fixedDelay = f.fixedDelay ?? sk?.fixedDelay ?? df?.fixedDelay;
    if (delay === undefined && fixedDelay === undefined) return;
    const settingDelayMul = 100 - setting.delayCut;
    const delayMul = Percent.multiply(
      df?.delayMul,
      sk?.delayMul,
      f.delayMul,
      settingDelayMul
    );
    const subskillBuff = this.getSubskillFactor(setting, ssKeys.delayMul);
    const formationBuff = df?.formationBuff;
    const beastFormationBuff = df?.beastFormationBuff;
    const delaySubtotal = Percent.multiply(
      delay,
      delayMul,
      subskillBuff,
      formationBuff,
      beastFormationBuff
    );
    const delayResult = fixedDelay ?? delaySubtotal;

    const baseAtkSpdResult = attackSpeed;
    const skMotionSpeed = Percent.multiply(attackSpeed, sk?.attackMotionMul);
    const skAtkSpdResult = getAtkSpdResult(
      skMotionSpeed,
      sk?.attackSpeedBuff ?? 100
    );
    const buffMotionMul = f.skillBuffs?.attackMotionMul ?? sk?.attackMotionMul;
    const buffMotionSpeed = Percent.multiply(attackSpeed, buffMotionMul);
    const buffAtkSpdBuff = Percent.multiply(
      sk?.attackSpeedBuff,
      f.skillBuffs?.attackSpeedBuff
    );
    const buffAtkSpdResult = getAtkSpdResult(buffMotionSpeed, buffAtkSpdBuff);
    const condMotionSpeed = Percent.multiply(
      attackSpeed,
      f.cond?.attackMotionMul
    );
    const condAtkSpdResult = getAtkSpdResult(
      condMotionSpeed,
      f.cond?.attackSpeedBuff ?? 100
    );

    const baseDelayResult =
      df?.fixedDelay ?? Percent.multiply(delay, df?.delayMul);
    const skDelayMul = Percent.multiply(df?.delayMul, sk?.delayMul);
    const skFixedDelay = sk?.fixedDelay ?? df?.fixedDelay;
    const skDelayResult = skFixedDelay ?? Percent.multiply(delay, skDelayMul);
    const buffDelayMul = Percent.multiply(skDelayMul, f.skillBuffs?.delayMul);
    const buffFixedDelay = f.skillBuffs?.fixedDelay ?? skFixedDelay;
    const buffDelayResult =
      buffFixedDelay ?? Percent.multiply(delay, buffDelayMul);
    const condFixedDelay = f.cond?.fixedDelay ?? df?.fixedDelay;
    const condDelayResult =
      condFixedDelay ?? Percent.multiply(delay, df?.delayMul, f.cond?.delayMul);

    const baseResult = baseAtkSpdResult + baseDelayResult;
    const skillResult = skAtkSpdResult + skDelayResult;
    const buffResult = buffAtkSpdResult + buffDelayResult;
    const condResult = condAtkSpdResult + condDelayResult;
    const skillColor = Util.getTableColor(baseResult, skillResult);
    const buffColor =
      baseResult <= buffResult
        ? undefined
        : Util.getTableColor(skillResult, buffResult, true);
    const conditionalColor = Util.getTableColorWeak(baseResult, condResult);

    const result = attackSpeedResult + delayResult;

    return {
      attackSpeedBase: asf?.attackSpeedBase,
      attackSpeedPotential: asf?.attackSpeedPotential ?? 0,
      fixedAttackSpeed: asf?.fixedAttackSpeed,
      attackMotionMul,
      attackSpeedBuff,
      attackSpeedResult,
      delay,
      delayMul,
      delaySubtotal,
      fixedDelay,
      subskillBuff,
      formationBuff,
      beastFormationBuff,
      delayResult,
      skillColor,
      buffColor,
      conditionalColor,
      result,
    };
  }

  private getStatLimitFactors(
    setting: Setting,
    statType: typeof stat.physicalLimit | typeof stat.magicalLimit
  ): Data.LimitFactors | undefined {
    const s = statType === stat.physicalLimit ? stat.defense : stat.resist;
    const hp = this.hp.getValue(setting);
    const baseDefres = this[s].getValue(setting);
    if (hp === undefined || baseDefres === undefined) return;

    const damageCut = (
      statType === stat.physicalLimit
        ? this.physicalDamageCut
        : this.magicalDamageCut
    ).getValue(setting);
    const limit = Percent.divide(hp, damageCut);

    const defres = Math.min(Percent.multiply(limit, 900), baseDefres);
    const isMaxDefres = defres < baseDefres;
    const subtotal = limit + defres;

    const baseAttackDebuff = this.getAttackDebuff(setting, subtotal);
    const attackDebuff = Math.min(subtotal, baseAttackDebuff);
    const isMaxAttackDebuff = attackDebuff < baseAttackDebuff;

    const result = subtotal + attackDebuff;

    const evasion = (
      statType === stat.physicalLimit
        ? this.physicalEvasion
        : this.magicalEvasion
    ).getValue(setting);

    return {
      result,
      hp,
      defres,
      isMaxDefres,
      attackDebuff,
      isMaxAttackDebuff,
      damageCut,
      evasion,
    };
  }

  private getAttackDebuff(setting: Setting, limit: number): number {
    const f = this.getFeature(setting);
    const v = f.attackDebuff;
    if (v === undefined || typeof v === "number") return v ?? 0;
    switch (v.key) {
      case Data.StaticDamage.ATTACK_BASE: {
        const a = this.attack.getFactors(setting)?.deploymentResult;
        if (a === undefined) return 0;
        return Percent.multiply(a, v.value);
      }
      case AttackDebuff.enemyAttack:
        return Percent.divide(limit, 100 - v.value) - limit;
    }
  }

  private getInitialTime(setting: Setting) {
    const f = this.getFeature(setting);
    if (
      f.duration === Data.Duration.always ||
      f.isExtraDamage ||
      (f.phase !== undefined && f.phase > 1)
    )
      return;
    const cooldown = this.cooldown.getFactors(setting);
    if (cooldown.base === undefined || cooldown.baseResult === undefined)
      return;

    const v = Data.Rarity.getInitialTimeFactor(
      this.unit?.rarity.getValue(setting)
    );
    const fb =
      this.unit?.getBeastFormationBuffFactor(setting, stat.initialTime) ?? 100;
    const b = (((cooldown.base * v) / 10) * fb) / 100;
    const cut = f.initialTimeCut ?? 0;
    const ss = this.getSubskillFactor(setting, ssKeys.initialTimeCut);
    const p = this.unit?.getPotentialFactor(setting, stat.initialTime) ?? 0;
    const oc = this.getSkill(setting)?.isOverCharge
      ? cooldown.baseResult / 2
      : 0;
    const result = Math.max(0, b - cut - ss + p + oc);
    return this.getCooldownReductions(setting, result);
  }

  private getCooldownReductions(setting: Setting, value: number): number {
    this.getFeature(setting).cooldownReductions?.forEach((v) => {
      value -= Math.trunc(value / v);
    });
    if (this.isRecharge(setting)) value -= Math.trunc(value / 2);
    if (this.isHighBeat(setting)) value -= Math.trunc(value / 4);
    return value;
  }

  private getDpsFactors(
    setting: Setting,
    index: 0 | 1 | 2 | 3 | 4 | 5
  ): Data.DpsFactors | undefined {
    const fea = this.getFeature(setting);
    if (fea.isNotSustainable) return;

    const f = this.attack.getFactors(setting);
    if (f === undefined) return;
    const attack = f.actualResult;
    const staticDamage = f.staticDamage !== undefined ? 0 : undefined;

    const damageType = this.damageType.getValue(setting);
    if (damageType === undefined) return;
    if (Data.DamageType.isHeal(damageType) && index > 0) return;

    const interval = this.interval.getValue(setting);
    const intervalFactor = this.interval.getFactors(setting);
    if (interval === undefined || intervalFactor?.actualResult === undefined)
      return;

    const round = Data.Round.average(this.rounds.getValue(setting));
    if (round === undefined) return;

    const baseDefres = (() => {
      switch (index) {
        case 0:
          return 0;
        case 1:
          return setting.dps1;
        case 2:
          return setting.dps2;
        case 3:
          return setting.dps3;
        case 4:
          return setting.dps4;
        case 5:
          return setting.dps5;
      }
    })();
    const defresDebuff = Debuff.calculate(
      (() => {
        switch (damageType) {
          case Data.DamageType.physical:
            return fea.defenseDebuff;
          case Data.DamageType.magic:
            return fea.resistDebuff;
        }
      })(),
      f.deploymentResult,
      intervalFactor.actualResult,
      intervalFactor.base?.attackSpeedResult,
      baseDefres,
      round
    );
    const minDefres = baseDefres / 2;
    const d = Math.max(minDefres, baseDefres - (defresDebuff ?? 0));
    const isMinDefres = d === minDefres;
    const defres = Math.trunc(d);

    const physicalDamageDebuff =
      damageType === Data.DamageType.physical
        ? fea.physicalDamageDebuff
        : undefined;
    const magicalDamageDebuff =
      damageType === Data.DamageType.magic
        ? fea.magicalDamageDebuff
        : undefined;
    const damageDebuff = Percent.sum(
      fea.damageDebuff,
      physicalDamageDebuff,
      magicalDamageDebuff
    );

    const hits = Data.Round.average(this.hits.getValue(setting));

    const ret: Data.DpsFactorsBase = {
      attack,
      baseDefres,
      defres,
      defresDebuff,
      minDefres,
      isMinDefres,
      criticalChance:
        staticDamage ?? this.criticalChance.getValue(setting) ?? 0,
      criticalDamage: this.criticalDamage.getValue(setting) ?? 0,
      penetration: this.getPenetration(setting),
      damageDebuff,
      round,
      hits,
      interval,
      damageType,
    };
    return this.calculateDpsFactors(ret);
  }

  private getPenetration(setting: Setting): number {
    let ret = this.penetration.getValue(setting) ?? 0;
    switch (this.damageType.getValue(setting)) {
      case Data.damageType.physical:
      case Data.damageType.magic:
        break;
      default:
        ret = 100;
        break;
    }
    return Math.min(100, Math.max(0, ret));
  }

  private calculateDpsFactors(factors: Data.DpsFactorsBase): Data.DpsFactors {
    const nonPenetration = 100 - factors.penetration;

    const fn = (attack: number) => {
      const minDamage = Math.trunc(attack / 10);
      const d = attack - factors.defres;
      const isMinDamage = minDamage >= d;
      const damage = Percent.multiply(
        isMinDamage ? minDamage : d,
        factors.damageDebuff
      );
      const trueDamage = Percent.multiply(attack, factors.damageDebuff);

      const meanDamage =
        (damage * nonPenetration + trueDamage * factors.penetration) / 100;
      const damageAmount = Math.round(
        meanDamage * factors.round * factors.hits
      );

      return {
        attack,
        minDamage,
        isMinDamage,
        damage,
        trueDamage,
        damageAmount,
      };
    };

    const criticalAttack = Percent.multiply(
      factors.attack,
      factors.criticalDamage
    );
    const normal = fn(factors.attack);
    const critical = fn(criticalAttack);
    const nonCriticalChance = 100 - factors.criticalChance;
    const frequency = Data.fps / factors.interval;
    const a = Percent.multiply(normal.damageAmount, nonCriticalChance);
    const b = Percent.multiply(critical.damageAmount, factors.criticalChance);
    const result = Math.round((a + b) * frequency);

    return {
      ...factors,
      normal,
      critical,
      nonPenetration,
      nonCriticalChance,
      frequency,
      result,
    };
  }

  private getFieldElements(setting: Setting): ReadonlySet<Data.Element> {
    const ret = new Set<Data.Element>();
    const f = this.getFeature(setting).fieldElements;
    if (f !== undefined) {
      for (const el of f) {
        ret.add(el);
      }
    }
    return this.getFieldElementSetting(setting, ret);
  }

  private getFieldElementSetting(
    setting: Setting,
    elements?: Set<Data.Element>
  ): Set<Data.Element> {
    elements ??= new Set<Data.Element>();
    if (setting.fieldElement === Setting.SAME) {
      const e = this.unit?.element.getValue(setting);
      if (e !== undefined) elements.add(e);
    }
    return elements;
  }

  private getFieldElementFactor(
    setting: Setting,
    statType: Data.MainStatType
  ): number {
    const f = this.getFieldElements(setting);
    const u = this.unit?.element.getValue(setting);
    const placement = this.unit?.placement.getValue(setting);
    if (
      u === undefined ||
      !f.has(u) ||
      placement === Data.Placement.servant ||
      placement === Data.Placement.target
    )
      return 0;

    const fea = this.getFeature(setting).fieldBuffFactor;
    const ss = this.getSubskillFactor(setting, ssKeys.fieldBuffFactor);

    return Percent.multiply(
      (() => {
        switch (statType) {
          case stat.range:
            return Data.Element.fieldRangeFactor;
          case stat.attack:
          case stat.defense:
          case stat.resist:
            return Data.Element.fieldFactor;
          default:
            return 0;
        }
      })(),
      fea,
      ss
    );
  }

  private getSubskillFactor(setting: Setting, key: SubskillFactorKey): number {
    const keys = ssKeys;
    if (this.unit === undefined) {
      switch (key) {
        case keys.damageFactor:
        case keys.delayMul:
        case keys.physicalDamageCut:
        case keys.magicalDamageCut:
        case keys.fieldBuffFactor:
          return 100;
        default:
          return 0;
      }
    }
    const [ss1, ss2] = this.unit.getSubskills(setting);
    const className = this.unit.className.getValue(setting);
    const fea = this.getFeature(setting);
    const types: (string | undefined)[] = [
      className,
      Data.ClassName.baseNameOf(className),
    ];
    const fnHp = (n: number) => {
      if ((fea.currentHp ?? 100) >= n) types.push(`HP${n}%以上`);
    };
    if (fea.isMoving) types.push("移動中");
    fnHp(50);
    fnHp(80);
    if ((this.skill ?? 0) <= 0) types.push("非スキル");
    if ((this.skill ?? 0) > 0) types.push("スキル");
    if (
      this.conditions
        .getValue(setting)
        .findIndex((kvp) => kvp.key === Data.Condition.ranged) === -1
    )
      types.push("ブロック");
    if (this.unit.isToken) types.push("トークン");
    if (fea.isAction) types.push("ACT");
    const fn = (ss: Subskill | undefined): number | undefined => {
      if (ss === undefined) return;
      const ret = ss.getFactor(key, types);
      if (typeof ret === "boolean") return ret ? 1 : 0;
      return ret;
    };
    const v1 = fn(ss1);
    const v2 = fn(ss2);
    const r1 = v1 ?? 0;
    const r2 = v2 ?? 0;
    const isStackable = Subskill.isStackable(ss1, ss2);

    switch (key) {
      case keys.delayMul:
        return isStackable
          ? Percent.multiply(v1, v2)
          : Math.min(v1 ?? 100, v2 ?? 100);
      case keys.physicalDamageCut:
      case keys.magicalDamageCut:
      case keys.physicalEvasion:
      case keys.magicalEvasion:
        return isStackable ? Percent.accumulate(r1, r2) : Math.max(r1, r2);
      case keys.damageFactor:
      case keys.attackSpeedBuff:
      case keys.fieldBuffFactor:
        return isStackable
          ? Percent.multiply(100 + r1, 100 + r2)
          : Math.max(100 + r1, 100 + r2);
      default:
        return isStackable ? r1 + r2 : Math.max(r1, r2);
    }
  }

  private getSubskillFactorFromStatType(
    setting: Setting,
    statType: Data.StatType
  ): number {
    const keys = ssKeys;
    const fn = (k: SubskillFactorKey) => {
      return this.getSubskillFactor(setting, k);
    };

    switch (statType) {
      case stat.penetration:
      case stat.cooldown:
      case stat.fieldBuffFactor:
        return fn(statType);
      case stat.hp:
        return fn(keys.hpMul);
      case stat.attack:
        return fn(keys.attackMul);
      case stat.defense:
        return fn(keys.defenseMul);
      case stat.resist:
        return fn(keys.resistMul);
      case stat.physicalLimit:
        return fn(keys.physicalDamageCut);
      case stat.magicalLimit:
        return fn(keys.magicalDamageCut);
      default:
        return 0;
    }
  }

  private isHighBeat(setting: Setting): boolean {
    const currentHp = this.getFeature(setting).currentHp ?? 100;
    return (
      currentHp === 100 && !!this.getSubskillFactor(setting, ssKeys.isHighBeat)
    );
  }

  private isRecharge(setting: Setting): boolean {
    return !!this.getSubskillFactor(setting, ssKeys.isRecharge);
  }

  private isVisible(setting: Setting): boolean {
    if (this.unit === undefined) return false;

    const isPotentialApplied = this.unit.isPotentialApplied(setting);

    if (
      (!Data.Weapon.isApplied(setting) && this.require.has(require.WEAPON)) ||
      (!isPotentialApplied && this.require.has(require.POTENTIAL)) ||
      (setting.fieldElement !== Setting.NONE &&
        this.require.has(require.NO_PANEL_FIELD_ELEMENT))
    )
      return false;

    for (const p of this.hasPotentials) {
      if (!isPotentialApplied || !this.unit.potentials.includes(p))
        return false;
    }

    return true;
  }

  static comparer(
    setting: Setting,
    key: Keys,
    target: Situation
  ): string | number | undefined {
    return target[key].getSortOrder(setting);
  }

  static filter(
    states: States,
    list: readonly Situation[]
  ): readonly Situation[] {
    const equipmentFilters: FilterEquipment[] = [];
    const conditionFilters: FilterConditionKey[] = [];
    const setting = states.setting;
    const filter = states.filter;
    filter.forEach((v, k) => {
      if (FilterEquipment.isKey(k) && v) equipmentFilters.push(k);
      if (FilterCondition.isKey(k) && v) conditionFilters.push(k);
    });

    return list.filter((item) => {
      if (!item.isVisible(setting)) return false;

      const parent = item.getTokenParent(setting);
      const target = parent === undefined ? item : parent;

      if (target.unit?.filterRarity(states)) return false;
      if (target.unit?.filterElement(states)) return false;
      if (target.unit?.filterSpecies(states)) return false;
      if (item.unit?.filterPlacement(states)) return false;

      const className = target.unit?.className.getValue(setting);
      const classNameKey = Data.ClassName.keyOf(className);
      if (
        equipmentFilters.length !== 0 &&
        (classNameKey === undefined || !equipmentFilters.includes(classNameKey))
      )
        return false;

      if (!Situation.filterCondition(item, className, conditionFilters))
        return false;

      if (!states.query) {
        return Filter.baseKeys.some((k) => states.filter.get(k));
      } else {
        const sb: (Stat.Root<unknown, unknown> | undefined)[] =
          parent === undefined
            ? [item.unit?.rarity]
            : [
                parent.unit?.unitName,
                parent.unitShortName,
                parent.unit?.rarity,
                parent.unit?.element,
                parent.unit?.className,
              ];

        const s = sb
          .concat([
            item.unit?.unitName,
            item.unitShortName,
            item.unit?.element,
            item.damageType,
            item.unit?.className,
            item.skillName,
            item.supplements,
            item.conditions,
          ])
          .map((v) => v?.getText(setting));
        s.push(
          Data.ClassName.equipmentNameOf(item.unit?.className.getValue(setting))
        );
        try {
          const regex = new RegExp(states.query);
          return s.some((str) => {
            if (str === undefined) {
              return;
            } else {
              return regex.test(str);
            }
          });
        } catch {
          return false;
        }
      }
    });
  }

  private static filterCondition(
    item: Situation,
    className: Data.ClassName | undefined,
    conditionFilters: readonly FilterConditionKey[]
  ): boolean {
    const features = item.features;

    const groups = FilterCondition.groups;
    const appliedGroup = FilterCondition.getAppliedGroup(className);
    const ignoreGroup = FilterCondition.getFilterIgnoreGroup(
      appliedGroup,
      item
    );

    const cond = FilterCondition.keys;
    const getIsUnrelatedItem = (): boolean => {
      return conditionFilters.every((k) => {
        switch (k) {
          case cond.normal:
            return groups.every((k) => ignoreGroup[k]);
          default: {
            let general;
            switch (k) {
              case cond.proper:
                general = item.isGeneralProper;
                break;
              case cond.action:
                general = item.isGeneralAction;
                break;
              case cond.properAction:
                general = item.isGeneralProperAction;
                break;
            }
            return (
              item.isGeneral ||
              general ||
              !appliedGroup[FilterCondition.group[k]]
            );
          }
        }
      });
    };

    const condKeys = FilterCondition.list.filter((k) => {
      switch (k) {
        case cond.normal:
        case cond.properAction:
        case cond.barbarianAddAct:
        case cond.shieldKnightRangedAction:
          return false;
        default:
          return true;
      }
    }) as Exclude<
      FilterConditionKey,
      | typeof cond.normal
      | typeof cond.properAction
      | typeof cond.barbarianAddAct
      | typeof cond.shieldKnightRangedAction
    >[];
    type CondKey = (typeof condKeys)[number];
    const condMap = new Map<CondKey, boolean>();
    const getIsFilteredKey = (key: CondKey): boolean => {
      const cache = condMap.get(key);
      if (cache !== undefined) {
        return cache;
      } else {
        const feature = FilterCondition.requiredFeature[key];
        const hasFeature = Array.isArray(feature)
          ? feature.some((str) => features.includes(str))
          : features.includes(feature);
        const ret = appliedGroup[FilterCondition.group[key]] && hasFeature;

        condMap.set(key, ret);
        return ret;
      }
    };

    const getIsFilteredItem = (): boolean => {
      const fn = getIsFilteredKey;
      return conditionFilters.some((filter) => {
        switch (filter) {
          case cond.normal:
            return condKeys.every((k) => !fn(k));
          case cond.proper:
            return fn(filter) && !fn(cond.action);
          case cond.action:
            return (
              fn(filter) &&
              !fn(cond.proper) &&
              !fn(cond.barbarianAttackAdd) &&
              !fn(cond.shieldKnightRanged)
            );
          case cond.properAction:
            return fn(cond.proper) && fn(cond.action);
          case cond.barbarianAttackAdd:
            return (
              (fn(cond.barbarianAttackAdd) || item.isGeneralProper) &&
              !fn(cond.action)
            );
          case cond.barbarianAddAct:
            return (
              (fn(cond.barbarianAttackAdd) || item.isGeneralProper) &&
              (fn(cond.action) || item.isGeneralProperAction)
            );
          case cond.shieldKnightRanged:
            return fn(cond.shieldKnightRanged) && !fn(cond.action);
          case cond.shieldKnightRangedAction:
            return fn(cond.shieldKnightRanged) && fn(cond.action);
          case cond.destroyerRanged:
            return fn(cond.destroyerRanged) || features.includes("class-melee");
          default:
            return fn(filter);
        }
      });
    };

    return getIsUnrelatedItem() || getIsFilteredItem();
  }

  static get list(): readonly Situation[] {
    return situations;
  }

  static get keys(): readonly Keys[] {
    return keys;
  }
}

function getSituations(): readonly Situation[] {
  const ret: Situation[] = [];
  let index = 0;

  const create = (item: JsonSituation) => {
    ret.push(new Situation(item, index++));
  };

  Unit.list.forEach((unit) => {
    if (unit.situations !== undefined) {
      unit.situations.forEach((src) => {
        create({
          ...src,
          unitId: unit.id,
        });
      });
    }
  });

  jsonSituations.forEach((item) => create(item));

  return ret;
}

const situations = getSituations();
