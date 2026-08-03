import { ChevronRight } from "lucide-react";
import Link from "next/link";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function SeoBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li className="flex min-w-0 items-center gap-1.5" key={item.label}>
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
              ) : null}
              {item.href && !isCurrent ? (
                <Link
                  className="transition-colors hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className="truncate"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
