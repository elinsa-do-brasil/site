"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateContactStatusAction } from "@/lib/contacts/actions";
import {
  CONTACT_STATUS_VALUES,
  type ContactStatus,
  contactStatusLabels,
} from "@/lib/contacts/validators";

export function ContactStatusSelect({
  contactId,
  status,
}: {
  contactId: string;
  status: ContactStatus;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: ContactStatus) {
    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);

    startTransition(() => {
      void updateContactStatusAction(contactId, nextStatus).then((result) => {
        if (result.error) {
          setCurrentStatus(previousStatus);
          toast.error(result.error);
          return;
        }

        toast.success("Status atualizado.");
      });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={isPending}
        onValueChange={(value) => handleChange(value as ContactStatus)}
        value={currentStatus}
      >
        <SelectTrigger className="w-[9.5rem]" size="default">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONTACT_STATUS_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {contactStatusLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
