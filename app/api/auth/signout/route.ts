import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ message: "Signed out successfully" }, { status: 200 });
    } catch (error) {
        console.error("Sign out error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }

}