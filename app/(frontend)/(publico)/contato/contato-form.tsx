"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type ContactFormState,
  INITIAL_CONTACT_FORM_STATE,
} from "@/lib/contacts/action-state";
import { submitContactForm } from "@/lib/contacts/actions";
import {
  type ContactFormData,
  contactFormSchema,
} from "@/lib/contacts/validators";

const defaultValues: ContactFormData = {
  company: "",
  email: "",
  message: "",
  name: "",
  phone: "",
  subject: "",
  website: "",
};

export function ContatoForm() {
  const [state, setState] = useState<ContactFormState>(
    INITIAL_CONTACT_FORM_STATE,
  );
  const [isPending, startTransition] = useTransition();
  const form = useForm<ContactFormData>({
    defaultValues,
    resolver: standardSchemaResolver(contactFormSchema),
  });

  function onSubmit(values: ContactFormData) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      formData.set(key, value ?? "");
    }

    startTransition(() => {
      void submitContactForm(INITIAL_CONTACT_FORM_STATE, formData).then(
        (result) => {
          setState(result);

          if (result.errors) {
            applyServerErrors(result.errors);
          }

          if (result.success) {
            form.reset(defaultValues);
          }
        },
      );
    });
  }

  function applyServerErrors(errors: NonNullable<ContactFormState["errors"]>) {
    for (const [name, messages] of Object.entries(errors) as [
      keyof ContactFormData,
      string[] | undefined,
    ][]) {
      const message = messages?.[0];
      if (message) {
        form.setError(name, { message });
      }
    }
  }

  return (
    <form
      className="[&_[data-slot=field-label]]:text-sm [&_[data-slot=field-description]]:text-sm [&_[data-slot=field-error]]:text-sm [&_[data-slot=input]]:h-10 [&_[data-slot=input]]:text-sm [&_[data-slot=textarea]]:text-sm"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-5">
        {state.message && (
          <Alert variant={state.success ? "default" : "destructive"}>
            {state.success && <CheckCircle2 className="size-4" />}
            <AlertTitle>
              {state.success ? "Mensagem recebida" : "Envio não concluído"}
            </AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="contact-name">Nome</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="name"
                  id="contact-name"
                  placeholder="Seu nome completo"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="contact-email">E-mail</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="email"
                  id="contact-email"
                  placeholder="voce@empresa.com"
                  type="email"
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
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="contact-phone">Telefone</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="tel"
                  id="contact-phone"
                  placeholder="(00) 00000-0000"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="company"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="contact-company">Empresa</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="organization"
                  id="contact-company"
                  placeholder="Nome da empresa"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="subject"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="contact-subject">Assunto</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="contact-subject"
                placeholder="Como podemos ajudar?"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="contact-message">Mensagem</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                id="contact-message"
                placeholder="Escreva sua mensagem"
                rows={7}
              />
              <FieldDescription>
                Descreva o motivo do contato com os detalhes necessários.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div aria-hidden="true" className="hidden">
          <label htmlFor="contact-website">Website</label>
          <input
            autoComplete="off"
            id="contact-website"
            tabIndex={-1}
            type="text"
            {...form.register("website")}
          />
        </div>

        <div className="flex justify-end">
          <Button disabled={isPending} size="xl" type="submit">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando
              </>
            ) : (
              <>
                <Send className="size-4" />
                Enviar mensagem
              </>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
