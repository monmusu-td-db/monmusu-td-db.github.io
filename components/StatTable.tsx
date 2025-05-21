"use client";

import styles from "./StatTable.module.css";

import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { OverlayTrigger, Table } from "react-bootstrap";

import * as Data from "./Data";
import * as Util from "./Util";
import { Contexts, Setting, type States } from "./States";
import { StatRoot } from "./Stat/StatRoot";
import { StatTooltip } from "./Stat/StatTooltip";
import Situation from "./Situation";
import classNames from "classnames";

type Key = string | number | symbol;
const stat = Data.stat;

const getPendingStyle = (isPending: boolean) => ({
  opacity: isPending ? 0.5 : 1,
  transition: "opacity 0.2s 0.2s linear",
});

interface Sort<T extends Key = Key> {
  column: T | undefined;
  isReversed: boolean;
}
type HandleClickHeader<T extends Key = Key> = (column: T) => void;

export type TableSource<T extends Key> = {
  [K in T]: StatRoot<unknown, unknown>;
} & {
  readonly id: number;
};
interface TableSourceControl<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
> {
  readonly list: readonly TData[];
  readonly columns: readonly TColumn[];
  readonly comparer: (
    setting: Setting,
    key: TColumn,
    target: TData
  ) => string | number | undefined;
  readonly filter: (states: States, list: readonly TData[]) => readonly TData[];
}

function StatTable<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
>({ src }: { src: TableSourceControl<TData, TColumn> }) {
  const filter = Contexts.useFilter();
  const setting = Contexts.useSetting();
  const query = Contexts.useQuery();
  const uISetting = Contexts.useUISetting();

  const states = useMemo((): States => {
    return {
      filter,
      setting,
      query,
      uISetting,
    };
  }, [filter, query, setting, uISetting]);

  const deferredStates = useDeferredValue(states);
  const isPending = states !== deferredStates;

  return (
    <span style={getPendingStyle(isPending)}>
      <Control states={deferredStates} src={src} />
    </span>
  );
}

const Control = memo(Control_) as typeof Control_;
function Control_<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
>({
  states,
  src,
}: {
  states: States;
  src: TableSourceControl<TData, TColumn>;
}) {
  const defaultSort: Sort<TColumn> = {
    column: src.columns[0],
    isReversed: false,
  };
  const [sort, setSort] = useState(defaultSort);

  const handleClickHeader = useCallback((column: TColumn) => {
    setSort((p) => {
      if (p.column === column) return { ...p, isReversed: !p.isReversed };
      else return { ...p, column };
    });
  }, []);

  const filteredList = useMemo(
    () => src.filter(states, src.list),
    [states, src]
  );

  const sortedList = useMemo(
    () =>
      (() => {
        const column = sort.column;
        if (column === undefined) return filteredList;
        const mappedList = filteredList.map((v, i) => ({
          i,
          value: src.comparer(states.setting, column, v),
        }));
        mappedList.sort((a, b) => {
          if (sort.isReversed) return Util.comparer(b.value, a.value);
          else return Util.comparer(a.value, b.value);
        });
        return mappedList.map((v) => filteredList[v.i]) as readonly TData[];
      })(),
    [filteredList, sort, states.setting, src]
  );

  return (
    <Root
      states={states}
      src={src}
      list={sortedList}
      sort={sort}
      onClickHeader={handleClickHeader}
    />
  );
}

const Root = memo(Root_) as typeof Root_;
function Root_<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
>({
  states,
  src,
  list,
  sort,
  onClickHeader,
}: {
  states: States;
  src: TableSourceControl<TData, TColumn>;
  list: typeof src.list;
  sort: Sort<TColumn>;
  onClickHeader: HandleClickHeader<TColumn>;
}) {
  const deferredList = useDeferredValue(list);
  const isPending = list !== deferredList;

  return (
    <Table
      striped
      size="sm"
      className={styles.table}
      style={getPendingStyle(isPending)}
    >
      <Header columns={src.columns} sort={sort} onClick={onClickHeader} />
      <Body
        setting={states.setting}
        list={deferredList}
        columns={src.columns}
        sort={sort}
      />
    </Table>
  );
}

const Header = memo(_Header) as typeof _Header;
function _Header<T extends Key>({
  columns,
  sort,
  onClick,
}: {
  columns: readonly T[];
  sort: Sort<T>;
  onClick: HandleClickHeader<T>;
}) {
  return (
    <thead>
      <tr>
        {columns.map((item) => (
          <HeaderItem
            key={item.toString()}
            item={item}
            sort={sort}
            onClick={onClick}
          />
        ))}
      </tr>
    </thead>
  );
}

const HeaderItem = memo(_HeaderItem) as typeof _HeaderItem;
function _HeaderItem<T extends Key>({
  item,
  sort,
  onClick,
}: {
  item: T;
  sort: Sort<T>;
  onClick: HandleClickHeader<T>;
}) {
  const className = {
    "text-center": true,
    "table-c-red": sort.column === item && !sort.isReversed,
    "table-c-blue": sort.column === item && sort.isReversed,
  };
  const width = getColumnWidth(item);
  const style: CSSProperties | undefined =
    width === undefined ? undefined : { width: `${width}em` };
  let role, handleClick: HandleClickHeader<T>;
  switch (item as Data.StatType) {
    case stat.conditions:
    case stat.supplements:
      break;
    default:
      role = "button";
      handleClick = onClick;
      break;
  }
  return (
    <th
      className={classNames(className)}
      style={style}
      role={role}
      onClick={() => handleClick?.(item)}
    >
      {Data.StatType.isKey(item) ? Data.StatType.nameOf(item) : undefined}
    </th>
  );
}

function getColumnWidth(key: unknown): number | undefined {
  switch (key as Data.StatType) {
    case stat.hp:
    case stat.attack:
    case stat.defense:
    case stat.resist:
    case stat.physicalLimit:
    case stat.magicalLimit:
    case stat.dps0:
    case stat.dps1:
    case stat.dps2:
    case stat.dps3:
    case stat.dps4:
    case stat.dps5:
      return 3.3;

    case stat.conditions:
    case stat.target:
      return 3.4;

    case stat.rarity:
    case stat.cost:
    case stat.attackSpeed:
    case stat.delay:
      return 1.7;

    case stat.block:
      return 2.2;

    case stat.interval:
      return 2.4;

    case stat.unitId:
    case stat.situationId:
    case stat.element:
    case stat.range:
    case stat.moveSpeed:
    case stat.placement:
      return 2.5;

    case stat.initialTime:
    case stat.duration:
    case stat.cooldown:
    case stat.damageType:
      return 3;

    case stat.moveType:
      return 4;

    case stat.species:
      return 5;

    case stat.className:
      return 6;

    case stat.unitShortName:
      return 6.5;

    case stat.skillName:
    case stat.exSkill1:
    case stat.exSkill2:
      return 11;

    case stat.unitName:
      return 15;

    case stat.supplements:
      return 12.51;
  }
}

const Body = memo(function Body2<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
>({
  setting,
  list,
  columns,
  sort,
}: {
  setting: Setting;
  list: readonly TData[];
  columns: readonly Key[];
  sort: Sort<TColumn>;
}) {
  const deferredSort = useDeferredValue(sort);
  let previousId: number | undefined;

  function isBorderEnabled(column: unknown): boolean {
    switch (column as Data.StatType) {
      case stat.unitId:
      case stat.situationId:
      case stat.unitName:
      case stat.unitShortName:
      case stat.skillName:
      case stat.exSkill1:
      case stat.exSkill2:
      case stat.damageType:
        return true;
    }
    return false;
  }

  return (
    <tbody>
      {list.map((row) => {
        let className;
        if (row instanceof Situation && isBorderEnabled(deferredSort.column)) {
          const id = row.unitId.getValue(setting);
          if (id !== previousId && previousId !== undefined)
            className = styles["table-border-double"];
          previousId = id;
        }
        return (
          <tr key={row.id} className={className}>
            <Row setting={setting} columns={columns} row={row} />
          </tr>
        );
      })}
    </tbody>
  );
});

const Row = memo(function Row2<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
>({
  setting,
  columns,
  row,
}: {
  setting: Setting;
  columns: readonly TColumn[];
  row: TData;
}) {
  return (
    <>
      {columns.map((column) => (
        <RowItem
          key={`${row.id}_${column.toString()}`}
          setting={setting}
          column={column}
          row={row}
        />
      ))}
    </>
  );
});

const RowItem = memo(function RowItem<
  TData extends TableSource<TColumn>,
  TColumn extends keyof TData
>({ setting, column, row }: { setting: Setting; column: TColumn; row: TData }) {
  const src = row[column];
  function getEmptyText(v: ReactNode) {
    switch (column) {
      case stat.skillName:
      case stat.conditions:
      case stat.supplements:
      case stat.damageType:
      case stat.dps0:
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        return v;
      default:
        return v ?? "-";
    }
  }

  const alignment = (() => {
    switch (column) {
      case stat.cost:
      case stat.hp:
      case stat.attack:
      case stat.defense:
      case stat.resist:
      case stat.physicalLimit:
      case stat.magicalLimit:
      case stat.initialTime:
      case stat.duration:
      case stat.cooldown:
      case stat.dps0:
      case stat.dps1:
      case stat.dps2:
      case stat.dps3:
      case stat.dps4:
      case stat.dps5:
        return "text-end";

      case stat.rarity:
      case stat.element:
      case stat.species:
      case stat.attackSpeed:
      case stat.delay:
      case stat.interval:
      case stat.block:
      case stat.target:
      case stat.range:
      case stat.moveSpeed:
      case stat.moveType:
      case stat.damageType:
      case stat.placement:
        return "text-center";
    }
  })();

  const content = getEmptyText(src.getItem(setting));
  const color = src.getColor(setting);

  const itemClassNames = [];
  if (alignment !== undefined) itemClassNames.push(alignment);
  if (color !== undefined) itemClassNames.push(`table-c-${color}`);

  const item = (
    <td
      className={
        itemClassNames.length > 0 ? classNames(itemClassNames) : undefined
      }
    >
      {content}
    </td>
  );

  if (src instanceof StatTooltip && src.isEnabled(setting))
    return (
      <OverlayTrigger
        placement={src.placement}
        overlay={(p) => src.getTooltip(p, setting, row.id)}
        trigger={["click", "hover"]}
      >
        {item}
      </OverlayTrigger>
    );
  else return item;
});

export default StatTable;
