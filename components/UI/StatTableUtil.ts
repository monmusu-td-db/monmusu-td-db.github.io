import * as Data from "../Data";
import type { StatRoot } from "../Stat/StatRoot";
import type { Setting, States } from "../States";

interface TableHeaders<T extends string> {
  headers: readonly TableHeader<T>[];
}

export interface TableData<T extends string> extends TableHeaders<T> {
  rows: readonly TableRow<T>[];
}

export interface TableSource<T extends string> extends TableHeaders<T> {
  filter: (states: States) => readonly TableRow<T>[];
  sort: TableSortFn<T>;
}
type TableSortFn<T extends string> = (
  setting: Setting,
  rows: readonly TableRow<T>[],
  column: T,
  isReversed: boolean
) => readonly TableRow<T>[];

export type TableHeader<T extends string> = {
  id: T;
  name: string;
};

export type TableRow<T extends string> = {
  readonly [key in T]: StatRoot<unknown, unknown>;
} & {
  readonly id: number;
};

export interface StatTableProps {
  id: string;
  className?: string;
}

export class TableSourceUtil {
  static getSortFn<T extends string>(): TableSortFn<T> {
    return (setting, rows, column, isReversed) => {
      return Data.mapSort(
        rows,
        (target) => target[column].getSortOrder(setting),
        isReversed
      );
    };
  }
}
