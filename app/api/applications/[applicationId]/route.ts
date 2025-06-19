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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ applicationId: string }> }
){
    try {
        const { applicationId } = await params;
        const { status, method } = await request.json();
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const { data: freelancer, error: freelancerError } = await supabase
            .from("applications")
            .select("freelancer_id")
            .eq("id", applicationId)
            .single<{ freelancer_id: string }>();
        if (freelancerError) {
            return NextResponse.json({ error: freelancerError.message }, { status: 400 });
        }

        if (method === 'POST' && user?.user_metadata?.role === 'client' && status === 'accepted') {
            const { data: application, error: applicationError } = await supabase
                .from('applications')
                .select('*')
                .eq('id', applicationId)
                .single();
            if (applicationError) {
                return NextResponse.json({ error: applicationError.message }, { status: 400 });
            }
            if (!application) {
                return NextResponse.json({ error: "Application not found" }, { status: 404 });
            }
            const projectId = application.project_id;
            const { data:project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();
            if (projectError) {
                return NextResponse.json({ error: projectError.message }, { status: 400 });
            }
            const projectTitle = project?.title || "Project Title";
            const projectDescription = project?.description || "Project Description";
            const { error: insertError } = await supabase
                .from('contracts')
                .insert({ 
                    application_id: applicationId,
                    client_id: user.id,
                    title: projectTitle,
                    description: projectDescription,
                    freelancer_id: freelancer.freelancer_id,
                    status: 'active',
                    created_at: new Date().toISOString(),
                 })
                .select()
                .single();
            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 400 });
            }

            const { error: updateError } = await supabase
            .from('applications')
            .update({ 
                status: 'accepted'
            })
            .eq('id', applicationId);
        
            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 400 });
            }

            return NextResponse.json(
                { message: "Application accepted and contract created successfully" },
                { status: 200 }
            );
        }
        else if(method === 'POST' && status === 'rejected'){
            const { error:updateError } = await supabase
                .from('applications')
                .update({
                    status: 'rejected'
                })
                .eq('id', applicationId);
            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 400 });
            }
            return NextResponse.json(
                { message: "Application rejected successfully" },
                { status: 200 }
            );
        }

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}