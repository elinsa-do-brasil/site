"use client";

import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function SidebarProvider({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-wrapper"
      style={
        {
          "--sidebar-width": "22rem",
          ...style,
        } as React.CSSProperties
      }
      className={cn("group/sidebar-wrapper min-h-svh w-full", className)}
      {...props}
    />
  );
}

function Sidebar({
  className,
  variant = "sidebar",
  ...props
}: React.ComponentProps<"aside"> & {
  variant?: "floating" | "sidebar";
}) {
  return (
    <aside
      data-slot="sidebar"
      data-variant={variant}
      className={cn(
        "flex min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground",
        variant === "floating" &&
          "overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar/95 shadow-sm backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3",
        className,
      )}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-3 p-3", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-separator"
      className={cn("h-px bg-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <section
      data-slot="sidebar-group"
      className={cn(
        "rounded-xl border border-sidebar-border bg-background/70 py-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex min-h-12 items-center gap-2 border-sidebar-border border-b px-3 py-3 font-medium text-sm",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("p-3", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  asChild = false,
  className,
  isActive,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-active={isActive}
      data-slot="sidebar-menu-button"
      className={cn(
        "flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
};
