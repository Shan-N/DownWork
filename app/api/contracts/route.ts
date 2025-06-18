
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
        const { data: contracts, error: contractsError } = await supabase
            .from('contracts')
            .select('*')
            .or(`freelancer_id.eq.${user.id},client_id.eq.${user.id}`);
        if (contractsError) {
            return NextResponse.json({ error: contractsError.message }, { status: 400 });
        }
        if (!contracts) {
            return NextResponse.json({ error: "Contracts not found" }, { status: 404 });
        }
        return NextResponse.json(contracts, { status: 200 });
    } catch (error) {
        console.error("Contracts fetch error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { freelancer_id, client_id, project_id, terms } = await request.json();
        const supabase = await createClient();
        const { error : insertError } = await supabase
            .from('contracts')
            .insert([{ freelancer_id, client_id, project_id, terms }])
            .select()
            .single();
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 400 });
        }
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
}