"use client";

import { Zap, ZapOff } from "lucide-react";
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
          {/* usar o Zap como ícone de alternância de temas não é usual, mas considerando que somos uma empresa de energia,torna-se uma parte divertida da UI */}
          <Zap className="scale-100 rotate-0 transition-[opacity,transform] duration-200 dark:scale-0 dark:-rotate-90" />
          <ZapOff
            aria-hidden="true"
            className="absolute scale-0 rotate-90 transition-[opacity,transform] duration-200 dark:scale-100 dark:rotate-0"
          />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </TooltipTrigger>

      <TooltipContent>Alternar tema</TooltipContent>
    </Tooltip>
  );
}
