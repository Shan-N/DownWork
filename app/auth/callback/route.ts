import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

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
    // return NextResponse.json({ data }, { status: 200 });
    return NextResponse.redirect(new URL("/profile", request.url));
  } catch (error) {
    return NextResponse.json({ error: `An unexpected error occurred ${error}` }, { status: 500 });
  }
}