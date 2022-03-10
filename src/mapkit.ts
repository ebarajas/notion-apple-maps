import jwt from '@tsndr/cloudflare-worker-jwt'

const decodedPrivateKey = Buffer.from(MAPKIT_PRIVATE_KEY_BASE64).toString()

export function createJWTToken(): Promise<string> {
  return jwt.sign(
    {
      iss: MAPKIT_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10 * 60, // Expires: Now + 10m
    },
    decodedPrivateKey,
  )
}
