"use client";

import { Pdf02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ReportPdfDownloadButton({
  protocol,
  reportId,
}: {
  protocol: string;
  reportId: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);

    try {
      const response = await fetch(
        `/api/committee/reports/${encodeURIComponent(reportId)}/pdf`,
        {
          cache: "no-store",
          credentials: "same-origin",
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "SESSION_EXPIRED"
            : response.status === 429
              ? "EXPORT_BUSY"
              : "EXPORT_FAILED",
        );
      }

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/pdf")) {
        throw new Error("INVALID_PDF_RESPONSE");
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("EMPTY_PDF_RESPONSE");
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = getDownloadFileName(
        response.headers.get("content-disposition"),
        protocol,
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
      toast.success("Download do PDF iniciado.");
    } catch (error) {
      toast.error(getExportErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button
      aria-busy={isGenerating}
      className="min-w-36"
      disabled={isGenerating}
      onClick={handleDownload}
      type="button"
      variant="outline"
    >
      {isGenerating ? (
        <Spinner
          aria-hidden="true"
          data-icon="inline-start"
          role="presentation"
        />
      ) : (
        <HugeiconsIcon
          aria-hidden="true"
          data-icon="inline-start"
          icon={Pdf02Icon}
          strokeWidth={2}
        />
      )}
      <span aria-live="polite">
        {isGenerating ? "Gerando PDF" : "Exportar PDF"}
      </span>
    </Button>
  );
}

function getExportErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "SESSION_EXPIRED") {
    return "Sua sessão expirou. Entre novamente para exportar o PDF.";
  }

  if (error instanceof Error && error.message === "EXPORT_BUSY") {
    return "Já há uma exportação em andamento. Aguarde alguns instantes.";
  }

  return "Não foi possível gerar o PDF. Tente novamente ou atualize a página.";
}

function getDownloadFileName(
  contentDisposition: string | null,
  protocol: string,
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

  const safeProtocol = protocol.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `denuncia-${safeProtocol || "relatorio"}.pdf`;
}
