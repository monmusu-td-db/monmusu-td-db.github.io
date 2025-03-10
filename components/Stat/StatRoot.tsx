import type { ReactNode } from "react";

import * as Data from "../Data";
import { Setting } from "../States";

const FONT_SIZE_LIMIT_NUMBER = 99999;
const FONT_SIZE_LIMIT_NUMBER_PLUS = 9999;

export type StatHandler<T> = (setting: Setting) => T;

interface StatPropsBase<TStat> {
  statType: Data.StatType;
  calculater: StatHandler<TStat>;
  comparer?: StatHandler<string | number | undefined> | undefined;
  isReversed?: boolean;
  text?: StatHandler<string | undefined> | undefined;
  item?: StatHandler<ReactNode> | undefined;
  color?: StatHandler<Data.TableColor | undefined> | undefined;
}

interface StatPropsWithFactors<TStat, TFactors> extends StatPropsBase<TStat> {
  factors: StatHandler<TFactors>;
}

export type StatProps<
  TStat,
  TFactors = undefined
> = NonNullable<TFactors> extends never
  ? StatPropsBase<TStat>
  : StatPropsWithFactors<TStat, TFactors>;

export class StatRoot<TStat = number | undefined, TFactors = undefined> {
  readonly statType: Data.StatType;
  readonly getText: StatHandler<string | undefined>;

  private readonly calculater: StatHandler<TStat>;
  private readonly comparer: StatHandler<string | number | undefined>;
  private readonly item: StatHandler<ReactNode>;
  private readonly color: StatHandler<Data.TableColor | undefined>;
  private readonly factors: StatHandler<TFactors>;
  private calculaterCache = new Data.Cache<TStat>();
  private comparerCache = new Data.Cache<string | number | undefined>();
  private itemCache = new Data.Cache<ReactNode>();
  private colorCache = new Data.Cache<Data.TableColor | undefined>();
  private factorsCache = new Data.Cache<TFactors>();

  constructor(props: StatProps<TStat, TFactors>) {
    this.statType = props.statType;
    this.calculater = props.calculater;
    this.comparer =
      props.comparer ?? ((s) => this.getDefaultComparer(s, props.isReversed));
    this.getText = props.text ?? this.getDefaultText;
    this.item = props.item ?? ((s) => this.getDefaultItem(s));
    this.color = props.color ?? (() => undefined);
    if ("factors" in props) this.factors = props.factors;
    else this.factors = () => undefined as TFactors;
  }

  getValue(setting: Setting): TStat {
    return this.calculaterCache.getCache((s) => this.calculater(s), setting);
  }

  getSortOrder(setting: Setting): string | number | undefined {
    return this.comparerCache.getCache((s) => this.comparer(s), setting);
  }

  getItem(setting: Setting): ReactNode {
    return this.itemCache.getCache((s) => this.item(s), setting);
  }

  getColor(setting: Setting): Data.TableColor | undefined {
    return this.colorCache.getCache((s) => this.color(s), setting);
  }

  getFactors(setting: Setting): TFactors {
    return this.factorsCache.getCache((s) => this.factors(s), setting);
  }

  protected getDefaultComparer(
    setting: Setting,
    isReversed?: boolean
  ): string | number | undefined {
    const ret = this.getValue(setting);
    switch (typeof ret) {
      case "string":
        return ret;
      case "number":
        return isReversed ? -ret : ret;
    }
  }

  private getDefaultText(setting: Setting): string | undefined {
    const ret = this.getValue(setting);
    switch (typeof ret) {
      case "number":
        return ret.toFixed(0);
      case "string":
        return ret;
      case "object":
        if (ret !== null) return ret.toString();
    }
  }

  protected getDefaultItem(setting: Setting): ReactNode {
    return this.getText(setting);
  }

  protected NumberItem({ value, plus }: { value: number; plus?: boolean }) {
    const limit = plus ? FONT_SIZE_LIMIT_NUMBER_PLUS : FONT_SIZE_LIMIT_NUMBER;
    const text = StatRoot.getNumberText(value);
    const ret = plus && value >= 0 ? <>+{text}</> : text;

    if (value <= limit) {
      return ret;
    } else {
      return <small>{ret}</small>;
    }
  }

  private static getNumberText(value: number): string {
    if (value >= 1_000_000) {
      return (value / 1000).toFixed(0) + "K";
    } else {
      return value.toFixed(0);
    }
  }
}
