"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface BlobBackgroundProps {
  className?: string;
  wiggleIntensity?: number;
}

export default function BlobBackground({
  className,
  wiggleIntensity = 4,
}: BlobBackgroundProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const circles = Array.from(svg.querySelectorAll("circle"));

    const originalAttrs = circles.map((circle) => ({
      r: parseFloat(circle.getAttribute("r") || "0"),
      cx: parseFloat(circle.getAttribute("cx") || "0"),
      cy: parseFloat(circle.getAttribute("cy") || "0"),
    }));

    let frame = 0;
    const animate = () => {
      frame++;
      circles.forEach((circle, i) => {
        const { r, cx, cy } = originalAttrs[i];
        circle.setAttribute(
          "r",
          (r + Math.sin(frame / 30 + i) * wiggleIntensity).toString(),
        );
        circle.setAttribute(
          "cx",
          (cx + Math.sin(frame / 45 + i) * wiggleIntensity).toString(),
        );
        circle.setAttribute(
          "cy",
          (cy + Math.cos(frame / 45 + i) * wiggleIntensity).toString(),
        );
      });
      requestAnimationFrame(animate);
    };

    animate();
  }, [wiggleIntensity]);

  return (
    <div
      className={clsx(
        "pointer-events-none blur-md opacity-10 text-primary dark:text-accent z-10",
        "w-[1100px] h-[1100px] fixed rotate-12",
        className,
      )}
    >
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        className="w-full h-full"
      >
        <g transform="matrix(0.7431,0.6691,-0.6691,0.7431,472.39,-164.91)">
          {Array.from({ length: 17 }).map((_, i) => {
            const step = 6.25;
            const radius = 50 + step * i;
            const cx = 684 - 17.75 * i;
            const cy = 684 - 17.75 * i;
            const strokeWidth = 4 + 0.75 * i;
            const opacity = 0.1 + 0.05625 * i;
            const rotation = 100 - step * i;

            return (
              <circle
                key={i}
                r={radius}
                cx={cx}
                cy={cy}
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="none"
                opacity={opacity}
                transform={`rotate(${rotation}, 328, 536)`}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
