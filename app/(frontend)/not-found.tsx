import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description:
    "O endereço acessado não foi encontrado. Volte à página inicial ou continue navegando pelo site da Elinsa.",
};

export default function NotFound() {
  return <NotFoundView as="div" />;
}
