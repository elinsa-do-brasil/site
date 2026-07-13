import {
  AiChat02Icon,
  Download02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
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
                icon={AiChat02Icon}
                className="size-5"
                strokeWidth={2}
              />
            </span>
            Precisa de ajuda para escrever?
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Disponibilizamos um <strong>guia de instrução para IA</strong>, um
          arquivo que você pode carregar em qualquer assistente de IA (como
          ChatGPT, Claude ou Gemini) para que ele saiba como te ajudar a redigir
          uma denúncia.
        </p>

        <div className="rounded-md border border-violet-300/50 bg-violet-100/70 px-3 py-2.5 text-sm dark:border-violet-800/60 dark:bg-violet-900/30">
          <p className="mb-1.5 flex items-center gap-1.5 font-medium">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="size-4 text-violet-700 dark:text-violet-300"
              strokeWidth={2}
            />
            Como usar
          </p>
          <ol className="flex list-none flex-col gap-1 text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-medium text-foreground">1.</span>
              Baixe o arquivo abaixo
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-foreground">2.</span>
              Abra o assistente de IA de sua preferência
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-foreground">3.</span>
              <span>
                Anexe o arquivo e diga:{" "}
                <strong>"Siga as instruções do arquivo"</strong>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-foreground">4.</span>
              <span>A IA irá guiar você na escrita da denúncia</span>
            </li>
          </ol>
        </div>

        <p className="text-xs text-muted-foreground/70">
          O guia ensina a IA a organizar fatos, remover detalhes que possam
          identificar você e revisar o texto antes do envio.
        </p>

        <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
          <Button variant="default" size="lg" asChild>
            <a
              href="/skills/skill-de-denunciante.md"
              download="guia-escrita-denuncia.md"
            >
              <HugeiconsIcon
                icon={Download02Icon}
                data-icon="inline-start"
                strokeWidth={2}
              />
              Baixar guia
            </a>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <a
              href="/skills/skill-de-denunciante.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon
                icon={AiChat02Icon}
                data-icon="inline-start"
                strokeWidth={2}
              />
              Ler o guia
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
