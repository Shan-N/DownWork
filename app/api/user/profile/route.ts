// import { createClient } from "@/app/utils/supabase/server";
// import { NextResponse } from "next/server";


// export async function POST(req : Request) {
//     try {
//         const supabase = await createClient();
//         const { description, skills,  } = await req.json();
//         const { data: { user } , error} = await supabase.auth.getUser();
//         if (error) {
//             return NextResponse.json(error, {status : 400})
//         }
//         const userId = user?.id

//     } catch (error) {
        
//     }
// } 

export async function GET() {

}