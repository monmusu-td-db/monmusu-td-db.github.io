import * as Data from "./Data";
import InBattleBuff, { type InBattleBuffKey } from "./InBattleBuff";
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
] as const satisfies InBattleBuffKey[];
type CommonKeysBegin = (typeof commonKeysBegin)[number];
const commonKeysEnd = [stat.inBattleBuffSupplements] as const;
type CommonKeysEnd = (typeof commonKeysEnd)[number];
type Keys<T extends InBattleBuffKey> = T | CommonKeysBegin | CommonKeysEnd;

const baseKeys = [
  stat.buffHpMul,
  stat.buffAttackMul,
  stat.buffDefenseMul,
  stat.buffResistMul,
] as const satisfies InBattleBuffKey[];

const damageKeys = [
  stat.buffCriChanceAdd,
  stat.buffCriDamageAdd,
  stat.buffDamageFactor,
  stat.buffDamageDebuff,
  stat.buffPhysicalDamageDebuff,
  stat.buffMagicalDamageDebuff,
] as const satisfies InBattleBuffKey[];

const defensiveKeys = [
  stat.buffPhysicalDamageCut,
  stat.buffMagicalDamageCut,
  stat.buffDamageCut,
  stat.buffPhysicalEvasion,
  stat.buffMagicalEvasion,
] as const satisfies InBattleBuffKey[];

const attackSpeedKeys = [
  stat.buffAttackSpeed,
  stat.buffDelayMul,
  stat.buffAttackSpeedAgility,
] as const satisfies InBattleBuffKey[];

const moveSpeedKeys = [
  stat.buffMoveSpeedAdd,
  stat.buffMoveSpeedMul,
] as const satisfies InBattleBuffKey[];

const redeployKeys = [
  stat.buffRedeployTimeCut,
  stat.buffWithdrawCostReturn,
] as const satisfies InBattleBuffKey[];

const fieldKeys = [
  stat.buffFieldChange,
  stat.buffFieldAdd,
  stat.buffFieldFactor,
] as const satisfies InBattleBuffKey[];

const statusKey = [
  stat.buffPoisonImmune,
  stat.buffBlindImmune,
  stat.buffStanImmune,
  stat.buffPetrifyImmune,
  stat.buffFreezeImmune,
  stat.buffBurnImmune,
] as const satisfies InBattleBuffKey[];

const weatherKey = [
  stat.buffWeatherChange,
] as const satisfies InBattleBuffKey[];

export default class InBattleBuffVariants extends InBattleBuff {
  private static getKeys<T extends InBattleBuffKey>(
    rawKeys: readonly T[]
  ): readonly Keys<T>[] {
    return [...commonKeysBegin, ...rawKeys, ...commonKeysEnd];
  }

  private static getTableData<T extends InBattleBuffKey>(
    rawKeys: readonly T[]
  ): TableSource<Keys<T>> {
    const keys = this.getKeys(rawKeys);
    return {
      headers: Data.StatType.getHeaders(keys),
      filter: (states) => {
        const setting = states.setting;
        const filteredList = this.list.filter((buff) =>
          rawKeys.some((key) => buff[key].getValue(setting) !== undefined)
        );
        return this.filter(states, filteredList);
      },
      sort: TableSourceUtil.getSortFn(),
    } as const;
  }

  static get tableDataBase() {
    return this.getTableData(baseKeys);
  }

  static get tableDataDamage() {
    return this.getTableData(damageKeys);
  }

  static get tableDataDefensive() {
    return this.getTableData(defensiveKeys);
  }

  static get tableDataAttackSpeed() {
    return this.getTableData(attackSpeedKeys);
  }

  static get tableDataMoveSpeed() {
    return this.getTableData(moveSpeedKeys);
  }

  static get tableDataRedeploy() {
    return this.getTableData(redeployKeys);
  }

  static get tableDataField() {
    return this.getTableData(fieldKeys);
  }

  static get tableDataStatus() {
    return this.getTableData(statusKey);
  }

  static get tableDataWeather() {
    return this.getTableData(weatherKey);
  }
}
