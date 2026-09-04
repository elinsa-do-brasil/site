"use client";

import { Link, NavGroup } from "@payloadcms/ui";
import { usePathname } from "next/navigation.js";

export function EditorialReviewNavClient({ href }: { href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const label = (
    <>
      {isActive ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">Pendências editoriais</span>
    </>
  );

  return (
    <NavGroup isOpen label="Revisão">
      {isActive ? (
        <div className="nav__link" id="nav-editorial-review">
          {label}
        </div>
      ) : (
        <Link
          className="nav__link"
          href={href}
          id="nav-editorial-review"
          prefetch={false}
        >
          {label}
        </Link>
      )}
    </NavGroup>
  );
}
