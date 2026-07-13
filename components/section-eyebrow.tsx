import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionEyebrowProps = {
  text: string;
  icon: LucideIcon;
  className?: string;
  variant?: "editorial" | "line" | "plate" | "signal" | "stamp";
};

/** A descriptive label whose treatment can follow the section's visual role. */
export function SectionEyebrow({
  text,
  icon: Icon,
  className,
  variant = "plate",
}: SectionEyebrowProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto max-w-full justify-start gap-2.5 whitespace-normal text-left leading-5 [&>svg]:size-4!",
        variant === "plate" &&
          "rounded-md border-elinsa-sky/30 bg-elinsa-light/80 px-4 py-2.5 text-sm font-bold text-elinsa-primary shadow-sm backdrop-blur dark:border-elinsa-primary/20 dark:bg-background/70 dark:text-elinsa-sky",
        variant === "line" &&
          "rounded-none border-0 border-l-2 border-elinsa-primary bg-transparent py-1 pr-0 pl-3 text-xs font-black tracking-[0.14em] text-elinsa-primary uppercase shadow-none",
        variant === "signal" &&
          "rounded-full border-elinsa-primary/20 bg-elinsa-primary/10 px-3.5 py-2 text-xs font-black tracking-[0.1em] text-elinsa-primary uppercase shadow-none",
        variant === "editorial" &&
          "rounded-none border-0 bg-transparent p-0 text-xs font-black tracking-[0.18em] text-muted-foreground uppercase shadow-none",
        variant === "stamp" &&
          "rounded-md border-border bg-muted/60 px-3 py-2 font-mono text-[0.68rem] font-bold tracking-[0.12em] text-foreground uppercase shadow-none",
        className,
      )}
    >
      <Icon aria-hidden="true" />
      {text}
    </Badge>
  );
}
