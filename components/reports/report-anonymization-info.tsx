import {
  CheckmarkCircle02Icon,
  UserShield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportAnonymizationInfo() {
  return (
    <Card
      size="sm"
      className="rounded-md border-emerald-300/40 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/25"
    >
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <HugeiconsIcon
                icon={UserShield01Icon}
                className="size-5"
                strokeWidth={2}
              />
            </span>
            O que fazemos para anonimizar denúncias
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="flex flex-col gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
              strokeWidth={2}
            />
            <span>
              Não registramos IP, navegador, cookies ou dados do dispositivo de
              quem envia a denúncia.
            </span>
          </li>
          <li className="flex gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
              strokeWidth={2}
            />
            <span>
              Caso o usuário utilize o login, ele não será vinculado ao envio da
              denúncia.
            </span>
          </li>
          <li className="flex gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
              strokeWidth={2}
            />
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
