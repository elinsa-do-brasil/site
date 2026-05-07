"use client";

import { useEffect } from "react";

export function EditorialArticleHeaderController() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(
      "[data-editorial-article-header]",
    );

    if (!header) {
      return;
    }

    const updateHeaderState = () => {
      header.classList.toggle("is-condensed", window.scrollY > 18);
    };

    updateHeaderState();

    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, []);

  return null;
}
