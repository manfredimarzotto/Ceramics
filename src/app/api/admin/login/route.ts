import { NextRequest, NextResponse } from "next/server";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured on server" },
        { status: 500 }
      );
    }

    const inputBuf = Buffer.from(result.data.password);
    const adminBuf = Buffer.from(adminPassword);
    if (inputBuf.length !== adminBuf.length || !timingSafeEqual(inputBuf, adminBuf)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createSession();

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
