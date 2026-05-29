import Lenis from "lenis";
import { gsap } from "./gsap";

let lenisInstance: Lenis | null = null;
let rafHandler: ((time: number) => void) | null = null;

export function initLenis() {
  if (lenisInstance) {
    return lenisInstance;
  }

  const lenis = new Lenis({
    lerp: 0.08,
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1.1,
    touchMultiplier: 1.2,
  });

  rafHandler = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(rafHandler);
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

export function destroyLenis() {
  if (!lenisInstance || !rafHandler) {
    return;
  }

  gsap.ticker.remove(rafHandler);
  lenisInstance.destroy();
  lenisInstance = null;
  rafHandler = null;
}
