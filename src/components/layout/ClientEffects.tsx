"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { destroyLenis, initLenis, getLenis } from "../../lib/lenis";
import CustomCursor from "../ui/CustomCursor";

export default function ClientEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = initLenis();

    // Use ResizeObserver on document.body to auto-resize Lenis whenever page height changes
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    const handleResize = () => lenis.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      destroyLenis();
    };
  }, []);

  // Recalculate Lenis dimensions on route / pathname changes
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      const timer = setTimeout(() => {
        lenis.resize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return <CustomCursor />;
}
