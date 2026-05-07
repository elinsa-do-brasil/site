"use client";

import { useEffect } from "react";

export function EditorialArticleHeaderController() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(
      "[data-editorial-article-header]",
    );
    const scroller = document.querySelector<HTMLElement>(
      "[data-editorial-article-scroll]",
    );

    if (!header || !scroller) {
      return;
    }

    const updateHeaderState = () => {
      header.classList.toggle(
        "is-condensed",
        scroller.scrollTop > 8 || window.scrollY > 16,
      );
    };

    updateHeaderState();

    scroller.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, []);

  return null;
}
