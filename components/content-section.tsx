import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { cn } from "@/lib/utils";

type ContentSectionTone = "default" | "muted" | "dark";
type ContentSectionIntroVariant =
  | "compact"
  | "editorial"
  | "sequence"
  | "signal"
  | "specification"
  | "split";

type ContentSectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  headingId?: string;
  id?: string;
  tone?: ContentSectionTone;
};

type ContentSectionIntroProps = {
  aside?: ReactNode;
  badge: string;
  className?: string;
  description?: ReactNode;
  headingId: string;
  icon: LucideIcon;
  marker?: string;
  title: ReactNode;
  variant?: ContentSectionIntroVariant;
};

/** Shared spacing, container width and tonal rhythm for institutional sections. */
export function ContentSection({
  children,
  className,
  containerClassName,
  headingId,
  id,
  tone = "default",
}: ContentSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden py-16 lg:py-20",
        tone === "default" && "bg-background",
        tone === "muted" && "bg-muted/25",
        tone === "dark" && "bg-elinsa-dark text-white",
        className,
      )}
    >
      <div className={cn("mx-auto w-full max-w-6xl px-4", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** Shared section heading with an optional complementary aside. */
export function ContentSectionIntro({
  aside,
  badge,
  className,
  description,
  headingId,
  icon,
  marker,
  title,
  variant = "split",
}: ContentSectionIntroProps) {
  const eyebrowVariant = {
    compact: "line",
    editorial: "editorial",
    sequence: "line",
    signal: "signal",
    specification: "stamp",
    split: "plate",
  } as const;

  return (
    <header
      className={cn(
        "relative grid gap-7",
        variant === "split" &&
          "lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start",
        variant === "compact" && "max-w-3xl",
        variant === "sequence" && "border-t border-border pt-7",
        variant === "sequence" &&
          aside &&
          "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end",
        variant === "signal" &&
          "overflow-hidden rounded-3xl border border-elinsa-primary/20 bg-card/70 p-5 shadow-sm md:p-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-center",
        variant === "editorial" && "border-t-4 border-foreground pt-6",
        variant === "editorial" &&
          aside &&
          "lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] lg:items-end",
        variant === "specification" &&
          "border-y border-border py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center",
        className,
      )}
    >
      <div
        className={cn("max-w-2xl", marker && "flex items-start gap-4 sm:gap-5")}
      >
        {marker ? (
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 font-mono font-black text-elinsa-primary",
              variant === "sequence" &&
                "min-w-12 text-4xl leading-none text-elinsa-primary/35 sm:text-5xl",
              variant === "compact" &&
                "rounded-full border border-elinsa-primary/20 bg-elinsa-primary/10 px-2.5 py-2 text-xs leading-none",
              variant === "signal" && "text-2xl leading-none",
              variant === "editorial" && "pt-0.5 text-sm tracking-[0.14em]",
              variant === "specification" &&
                "rounded-md border border-elinsa-primary/20 bg-elinsa-primary/10 px-2.5 py-2 text-xs leading-none",
            )}
          >
            {marker}
          </span>
        ) : null}

        <div className="min-w-0">
          <SectionEyebrow
            className="mb-5"
            text={badge}
            icon={icon}
            variant={eyebrowVariant[variant]}
          />
          <h2
            id={headingId}
            className={cn(
              "max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-normal md:text-4xl",
              variant === "editorial" &&
                "font-black md:text-5xl md:leading-[1.05]",
            )}
          >
            {title}
          </h2>
          {description ? (
            <div className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {aside ? (
        <div
          className={cn(
            variant === "split" &&
              "border-t-3 border-elinsa-primary pt-6 lg:border-t-0 lg:border-l-3 lg:py-2 lg:pl-10",
            variant === "compact" && "border-t border-border pt-5",
            variant === "sequence" &&
              "border-t border-dashed border-border pt-5 lg:border-t-0 lg:border-l lg:py-1 lg:pl-8",
            variant === "signal" &&
              "rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm",
            variant === "editorial" &&
              "border-t border-border pt-5 lg:border-t-0 lg:border-l lg:py-1 lg:pl-8",
            variant === "specification" &&
              "rounded-xl border border-border/70 bg-muted/45 p-5",
          )}
        >
          {aside}
        </div>
      ) : null}
    </header>
  );
}
