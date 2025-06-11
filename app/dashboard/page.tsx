'use client';
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import { cn } from "@/lib/utils";
// import axios from 'axios';
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
    const [name, setName] = useState<string | null>(null);
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data : userData } = await supabase.from('profiles').select('role').single();
            if (userData) { 
                setRole(userData.role);
            } 
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = session.user;
                // Assuming user metadata contains the role
                setName(user.user_metadata?.full_name || null);
            } else {
                router.push('/login'); // Redirect to login if not authenticated
            }
        };
        const fetchTime = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setTime("Good morning");
            } else if (hour >= 12 && hour < 18) {
                setTime("Good afternoon");
            } else {
                setTime("Good evening");
            }
        }

        // const fetchProjects = async () => {

        // }

        fetchUserRole();
        fetchTime();
    }, [router]);

    if (role === 'client') {
    return (
        <div className={cn("dark text-white", inter.className)}>
            <Navbar />
            <div className="flex flex-col px-4 py-4 min-h-screen">
                <h2 className="text-xl font-semibold" >{time}, {name}</h2>
                    
            </div>

        </div>
    )
    }
    else if (role === 'freelancer') {
        return (
            <div className={cn("dark text-white", inter.className)}>
                <Navbar />
                <div className="flex flex-col px-4 py-4 min-h-screen">
                    <h2 className="text-xl font-semibold" >{time}, {name}!</h2>
                    <span className="font-light text-sm text-gray-400">Find everything you need</span>

                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Profile</span>
                            <span className="text-sm text-gray-400">Manage your profile and settings</span>
                            <div className="flex flex-col mt-2 gap-1">
                            <span className="text-sm">You are a {role[0].toLocaleUpperCase() === 'F' ? "Freelancer" : "Client" }</span>
                            <Button variant="outline" className="mt-2" onClick={() => router.push('/profile')}>Edit Profile</Button>
                            </div>
                        </div>
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Projects</span>
                            <span className="text-sm text-gray-400">View and Manage your projects</span>
                            <div>

                            </div>
                        </div>
                        <div>Settings</div>
                    </div>

                </div>
            </div>
        )
    }
}

export default DashboardPage;