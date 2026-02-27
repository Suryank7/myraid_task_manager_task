import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'fallback_secret_for_development_only'
const key = new TextEncoder().encode(secretKey)

export type JWTPayload = {
  userId: string
  role: string
  type: 'access' | 'refresh'
}

export async function encrypt(payload: JWTPayload, expiresIn: string) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key)
}

export async function decrypt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export async function createSessionTokens(userId: string, role: string) {
  const accessToken = await encrypt({ userId, role, type: 'access' }, '15m')
  const refreshToken = await encrypt({ userId, role, type: 'refresh'}, '7d')
  
  return { accessToken, refreshToken }
}
