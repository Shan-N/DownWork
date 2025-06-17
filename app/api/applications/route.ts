
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
        const { data:userRole, error: userRoleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (userRoleError) {
            return NextResponse.json({ error: userRoleError.message }, { status: 400 });
        }
        if (userRole?.role === 'freelancer') {
            const { data: applications, error: applicationsError } = await supabase
            .from('applications')
            .select('*')
            .eq('freelancer_id', user.id);
        if (applicationsError) {
            return NextResponse.json({ error: applicationsError.message }, { status: 400 });
        }
        return NextResponse.json(applications, { status: 200 });
        }
        else if (userRole?.role === 'client') {
            const { data:postedProjects, error: postedProjectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', user.id);
            if (postedProjectsError) {
                return NextResponse.json({ error: postedProjectsError.message }, { status: 400 });
            }
            const projectIds = postedProjects.map(project => project.id);
            const { data: applications, error: applicationsError } = await supabase
                .from('applications')
                .select('*')
                .in('project_id', projectIds);
            if (applicationsError) {
                return NextResponse.json({ error: applicationsError.message }, { status: 400 });
            }
            return NextResponse.json(applications, { status: 200 });
        }

    } catch (error) {
        console.error("Applications fetch error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}