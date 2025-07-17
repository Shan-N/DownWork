import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  const { role } = await request.json();

  if (!role) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Check if user already has a role
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingProfile?.role) {
      return NextResponse.json({ error: "Role already set. You cannot change it." }, { status: 403 });
    }

    // Upsert users and profiles only if role not set yet
    const { error: insertError } = await supabase.from("users").upsert({
      id: userId,
      full_name: user.user_metadata?.full_name || "",
      role: role,
    });

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      role: role,
      full_name: user.user_metadata?.full_name || "",
      bio: user.user_metadata?.bio || "",
      skills: user.user_metadata?.skills || [],
      location: user.user_metadata?.location || "",
      // username: user.user_metadata?.username || "",
      // avtar_url: user.user_metadata?.avtarUrl || "",
    });

    if (insertError || profileError) {
      return NextResponse.json({
        error: insertError?.message || profileError?.message,
      }, { status: 500 });
    }

    return NextResponse.json({ message: "Role selected successfully" }, { status: 200 });

  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
