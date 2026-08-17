import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-secret-change-before-production-32");
export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret);
  (await cookies()).set("corre_session", token, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:2592000 });
}
export async function getSession() {
  const token = (await cookies()).get("corre_session")?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as {userId:string;role:string}; } catch { return null; }
}
