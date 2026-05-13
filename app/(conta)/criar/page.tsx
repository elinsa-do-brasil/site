import type { Metadata } from "next";
import { CriarContaForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Criar Conta - Portal Interno Elinsa",
};

export default function CriarContaPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <CriarContaForm />
    </main>
  );
}
