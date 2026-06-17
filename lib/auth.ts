import { passkey } from "@better-auth/passkey";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { organization } from "better-auth/plugins/organization";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendInternalAuthEmail } from "@/lib/email";

const MAX_ACTIVE_SESSIONS_PER_USER = 5;
const ELINSA_ORGANIZATION_SLUG = "elinsa";
const MICROSOFT_PROVIDER_ID = "microsoft";

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
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  databaseHooks: {
    session: {
      create: {
        async after(session) {
          await pruneOldUserSessions(session.userId);
          await ensureMicrosoftUserOrganizationMembership(session.userId);
        },
      },
    },
    account: {
      create: {
        async after(account) {
          if (account.providerId === MICROSOFT_PROVIDER_ID) {
            await ensureMicrosoftUserOrganizationMembership(account.userId);
          }
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) =>
        origin.trim(),
      )
    : undefined,
  plugins: [
    inviteOnlySignUp(),
    organization({
      allowUserToCreateOrganization: false,
      teams: {
        enabled: true,
        maximumTeams: 20,
        allowRemovingAllTeams: false,
      },
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async (data) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_URL ||
          process.env.BETTER_AUTH_URL ||
          "http://localhost:3000";
        const inviteLink = `${baseUrl}/convite/${data.id}`;

        await sendInternalAuthEmail({
          to: data.email,
          subject: "Convite para acessar o Portal Interno Elinsa",
          text: [
            `Você foi convidado(a) por ${data.inviter?.user?.email || "Administrador"} para acessar ${data.organization.name}.`,
            "",
            `Acesse o convite: ${inviteLink}`,
            "",
            "Se você ainda não possui conta, o link abrirá a criação de conta com o e-mail do convite.",
          ].join("\n"),
          idempotencyKey: `invite/${data.id}/${Date.now()}`,
        });
      },
    }),
    passkey(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;

async function assertInvitationAllowsSignUp(body: unknown) {
  const parsedBody = body as
    | {
        email?: unknown;
        invitationId?: unknown;
      }
    | undefined;
  const email =
    typeof parsedBody?.email === "string"
      ? parsedBody.email.trim().toLowerCase()
      : "";
  const invitationId =
    typeof parsedBody?.invitationId === "string"
      ? parsedBody.invitationId.trim()
      : "";

  if (!email || !invitationId) {
    throw APIError.from("BAD_REQUEST", {
      code: "INVITATION_REQUIRED",
      message: "A criação de conta exige um convite válido.",
    });
  }

  const [invite] = await db
    .select({
      email: schema.invitation.email,
      expiresAt: schema.invitation.expiresAt,
      status: schema.invitation.status,
    })
    .from(schema.invitation)
    .where(eq(schema.invitation.id, invitationId))
    .limit(1);

  if (
    !invite ||
    invite.status !== "pending" ||
    !invite.expiresAt ||
    invite.expiresAt < new Date()
  ) {
    throw APIError.from("BAD_REQUEST", {
      code: "INVITATION_INVALID",
      message: "Convite não encontrado ou expirado.",
    });
  }

  if (invite.email.trim().toLowerCase() !== email) {
    throw APIError.from("FORBIDDEN", {
      code: "INVITATION_EMAIL_MISMATCH",
      message: "O e-mail da conta precisa ser o mesmo do convite.",
    });
  }

  const [existingUser] = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  if (existingUser) {
    throw APIError.from("BAD_REQUEST", {
      code: "INVITED_USER_ALREADY_EXISTS",
      message: "Esta conta já existe. Entre para aceitar o convite.",
    });
  }
}

function inviteOnlySignUp(): BetterAuthPlugin {
  return {
    id: "invite-only-sign-up",
    hooks: {
      before: [
        {
          matcher(context) {
            return context.path === "/sign-up/email";
          },
          handler: createAuthMiddleware(async (ctx) => {
            await assertInvitationAllowsSignUp(ctx.body);
          }),
        },
      ],
    },
  };
}

async function ensureMicrosoftUserOrganizationMembership(userId: string) {
  const [microsoftAccount] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, MICROSOFT_PROVIDER_ID),
      ),
    )
    .limit(1);

  if (!microsoftAccount) {
    return;
  }

  const [org] = await db
    .select({ id: schema.organization.id })
    .from(schema.organization)
    .where(eq(schema.organization.slug, ELINSA_ORGANIZATION_SLUG))
    .limit(1);

  if (!org) {
    return;
  }

  await db
    .insert(schema.member)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      userId,
      role: "member",
    })
    .onConflictDoNothing({
      target: [schema.member.organizationId, schema.member.userId],
    });
}

async function pruneOldUserSessions(userId: string) {
  const sessions = await db
    .select({
      id: schema.session.id,
    })
    .from(schema.session)
    .where(eq(schema.session.userId, userId))
    .orderBy(desc(schema.session.createdAt));

  const oldSessionIds = sessions
    .slice(MAX_ACTIVE_SESSIONS_PER_USER)
    .map((session) => session.id);

  if (oldSessionIds.length === 0) {
    return;
  }

  await db
    .delete(schema.session)
    .where(inArray(schema.session.id, oldSessionIds));
}
