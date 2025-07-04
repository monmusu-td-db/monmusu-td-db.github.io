import * as Data from "./Data";
import Situation from "./Situation";
import * as Stat from "./Stat";
import type { Setting, States } from "./States";
import type { TableRow, TableSource } from "./UI/StatTable";
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
] as const;
type Key = (typeof keys)[number];

interface Source {
  readonly id: number;
  readonly unit: Unit;
  readonly buff: JsonBuff;
}

const target = {
  all: "全体",
  inRange: "射程内",
  block: "ブロック敵",
  self: "自分",
  master: "付与対象",
} as const;

export default class InBattleBuff implements TableRow<Key> {
  readonly id: number;
  private readonly unit: Unit;
  private readonly rawBuff: JsonBuff;
  private readonly situation: Situation;

  readonly unitId: Stat.Root<number | undefined>;
  readonly unitShortName: Stat.UnitName;
  readonly skillName: Stat.Root<string | undefined>;
  readonly buffTarget: Stat.Root<string | undefined>;
  readonly buffRange: Stat.BuffRange;
  readonly initialTime: Stat.Root;
  readonly duration: Stat.Root<number | undefined, Data.DurationFactorsResult>;
  readonly cooldown: Stat.Root<number | undefined, Data.CooldownFactors>;

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

  private static filter(states: States, list: readonly InBattleBuff[]) {
    return list.filter((buff) => buff.unit.filterFn(states));
  }

  public static get tableData(): TableSource<Key> {
    return {
      headers: Data.StatType.getHeaders(keys),
      filter: (states) => this.filter(states, buffs),
      sort: (setting, rows, column, isReversed) => {
        return Data.mapSort(
          rows,
          (target) => target[column].getSortOrder(setting),
          isReversed
        );
      },
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
