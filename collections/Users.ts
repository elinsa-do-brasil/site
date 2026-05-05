import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email é adicionado por padrão devido a auth: true
    {
      name: 'name',
      type: 'text',
      label: 'Nome',
    },
  ],
}
