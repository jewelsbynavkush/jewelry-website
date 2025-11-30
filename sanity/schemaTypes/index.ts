import { type SchemaTypeDefinition } from 'sanity'
import jewelryDesign from './jewelryDesign'
import siteSettings from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    jewelryDesign,
    siteSettings,
  ],
}
