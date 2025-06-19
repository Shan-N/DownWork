
import { createClient } from "@/app/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Project } from "@/types/project"


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: projectData, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single<Project>()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const { data: clientData, error: clientError } = await (await supabase)
      .from("profiles")
      .select("full_name")
      .eq("id", projectData.client_id)
      .single<{ full_name: string }>()
    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 400 })
    }

    const newProjectData = {
      ...projectData,
      client_name: clientData?.full_name || null,
    }

    return NextResponse.json(newProjectData, { status: 200 })
  } catch (err) {
    console.error("Error fetching project:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
){
  try {
    const { freelancerId, proposal } = await req.json()
    const supabase = await createClient()
    const id = (await params).id

    const { error: insertError } = await supabase.from("applications").insert({
      project_id: id,
      freelancer_id: freelancerId,
      proposal: proposal,
      expected_budget: 0,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
