'use client';
import { useEffect, useState } from "react"
import { supabase } from "@/app/utils/supabase/client"
import { BentoGrid } from "./ui/bento-grid";


export const DashboardBento = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = session.user;
                // Assuming user metadata contains the role
                setRole(user.user_metadata?.role || null);
            }
        }
        fetchRole();
    }, [setRole]);

    if (role === 'client') {
        return (
            <BentoGrid>

            </BentoGrid>
        );
    } else if (role === 'freelancer') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-xl font-semibold">Freelancer Dashboard</h2>
                {/* Add freelancer-specific components here */}
            </div>
        );
    } else {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-xl font-semibold">Loading...</h2>
            </div>
        );
    }


}