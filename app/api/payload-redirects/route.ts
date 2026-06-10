import configPromise from "@payload-config";
import { type CollectionSlug, getPayload } from "payload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RedirectDoc = {
  from?: null | string;
  to?: {
    reference?: null | {
      relationTo?: null | string;
      value?: null | number | string | { slug?: null | string };
    };
    type?: "custom" | "reference" | null;
    url?: null | string;
  };
  type?: null | string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pathname = normalizePathname(searchParams.get("pathname"));

  if (!pathname) {
    return Response.json({ error: "Missing pathname" }, { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "redirects",
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      or: [
        {
          from: {
            equals: pathname,
          },
        },
        {
          from: {
            equals: pathname === "/" ? pathname : `${pathname}/`,
          },
        },
      ],
    },
  });
  const redirect = docs[0] as RedirectDoc | undefined;

  if (!redirect) {
    return Response.json(null, { status: 404 });
  }

  const destination = await resolveDestination(redirect);

  if (!destination || destination === pathname) {
    return Response.json(null, { status: 404 });
  }

  return Response.json(
    {
      destination,
      statusCode: getRedirectStatusCode(redirect.type),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

async function resolveDestination(redirect: RedirectDoc) {
  if (redirect.to?.type === "custom") {
    return redirect.to.url || null;
  }

  const reference = redirect.to?.reference;
  const relationTo = reference?.relationTo;
  const value = reference?.value;

  if (!relationTo || !value) {
    return null;
  }

  if (!isPublicContentCollection(relationTo)) {
    return null;
  }

  if (typeof value === "object") {
    return getDocumentPath(relationTo, value.slug);
  }

  const payload = await getPayload({ config: configPromise });
  const doc = await payload.findByID({
    collection: relationTo,
    depth: 0,
    id: value,
  });

  return getDocumentPath(relationTo, (doc as { slug?: null | string }).slug);
}

function getDocumentPath(collection: string, slug: null | string | undefined) {
  if (!slug) {
    return null;
  }

  if (collection === "blog") {
    return `/portal/blog/${slug}`;
  }

  if (collection === "imprensa") {
    return `/imprensa/${slug}`;
  }

  if (collection === "vagas") {
    return `/vagas/${slug}`;
  }

  return null;
}

function isPublicContentCollection(value: string): value is CollectionSlug {
  return value === "blog" || value === "imprensa" || value === "vagas";
}

function getRedirectStatusCode(type: null | string | undefined) {
  const statusCode = Number(type);

  return [301, 302, 303, 307, 308].includes(statusCode) ? statusCode : 308;
}

function normalizePathname(value: null | string) {
  if (!value) {
    return null;
  }

  const pathname = value.startsWith("/") ? value : `/${value}`;

  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}
