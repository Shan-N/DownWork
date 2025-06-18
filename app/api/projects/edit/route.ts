import { createClient } from "@/app/utils/supabase/server";



export async function PUT(request: Request) {
    try {
        const { id, title, description, budget, category } = await request.json();
        const supabase = await createClient();

        const { error } = await supabase
            .from("projects")
            .update({
                title,
                description,
                budget,
                category
            })
            .eq("id", id);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Project updated successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error updating project:", error);
        return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
    }
}