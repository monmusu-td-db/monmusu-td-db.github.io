"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

export default function LinkFocusFix(): ReactNode {
  return (
    <Suspense>
      <LinkFocusFixEffect />
    </Suspense>
  );
}

function LinkFocusFixEffect(): ReactNode {
  // 参考 https://github.com/vercel/next.js/issues/33060
  const pathName = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (document.activeElement instanceof HTMLAnchorElement) {
      document.activeElement.blur();
    }
  }, [pathName, searchParams]);

  return;
}
