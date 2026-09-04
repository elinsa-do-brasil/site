import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina classes condicionais (clsx) e resolve utilitários Tailwind conflitantes (twMerge, ex.: "px-2 px-4" vira só "px-4"); é a convenção do shadcn usada em todos os componentes (incluindo components/ui).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
