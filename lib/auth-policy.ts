export const DEFAULT_CORPORATE_EMAIL_DOMAIN = "grupoamperelinsa.com";

export type OtpAccessDecision = "existing-user" | "invited-external" | "denied";

type InvitationSnapshot = {
  email: string;
  expiresAt: Date | null;
  status: string;
};

type MicrosoftProfile = {
  acct?: number;
  email?: string;
  name?: string;
  preferred_username?: string;
  tid?: string;
  upn?: string;
};

export class MicrosoftProfileValidationError extends Error {
  constructor(
    public readonly code:
      | "MICROSOFT_GUEST_NOT_ALLOWED"
      | "MICROSOFT_INVALID_EMAIL"
      | "MICROSOFT_INVALID_TENANT",
  ) {
    super(code);
    this.name = "MicrosoftProfileValidationError";
  }
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeCorporateDomain(value?: string) {
  const normalized = value?.trim().toLowerCase().replace(/^@/, "");
  return normalized || DEFAULT_CORPORATE_EMAIL_DOMAIN;
}

export function isCorporateEmail(email: string, domain?: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedDomain = normalizeCorporateDomain(domain);
  const suffix = `@${normalizedDomain}`;

  return (
    normalizedEmail.length > suffix.length && normalizedEmail.endsWith(suffix)
  );
}

export function decideOtpAccess(input: {
  email: string;
  existingUser: boolean;
  invitation?: InvitationSnapshot | null;
  corporateDomain?: string;
  now?: Date;
}): OtpAccessDecision {
  if (input.existingUser) {
    return "existing-user";
  }

  if (isCorporateEmail(input.email, input.corporateDomain)) {
    return "denied";
  }

  const invitation = input.invitation;
  const now = input.now ?? new Date();
  const isValidInvitation =
    invitation?.status === "pending" &&
    invitation.expiresAt !== null &&
    invitation.expiresAt > now &&
    normalizeEmail(invitation.email) === normalizeEmail(input.email);

  return isValidInvitation ? "invited-external" : "denied";
}

export function mapMicrosoftProfileToUser(
  profile: MicrosoftProfile,
  options: {
    corporateDomain?: string;
    tenantId: string;
  },
) {
  const expectedTenantId = options.tenantId.trim().toLowerCase();
  const profileTenantId = profile.tid?.trim().toLowerCase();

  if (!expectedTenantId || profileTenantId !== expectedTenantId) {
    throw new MicrosoftProfileValidationError("MICROSOFT_INVALID_TENANT");
  }

  if (profile.acct === 1) {
    throw new MicrosoftProfileValidationError("MICROSOFT_GUEST_NOT_ALLOWED");
  }

  const email = [profile.email, profile.preferred_username, profile.upn]
    .filter((value): value is string => typeof value === "string")
    .map(normalizeEmail)
    .find((value) => isCorporateEmail(value, options.corporateDomain));

  if (!email) {
    throw new MicrosoftProfileValidationError("MICROSOFT_INVALID_EMAIL");
  }

  return {
    email,
    emailVerified: true,
    name: profile.name?.trim() || email.split("@")[0] || "Usuário Elinsa",
  };
}
