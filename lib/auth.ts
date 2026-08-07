import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthPayload {
  userId: string;
  sessionId: string | null;
}

export async function getCurrentUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const { userId, sessionId } = payload as unknown as AuthPayload;

    await dbConnect();
    const user = await User.findById(userId).select("sessionId");

    if (!user || user.sessionId !== sessionId) {
      return null; // token is valid but has been superseded by a newer login
    }

    return { userId, sessionId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error("❌ Auth error:", message);
    return null;
  }
}
