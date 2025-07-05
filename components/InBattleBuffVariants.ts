import * as Data from "./Data";
import InBattleBuff from "./InBattleBuff";
import { TableSourceUtil, type TableSource } from "./UI/StatTableUtil";

const stat = Data.stat;

const commonKeysBegin = [
  stat.unitId,
  stat.unitShortName,
  stat.skillName,
  stat.buffTarget,
  stat.buffRange,
  stat.initialTime,
  stat.duration,
  stat.cooldown,
] as const;
type CommonKeysBegin = (typeof commonKeysBegin)[number];
const commonKeysEnd = [stat.inBattleBuffSupplements] as const;
type CommonKeysEnd = (typeof commonKeysEnd)[number];
type Keys<T extends Data.StatType> = T | CommonKeysBegin | CommonKeysEnd;

const baseKeys = [
  stat.buffHpMul,
  stat.buffAttackMul,
  stat.buffDefenseMul,
  stat.buffResistMul,
  stat.buffPhysicalDamageCut,
  stat.buffMagicalDamageCut,
] as const;
type BaseKey = Keys<(typeof baseKeys)[number]>;

export default class InBattleBuffVariants extends InBattleBuff {
  private static getKeys<T extends Data.StatType>(
    rawKeys: readonly T[]
  ): readonly Keys<T>[] {
    return [...commonKeysBegin, ...rawKeys, ...commonKeysEnd];
  }

  public static get tableDataBase(): TableSource<BaseKey> {
    const keys = this.getKeys(baseKeys);
    return {
      headers: Data.StatType.getHeaders(keys),
      filter: (states) => {
        const setting = states.setting;
        const filteredList = this.list.filter((buff) =>
          baseKeys.some((key) => buff[key].getValue(setting) !== undefined)
        );
        return this.filter(states, filteredList);
      },
      sort: TableSourceUtil.getSortFn(),
    } as const;
  }
}
