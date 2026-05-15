import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins/organization";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendInternalAuthEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendInternalAuthEmail({
        to: user.email,
        subject: "Redefinir senha do Portal Interno Elinsa",
        text: `Use o link para redefinir sua senha: ${url}`,
        idempotencyKey: `reset-password/${user.id}/${Date.now()}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendInternalAuthEmail({
        to: user.email,
        subject: "Verifique seu e-mail no Portal Interno Elinsa",
        text: `Use o link para verificar seu e-mail: ${url}`,
        idempotencyKey: `verify-email/${user.id}/${Date.now()}`,
      });
    },
  },
  socialProviders: {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID as string,
      authority: "https://login.microsoftonline.com",
      prompt: "select_account",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["microsoft"],
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) =>
        origin.trim(),
      )
    : undefined,
  plugins: [
    organization({
      allowUserToCreateOrganization: false,
      teams: {
        enabled: true,
        maximumTeams: 20,
        allowRemovingAllTeams: false,
      },
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async (data) => {
        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
        const inviteLink = `${baseUrl}/convite/${data.id}`;

        await sendInternalAuthEmail({
          to: data.email,
          subject: "Convite para acessar o Portal Interno Elinsa",
          text: [
            `Você foi convidado(a) por ${data.inviter?.user?.email || "Administrador"} para acessar ${data.organization.name}.`,
            "",
            `Acesse o convite: ${inviteLink}`,
            "",
            "Se você ainda não possui conta, crie uma conta usando este mesmo e-mail antes de aceitar o convite.",
          ].join("\n"),
          idempotencyKey: `invite/${data.id}/${Date.now()}`,
        });
      },
    }),
    passkey(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
