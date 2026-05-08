import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt"],
  },
  auth: true,
  fields: [
    // Email é adicionado por padrão devido a auth: true
    {
      name: "name",
      type: "text",
      label: "Nome",
      admin: {
        description: "Nome exibido publicamente nas notícias.",
      },
    },
  ],
};
