"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { updateReportStatusAction } from "@/lib/reports/actions";
import {
  normalizeReportStatus,
  REPORT_STATUS_VALUES,
  type ReportStatus,
  reportStatusLabels,
} from "@/lib/reports/status";

export function ReportStatusSelect({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(
    normalizeReportStatus(status),
  );
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: ReportStatus) {
    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);

    startTransition(() => {
      void updateReportStatusAction(reportId, nextStatus).then((result) => {
        if (result.error || !result.status) {
          setCurrentStatus(previousStatus);
          toast.error(result.error ?? "Não foi possível atualizar o status.");
          return;
        }

        setCurrentStatus(result.status);
        toast.success("Status da denúncia atualizado.");
      });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={isPending}
        onValueChange={(value) => handleChange(value as ReportStatus)}
        value={currentStatus}
      >
        <SelectTrigger className="w-48" size="default">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REPORT_STATUS_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {reportStatusLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Spinner className="size-3.5 text-muted-foreground" />}
    </div>
  );
}
