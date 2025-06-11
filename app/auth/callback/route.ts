import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
// import { id } from "zod/v4/locales";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = user.id;
    const { error : insertError } = await supabase.from("users").upsert({
      id: userId,
      full_name: user.user_metadata?.full_name || "",
      role: user.user_metadata?.role || "freelancer",
    });
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      role: user.user_metadata?.role || "freelancer",
      full_name: user.user_metadata?.full_name || "",
      bio: user.user_metadata?.bio || "",
      skills: user.user_metadata?.skills || [],
      location: user.user_metadata?.location || "",
      username: user.user_metadata?.username || "",
      // avtar_url: user.user_metadata?.avtarUrl || "",
    })
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/profile", request.url));
  } catch (error) {
    return NextResponse.json({ error: `An unexpected error occurred ${error}` }, { status: 500 });
  }
}