"use client";

import {
  AlertCircle,
  Check,
  CirclePlay,
  Copy,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMAIL_DOMAIN = "@grupoamperelinsa.com";
const SIGNATURE_LOGO_PATH = "/kit-de-marca/png/logo-colorido.png";
const SIGNATURE_LOGO_WIDTH = 140;
const SIGNATURE_HORIZONTAL_GAP = 24;
const SIGNATURE_VERTICAL_GAP = 12;
const SIGNATURE_CARD_WIDTH = 640;
const SIGNATURE_CARD_MIN_HEIGHT = 132;
const SIGNATURE_CONTENT_CELL_PADDING = `${SIGNATURE_VERTICAL_GAP}px 30px ${SIGNATURE_VERTICAL_GAP}px 0`;
const SIGNATURE_SEPARATOR_HEIGHT = 96;
const SIGNATURE_SEPARATOR_PADDING = "18px 0";
const SIGNATURE_TO_LINKS_MARGIN = 12;

type PhoneDdi = "+34" | "+55";

type PhoneValue = {
  ddi: PhoneDdi;
  numero: string;
};

type SignatureValues = {
  cargo: string;
  email: string;
  local: string;
  nome: string;
  telefone: PhoneValue;
  telefone2: PhoneValue;
};

type FormErrors = Partial<Record<keyof SignatureValues, string>>;

type Recommendation = {
  field: "cargo" | "nome";
  label: string;
  suggestion: string;
};

const CONNECTORS = new Set(["de", "da", "do", "dos", "das", "e"]);
const CARGO_ABBREVIATIONS: Record<string, string> = {
  junior: "Jr.",
  júnior: "Jr.",
  pleno: "Pl.",
  senior: "Sr.",
  sênior: "Sr.",
};

const SOCIAL_LINKS_HTML = `<strong>Elinsa do Brasil:</strong> <a href="https://www.instagram.com/elinsadobrasil/">Instagram</a> &bull; <a href="https://www.linkedin.com/in/elinsadobrasil/">LinkedIn</a> &bull; <a href="https://elinsa.es/">Site</a><br />
<strong>Grupo Amper:</strong> <a href="https://www.linkedin.com/company/amper-sa/">LinkedIn</a> &bull; <a href="https://www.grupoamper.com/">Site</a>`;

const TUTORIAL_URL = "https://www.youtube.com/watch?v=cPnVJZ6l1TQ";

export function EmailSignatureGenerator() {
  const [values, setValues] = useState<SignatureValues>(() => ({
    cargo: "",
    email: "",
    local: "",
    nome: "",
    telefone: { ddi: "+55", numero: "" },
    telefone2: { ddi: "+55", numero: "" },
  }));
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignatureValues, boolean>>
  >({});
  const [copyState, setCopyState] = useState<"copied" | "error" | "idle">(
    "idle",
  );
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(
      "dismiss-elinsa-signature-tutorial-warning",
    );
    setShowWarning(saved !== "true");
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    localStorage.setItem("dismiss-elinsa-signature-tutorial-warning", "true");
  };

  const previewValues = useMemo(() => getPreviewValues(values), [values]);
  const errors = useMemo(() => validateValues(values), [values]);

  const displayErrors = useMemo(() => {
    const result: FormErrors = {};
    for (const key of Object.keys(errors) as Array<keyof SignatureValues>) {
      if (touched[key]) {
        result[key] = errors[key];
      }
    }
    return result;
  }, [errors, touched]);

  const recommendations = useMemo(
    () => getRecommendations(values.nome, values.cargo),
    [values.nome, values.cargo],
  );

  function handleBlur(field: keyof SignatureValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function updateField<K extends keyof SignatureValues>(
    field: K,
    value: SignatureValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setCopyState("idle");
  }

  async function handleCopy() {
    const nextErrors = validateValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setTouched({
        cargo: true,
        email: true,
        nome: true,
        telefone: true,
        telefone2: true,
      });
      setCopyState("error");
      return;
    }

    const html = buildSignatureHtml(
      values,
      new URL(SIGNATURE_LOGO_PATH, window.location.origin).toString(),
    );
    const plainText = buildSignaturePlainText(values);

    try {
      await copyRichSignature(html, plainText);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)]">
      <div className="min-w-0">
        {showWarning && (
          <div className="relative mb-6 flex items-start gap-4 rounded-md border border-elinsa-primary/20 bg-elinsa-light py-4 pr-12 pl-5 shadow-sm transition-all dark:border-elinsa-primary/30 dark:bg-elinsa-primary/10">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-elinsa-primary dark:text-elinsa-sky" />
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm leading-snug font-bold text-elinsa-dark dark:text-elinsa-light">
                  O processo de configuração mudou!
                </p>
                <p className="text-xs leading-relaxed text-elinsa-dark/95 dark:text-elinsa-light/80">
                  A forma anterior de criar e colar a assinatura foi
                  substituída. Siga o tutorial para garantir que ela seja
                  exibida corretamente.
                </p>
              </div>
              <Button
                asChild
                className="h-8 w-fit rounded-md bg-elinsa-primary px-4 text-xs font-medium text-white shadow-sm transition-all hover:bg-elinsa-primary/90 dark:bg-elinsa-sky dark:text-neutral-950 dark:hover:bg-elinsa-sky/90"
              >
                <a
                  href={TUTORIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Veja o tutorial
                  <CirclePlay className="size-3.5" />
                </a>
              </Button>
            </div>
            <button
              onClick={dismissWarning}
              className="absolute top-3.5 right-3.5 rounded-full p-1 text-elinsa-dark/40 transition-colors hover:bg-elinsa-dark/10 hover:text-elinsa-dark dark:text-elinsa-light/40 dark:hover:bg-elinsa-light/10 dark:hover:text-elinsa-light"
              aria-label="Dispensar aviso"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <Card className="rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b py-4">
            <CardTitle>Dados da assinatura</CardTitle>
            <CardDescription>Informe os dados da assinatura.</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <FieldGroup>
              <Field data-invalid={!!displayErrors.nome}>
                <FieldLabel htmlFor="signature-name">Nome completo</FieldLabel>
                <Input
                  aria-invalid={!!displayErrors.nome}
                  id="signature-name"
                  onBlur={() => handleBlur("nome")}
                  onChange={(event) => updateField("nome", event.target.value)}
                  placeholder="Fulano de Tal"
                  value={values.nome}
                />
                <FieldError>{displayErrors.nome}</FieldError>
              </Field>

              <Field data-invalid={!!displayErrors.cargo}>
                <FieldLabel htmlFor="signature-role">Cargo</FieldLabel>
                <Input
                  aria-invalid={!!displayErrors.cargo}
                  id="signature-role"
                  onBlur={() => handleBlur("cargo")}
                  onChange={(event) => updateField("cargo", event.target.value)}
                  placeholder="Auxiliar administrativo"
                  value={values.cargo}
                />
                <FieldError>{displayErrors.cargo}</FieldError>
              </Field>

              <Field data-invalid={!!displayErrors.email}>
                <FieldLabel htmlFor="signature-email">E-mail</FieldLabel>
                <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    aria-invalid={!!displayErrors.email}
                    autoComplete="off"
                    className="rounded-r-none border-r-0"
                    id="signature-email"
                    onBlur={() => handleBlur("email")}
                    onChange={(event) =>
                      updateField(
                        "email",
                        normalizeEmailUsername(event.target.value),
                      )
                    }
                    placeholder="nome.sobrenome"
                    value={values.email}
                  />
                  <span className="inline-flex h-7 items-center rounded-r-md border border-input border-l-0 bg-muted/45 px-2 text-xs text-muted-foreground">
                    {EMAIL_DOMAIN}
                  </span>
                </div>
                <FieldError>{displayErrors.email}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="signature-location">
                  Local de atuação{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </FieldLabel>
                <Input
                  id="signature-location"
                  onChange={(event) => updateField("local", event.target.value)}
                  placeholder="Base de Paragominas"
                  value={values.local}
                />
                <FieldDescription>
                  Use quando o cargo precisar indicar base, regional ou área.
                </FieldDescription>
              </Field>

              <PhoneField
                description="Se não informar um celular, a linha de telefone não será exibida na assinatura."
                error={displayErrors.telefone}
                id="signature-phone"
                label="Telefone"
                onBlur={() => handleBlur("telefone")}
                onChange={(phone) => updateField("telefone", phone)}
                value={values.telefone}
              />
              <PhoneField
                description="Use apenas quando houver outro número; se ficar em branco, ele não aparece."
                error={displayErrors.telefone2}
                id="signature-phone-secondary"
                label="Segundo telefone"
                onBlur={() => handleBlur("telefone2")}
                onChange={(phone) => updateField("telefone2", phone)}
                value={values.telefone2}
              />

              <Button
                className="mt-1 h-8 w-full"
                onClick={handleCopy}
                type="button"
              >
                {copyState === "copied" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copyState === "copied"
                  ? "Assinatura copiada"
                  : "Copiar assinatura"}
              </Button>

              {copyState === "error" && (
                <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs/relaxed text-destructive">
                  Revise os campos obrigatórios antes de copiar.
                </p>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Preview</h2>
          <p className="text-xs text-muted-foreground">
            Veja como a assinatura ficará no e-mail conforme os dados
            informados.
          </p>
        </div>

        <div className="overflow-x-auto rounded-md border bg-white p-4 shadow-sm">
          <div
            className="w-max max-w-none"
            style={{
              fontFamily: "Aptos, Arial, sans-serif",
            }}
          >
            <p className="mb-1.5 text-base font-bold text-neutral-950">
              Atenciosamente,
            </p>
            <SignatureCardPreview values={previewValues} />
            <SocialLinksPreview />
          </div>
        </div>

        <Card className="rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2">
              <WandSparkles className="size-4 text-elinsa-primary" />
              Recomendações
            </CardTitle>
            <CardDescription>
              Sugestões rápidas para manter o texto legível na assinatura.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma recomendação no momento.
              </p>
            ) : (
              <div className="grid gap-3">
                {recommendations.map((recommendation) => (
                  <div
                    className="flex items-start justify-between gap-3 rounded-md border bg-elinsa-sky/10 p-3"
                    key={`${recommendation.field}-${recommendation.suggestion}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {recommendation.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recommendation.suggestion}
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      onClick={() =>
                        updateField(
                          recommendation.field,
                          recommendation.suggestion,
                        )
                      }
                      size="sm"
                      type="button"
                    >
                      Aplicar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SignatureCardPreview({ values }: { values: SignatureValues }) {
  const content = getSignatureContent(values);

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      className="rounded-[10px] bg-white"
      style={{
        borderCollapse: "separate",
        borderSpacing: 0,
        minHeight: SIGNATURE_CARD_MIN_HEIGHT,
        width: SIGNATURE_CARD_WIDTH,
      }}
    >
      <tbody>
        <tr>
          <td style={{ width: SIGNATURE_HORIZONTAL_GAP }}>&nbsp;</td>
          <td
            className="align-middle"
            style={{
              padding: `${SIGNATURE_VERTICAL_GAP}px 0`,
              width: SIGNATURE_LOGO_WIDTH,
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: preview mirrors e-mail HTML, where a plain img is required. */}
            <img
              alt="Elinsa do Brasil Ampergroup"
              src={SIGNATURE_LOGO_PATH}
              style={{
                border: 0,
                display: "block",
                height: "auto",
                maxWidth: SIGNATURE_LOGO_WIDTH,
                outline: "none",
                textDecoration: "none",
                width: SIGNATURE_LOGO_WIDTH,
              }}
              width={SIGNATURE_LOGO_WIDTH}
            />
          </td>
          <td style={{ width: SIGNATURE_HORIZONTAL_GAP }}>&nbsp;</td>
          <td
            style={{
              fontSize: 1,
              lineHeight: 1,
              padding: SIGNATURE_SEPARATOR_PADDING,
              width: 1,
            }}
          >
            <SeparatorLine />
          </td>
          <td style={{ width: SIGNATURE_HORIZONTAL_GAP }}>&nbsp;</td>
          <td
            className="align-middle"
            style={{
              color: "#333333",
              fontFamily: "Aptos, Arial, sans-serif",
              fontSize: 14,
              lineHeight: 1.45,
              padding: SIGNATURE_CONTENT_CELL_PADDING,
            }}
          >
            <div
              style={{
                color: "#111111",
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.15,
                margin: "0 0 2px 0",
              }}
            >
              {values.nome}
            </div>
            <div style={{ color: "#444444", margin: 0 }}>{values.cargo}</div>
            <div style={{ color: "#444444", margin: 0 }}>
              {content.locationLine}
            </div>
            {content.phoneLine && (
              <div style={{ color: "#444444", margin: 0 }}>
                {content.phoneLine}
              </div>
            )}
            <div style={{ color: "#444444", margin: 0 }}>{content.email}</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function SocialLinksPreview() {
  return (
    <div className="mt-3 text-base leading-tight text-neutral-950 [&_a]:text-blue-700 [&_a]:underline">
      <strong>Elinsa do Brasil:</strong>{" "}
      <a href="https://www.instagram.com/elinsadobrasil/">Instagram</a> •{" "}
      <a href="https://www.linkedin.com/in/elinsadobrasil/">LinkedIn</a> •{" "}
      <a href="https://elinsa.es/">Site</a>
      <br />
      <strong>Grupo Amper:</strong>{" "}
      <a href="https://www.linkedin.com/company/amper-sa/">LinkedIn</a> •{" "}
      <a href="https://www.grupoamper.com/">Site</a>
    </div>
  );
}

function SeparatorLine() {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{
        borderCollapse: "collapse",
        borderSpacing: 0,
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              background: "#222222",
              fontSize: 0,
              height: SIGNATURE_SEPARATOR_HEIGHT,
              lineHeight: 0,
              width: 1,
            }}
          >
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function PhoneField({
  description,
  error,
  id,
  label,
  onBlur,
  onChange,
  value,
}: {
  description?: string;
  error?: string;
  id: string;
  label: string;
  onBlur?: () => void;
  onChange: (value: PhoneValue) => void;
  value: PhoneValue;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>
        {label}{" "}
        <span className="font-normal text-muted-foreground">(opcional)</span>
      </FieldLabel>
      <div className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-2">
        <Select
          onValueChange={(ddi) =>
            onChange({ ddi: ddi as PhoneDdi, numero: "" })
          }
          value={value.ddi}
        >
          <SelectTrigger
            aria-label={`DDI do ${label.toLocaleLowerCase("pt-BR")}`}
            className="w-full"
            id={`${id}-ddi`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+55">BR +55</SelectItem>
            <SelectItem value="+34">ES +34</SelectItem>
          </SelectContent>
        </Select>
        <Input
          aria-invalid={!!error}
          id={id}
          onBlur={onBlur}
          onChange={(event) =>
            onChange({
              ddi: value.ddi,
              numero: applyMask(value.ddi, event.target.value),
            })
          }
          placeholder={value.ddi === "+55" ? "(91) 9 0000-0000" : "000 000 000"}
          value={value.numero}
        />
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function validateValues(values: SignatureValues): FormErrors {
  const errors: FormErrors = {};

  if (values.nome.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.nome = "Informe nome e sobrenome.";
  }

  if (!values.cargo.trim()) {
    errors.cargo = "Cargo é obrigatório.";
  }

  if (!/^[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Informe apenas o usuário do e-mail, sem @.";
  }

  const phoneError = validatePhone(values.telefone);
  const secondPhoneError = validatePhone(values.telefone2);

  if (phoneError) errors.telefone = phoneError;
  if (secondPhoneError) errors.telefone2 = secondPhoneError;

  return errors;
}

function validatePhone(phone: PhoneValue) {
  if (!phone.numero) return "";

  if (phone.ddi === "+55") {
    return /^\(\d{2}\) \d \d{4}-\d{4}$/.test(phone.numero)
      ? ""
      : "Número incompleto.";
  }

  return /^\d{3} \d{3} \d{3}$/.test(phone.numero) ? "" : "Número incompleto.";
}

function getPreviewValues(values: SignatureValues): SignatureValues {
  return {
    cargo: values.cargo.trim() || "Cargo",
    email: values.email.trim() || "alguem",
    local: values.local.trim(),
    nome: values.nome.trim() || "Nome completo",
    telefone: {
      ddi: values.telefone.ddi,
      numero: values.telefone.numero,
    },
    telefone2: values.telefone2,
  };
}

function getRecommendations(nome: string, cargo: string): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const abbreviatedName = abbreviateMiddleNames(nome);
  const abbreviatedRole = abbreviateCargo(cargo);

  if (abbreviatedName && abbreviatedName !== nome.trim()) {
    recommendations.push({
      field: "nome",
      label: "Abrevie os nomes do meio",
      suggestion: abbreviatedName,
    });
  }

  if (abbreviatedRole && abbreviatedRole !== cargo.trim()) {
    recommendations.push({
      field: "cargo",
      label: "Abrevie o nível do seu cargo",
      suggestion: abbreviatedRole,
    });
  }

  return recommendations;
}

function abbreviateMiddleNames(nome: string) {
  const words = nome.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return "";

  return words
    .map((word, index) => {
      if (index === 0 || index === words.length - 1) return word;
      if (CONNECTORS.has(word.toLocaleLowerCase("pt-BR"))) return null;
      if (/^[A-Za-zÀ-ÖØ-öø-ÿ]\.$/.test(word)) return word;
      return `${word[0].toLocaleUpperCase("pt-BR")}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function abbreviateCargo(cargo: string) {
  const words = cargo.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  return words
    .map((word) => CARGO_ABBREVIATIONS[word.toLocaleLowerCase("pt-BR")] ?? word)
    .join(" ");
}

function maskBR(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  let masked = "";

  if (digits.length > 0) masked += `(${digits.slice(0, 2)}`;
  if (digits.length > 2) masked += `) ${digits.slice(2, 3)}`;
  if (digits.length > 3) masked += ` ${digits.slice(3, 7)}`;
  if (digits.length > 7) masked += `-${digits.slice(7, 11)}`;

  return masked;
}

function maskES(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;

  const parts = [digits.slice(0, 3), digits.slice(3, 6)];
  if (digits.length > 6) parts.push(digits.slice(6, 9));

  return parts.filter(Boolean).join(" ");
}

function applyMask(ddi: PhoneDdi, value: string) {
  return ddi === "+55" ? maskBR(value) : maskES(value);
}

function normalizeEmailUsername(value: string) {
  const trimmedValue = value.trim();
  const withoutKnownDomain = trimmedValue
    .toLocaleLowerCase("en-US")
    .endsWith(EMAIL_DOMAIN)
    ? trimmedValue.slice(0, -EMAIL_DOMAIN.length)
    : trimmedValue;

  return withoutKnownDomain.replace(/@.*$/, "");
}

function getSignatureContent(values: SignatureValues) {
  const phoneLine = [values.telefone, values.telefone2]
    .filter((phone) => phone.numero)
    .map((phone) => `${phone.ddi} ${phone.numero}`)
    .join(" | ");
  const locationLine = values.local
    ? `Elinsa do Brasil | ${values.local}`
    : "Elinsa do Brasil";

  return {
    email: `${values.email}${EMAIL_DOMAIN}`,
    locationLine,
    phoneLine,
  };
}

function buildSignatureHtml(values: SignatureValues, logoUrl: string) {
  const content = getSignatureContent(values);

  return `<div style="font-family:Aptos,Arial,sans-serif;font-size:16px;line-height:1.35;">
<p style="margin:0 0 6px 0;font-size:16px;font-weight:700;">Atenciosamente,</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:${SIGNATURE_CARD_WIDTH}px;max-width:${SIGNATURE_CARD_WIDTH}px;min-height:${SIGNATURE_CARD_MIN_HEIGHT}px;border-collapse:separate;border-spacing:0;background:#ffffff;border-radius:10px;margin:0 0 ${SIGNATURE_TO_LINKS_MARGIN}px 0;">
<tbody><tr>
<td width="${SIGNATURE_HORIZONTAL_GAP}" style="width:${SIGNATURE_HORIZONTAL_GAP}px;font-size:1px;line-height:1px;">&nbsp;</td>
<td width="${SIGNATURE_LOGO_WIDTH}" style="width:${SIGNATURE_LOGO_WIDTH}px;padding:${SIGNATURE_VERTICAL_GAP}px 0;vertical-align:middle;">
<img src="${escapeAttribute(logoUrl)}" width="${SIGNATURE_LOGO_WIDTH}" alt="Elinsa do Brasil Ampergroup" style="display:block;width:${SIGNATURE_LOGO_WIDTH}px;max-width:${SIGNATURE_LOGO_WIDTH}px;height:auto;border:0;outline:none;text-decoration:none;" />
</td>
<td width="${SIGNATURE_HORIZONTAL_GAP}" style="width:${SIGNATURE_HORIZONTAL_GAP}px;font-size:1px;line-height:1px;">&nbsp;</td>
<td style="width:1px;padding:${SIGNATURE_SEPARATOR_PADDING};font-size:1px;line-height:1px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-spacing:0;"><tbody><tr><td width="1" height="${SIGNATURE_SEPARATOR_HEIGHT}" bgcolor="#222222" style="width:1px;height:${SIGNATURE_SEPARATOR_HEIGHT}px;background:#222222;font-size:0;line-height:0;">&nbsp;</td></tr></tbody></table></td>
<td width="${SIGNATURE_HORIZONTAL_GAP}" style="width:${SIGNATURE_HORIZONTAL_GAP}px;font-size:1px;line-height:1px;">&nbsp;</td>
<td style="padding:${SIGNATURE_CONTENT_CELL_PADDING};vertical-align:middle;font-family:Aptos,Arial,sans-serif;color:#333333;font-size:14px;line-height:1.45;">
<div style="margin:0 0 2px 0;color:#111111;font-size:18px;font-weight:700;line-height:1.15;">${escapeHtml(values.nome)}</div>
<div style="margin:0;color:#444444;">${escapeHtml(values.cargo)}</div>
<div style="margin:0;color:#444444;">${escapeHtml(content.locationLine)}</div>
${content.phoneLine ? `<div style="margin:0;color:#444444;">${escapeHtml(content.phoneLine)}</div>` : ""}
<div style="margin:0;color:#444444;">${escapeHtml(content.email)}</div>
</td>
</tr></tbody>
</table>
<div style="font-family:Aptos,Arial,sans-serif;font-size:16px;line-height:1.25;">
${SOCIAL_LINKS_HTML}
</div>
</div>`;
}

function buildSignaturePlainText(values: SignatureValues) {
  const content = getSignatureContent(values);

  return [
    "Atenciosamente,",
    "",
    values.nome,
    values.cargo,
    content.locationLine,
    content.phoneLine,
    content.email,
    "",
    "Elinsa do Brasil: Instagram - LinkedIn - Site",
    "Grupo Amper: LinkedIn - Site",
  ]
    .filter((line, index) => line || index === 1 || index === 7)
    .join("\n");
}

async function copyRichSignature(html: string, plainText: string) {
  if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      }),
    ]);
    return;
  }

  if (copyHtmlWithSelection(html)) {
    return;
  }

  await navigator.clipboard.writeText(plainText);
}

function copyHtmlWithSelection(html: string) {
  const selection = window.getSelection();
  if (!selection) return false;

  const container = document.createElement("div");
  container.contentEditable = "true";
  container.style.left = "-9999px";
  container.style.position = "fixed";
  container.style.top = "0";
  container.innerHTML = html;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  selection.removeAllRanges();
  selection.addRange(range);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    selection.removeAllRanges();
    container.remove();
  }

  return copied;
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
