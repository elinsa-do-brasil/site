"use client";

import {
  AiChat02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReportWritingHelp() {
  return (
    <Card className="border-border/50">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
            <HugeiconsIcon
              icon={AiChat02Icon}
              className="size-4 text-violet-600 dark:text-violet-400"
              strokeWidth={2}
            />
          </div>
          <h3 className="text-sm font-semibold">
            Precisa de ajuda para escrever?
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Disponibilizamos um{" "}
          <strong className="text-foreground">guia de instrução para IA</strong>{" "}
          — um arquivo que você pode carregar em qualquer assistente de IA (como
          ChatGPT, Claude ou Gemini) para que ele saiba exatamente como te
          ajudar a redigir uma denúncia.
        </p>

        {/* Como usar */}
        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
          <p className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="size-3.5 text-violet-500"
              strokeWidth={2}
            />
            Como usar
          </p>
          <ol className="space-y-1 text-muted-foreground list-none">
            <li className="flex gap-2">
              <span className="text-violet-500 font-medium">1.</span>
              Baixe o arquivo abaixo
            </li>
            <li className="flex gap-2">
              <span className="text-violet-500 font-medium">2.</span>
              Abra o assistente de IA de sua preferência
            </li>
            <li className="flex gap-2">
              <span className="text-violet-500 font-medium">3.</span>
              <span>
                Anexe o arquivo e diga:{" "}
                <strong>"Siga as instruções do arquivo"</strong>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-500 font-medium">4.</span>A IA irá
              guiar você na escrita da denúncia
            </li>
          </ol>
        </div>

        <p className="text-xs text-muted-foreground/70">
          O guia ensina a IA a organizar fatos, remover detalhes que possam
          identificar você e revisar o texto antes do envio.
        </p>

        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button variant="default" size="lg" asChild>
            <a
              href="/skills/skill-de-denunciante.md"
              download="guia-escrita-denuncia.md"
            >
              <Download />
              Baixar guia de IA
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
                className="size-3.5"
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
