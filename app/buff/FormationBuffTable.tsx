"use client";

import * as Data from "@/components/Data";
import * as Util from "@/components/Util";
import Unit from "@/components/Unit";
import type { ReactNode } from "react";
import styles from "./FormationBuffTable.module.css";
import {
  BuffTable,
  type BuffTableItem,
  type BuffTableSource,
} from "@/components/BuffTable";

const columns = [
  "id",
  "name",
  "hp",
  "attack",
  "defense",
  "resist",
  "target",
  "supplement",
] as const;
const columnName = {
  id: "#",
  name: "名前",
  hp: "HP",
  attack: "攻撃",
  defense: "物防",
  resist: "魔防",
  target: "対象",
  supplement: "補足",
} as const satisfies Record<Column, string>;
const Column = Data.Enum(columns);
type Column = (typeof columns)[number];

export function FormationBuffTable() {
  const src: BuffTableSource<Column> = {
    columnKeys: columns,
    columnName: columnName,
    items: getBuffList(),
  };

  return <BuffTable src={src} styles={styles} />;
}

function getBuffList(): readonly BuffTableItem<Column>[] {
  const ret: BuffTableItem<Column>[] = [];

  Unit.list.forEach((unit) => {
    const id = unit.src.parentId ?? unit.src.id;
    const name = unit.src.unitShortName;

    unit.formationBuffs.forEach((buff, index) => {
      const fn = (value: number | undefined) => {
        if (typeof value === "number") return `${value - 100}%`;
        return "";
      };

      const targetList: ReactNode[] = [];
      buff.targets.forEach((tgt) => {
        const element = Data.Element.parse(tgt);
        if (element !== undefined)
          targetList.push(<Util.ElementText element={element} />);
        else targetList.push(tgt);
      });
      const target = <Util.JoinTexts texts={targetList} />;

      const supplementList: ReactNode[] = [];
      buff.require.forEach((req) => {
        switch (req) {
          case Data.FormationBuffRequire.weapon:
            supplementList.push("専用武器効果");
        }
      });
      const supplement = <Util.JoinTexts texts={supplementList} />;

      const item = {
        id,
        name,
        hp: fn(buff.hp),
        attack: fn(buff.attack),
        defense: fn(buff.defense),
        resist: fn(buff.resist),
        target,
        supplement,
      };

      ret.push({
        key: `${unit.src.id}-${index}`,
        value: item,
      });
    });
  });

  return ret;
}
