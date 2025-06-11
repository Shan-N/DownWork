import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { role, bio, skills, username, location, name } = await req.json();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileFetchError && profileFetchError.code !== "PGRST116") {
      return NextResponse.json({ error: profileFetchError.message }, { status: 400 });
    }


    if (existingProfile?.role && existingProfile.role !== role) {
      return NextResponse.json({ error: "Role can only be set once and cannot be changed" }, { status: 403 });
    }

    const { error: updateError } = await supabase.from('profiles').upsert({
      id: userId,
      username,
      full_name: name,
      role: existingProfile?.role || role, 
      bio,
      skills,
      location
    }, { onConflict: 'id' });

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = user.id;
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 400 });
        }
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
        return NextResponse.json(profile, { status: 200 });
    } catch (error) {
        console.error("Error Occurred", error);
        return NextResponse.json({error:"Error Occurred"}, { status: 500 });
    }
}