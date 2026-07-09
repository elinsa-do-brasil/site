import { Badge } from "@/components/ui/badge";
import {
  getReportStatusLabel,
  normalizeReportStatus,
  type ReportStatus,
} from "@/lib/reports/status";
import { cn } from "@/lib/utils";

const reportStatusBadgeClasses: Record<ReportStatus, string> = {
  new: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300",
  opened:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300",
  triage:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
  review:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-300",
  investigation:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-300",
  waiting_information:
    "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/70 dark:bg-yellow-950/40 dark:text-yellow-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
  archived:
    "border-muted bg-muted text-muted-foreground dark:border-muted dark:bg-muted/60",
};

export function ReportStatusBadge({ status }: { status: string }) {
  const normalizedStatus = normalizeReportStatus(status);

  return (
    <Badge
      variant="outline"
      className={cn(reportStatusBadgeClasses[normalizedStatus])}
    >
      {getReportStatusLabel(normalizedStatus)}
    </Badge>
  );
}
