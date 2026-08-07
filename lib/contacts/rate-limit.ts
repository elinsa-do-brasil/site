import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactRateLimits } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getClientIp } from "@/lib/get-client-ip";

type HeaderReader = {
  get(name: string): string | null;
};

const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 15;
const IP_HASH_CONTEXT = "contacts/ip-hash/v1";

export class ContactRateLimitError extends Error {
  constructor() {
    super("Contact form rate limit exceeded.");
    this.name = "ContactRateLimitError";
  }
}

function getContactIpHashSecret(): Buffer {
  const raw = env.contactIpHashSecretBase64();

  if (!raw) {
    throw new Error("CONTACT_IP_HASH_SECRET_BASE64 nao configurada.");
  }

  return Buffer.from(raw, "base64");
}

export function getContactIpHash(headersList: HeaderReader) {
  const ip = getClientIp(headersList) ?? "unknown";

  return createHmac("sha256", getContactIpHashSecret())
    .update(IP_HASH_CONTEXT)
    .update("\0")
    .update(ip)
    .digest("hex");
}

export async function assertContactRateLimit(headersList: HeaderReader) {
  const ipHash = getContactIpHash(headersList);
  const maxAttempts = readPositiveInteger(
    env.contactRateLimitMax(),
    DEFAULT_RATE_LIMIT_MAX,
  );
  const windowMinutes = readPositiveInteger(
    env.contactRateLimitWindowMinutes(),
    DEFAULT_RATE_LIMIT_WINDOW_MINUTES,
  );
  const windowMs = windowMinutes * 60 * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const now = new Date();

  const [row] = await db
    .insert(contactRateLimits)
    .values({
      ipHash,
      windowStart,
      count: 1,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [contactRateLimits.ipHash, contactRateLimits.windowStart],
      set: {
        count: sql`${contactRateLimits.count} + 1`,
        updatedAt: now,
      },
    })
    .returning({ count: contactRateLimits.count });

  if ((row?.count ?? 1) > maxAttempts) {
    throw new ContactRateLimitError();
  }

  return { ipHash };
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
