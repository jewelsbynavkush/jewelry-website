import { defineField, defineType } from 'sanity'
import { formatCategoryName } from '@/lib/utils/text-formatting'

export default defineType({
  name: 'jewelryDesign',
  title: 'Jewelry Design',
  type: 'document',
  icon: () => '💍',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name of the jewelry piece',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title (auto-generated)',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Detailed description of the jewelry piece',
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(500),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Main image of the jewelry piece',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility',
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      description: 'Material description (e.g., 14k yellow gold)',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD (optional)',
      validation: (Rule) => Rule.positive().precision(2),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Category of the jewelry',
      options: {
        list: [
          { title: 'Rings', value: 'rings' },
          { title: 'Necklaces', value: 'necklaces' },
          { title: 'Earrings', value: 'earrings' },
          { title: 'Bracelets', value: 'bracelets' },
          { title: 'Brooches', value: 'brooches' },
          { title: 'Watches', value: 'watches' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this design on the home page',
      initialValue: false,
    }),
    defineField({
      name: 'mostLoved',
      title: 'Most Loved',
      type: 'boolean',
      description: 'Show in "Our Most Loved Creations" section',
      initialValue: false,
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      description: 'Is this item currently in stock?',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      category: 'category',
      price: 'price',
    },
    prepare({ title, media, category, price }) {
      return {
        title: title || 'Untitled',
        subtitle: `${category ? formatCategoryName(category) : 'Uncategorized'}${price ? ` - $${price}` : ''}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Title, Z-A',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }],
    },
    {
      title: 'Price, Low to High',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
    {
      title: 'Price, High to Low',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
})
