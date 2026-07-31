import { Badge } from "@/components/ui/badge";
import {
  getPsychologicalCareStatusLabel,
  normalizePsychologicalCareStatus,
  type PsychologicalCareStatus,
} from "@/lib/psychological-care/status";
import { cn } from "@/lib/utils";

const statusClasses: Record<PsychologicalCareStatus, string> = {
  new: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300",
  triage:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
  contact_in_progress:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-300",
  scheduled:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
  cancelled:
    "border-muted bg-muted text-muted-foreground dark:border-muted dark:bg-muted/60",
};

export function PsychologicalCareStatusBadge({ status }: { status: string }) {
  const normalizedStatus = normalizePsychologicalCareStatus(status);

  return (
    <Badge className={cn(statusClasses[normalizedStatus])} variant="outline">
      {getPsychologicalCareStatusLabel(normalizedStatus)}
    </Badge>
  );
}
