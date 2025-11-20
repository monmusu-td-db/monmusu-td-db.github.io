"use client";

import cn from "classnames";
import Images from "./Images";
import { useEffect, useState } from "react";

interface Condition {
  showDiff: boolean;
  cooldown: boolean;
}

const defaultCondition: Condition = {
  showDiff: false,
  cooldown: false,
};

function IconToggler({ className }: { className?: string | undefined }) {
  const [cond, setCond] = useState(defaultCondition);

  useEffect(() => {
    const img = new Image();
    img.src = Images.icon2Src;
  }, []);

  function handleToggle() {
    if (!cond.cooldown) {
      setCond({ showDiff: true, cooldown: true });
      window.setTimeout(() => {
        setCond((p) => ({ ...p, showDiff: false }));
      }, 4000);
      window.setTimeout(() => {
        setCond(defaultCondition);
      }, 4500);
    }
  }

  return (
    <>
      <Images.Icon1
        className={cn(className, { "d-none": cond.showDiff })}
        onClick={handleToggle}
        onMouseOver={handleToggle}
      />
      <Images.Icon2 className={cn(className, { "d-none": !cond.showDiff })} />
    </>
  );
}

export default IconToggler;
