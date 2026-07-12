"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Alert02Icon,
  AnonymousIcon,
  Attachment02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  FileAttachmentIcon,
  FileEditIcon,
  RefreshIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ptBR } from "date-fns/locale";
import {
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import {
  Controller,
  type FieldErrors,
  type FieldPath,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { ReportSuccessMessage } from "@/components/reports/report-success-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
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
  MAX_REPORT_ATTACHMENT_NAME_BYTES,
  MAX_REPORT_ATTACHMENT_SIZE_BYTES,
  MAX_REPORT_ATTACHMENTS,
  MAX_REPORT_ATTACHMENTS_TOTAL_BYTES,
} from "@/lib/reports/attachment-limits";
import { cn } from "@/lib/utils";

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

const CONTACT_PREFERENCE_OPTIONS = [
  {
    value: "email",
    label: "E-mail",
    placeholder: "nome@empresa.com",
  },
  {
    value: "phone",
    label: "Telefone",
    placeholder: "(00) 0000-0000",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    placeholder: "(00) 00000-0000",
  },
  {
    value: "other",
    label: "Outro",
    placeholder: "Informe o melhor canal de contato",
  },
] as const;

const FIRST_ERROR_FIELDS: FieldPath<AnonymousReportSchema>[] = [
  "identify",
  "reporterName",
  "contactPreference",
  "contactInfo",
  "category",
  "title",
  "description",
  "occurredAt",
  "location",
  "involvedPeople",
  "witnesses",
  "previousAttempts",
];

const REPORT_FIELD_FOCUS_TARGETS: Partial<
  Record<FieldPath<AnonymousReportSchema>, string>
> = {
  category: "#report-category",
  contactPreference: "#report-contact-preference",
  identify: "#identify-no",
  occurredAt: "#report-occurred-at",
};

const FIXED_NAV_SCROLL_OFFSET = 112;
const REPORT_DATE_PICKER_START_MONTH = new Date(1926, 0, 1);

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
    "idle" | "submitting" | "success" | "attachment-error"
  >("idle");
  const [protocol, setProtocol] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] =
    useState<SubmitReportResult | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(
    null,
  );
  const [isAttachmentDragActive, setIsAttachmentDragActive] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

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
  const contactPreference = form.watch("contactPreference");
  const attachmentsDisabled =
    status === "submitting" || Boolean(submittedReport);
  const attachmentTotalBytes = attachments.reduce(
    (sum, item) => sum + item.file.size,
    0,
  );

  async function onSubmit(values: AnonymousReportSchema) {
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
          toast.error(
            "A denúncia foi registrada, mas um ou mais anexos não foram enviados.",
          );
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
      setStatus("idle");
      toast.error(
        "Não foi possível enviar a denúncia. Verifique sua conexão e tente novamente.",
      );
    }
  }

  function handleInvalid(errors: FieldErrors<AnonymousReportSchema>) {
    focusFirstInvalidReportField(errors);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    addAttachments(selectedFiles);
  }

  function handleAttachmentDrag(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (attachmentsDisabled) return;

    event.dataTransfer.dropEffect = "copy";
    setIsAttachmentDragActive(true);
  }

  function handleAttachmentDragLeave(event: DragEvent<HTMLButtonElement>) {
    if (
      event.relatedTarget &&
      event.currentTarget.contains(event.relatedTarget as Node)
    ) {
      return;
    }

    setIsAttachmentDragActive(false);
  }

  function handleAttachmentDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsAttachmentDragActive(false);

    if (attachmentsDisabled) return;

    addAttachments(Array.from(event.dataTransfer.files ?? []));
  }

  function addAttachments(selectedFiles: File[]) {
    if (selectedFiles.length === 0) return;

    const next = [...attachments];
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

      if (
        new TextEncoder().encode(file.name || "arquivo").byteLength >
        MAX_REPORT_ATTACHMENT_NAME_BYTES
      ) {
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

    const nextMessage =
      rejected.length > 0
        ? "Alguns arquivos foram ignorados por excederem os limites de quantidade, tamanho ou nome."
        : null;

    setAttachments(next);
    setAttachmentMessage(nextMessage);

    if (nextMessage) {
      toast.warning(nextMessage);
    }
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
      toast.error(`Não foi possível enviar o anexo "${item.file.name}".`);

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
      onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
      autoComplete="off"
      className="[&_[data-slot=field-label]]:text-sm [&_[data-slot=field-description]]:text-sm [&_[data-slot=field-error]]:text-sm [&_[data-slot=textarea]]:text-sm [&_[data-slot=input]]:text-sm [&_[data-slot=select-trigger]]:text-sm"
    >
      <FieldGroup className="gap-5">
        <ReportFormSection
          description="Escolha como quer se apresentar ao Comitê de Ética."
          icon={AnonymousIcon}
          iconClassName={
            identify === "yes"
              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
          }
          title="Identidade do relato"
          className={cn(
            "transition-colors",
            identify === "yes"
              ? "border-sky-300 bg-sky-50/90 dark:border-sky-600 dark:bg-sky-950/30"
              : "border-emerald-300 bg-emerald-50/90 dark:border-emerald-600 dark:bg-emerald-950/30",
          )}
        >
          <Controller
            name="identify"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel className="font-semibold">
                  Deseja identificar-se?
                </FieldLabel>
                <FieldDescription className="max-w-2xl">
                  Se escolher não se identificar, seu relato será totalmente
                  anônimo e seguro. Se escolher se identificar, apenas o Comitê
                  de Ética terá acesso aos seus dados de contato.
                </FieldDescription>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);

                    if (value === "yes") {
                      if (
                        form.getValues("contactPreference") === "no_contact"
                      ) {
                        form.setValue("contactPreference", "email", {
                          shouldDirty: true,
                        });
                      }
                      return;
                    }

                    form.setValue("contactPreference", "no_contact", {
                      shouldDirty: true,
                    });
                    form.setValue("contactInfo", "");
                    form.clearErrors([
                      "reporterName",
                      "contactPreference",
                      "contactInfo",
                    ]);
                  }}
                  className="mt-2 grid gap-3 sm:grid-cols-2"
                >
                  <label
                    htmlFor="identify-no"
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border bg-background/70 p-3 text-sm transition-colors hover:bg-background",
                      field.value === "no" &&
                        "border-elinsa-sky bg-background ring-2 ring-elinsa-sky/15",
                    )}
                  >
                    <RadioGroupItem
                      value="no"
                      id="identify-no"
                      className="mt-0.5"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">Relato anônimo</span>
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        Não informe nome ou contato no envio.
                      </span>
                    </span>
                  </label>

                  <label
                    htmlFor="identify-yes"
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border bg-background/70 p-3 text-sm transition-colors hover:bg-background",
                      field.value === "yes" &&
                        "border-elinsa-sky bg-background ring-2 ring-elinsa-sky/15",
                    )}
                  >
                    <RadioGroupItem
                      value="yes"
                      id="identify-yes"
                      className="mt-0.5"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">Identificar-me</span>
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        Seus dados ficam restritos ao Comitê.
                      </span>
                    </span>
                  </label>
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {identify === "yes" && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <Separator />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                  name="contactPreference"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="report-contact-preference">
                        Canal preferido *
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="report-contact-preference"
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {CONTACT_PREFERENCE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Usado apenas se o Comitê precisar retornar sobre o
                        relato.
                      </FieldDescription>
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
                    <Field
                      className="sm:col-span-2"
                      data-invalid={fieldState.invalid || undefined}
                    >
                      <FieldLabel htmlFor="report-contact-info">
                        Contato para retorno *
                      </FieldLabel>
                      <Input
                        {...field}
                        id="report-contact-info"
                        type={getContactInputType(contactPreference)}
                        inputMode={getContactInputMode(contactPreference)}
                        placeholder={getContactPlaceholder(contactPreference)}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      <FieldDescription>
                        Esses dados ficam restritos ao Comitê de Ética.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          )}
        </ReportFormSection>

        <ReportFormSection
          description="Resumo, categoria e descrição principal do ocorrido."
          icon={FileEditIcon}
          title="Relato"
        >
          <div className="grid gap-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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
                      <SelectGroup>
                        {REPORT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Escolha o tema que melhor descreve o relato.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                  <FieldDescription>
                    Use um resumo objetivo, sem incluir seu nome se quiser
                    manter o anonimato.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="report-description">
                  Descrição *
                </FieldLabel>
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
                  Inclua o que aconteceu, quando, onde e quem pode ajudar a
                  esclarecer os fatos.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </ReportFormSection>

        <ReportFormSection
          description="Data, local, pessoas envolvidas e qualquer tentativa anterior."
          icon={Calendar03Icon}
          title="Contexto"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="occurredAt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="report-occurred-at">
                    Quando ocorreu
                  </FieldLabel>
                  <ReportDatePicker
                    id="report-occurred-at"
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
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
                  <FieldLabel htmlFor="report-location">
                    Onde ocorreu
                  </FieldLabel>
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

          <div className="grid gap-5 sm:grid-cols-2">
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="witnesses"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="report-witnesses">
                    Testemunhas
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="report-witnesses"
                    rows={3}
                    placeholder="Houve outras pessoas que presenciaram a situação?"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    className="resize-y"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </ReportFormSection>

        <ReportFormSection
          description={`Até ${MAX_REPORT_ATTACHMENTS} arquivos, com ${formatAttachmentSize(MAX_REPORT_ATTACHMENT_SIZE_BYTES)} por arquivo e ${formatAttachmentSize(MAX_REPORT_ATTACHMENTS_TOTAL_BYTES)} no total.`}
          icon={Attachment02Icon}
          title="Anexos, documentos ou evidências"
        >
          <Field
            data-disabled={attachmentsDisabled || undefined}
            data-invalid={Boolean(attachmentMessage) || undefined}
          >
            <FieldLabel htmlFor="report-attachments">
              Arquivos complementares
            </FieldLabel>
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              onDragEnter={handleAttachmentDrag}
              onDragOver={handleAttachmentDrag}
              onDragLeave={handleAttachmentDragLeave}
              onDrop={handleAttachmentDrop}
              disabled={attachmentsDisabled}
              aria-describedby="report-attachments-description"
              className={cn(
                "group flex min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
                isAttachmentDragActive && "border-primary bg-primary/5",
              )}
            >
              <span className="flex size-12 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
                <HugeiconsIcon
                  icon={Upload04Icon}
                  className="size-6"
                  strokeWidth={2}
                />
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Arraste e solte ou escolha arquivos
                </span>
                <span
                  id="report-attachments-description"
                  className="text-xs text-muted-foreground"
                >
                  Máx. {MAX_REPORT_ATTACHMENTS} arquivos · até{" "}
                  {formatAttachmentSize(MAX_REPORT_ATTACHMENT_SIZE_BYTES)} cada
                </span>
              </span>
              {attachments.length > 0 && (
                <Badge variant="outline">
                  {attachments.length}/{MAX_REPORT_ATTACHMENTS} arquivos ·{" "}
                  {formatAttachmentSize(attachmentTotalBytes)}
                </Badge>
              )}
            </button>
            <Input
              ref={attachmentInputRef}
              id="report-attachments"
              type="file"
              multiple
              className="hidden"
              onChange={handleAttachmentChange}
              disabled={attachmentsDisabled}
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
            />
            {attachmentMessage && <FieldError>{attachmentMessage}</FieldError>}
          </Field>

          {attachments.length > 0 && (
            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <p className="text-sm font-medium">Arquivos selecionados</p>
                <Badge variant="secondary">
                  {formatAttachmentSize(attachmentTotalBytes)}
                </Badge>
              </div>
              <Separator />
              <div className="flex flex-col">
                {attachments.map((attachment, index) => (
                  <div key={attachment.id}>
                    <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
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
                              variant={attachmentBadgeVariant(
                                attachment.status,
                              )}
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
                    {index < attachments.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "attachment-error" && (
            <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-2">
                <HugeiconsIcon
                  icon={Alert02Icon}
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  strokeWidth={2}
                />
                <div className="min-w-0">
                  <p className="font-medium">Anexos pendentes</p>
                  {protocol && (
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
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
        </ReportFormSection>

        {/* ── Botão de envio ── */}
        <Button
          type="submit"
          disabled={status === "submitting" || Boolean(submittedReport)}
          className="w-full"
          size="lg"
        >
          {status === "submitting" ? (
            <>
              <Spinner data-icon="inline-start" />
              Enviando denúncia
            </>
          ) : (
            <>Enviar denúncia</>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

function ReportDatePicker({
  id,
  invalid,
  onBlur,
  onChange,
  value,
}: {
  id: string;
  invalid?: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseReportDateValue(value);
  const selectedDateLabel = selectedDate
    ? formatReportDateLabel(selectedDate)
    : null;
  const today = getTodayEnd();
  const endMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          data-empty={!selectedDate}
          aria-invalid={invalid}
          aria-label={
            selectedDateLabel
              ? `Quando ocorreu: ${selectedDateLabel}`
              : "Selecionar data do ocorrido"
          }
          onBlur={onBlur}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            invalid &&
              "border-destructive ring-2 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
          )}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            data-icon="inline-start"
            strokeWidth={2}
          />
          {selectedDateLabel ?? <span>Selecionar data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onChange(date ? formatReportDateValue(date) : "");
            setOpen(false);
          }}
          defaultMonth={selectedDate ?? today}
          captionLayout="dropdown"
          locale={ptBR}
          startMonth={REPORT_DATE_PICKER_START_MONTH}
          endMonth={endMonth}
          disabled={(date) => date > today}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function ReportFormSection({
  children,
  className,
  description,
  icon,
  iconClassName,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  iconClassName?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border bg-card p-5 shadow-sm transition-shadow sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
            iconClassName,
          )}
        >
          <HugeiconsIcon icon={icon} className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <FieldGroup className="gap-5">{children}</FieldGroup>
    </section>
  );
}

function parseReportDateValue(value?: string) {
  if (!value) return undefined;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return undefined;

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    return undefined;
  }

  return parsedDate;
}

function formatReportDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatReportDateLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTodayEnd() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return today;
}

function focusFirstInvalidReportField(
  errors: FieldErrors<AnonymousReportSchema>,
) {
  const errorRecord = errors as Partial<
    Record<FieldPath<AnonymousReportSchema>, unknown>
  >;
  const firstErrorField = FIRST_ERROR_FIELDS.find((field) =>
    Boolean(errorRecord[field]),
  );

  if (!firstErrorField) return;

  const selector =
    REPORT_FIELD_FOCUS_TARGETS[firstErrorField] ??
    `[name="${firstErrorField}"]`;
  const target = document.querySelector<HTMLElement>(selector);

  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.scrollTo({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    top:
      target.getBoundingClientRect().top +
      window.scrollY -
      FIXED_NAV_SCROLL_OFFSET,
  });

  window.setTimeout(
    () => {
      target.focus({ preventScroll: true });
    },
    prefersReducedMotion ? 0 : 250,
  );
}

function getContactPlaceholder(
  value: AnonymousReportSchema["contactPreference"],
) {
  return (
    CONTACT_PREFERENCE_OPTIONS.find((option) => option.value === value)
      ?.placeholder ?? "Informe o melhor canal de contato"
  );
}

function getContactInputType(
  value: AnonymousReportSchema["contactPreference"],
) {
  return value === "email" ? "email" : "text";
}

function getContactInputMode(
  value: AnonymousReportSchema["contactPreference"],
): "email" | "tel" | "text" {
  if (value === "email") return "email";
  if (value === "phone" || value === "whatsapp") return "tel";
  return "text";
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
