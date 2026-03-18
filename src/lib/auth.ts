import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies } from "next/headers";

if (!process.env.ADMIN_SESSION_SECRET) {
  console.warn("WARNING: ADMIN_SESSION_SECRET is not set. Using insecure default — do not use in production.");
}

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || "ceramics-admin-secret-change-me"
);

const COOKIE_NAME = "admin-session";

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySession(token);
}

export { COOKIE_NAME };
