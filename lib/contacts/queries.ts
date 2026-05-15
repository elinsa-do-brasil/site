import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import type { ContactFormData, ContactStatus } from "./validators";

export type ContactListFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: ContactStatus;
};

export async function createContact(
  input: ContactFormData,
  metadata: {
    ipHash: string;
    userAgent?: string | null;
  },
) {
  const [contact] = await db
    .insert(contacts)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: emptyToNull(input.phone),
      company: emptyToNull(input.company),
      subject: emptyToNull(input.subject),
      message: input.message,
      ipHash: metadata.ipHash,
      userAgent: metadata.userAgent?.slice(0, 1000) ?? null,
    })
    .returning();

  if (!contact) {
    throw new Error("Contact insert did not return a row.");
  }

  return contact;
}

export async function updateContactEmailNotification(
  contactId: string,
  input: {
    error?: string | null;
    sent: boolean;
  },
) {
  await db
    .update(contacts)
    .set({
      emailNotificationError: input.error ?? null,
      emailNotificationSent: input.sent,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId));
}

export async function listContacts(filters: ContactListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(100, Math.max(1, filters.perPage ?? 20));
  const offset = (page - 1) * perPage;
  const whereClause = buildContactWhere(filters);

  let rowsQuery = db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      phone: contacts.phone,
      company: contacts.company,
      subject: contacts.subject,
      message: contacts.message,
      status: contacts.status,
      emailNotificationSent: contacts.emailNotificationSent,
      emailNotificationError: contacts.emailNotificationError,
      createdAt: contacts.createdAt,
      updatedAt: contacts.updatedAt,
    })
    .from(contacts)
    .$dynamic();
  let totalQuery = db.select({ value: count() }).from(contacts).$dynamic();

  if (whereClause) {
    rowsQuery = rowsQuery.where(whereClause);
    totalQuery = totalQuery.where(whereClause);
  }

  const [rows, totalRows] = await Promise.all([
    rowsQuery
      .orderBy(desc(contacts.createdAt), desc(contacts.id))
      .limit(perPage)
      .offset(offset),
    totalQuery,
  ]);
  const total = Number(totalRows[0]?.value ?? 0);

  return {
    contacts: rows,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}

export async function updateContactStatus(
  contactId: string,
  status: ContactStatus,
) {
  const [contact] = await db
    .update(contacts)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId))
    .returning({ id: contacts.id });

  return contact ?? null;
}

function buildContactWhere(filters: ContactListFilters) {
  const conditions: SQL[] = [];
  const search = filters.search?.trim();

  if (filters.status) {
    conditions.push(eq(contacts.status, filters.status));
  }

  if (search) {
    const pattern = `%${search}%`;
    const searchCondition = or(
      ilike(contacts.name, pattern),
      ilike(contacts.email, pattern),
      ilike(contacts.phone, pattern),
      ilike(contacts.company, pattern),
      ilike(contacts.subject, pattern),
      ilike(contacts.message, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions.length ? and(...conditions) : undefined;
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
