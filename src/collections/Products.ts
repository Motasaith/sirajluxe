import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'inStock', 'featured'],
    group: 'Shop',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'originalPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price before discount (optional)',
      },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. Footwear, Watches, Audio, Apparel, Tech, Accessories, Bags',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Product tags like New, Sale, Hot, Limited, etc.',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5,
    },
    {
      name: 'reviews',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of reviews',
      },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'image',
      type: 'text',
      admin: {
        description: 'Primary product image URL',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Additional product images',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'colors',
      type: 'array',
      fields: [
        {
          name: 'color',
          type: 'text',
          required: true,
          admin: {
            description: 'CSS color value, e.g. #000000',
          },
        },
      ],
    },
    {
      name: 'sizes',
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'inventory',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
