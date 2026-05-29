"use client";

import { usePathname } from "fumadocs-core/framework";
import { renderTranslation } from "fumadocs-core/i18n";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { useTranslations } from "fumadocs-ui/contexts/i18n";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useMemo } from "react";
import type { IconType } from "react-icons";
import { RiClaudeFill, RiGeminiFill, RiOpenaiFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

type AIOption = {
  href: string;
  icon: IconType;
  title: string;
};

export function OpenWithAIPopover({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations();

  const items = useMemo<AIOption[]>(() => {
    const pageUrl =
      typeof window === "undefined"
        ? pathname
        : String(new URL(pathname, window.location.origin));
    const q = renderTranslation(t.pageActionsOpenInLLMPrompt, { url: pageUrl });

    return [
      {
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: "search",
          q,
        })}`,
        icon: RiOpenaiFill,
        title: "Abrir no ChatGPT",
      },
      {
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: RiClaudeFill,
        title: t.pageActionsOpenClaude,
      },
      {
        href: "https://gemini.google.com/app",
        icon: RiGeminiFill,
        title: "Abrir no Gemini",
      },
    ];
  }, [pathname, t]);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            color: "secondary",
            size: "sm",
          }),
          "gap-2 data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground",
          className,
        )}
        type="button"
      >
        {t.pageActionsOpen}
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <a
              className="inline-flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4"
              href={item.href}
              key={item.title}
              rel="noreferrer noopener"
              target="_blank"
            >
              <Icon />
              {item.title}
              <ExternalLink className="ms-auto size-3.5 text-fd-muted-foreground" />
            </a>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
