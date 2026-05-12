"use client";

import { ShieldKeyIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";

export function ReportPrivacyNotice() {
  return (
    <Card className="border-elinsa-sky/20 bg-elinsa-light/30 dark:border-elinsa-sky/10 dark:bg-elinsa-dark/10">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-elinsa-sky/10">
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              className="size-4 text-elinsa-sky"
              strokeWidth={2}
            />
          </div>
          <h3 className="text-sm font-semibold">Sua proteção</h3>
        </div>

        <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1 text-elinsa-sky">•</span>
            <span>
              Não solicitamos seus dados para registrar a denúncia. Mas você
              pode se identificar <strong>caso queira</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 text-elinsa-sky">•</span>
            <span>
              Criptografamos as denúncias antes de serem salvas e{" "}
              <strong>apenas</strong> o Comitê de Ética terá acesso aos dados.
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
