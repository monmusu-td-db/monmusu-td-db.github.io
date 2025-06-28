import * as Data from "./Data";
import * as Stat from "./Stat";
import type { States } from "./States";
import type { TableRow, TableSource } from "./UI/StatTable";
import type { JsonBuff } from "./Unit";
import Unit from "./Unit";

const stat = Data.stat;

const keys = [stat.unitId, stat.unitShortName, stat.skillName] as const;
type Key = (typeof keys)[number];

interface Source {
  readonly id: number;
  readonly unit: Unit;
  readonly buff: JsonBuff;
}

export default class InBattleBuff implements TableRow<Key> {
  readonly id: number;
  readonly unit: Unit;

  readonly unitId: Stat.Root<number | undefined>;
  readonly unitShortName: Stat.UnitName;
  readonly skillName: Stat.Root<string | undefined>;

  constructor(src: Source) {
    const { id, unit, buff } = src;
    this.id = id;
    this.unit = unit;

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
