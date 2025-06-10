import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';


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
        const { data: skills, error:skillsError } = await supabase.from('skills').select();
        if (skillsError) {
            return NextResponse.json({ error: skillsError.message }, { status: 400 });
        }
        if (!skills) {
            return NextResponse.json({ error: "Skills not found" }, { status: 404 });
        }
        return NextResponse.json(skills, { status: 200 });
    } catch (error) {
        console.error("Skills fetch error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { skill } = await req.json();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const { error: insertError } = await supabase.from('skills').insert({
            id: user.id,
            skill: skill
        });
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 400 });
        }
        return NextResponse.json({ message: "Skill added successfully" }, { status: 200 });
    } catch (error) {
        console.error("Skill addition error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}