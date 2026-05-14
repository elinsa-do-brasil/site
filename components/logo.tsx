import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/">
      {/* biome-ignore lint/performance/noImgElement: <usado para renderizar o svg do logo diretamente> */}
      <img
        src="/svg/logo.svg"
        alt="Elinsa"
        className={cn("h-18 w-auto mx-auto", className)}
      />
    </Link>
  );
}
