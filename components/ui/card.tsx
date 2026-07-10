import type * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  variant = "standard",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm";
  variant?: "standard" | "panel" | "metric" | "auth" | "editorial" | "form";
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden border border-border/80 bg-card py-(--card-spacing) text-sm text-card-foreground shadow-card [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        "data-[variant=standard]:rounded-lg data-[variant=panel]:rounded-xl data-[variant=metric]:rounded-lg data-[variant=auth]:rounded-3xl data-[variant=auth]:[--card-spacing:--spacing(6)] data-[variant=editorial]:rounded-xl data-[variant=editorial]:[--card-spacing:--spacing(5)] data-[variant=form]:rounded-lg data-[variant=form]:[--card-spacing:--spacing(5)]",
        "data-[variant=panel]:bg-surface-panel data-[variant=panel]:shadow-panel data-[variant=metric]:bg-surface-card data-[variant=auth]:shadow-auth data-[variant=form]:bg-surface-form",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-sm font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm/relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
