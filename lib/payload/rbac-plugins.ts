import type {
  CollectionConfig,
  Endpoint,
  PayloadHandler,
  Plugin,
} from "payload";
import { canManageAdminTools } from "./rbac.ts";

const denyAdminToolAccess: PayloadHandler = () =>
  Response.json(
    {
      errors: [
        {
          message: "Você não tem permissão para usar esta ferramenta.",
        },
      ],
    },
    { status: 403 },
  );

function protectEndpoint(endpoint: Endpoint): Endpoint {
  const handler = endpoint.handler;

  return {
    ...endpoint,
    handler: (req) =>
      canManageAdminTools(req.user) ? handler(req) : denyAdminToolAccess(req),
  };
}

function protectEndpoints(
  endpoints: CollectionConfig["endpoints"],
): CollectionConfig["endpoints"] {
  return endpoints ? endpoints.map(protectEndpoint) : endpoints;
}

type AdminToolCollectionOptions = {
  publicRead?: boolean;
  readOnly?: boolean;
};

export function restrictAdminToolCollection(
  collection: CollectionConfig,
  { publicRead = false, readOnly = false }: AdminToolCollectionOptions = {},
): CollectionConfig {
  return {
    ...collection,
    access: {
      ...collection.access,
      admin: ({ req }) => canManageAdminTools(req.user),
      create: readOnly
        ? () => false
        : ({ req }) => canManageAdminTools(req.user),
      delete: readOnly
        ? () => false
        : ({ req }) => canManageAdminTools(req.user),
      read: publicRead
        ? () => true
        : ({ req }) => canManageAdminTools(req.user),
      unlock: readOnly
        ? () => false
        : ({ req }) => canManageAdminTools(req.user),
      update: readOnly
        ? () => false
        : ({ req }) => canManageAdminTools(req.user),
    },
    admin: {
      ...collection.admin,
      hidden: ({ user }) => !canManageAdminTools(user),
    },
    endpoints: protectEndpoints(collection.endpoints),
  };
}

export function restrictImportExportCollection(
  collection: CollectionConfig,
): CollectionConfig {
  return {
    ...restrictAdminToolCollection(collection),
    access: {
      ...collection.access,
      admin: ({ req }) => canManageAdminTools(req.user),
      create: ({ req }) => canManageAdminTools(req.user),
      delete: ({ req }) => canManageAdminTools(req.user),
      read: ({ req }) => canManageAdminTools(req.user),
      unlock: ({ req }) => canManageAdminTools(req.user),
      update: () => false,
    },
    endpoints: protectEndpoints(collection.endpoints),
  };
}

export function restrictImportExportMenuItems(
  collectionSlugs: readonly string[],
): Plugin {
  return (config) => {
    for (const collection of config.collections ?? []) {
      if (!collectionSlugs.includes(collection.slug)) {
        continue;
      }

      const listMenuItems = collection.admin?.components?.listMenuItems ?? [];
      const filtered = listMenuItems.filter((component) => {
        if (!component) {
          return true;
        }

        const componentPath =
          typeof component === "string" ? component : component.path;

        return !componentPath.includes("@payloadcms/plugin-import-export");
      });

      if (filtered.length === listMenuItems.length) {
        continue;
      }

      collection.admin = {
        ...collection.admin,
        components: {
          ...collection.admin?.components,
          listMenuItems: [
            ...filtered,
            {
              path: "/components/payload/RoleImportExportMenuItems#RoleImportExportMenuItems",
              serverProps: {
                collectionSlug: collection.slug,
                exportCollectionSlug: "exports",
                importCollectionSlug: "imports",
              },
            },
          ],
        },
      };
    }

    return config;
  };
}
