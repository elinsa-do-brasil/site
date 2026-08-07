"use client";

import Script from "next/script";
import {
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { publicEnv } from "@/lib/env.public";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  ref?: Ref<TurnstileWidgetHandle>;
};

export function TurnstileWidget({ onVerify, ref }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (widgetIdRef.current) {
          window.turnstile?.reset(widgetIdRef.current);
        }
        onVerifyRef.current("");
      },
    }),
    [],
  );

  useEffect(() => {
    if (!isScriptReady || !containerRef.current || widgetIdRef.current) return;

    const siteKey = publicEnv.turnstileSiteKey;

    if (!siteKey) {
      setHasLoadError(true);
      return;
    }

    // Não usar window.turnstile.ready(): a Cloudflare recusa chamá-lo
    // quando o <script> foi carregado como async (é como o next/script
    // injeta com strategy="afterInteractive"), lançando um TurnstileError
    // em runtime. O callback onReady abaixo já garante que o script
    // terminou de carregar, então window.turnstile já está pronto aqui.
    widgetIdRef.current =
      window.turnstile?.render(containerRef.current, {
        sitekey: siteKey,
        action: "turnstile-spin-v2",
        language: "pt-br",
        size: "flexible",
        theme: "auto",
        appearance: "interaction-only",
        "response-field": false,
        callback: (token) => onVerifyRef.current(token),
        "error-callback": () => {
          onVerifyRef.current("");
          setHasLoadError(true);
        },
        "expired-callback": () => onVerifyRef.current(""),
        "timeout-callback": () => onVerifyRef.current(""),
      }) ?? null;

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [isScriptReady]);

  return (
    <div>
      <Script
        id="cf-turnstile"
        onReady={() => setIsScriptReady(true)}
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-action="turnstile-spin-v2"
        ref={containerRef}
      />
      {hasLoadError && (
        <p className="mt-2 text-sm text-destructive">
          Não foi possível carregar a verificação de segurança. Atualize a
          página e tente novamente.
        </p>
      )}
    </div>
  );
}
