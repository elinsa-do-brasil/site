import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  text: string;
  icon: LucideIcon;
  className?: string;
};

export function Badge({ text, icon: Icon, className }: BadgeProps) {
  return (
    <div className={cn("mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-sky/30 dark:border-elinsa-primary/20 bg-elinsa-light/80 px-3 py-2 text-sm font-semibold text-elinsa-primary shadow-sm backdrop-blur dark:bg-background/70 dark:text-elinsa-sky", className )}>
      <Icon className="h-4 w-4" />
      {text}
    </div>
  );
}