import * as Data from "./Data";
import * as Stat from "./Stat";
import Unit from "./Unit";
import type { TableSource, TableRow } from "./UI/StatTableUtil";
import type { Setting, States } from "./States";
import FormationBuffUI from "./UI/FormationBuffUI";

const stat = Data.stat;

const keys = [
  stat.unitId,
  stat.unitShortName,
  stat.buffCost,
  stat.buffHp,
  stat.buffAttack,
  stat.buffDefense,
  stat.buffResist,
  stat.buffCriChance,
  stat.buffCriChanceLimit,
  stat.buffTarget,
  stat.buffSupplements,
] as const satisfies Data.StatType[];
type Keys = (typeof keys)[number];

interface Source {
  readonly id: number;
  readonly unit: Unit;
  readonly buff: Data.FormationBuff;
}

export default class FormationBuff implements TableRow<Keys> {
  readonly id: number;
  readonly unit: Unit;
  readonly getBuff: (setting: Setting) => Data.FormationBuffValue;

  readonly unitId: Stat.Root;
  readonly unitShortName: Stat.Root<string>;
  readonly buffCost: Stat.Root;
  readonly buffHp: Stat.Root;
  readonly buffAttack: Stat.Root;
  readonly buffDefense: Stat.Root;
  readonly buffResist: Stat.Root;
  readonly buffCriChance: Stat.Root;
  readonly buffCriChanceLimit: Stat.Root;
  readonly buffTarget: Stat.Root<ReadonlySet<Data.FormationBuffTarget>>;
  readonly buffSupplements: Stat.Root<readonly string[]>;

  constructor(src: Source) {
    const { id, unit, buff } = src;

    this.id = id;
    this.unit = unit;

    this.unitId = unit.unitId;
    this.unitShortName = unit.unitShortName;

    this.getBuff = (s) => unit.calculateFormationBuff(s, buff);

    this.buffCost = new Stat.Root({
      statType: stat.buffCost,
      calculater: (s) => this.getBuff(s).cost,
    });

    function getNumberText(value: number): string {
      const plus = value > 0 ? "+" : "";
      return `${plus}${value}%`;
    }

    function getPercentText(value: number | undefined): string | undefined {
      if (!value) return;
      return getNumberText(value - 100);
    }

    function getPercentAddText(value: number | undefined): string | undefined {
      if (value === undefined) return;
      return getNumberText(value);
    }

    const getBuffBaseStat = (
      statType:
        | typeof stat.buffHp
        | typeof stat.buffAttack
        | typeof stat.buffDefense
        | typeof stat.buffResist
    ) => {
      let key;
      switch (statType) {
        case stat.buffHp:
          key = stat.hp;
          break;
        case stat.buffAttack:
          key = stat.attack;
          break;
        case stat.buffDefense:
          key = stat.defense;
          break;
        case stat.buffResist:
          key = stat.resist;
          break;
      }
      const ret: Stat.Root = new Stat.Root({
        statType,
        calculater: (s) => this.getBuff(s)[key],
        item: (s) => getPercentText(ret.getValue(s)),
        color: (s) => {
          const value = ret.getValue(s);
          if (value !== undefined && value < 100) {
            return Data.tableColorAlias.negative;
          }
        },
        isReversed: true,
      });
      return ret;
    };

    this.buffHp = getBuffBaseStat(stat.buffHp);
    this.buffAttack = getBuffBaseStat(stat.buffAttack);
    this.buffDefense = getBuffBaseStat(stat.buffDefense);
    this.buffResist = getBuffBaseStat(stat.buffResist);

    this.buffCriChance = new Stat.Root({
      statType: stat.buffCriChance,
      calculater: (s) => this.getBuff(s).criChanceAdd,
      item: (s) => getPercentAddText(this.buffCriChance.getValue(s)),
      isReversed: true,
    });

    this.buffCriChanceLimit = new Stat.Root({
      statType: stat.buffCriChanceLimit,
      calculater: (s) => this.getBuff(s).criChanceLimitAdd,
      item: (s) => getPercentAddText(this.buffCriChanceLimit.getValue(s)),
      isReversed: true,
    });

    this.buffTarget = new Stat.Root({
      statType: stat.buffTarget,
      calculater: (s) => this.getBuff(s).targets,
      text: (s) => this.getTargetText(s),
      // item: (s) => FormationBuffUI.getTargetItem(this.buffTarget.getValue(s)),
      color: (s) => {
        const list = this.buffTarget.getValue(s);
        let element: Data.Element | undefined;
        let i = 0;
        list.forEach((v) => {
          if (Data.Element.isElement(v)) {
            element = v;
            i++;
          }
        });
        if (element && i === 1) {
          return Data.Element.colorOf(element);
        }
      },
      comparer: (s) => this.getTargetComparer(s),
    });

    this.buffSupplements = new Stat.Root({
      statType: stat.buffSupplements,
      calculater: (s) =>
        this.getBuff(s).require.map((buff) => {
          const key = Data.FormationBuffRequire.keyOf(buff);
          return FormationBuffUI.getSupplementText(
            key,
            unit.element.getValue(s)
          );
        }),
      item: (s) =>
        FormationBuffUI.getSupplementItems(
          this.getBuff(s).require,
          unit.element.getValue(s)
        ),
    });
  }

  private getTargetText(setting: Setting): string {
    const targets = this.buffTarget.getValue(setting);
    const arr: string[] = [];
    for (const tgt of targets) {
      arr.push(tgt);
    }
    return arr.join(" ");
  }

  private getTargetComparer(setting: Setting): number {
    const targets = this.buffTarget.getValue(setting);
    let points = 0;
    for (const tgt of targets) {
      if (tgt === Data.FormationBuff.all) {
        points += Infinity;
      } else if (Data.Element.isElement(tgt)) {
        Data.Element.nameList.forEach((v, i) => {
          if (tgt === v) {
            points += 1000 - i;
          }
        });
      } else if (Data.Species.isSpecies(tgt)) {
        Data.Species.nameList.forEach((v, i) => {
          if (tgt === v) {
            points += 400 - i;
          }
        });
      } else if (Data.UnitBaseClass.isName(tgt)) {
        Data.UnitBaseClass.list.forEach((v, i) => {
          if (tgt === v) {
            points += 800 - i;
          }
        });
      }
    }
    return -points;
  }

  private static filter(states: States, list: readonly FormationBuff[]) {
    return list.filter((buff) => buff.unit.filterFn(states));
  }

  public static get tableData(): TableSource<Keys> {
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

const buffs: readonly FormationBuff[] = (() => {
  const ret: FormationBuff[] = [];
  const units = Unit.list;
  let index = 0;

  units.forEach((unit) => {
    unit.formationBuffs.forEach((buff) => {
      ret.push(
        new FormationBuff({
          id: index++,
          unit,
          buff,
        })
      );
    });
  });

  return ret;
})();
