/** biome-ignore-all lint/performance/noImgElement: <renderiza o svg diretamente, sem otimização do next image> */

import { cn } from "@/lib/utils";

export function AdaptativeLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative block h-16 w-fit", className)}>
      <img
        src="/svg/logo-colorido.svg"
        alt="Elinsa do Brasil"
        className="h-16 w-fit dark:opacity-0"
      />

      <img
        src="/svg/logo-branco.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-16 w-fit opacity-0 dark:opacity-100"
      />
    </span>
  );
}