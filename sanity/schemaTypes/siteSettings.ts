import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'brandName',
      title: 'Brand Name',
      type: 'string',
      description: 'Your jewelry brand name (e.g., CELESTIQUE)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Brand tagline (e.g., A CELESTIAL TOUCH FOR TIMELESS MOMENTS)',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Brand logo image',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Section Title',
      type: 'string',
      description: 'Main hero title (e.g., COLLECTION 2025)',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      description: 'Hero section description text',
      rows: 4,
    }),
    defineField({
      name: 'heroButtonText',
      title: 'Hero Button Text',
      type: 'string',
      description: 'Text for hero CTA button (e.g., DISCOVER)',
      initialValue: 'DISCOVER',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main hero image (hand with jewelry) - displayed in center column of intro section',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility (e.g., "Elegant hand displaying gold rings")',
        },
      ],
    }),
    defineField({
      name: 'rightColumnSlogan',
      title: 'Right Column Slogan',
      type: 'string',
      description: 'Slogan text for the right column in intro section',
    }),
    defineField({
      name: 'aboutTitle',
      title: 'About Us Title',
      type: 'string',
      description: 'About section title',
      initialValue: 'ABOUT US',
    }),
    defineField({
      name: 'aboutContent',
      title: 'About Us Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'About us text content',
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Us Image',
      type: 'image',
      description: 'About section image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'aboutButtonText',
      title: 'About Button Text',
      type: 'string',
      initialValue: 'MORE ABOUT US',
    }),
    defineField({
      name: 'mostLovedTitle',
      title: 'Most Loved Section Title',
      type: 'string',
      initialValue: 'OUR MOST LOVED CREATIONS',
    }),
    defineField({
      name: 'mostLovedSlogan',
      title: 'Most Loved Section Slogan',
      type: 'string',
      description: 'Slogan text above the Most Loved Creations section',
    }),
    defineField({
      name: 'productsTitle',
      title: 'Products Section Title',
      type: 'string',
      initialValue: 'OUR PRODUCTS',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        { name: 'facebook', type: 'url', title: 'Facebook' },
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'pinterest', type: 'url', title: 'Pinterest' },
        { name: 'twitter', type: 'url', title: 'Twitter' },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'brandName',
    },
  },
})

