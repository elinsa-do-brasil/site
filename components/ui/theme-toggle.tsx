"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label="Alternar tema"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          type="button"
        >
          <HugeiconsIcon
            aria-hidden="true"
            icon={Sun03Icon}
            strokeWidth={2}
            className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
          <HugeiconsIcon
            aria-hidden="true"
            icon={Moon02Icon}
            strokeWidth={2}
            className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </TooltipTrigger>

      <TooltipContent>Alternar tema</TooltipContent>
    </Tooltip>
  );
}
