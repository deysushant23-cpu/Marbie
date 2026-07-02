import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, passKey, username, password } = body;

    // Logout
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("admin_token");
      return response;
    }

    const envPassKey = process.env.ADMIN_SECRET_KEY || "MarbieVault_9xK2pLqW7mY5vN";
    const envUsername = process.env.ADMIN_USERNAME || "Baisakhi_kanthariya";
    const envPassword = process.env.ADMIN_PASSWORD || "SecureMarbie2026";

    console.log("LOGIN ATTEMPT:");
    console.log("Expected:", { envPassKey, envUsername, envPassword });
    console.log("Received:", { passKey, username, password });

    if (
      passKey === envPassKey &&
      username === envUsername &&
      password === envPassword
    ) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set({
        name: "admin_token",
        value: "true",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 // 24 hours
      });
      return response;
    }

    return NextResponse.json({ error: "ACCESS DENIED" }, { status: 401 });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_token");
  return response;
}

