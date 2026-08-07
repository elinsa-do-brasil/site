export type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  callback?: (token: string) => void;
  "error-callback"?: (error?: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible" | "invisible";
  language?: string;
  "response-field"?: boolean;
  retry?: "auto" | "never";
  "refresh-expired"?: "auto" | "manual" | "never";
};

export type Turnstile = {
  render: (
    container: HTMLElement | string,
    options: TurnstileRenderOptions,
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
  ready: (callback: () => void) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
