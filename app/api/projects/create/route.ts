import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";


// const projectSchema = z.object({
//     title: z.string().min(1, "Title is required"),
//     description: z.string().min(1, "Description is required"),
//     budget: z.number().min(0, "Budget must be a positive number"),
//     category: (z.string()).nonempty("At least one skill is required"),

// });



export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { title, description, budget, category } = await req.json();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const parsedData = ({ title, description, budget, category });
        const { error: projectsError } = await supabase
            .from('projects')
            .insert({
                title: parsedData.title,
                description: parsedData.description,
                budget: parsedData.budget,
                category: parsedData.category,
                client_id: user.id,
                status: 'open',
                created_at: new Date().toISOString(),
            })
        if (projectsError) {
            return NextResponse.json({ error: projectsError.message }, { status: 400 });
        }
        return NextResponse.json({ message: "Project created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}