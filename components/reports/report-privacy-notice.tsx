import {
  CheckmarkCircle02Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportPrivacyNotice() {
  return (
    <Card
      size="sm"
      className="rounded-md border-elinsa-sky/20 bg-elinsa-light/30 dark:border-elinsa-sky/20 dark:bg-elinsa-dark/20"
    >
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-elinsa-sky/10 text-elinsa-sky">
              <HugeiconsIcon
                icon={ShieldKeyIcon}
                className="size-5"
                strokeWidth={2}
              />
            </span>
            Sua proteção
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="flex flex-col gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0 text-elinsa-sky"
              strokeWidth={2}
            />
            <span>
              Não solicitamos seus dados para registrar a denúncia. Mas você
              pode se identificar <strong>caso queira</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-4 shrink-0 text-elinsa-sky"
              strokeWidth={2}
            />
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
