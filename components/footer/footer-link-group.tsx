import Link from "next/link";
import type { FooterLinkGroup as FooterLinkGroupType } from "./footer-data";

export function FooterLinkGroup({ group }: { group: FooterLinkGroupType }) {
  return (
    <nav aria-label={group.ariaLabel}>
      <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {group.links.map((link) => (
          <li key={link.href}>
            <Link
              className="transition-colors hover:text-elinsa-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
