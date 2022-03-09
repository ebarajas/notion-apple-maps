interface GeocodingResult {
  formatted_address: string
  location: {
    lat: number
    lng: number
  }
}

interface BatchGeocodingResult {
  query: string
  response: {
    results: GeocodingResult[]
  }
}

interface BatchGeocodingResponse {
  results: BatchGeocodingResult[]
}

export async function batchGeocode(
  locations: string[],
): Promise<BatchGeocodingResult[]> {
  const response = await fetch(
    `https://api.geocod.io/v1.7/?api_key=${GEOCODIO_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify(locations),
    },
  )
  return (await response.json<BatchGeocodingResponse>()).results
}
