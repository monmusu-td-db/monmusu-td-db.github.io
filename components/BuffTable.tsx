"use client";

import { Table } from "react-bootstrap";
import tableStyles from "./BuffTable.module.css";
import type { ReactNode } from "react";

export interface BuffTableSource<T extends string> {
  readonly columnKeys: readonly T[];
  readonly columnName: Readonly<Record<T, string>>;
  readonly items: readonly BuffTableItem<T>[];
}

export interface BuffTableItem<T extends string> {
  key: string | number;
  value: Record<T, ReactNode>;
}

export function BuffTable<T extends string>({
  src,
  styles,
}: {
  src: BuffTableSource<T>;
  styles?: { readonly [key: string]: string } | undefined;
}) {
  return (
    <Table striped size="sm" bordered className={tableStyles.table}>
      <thead>
        <tr>
          {src.columnKeys.map((key) => (
            <th key={key} className={styles?.[key]}>
              {src.columnName[key]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table-group-divider">
        {src.items.map((row) => (
          <tr key={row.key}>
            {src.columnKeys.map((key) => (
              <td key={key} className={styles?.[key]}>
                {row.value[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
