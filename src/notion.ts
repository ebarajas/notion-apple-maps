import { Client } from '@notionhq/client'

// Look under this column for locations
const LOCATION_COLUMN = 'Location'

const notion = new Client({
  auth: NOTION_API_KEY,
})

export async function getLocationsFromDatabase(
  database_id: string,
): Promise<string[]> {
  const { results } = await notion.databases.query({
    database_id,
    filter: {
      property: LOCATION_COLUMN,
      rich_text: {
        is_not_empty: true,
      },
    },
  })
  const locations: string[] = []
  results.forEach((result) => {
    if (!('properties' in result)) {
      return
    }

    const location = result.properties[LOCATION_COLUMN]

    if (!location) {
      return
    }

    if (location.type === 'rich_text' && location.rich_text) {
      locations.push(
        location.rich_text.map(({ plain_text }) => plain_text).join(''),
      )
    }
  })
  return locations
}
