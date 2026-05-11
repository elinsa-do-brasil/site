"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ReportSuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="size-8 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2}
        />
      </div>

      <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-950/20">
        <AlertTitle className="text-base font-semibold text-emerald-800 dark:text-emerald-300">
          Denúncia enviada
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-emerald-700 dark:text-emerald-400/80">
          <p>
            Sua denúncia foi criptografada e enviada ao Comitê de Ética com
            sucesso. Nenhum dado identificável foi armazenado neste dispositivo.
          </p>
          <p className="text-xs">
            Se você informou um contato, o Comitê poderá entrar em contato por
            esse canal. Caso contrário, a denúncia será tratada de forma
            anônima.
          </p>
        </AlertDescription>
      </Alert>

      <Button variant="outline" onClick={onReset} type="button">
        Enviar outra denúncia
      </Button>
    </div>
  );
}
