"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type AnyScroller = Window | HTMLElement;

type PageScrollerProps = {
  routes: string[];
  scrollContainerSelector?: string;
  cooldownMs?: number;
  /** px tolerance from top/bottom that counts as “at edge”. Try to keep this small. */
  edgeThreshold?: number;
  /** how many consecutive “nudges” at the edge before navigating */
  edgeIntentCount?: number;
  /** how long (ms) the intent window stays open for consecutive nudges */
  edgeIntentWindowMs?: number;
};

export default function PageScroller({
  routes,
  scrollContainerSelector,
  cooldownMs = 800,
  edgeThreshold = 6,
  edgeIntentCount = 2,
  edgeIntentWindowMs = 700,
}: PageScrollerProps) {
  const pathname = usePathname();
  const router = useRouter();

  const busyRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Track “nudges” at an edge to avoid accidental flips from momentum
  const intentRef = useRef<{
    dir: "up" | "down" | null;
    count: number;
    timer: number | null;
  }>({ dir: null, count: 0, timer: null });

  const resetIntent = () => {
    if (intentRef.current.timer) {
      window.clearTimeout(intentRef.current.timer);
    }
    intentRef.current = { dir: null, count: 0, timer: null };
  };

  const bumpIntent = (dir: "up" | "down") => {
    const sameDir = intentRef.current.dir === dir;
    intentRef.current = {
      dir,
      count: sameDir ? intentRef.current.count + 1 : 1,
      timer: (intentRef.current.timer && window.clearTimeout(intentRef.current.timer), // clear old
        window.setTimeout(() => {
          // window closes; require fresh consecutive nudges
          resetIntent();
        }, edgeIntentWindowMs)),
    };
    return intentRef.current.count >= edgeIntentCount;
  };

  const idx = useMemo(() => routes.findIndex((r) => r === pathname), [routes, pathname]);
  const prevRoute = idx > 0 ? routes[idx - 1] : null;
  const nextRoute = idx >= 0 && idx < routes.length - 1 ? routes[idx + 1] : null;

  useEffect(() => {
    if (nextRoute) router.prefetch(nextRoute);
    if (prevRoute) router.prefetch(prevRoute);
  }, [nextRoute, prevRoute, router]);

  const getScroller = (): AnyScroller | null => {
    if (typeof window === "undefined") return null;
    if (!scrollContainerSelector) return window;
    const el = document.querySelector<HTMLElement>(scrollContainerSelector);
    return el || window;
  };

  const isWindow = (s: AnyScroller): s is Window => typeof (s as Window).scrollY === "number";

  const distFromBottom = (s: AnyScroller) => {
    if (isWindow(s)) {
      const scrolled = s.scrollY + s.innerHeight;
      const docH = document.documentElement.scrollHeight;
      return Math.max(0, docH - scrolled);
    } else {
      return Math.max(0, s.scrollHeight - s.scrollTop - s.clientHeight);
    }
  };
  const distFromTop = (s: AnyScroller) => {
    return isWindow(s) ? Math.max(0, s.scrollY) : Math.max(0, s.scrollTop);
  };

  const atBottom = (s: AnyScroller) => distFromBottom(s) <= edgeThreshold;
  const atTop = (s: AnyScroller) => distFromTop(s) <= edgeThreshold;

  const withCooldown = (fn: () => void) => {
    if (busyRef.current) return;
    busyRef.current = true;
    fn();
    setTimeout(() => (busyRef.current = false), cooldownMs);
  };

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller) return;

    const canGoNext = () => !!nextRoute && !busyRef.current;
    const canGoPrev = () => !!prevRoute && !busyRef.current;

    const isInsideNestedScrollable = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return !!el?.closest('[data-scroll-lock="true"], [data-scrollable="true"]');
    };

    const onWheel = (e: Event) => {
      const we = e as WheelEvent;
      if (isInsideNestedScrollable(we.target)) return;

      // If you move away from the edge, clear the “intent”
      if (!atTop(scroller) && !atBottom(scroller)) resetIntent();

      if (we.deltaY > 0 && canGoNext() && atBottom(scroller)) {
        // require consecutive nudges within the window
        we.preventDefault();
        if (bumpIntent("down")) withCooldown(() => nextRoute && router.push(nextRoute));
      } else if (we.deltaY < 0 && canGoPrev() && atTop(scroller)) {
        we.preventDefault();
        if (bumpIntent("up")) withCooldown(() => prevRoute && router.push(prevRoute));
      } else {
        // normal scrolling resets intent direction if you scroll the other way
        if (we.deltaY > 0 && intentRef.current.dir === "up") resetIntent();
        if (we.deltaY < 0 && intentRef.current.dir === "down") resetIntent();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const downKeys = new Set(["PageDown", "ArrowDown", " "]);
      const upKeys = new Set(["PageUp", "ArrowUp"]);
      if (!atTop(scroller) && !atBottom(scroller)) resetIntent();

      if (downKeys.has(e.key) && canGoNext() && atBottom(scroller)) {
        e.preventDefault();
        if (bumpIntent("down")) withCooldown(() => nextRoute && router.push(nextRoute));
      } else if (upKeys.has(e.key) && canGoPrev() && atTop(scroller)) {
        e.preventDefault();
        if (bumpIntent("up")) withCooldown(() => prevRoute && router.push(prevRoute));
      } else {
        // different key path cancels the current edge-intent
        if (downKeys.has(e.key) && intentRef.current.dir === "up") resetIntent();
        if (upKeys.has(e.key) && intentRef.current.dir === "down") resetIntent();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const SWIPE = 40;

      if (!atTop(scroller) && !atBottom(scroller)) resetIntent();

      if (dy > SWIPE && canGoNext() && atBottom(scroller)) {
        if (bumpIntent("down")) withCooldown(() => nextRoute && router.push(nextRoute));
      } else if (dy < -SWIPE && canGoPrev() && atTop(scroller)) {
        if (bumpIntent("up")) withCooldown(() => prevRoute && router.push(prevRoute));
      } else {
        // opposite swipe cancels
        if (dy > SWIPE && intentRef.current.dir === "up") resetIntent();
        if (dy < -SWIPE && intentRef.current.dir === "down") resetIntent();
      }
      touchStartY.current = null;
    };

    const wheelTarget: EventTarget = isWindow(scroller) ? window : scroller;

    wheelTarget.addEventListener("wheel", onWheel as EventListener, { passive: false });
    window.addEventListener("keydown", onKey as EventListener, { passive: false });
    wheelTarget.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    wheelTarget.addEventListener("touchend", onTouchEnd as EventListener, { passive: true });

    // If you navigate to a new page, clear any lingering intent
    resetIntent();

    return () => {
      wheelTarget.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("keydown", onKey as EventListener);
      wheelTarget.removeEventListener("touchstart", onTouchStart as EventListener);
      wheelTarget.removeEventListener("touchend", onTouchEnd as EventListener);
      resetIntent();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, routes.join("|"), nextRoute, prevRoute, cooldownMs, edgeThreshold, edgeIntentCount, edgeIntentWindowMs]);

  return null;
}
