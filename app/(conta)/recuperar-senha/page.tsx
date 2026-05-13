import type { Metadata } from "next";
import { RecuperarSenhaForm } from "@/components/auth/PasswordResetForm";

export const metadata: Metadata = {
  title: "Recuperar Senha - Portal Interno Elinsa",
};

export default function RecuperarSenhaPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <RecuperarSenhaForm />
    </main>
  );
}
