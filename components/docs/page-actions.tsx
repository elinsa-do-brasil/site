import type { ReactNode } from "react";

export function DocsPageActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-0 mb-6 flex flex-wrap items-center gap-2">
      {children}
    </div>
  );
}
