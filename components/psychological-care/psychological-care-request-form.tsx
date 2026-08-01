"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Alert02Icon,
  Contact01Icon,
  FileEditIcon,
  Location01Icon,
  Sent02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ComponentProps,
  type FormEvent,
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
import type { z } from "zod/v4";
import { PsychologicalCareSuccessMessage } from "@/components/psychological-care/psychological-care-success-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicPsychologicalCareRequestAction } from "@/lib/psychological-care/public-actions";
import {
  type PsychologicalCareRequestFormField,
  type PublicPsychologicalCareRequestFormInput,
  publicPsychologicalCareRequestFormSchema,
} from "@/lib/psychological-care/validation";

type PsychologicalCareRequestFormValues = z.input<
  typeof publicPsychologicalCareRequestFormSchema
>;

type PsychologicalCareFormError = {
  message: string;
  title: string;
};

const DEFAULT_FORM_VALUES: PsychologicalCareRequestFormValues = {
  submissionId: "",
  base: "",
  city: "",
  employeeName: "",
  phone: "",
  registration: "",
  jobTitle: "",
  management: "",
  reason: "",
  website: "",
};

const VISIBLE_FIELD_ORDER: FieldPath<PsychologicalCareRequestFormValues>[] = [
  "employeeName",
  "phone",
  "registration",
  "jobTitle",
  "base",
  "city",
  "management",
  "reason",
];

const FIXED_NAV_SCROLL_OFFSET = 112;

export function PsychologicalCareRequestForm() {
  const [submissionError, setSubmissionError] =
    useState<PsychologicalCareFormError | null>(null);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(
    null,
  );
  const submissionIdRef = useRef<string | null>(null);
  const submissionLockRef = useRef(false);

  const form = useForm<
    PsychologicalCareRequestFormValues,
    unknown,
    PublicPsychologicalCareRequestFormInput
  >({
    defaultValues: DEFAULT_FORM_VALUES,
    resolver: standardSchemaResolver(publicPsychologicalCareRequestFormSchema),
    shouldFocusError: false,
  });

  const isSubmitting = form.formState.isSubmitting;

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionLockRef.current) return;

    const submissionId =
      submissionIdRef.current ?? globalThis.crypto.randomUUID();
    submissionIdRef.current = submissionId;
    form.setValue("submissionId", submissionId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    submissionLockRef.current = true;

    try {
      await form.handleSubmit(
        handleValidSubmission,
        handleInvalidSubmission,
      )(event);
    } finally {
      submissionLockRef.current = false;
    }
  }

  async function handleValidSubmission(
    values: PublicPsychologicalCareRequestFormInput,
  ) {
    setSubmissionError(null);

    try {
      const result = await submitPublicPsychologicalCareRequestAction(values);

      if (!result.success) {
        setSubmissionError({
          message: result.message,
          title: result.fieldErrors
            ? "Revise o formulário"
            : "Não foi possível enviar",
        });
        applyServerFieldErrors(result.fieldErrors);
        return;
      }

      form.reset(DEFAULT_FORM_VALUES);
      submissionIdRef.current = null;
      setSubmittedProtocol(result.protocol);
    } catch {
      setSubmissionError({
        message:
          "Não foi possível enviar agora. Verifique sua conexão e tente novamente.",
        title: "Não foi possível enviar",
      });
    }
  }

  function applyServerFieldErrors(
    fieldErrors?: Partial<Record<PsychologicalCareRequestFormField, string[]>>,
  ) {
    if (!fieldErrors) return;

    for (const field of Object.keys(
      fieldErrors,
    ) as PsychologicalCareRequestFormField[]) {
      const message = fieldErrors[field]?.[0];

      if (message) {
        form.setError(field, { message, type: "server" });
      }
    }

    window.requestAnimationFrame(() => {
      focusFirstInvalidField(fieldErrors);
    });
  }

  function handleInvalidSubmission(
    errors: FieldErrors<PsychologicalCareRequestFormValues>,
  ) {
    setSubmissionError({
      message: "Revise os campos destacados.",
      title: "Revise o formulário",
    });
    focusFirstInvalidField(errors);
  }

  function handleClear() {
    form.reset(DEFAULT_FORM_VALUES);
    submissionIdRef.current = null;
    setSubmissionError(null);

    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLInputElement>('[name="employeeName"]')
        ?.focus();
    });
  }

  function handleNewSubmission() {
    setSubmittedProtocol(null);
    setSubmissionError(null);

    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLInputElement>('[name="employeeName"]')
        ?.focus();
    });
  }

  if (submittedProtocol) {
    return (
      <PsychologicalCareSuccessMessage
        onReset={handleNewSubmission}
        protocol={submittedProtocol}
      />
    );
  }

  return (
    <form
      aria-busy={isSubmitting}
      aria-label="Solicitação de atendimento psicológico"
      autoComplete="off"
      className="[&_[data-slot=field-label]]:text-sm [&_[data-slot=field-error]]:text-sm [&_[data-slot=textarea]]:text-sm [&_[data-slot=input]]:text-sm"
      noValidate
      onSubmit={handleFormSubmit}
    >
      {submissionError && (
        <Alert className="mb-5" variant="destructive">
          <HugeiconsIcon
            aria-hidden="true"
            icon={Alert02Icon}
            strokeWidth={2}
          />
          <AlertTitle>{submissionError.title}</AlertTitle>
          <AlertDescription>{submissionError.message}</AlertDescription>
        </Alert>
      )}

      <p className="mb-3 text-sm text-muted-foreground">
        Campos marcados com * são obrigatórios.
      </p>

      <FieldGroup className="gap-5">
        <PsychologicalCareFormSection
          icon={Contact01Icon}
          title="Quem precisa de apoio"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="employeeName"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-employee-name">
                    Nome completo <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-employee-name"
                    maxLength={200}
                    placeholder="Nome completo"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-phone">
                    Telefone ou WhatsApp <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-phone"
                    inputMode="tel"
                    onChange={(event) => {
                      field.onChange(
                        formatBrazilianPhoneInput(event.target.value),
                      );
                    }}
                    placeholder="(00) 00000-0000"
                    required
                    type="tel"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="registration"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-registration">
                    Matrícula <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-registration"
                    maxLength={80}
                    placeholder="Número da matrícula"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="jobTitle"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-job-title">
                    Função <span className="font-normal">(opcional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-job-title"
                    maxLength={160}
                    placeholder="Ex.: Eletricista"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </PsychologicalCareFormSection>

        <PsychologicalCareFormSection icon={Location01Icon} title="Lotação">
          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="base"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-base">
                    Base <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-base"
                    maxLength={120}
                    placeholder="Ex.: Base São Luís"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-city">
                    Cidade <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-city"
                    maxLength={120}
                    placeholder="Ex.: São Luís"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="management"
              render={({ field, fieldState }) => (
                <Field
                  className="sm:col-span-2"
                  data-disabled={isSubmitting || undefined}
                  data-invalid={fieldState.invalid || undefined}
                >
                  <FieldLabel htmlFor="psychological-care-management">
                    Gerência <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    id="psychological-care-management"
                    maxLength={160}
                    placeholder="Nome da gerência"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </PsychologicalCareFormSection>

        <PsychologicalCareFormSection icon={FileEditIcon} title="Solicitação">
          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field
                data-disabled={isSubmitting || undefined}
                data-invalid={fieldState.invalid || undefined}
              >
                <FieldLabel htmlFor="psychological-care-reason">
                  Motivo da solicitação <span aria-hidden="true">*</span>
                </FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="min-h-36 resize-y"
                  disabled={isSubmitting}
                  id="psychological-care-reason"
                  maxLength={5000}
                  placeholder="Conte brevemente o que motivou esta solicitação."
                  required
                  rows={7}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </PsychologicalCareFormSection>

        <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
          <Button
            disabled={isSubmitting}
            onClick={handleClear}
            size="lg"
            type="button"
            variant="outline"
          >
            Limpar formulário
          </Button>
          <Button
            className="w-full"
            disabled={isSubmitting}
            size="lg"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Enviando…
              </>
            ) : (
              <>
                <HugeiconsIcon
                  data-icon="inline-start"
                  icon={Sent02Icon}
                  strokeWidth={2}
                />
                Enviar solicitação
              </>
            )}
          </Button>
        </div>
      </FieldGroup>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="psychological-care-website">Website</label>
        <input
          autoComplete="off"
          id="psychological-care-website"
          tabIndex={-1}
          type="text"
          {...form.register("website")}
        />
      </div>
    </form>
  );
}

function PsychologicalCareFormSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  title: string;
}) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <HugeiconsIcon
            aria-hidden="true"
            className="size-5"
            icon={icon}
            strokeWidth={2}
          />
        </span>
        <h2 className="text-base leading-tight font-semibold">{title}</h2>
      </div>
      <FieldGroup className="gap-5">{children}</FieldGroup>
    </section>
  );
}

function formatBrazilianPhoneInput(value: string) {
  const rawDigits = value.replace(/\D/g, "");
  const withoutCountryCode =
    (value.trimStart().startsWith("+55") || rawDigits.length > 11) &&
    rawDigits.startsWith("55")
      ? rawDigits.slice(2)
      : rawDigits;
  const digits = withoutCountryCode.slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const localNumber = digits.slice(2);

  if (localNumber.length <= 4) {
    return `(${ddd}) ${localNumber}`;
  }

  if (digits.length <= 10) {
    return `(${ddd}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
  }

  return `(${ddd}) ${localNumber.slice(0, 5)}-${localNumber.slice(5)}`;
}

function focusFirstInvalidField(
  errors: Partial<
    Record<FieldPath<PsychologicalCareRequestFormValues>, unknown>
  >,
) {
  const firstField = VISIBLE_FIELD_ORDER.find((field) =>
    Boolean(errors[field]),
  );

  if (!firstField) return;

  const target = document.querySelector<HTMLElement>(`[name="${firstField}"]`);

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
    () => target.focus({ preventScroll: true }),
    prefersReducedMotion ? 0 : 250,
  );
}
