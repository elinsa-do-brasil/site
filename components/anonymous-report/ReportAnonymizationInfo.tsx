"use client";

import { UserShield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";

export function ReportAnonymizationInfo() {
  return (
    <Card className="border-border/50 bg-emerald-400/5 dark:bg-emerald-900/20">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
            <HugeiconsIcon
              icon={UserShield01Icon}
              className="size-4 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
          </div>
          <h3 className="text-sm font-semibold">
            O que fazemos para anonimizar denúncias
          </h3>
        </div>

        <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>
              Não registramos IP, navegador, cookies ou dados do dispositivo de
              quem envia a denúncia.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>
              Caso o usuário utilize o login, ele não será vinculado ao envio da
              denúncia.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>
              Esta página não utiliza cookies, nem outros métodos de
              rastreamento.
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
