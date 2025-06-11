
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
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
        
        if (projectsError) {
            return NextResponse.json({ error: projectsError.message }, { status: 400 });
        }
        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error("Projects fetch error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }

}