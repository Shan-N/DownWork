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
    if (freelancerError) {
        return NextResponse.json({ error: freelancerError.message }, { status: 400 });
    }
    const { full_name } = freelancer;
    const newApplication = {
        ...application,
        freelancer_name: full_name || null,
    };
    return NextResponse.json(newApplication, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}