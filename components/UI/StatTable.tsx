"use client";

import "./StatTable.css";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Alert, Table, Row as BRow, Col } from "react-bootstrap";
import type { StatRoot } from "../Stat/StatRoot";
import { Contexts, Setting, type States } from "../States";
import TooltipControl, { type TooltipEventHandlers } from "./TooltipControl";
import cn from "classnames";
import Panel from "./Panel";
import * as Data from "../Data";
import TableStyle from "./TableStyle";
import Situation from "../Situation";
import type {
  StatTableProps,
  TableData,
  TableHeader,
  TableRow,
  TableSource,
} from "./StatTableUtil";
import Image from "next/image";

//
// Types

type Stat = StatRoot<unknown, unknown> | undefined;
const stat = Data.stat;

export type CellData = {
  ref: RefObject<HTMLElement | null>;
  stat: Stat;
};

interface Sort<T extends string> {
  column: T | undefined;
  isReversed: boolean;
}

type SortHistory<T extends string> = [Sort<T>, Sort<T> | undefined];

interface StatTableSourceProps<T extends string> extends StatTableProps {
  src: TableSource<T>;
}

//
// Components

function StatTable<T extends string>({
  src,
  className,
  id,
  maxRows,
  showIcon,
}: StatTableSourceProps<T>) {
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
  const [sort, toggleSort] = useSort(src);

  const values = useMemo(
    () => ({
      src,
      states,
      sort,
      toggleSort,
    }),
    [src, states, sort, toggleSort]
  );
  const dValues = useDeferredValue(values);
  const {
    src: dSrc,
    states: dStates,
    sort: dSort,
    toggleSort: dToggleSort,
  } = dValues;
  const isPending = dValues !== values;

  useEffect(() => {
    if (isPending) {
      window.__setLoadingId(id);
    } else {
      window.__removeLoadingId(id);
    }
    return () => {
      window.__removeLoadingId(id);
    };
  }, [isPending, id]);

  return (
    <div
      className={cn(
        "stat-table-wrapper d-flex justify-content-center",
        className,
        {
          pending: isPending,
        }
      )}
    >
      <TableControl
        src={dSrc}
        states={dStates}
        id={id}
        sort={dSort}
        toggleSort={dToggleSort}
        maxRows={maxRows}
        showIcon={showIcon ?? false}
      />
    </div>
  );
}

const TableControl = memo(TableControl_) as typeof TableControl_;
function TableControl_<T extends string>({
  src,
  states,
  id,
  sort,
  toggleSort,
  maxRows,
  showIcon,
}: {
  src: TableSource<T>;
  states: States;
  id: string;
  sort: SortHistory<T>;
  toggleSort: HandleSort<T>;
  maxRows: number | undefined;
  showIcon: boolean;
}) {
  const [visibleRows, setVisibleRows] = useState(maxRows);
  const panelOpen = Panel.Contexts.useOpen();

  const filteredList = useMemo(() => {
    return src.filter(states);
  }, [src, states]);
  const listLength = filteredList.length;
  const maxLength = Math.max(listLength, maxRows ?? 0);

  const handleScroll = useCallback(
    function handleScroll() {
      setVisibleRows((p) => {
        if (p === undefined || maxRows === undefined) {
          return;
        } else {
          return Math.min(maxLength, p + maxRows);
        }
      });
    },
    [maxRows, maxLength]
  );

  const sortedList = useMemo(() => {
    const currentSort = sort[0];
    const prevSort = sort[1];

    let ret;
    if (currentSort.column === undefined) {
      ret = filteredList;
    } else {
      const prevSortedList =
        !prevSort || !prevSort.column
          ? filteredList
          : src.sort(
              states.setting,
              filteredList,
              prevSort.column,
              prevSort.isReversed
            );
      ret = src.sort(
        states.setting,
        prevSortedList,
        currentSort.column,
        currentSort.isReversed
      );
    }
    return ret;
  }, [filteredList, sort, src, states.setting]);

  const data: TableData<T> = useMemo(() => {
    const trancatedList = sortedList.slice(0, visibleRows);

    return {
      headers: src.headers,
      rows: trancatedList,
    };
  }, [sortedList, visibleRows, src.headers]);

  const [tooltipCond, handlers] = TooltipControl.useTooltip();

  const cond = useMemo(
    () => ({
      sort,
      states,
      data,
      handlers,
    }),
    [sort, states, data, handlers]
  );
  const deferredCond = useDeferredValue(cond);
  const isPending = cond !== deferredCond;
  const {
    sort: dSort,
    states: dStates,
    data: dData,
    handlers: dHandlers,
  } = deferredCond;

  if ((isPending || panelOpen) && tooltipCond.show) {
    handlers.hide();
  }

  if (maxRows !== undefined && visibleRows !== undefined) {
    if (maxLength < visibleRows) {
      // 表の内容が変化した際に同時表示数をリセットする
      setVisibleRows(maxLength);
      return;
    }
  }

  return (
    <TooltipControl cond={tooltipCond} setting={dStates.setting}>
      <TableStyle headers={dData.headers} id={id} />
      <Table
        striped
        size="sm"
        id={id}
        className={cn("stat-table", { pending: isPending })}
      >
        <Caption
          tableData={dData}
          onScroll={handleScroll}
          showIcon={showIcon}
        />
        <Header
          headers={dData.headers}
          setting={dStates.setting}
          sort={sort}
          onClick={toggleSort}
        />
        <Body
          tableData={dData}
          setting={dStates.setting}
          sortColumn={dSort[0].column}
          handlers={dHandlers}
        />
      </Table>
    </TooltipControl>
  );
}

type HandleSort<T extends string> = (column: T) => void;
function useSort<T extends string>(
  src: TableSource<T>
): [SortHistory<T>, HandleSort<T>] {
  const [sort, setSort] = useState<SortHistory<T>>([
    {
      column: src.headers[0]?.id,
      isReversed: false,
    },
    undefined,
  ]);

  const handleToggle = useCallback(
    (column: T) => {
      setSort((p) => {
        if (p[0].column === column) {
          let prevSort;
          if (column !== src.headers[0]?.id) {
            prevSort = p[1];
          }
          const ret: SortHistory<T> = [{ ...p[0] }, prevSort];
          ret[0].isReversed = !ret[0].isReversed;
          return ret;
        } else {
          let prevSort;
          if (column !== src.headers[0]?.id) {
            prevSort = p[0];
          }
          const ret = { column, isReversed: p[0].isReversed };
          return [ret, prevSort];
        }
      });
    },
    [src.headers]
  );

  return [sort, handleToggle];
}

const Header = memo(Header_) as typeof Header_;
function Header_<T extends string>({
  headers,
  setting,
  sort,
  onClick,
}: {
  headers: readonly TableHeader<T>[];
  setting: Setting;
  sort: SortHistory<T>;
  onClick: HandleSort<T>;
}) {
  const sortColor = Data.TableColor.getSelector(
    sort[0].isReversed
      ? Data.tableColorAlias.negative
      : Data.tableColorAlias.positive
  );
  const prevSortColor = Data.TableColor.getSelector(
    sort[1]?.isReversed
      ? Data.tableColorAlias.negativeWeak
      : Data.tableColorAlias.positiveWeak
  );

  return (
    <thead>
      <tr>
        {headers.map((col) => {
          let sortCn;
          if (col.id === sort[0].column) {
            sortCn = sortColor;
          } else if (sort[1] && col.id === sort[1].column) {
            sortCn = prevSortColor;
          }
          let role, handleClick: HandleSort<T> | undefined;
          if (TableStyle.isSortable(col.id)) {
            role = "button";
            handleClick = onClick;
          }

          return (
            <th
              key={col.id}
              className={cn(col.id, sortCn)}
              role={role}
              onClick={() => handleClick?.(col.id)}
            >
              <HeaderName statType={col.id} setting={setting} name={col.name} />
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function HeaderName({
  statType,
  setting,
  name,
}: {
  statType: string;
  setting: Setting;
  name: string;
}): ReactNode {
  const base = Data.StatType.getHeaderName(statType, setting, name);

  function getName(alias: string) {
    return (
      <>
        <span className="header-alias">{alias}</span>
        <span className="header-name">{base}</span>
      </>
    );
  }

  switch (statType) {
    case stat.defense:
      return getName("物防");
    case stat.resist:
      return getName("魔防");
    case stat.duration:
      return getName("効果(秒)");
    case stat.damageType:
      return getName("属性");
    default:
      return base;
  }
}

const Body = memo(Body_) as typeof Body_;
function Body_<T extends string>({
  tableData,
  setting,
  sortColumn,
  handlers,
}: {
  tableData: TableData<T>;
  setting: Setting;
  sortColumn: T | undefined;
  handlers: TooltipEventHandlers;
}) {
  let previousId: number | undefined;

  return (
    <tbody>
      {tableData.rows.map((row) => {
        let separator;
        if (
          row instanceof Situation &&
          TableStyle.isBorderEnabled(sortColumn)
        ) {
          const id = row.unitId.getValue(setting);
          if (id !== previousId && previousId !== undefined) {
            separator = true;
          }
          previousId = id;
        }
        return (
          <tr key={row.id} className={separator ? "separator" : undefined}>
            <Row
              headers={tableData.headers}
              row={row}
              setting={setting}
              handlers={handlers}
            />
          </tr>
        );
      })}
    </tbody>
  );
}

function Caption<T extends string>({
  tableData,
  onScroll,
  showIcon,
}: {
  tableData: TableData<T>;
  onScroll: () => void;
  showIcon: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onScroll();
        }
      },
      { rootMargin: "50px 50px 50px 50px" }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [onScroll]);

  if (tableData.rows.length > 0) {
    return <caption ref={ref} style={{ height: "1px" }} />;
  } else {
    const text =
      "表示結果がありませんでした。フィルターや検索ワードを確認してください。";
    return (
      <caption className="stat-empty-alert">
        <Alert variant="info" className="mx-2">
          {showIcon ? (
            <BRow className="empty-alert-row">
              <Col xs={12} sm={5} md={4}>
                <Image
                  src="/loading.png" // TODO
                  width={200}
                  height={200}
                  alt=""
                  priority
                  quality={100}
                  className="d-block mx-auto"
                />
              </Col>
              <Col xs={12} sm={7} md={8} className="d-flex align-items-center">
                {text}
              </Col>
            </BRow>
          ) : (
            text
          )}
        </Alert>
      </caption>
    );
  }
}

const Row = memo(function Row({
  headers,
  row,
  setting,
  handlers,
}: {
  headers: readonly TableHeader<string>[];
  row: TableRow<string>;
  setting: Setting;
  handlers: TooltipEventHandlers;
}) {
  return headers.map((col) => (
    <Cell
      key={col.id}
      stat={row[col.id]}
      setting={setting}
      handlers={handlers}
    />
  ));
});

const Cell = memo(function Cell({
  stat,
  setting,
  handlers,
}: {
  stat: Stat;
  setting: Setting;
  handlers: TooltipEventHandlers;
}) {
  const ref = useRef(null);
  const { onClick, onMouseOver, onMouseOut } = handlers;
  const cellData = { ref, stat };

  return (
    <td
      ref={ref}
      onClick={() => onClick(cellData)}
      onMouseOver={() => onMouseOver(cellData)}
      onMouseOut={() => onMouseOut(cellData)}
      className={stat?.getStyles(setting)}
    >
      {stat?.getItem(setting)}
    </td>
  );
});

export default StatTable;
