import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Imagens precisam ser públicas para exibição no site
  },
  upload: {
    staticDir: 'media', // Folder where files will be stored
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined, // undefined prevents forced cropping and maintains aspect ratio
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: undefined, // undefined prevents forced cropping
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    crop: true, // Allows you to manually crop images in the admin panel
    focalPoint: true, // Allows setting the focal point
  },
  folders: true,
  trash: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto Alternativo',
      required: true,
    },
  ],
}
