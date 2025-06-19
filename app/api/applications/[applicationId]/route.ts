import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";



export async function GET(
    request: NextRequest,
     { params }: { params: Promise<{ applicationId: string }> }
) {
    const { applicationId } = await params;
    const supabase = await createClient();

    try {
        const { data: application, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", applicationId)
        .single();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    const { data: freelancer, error: freelancerError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", application.freelancer_id)
        .single<{ full_name: string }>();
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("title")
        .eq("id", application.project_id)
        .single<{ title: string }>();
    if (projectError) {
        return NextResponse.json({ error: projectError.message }, { status: 400 });
    }
    if (freelancerError) {
        return NextResponse.json({ error: freelancerError.message }, { status: 400 });
    }
    const { full_name } = freelancer;
    const { title } = project;
    const newApplication = {
        ...application,
        freelancer_name: full_name || null,
        project_title: title || null,
    };
    return NextResponse.json(newApplication, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ applicationId: string }> }
){
    const { applicationId } = await params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const { data: userRole, error: userRoleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (userRoleError) {
            return NextResponse.json({ error: userRoleError.message }, { status: 400 });
        }
        if (userRole?.role !== 'client') {
            return NextResponse.json({ error: "Unauthorized action" }, { status: 403 });
        }
        const { error: deleteError } = await supabase
            .from('applications')
            .delete()
            .eq('id', applicationId);
        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 400 });
        }
        return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}