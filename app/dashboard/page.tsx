'use client';
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"]
})


const DashboardPage = () => {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = session.user;
                // Assuming user metadata contains the role
                setRole(user.user_metadata?.role || null);
            } else {
                router.push('/login'); // Redirect to login if not authenticated
            }
        };
        fetchUserRole();
    }, [router]);
    const handleSignout = async () => {
        try {
            await axios.post('/api/auth/signout')
            router.push('/'); // Redirect to home page after sign out

        }
        catch (error) {
            console.error("Sign out error:", error);
        }
    }
    if (role === 'client') {
    return (
        <div className={cn("dark text-white", inter.className)}>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <p className="mb-6">Welcome to your dashboard!</p>
                <Button onClick={handleSignout} className="bg-red-500 hover:bg-red-600">
                    Sign Out
                </Button>
            </div>
        </div>
    )
    }
    else if (role === 'freelancer') {
        return (
            <div className={cn("dark text-white", inter.className)}>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-3xl font-bold mb-4">Freelancer Dashboard</h1>
                    <p className="mb-6">Welcome to your freelancer dashboard!</p>
                    <Button onClick={handleSignout} className="bg-red-500 hover:bg-red-600">
                        Sign Out
                    </Button>
                </div>
            </div>
        )
    }
}

export default DashboardPage;