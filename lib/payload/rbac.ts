import type { Access, PayloadRequest, Where } from "payload";

export const payloadRoles = [
  "admin",
  "publisher",
  "editor",
  "recruiter",
] as const;

export type PayloadRole = (typeof payloadRoles)[number];

export const payloadRoleOptions = [
  {
    label: { en: "Administrator", es: "Administrador", pt: "Administrador" },
    value: "admin",
  },
  {
    label: { en: "Publisher", es: "Publicador", pt: "Publicador" },
    value: "publisher",
  },
  {
    label: { en: "Editor", es: "Editor", pt: "Editor" },
    value: "editor",
  },
  {
    label: { en: "Recruiter", es: "Reclutador", pt: "Recrutador" },
    value: "recruiter",
  },
] as const;

export const rbacCollectionSlugs = [
  "blog",
  "imprensa",
  "vagas",
  "media",
  "galeria",
] as const;

export type RBACCollectionSlug = (typeof rbacCollectionSlugs)[number];

const writableCollections: Record<PayloadRole, readonly RBACCollectionSlug[]> =
  {
    admin: rbacCollectionSlugs,
    publisher: rbacCollectionSlugs,
    editor: ["blog", "imprensa", "media", "galeria"],
    recruiter: ["vagas", "media"],
  };

type UserLike =
  | {
      id?: number | string;
      role?: unknown;
    }
  | null
  | undefined;

export function isPayloadRole(value: unknown): value is PayloadRole {
  return (
    typeof value === "string" && payloadRoles.includes(value as PayloadRole)
  );
}

export function getPayloadRole(user: UserLike): PayloadRole | undefined {
  return isPayloadRole(user?.role) ? user.role : undefined;
}

export function isPayloadUser(user: UserLike): boolean {
  return Boolean(user?.id && getPayloadRole(user));
}

export function hasPayloadRole(
  user: UserLike,
  roles: readonly PayloadRole[],
): boolean {
  const role = getPayloadRole(user);
  return Boolean(role && roles.includes(role));
}

export function canManageUsers(user: UserLike): boolean {
  return hasPayloadRole(user, ["admin"]);
}

export function canPublish(user: UserLike): boolean {
  return hasPayloadRole(user, ["admin", "publisher"]);
}

export function canDelete(user: UserLike): boolean {
  return canPublish(user);
}

export function canManageAdminTools(user: UserLike): boolean {
  return canPublish(user);
}

export function canWriteCollection(
  user: UserLike,
  collection: RBACCollectionSlug,
): boolean {
  const role = getPayloadRole(user);
  return Boolean(role && writableCollections[role].includes(collection));
}

export function getWritableCollections(
  user: UserLike,
): readonly RBACCollectionSlug[] {
  const role = getPayloadRole(user);
  return role ? writableCollections[role] : [];
}

export const isAuthenticatedPayloadUser: Access = ({ req }) =>
  isPayloadUser(req.user);

export const adminOnly: Access = ({ req }) => canManageUsers(req.user);

export const publisherOrAdmin: Access = ({ req }) =>
  canManageAdminTools(req.user);

export function writeAccess(collection: RBACCollectionSlug): Access {
  return ({ req }) => canWriteCollection(req.user, collection);
}

export function draftWriterUpdateAccess(
  collection: Extract<RBACCollectionSlug, "blog" | "imprensa" | "vagas">,
): Access {
  return ({ data, req }) => {
    if (!canWriteCollection(req.user, collection)) {
      return false;
    }

    if (canPublish(req.user)) {
      return true;
    }

    return data?._status !== "published";
  };
}

export function deleteAccess(collection: RBACCollectionSlug): Access {
  return ({ req }) =>
    canWriteCollection(req.user, collection) && canDelete(req.user);
}

export function publicPublishedReadAccess(
  collection: "imprensa" | "vagas",
): Access {
  return ({ req }): boolean | Where => {
    if (canDelete(req.user) && canWriteCollection(req.user, collection)) {
      return true;
    }

    if (canWriteCollection(req.user, collection)) {
      return {
        deletedAt: {
          exists: false,
        },
      };
    }

    return {
      and: [
        {
          _status: {
            equals: "published",
          },
        },
        {
          deletedAt: {
            exists: false,
          },
        },
      ],
    };
  };
}

export const privateBlogReadAccess: Access = ({ req }) => {
  if (canDelete(req.user) && canWriteCollection(req.user, "blog")) {
    return true;
  }

  return canWriteCollection(req.user, "blog")
    ? {
        deletedAt: {
          exists: false,
        },
      }
    : false;
};

export function publicAssetReadAccess(
  collection: Extract<RBACCollectionSlug, "media" | "galeria">,
): Access {
  return ({ req }): boolean | Where =>
    canDelete(req.user) && canWriteCollection(req.user, collection)
      ? true
      : {
          deletedAt: {
            exists: false,
          },
        };
}

export function isSelf(
  req: Pick<PayloadRequest, "user">,
  id: number | string | undefined,
): boolean {
  return Boolean(req.user?.id && id && String(req.user.id) === String(id));
}

export function canReadPrivateUserField({
  id,
  req,
}: {
  id?: number | string;
  req: Pick<PayloadRequest, "user">;
}): boolean {
  return canManageUsers(req.user) || isSelf(req, id);
}

export function canUpdateUser({
  req,
}: {
  req: Pick<PayloadRequest, "user">;
}): boolean | Where {
  if (canManageUsers(req.user)) {
    return true;
  }

  if (!isPayloadUser(req.user)) {
    return false;
  }

  const userID = req.user?.id;

  return {
    id: {
      equals: userID,
    },
  };
}
