import { createClient } from 'contentful'

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_DELIVERY_ACCESS_TOKEN,
} = process.env

export const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_CONTENT_DELIVERY_ACCESS_TOKEN
})

export const getEventApplicationForms = async () => {
  const entries = await client.getEntries({
    content_type: 'eventApplicationForm',
    include: 2
  })
  return entries.items
}
