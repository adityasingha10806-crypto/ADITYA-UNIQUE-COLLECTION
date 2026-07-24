import { SignJWT, jwtVerify, JWTPayload } from 'jose';

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function signSession(
  payload: JWTPayload,
  expiresIn: string = '12h'
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
