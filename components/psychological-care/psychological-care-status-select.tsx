"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { updatePsychologicalCareRequestStatusAction } from "@/lib/psychological-care/actions";
import {
  normalizePsychologicalCareStatus,
  PSYCHOLOGICAL_CARE_STATUS_VALUES,
  type PsychologicalCareStatus,
  psychologicalCareStatusLabels,
} from "@/lib/psychological-care/status";

export function PsychologicalCareStatusSelect({
  requestId,
  status,
}: {
  requestId: string;
  status: string;
}) {
  const [currentStatus, setCurrentStatus] = useState<PsychologicalCareStatus>(
    normalizePsychologicalCareStatus(status),
  );
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: PsychologicalCareStatus) {
    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);

    startTransition(() => {
      void updatePsychologicalCareRequestStatusAction(requestId, nextStatus)
        .then((result) => {
          if (!result.success || !result.status) {
            setCurrentStatus(previousStatus);
            toast.error(
              result.error ??
                "Não foi possível atualizar o status da solicitação.",
            );
            return;
          }

          setCurrentStatus(result.status);
          toast.success("Status da solicitação atualizado.");
        })
        .catch(() => {
          setCurrentStatus(previousStatus);
          toast.error("Não foi possível atualizar o status da solicitação.");
        });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={isPending}
        onValueChange={(value) =>
          handleChange(value as PsychologicalCareStatus)
        }
        value={currentStatus}
      >
        <SelectTrigger
          aria-label="Status da solicitação"
          className="w-52"
          size="default"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PSYCHOLOGICAL_CARE_STATUS_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {psychologicalCareStatusLabels[value]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {isPending && <Spinner className="size-3.5 text-muted-foreground" />}
    </div>
  );
}
