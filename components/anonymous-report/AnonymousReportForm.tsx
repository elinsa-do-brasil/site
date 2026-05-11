"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Alert02Icon,
  Loading03Icon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons";
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
import { encryptReport } from "@/lib/anonymous-report/encrypt-report";
import { ETHICS_COMMITTEE_PUBLIC_KEY } from "@/lib/anonymous-report/public-key";
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

const webhookUrl = process.env.NEXT_PUBLIC_N8N_ANONYMOUS_REPORT_WEBHOOK_URL;

export function AnonymousReportForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const form = useForm<AnonymousReportSchema>({
    resolver: standardSchemaResolver(anonymousReportSchema),
    defaultValues: {
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

  const contactPreference = form.watch("contactPreference");

  async function onSubmit(values: AnonymousReportSchema) {
    if (
      values.contactPreference === "anonymous_contact" &&
      !values.contactInfo?.trim()
    ) {
      form.setError("contactInfo", {
        message: "Informe um meio de contato ou selecione a opção sem contato.",
      });
      return;
    }

    if (!webhookUrl) {
      setStatus("error");
      return;
    }

    try {
      setStatus("submitting");

      const payload = buildReportPayload(values);
      const encryptedPayload = await encryptReport({
        publicKeyArmored: ETHICS_COMMITTEE_PUBLIC_KEY,
        payload,
      });

      await submitEncryptedReport({
        webhookUrl,
        encryptedPayload,
      });

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <ReportSuccessMessage onReset={() => setStatus("idle")} />;
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      className="[&_[data-slot=field-label]]:text-sm [&_[data-slot=field-description]]:text-sm [&_[data-slot=field-error]]:text-sm [&_[data-slot=textarea]]:text-sm [&_[data-slot=input]]:text-sm [&_[data-slot=select-trigger]]:text-sm"
    >
      <FieldGroup className="gap-6">
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
              <FieldDescription>
                Evite informar seu nome, matrícula ou dados pessoais, a menos
                que isso seja essencial para o relato.
              </FieldDescription>
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

        {/* ── Preferência de contato ── */}
        <Controller
          name="contactPreference"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Deseja ser contatado?</FieldLabel>
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                <Field orientation="horizontal">
                  <RadioGroupItem value="no_contact" id="report-no-contact" />
                  <FieldLabel
                    htmlFor="report-no-contact"
                    className="font-normal"
                  >
                    Não, prefiro não informar contato
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal">
                  <RadioGroupItem
                    value="anonymous_contact"
                    id="report-anonymous-contact"
                  />
                  <FieldLabel
                    htmlFor="report-anonymous-contact"
                    className="font-normal"
                  >
                    Sim, quero informar um contato
                  </FieldLabel>
                </Field>
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* ── Contato opcional (condicional) ── */}
        {contactPreference === "anonymous_contact" && (
          <Controller
            name="contactInfo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="report-contact-info">Contato *</FieldLabel>
                <Input
                  {...field}
                  id="report-contact-info"
                  placeholder="E-mail, telefone ou outra forma de contato"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                <FieldDescription>
                  Só o Comitê de Ética terá acesso a esta informação.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

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
            <>
              <HugeiconsIcon
                icon={LockKeyIcon}
                className="size-4"
                strokeWidth={2}
              />
              Enviar denúncia
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
