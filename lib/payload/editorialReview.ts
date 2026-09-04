import type { PayloadRequest, Where } from "payload";
import type { User } from "../../payload-types.ts";
import { canPublish } from "./rbac.ts";

export const editorialReviewCollections = [
  "blog",
  "imprensa",
  "vagas",
] as const;

export type EditorialReviewCollection =
  (typeof editorialReviewCollections)[number];
export type EditorialReviewState = "changed" | "new";

export type EditorialReviewItem = {
  collection: EditorialReviewCollection;
  href: string;
  id: number | string;
  lastModifiedBy: string;
  state: EditorialReviewState;
  title: string;
  updatedAt: string;
};

export type EditorialReviewFilters = {
  area: EditorialReviewCollection | "todas";
  page: number;
  query: string;
};

export type EditorialReviewBreakdown = Record<
  EditorialReviewCollection,
  number
>;

export type EditorialReviewQueue = {
  breakdown: EditorialReviewBreakdown;
  filters: EditorialReviewFilters;
  items: EditorialReviewItem[];
  page: number;
  perPage: number;
  totalDocs: number;
  totalPages: number;
};

export type EditorialReviewSummary = {
  breakdown: EditorialReviewBreakdown;
  totalDocs: number;
};

export type EditorialReviewCandidate = Omit<EditorialReviewItem, "state"> & {
  lastModifiedByID?: number | string;
};

type EditorialDocument = {
  id: number | string;
  lastModifiedBy?: {
    relationTo: "users";
    value: number | string | User;
  } | null;
  title?: string | null;
  updatedAt?: string | null;
};

type SearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PER_PAGE = 20;
const MAX_PAGE = 100;
const UNTITLED_FALLBACK = "Sem título";
const USER_FALLBACK = "Usuário indisponível";

export class EditorialReviewForbiddenError extends Error {
  constructor() {
    super("O usuário não pode acessar as pendências editoriais.");
    this.name = "EditorialReviewForbiddenError";
  }
}

function isEditorialReviewCollection(
  value: unknown,
): value is EditorialReviewCollection {
  return (
    typeof value === "string" &&
    editorialReviewCollections.includes(value as EditorialReviewCollection)
  );
}

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function parseEditorialReviewFilters(
  searchParams: SearchParams | undefined,
): EditorialReviewFilters {
  const query = getSingleSearchParam(searchParams?.q)?.trim() ?? "";
  const requestedArea = getSingleSearchParam(searchParams?.area);
  const requestedPage = Number(getSingleSearchParam(searchParams?.page));

  return {
    area: isEditorialReviewCollection(requestedArea) ? requestedArea : "todas",
    page:
      Number.isInteger(requestedPage) &&
      requestedPage >= 1 &&
      requestedPage <= MAX_PAGE
        ? requestedPage
        : 1,
    query,
  };
}

function getLastModifiedByName(document: EditorialDocument): string {
  const value = document.lastModifiedBy?.value;

  if (
    value &&
    typeof value === "object" &&
    "name" in value &&
    typeof value.name === "string" &&
    value.name.trim()
  ) {
    return value.name.trim();
  }

  return USER_FALLBACK;
}

function getLastModifiedByID(
  document: EditorialDocument,
): number | string | undefined {
  const value = document.lastModifiedBy?.value;

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    return typeof value.id === "number" || typeof value.id === "string"
      ? value.id
      : undefined;
  }

  return undefined;
}

function getDocumentTitle(document: EditorialDocument): string {
  return typeof document.title === "string" && document.title.trim()
    ? document.title.trim()
    : UNTITLED_FALLBACK;
}

function getUpdatedAt(document: EditorialDocument): string {
  return typeof document.updatedAt === "string" &&
    !Number.isNaN(Date.parse(document.updatedAt))
    ? document.updatedAt
    : new Date(0).toISOString();
}

export function createEditorialReviewCandidate({
  adminRoute,
  collection,
  document,
}: {
  adminRoute: string;
  collection: EditorialReviewCollection;
  document: EditorialDocument;
}): EditorialReviewCandidate {
  const encodedID = encodeURIComponent(String(document.id));

  return {
    collection,
    href: `${adminRoute}/collections/${collection}/${encodedID}`,
    id: document.id,
    lastModifiedBy: getLastModifiedByName(document),
    lastModifiedByID: getLastModifiedByID(document),
    title: getDocumentTitle(document),
    updatedAt: getUpdatedAt(document),
  };
}

export function getEditorialReviewCandidateKey(
  item: Pick<EditorialReviewCandidate, "collection" | "id">,
): string {
  return `${item.collection}:${String(item.id)}`;
}

export function mergeEditorialReviewCandidates({
  candidates,
  page,
  perPage,
}: {
  candidates: EditorialReviewCandidate[];
  page: number;
  perPage: number;
}): EditorialReviewCandidate[] {
  const uniqueCandidates = new Map<string, EditorialReviewCandidate>();

  for (const candidate of candidates) {
    const key = getEditorialReviewCandidateKey(candidate);
    const existing = uniqueCandidates.get(key);

    if (
      !existing ||
      Date.parse(candidate.updatedAt) > Date.parse(existing.updatedAt)
    ) {
      uniqueCandidates.set(key, candidate);
    }
  }

  const offset = (page - 1) * perPage;

  return [...uniqueCandidates.values()]
    .sort((left, right) => {
      const dateDifference =
        Date.parse(right.updatedAt) - Date.parse(left.updatedAt);

      return (
        dateDifference ||
        getEditorialReviewCandidateKey(left).localeCompare(
          getEditorialReviewCandidateKey(right),
        )
      );
    })
    .slice(offset, offset + perPage);
}

export function classifyEditorialReviewCandidates({
  candidates,
  publishedKeys,
}: {
  candidates: EditorialReviewCandidate[];
  publishedKeys: ReadonlySet<string>;
}): EditorialReviewItem[] {
  return candidates.map((candidate) => {
    const { lastModifiedByID: _lastModifiedByID, ...item } = candidate;

    return {
      ...item,
      state: publishedKeys.has(getEditorialReviewCandidateKey(candidate))
        ? "changed"
        : "new",
    };
  });
}

function getSelectedCollections(
  area: EditorialReviewFilters["area"],
): readonly EditorialReviewCollection[] {
  return area === "todas" ? editorialReviewCollections : [area];
}

function getPendingWhere(query: string): Where {
  const clauses: Where[] = [
    {
      _status: {
        equals: "draft",
      },
    },
    {
      deletedAt: {
        exists: false,
      },
    },
  ];

  if (query) {
    clauses.push({
      title: {
        contains: query,
      },
    });
  }

  return { and: clauses };
}

function getParentID(parent: unknown): number | string | undefined {
  if (typeof parent === "number" || typeof parent === "string") {
    return parent;
  }

  if (parent && typeof parent === "object" && "id" in parent) {
    const id = parent.id;
    return typeof id === "number" || typeof id === "string" ? id : undefined;
  }

  return undefined;
}

async function getPublishedCandidateKeys({
  candidates,
  req,
}: {
  candidates: EditorialReviewCandidate[];
  req: PayloadRequest;
}): Promise<Set<string>> {
  const candidatesByCollection = new Map<
    EditorialReviewCollection,
    EditorialReviewCandidate[]
  >();

  for (const collection of editorialReviewCollections) {
    candidatesByCollection.set(
      collection,
      candidates.filter((candidate) => candidate.collection === collection),
    );
  }

  const publishedByCollection = await Promise.all(
    editorialReviewCollections.map(async (collection) => {
      const collectionCandidates = candidatesByCollection.get(collection) ?? [];

      if (!collectionCandidates.length) {
        return [] as string[];
      }

      const versions = await req.payload.findVersions({
        collection,
        depth: 0,
        overrideAccess: false,
        pagination: false,
        req,
        trash: false,
        user: req.user ?? undefined,
        where: {
          and: [
            {
              parent: {
                in: collectionCandidates.map((candidate) => candidate.id),
              },
            },
            {
              "version._status": {
                equals: "published",
              },
            },
          ],
        },
      });

      return versions.docs.flatMap((version) => {
        const parentID = getParentID(version.parent);
        return parentID === undefined ? [] : [`${collection}:${parentID}`];
      });
    }),
  );

  return new Set(publishedByCollection.flat());
}

function assertEditorialReviewAccess(req: PayloadRequest): void {
  if (!canPublish(req.user)) {
    throw new EditorialReviewForbiddenError();
  }
}

async function hydrateCandidateAuthors({
  candidates,
  req,
}: {
  candidates: EditorialReviewCandidate[];
  req: PayloadRequest;
}): Promise<EditorialReviewCandidate[]> {
  const unresolvedUserIDs = [
    ...new Set(
      candidates.flatMap((candidate) =>
        candidate.lastModifiedBy === USER_FALLBACK &&
        candidate.lastModifiedByID !== undefined
          ? [candidate.lastModifiedByID]
          : [],
      ),
    ),
  ];

  if (!unresolvedUserIDs.length) {
    return candidates;
  }

  const users = await req.payload.find({
    collection: "users",
    depth: 0,
    overrideAccess: false,
    pagination: false,
    req,
    select: {
      name: true,
    },
    user: req.user ?? undefined,
    where: {
      id: {
        in: unresolvedUserIDs,
      },
    },
  });
  const namesByID = new Map(
    users.docs.flatMap((user) =>
      typeof user.name === "string" && user.name.trim()
        ? [[String(user.id), user.name.trim()] as const]
        : [],
    ),
  );

  return candidates.map((candidate) => ({
    ...candidate,
    lastModifiedBy:
      candidate.lastModifiedByID === undefined
        ? candidate.lastModifiedBy
        : (namesByID.get(String(candidate.lastModifiedByID)) ??
          candidate.lastModifiedBy),
  }));
}

export async function getEditorialReviewQueue({
  perPage = DEFAULT_PER_PAGE,
  req,
  searchParams,
}: {
  perPage?: number;
  req: PayloadRequest;
  searchParams?: SearchParams;
}): Promise<EditorialReviewQueue> {
  assertEditorialReviewAccess(req);

  const filters = parseEditorialReviewFilters(searchParams);
  const collections = getSelectedCollections(filters.area);
  const candidateLimit = filters.page * perPage;
  const adminRoute = req.payload.config.routes.admin;
  const results = await Promise.all(
    collections.map(async (collection) => {
      const result = await req.payload.find({
        collection,
        depth: 1,
        draft: true,
        limit: candidateLimit,
        overrideAccess: false,
        page: 1,
        populate: {
          users: {
            name: true,
          },
        },
        req,
        select: {
          lastModifiedBy: true,
          title: true,
          updatedAt: true,
        },
        sort: "-updatedAt",
        trash: false,
        user: req.user ?? undefined,
        where: getPendingWhere(filters.query),
      });

      const candidates = result.docs.map((document) =>
        createEditorialReviewCandidate({
          adminRoute,
          collection,
          document: document as EditorialDocument,
        }),
      );

      return {
        candidates,
        collection,
        totalDocs: result.totalDocs,
      };
    }),
  );

  const breakdown: EditorialReviewBreakdown = {
    blog: 0,
    imprensa: 0,
    vagas: 0,
  };

  for (const result of results) {
    breakdown[result.collection] = result.totalDocs;
  }

  const totalDocs = Object.values(breakdown).reduce(
    (total, count) => total + count,
    0,
  );
  const totalPages = Math.ceil(totalDocs / perPage);
  const page = totalPages === 0 || filters.page > totalPages ? 1 : filters.page;
  const normalizedFilters = { ...filters, page };
  const pageCandidates = await hydrateCandidateAuthors({
    candidates: mergeEditorialReviewCandidates({
      candidates: results.flatMap((result) => result.candidates),
      page,
      perPage,
    }),
    req,
  });
  const publishedKeys = await getPublishedCandidateKeys({
    candidates: pageCandidates,
    req,
  });

  return {
    breakdown,
    filters: normalizedFilters,
    items: classifyEditorialReviewCandidates({
      candidates: pageCandidates,
      publishedKeys,
    }),
    page,
    perPage,
    totalDocs,
    totalPages,
  };
}

export async function getEditorialReviewSummary({
  req,
}: {
  req: PayloadRequest;
}): Promise<EditorialReviewSummary> {
  assertEditorialReviewAccess(req);

  const results = await Promise.all(
    editorialReviewCollections.map(async (collection) => {
      const result = await req.payload.find({
        collection,
        depth: 0,
        draft: true,
        limit: 1,
        overrideAccess: false,
        page: 1,
        req,
        select: {},
        trash: false,
        user: req.user ?? undefined,
        where: getPendingWhere(""),
      });

      return [collection, result.totalDocs] as const;
    }),
  );
  const breakdown = Object.fromEntries(results) as EditorialReviewBreakdown;

  return {
    breakdown,
    totalDocs: Object.values(breakdown).reduce(
      (total, count) => total + count,
      0,
    ),
  };
}
