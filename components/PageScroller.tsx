"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type AnyScroller = Window | HTMLElement;

type PageScrollerProps = {
  routes: string[];
  scrollContainerSelector?: string;
  cooldownMs?: number;
  edgeThreshold?: number;      // px near edge
  edgeIntentCount?: number;    // consecutive nudges needed
  edgeIntentWindowMs?: number; // time window for nudges
  edgeRestMs?: number;         // must be fully stopped at edge this long
};

export default function PageScroller({
  routes,
  scrollContainerSelector,
  cooldownMs = 800,
  edgeThreshold = 4,
  edgeIntentCount = 2,
  edgeIntentWindowMs = 700,
  edgeRestMs = 180,
}: PageScrollerProps) {
  const pathname = usePathname();
  const router = useRouter();

  const busyRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Use scrollingElement for reliable window scroll metrics across browsers/zoom
  const scrollEl = () =>
    typeof window === "undefined"
      ? null
      : (document.scrollingElement as HTMLElement | null) || document.documentElement;

  const getScroller = (): AnyScroller | null => {
    if (typeof window === "undefined") return null;
    if (!scrollContainerSelector) return window;
    return document.querySelector<HTMLElement>(scrollContainerSelector) || window;
  };
  const isWindow = (s: AnyScroller): s is Window => typeof (s as Window).scrollY === "number";

  const idx = useMemo(() => routes.findIndex((r) => r === pathname), [routes, pathname]);
  const prevRoute = idx > 0 ? routes[idx - 1] : null;
  const nextRoute = idx >= 0 && idx < routes.length - 1 ? routes[idx + 1] : null;

  // Prefetch neighbors
  useEffect(() => {
    if (nextRoute) router.prefetch(nextRoute);
    if (prevRoute) router.prefetch(prevRoute);
  }, [nextRoute, prevRoute, router]);

  const distFromBottom = (s: AnyScroller) => {
    if (isWindow(s)) {
      const el = scrollEl();
      if (!el) return 0;
      const scrolled = el.scrollTop + window.innerHeight;
      const docH = el.scrollHeight;
      return Math.max(0, docH - scrolled);
    } else {
      return Math.max(0, s.scrollHeight - s.scrollTop - s.clientHeight);
    }
  };
  const distFromTop = (s: AnyScroller) => {
    if (isWindow(s)) {
      const el = scrollEl();
      return Math.max(0, (el?.scrollTop ?? 0));
    }
    return Math.max(0, s.scrollTop);
  };
  const atBottom = (s: AnyScroller) => distFromBottom(s) <= edgeThreshold;
  const atTop = (s: AnyScroller) => distFromTop(s) <= edgeThreshold;

  const withCooldown = (fn: () => void) => {
    if (busyRef.current) return;
    busyRef.current = true;
    fn();
    setTimeout(() => (busyRef.current = false), cooldownMs);
  };

  // “Intent” + “Rest-at-edge” state
  const intentRef = useRef<{
    dir: "up" | "down" | null;
    count: number;
    timer: number | null;
  }>({ dir: null, count: 0, timer: null });

  const restRef = useRef<{
    dir: "up" | "down" | null;
    startedAt: number | null;
    raf: number | null;
  }>({ dir: null, startedAt: null, raf: null });

  const resetIntent = () => {
    if (intentRef.current.timer) window.clearTimeout(intentRef.current.timer);
    intentRef.current = { dir: null, count: 0, timer: null };
  };

  const bumpIntent = (dir: "up" | "down") => {
    const same = intentRef.current.dir === dir;
    if (!same) intentRef.current.count = 0;
    intentRef.current.dir = dir;
    intentRef.current.count += 1;

    if (intentRef.current.timer) window.clearTimeout(intentRef.current.timer);
    intentRef.current.timer = window.setTimeout(() => {
      // window expired—require fresh nudges
      resetIntent();
    }, edgeIntentWindowMs);

    return intentRef.current.count >= edgeIntentCount;
  };

  // Start a “rest detector”: only pass if scroll position remains at edge for edgeRestMs
  const startRestCheck = (dir: "up" | "down", scroller: AnyScroller, onPass: () => void) => {
    cancelRestCheck();
    restRef.current.dir = dir;
    restRef.current.startedAt = null;

    const readPos = () =>
      isWindow(scroller)
        ? { top: distFromTop(scroller), bottom: distFromBottom(scroller) }
        : { top: distFromTop(scroller), bottom: distFromBottom(scroller) };

    let lastTop = readPos().top;
    let lastBottom = readPos().bottom;

    const tick = (ts: number) => {
      const { top, bottom } = readPos();
      const atEdge = dir === "down" ? bottom <= edgeThreshold : top <= edgeThreshold;

      // Any movement away from the edge cancels the rest timer
      const moved = dir === "down" ? bottom > lastBottom + 0.5 : top > lastTop + 0.5;
      lastTop = top;
      lastBottom = bottom;

      if (!atEdge || moved) {
        restRef.current.startedAt = null;
      } else {
        if (restRef.current.startedAt == null) restRef.current.startedAt = ts;
        const elapsed = ts - (restRef.current.startedAt ?? ts);
        if (elapsed >= edgeRestMs) {
          cancelRestCheck();
          onPass();
          return;
        }
      }
      restRef.current.raf = window.requestAnimationFrame(tick);
    };

    restRef.current.raf = window.requestAnimationFrame(tick);
  };

  const cancelRestCheck = () => {
    if (restRef.current.raf) cancelAnimationFrame(restRef.current.raf);
    restRef.current = { dir: null, startedAt: null, raf: null };
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

    const considerNavigate = (dir: "up" | "down") => {
      if (dir === "down" && canGoNext()) withCooldown(() => nextRoute && router.push(nextRoute));
      if (dir === "up" && canGoPrev()) withCooldown(() => prevRoute && router.push(prevRoute));
    };

    const onWheel = (e: Event) => {
      const we = e as WheelEvent;
      if (isInsideNestedScrollable(we.target)) return;

      const goingDown = we.deltaY > 0;
      const goingUp = we.deltaY < 0;

      // Away from edges? clear intent & rest
      if (!atTop(scroller) && !atBottom(scroller)) {
        resetIntent();
        cancelRestCheck();
        return;
      }

      if (goingDown && atBottom(scroller)) {
        e.preventDefault();
        if (bumpIntent("down")) {
          // require a brief full-stop at bottom
          startRestCheck("down", scroller, () => considerNavigate("down"));
        }
      } else if (goingUp && atTop(scroller)) {
        e.preventDefault();
        if (bumpIntent("up")) {
          startRestCheck("up", scroller, () => considerNavigate("up"));
        }
      } else {
        // Direction changed—reset
        if (goingDown && intentRef.current.dir === "up") {
          resetIntent();
          cancelRestCheck();
        }
        if (goingUp && intentRef.current.dir === "down") {
          resetIntent();
          cancelRestCheck();
        }
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const downKeys = new Set(["PageDown", "ArrowDown", " "]);
      const upKeys = new Set(["PageUp", "ArrowUp"]);

      if (!atTop(scroller) && !atBottom(scroller)) {
        resetIntent();
        cancelRestCheck();
        return;
      }

      if (downKeys.has(e.key) && atBottom(scroller)) {
        e.preventDefault();
        if (bumpIntent("down")) startRestCheck("down", scroller, () => considerNavigate("down"));
      } else if (upKeys.has(e.key) && atTop(scroller)) {
        e.preventDefault();
        if (bumpIntent("up")) startRestCheck("up", scroller, () => considerNavigate("up"));
      } else {
        if (downKeys.has(e.key) && intentRef.current.dir === "up") {
          resetIntent();
          cancelRestCheck();
        }
        if (upKeys.has(e.key) && intentRef.current.dir === "down") {
          resetIntent();
          cancelRestCheck();
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const SWIPE = 40;

      if (!atTop(scroller) && !atBottom(scroller)) {
        resetIntent();
        cancelRestCheck();
        touchStartY.current = null;
        return;
      }

      if (dy > SWIPE && atBottom(scroller)) {
        if (bumpIntent("down")) startRestCheck("down", scroller, () => considerNavigate("down"));
      } else if (dy < -SWIPE && atTop(scroller)) {
        if (bumpIntent("up")) startRestCheck("up", scroller, () => considerNavigate("up"));
      } else {
        // opposite swipe cancels
        if (dy > SWIPE && intentRef.current.dir === "up") {
          resetIntent();
          cancelRestCheck();
        }
        if (dy < -SWIPE && intentRef.current.dir === "down") {
          resetIntent();
          cancelRestCheck();
        }
      }
      touchStartY.current = null;
    };

    const wheelTarget: EventTarget = isWindow(scroller) ? window : scroller;

    wheelTarget.addEventListener("wheel", onWheel as EventListener, { passive: false });
    window.addEventListener("keydown", onKey as EventListener, { passive: false });
    wheelTarget.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    wheelTarget.addEventListener("touchend", onTouchEnd as EventListener, { passive: true });

    // new page => clear state
    resetIntent();
    cancelRestCheck();

    return () => {
      wheelTarget.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("keydown", onKey as EventListener);
      wheelTarget.removeEventListener("touchstart", onTouchStart as EventListener);
      wheelTarget.removeEventListener("touchend", onTouchEnd as EventListener);
      resetIntent();
      cancelRestCheck();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    routes.join("|"),
    nextRoute,
    prevRoute,
    cooldownMs,
    edgeThreshold,
    edgeIntentCount,
    edgeIntentWindowMs,
    edgeRestMs,
  ]);

  return null;
}
