"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
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

type PsychologicalCareSuccessMessageProps = {
  onReset: () => void;
  protocol: string;
};

export function PsychologicalCareSuccessMessage({
  onReset,
  protocol,
}: PsychologicalCareSuccessMessageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      titleRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section
      aria-labelledby="psychological-care-success-title"
      className="py-2 sm:py-4"
    >
      <Card
        aria-live="polite"
        className="w-full border-emerald-200/80 bg-card py-0 shadow-sm dark:border-emerald-900/60"
        role="status"
      >
        <CardHeader className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-2xl leading-tight font-bold sm:text-3xl">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 dark:bg-emerald-900/50 dark:text-emerald-300 dark:ring-emerald-950/50">
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-6"
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Envio concluído
                </p>
                <h2
                  className="outline-none"
                  id="psychological-care-success-title"
                  ref={titleRef}
                  tabIndex={-1}
                >
                  Solicitação enviada
                </h2>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="mt-2 max-w-xl text-sm leading-relaxed">
            Sua solicitação foi recebida pela equipe responsável.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/25">
            <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80">
              Protocolo
            </p>
            <code className="mt-2 block break-all font-mono text-sm font-semibold text-emerald-950 sm:text-base dark:text-emerald-100">
              {protocol}
            </code>
            <p className="mt-2 text-xs leading-relaxed text-emerald-900/75 dark:text-emerald-200/75">
              Este código identifica o envio. Não é possível acompanhar o
              andamento por este site.
            </p>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="justify-end px-5 pb-4 sm:px-6">
          <Button className="w-full sm:w-fit" onClick={onReset} type="button">
            Enviar outra solicitação
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
