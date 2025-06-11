
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
        const { data: applications, error: applicationsError } = await supabase
            .from('applications')
            .select('*')
            .eq('freelancer_id', user.id);
        if (applicationsError) {
            return NextResponse.json({ error: applicationsError.message }, { status: 400 });
        }
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        console.error("Applications fetch error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}