import type { ReactNode } from "react";
import * as Data from "../Data";
import type { Setting } from "../States";
import { StatRoot } from "./StatRoot";

export class StatSkillName extends StatRoot<
  string | null | undefined,
  Data.SkillNameFactors
> {
  protected override getDefaultItem(setting: Setting): ReactNode {
    const f = this.getFactors(setting);
    let { skillName, annotations, phase } = f;
    const { phaseName, isOverCharge } = f;

    if (skillName === null) {
      if (annotations === undefined) return;
      skillName = annotations[0];
      annotations = annotations.slice(1);
    } else if (
      phaseName !== undefined &&
      skillName !== undefined &&
      phase !== undefined &&
      phase > 1
    ) {
      phase = undefined;
      skillName = phaseName;
    }
    let additionText;
    if (phase !== undefined || isOverCharge) {
      const p = phase !== undefined ? phase : "";
      const oc = isOverCharge ? "OC" : "";
      const slash = phase !== undefined && isOverCharge ? "/" : "";
      additionText = `(${p}${slash}${oc})`;
    }
    return (
      <>
        {skillName ? (
          <>
            {skillName}
            {additionText}
          </>
        ) : (
          <span className={Data.TableClass.skillNormal}>
            通常{additionText}
          </span>
        )}
        {annotations !== undefined && (
          <div className={Data.TableClass.annotations}>
            {annotations.map((str) => (
              <div key={str}>{str}</div>
            ))}
          </div>
        )}
      </>
    );
  }
}
