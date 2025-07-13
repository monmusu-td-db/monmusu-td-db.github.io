import { StatRange } from "./StatRange";
import type { StatHandler } from "./StatRoot";

export class StatBuffRange extends StatRange {
  override isEnabled: StatHandler<boolean> = (s) =>
    this.getValue(s) !== undefined && this.getFactors(s) !== undefined;
}
