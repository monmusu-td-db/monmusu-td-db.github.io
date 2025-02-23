"use client";

import * as Data from "@/components/Data";
import * as Util from "@/components/Util";
import Unit from "@/components/Unit";
import type { ReactNode } from "react";
import { Table } from "react-bootstrap";
import style from "./FormationBuffTable.module.css";

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

interface ListItem extends Record<Column, ReactNode> {
  key: string;
}

export function FormationBuffTable() {
  const list = getBuffList();

  return (
    <Table striped size="sm" bordered className={style["table"]}>
      <Header />
      <tbody className="table-group-divider">
        {list.map((row) => (
          <tr key={row.key}>
            {columns.map((column) => (
              <td key={column} className={style[column]}>
                {row[column]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Header() {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column} className={style[column]}>
            {columnName[column]}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function getBuffList(): readonly ListItem[] {
  const ret: ListItem[] = [];

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

      ret.push({
        key: `${id}-${index}`,
        id,
        name,
        hp: fn(buff.hp),
        attack: fn(buff.attack),
        defense: fn(buff.defense),
        resist: fn(buff.resist),
        target,
        supplement,
      });
    });
  });

  return ret;
}
