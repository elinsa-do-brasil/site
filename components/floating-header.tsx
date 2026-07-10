import type * as React from "react";
import { cn } from "@/lib/utils";

/** Shared floating chrome for public and authenticated navigation. */
export function FloatingHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center p-3 sm:p-4">
      <header
        className={cn(
          "pointer-events-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/90 px-3 shadow-sm backdrop-blur-xl sm:px-4",
          className,
        )}
        {...props}
      >
        {children}
      </header>
    </div>
  );
}
