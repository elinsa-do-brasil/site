import Link from "next/link";
import { cn } from "@/lib/utils";

type ReportFlowStepsProps = {
  currentStep: 1 | 2;
};

const steps = [
  { number: 1, label: "Orientações", href: "/denunciar" },
  { number: 2, label: "Formulário", href: "/denunciar/formulario" },
] as const;

export function ReportFlowSteps({ currentStep }: ReportFlowStepsProps) {
  return (
    <nav aria-label="Orientações e formulário de denúncia">
      <ol className="grid max-w-md grid-cols-2 gap-2">
        {steps.map((step) => {
          const isCurrent = step.number === currentStep;
          const content = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCurrent
                    ? "bg-elinsa-primary text-white"
                    : "bg-muted text-muted-foreground group-hover/report-nav:bg-elinsa-primary/10 group-hover/report-nav:text-elinsa-primary",
                )}
              >
                {step.number}
              </span>
              <span
                className={cn(
                  "min-w-0 truncate text-sm font-semibold transition-colors",
                  isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground group-hover/report-nav:text-foreground",
                )}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li key={step.number} aria-current={isCurrent ? "step" : undefined}>
              {!isCurrent ? (
                <Link
                  href={step.href}
                  className="group/report-nav flex min-h-12 items-center gap-2.5 rounded-lg border border-border/80 bg-card px-3 transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:hover:bg-elinsa-primary/10"
                >
                  {content}
                </Link>
              ) : (
                <div
                  className={cn(
                    "flex min-h-12 items-center gap-2.5 rounded-lg border border-elinsa-primary/35 bg-elinsa-light/45 px-3 dark:bg-elinsa-primary/10",
                  )}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
