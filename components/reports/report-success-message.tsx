"use client";

import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  CopyCheckIcon,
  FileSearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ReportSuccessMessage({
  onReset,
  protocol,
}: {
  onReset: () => void;
  protocol: string | null;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copiedTimeoutRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  const trackingHref = protocol
    ? `/acompanhar-denuncia?protocolo=${encodeURIComponent(protocol)}`
    : "/acompanhar-denuncia";

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        window.scrollTo(0, 0);
      }

      titleRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);

      if (copiedTimeoutRef.current) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  async function copyProtocol() {
    if (!protocol) return;

    await copyTextToClipboard(protocol);
    setCopied(true);

    if (copiedTimeoutRef.current) {
      window.clearTimeout(copiedTimeoutRef.current);
    }

    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <section aria-labelledby="report-success-title" className="py-2 sm:py-4">
      <Card
        role="status"
        aria-live="polite"
        className="mx-auto w-full border-emerald-200/80 bg-card py-0 shadow-sm dark:border-emerald-900/60"
      >
        <CardHeader className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-2xl font-bold leading-tight sm:text-3xl">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 dark:bg-emerald-900/50 dark:text-emerald-300 dark:ring-emerald-950/50">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-6"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Registro concluído
                </p>
                <h2
                  ref={titleRef}
                  id="report-success-title"
                  tabIndex={-1}
                  className="outline-none"
                >
                  Denúncia enviada
                </h2>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="mt-2 max-w-xl text-sm leading-relaxed">
            Sua denúncia foi encaminhada para análise.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-5 pb-5 sm:px-6">
          {protocol && (
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/25">
              <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80">
                Protocolo
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={copyProtocol}
                aria-label={`Copiar protocolo ${protocol}`}
                className="mt-2 h-auto w-full justify-between gap-3 border-emerald-300/80 bg-background/80 px-3 py-2 text-left text-emerald-950 hover:bg-background dark:border-emerald-900 dark:text-emerald-100"
              >
                <code className="min-w-0 break-all font-mono text-sm font-semibold sm:text-base">
                  {protocol}
                </code>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium">
                  <HugeiconsIcon
                    icon={copied ? CopyCheckIcon : Copy01Icon}
                    data-icon="inline-start"
                    strokeWidth={2}
                  />
                  {copied ? "Copiado" : "Copiar"}
                </span>
              </Button>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900/75 dark:text-emerald-200/75">
                Guarde este código em um local seguro. Ele é necessário para
                acompanhar o andamento público sem expor os dados enviados.
              </p>
            </div>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-col items-stretch gap-3 px-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Você já pode acompanhar o andamento público, fechar esta página ou
            iniciar um novo envio.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {protocol && (
              <Button asChild className="sm:w-fit">
                <Link href={trackingHref}>
                  <HugeiconsIcon
                    icon={FileSearchIcon}
                    data-icon="inline-start"
                    strokeWidth={2}
                  />
                  Acompanhar denúncia
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onReset}
              type="button"
              className="sm:w-fit"
            >
              Enviar outra denúncia
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
