import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/db/schema";

export function createHashedRateLimitKey(namespace: string, subject: string) {
  const subjectHash = createHash("sha256").update(subject).digest("hex");
  return `${namespace}/${subjectHash}`;
}

export async function consumeDatabaseRateLimit(input: {
  key: string;
  max: number;
  windowSeconds: number;
}) {
  const now = Date.now();
  const cutoff = now - input.windowSeconds * 1000;
  const [result] = await db
    .insert(rateLimit)
    .values({
      id: crypto.randomUUID(),
      key: input.key,
      count: 1,
      lastRequest: now,
    })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql<number>`case when ${rateLimit.lastRequest} < ${cutoff} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql<number>`case when ${rateLimit.lastRequest} < ${cutoff} then ${now} else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count });

  return (result?.count ?? input.max + 1) <= input.max;
}
