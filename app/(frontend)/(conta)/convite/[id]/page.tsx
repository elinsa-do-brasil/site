import type { Metadata } from "next";
import { AceitarConvite } from "@/components/auth/AcceptInvite";

export const metadata: Metadata = {
  title: "Aceitar convite",
};

type ConvitePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConvitePage({ params }: ConvitePageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <AceitarConvite invitationId={id} />
    </main>
  );
}
