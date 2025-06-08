import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Basic in-memory rate limiting (IP-based)
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 5;
const ipRequestMap = new Map<string, { count: number; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    // Get IP address from headers (fallback to "unknown")
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const requestData = ipRequestMap.get(ip);

    if (requestData) {
      if (now - requestData.timestamp < RATE_LIMIT_WINDOW) {
        if (requestData.count >= MAX_REQUESTS) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
        }
        ipRequestMap.set(ip, {
          count: requestData.count + 1,
          timestamp: requestData.timestamp,
        });
      } else {
        ipRequestMap.set(ip, { count: 1, timestamp: now });
      }
    } else {
      ipRequestMap.set(ip, { count: 1, timestamp: now });
    }

    // Parse request body
    const body = await req.json();
    const { email, password, action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required (login/login-with-google/login-with-git)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (action === "login") {
      if (!email || typeof email !== "string") {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      if (!password || typeof password !== "string") {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        return NextResponse.json(
          { error: error?.message || "Invalid email or password" },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user: data.user });
    }

    if (action === "login-with-github" || action === "login-with-google") {
      const provider = action === "login-with-github" ? "github" : "google";

      const { error, data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
          
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // The redirect URL is returned in `data.url`
      return NextResponse.json({ success: true, url: data?.url });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Login handler error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
