import { type ReactNode, useId } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  navigation?: ReactNode;
  title: ReactNode;
  variant?: "feature" | "workspace";
};

/**
 * Shared page anatomy for workspace and feature pages.
 *
 * Navigation establishes context, the accent rail carries hierarchy, and actions
 * remain visually separate from the content title on every breakpoint.
 */
export function PageHeader({
  actions,
  children,
  className,
  description,
  eyebrow,
  meta,
  navigation,
  title,
  variant = "workspace",
}: PageHeaderProps) {
  const descriptionId = useId();

  return (
    <header
      className={cn(
        "relative mb-7 border-b border-border/80",
        variant === "feature" && "bg-muted/30",
        className,
      )}
    >
      <span aria-hidden="true" className="page-header-accent" />
      {variant === "feature" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <FeatureGeometry />
        </div>
      )}

      <div className="relative pb-6 pt-5 sm:pb-7 sm:pt-6">
        {navigation && <div className="mb-5">{navigation}</div>}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl border-l-2 border-elinsa-primary pl-4 sm:pl-5">
            {eyebrow && (
              <Badge
                className="rounded-md border-elinsa-primary/25 bg-elinsa-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-elinsa-dark uppercase dark:text-elinsa-sky"
                variant="outline"
              >
                {eyebrow}
              </Badge>
            )}
            <h1
              aria-describedby={description ? descriptionId : undefined}
              className="mt-3 text-pretty text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {title}
            </h1>
            {description && (
              <p
                className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
                id={descriptionId}
              >
                {description}
              </p>
            )}
            {meta && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {meta}
              </div>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
              {actions}
            </div>
          )}
        </div>

        {children && <div className="mt-5">{children}</div>}
      </div>
    </header>
  );
}

export function PageHeaderNavigation({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "-mx-1 flex min-w-0 gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]",
        className,
      )}
    >
      {children}
    </nav>
  );
}

function FeatureGeometry() {
  return (
    <div className="absolute inset-0">
      <div className="absolute -top-28 -right-24 size-64 rounded-full border border-elinsa-primary/15 sm:size-80" />
      <div className="absolute top-0 right-[18%] h-full w-px bg-gradient-to-b from-transparent via-elinsa-primary/35 to-transparent" />
      <div className="absolute right-[9%] bottom-6 size-2 rounded-full bg-elinsa-primary/50" />
    </div>
  );
}
