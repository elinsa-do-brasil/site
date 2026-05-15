import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactRateLimits } from "@/lib/db/schema";

type HeaderReader = {
  get(name: string): string | null;
};

const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 15;

export class ContactRateLimitError extends Error {
  constructor() {
    super("Contact form rate limit exceeded.");
    this.name = "ContactRateLimitError";
  }
}

export function getContactIpHash(headersList: HeaderReader) {
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

  return createHash("sha256").update(ip).digest("hex");
}

export async function assertContactRateLimit(headersList: HeaderReader) {
  const ipHash = getContactIpHash(headersList);
  const maxAttempts = readPositiveInteger(
    process.env.CONTACT_RATE_LIMIT_MAX,
    DEFAULT_RATE_LIMIT_MAX,
  );
  const windowMinutes = readPositiveInteger(
    process.env.CONTACT_RATE_LIMIT_WINDOW_MINUTES,
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
