"use client";

import DottedMap from "dotted-map";
import { motion } from "motion/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useId, useMemo } from "react";

interface MapProps {
  className?: string;
  fadeEdges?: boolean;
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  highlights?: Array<{
    lat: number;
    lng: number;
    label: string;
    detail?: string;
    radius?: number;
    labelPosition?: "top" | "bottom" | "left" | "right";
  }>;
  lineColor?: string;
}

export default function WorldMap({
  className,
  fadeEdges = true,
  dots = [],
  highlights = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const gradientId = useId().replace(/:/g, "");
  const map = useMemo(
    () => new DottedMap({ height: 100, grid: "diagonal" }),
    [],
  );
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: isDark ? "#FFFFFF45" : "#0f172a82",
        shape: "circle",
        backgroundColor: "transparent",
      }),
    [isDark, map],
  );

  const projectPoint = (lat: number, lng: number) => {
    const point = map.getPin({ lat, lng });

    return point
      ? { x: point.x, y: point.y }
      : { x: map.image.width / 2, y: map.image.height / 2 };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - map.image.height * 0.18;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const labelOffset = (
    position: "top" | "bottom" | "left" | "right" = "top",
  ) => {
    const offsets = {
      top: { x: 0, y: -7, anchor: "middle" },
      bottom: { x: 0, y: 9, anchor: "middle" },
      left: { x: -6, y: 1, anchor: "end" },
      right: { x: 6, y: 1, anchor: "start" },
    } as const;

    return offsets[position];
  };

  const getDotKey = (dot: NonNullable<MapProps["dots"]>[number]) =>
    [
      dot.start.label,
      dot.start.lat,
      dot.start.lng,
      dot.end.label,
      dot.end.lat,
      dot.end.lng,
    ]
      .filter((value) => value !== undefined)
      .join("-");

  return (
    <div
      className={[
        "relative aspect-[2/1] w-full overflow-hidden rounded-md bg-transparent font-sans",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className={[
          "pointer-events-none h-full w-full select-none",
          fadeEdges
            ? "[mask-image:linear-gradient(to_bottom,transparent,white_8%,white_92%,transparent)]"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        alt="Mapa mundial pontilhado"
        height={map.image.height}
        width={map.image.width}
        unoptimized
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${map.image.width} ${map.image.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        <title>Conexões entre Espanha e Brasil</title>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {highlights.map((highlight) => {
          const point = projectPoint(highlight.lat, highlight.lng);
          const offset = labelOffset(highlight.labelPosition);

          return (
            <g key={highlight.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r={highlight.radius ?? 5}
                fill={lineColor}
                opacity="0.12"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={highlight.radius ?? 5}
                fill="none"
                stroke={lineColor}
                strokeWidth="0.55"
                opacity="0.8"
              />
              <circle cx={point.x} cy={point.y} r="1.35" fill={lineColor} />
              <text
                x={point.x + offset.x}
                y={point.y + offset.y}
                textAnchor={offset.anchor}
                className="fill-slate-950 text-[4px] font-bold tracking-normal dark:fill-white"
                paintOrder="stroke"
                stroke={isDark ? "#020617" : "#ffffff"}
                strokeWidth="1.6"
              >
                {highlight.label}
              </text>
              {highlight.detail ? (
                <text
                  x={point.x + offset.x}
                  y={point.y + offset.y + 4}
                  textAnchor={offset.anchor}
                  className="fill-slate-600 text-[3px] font-medium tracking-normal dark:fill-slate-300"
                  paintOrder="stroke"
                  stroke={isDark ? "#020617" : "#ffffff"}
                  strokeWidth="1.4"
                >
                  {highlight.detail}
                </text>
              ) : null}
            </g>
          );
        })}

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const dotKey = getDotKey(dot);

          return (
            <g key={`path-${dotKey}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="1"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
              ></motion.path>
            </g>
          );
        })}

        {dots.map((dot) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const dotKey = getDotKey(dot);

          return (
            <g key={`points-${dotKey}`}>
              <g>
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="2"
                  fill={lineColor}
                />
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="2"
                  fill={lineColor}
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    from="2"
                    to="8"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
              <g>
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="2"
                  fill={lineColor}
                />
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="2"
                  fill={lineColor}
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    from="2"
                    to="8"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
