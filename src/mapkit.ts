import jwt from 'jsonwebtoken'

const decodedPrivateKey = Buffer.from(MAPKIT_PRIVATE_KEY_BASE64).toString()

/**
 * Create a signed jwt token for use with MapkitJS
 * By default, sets an expiration for 10 minutes
 */
export function createJWTToken(opts: { expiresIn?: string } = {}): string {
  const { expiresIn = '10m' } = opts
  return jwt.sign({ iss: MAPKIT_TEAM_ID }, decodedPrivateKey, {
    algorithm: 'ES256',
    expiresIn,
  })
}
