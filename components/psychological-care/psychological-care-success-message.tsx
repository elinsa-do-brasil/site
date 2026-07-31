"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card
      aria-live="polite"
      className="scroll-mt-28"
      role="status"
      variant="form"
    >
      <CardHeader>
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-elinsa-primary/10 text-elinsa-primary">
          <HugeiconsIcon
            aria-hidden="true"
            className="size-5"
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
          />
        </div>
        <CardTitle>
          <h2
            className="text-xl tracking-tight outline-none sm:text-2xl"
            id="psychological-care-success-title"
            ref={titleRef}
            tabIndex={-1}
          >
            Solicitação enviada
          </h2>
        </CardTitle>
        <CardDescription>
          A equipe responsável recebeu a solicitação para análise e acolhimento.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Alert role="note">
          <AlertTitle>Referência interna</AlertTitle>
          <AlertDescription>
            <code className="font-mono font-semibold text-foreground">
              {protocol}
            </code>
            <p className="mt-2">
              Não há consulta pública desta solicitação. Os dados e o andamento
              ficam restritos à equipe responsável.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Você pode fechar esta página ou iniciar um novo envio.
        </p>
        <Button className="sm:w-fit" onClick={onReset} type="button">
          Enviar nova solicitação
        </Button>
      </CardFooter>
    </Card>
  );
}
