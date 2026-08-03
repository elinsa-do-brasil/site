import {
  FileEditIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportWritingHelp() {
  return (
    <Card
      size="sm"
      className="rounded-md border-violet-300/40 bg-violet-50/70 dark:border-violet-800/60 dark:bg-violet-950/25"
    >
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
              <HugeiconsIcon
                icon={FileEditIcon}
                className="size-5"
                strokeWidth={2}
              />
            </span>
            Dicas para escrever com clareza
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Escreva com suas palavras e inclua somente as informações necessárias para o Comitê de Ética compreender o que aconteceu.
        </p>

        <div className="rounded-md border border-violet-300/50 bg-violet-100/70 px-3 py-2.5 text-sm dark:border-violet-800/60 dark:bg-violet-900/30">
          <p className="mb-1.5 flex items-center gap-1.5 font-medium">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="size-4 text-violet-700 dark:text-violet-300"
              strokeWidth={2}
            />
            O que ajuda na análise
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
            <li>Informe o que aconteceu, quando, onde e quem participou.</li>
            <li>
              Separe o que você presenciou do que soube por outras pessoas.
            </li>
            <li>
              Evite incluir dados pessoais que não sejam importantes para o
              relato.
            </li>
            <li>
              Revise nomes, fotos, horários e informações dos arquivos anexados
              antes de enviar.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
