import type React from "react";
import { useEffect } from "react";

type OutsideClickEvent = MouseEvent | TouchEvent;

// Fecha modais/dropdowns ao clicar/tocar fora do elemento referenciado — usado por components/ui/apple-cards-carousel.tsx. Escuta mousedown/touchstart (não click) para disparar antes do próprio clique terminar de processar.
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  callback: (event: OutsideClickEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: OutsideClickEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
