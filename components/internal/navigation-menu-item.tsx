import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavigationMenuItem as NavigationMenuItemPrimitive, navigationMenuTriggerStyle } from "../ui/navigation-menu";

export function NavigationMenuItem({
  text,
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuItemPrimitive> & {
  href: string;
  text: string;
}) {
  return (
    <NavigationMenuItemPrimitive {...props}>
      <Link
        href={href}
        className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
      >
        {text}
      </Link>
    </NavigationMenuItemPrimitive>
  );
}