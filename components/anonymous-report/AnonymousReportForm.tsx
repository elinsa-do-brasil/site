"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  FileAttachmentIcon,
  Loading03Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ChangeEvent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ReportSuccessMessage } from "@/components/anonymous-report/ReportSuccessMessage";
import { Badge } from "@/components/ui/badge";
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
import { encryptReportAttachment } from "@/lib/anonymous-report/file-encryption";
import {
  type AnonymousReportSchema,
  anonymousReportSchema,
} from "@/lib/anonymous-report/schema";
import { submitEncryptedReport } from "@/lib/anonymous-report/submit-encrypted-report";
import type { SubmitReportResult } from "@/lib/anonymous-report/types";
import { uploadEncryptedReportAttachment } from "@/lib/anonymous-report/upload-encrypted-attachment";
import {
  formatAttachmentSize,
  MAX_REPORT_ATTACHMENT_SIZE_BYTES,
  MAX_REPORT_ATTACHMENTS,
  MAX_REPORT_ATTACHMENTS_TOTAL_BYTES,
} from "@/lib/reports/attachment-limits";

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

type AttachmentStatus =
  | "ready"
  | "encrypting"
  | "uploading"
  | "uploaded"
  | "error";

type AttachmentItem = {
  id: string;
  file: File;
  message?: string;
  status: AttachmentStatus;
};

export function AnonymousReportForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "attachment-error"
  >("idle");
  const [protocol, setProtocol] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] =
    useState<SubmitReportResult | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(
    null,
  );

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
      setProtocol(result.protocol);

      if (attachments.length > 0) {
        const uploaded = await uploadAttachments(result, attachments);

        if (!uploaded) {
          setSubmittedReport(result);
          setStatus("attachment-error");
          return;
        }
      }

      form.reset();
      setAttachments([]);
      setAttachmentMessage(null);
      setSubmittedReport(null);
      setProtocol(result.protocol);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    setAttachments((current) => {
      const next = [...current];
      let totalBytes = next.reduce((sum, item) => sum + item.file.size, 0);
      const rejected: string[] = [];

      for (const file of selectedFiles) {
        if (next.length >= MAX_REPORT_ATTACHMENTS) {
          rejected.push(file.name);
          continue;
        }

        if (file.size > MAX_REPORT_ATTACHMENT_SIZE_BYTES) {
          rejected.push(file.name);
          continue;
        }

        if (totalBytes + file.size > MAX_REPORT_ATTACHMENTS_TOTAL_BYTES) {
          rejected.push(file.name);
          continue;
        }

        next.push({
          id: crypto.randomUUID(),
          file,
          status: "ready",
        });
        totalBytes += file.size;
      }

      setAttachmentMessage(
        rejected.length > 0
          ? "Alguns arquivos foram ignorados por excederem os limites."
          : null,
      );

      return next;
    });
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function retryAttachment(id: string) {
    if (!submittedReport) return;

    const item = attachments.find((attachment) => attachment.id === id);

    if (!item) return;

    const uploaded = await uploadAttachment(submittedReport, item);

    if (uploaded) {
      const next = attachments.map((attachment) =>
        attachment.id === id
          ? { ...attachment, status: "uploaded" as const, message: undefined }
          : attachment,
      );

      setAttachments(next);

      if (next.every((attachment) => attachment.status === "uploaded")) {
        finishSuccessfulSubmission(submittedReport.protocol);
      }
    }
  }

  async function uploadAttachments(
    result: SubmitReportResult,
    items: AttachmentItem[],
  ) {
    const queue = [...items];
    const uploadResults: boolean[] = [];
    const workerCount = Math.min(2, queue.length);

    async function worker() {
      while (queue.length > 0) {
        const item = queue.shift();

        if (!item) continue;

        uploadResults.push(await uploadAttachment(result, item));
      }
    }

    await Promise.all(
      Array.from({ length: workerCount }, async () => {
        await worker();
      }),
    );

    return uploadResults.every(Boolean);
  }

  async function uploadAttachment(
    result: SubmitReportResult,
    item: AttachmentItem,
  ) {
    try {
      setAttachmentStatus(item.id, "encrypting");
      const encryptedAttachment = await encryptReportAttachment(item.file);

      setAttachmentStatus(item.id, "uploading");
      await uploadEncryptedReportAttachment({
        reportId: result.reportId,
        uploadToken: result.uploadToken,
        attachment: encryptedAttachment,
      });
      setAttachmentStatus(item.id, "uploaded");

      return true;
    } catch {
      setAttachmentStatus(
        item.id,
        "error",
        "Não foi possível enviar este anexo.",
      );

      return false;
    }
  }

  function setAttachmentStatus(
    id: string,
    nextStatus: AttachmentStatus,
    message?: string,
  ) {
    setAttachments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: nextStatus, message } : item,
      ),
    );
  }

  function finishSuccessfulSubmission(nextProtocol: string) {
    form.reset();
    setAttachments([]);
    setAttachmentMessage(null);
    setSubmittedReport(null);
    setProtocol(nextProtocol);
    setStatus("success");
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

        <Field>
          <FieldLabel htmlFor="report-attachments">
            Anexos, documentos ou evidências
          </FieldLabel>
          <FieldDescription>
            Até {MAX_REPORT_ATTACHMENTS} arquivos, com{" "}
            {formatAttachmentSize(MAX_REPORT_ATTACHMENT_SIZE_BYTES)} por arquivo
            e {formatAttachmentSize(MAX_REPORT_ATTACHMENTS_TOTAL_BYTES)} no
            total.
          </FieldDescription>
          <Input
            id="report-attachments"
            type="file"
            multiple
            onChange={handleAttachmentChange}
            disabled={status === "submitting" || Boolean(submittedReport)}
            autoComplete="off"
          />
          {attachmentMessage && <FieldError>{attachmentMessage}</FieldError>}
        </Field>

        {attachments.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border px-3 py-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex flex-col gap-3 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <HugeiconsIcon
                    icon={FileAttachmentIcon}
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {attachment.file.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={attachmentBadgeVariant(attachment.status)}
                      >
                        {attachmentStatusLabel(attachment.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatAttachmentSize(attachment.file.size)}
                      </span>
                    </div>
                    {attachment.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {attachment.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {attachment.status === "error" && submittedReport && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => retryAttachment(attachment.id)}
                    >
                      <HugeiconsIcon
                        icon={RefreshIcon}
                        data-icon="inline-start"
                        strokeWidth={2}
                      />
                      Tentar de novo
                    </Button>
                  )}
                  {!submittedReport && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                      disabled={status === "submitting"}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        data-icon="inline-start"
                        strokeWidth={2}
                      />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
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

        {status === "attachment-error" && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <div className="flex items-start gap-2.5">
              <HugeiconsIcon
                icon={Alert02Icon}
                className="mt-0.5 size-5 shrink-0"
                strokeWidth={2}
              />
              <div>
                <p>
                  A denúncia foi registrada, mas um ou mais anexos não foram
                  enviados.
                </p>
                {protocol && (
                  <p className="mt-1 font-mono text-xs">
                    Protocolo: {protocol}
                  </p>
                )}
              </div>
            </div>
            {protocol && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => finishSuccessfulSubmission(protocol)}
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  data-icon="inline-start"
                  strokeWidth={2}
                />
                Finalizar sem anexos pendentes
              </Button>
            )}
          </div>
        )}

        {/* ── Botão de envio ── */}
        <Button
          type="submit"
          disabled={status === "submitting" || Boolean(submittedReport)}
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

function attachmentStatusLabel(status: AttachmentStatus) {
  const labels: Record<AttachmentStatus, string> = {
    ready: "Pronto",
    encrypting: "Criptografando",
    uploading: "Enviando",
    uploaded: "Enviado",
    error: "Erro",
  };

  return labels[status];
}

function attachmentBadgeVariant(
  status: AttachmentStatus,
): "destructive" | "outline" | "secondary" {
  if (status === "error") return "destructive";
  if (status === "uploaded") return "secondary";
  return "outline";
}
