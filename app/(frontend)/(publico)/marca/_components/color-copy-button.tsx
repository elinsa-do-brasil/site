"use client";

import { Check, Copy, X } from "lucide-react";
import { useState } from "react";

export function ColorCopyButton({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copyState, setCopyState] = useState<"copied" | "error" | "idle">(
    "idle",
  );

  async function copyValue() {
    try {
      await copyText(value);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <button
      aria-label={`Copiar código ${label}: ${value}`}
      className="group flex min-w-0 touch-manipulation items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2.5 text-left transition-[background-color,border-color,color,box-shadow] hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elinsa-primary/30 dark:hover:bg-elinsa-primary/10"
      onClick={copyValue}
      type="button"
    >
      <span className="min-w-0">
        <span className="block text-[0.6rem] font-black tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </span>
        <code
          className="mt-1 block wrap-break-word font-mono text-xs leading-5 text-foreground/85"
          translate="no"
        >
          {value}
        </code>
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm transition-colors group-hover:text-elinsa-primary">
        {copyState === "copied" ? (
          <Check aria-hidden="true" className="size-3.5 text-emerald-600" />
        ) : copyState === "error" ? (
          <X aria-hidden="true" className="size-3.5 text-destructive" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </span>
      <span aria-live="polite" className="sr-only">
        {copyState === "copied"
          ? `${label} copiado.`
          : copyState === "error"
            ? `Não foi possível copiar ${label}.`
            : ""}
      </span>
    </button>
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Browsers can deny Clipboard API access outside a trusted context.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Não foi possível copiar o código de cor.");
  }
}
