"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function AdaptativeLogo({ className }: { className?: string }) {
  const { theme } = useTheme();

  return (
    // biome-ignore lint/performance/noImgElement: <renderiza o svg diretamente, sem otimização do next image>
    <img
      src={theme === "dark" ? "/svg/logo-branco.svg" : "/svg/logo-colorido.svg"}
      alt="Elinsa do Brasil"
      className={cn("h-16 w-fit", className)}
    />
  );
}
