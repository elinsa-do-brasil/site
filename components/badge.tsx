import type { LucideIcon } from "lucide-react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeProps = {
  text: string;
  icon: LucideIcon;
  className?: string;
};

/** Renders a compact section label using the local shadcn badge foundation. */
export function Badge({ text, icon: Icon, className }: BadgeProps) {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(
        "mb-5 h-auto gap-2.5 rounded-md border-elinsa-sky/30 bg-elinsa-light/80 px-4 py-2.5 text-sm font-bold text-elinsa-primary shadow-sm backdrop-blur dark:border-elinsa-primary/20 dark:bg-background/70 dark:text-elinsa-sky [&>svg]:size-4!",
        className,
      )}
    >
      <Icon aria-hidden="true" />
      {text}
    </ShadcnBadge>
  );
}
