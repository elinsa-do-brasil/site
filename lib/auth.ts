import { passkey } from "@better-auth/passkey";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { after } from "next/server";
import { createElement } from "react";
import InviteEmail from "@/emails/invite";
import SignInOtpEmail from "@/emails/sign-in-otp";
import {
  decideOtpAccess,
  isCorporateEmail,
  mapMicrosoftProfileToUser,
  normalizeCorporateDomain,
  normalizeEmail,
} from "@/lib/auth-policy";
import {
  consumeDatabaseRateLimit,
  createHashedRateLimitKey,
} from "@/lib/database-rate-limit";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendInternalAuthEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { publicEnv } from "@/lib/env.public";

const MAX_ACTIVE_SESSIONS_PER_USER = 5;
const ELINSA_ORGANIZATION_SLUG = "elinsa";
const MICROSOFT_PROVIDER_ID = "microsoft";
const INVITATION_ID_HEADER = "x-elinsa-invitation-id";
const OTP_EXPIRY_SECONDS = 10 * 60;
const corporateDomain = normalizeCorporateDomain(env.microsoftAllowedDomain());
const microsoftTenantId = env.microsoftTenantId() ?? "";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    transaction: true,
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    microsoft: {
      clientId: env.microsoftClientId() as string,
      clientSecret: env.microsoftClientSecret() as string,
      tenantId: microsoftTenantId,
      authority: "https://login.microsoftonline.com",
      prompt: "select_account",
      disableDefaultScope: true,
      disableProfilePhoto: true,
      scope: ["openid", "profile", "email"],
      mapProfileToUser(profile) {
        try {
          return mapMicrosoftProfileToUser(profile, {
            corporateDomain,
            tenantId: microsoftTenantId,
          });
        } catch (error) {
          const code =
            error instanceof Error
              ? error.message
              : "MICROSOFT_PROFILE_INVALID";
          throw APIError.from("FORBIDDEN", {
            code,
            message:
              "Use uma conta corporativa válida da Elinsa para acessar o portal.",
          });
        }
      },
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      allowDifferentEmails: false,
      enabled: true,
      requireLocalEmailVerified: true,
      trustedProviders: [MICROSOFT_PROVIDER_ID],
      updateUserInfoOnLink: true,
    },
  },
  user: {
    changeEmail: {
      enabled: false,
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/social": { window: 60, max: 10 },
      "/passkey/*": { window: 60, max: 20 },
      "/organization/invite-member": { window: 60 * 60, max: 20 },
      "/organization/accept-invitation": { window: 60, max: 10 },
    },
  },
  databaseHooks: {
    session: {
      create: {
        async after(session) {
          await pruneOldUserSessions(session.userId);
          await ensureMicrosoftUserOrganizationMembership(
            session.userId,
            session.id,
          );
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
  advanced: {
    backgroundTasks: {
      handler(promise) {
        after(() => promise);
      },
    },
  },
  secret: env.betterAuthSecret(),
  trustedOrigins: env.betterAuthTrustedOrigins()
    ? env
        .betterAuthTrustedOrigins()
        ?.split(",")
        .map((origin) => origin.trim())
    : undefined,
  plugins: [
    passwordlessAccessPolicy(),
    emailOTP({
      allowedAttempts: 3,
      disableSignUp: false,
      expiresIn: OTP_EXPIRY_SECONDS,
      otpLength: 6,
      resendStrategy: "reuse",
      storeOTP: "encrypted",
      rateLimit: {
        max: 3,
        window: 60,
      },
      changeEmail: {
        enabled: true,
        verifyCurrentEmail: true,
      },
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "forget-password") {
          throw new Error("O fluxo de senha está desativado.");
        }

        const messageType = type;
        const subjectByType = {
          "change-email": "Confirme seu novo e-mail | Portal Elinsa",
          "email-verification": "Confirme seu e-mail | Portal Elinsa",
          "sign-in": "Seu código de acesso | Portal Elinsa",
        } as const;

        await sendInternalAuthEmail({
          to: email,
          subject: subjectByType[messageType],
          text: [
            `Seu código é ${otp}.`,
            `Ele expira em ${OTP_EXPIRY_SECONDS / 60} minutos e só pode ser usado uma vez.`,
            "Se você não solicitou este código, ignore este e-mail.",
          ].join("\n\n"),
          idempotencyKey: `email-otp/${messageType}/${crypto.randomUUID()}`,
          react: createElement(SignInOtpEmail, {
            expiresInMinutes: OTP_EXPIRY_SECONDS / 60,
            otp,
            type: messageType,
          }),
        });
      },
    }),
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
          publicEnv.siteUrl || env.betterAuthUrl() || "http://localhost:3000";
        const inviteLink = `${baseUrl}/convite/${data.id}`;
        const expiration = data.invitation.expiresAt.getTime();

        await sendInternalAuthEmail({
          to: data.email,
          subject: "Convite para acessar o Portal Interno Elinsa",
          text: [
            `Você foi convidado(a) por ${data.inviter?.user?.email || "Administrador"} para acessar ${data.organization.name}.`,
            "",
            `Acesse o convite: ${inviteLink}`,
            "",
            isCorporateEmail(data.email, corporateDomain)
              ? "Use sua conta Microsoft corporativa para entrar."
              : "Use o código enviado ao e-mail do convite para entrar.",
          ].join("\n"),
          idempotencyKey: `invite/${data.id}/${expiration}`,
          react: createElement(InviteEmail, {
            inviteLink,
            inviteeEmail: data.email,
            inviterEmail: data.inviter?.user?.email,
            organizationName: data.organization.name,
            role: data.role,
          }),
        });
      },
    }),
    passkey(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;

function passwordlessAccessPolicy(): BetterAuthPlugin {
  const disabledPasswordPaths = new Set([
    "/change-password",
    "/change-email",
    "/email-otp/request-password-reset",
    "/email-otp/reset-password",
    "/forget-password/email-otp",
    "/request-password-reset",
    "/reset-password",
    "/sign-in/email",
    "/sign-up/email",
    "/verify-password",
  ]);

  return {
    id: "elinsa-passwordless-access-policy",
    hooks: {
      before: [
        {
          matcher(context) {
            const path = context.path ?? "";
            return (
              disabledPasswordPaths.has(path) ||
              path.startsWith("/reset-password/")
            );
          },
          handler: createAuthMiddleware(async () => {
            throw APIError.from("BAD_REQUEST", {
              code: "PASSWORD_AUTH_DISABLED",
              message:
                "O acesso por senha foi desativado. Use Microsoft, código por e-mail ou Passkey.",
            });
          }),
        },
        {
          matcher(context) {
            return context.path === "/email-otp/send-verification-otp";
          },
          handler: createAuthMiddleware(async (ctx) => {
            const body = ctx.body as {
              email?: unknown;
              type?: unknown;
            };
            const email =
              typeof body.email === "string" ? normalizeEmail(body.email) : "";

            if (body.type === "forget-password") {
              return ctx.json({ success: true });
            }

            if (!email || body.type === "change-email") {
              return;
            }

            await enforceEmailRateLimit(email, "otp-send", 3, 60);
            const invitationId = getInvitationIdFromHeaders(ctx.headers);
            const access = await resolveOtpAccess(email, invitationId);

            if (access === "denied") {
              return ctx.json({ success: true });
            }

            ctx.body.email = email;
          }),
        },
        {
          matcher(context) {
            return context.path === "/sign-in/email-otp";
          },
          handler: createAuthMiddleware(async (ctx) => {
            const body = ctx.body as {
              email?: unknown;
              invitationId?: unknown;
              name?: unknown;
            };
            const email =
              typeof body.email === "string" ? normalizeEmail(body.email) : "";
            const invitationId =
              typeof body.invitationId === "string"
                ? body.invitationId.trim()
                : "";

            if (!email) {
              throwInvalidOtp();
            }

            await enforceEmailRateLimit(email, "otp-verify", 5, 10 * 60);
            const access = await resolveOtpAccess(email, invitationId);

            if (access === "denied") {
              throwInvalidOtp();
            }

            if (
              access === "invited-external" &&
              (typeof body.name !== "string" ||
                body.name.trim().length < 2 ||
                body.name.trim().length > 120)
            ) {
              throwInvalidOtp();
            }

            ctx.body.email = email;
            if (typeof body.name === "string") {
              ctx.body.name = body.name.trim();
            }
          }),
        },
        {
          matcher(context) {
            return (
              context.path === "/email-otp/request-email-change" ||
              context.path === "/email-otp/change-email"
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const body = ctx.body as { newEmail?: unknown };
            const newEmail =
              typeof body.newEmail === "string"
                ? normalizeEmail(body.newEmail)
                : "";

            await assertExternalEmailChangeAllowed(ctx, newEmail);
            await enforceEmailRateLimit(
              newEmail,
              ctx.path === "/email-otp/request-email-change"
                ? "email-change-send"
                : "email-change-verify",
              ctx.path === "/email-otp/request-email-change" ? 3 : 5,
              ctx.path === "/email-otp/request-email-change" ? 60 : 10 * 60,
            );
            ctx.body.newEmail = newEmail;
          }),
        },
      ],
    },
  };
}

async function resolveOtpAccess(email: string, invitationId?: string) {
  const [existingUserResult, invitationResult] = await Promise.all([
    db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(sql`lower(${schema.user.email}) = ${email}`)
      .limit(1),
    invitationId
      ? db
          .select({
            email: schema.invitation.email,
            expiresAt: schema.invitation.expiresAt,
            status: schema.invitation.status,
          })
          .from(schema.invitation)
          .where(eq(schema.invitation.id, invitationId))
          .limit(1)
      : Promise.resolve([]),
  ]);

  return decideOtpAccess({
    corporateDomain,
    email,
    existingUser: Boolean(existingUserResult[0]),
    invitation: invitationResult[0] ?? null,
  });
}

function getInvitationIdFromHeaders(headers?: Headers) {
  return headers?.get(INVITATION_ID_HEADER)?.trim() || "";
}

function throwInvalidOtp(): never {
  throw APIError.from("BAD_REQUEST", {
    code: "INVALID_OTP",
    message: "Código inválido ou expirado.",
  });
}

async function assertExternalEmailChangeAllowed(
  ctx: Parameters<typeof getSessionFromCtx>[0],
  newEmail: string,
) {
  const currentSession = await getSessionFromCtx(ctx);

  if (!currentSession?.user) {
    throw APIError.from("UNAUTHORIZED", {
      code: "SESSION_REQUIRED",
      message: "Faça login novamente para continuar.",
    });
  }

  if (
    !newEmail ||
    isCorporateEmail(currentSession.user.email, corporateDomain) ||
    isCorporateEmail(newEmail, corporateDomain)
  ) {
    throw APIError.from("FORBIDDEN", {
      code: "EMAIL_MANAGED_BY_MICROSOFT",
      message: "E-mails corporativos são administrados pela Microsoft.",
    });
  }

  const [socialAccount] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, currentSession.user.id),
        ne(schema.account.providerId, "credential"),
      ),
    )
    .limit(1);

  if (socialAccount) {
    throw APIError.from("FORBIDDEN", {
      code: "EMAIL_MANAGED_BY_PROVIDER",
      message: "O e-mail desta conta é administrado pelo provedor de login.",
    });
  }
}

async function enforceEmailRateLimit(
  email: string,
  action: string,
  max: number,
  windowSeconds: number,
) {
  const allowed = await consumeDatabaseRateLimit({
    key: createHashedRateLimitKey(`email/${action}`, email),
    max,
    windowSeconds,
  });

  if (!allowed) {
    throw APIError.from("TOO_MANY_REQUESTS", {
      code: "RATE_LIMITED",
      message: "Muitas tentativas. Aguarde antes de tentar novamente.",
    });
  }
}

async function ensureMicrosoftUserOrganizationMembership(
  userId: string,
  sessionId?: string,
) {
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

  if (sessionId) {
    await db
      .update(schema.session)
      .set({
        activeOrganizationId: org.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.session.id, sessionId));
  }
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
