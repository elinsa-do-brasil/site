"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type ActionResult = {
  error?: string;
  success?: boolean;
};

type ConfirmActionDialogProps = {
  action: () => Promise<ActionResult>;
  confirmLabel: string;
  description: ReactNode;
  onSuccess?: () => void;
  successMessage: string;
  title: string;
  trigger: ReactNode;
  variant?: "default" | "destructive";
};

export function ConfirmActionDialog({
  action,
  confirmLabel,
  description,
  onSuccess,
  successMessage,
  title,
  trigger,
  variant = "destructive",
}: ConfirmActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(successMessage);
      setOpen(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={variant}
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? <Spinner /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
