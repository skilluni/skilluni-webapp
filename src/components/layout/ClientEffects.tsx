"use client";

import { useEffect } from "react";
import { destroyLenis, initLenis } from "../../lib/lenis";
import CustomCursor from "../ui/CustomCursor";

export default function ClientEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    initLenis();

    return () => {
      destroyLenis();
    };
  }, []);

  return <CustomCursor />;
}
