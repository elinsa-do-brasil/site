import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  EmailSignatureGenerator,
  type InitialSignatureValues,
} from "@/app/(frontend)/portal/assinatura-de-email/_components/email-signature-generator";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireInternalAccess } from "@/lib/organization/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Assinatura de e-mail",
};

export default async function EmailSignaturePage() {
  const requestHeaders = await headers();
  const [session] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    requireInternalAccess(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Assinatura de e-mail
          </h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal">Voltar ao portal</Link>
        </Button>
      </div>

      <EmailSignatureGenerator
        initialValues={getInitialSignatureValues(session?.user)}
      />
    </div>
  );
}

function getInitialSignatureValues(user?: {
  email?: null | string;
  name?: null | string;
}): InitialSignatureValues {
  return {
    email: getEmailUsername(user?.email),
    nome: user?.name ?? "",
  };
}

function getEmailUsername(email?: null | string) {
  if (!email) return "";

  return email.split("@")[0] ?? "";
}
