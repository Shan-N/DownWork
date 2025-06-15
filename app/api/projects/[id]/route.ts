// app/api/projects/[id]/route.ts

import { createClient } from "@/app/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await params
    const id = resolvedParams.id

    const { data: projectData, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()

      const { data:clientName, error: clientError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", projectData?.client_id)
      .single()

    if (clientName) {
      projectData.client_name = clientName.full_name
    }

    if (clientError) {
      console.error("Error fetching client name:", clientError)
    }

    const newProjectData = {
      ...projectData,
      client_name: projectData.client_name || null,
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(newProjectData, { status: 200 })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}


export async function POST (req : Request, { params }: { params: { id: string } }) {
  try {
    const { freelancerId, proposal } = await req.json()
    const supabase = await createClient()
    const resolvedParams = await params
    const id = resolvedParams.id

    const { error : insertError } = await supabase.from("applications").insert({
      project_id: id,
      freelancer_id: freelancerId,
      proposal: proposal,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }
    return NextResponse.json({ message: "Application submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}