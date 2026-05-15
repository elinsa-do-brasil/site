import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContatoForm } from "./contato-form";

export const metadata: Metadata = {
  title: "Contato — Elinsa do Brasil",
  description:
    "Entre em contato com a Elinsa do Brasil pelo formulário oficial do site.",
};

export default function ContatoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-elinsa-primary">
              Contato
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Fale com a Elinsa
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Envie sua mensagem para nossa equipe. Os contatos recebidos por
              aqui são registrados com segurança e encaminhados internamente.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <p>
              Para assuntos comerciais, institucionais ou dúvidas gerais,
              preencha o formulário ao lado.
            </p>
            <p>
              Se o assunto for uma denúncia de ética ou conduta, utilize o canal
              dedicado para manter o fluxo correto de análise.
            </p>
          </div>
        </section>

        <Card className="rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b py-5">
            <CardTitle className="text-xl">Enviar mensagem</CardTitle>
            <CardDescription>
              Responderemos pelo e-mail ou telefone informado.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <ContatoForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
