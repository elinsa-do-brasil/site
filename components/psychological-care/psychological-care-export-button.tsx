"use client";

import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const EARLIEST_EXPORT_YEAR = 2020;

export function PsychologicalCareExportButton({
  defaultYear,
  defaultMonth,
}: {
  defaultYear: number;
  defaultMonth: number;
}) {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [isExporting, setIsExporting] = useState(false);
  const yearOptions = buildYearOptions(defaultYear);

  async function handleExport() {
    setIsExporting(true);

    try {
      const response = await fetch(
        "/api/portal/atendimento-psicologico/export",
        {
          body: JSON.stringify({ year, month }),
          cache: "no-store",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "SESSION_EXPIRED"
            : response.status === 403
              ? "FORBIDDEN"
              : response.status === 422
                ? "INVALID_PERIOD"
                : response.status === 429
                  ? "EXPORT_BUSY"
                  : "EXPORT_FAILED",
        );
      }

      const rowCount = Number(
        response.headers.get("x-psychological-care-export-row-count") ?? "0",
      );
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = getDownloadFileName(
        response.headers.get("content-disposition"),
        year,
        month,
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);

      toast.success(
        rowCount > 0
          ? `Exportação de ${MONTH_LABELS[month - 1]}/${year} concluída (${rowCount} solicitação(ões)).`
          : `Nenhuma solicitação encontrada em ${MONTH_LABELS[month - 1]}/${year}. Um arquivo vazio foi baixado.`,
      );
    } catch (error) {
      toast.error(getExportErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        disabled={isExporting}
        onValueChange={(value) => setMonth(Number(value))}
        value={String(month)}
      >
        <SelectTrigger aria-label="Mês para exportação" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {MONTH_LABELS.map((label, index) => (
              <SelectItem key={label} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        disabled={isExporting}
        onValueChange={(value) => setYear(Number(value))}
        value={String(year)}
      >
        <SelectTrigger aria-label="Ano para exportação" className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {yearOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        aria-busy={isExporting}
        disabled={isExporting}
        onClick={handleExport}
        type="button"
        variant="outline"
      >
        {isExporting ? (
          <Spinner
            aria-hidden="true"
            data-icon="inline-start"
            role="presentation"
          />
        ) : (
          <HugeiconsIcon
            aria-hidden="true"
            data-icon="inline-start"
            icon={Download04Icon}
            strokeWidth={2}
          />
        )}
        <span aria-live="polite">
          {isExporting ? "Exportando" : "Exportar CSV"}
        </span>
      </Button>
    </div>
  );
}

function buildYearOptions(currentYear: number) {
  const years: number[] = [];

  for (let year = currentYear; year >= EARLIEST_EXPORT_YEAR; year -= 1) {
    years.push(year);
  }

  return years;
}

function getExportErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Não foi possível exportar o CSV. Tente novamente.";
  }

  switch (error.message) {
    case "SESSION_EXPIRED":
      return "Sua sessão expirou. Entre novamente para exportar.";
    case "FORBIDDEN":
      return "Você não tem permissão para exportar essas solicitações.";
    case "INVALID_PERIOD":
      return "Selecione um mês/ano válido (não é possível exportar um período futuro).";
    case "EXPORT_BUSY":
      return "Já há uma exportação em andamento. Aguarde alguns instantes.";
    default:
      return "Não foi possível exportar o CSV. Tente novamente ou atualize a página.";
  }
}

function getDownloadFileName(
  contentDisposition: string | null,
  year: number,
  month: number,
) {
  const encodedName = contentDisposition?.match(
    /filename\*=UTF-8''([^;]+)/i,
  )?.[1];

  if (encodedName) {
    try {
      return decodeURIComponent(encodedName);
    } catch {
      // Mantém o fallback seguro abaixo se o cabeçalho estiver malformado.
    }
  }

  return `atendimento-psicologico-${year}-${String(month).padStart(2, "0")}.csv`;
}
