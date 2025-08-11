"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type AnyScroller = Window | HTMLElement;

type PageScrollerProps = {
  /** Full routes in order, e.g. ["/projects/x", "/projects/x/methodology", ...] */
  routes: string[];
  /** CSS selector for the scroll container; defaults to window */
  scrollContainerSelector?: string;
  /** ms between navigations to prevent double-firing */
  cooldownMs?: number;
  /** px tolerance from top/bottom that counts as “at edge” */
  edgeThreshold?: number;
};

export default function PageScroller({
  routes,
  scrollContainerSelector,
  cooldownMs = 800,
  edgeThreshold = 24,
}: PageScrollerProps) {
  const pathname = usePathname();
  const router = useRouter();

  const busyRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const idx = useMemo(() => routes.findIndex((r) => r === pathname), [routes, pathname]);
  const prevRoute = idx > 0 ? routes[idx - 1] : null;
  const nextRoute = idx >= 0 && idx < routes.length - 1 ? routes[idx + 1] : null;

  // Prefetch neighbors for snappy transitions
  useEffect(() => {
    if (nextRoute) router.prefetch(nextRoute);
    if (prevRoute) router.prefetch(prevRoute);
  }, [nextRoute, prevRoute, router]);

  // Resolve scroll container
  const getScroller = (): AnyScroller | null => {
    if (typeof window === "undefined") return null;
    if (!scrollContainerSelector) return window;
    const el = document.querySelector<HTMLElement>(scrollContainerSelector);
    return el || window;
  };

  const isWindow = (s: AnyScroller): s is Window => typeof (s as Window).scrollY === "number";

  const atBottom = (s: AnyScroller) => {
    if (isWindow(s)) {
      const scrolled = s.scrollY + s.innerHeight;
      const docH = document.documentElement.scrollHeight;
      return docH - scrolled <= edgeThreshold;
    } else {
      const rem = s.scrollHeight - s.scrollTop - s.clientHeight;
      return rem <= edgeThreshold;
    }
  };

  const atTop = (s: AnyScroller) => {
    if (isWindow(s)) return s.scrollY <= edgeThreshold;
    return s.scrollTop <= edgeThreshold;
  };

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

      if (we.deltaY > 0 && canGoNext() && atBottom(scroller)) {
        we.preventDefault();
        withCooldown(() => nextRoute && router.push(nextRoute));
      } else if (we.deltaY < 0 && canGoPrev() && atTop(scroller)) {
        we.preventDefault();
        withCooldown(() => prevRoute && router.push(prevRoute));
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const downKeys = new Set(["PageDown", "ArrowDown", " "]);
      const upKeys = new Set(["PageUp", "ArrowUp"]);
      if (downKeys.has(e.key) && canGoNext() && atBottom(scroller)) {
        e.preventDefault();
        withCooldown(() => nextRoute && router.push(nextRoute));
      } else if (upKeys.has(e.key) && canGoPrev() && atTop(scroller)) {
        e.preventDefault();
        withCooldown(() => prevRoute && router.push(prevRoute));
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const SWIPE = 40;
      if (dy > SWIPE && canGoNext() && atBottom(scroller)) {
        withCooldown(() => nextRoute && router.push(nextRoute));
      } else if (dy < -SWIPE && canGoPrev() && atTop(scroller)) {
        withCooldown(() => prevRoute && router.push(prevRoute));
      }
      touchStartY.current = null;
    };

    const wheelTarget: EventTarget = isWindow(scroller) ? window : scroller;

    // Casts fix TS: EventListener expects (evt: Event) => void
    wheelTarget.addEventListener("wheel", onWheel as EventListener, { passive: false });
    window.addEventListener("keydown", onKey as EventListener, { passive: false });
    wheelTarget.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    wheelTarget.addEventListener("touchend", onTouchEnd as EventListener, { passive: true });

    return () => {
      wheelTarget.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("keydown", onKey as EventListener);
      wheelTarget.removeEventListener("touchstart", onTouchStart as EventListener);
      wheelTarget.removeEventListener("touchend", onTouchEnd as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, routes.join("|"), nextRoute, prevRoute, cooldownMs, edgeThreshold]);

  return null;
}