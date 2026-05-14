import { MoveRightIcon } from "lucide-react";

export function NotFoundView({ as = "main" }: { as?: "main" | "div" }) {
  const Root = as;

  return (
    <>
      <style>{`
        [data-frontend-shell-header],
        [data-frontend-shell-footer] {
          display: none !important;
        }

        [data-frontend-shell-main] {
          padding-top: 0 !important;
        }
      `}</style>
      <Root className="flex min-h-dvh min-w-dvw items-center justify-center gap-4 bg-background px-6 text-foreground">
        <h1 className="border-r border-border pr-4 font-mono text-5xl font-semibold">
          404
        </h1>
        <div className="space-y-2">
          <p>Hum... Não temos esta página.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 underline underline-offset-4"
          >
            <span>Voltar à página inicial</span>
            <MoveRightIcon size={18} />
          </a>
        </div>
      </Root>
    </>
  );
}
