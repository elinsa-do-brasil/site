"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const COLLAPSE_THRESHOLD = 1200;

export function ExpandableReportText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = text.length > COLLAPSE_THRESHOLD;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={
          canCollapse && !expanded ? "max-h-[32rem] overflow-hidden" : undefined
        }
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {text}
        </p>
      </div>

      {canCollapse && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Mostrar menos" : "Mostrar relato completo"}
        </Button>
      )}
    </div>
  );
}
