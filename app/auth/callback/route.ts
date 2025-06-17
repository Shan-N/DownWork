import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

  try {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.json({ error: exchangeError.message }, { status: 400 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const redirectPath = existingProfile ? "/profile" : "/onboarding";
    return NextResponse.redirect(new URL(redirectPath, baseUrl));
  } catch (error) {
    return NextResponse.json({ error: `An unexpected error occurred ${error}` }, { status: 500 });
  }
}
