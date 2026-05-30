import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = {
  title: "404",
  description: "A página que você está procurando não foi encontrada.",
};

export default function NotFound() {
  return <NotFoundView as="div" />;
}
