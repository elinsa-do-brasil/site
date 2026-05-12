"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ReportSuccessMessage } from "@/components/anonymous-report/ReportSuccessMessage";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildReportPayload } from "@/lib/anonymous-report/build-report-payload";
import {
  type AnonymousReportSchema,
  anonymousReportSchema,
} from "@/lib/anonymous-report/schema";
import { submitEncryptedReport } from "@/lib/anonymous-report/submit-encrypted-report";

const REPORT_CATEGORIES = [
  "Assédio moral",
  "Assédio sexual",
  "Discriminação",
  "Conflito de interesse",
  "Fraude ou corrupção",
  "Descumprimento de normas",
  "Conduta indevida",
  "Riscos à segurança",
  "Meio ambiente",
  "Outro",
] as const;

export function AnonymousReportForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [protocol, setProtocol] = useState<string | null>(null);

  const form = useForm<AnonymousReportSchema>({
    resolver: standardSchemaResolver(anonymousReportSchema),
    defaultValues: {
      identify: "no",
      reporterName: "",
      category: "",
      title: "",
      description: "",
      occurredAt: "",
      location: "",
      involvedPeople: "",
      witnesses: "",
      previousAttempts: "",
      contactPreference: "no_contact",
      contactInfo: "",
    },
  });

  const identify = form.watch("identify");

  async function onSubmit(values: AnonymousReportSchema) {
    if (values.identify === "yes") {
      if (!values.reporterName?.trim()) {
        form.setError("reporterName", {
          message: "Informe seu nome para se identificar.",
        });
        return;
      }
      if (!values.contactInfo?.trim()) {
        form.setError("contactInfo", {
          message: "Informe um meio de contato.",
        });
        return;
      }
    }

    try {
      setStatus("submitting");

      const payload = buildReportPayload(values);
      const result = await submitEncryptedReport({ report: payload });

      form.reset();
      setProtocol(result.protocol);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <ReportSuccessMessage
        protocol={protocol}
        onReset={() => {
          setProtocol(null);
          setStatus("idle");
        }}
      />
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      className="[&_[data-slot=field-label]]:text-sm [&_[data-slot=field-description]]:text-sm [&_[data-slot=field-error]]:text-sm [&_[data-slot=textarea]]:text-sm [&_[data-slot=input]]:text-sm [&_[data-slot=select-trigger]]:text-sm"
    >
      <FieldGroup className="gap-6">
        {/* ── Identificação ── */}
        <div
          className={`p-5 rounded-xl border transition-all duration-300 ${
            identify === "yes"
              ? "bg-sky-50/90 border-sky-300 dark:bg-sky-950/30 dark:border-sky-600"
              : "bg-emerald-50/90 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-600"
          }`}
        >
          <Controller
            name="identify"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel className="text-base font-semibold mb-2 block">
                  Deseja identificar-se?
                </FieldLabel>
                <FieldDescription>
                  Se escolher não se identificar, seu relato será totalmente
                  anônimo e seguro. Se escolher se identificar, apenas o Comitê
                  de Ética terá acesso aos seus dados de contato.
                </FieldDescription>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-3 mt-4 sm:flex-row sm:gap-6"
                >
                  <Field
                    orientation="horizontal"
                    className="flex items-center gap-2"
                  >
                    <RadioGroupItem value="no" id="identify-no" />
                    <FieldLabel
                      htmlFor="identify-no"
                      className="font-normal cursor-pointer text-sm"
                    >
                      Não, prefiro fazer um relato anônimo
                    </FieldLabel>
                  </Field>

                  <Field
                    orientation="horizontal"
                    className="flex items-center gap-2"
                  >
                    <RadioGroupItem value="yes" id="identify-yes" />
                    <FieldLabel
                      htmlFor="identify-yes"
                      className="font-normal cursor-pointer text-sm"
                    >
                      Sim, desejo me identificar
                    </FieldLabel>
                  </Field>
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Nome e Contato (Condicionais se identificado) ── */}
          {identify === "yes" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-5 pt-5 border-t border-sky-300/60 dark:border-sky-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
              <Controller
                name="reporterName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="report-reporter-name">
                      Nome *
                    </FieldLabel>
                    <Input
                      {...field}
                      id="report-reporter-name"
                      placeholder="Seu nome completo"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="contactInfo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="report-contact-info">
                      Contato *
                    </FieldLabel>
                    <Input
                      {...field}
                      id="report-contact-info"
                      placeholder="E-mail, telefone ou WhatsApp"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          )}
        </div>

        {/* ── Categoria ── */}
        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="report-category">Categoria *</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="report-category"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Título ── */}
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="report-title">Título *</FieldLabel>
              <Input
                {...field}
                id="report-title"
                placeholder="Resumo curto da situação"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Descrição ── */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="report-description">Descrição *</FieldLabel>
              <Textarea
                {...field}
                id="report-description"
                rows={8}
                placeholder="Descreva o ocorrido com o máximo de contexto possível, evitando se identificar caso não queira."
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                className="min-h-36 resize-y"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Duas colunas: data + local ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            name="occurredAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="report-occurred-at">
                  Quando ocorreu
                </FieldLabel>
                <Input
                  {...field}
                  id="report-occurred-at"
                  type="date"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="report-location">Onde ocorreu</FieldLabel>
                <Input
                  {...field}
                  id="report-location"
                  placeholder="Local ou unidade"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* ── Pessoas envolvidas ── */}
        <Controller
          name="involvedPeople"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="report-involved-people">
                Pessoas envolvidas
              </FieldLabel>
              <Textarea
                {...field}
                id="report-involved-people"
                rows={3}
                placeholder="Quem participou ou praticou a conduta, se souber"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                className="resize-y"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Testemunhas ── */}
        <Controller
          name="witnesses"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="report-witnesses">Testemunhas</FieldLabel>
              <Textarea
                {...field}
                id="report-witnesses"
                rows={3}
                placeholder="Houve outras pessoas que presenciaram a situação?"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                className="resize-y"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Tentativas anteriores ── */}
        <Controller
          name="previousAttempts"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="report-previous-attempts">
                Já tentou resolver de outra forma?
              </FieldLabel>
              <Textarea
                {...field}
                id="report-previous-attempts"
                rows={3}
                placeholder="Conte se já procurou ajuda ou tentou resolver a situação internamente"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                className="resize-y"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Erro genérico ── */}
        {status === "error" && (
          <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="size-5 shrink-0"
              strokeWidth={2}
            />
            <p>
              Não foi possível enviar a denúncia. Verifique sua conexão e tente
              novamente.
            </p>
          </div>
        )}

        {/* ── Botão de envio ── */}
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="w-full gap-2 text-sm"
          size="lg"
        >
          {status === "submitting" ? (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4 animate-spin"
                strokeWidth={2}
              />
              Enviando...
            </>
          ) : (
            <>Enviar denúncia</>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
