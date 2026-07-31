import { Spinner } from "@/components/ui/spinner";

export function AuthRedirecting() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-44 flex-col items-center justify-center gap-4 text-center"
      role="status"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Spinner aria-hidden="true" className="size-5" />
      </div>
      <div className="grid gap-1">
        <p className="font-heading text-base font-semibold">
          Acesso confirmado
        </p>
        <p className="text-xs text-muted-foreground">Abrindo sua área…</p>
      </div>
    </div>
  );
}
