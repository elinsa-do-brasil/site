import { APIError, type CollectionConfig, type PayloadRequest } from "payload";
import {
  adminOnly,
  canManageUsers,
  canReadPrivateUserField,
  canUpdateUser,
  isAuthenticatedPayloadUser,
  isPayloadUser,
  payloadRoleOptions,
} from "../lib/payload/rbac.ts";

async function countAdmins(req: PayloadRequest): Promise<number> {
  const result = await req.payload.count({
    collection: "users",
    overrideAccess: true,
    req,
    where: {
      role: {
        equals: "admin",
      },
    },
  });

  return result.totalDocs;
}

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role", "createdAt"],
    hidden: ({ user }) => !canManageUsers(user),
  },
  access: {
    admin: ({ req }) => isPayloadUser(req.user),
    create: adminOnly,
    delete: adminOnly,
    read: isAuthenticatedPayloadUser,
    unlock: adminOnly,
    update: canUpdateUser,
  },
  auth: true,
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({
          collection: "users",
          id,
          depth: 0,
          overrideAccess: true,
          req,
        });

        if (
          (user as { role?: unknown }).role === "admin" &&
          (await countAdmins(req)) <= 1
        ) {
          throw new APIError(
            "Não é possível excluir o último administrador.",
            400,
            undefined,
            true,
          );
        }
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === "create" && !data?.role && !req.user) {
          const users = await req.payload.count({
            collection: "users",
            overrideAccess: true,
            req,
          });

          if (users.totalDocs === 0) {
            return {
              ...data,
              role: "admin",
            };
          }
        }

        if (
          operation === "update" &&
          originalDoc?.role === "admin" &&
          data?.role &&
          data.role !== "admin" &&
          (await countAdmins(req)) <= 1
        ) {
          throw new APIError(
            "Não é possível rebaixar o último administrador.",
            400,
            undefined,
            true,
          );
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "email",
      type: "email",
      label: "E-mail",
      required: true,
      unique: true,
      access: {
        create: ({ req }) => canManageUsers(req.user),
        read: ({ doc, id, req }) =>
          canReadPrivateUserField({ id: id ?? doc?.id, req }),
        update: ({ doc, id, req }) =>
          canReadPrivateUserField({ id: id ?? doc?.id, req }),
      },
    },
    {
      name: "name",
      type: "text",
      label: "Nome",
      admin: {
        description: "Nome exibido publicamente nas notícias.",
      },
    },
    {
      name: "role",
      type: "select",
      label: "Função",
      required: true,
      saveToJWT: true,
      options: [...payloadRoleOptions],
      access: {
        create: ({ req }) => canManageUsers(req.user),
        read: ({ doc, id, req }) =>
          canReadPrivateUserField({ id: id ?? doc?.id, req }),
        update: ({ req }) => canManageUsers(req.user),
      },
      admin: {
        description:
          "Define as áreas e operações disponíveis no painel administrativo.",
        position: "sidebar",
      },
    },
  ],
};
