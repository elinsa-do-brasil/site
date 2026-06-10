import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

type HomeSectionTone = "default" | "muted";

type HomeSectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  headingId?: string;
  id?: string;
  tone?: HomeSectionTone;
};

type HomeSectionIntroProps = {
  aside?: ReactNode;
  badge: string;
  className?: string;
  description?: ReactNode;
  headingId: string;
  icon: LucideIcon;
  title: ReactNode;
};

/** Keeps homepage sections aligned on one spacing, width and background rhythm. */
export function HomeSection({
  children,
  className,
  containerClassName,
  headingId,
  id,
  tone = "default",
}: HomeSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden px-6 py-16 md:px-8 lg:py-20",
        tone === "default" ? "bg-background" : "bg-muted/25",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-6xl", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** Standard intro block for landing-page sections with optional supporting copy. */
export function HomeSectionIntro({
  aside,
  badge,
  className,
  description,
  headingId,
  icon,
  title,
}: HomeSectionIntroProps) {
  return (
    <header
      className={cn(
        "grid gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start",
        className,
      )}
    >
      <div className="max-w-2xl">
        <Badge text={badge} icon={icon} />
        <h2
          id={headingId}
          className="max-w-3xl text-3xl font-extrabold leading-tight tracking-normal md:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <div className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            {description}
          </div>
        ) : null}
      </div>

      {aside ? (
        <div className="border-t-3 border-elinsa-primary pt-6 md:border-l-3 md:border-t-0 md:py-2 md:pl-10">
          {aside}
        </div>
      ) : null}
    </header>
  );
}
